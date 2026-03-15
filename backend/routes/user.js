const express = require('express')

const routes = express.Router()

const bcrypt = require('bcryptjs')

const User = require('../models/User')

const Form = require('../models/Form')

const Question = require('../models/Question')

const Answer = require('../models/Answers')

const Dimension = require('../models/Dimension')

const PublicationForm = require('../models/PublicationForm')

const Submission = require('../models/Submission')

const Center = require('../models/Center')

const getCalculatePointer = require('../functions/calculatePointers')

const calculateAverage = require('../functions/calculateMedia')

const getDataToTable = require('../functions/dataToTable')

const getChartData = require('../functions/dataToCharts')





routes.get('/user/dashboard/member', async (req, res) => {

    try {

        const currentUser = req.user

        if (!currentUser) {

            return res.status(404).json({ success: false, error: 'Usuário não encontrado' })

        }

        // Buscar todas as submissões com suas relações
        const submissions = await Submission.findAll({

            attributes: ['id', 'point', 'dimensionsValues', 'userId', 'centerId', 'submittedAt'],

            order: [['submittedAt', 'DESC']]

        })

        if (!submissions || submissions.length === 0) {

            return res.status(200).json({

                success: true,

                data: {

                    lastSubmissionScore: null,

                    centerAverage: null,

                    globalAverage: null,

                    dimensionScores: [],

                    message: "Nenhuma submissão encontrada",

                    userSubmissions: [],

                    centerSubmissions: [],

                    globalSubmissions: []

                }

            })

        }

        // Separar submissões em grupos (já ordenadas por data DESC)
        const user_submissions = submissions.filter(submission => submission.userId === currentUser.id)

        const center_submissions = submissions.filter(submission => submission.centerId === currentUser.centerId)

        const globalSubmissions = submissions

        const media_user = calculateAverage(user_submissions)

        const media_center = calculateAverage(center_submissions)

        const media_global = calculateAverage(globalSubmissions)

        res.status(200).json({

            success: true,

            data: {

                userScore: media_user,

                centerScore: media_center,

                globalScore: media_global,

                center_sub: center_submissions.length,

                global_sub: globalSubmissions.length,

                last_submission: user_submissions[0],

                table: getDataToTable(user_submissions[0], center_submissions, globalSubmissions),

                chartData: getChartData(user_submissions, center_submissions, globalSubmissions),

            }

        })

    } catch (error) {

    }
})

routes.put('/update/user', async (req, res) => {

    try {

        const { id: userId } = req.user

        const { firstName, surname, email, country, centerId, gender, researchPosition, bornDate, professional_country } = req.body

        const user = await User.findByPk(userId)

        if (!user) {

            return res.status(404).json({ message: "User not found" })

        }

        if (email && email !== user.email) {

            const existingUserWithEmail = await User.findOne({

                where: { email: email.trim() }

            })

            if (existingUserWithEmail && existingUserWithEmail.id !== userId) {

                return res.status(409).json({ message: "Email already in use by another user" })

            }
        }

        const updateData = {}

        if (firstName !== undefined)

            updateData.firstName = firstName

        if (surname !== undefined)

            updateData.surname = surname

        if (email !== undefined)

            updateData.email = email.trim()

        if (country !== undefined)

            updateData.country = country

        if (centerId !== undefined)

            updateData.centerId = centerId

        if (gender !== undefined)

            updateData.gender = gender

        if (researchPosition !== undefined)

            updateData.researchPosition = researchPosition

        if (bornDate !== undefined)

            updateData.bornDate = bornDate

        if (professional_country !== undefined)

            updateData.professional_country = professional_country

        const updatedUser = await user.update(updateData)

        if (updatedUser) {

            res.status(200).json({ message: 'User updated successfully', userId: updatedUser.id })

        } else {

            res.status(400).json({ message: "Error updating user" })

        }

    } catch (error) {

        console.error('Update user error:', error)

        res.status(500).json({ message: "Error during user update", error: error.message })

    }

})

routes.put('/update/user/password', async (req, res) => {

    try {

        const { id: userId } = req.user

        const { currentPassword, newPassword } = req.body

        const user = await User.findByPk(userId)

        if (!user) {

            return res.status(404).json({ message: "User not found" })

        }

        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password)

        if (!isPasswordValid) {

            return res.status(401).json({ message: "Current password is incorrect" })

        }

        const salt = bcrypt.genSaltSync(10)

        const passwordHash = bcrypt.hashSync(newPassword, salt)

        await user.update({ password: passwordHash })

        res.status(200).json({ message: 'Password updated successfully', userId: user.id })

    } catch (error) {

        console.error('Update password error:', error)

        res.status(500).json({ message: "Error during password update", error: error.message })

    }
})

routes.delete('/delete/a/user', async (req, res) => {

    try {

        const remove = User.destroy({ where: { id: req.user.id } })

        if (remove)

            res.status(200).json('User removed')

        else

            res.status(404).json('User not found!')

    } catch (err) {

        console.error(err)

        res.status(500).json({ message: "Erro ao atualizar nome" })

    }

})

routes.get('/get/user-forms', async (req, res) => {

    try {

        const { id: userId, centerId } = req.user

        const publishedForms = await PublicationForm.findAll({

            where: { centerId },

            attributes: ['id', 'startDate', 'endDate'],

            include: [
                {
                    model: Form,

                    as: 'form',

                    attributes: ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt'],

                    include: [
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['id', 'firstName', 'surname']
                        },
                        {
                            model: Dimension,
                            as: 'dimensions',
                            attributes: ['id', 'title', 'description', 'order_in_form', 'emotion'],
                            order: [['order_in_form', 'ASC']],
                            include: [
                                {
                                    model: Question,
                                    as: 'questions',
                                    attributes: ['id', 'text', 'description', 'type', 'options', 'isRequired', 'order_in_dimension'],
                                    order: [['order_in_dimension', 'ASC']]
                                }
                            ]
                        },
                        {
                            model: Submission,
                            as: 'submissions',
                            required: false,
                            attributes: ['id', 'centerId', 'userId', 'submittedAt'],
                            where: { userId }
                        }
                    ],

                    order: [['createdAt', 'DESC']]

                }
            ]

        })

        res.status(200).json(publishedForms)

    } catch (err) {

        console.log('Erro ao buscar formulários do usuário:', err)

        res.status(500).json({ message: 'Erro interno do servidor' })

    }
})

routes.post('/submit/form/response', async (req, res) => {

    try {

        const { id: userId, centerId: centerId } = req.user

        const { edi_submition } = req.body

        if (!edi_submition || !userId || !centerId)

            return res.status(400).json({ message: 'No data found to submit' })

        const { formId, answers, timeSpent } = edi_submition

        const form = await Form.findByPk(formId, {

            attributes: ['id'],

            include: [
                {
                    model: PublicationForm,

                    as: 'publications',

                    attributes: ['startDate', 'endDate'],

                    where: { centerId }

                },
            ]

        })

        if (!form || form.publications.length === 0) {

            return res.status(404).json({ success: false, error: 'Formulário não encontrado ou não disponível para este centro' })

        }

        const today = new Date()

        const startDate = new Date(form.publications[0].startDate)

        const endDate = new Date(form.publications[0].endDate)

        endDate.setHours(23, 59, 59, 999)

        if (today < startDate) {

            return res.status(400).json({ success: false, error: 'Este formulário ainda não está disponível para resposta' })

        }

        if (today > endDate) {

            return res.status(400).json({ success: false, error: 'O prazo para responder a este formulário já expirou' })

        }

        const existingResponse = await Submission.findOne({ where: { formId, userId, centerId } })

        if (existingResponse) {

            return res.status(400).json({ success: false, error: 'Você já respondeu a este formulário' })

        }

        const calculatedPoint = getCalculatePointer(answers)

        if (!calculatedPoint) {

            return res.status(400).json({ success: false, error: 'Não há resposta válida' })

        }

        const response = await Submission.create({ formId, userId, centerId, timeSpent, submittedAt: new Date(), point: parseFloat(calculatedPoint?.finalAverage || 0.0), dimensionsValues: calculatedPoint.dimensionsValues })

        const answerPromises = []

        for (const [questionId, answer] of Object.entries(answers)) {

            if (questionId === 'dimention' || questionId === 'currentDimensionIndex' || questionId === 'currentQuestionIndex') {

                continue

            }

            answerPromises.push(

                Answer.create({ questionId: parseInt(questionId), responseId: response.id, answer: Array.isArray(answer) ? answer.join(', ') : answer?.value.toString() })

            )

        }

        await Promise.all(answerPromises)

        res.status(201).json({ success: true, responseId: response.id, message: 'Resposta submetida com sucesso' })

    } catch (error) {

        console.error('Erro ao submeter resposta:', error)

        res.status(500).json({ success: false, error: 'Erro interno do servidor' })

    }

})

routes.get('/user/my-responses/form/:formId', async (req, res) => {

    try {

        const { formId } = req.params

        const { id: userId, centerId } = req.user

        const response = await Submission.findOne({

            where: { userId, formId, centerId },

            attributes: ['id', 'point', 'timeSpent', 'submittedAt', 'status'],

            include: [
                {
                    model: Answer,
                    as: 'answers',
                    include: [{
                        model: Question,
                        as: 'question'
                    }]
                }
            ]
        })

        if (!response) {

            return res.status(404).json({ success: false, error: 'Response not found' })
        }

        res.status(200).json({

            success: true,

            response: {

                id: response.id,

                formId: response.formId,

                userId: response.userId,

                submittedAt: response.submittedAt,

                timeSpent: response.timeSpent,

                status: response.status,

                point: response.point,

                form: response.form,

                answers: response.answers.map(answer => ({

                    questionId: answer.questionId,

                    questionText: answer.question.question,

                    answer: answer.answer,

                    type: answer.question.type

                }))

            }

        })

    } catch (error) {

        console.error('Error fetching user response:', error)

        res.status(500).json({ success: false, error: 'Internal server error' })

    }

})


module.exports = routes