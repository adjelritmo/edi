const express = require('express')

const routes = express.Router()

const User = require('../models/User')

const jwt = require('../configs/auth')

const bcrypt = require('bcryptjs')

const { Op } = require('sequelize')

const Center = require('../models/Center')

const validateInput = require('../functions/vaildateData/checkEmail')



routes.post('/login', async (req, res) => {

    try {

        const { edi_data } = req.body

        const { valid } = validateInput(edi_data, true)

        if (!valid)

            return res.status(400).json({ message: 'Error: No valid data' })

        if (!edi_data)

            return res.status(400).json({ message: 'Error during login' })

        const { email, password } = edi_data

        const user = await User.findOne({

            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['name']
                }
            ],
            where: {
                email: {
                    [Op.eq]: email.trim()
                }
            }
        })

        if (user) {

            if (bcrypt.compareSync(password, user.password)) {

                const { id, role, firstName, surname, email, centerId, center, researchPosition, gender, country, bornDate, professional_country } = user.get({ plain: true })

                const token = jwt.generateToken({ user: { id, role, email, firstName, surname, centerId, centerName: center?.name, researchPosition, gender, country, bornDate, professional_country } })

                res.status(200).json({ equicenter_code: token })

            } else {

                res.status(401).json({ message: "Invalid email or password" })

            }

        } else {

            res.status(404).json({ message: 'Invalid email or password' })
            
        }

    } catch (error) {

        console.error('Login error:', error.message)

        res.status(500).json({ message: "Error during login", error: error.message })
        
    }
})

routes.post('/register', async (req, res) => {

    try {

        const { edi_data } = req.body

        if (!edi_data)

            return res.status(400).json({ message: 'Error during register' })

        const { firstName, surname, email, password, country, centerId, gender, researchPosition, bornDate, professional_country } = edi_data

        const existingUser = await User.findOne({ where: { email: email.trim() } })

        if (existingUser) {

            return res.status(409).json({ message: "User with this email already exists" })

        }

        const salt = bcrypt.genSaltSync(10)

        const passwordHash = bcrypt.hashSync(password, salt)

        const user = await User.create({ firstName, surname, email: email.trim(), password: passwordHash, country, centerId, gender, researchPosition, bornDate, professional_country })

        //role: 'admin_alpha'

        if (user) {

            res.status(201).json({ message: 'success on register' })

        } else {

            res.status(400).json({ message: "Error creating user" })

        }

    } catch (error) {

        console.error('Registration error:', error)

        res.status(500).json({ message: "Error during registration", error: error.message })

    }
})

routes.get('/find/all/centers', async (req, res) => {

    try {

        const centers = await Center.findAll({ attributes: ['id', 'name'] })

        return res.status(200).json(centers)

    } catch (error) {

        res.status(500).json({ message: "Error during loading centers", error: error.message })

    }
})

module.exports = routes