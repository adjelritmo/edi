const express = require('express')

const routes = express.Router()

const bcrypt = require('bcryptjs')

const User = require('../models/User')

const { Op, where } = require('sequelize')

const Center = require('../models/Center')

const Form = require('../models/Form')

const formatDate = require('../functions/formatDate')

const Question = require('../models/Question')

const Dimension = require('../models/Dimension')

const Answer = require('../models/Answers')

const PublicationForm = require('../models/PublicationForm')

const Submission = require('../models/Submission')

const getDataToTable = require('../functions/dataToTable')

const getChartData = require('../functions/dataToCharts')

const calculateAverage = require('../functions/calculateMedia')

const getBestCenter = require('../functions/getBestCenter')

const getDataToTableCenter = require('../functions/dataToTableCenter')

const getChartDataCenter = require('../functions/dataToChartsCenter')

const contarSubmissoesPorMes = require('../functions/groupYearChart')

const getCalculatePointer = require('../functions/calculatePointers')

const getMediaPerQuestion = require('../functions/getMediaPerQuestion')




routes.get('/dashboard', async (req, res) => {

    try {

        const currentUser = req.user

        if (!currentUser) {

            return res.status(404).json({ success: false, error: 'Usuário não encontrado' })

        }

        // Buscar todas as submissões com suas relações
        const submissions = await Submission.findAll({

            attributes: ['id', 'point', 'leadership', 'dimensionsValues', 'userId', 'centerId', 'submittedAt'],

            order: [['submittedAt', 'DESC']]

        })

        if (!submissions || submissions.length === 0) {

            return res.status(200).json({

                success: true,

                data: {

                    userCenter: 0,

                    bestCenter: 0,

                    globalCenter: 0,

                    userCenterSub: 0,

                    bestCenterSub: 0,

                    globalCenterSub: 0,

                    table: null,

                    chartData: null,

                }

            })

        }

        // Separar submissões em grupos (já ordenadas por data DESC)

        const { bestCenterId } = getBestCenter(submissions)

        const bestCenterSubmissions = submissions.filter(submission => submission.centerId === bestCenterId)

        const centerSubmissions = submissions.filter(submission => submission.centerId === currentUser.centerId)

        const globalSubmissions = submissions

        const mediaBestCenter = calculateAverage(bestCenterSubmissions)

        const mediaUserCenter = calculateAverage(centerSubmissions)

        const media_global = calculateAverage(globalSubmissions)

        res.status(200).json({

            success: true,

            data: {

                userCenter: mediaUserCenter,

                bestCenter: mediaBestCenter,

                globalCenter: media_global,

                userCenterSub: centerSubmissions.length,

                bestCenterSub: bestCenterSubmissions.length,

                globalCenterSub: globalSubmissions.length,

                table: getDataToTableCenter(bestCenterSubmissions, centerSubmissions, globalSubmissions),

                chartData: getChartDataCenter(bestCenterSubmissions, centerSubmissions, globalSubmissions),

                isUserCenterBest: bestCenterId === currentUser.centerId

            }

        })


    } catch (error) {

        console.error('Error fetching dashboard stats:', error)

        res.status(500).json({ success: false, error: 'Internal server error', message: error.message })

    }

})

routes.get('/user/dashboard', async (req, res) => {

    try {

        const currentUser = req.user

        if (!currentUser) {

            return res.status(404).json({ success: false, error: 'Usuário não encontrado' })

        }

        // Buscar todas as submissões com suas relações
        const submissions = await Submission.findAll({

            attributes: ['id', 'point', 'leadership', 'dimensionsValues', 'userId', 'centerId', 'submittedAt'],

            order: [['submittedAt', 'DESC']]

        })

        if (!submissions || submissions.length === 0) {

            return res.status(200).json({

                success: true,

                data: {

                    userScore: 0,

                    centerScore: 0,

                    globalScore: 0,

                    center_sub: 0,

                    global_sub: 0,

                    table: null,

                    chartData: null,


                }

            })

        }

        // Separar submissões em grupos (já ordenadas por data DESC)
        const user_submissions = submissions.filter(submission => submission.userId === currentUser.id)

        const center_submissions = submissions.filter(submission => submission.centerId === currentUser.centerId)

        const globalSubmissions = submissions

        const media_user = calculateAverage(user_submissions)

        const mediaUserCenter = calculateAverage(center_submissions)

        const media_global = calculateAverage(globalSubmissions)

        res.status(200).json({

            success: true,

            data: {

                userScore: media_user,

                centerScore: mediaUserCenter,

                globalScore: media_global,

                center_sub: center_submissions.length,

                global_sub: globalSubmissions.length,

                table: getDataToTable(user_submissions[0], center_submissions, globalSubmissions),

                chartData: getChartData(user_submissions, center_submissions, globalSubmissions),

            }

        })

    } catch (error) {

        console.log(error)

    }
})

routes.get('/center/data', async (req, res) => {

    try {

        const { centerId } = req.user

        const adminRoles = ['admin', 'admin_alpha']

        const center = await Center.findByPk(centerId, {

            attributes: ['id', 'name', 'code', 'research_area', 'city', 'country', 'email'],

            include: [
                {
                    model: User,

                    as: 'users',

                    attributes: ['id', 'firstName', 'surname', 'researchPosition', 'createdAt'],

                    where: {
                        role: {
                            [Op.notIn]: adminRoles
                        }
                    },

                    order: [['firstName', 'ASC']]
                },
                {
                    model: PublicationForm,
                    as: 'publications',
                    attributes: ['id', 'startDate', 'endDate'],
                    include: [
                        {
                            model: Form,
                            as: 'form',
                            attributes: ['id', 'title']
                        }
                    ],
                    order: [['createdAt', 'ASC']]
                },
                {
                    model: Submission,
                    as: 'submissions',
                    attributes: ['id', 'submittedAt'],
                    order: [['createdAt', 'ASC']]
                }
            ]
        })

        if (!center) {

            return res.status(404).json({ message: 'Center not found' })

        }

        const { name, code, research_area, city, country, email, address } = center

        const publications = center.publications.map((publication) => {

            const pub = {
                id: publication.id,
                startDate: publication.startDate,
                endDate: publication.endDate,
                title: publication.form.title,
            }

            return pub

        })

        const center_data = {
            center: { name, code, research_area, city, country, email, address, totalSub: center.submissions.length },
            users: center.users,
            publication: publications,
            chartData: contarSubmissoesPorMes(center.submissions)
        }

        res.status(200).json(center_data)

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })

    }
})

///## USERS ROUTES ###//
routes.get('/get/center/with-users', async (req, res) => {

    try {

        const { centerId } = req.user

        const adminRoles = ['admin', 'admin_alpha']

        const center = await Center.findByPk(centerId, {

            include: [
                {
                    model: User,

                    as: 'users',

                    attributes: ['id', 'firstName', 'surname', 'email', 'country', 'gender', 'researchPosition', 'bornDate', 'role', 'createdAt'],

                    where: {
                        role: {
                            [Op.notIn]: adminRoles
                        }
                    },

                    order: [['firstName', 'ASC']]
                },
                {
                    model: Submission,
                    as: 'submissions',
                    attributes: ['id']
                }
            ]
        })

        if (!center) {

            return res.status(404).json({ message: 'Center not found' })

        }

        const centerUserData = {
            users: center.users,
            answered: center.submissions.length,
            notAnswered: center.users.length - center.submissions.length,
        }

        res.status(200).json(centerUserData)

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })
    }
})

routes.delete('/delete/a/user/from/center/:userId', async (req, res) => {

    try {

        const { userId } = req.params

        const { centerId } = req.user

        const findedUser = await User.findByPk(userId, {

            attributes: ['id', 'centerId']

        })

        if (!findedUser || findedUser?.centerId !== centerId) {

            return res.status(401).json({ message: 'not found in your center' })

        }

        await findedUser.destroy()

        res.status(200).json('User removed')

    } catch (err) {

        console.error(err)

        res.status(500).json({ message: "Erro ao atualizar nome" })

    }

})

routes.put('/edit/a/center', async (req, res) => {

    try {

        const { centerId } = req.user

        const { edi_center } = req.body

        if (!edi_center)

            return res.status(400).json({ message: 'No data found to edit' })

        if (centerId !== edi_center.id)

            return res.status(401).json({ message: 'No permission to do it' })

        const { id, name, code, address, email, country, city, research_area } = edi_center

        const [rowsUpdated] = await Center.update({ name, code, address, email, country, city, research_area }, { where: { id } })

        if (rowsUpdated === 0) {

            return res.status(404).json({ message: 'Center not found or no changes applied' })

        }

        res.status(200).json(id)

    } catch (err) {

        console.error(err)

        res.status(500).json({ message: err.message })

    }
})

///## FORM ROUTES ###//
routes.get('/get/all/forms', async (req, res) => {

    try {

        const { centerId } = req.user

        const adminRoles = ['admin', 'admin_alpha']

        const center = await Center.findByPk(centerId, {

            include: [

                {
                    model: User,

                    as: 'users',

                    attributes: ['id'],

                    where: {
                        role: {
                            [Op.notIn]: adminRoles
                        }
                    },

                    order: [['firstName', 'ASC']]

                }

            ]

        })

        const forms = await Form.findAll({

            where: {
                status: 'active'
            },


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

                    include: [
                        {
                            model: Question,

                            as: 'questions',

                            attributes: ['id', 'text', 'description', 'type', 'options', 'isRequired', 'order_in_dimension'],

                            order: [['order_in_dimension', 'ASC']]

                        }
                    ],

                    order: [['order_in_form', 'ASC']]
                },
                {
                    model: PublicationForm,

                    as: 'publications',

                    required: false,

                    attributes: ['id', 'startDate', 'endDate', 'centerId'],

                    where: { centerId }

                },
                {
                    model: Submission,

                    as: 'submissions',

                    required: false,

                    attributes: ['id', 'submittedAt', 'timeSpent', 'point', 'userId'],

                    where: { centerId },
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id']
                        }
                    ]

                }
            ],

            order: [['updatedAt', 'DESC']]
        })

        const data = {

            forms: forms,

            totalMembers: center.users.length

        }

        res.status(200).json(data)

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })

    }
})

routes.get('/get/forms/data/:id', async (req, res) => {
    try {
        const { id } = req.params

        const form = await Form.findOne({
            where: { id },
            attributes: [
                'id',
                'title',
                'description',
                'status',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'surname', 'email']
                },
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'text', 'description', 'type', 'options', 'isRequired', 'order_in_form'],
                    order: [['order_in_form', 'ASC']]
                }
            ]
        })

        if (!form) {
            return res.status(404).json({ message: 'Formulário não encontrado' })
        }

        const formattedForm = {
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            created: formatDate(form.createdAt),
            updated: formatDate(form.updatedAt),
            creator: form.creator,
            questions: form.questions.map(question => ({
                id: question.id,
                question: question.text,
                description: question.description,
                type: question.type,
                options: question.options,
                required: question.isRequired,
                order: question.order_in_form
            }))
        }

        res.status(200).json(formattedForm)

    } catch (err) {
        console.log('Erro ao buscar formulário:', err)
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

routes.get('/calculate/media/per/response/:formId', async (req, res) => {

    try {

        const { formId } = req.params

        const { centerId: centerId } = req.user

        const submissions = await Submission.findAll({

            where: { formId, centerId },

            attributes: ['id', 'formId', 'centerId'],

            include: [
                {
                    model: Answer,
                    as: 'answers',
                    attributes: ['answer', 'questionId'],
                    include: [
                        {
                            model: Question,
                            as: 'question',
                            attributes: ['id', 'text']
                        }
                    ]
                }
            ]

        })

        let answers = []

        submissions.forEach(submission => {

            submission.answers.forEach(answer => {

                answers.push(answer)

            })

        })

        const groudeAnwers = getMediaPerQuestion(answers)

        res.status(200).json(groudeAnwers)

    } catch (error) {

        console.error('Erro ao submeter resposta:', error)

        res.status(500).json({ success: false, error: 'Erro interno do servidor' })

    }

})

routes.post('/puplish/form/to/center', async (req, res) => {

    try {

        const { id: coordinatorId, centerId } = req.user

        const { edi_publication } = req.body

        if (!edi_publication)

            return res.status(404).json({ message: 'No form data to publish' })

        const { startDate, endDate, formId } = edi_publication

        const new_availabe = await PublicationForm.create({ startDate: new Date(startDate), endDate: new Date(endDate), formId, centerId, coordinatorId })

        if (new_availabe) {

            return res.status(200).json({ message: 'successfully', publishId: new_availabe.id, centerId: centerId })

        }

        return res.status(400).json({ message: 'failed' })

    } catch (error) {

        console.log(error)

        res.status(500).json({ message: "Error during password update", error: error.message })

    }
})

routes.put('/edit/puplish/form/to/center', async (req, res) => {

    try {

        const { centerId } = req.user

        const { edi_publication } = req.body

        if (!edi_publication)

            return res.status(404).json({ message: 'No form data to publish' })

        if (edi_publication.centerId !== centerId)

            return res.status(404).json({ message: 'No form data to publish' })

        const { id, startDate, endDate } = edi_publication

        const [publication] = await PublicationForm.update({ startDate: new Date(startDate), endDate: new Date(endDate) }, { where: { id } })

        if (publication > 0) {

            return res.status(200).json({ message: 'successfully', availableId: publication })

        }

        return res.status(404).json({ message: 'No form data to publish' })

    } catch (error) {

        console.log(error)

        res.status(500).json({ message: "Error during password update", error: error.message })

    }
})

routes.delete('/remove/puplish/form/to/center/:publishId/:publishCenterId', async (req, res) => {

    try {

        const { centerId } = req.user

        const { publishId, publishCenterId } = req.params

        if (!publishId || !publishCenterId)

            return res.status(404).json({ message: 'No form data found' })

        if (Number(publishCenterId) !== centerId)

            return res.status(404).json({ message: 'No form data to remove' })


        const publication = await PublicationForm.destroy({ where: { id: publishId } })

        if (publication) {

            return res.status(200).json({ message: 'successfully' })

        }

        return res.status(404).json({ message: 'No form data' })

    } catch (error) {

        console.log(error)

        res.status(500).json({ message: "Error", error: error.message })

    }
})

routes.get('/my-responses/form/:formId', async (req, res) => {

    try {

        const { formId } = req.params

        if (!formId)

            return res.status(400).json({ message: 'Ocorreu um erro!' })

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
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }
})

//## ACCOUNT 
routes.put('/update/user', async (req, res) => {

    try {

        const { id: userId } = req.user

        const { firstName, surname, email, country, centerId, gender, researchPosition, bornDate, professional_country } = req.body

        // Buscar o usuário existente
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Verificar se o email foi alterado e se já existe
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({
                where: { email: email.trim() }
            })

            if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
                return res.status(409).json({ message: "Email already in use by another user" })
            }
        }

        // Preparar objeto de atualização
        const updateData = {}

        // Adicionar apenas os campos que foram fornecidos
        if (firstName !== undefined) updateData.firstName = firstName
        if (surname !== undefined) updateData.surname = surname
        if (email !== undefined) updateData.email = email.trim()
        if (country !== undefined) updateData.country = country
        if (centerId !== undefined) updateData.centerId = centerId
        if (gender !== undefined) updateData.gender = gender
        if (researchPosition !== undefined) updateData.researchPosition = researchPosition
        if (bornDate !== undefined) updateData.bornDate = bornDate
        if (professional_country !== undefined)

            updateData.professional_country = professional_country

        // Atualizar o usuário
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

        // Buscar o usuário
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Verificar se a senha atual está correta
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" })
        }

        // Gerar hash da nova senha
        const salt = bcrypt.genSaltSync(10)
        const passwordHash = bcrypt.hashSync(newPassword, salt)

        // Atualizar a senha
        await user.update({ password: passwordHash })

        res.status(200).json({
            message: 'Password updated successfully',
            userId: user.id
        })

    } catch (error) {
        console.error('Update password error:', error)
        res.status(500).json({
            message: "Error during password update",
            error: error.message
        })
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





module.exports = routes