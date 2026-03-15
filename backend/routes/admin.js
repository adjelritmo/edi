const express = require('express')

const routes = express.Router()

const bcrypt = require('bcryptjs')

const User = require('../models/User')

const Center = require('../models/Center')

const Form = require('../models/Form')

const formatDate = require('../functions/formatDate')

const Question = require('../models/Question')

const Dimension = require('../models/Dimension')

const { where, Op } = require('sequelize')

const Submission = require('../models/Submission')
const getMediaPerQuestion = require('../functions/getMediaPerQuestion')
const Answer = require('../models/Answers')
const getBestCenter = require('../functions/getBestCenter')
const calculateAverage = require('../functions/calculateMedia')
const getDataToTableCenter = require('../functions/dataToTableCenter')
const getChartDataCenter = require('../functions/dataToChartsCenter')
const getDataToTableCenterResults = require('../functions/dataToTableCenterResults')




//DASHBOARD
routes.get('/user/admin/dashboard', async (req, res) => {

    try {

        let totalSubmissions = 0

        const users = await User.findAll({
            attributes: ['id', 'firstName', 'surname', 'email', 'researchPosition'],
            order: [['createdAt', 'DESC']],
            where: {
                role: {
                    [Op.ne]: 'admin_alpha'
                }
            }

        })

        const totalCenters = await Center.count()

        const ativeForms = await Form.findAll({
            attributes: ['id', 'title', 'status', 'createdAt'],
            include: [
                {
                    model: Submission,
                    as: 'submissions',
                    attributes: ['id']
                }
            ],
            where: { status: "active" }
        })

        const forms = ativeForms.map(form => {
            // Converter para objeto plano PRIMEIRO
            const formData = form.get({ plain: true })

            totalSubmissions += formData.submissions.length

            return {
                ...formData,
                completion: (formData.submissions.length / users.length) * 100
            }
        })

        const dashboard = {
            totalUser: users.length,
            totalAtiveForm: forms.length,
            totalCenters: totalCenters,
            totalSubmissions: totalSubmissions,
            users: users.slice(0, 10),
            forms: forms
        }

        res.status(200).json(dashboard)


    } catch (error) {

        console.log(error)

        res.status(400).json({ message: error })

    }

})


//USERES
routes.get('/get/all/users', async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: ['id', 'firstName', 'surname', 'email', 'country', 'gender', 'researchPosition', 'bornDate', 'role', 'centerId'],

            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['id', 'name']
                }
            ],
            where: {
                role: {
                    [Op.ne]: 'admin_alpha'
                }
            }

        })

        res.status(200).json(users)

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })

    }
})

routes.put('/edit/a/user/:id', async (req, res) => {

    try {

        const { id } = req.params
        const { centerId, role } = req.body

        // Se estiver atribuindo um novo coordenador
        if (role === "coordinator") {
            // Procurar o coordenador atual deste centro
            const oldCoordinator = await User.findOne({
                where: {
                    role: "coordinator",
                    centerId: centerId
                }
            })

            // Se existir um coordenador, rebaixar para member
            if (oldCoordinator) {
                oldCoordinator.role = "member"
                await oldCoordinator.save() // <-- IMPORTANTE: salvar a mudança!
            }
        }

        // Atualizar o usuário selecionado
        const [rowsUpdated] = await User.update(
            { centerId, role },
            { where: { id } }
        )


        if (rowsUpdated === 0) {

            return res.status(404).json({ message: 'User not found or no changes applied' })

        }

        res.status(200).json({ id: id })

    } catch (err) {

        console.error(err)

        res.status(500).json({ message: err.message })
    }
})

routes.delete('/delete/a/user/:userId', async (req, res) => {

    try {

        const remove = User.destroy({ where: { id: req.params.userId } })

        if (remove)
            res.status(200).json({ id: 1 })
        else
            res.status(404).json('User not found!')

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Erro ao atualizar nome" })
    }
})


//CENTERS
routes.get('/get/all/centers', async (req, res) => {

    try {
        const centers = await Center.findAll({

            attributes: ['id', 'name', 'code', 'email', 'country', 'city', 'research_area'],

            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['firstName', 'surname', 'role']
                }
            ],
            order: [['id', 'DESC']]

        })

        // Adicionar estatísticas de utilização se necessário
        const centersWithStats = await Promise.all(

            centers.map(async (center) => {

                const userCount = await User.count({
                    where: { centerId: center.id }
                })

                const coordinator = await User.findOne({
                    attributes: ['firstName', 'surname'],
                    where: { centerId: center.id, role: 'coordinator' }
                })

                return {
                    ...center.toJSON(),
                    totalUsers: userCount,
                    coordinator: coordinator
                }
            })
        )

        res.status(200).json(centersWithStats)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

routes.post('/add/new/center', async (req, res) => {

    try {

        const { newcenter } = req.body

        if (!newcenter)

            return res.status(400).json({ message: 'error on create a new center' })

        const center = await Center.create(newcenter)

        if (center)

            res.status(200).json(center.id)

        else

            return res.status(400).json({ message: 'error on create a new center' })

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })

    }

})

routes.put('/edit/a/center', async (req, res) => {

    try {

        const { dataToEdit } = req.body

        if (!dataToEdit)

            return res.status(400).json({ message: "no data to edit found" })

        const { id, name, code, address, email, country, city, research_area } = dataToEdit

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

routes.delete('/delete/a/center/:centerId', async (req, res) => {

    try {

        const remove = Center.destroy({ where: { id: req.params.centerId } })

        if (remove)

            res.status(200).json('Center removed')

        else

            res.status(404).json('Center not found!')

    } catch (err) {

        console.error(err)

        res.status(500).json({ message: "Erro ao atualizar nome" })

    }

})


//FORMS
routes.get('/get/all/forms', async (req, res) => {

    try {

        const forms = await Form.findAll({

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
                    attributes: ['id', 'title', 'description', 'emotion', 'order_in_form'],
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
                    model: Submission,
                    as: 'submissions',
                    attributes: ['id', 'submittedAt', 'point', 'timeSpent'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'surname', 'email']
                        }
                    ],
                    order: [['submittedAt', 'DESC']]
                }

            ],
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json(forms)

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: err.message })

    }
})

routes.get('/calculate/media/per/response/:formId', async (req, res) => {

    try {

        const { formId } = req.params

        const submissions = await Submission.findAll({

            where: { formId },

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

        // Formatar os dados para o frontend
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

routes.post('/create/new/form', async (req, res) => {

    const t = await Form.sequelize.transaction()

    try {

        const { id: creatorId, role, firstName, surname } = req.user

        const creator = { role, firstName, surname }

        const { title, description, status, dimensions } = req.body

        const form = await Form.create({ title, description, creatorId, status: status || 'draft' }, { transaction: t })

        if (Array.isArray(dimensions) && dimensions.length > 0) {

            for (const [sectionIndex, sectionData] of dimensions.entries()) {

                const section = await Dimension.create({ formId: form.id, title: sectionData.title, description: sectionData.description, order_in_form: sectionData.order_in_form, emotion: sectionData.emotion }, { transaction: t })

                if (Array.isArray(sectionData.questions) && sectionData.questions.length > 0) {

                    const mappedQuestions = sectionData.questions.map((question, questionIndex) => ({

                        formId: form.id,

                        dimensionId: section.id,

                        text: question.text,

                        description: question.description,

                        type: question.type,

                        isRequired: question.isRequired,

                        helpText: question.helpText,

                        order_in_dimension: question.order_in_dimension || (sectionIndex * 100) + (questionIndex + 1),

                        options: question.options ? question.options : null,

                        validationRules: question.validationRules || {},

                    }))

                    await Question.bulkCreate(mappedQuestions, { transaction: t })

                }

            }

        }

        await t.commit()

        return res.status(200).json({ message: 'Form created successfully', formId: form.id, creatorId: creatorId, creator: creator })

    } catch (err) {

        await t.rollback()

        console.error('Erro ao criar formulário:', err)

        return res.status(500).json({ message: err.message })
    }
})

routes.put('/edit/form', async (req, res) => {

    const t = await Form.sequelize.transaction()

    try {

        const { edi_data_edit } = req.body

        const { id: formId, title, description, status, dimensions } = edi_data_edit

        const form = await Form.findByPk(formId, { transaction: t })

        if (!form) {

            await t.rollback()

            return res.status(404).json({ message: 'Form not found' })

        }

        await form.update({ title, description, status: status || 'draft' }, { transaction: t })

        const currentDimensions = await Dimension.findAll({

            where: { formId },

            attributes: ['id'],

            include: [
                {
                    model: Question,

                    as: 'questions',

                    attributes: ['id']
                }
            ],

            transaction: t
        })

        const currentDimensionIds = currentDimensions.map(d => d.id)

        const currentQuestionIds = currentDimensions.flatMap(d => d.questions.map(q => q.id))

        const incomingDimensionIds = []

        const incomingQuestionIds = []

        if (Array.isArray(dimensions)) {

            for (const [sectionIndex, sectionData] of dimensions.entries()) {

                let dimension

                if (sectionData.id && currentDimensionIds.includes(sectionData.id)) {

                    dimension = await Dimension.findByPk(sectionData.id, { transaction: t })

                    await dimension.update({ title: sectionData.title, description: sectionData.description, order_in_form: sectionData.order_in_form, emotion: sectionData.emotion }, { transaction: t })

                } else {

                    dimension = await Dimension.create({ formId, title: sectionData.title, description: sectionData.description, order_in_form: sectionData.order_in_form, emotion: sectionData.emotion }, { transaction: t })
                }

                incomingDimensionIds.push(dimension.id)

                if (Array.isArray(sectionData.questions)) {

                    for (const [questionIndex, questionData] of sectionData.questions.entries()) {

                        let question

                        const questionFields = {

                            formId,

                            dimensionId: dimension.id,

                            text: questionData.text,

                            description: questionData.description,

                            type: questionData.type,

                            isRequired: questionData.isRequired,

                            helpText: questionData.helpText,

                            order_in_dimension: questionData.order_in_dimension || (sectionIndex * 100) + (questionIndex + 1),

                            options: questionData.options ? questionData.options : null,

                            validationRules: questionData.validationRules || {}
                        }

                        if (questionData.id && currentQuestionIds.includes(questionData.id)) {

                            question = await Question.findByPk(questionData.id, { transaction: t })

                            await question.update(questionFields, { transaction: t })

                        } else {

                            question = await Question.create(questionFields, { transaction: t })

                        }

                        incomingQuestionIds.push(question.id)

                    }
                }
            }
        }

        const dimensionsToDelete = currentDimensionIds.filter(id => !incomingDimensionIds.includes(id))

        const questionsToDelete = currentQuestionIds.filter(id => !incomingQuestionIds.includes(id))

        if (questionsToDelete.length) {

            await Question.destroy({ where: { id: questionsToDelete }, transaction: t })

        }

        if (dimensionsToDelete.length) {

            await Dimension.destroy({ where: { id: dimensionsToDelete }, transaction: t })

        }

        await t.commit()

        return res.status(200).json({ message: 'Form updated successfully', formId })

    } catch (err) {

        await t.rollback()

        console.error('Erro ao editar formulário:', err)

        return res.status(500).json({ message: err.message })
    }
})

routes.delete('/delete/a/form/:formId', async (req, res) => {

    try {

        const remove = Form.destroy({ where: { id: req.params.formId } })

        if (remove)

            res.status(200).json('Form removed')

        else

            res.status(404).json('Form not found!')


    } catch (err) {

        console.error(err)

        res.status(500).json({ message: "Erro ao atualizar nome" })
    }

})

routes.get('/responses/form/:formId/:userId', async (req, res) => {

    try {

        const { formId, userId } = req.params

        if (!formId || !userId)

            return res.status(400).json({ message: 'Ocorreu um erro!' })


        const response = await Submission.findOne({

            where: { userId, formId },

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

routes.get('/dashboard/form-result/:formId', async (req, res) => {

    try {

        const { formId } = req.params

        // Buscar todas as submissões com suas relações
        const submissions = await Submission.findAll({

            attributes: ['id', 'point', 'dimensionsValues', 'userId', 'centerId', 'submittedAt'],

            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['id', 'name', 'country']
                }
            ],

            order: [['submittedAt', 'DESC']],

            where: { formId }

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

        const globalSubmissions = submissions

        const mediaBestCenter = calculateAverage(bestCenterSubmissions)

        const media_global = calculateAverage(globalSubmissions)

        res.status(200).json({

            success: true,

            data: {

                bestCenter: mediaBestCenter,

                globalCenter: media_global,

                bestCenterSub: bestCenterSubmissions.length,

                globalCenterSub: globalSubmissions.length,

                table: getDataToTableCenterResults(globalSubmissions),

            }

        })


    } catch (error) {

        console.error('Error fetching dashboard stats:', error)

        res.status(500).json({ success: false, error: 'Internal server error', message: error.message })

    }

})



//ACCOUNT:
routes.put('/update/user', async (req, res) => {

    try {

        const { id: userId } = req.user

        const { firstName, surname, email, country, gender, researchPosition, bornDate, professional_country } = req.body

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


module.exports = routes