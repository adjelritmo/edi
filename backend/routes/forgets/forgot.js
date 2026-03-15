const express = require('express')

const routes = express.Router()

const User = require('../../models/User')

const jwt = require('../../configs/auth')

const bcrypt = require('bcryptjs')

const { Op } = require('sequelize')

const generateCode = require('../../functions/generateCode')



routes.post('/forgot-password', async (req, res) => {

    try {

        const { edi_email } = req.body

        if (!edi_email)

            return res.status(404).json({ message: 'no data found' })

        const user = await User.findOne({

            attibutes: ['id', 'firstName', 'surname'],

            where: {

                email: {

                    [Op.eq]: edi_email.trim()

                }

            }

        })

        if (user) {

            const { id } = user.get({ plain: true })

            const token = jwt.generateTokenCode({ user: { id, role: 'password-verify-to-change' } })

            const salt = bcrypt.genSaltSync(10)

            const code = generateCode()

            const passwordHash = bcrypt.hashSync(code, salt)

            user.code = passwordHash

            user.tokenChek = token

            await user.save()

            console.log(`
                        ╔══════════════════════════════════════╗
                        ║     CÓDIGO DE VERIFICAÇÃO            ║
                        ╠══════════════════════════════════════╣
                        ║                                      ║
                        ║     Seu código de verificação é:     ║
                        ║                                      ║
                        ║           🔐 ${code} 🔐               ║
                        ║                                      ║
                        ║   Este código expira em 1 minutos    ║
                        ║                                      ║
                        ╚══════════════════════════════════════╝
                    `)

            res.status(200).json({ message: 'email sent', edi_code: token })

        } else {

            res.status(200).json({ message: 'email sent' })

        }

    } catch (error) {

        console.error('error on verify email:', error.message)

        res.status(500).json({ message: "Error during login", error: error.message })

    }
})

routes.post('/forgot-password/check/email/verify-code', async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {

            return res.status(401).json({ message: "Invalid code" })

        }

        // Find user by email
        const user = await User.findOne({

            attibutes: ['id', 'code', 'tokenChek'],

            where: {

                email: {

                    [Op.eq]: email.trim()

                }

            }

        })

        if (user) {

            if (bcrypt.compareSync(password, user.code) && jwt.checkToken(user.tokenChek)) {

                user.code = null

                const token = jwt.generateTokenPassPort({ user: { id: user.id, role: 'password-verify-to-change' } })

                user.tokenChek = token

                await user.save()

                res.status(200).json({ message: 'sucess on verify code', edi_code: token })

            } else {

                res.status(401).json({ message: "Invalid code" })

            }

        } else {

            res.status(404).json({ message: 'Invalid code' })

        }

    } catch (error) {

        console.error('Login error:', error.message)

        res.status(500).json({ message: "Error during login", error: error.message })

    }
})

routes.post('/forgot-password/change/password', async (req, res) => {

    try {

        const { email, password } = req.body

        // Find user by email
        const user = await User.findOne({

            attibutes: ['id', 'tokenChek'],

            where: {

                email: {

                    [Op.eq]: email.trim()

                }

            }

        })

        if (user && jwt.checkToken(user.tokenChek)) {

            const { user: user_decoded } = jwt.checkToken(user.tokenChek)

            const { role } = user_decoded

            if (!role) {

                return res.status(401).json({ message: 'Cannot update password!' })
                
            }

            // Hash password
            const salt = bcrypt.genSaltSync(10)

            const passwordHash = bcrypt.hashSync(password, salt)

            user.password = passwordHash

            await user.save()

            res.status(200).json({ message: "password changed" })

        } else {

            res.status(404).json({ message: 'failed on update password' })

        }

    } catch (error) {

        console.error('failed on update password:', error.message)

        res.status(500).json({ message: "Error during update password", error: error.message })

    }
    
})

module.exports = routes