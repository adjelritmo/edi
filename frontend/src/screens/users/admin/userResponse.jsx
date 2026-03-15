import { useState, useEffect, useContext, useMemo } from 'react'
import { Card, CardBody, Button, Spinner, Accordion, AccordionItem } from "@heroui/react"
import { FileText, Calendar, Clock, ArrowLeft, BarChart3, CheckCircle, Star, FolderOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, wrap } from 'framer-motion'
import warningMessage from '../../../functions/toaster/info'
import { AppContext } from '../../../contexts/app_context'
import getFormsResponses from '../../../functions/user/forms/getFormsResponses'
import typeUserEnum from '../../../functions/constants/type_user_enum'
import getCoordinatorFormsResponses from '../../../functions/collaborator/forms/responses/getFormsResponses'
import getUserResponses from '../../../functions/admin/dashboards/getUserResponses'

const UserResponsePage = () => {

    const navigate = useNavigate()

    const location = useLocation()

    const [response, setResponse] = useState(null)

    const [form, setForm] = useState(location?.state?.form || null)

    const [user, setUser] = useState(location?.state?.user || null)

    const [isLoading, setIsLoading] = useState(true)

    // Ordenar dimensões e perguntas usando useMemo
    const dimensionsWithQuestions = useMemo(() => {
        if (!form?.dimensions) return []

        // Ordenar dimensões por order_in_form
        const sortedDimensions = [...form.dimensions].sort((a, b) => {
            const orderA = a.order_in_form !== undefined ? a.order_in_form : Infinity
            const orderB = b.order_in_form !== undefined ? b.order_in_form : Infinity
            return orderA - orderB
        })

        // Filtrar dimensões com perguntas e ordenar perguntas dentro de cada dimensão
        return sortedDimensions.filter(dimension => dimension.questions && dimension.questions.length > 0).map(dimension => ({
            ...dimension,
            questions: [...dimension.questions].sort((a, b) => {
                const orderA = a.order_in_dimension !== undefined ? a.order_in_dimension : Infinity
                const orderB = b.order_in_dimension !== undefined ? b.order_in_dimension : Infinity
                return orderA - orderB
            })
        }))

    }, [form])

    const getTotalQuestions = () => {

        return dimensionsWithQuestions.reduce((total, dimension) => total + (dimension.questions?.length || 0), 0)

    }

    const getAnsweredQuestionsCount = () => {

        if (!response?.answers)

            return 0

        return response.answers.filter(a => a.answer && a.answer !== '').length
    }

    const getRequiredQuestionsCount = () => {

        return dimensionsWithQuestions.reduce((total, dimension) => total + (dimension.questions?.filter(q => q.isRequired)?.length || 0), 0)

    }

    // Load response data
    useEffect(() => {

        const loadResponseData = async () => {

            let responseData = {}

            try {

                setIsLoading(true)

                if (!form) {

                    warningMessage('No form data found')

                    return

                }


                responseData = await getUserResponses(form.id, user.id)

                setResponse(responseData)

            } catch (error) {

                console.error('Error loading response:', error)

                warningMessage('Error loading your response')

            } finally {

                setIsLoading(false)

            }

        }

        loadResponseData()

    }, [form])

    // Helper function to get question options
    const getQuestionOptions = (question) => {

        if (!question.options)
            return []

        try {

            if (typeof question.options === 'string') {

                const parsed = JSON.parse(question.options)

                return Array.isArray(parsed) ? parsed : []

            }

            if (Array.isArray(question.options)) {

                return question.options

            }

            return []

        } catch (error) {

            console.error('Error parsing options:', error)

            return []

        }
    }

    const formatDate = (dateString) => {

        if (!dateString)
            return 'N/A'

        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getAnswerForQuestion = (questionId) => {

        return response?.answers?.find(answer => answer.questionId === questionId)

    }

    const renderAnswer = (question, answer) => {

        if (!answer)
            return null

        const options = getQuestionOptions(question)

        switch (question.type) {
            case 'text':
            case 'textarea':
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <p className="text-blue-900 whitespace-pre-wrap text-sm sm:text-base">{answer.answer}</p>
                    </div>
                )

            case 'radio':
                return (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-900 text-sm sm:text-base break-words">{answer.answer}</span>
                    </div>
                )

            case 'checkbox':
                return (
                    <div className="space-y-1 sm:space-y-2">
                        {Array.isArray(answer.answer) ? answer.answer.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                                <span className="text-purple-900 text-sm sm:text-base break-words">{option}</span>
                            </div>
                        )) : (
                            <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                                <span className="text-purple-900 text-sm sm:text-base break-words">{answer.answer}</span>
                            </div>
                        )}
                    </div>
                )

            case 'rating':

                const settings = question.settings ? (typeof question.settings === 'string' ? JSON.parse(question.settings) : question.settings) : {}

                const max = settings.max || 5

                const min = settings.min || 1

                return (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">

                            {
                                Array.from({ length: max - min + 1 }, (_, i) => {

                                    const value = i + min

                                    const isSelected = value <= answer.answer

                                    return (
                                        <div key={value} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${isSelected ? 'bg-orange-500 text-white' : 'bg-orange-200 text-orange-800'} font-bold`}>
                                            {value}
                                        </div>
                                    )
                                })}
                        </div>

                        <div className="text-orange-900 font-medium text-sm sm:text-base text-center sm:text-left">
                            {answer.answer} {answer.answer === 1 ? 'star' : 'stars'}
                        </div>
                    </div>
                )

            case 'dropdown':
                return (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <span className="font-medium text-indigo-900 text-sm sm:text-base break-words">{answer.answer}</span>
                    </div>
                )

            default:
                return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
                        <span className="text-gray-700 text-sm sm:text-base">{answer.answer}</span>
                    </div>
                )
        }
    }

    const getQuestionIcon = (type) => {
        switch (type) {
            case 'text': return FileText
            case 'textarea': return FileText
            case 'radio': return CheckCircle
            case 'checkbox': return CheckCircle
            case 'dropdown': return FileText
            case 'rating': return Star
            default: return FileText
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Spinner classNames={{ spinnerBars: 'bg-gradient-to-r from-cyan-500 to-emerald-500', indicator: 'bg-gradient-to-r from-cyan-500 to-emerald-500' }} size="lg" className="mb-4" />
                    <p className="text-gray-600">Loading your response...</p>
                </div>
            </div>
        )
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">The form you are trying to view does not exist.</p>
                    <Button onPress={() => navigate(-1, { replace: true })} variant="flat">
                        Back to Forms
                    </Button>
                </div>
            </div>
        )
    }

    if (!response) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Response not found</h2>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">No response found for this form.</p>
                    <Button onPress={() => navigate(-1, { replace: true })} variant="flat">
                        Back to Forms
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">

                <motion.div
                    className="mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-start items-center gap-3 mb-4 sm:mb-6">
                        <Button
                            variant="flat"
                            onPress={() => navigate(-1, { replace: true })}
                            startContent={<ArrowLeft className="h-4 w-4" />}
                            className="font-semibold text-sm sm:text-base"
                        >
                            Back
                        </Button>

                        <h1 className='font-bold text-2xl' >{`${user?.firstName} ${user?.surname} Survey Responses`}</h1>
                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-6 sm:mb-8"
                >
                    <Card className="border-0 shadow bg-white">
                        <CardBody className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="p-1 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">User Responses</h2>
                                            <p className="text-gray-600 text-sm sm:text-base break-words">Review all  submitted responses</p>
                                        </div>
                                        <div className="flex justify-end items-center gap-2">
                                            <div className="min-w-0 flex flex-col justify-ecnter items-center rounded-full h-20 w-20">
                                                <div className='flex flex-col text-center p-2 sm:p-3 bg-green-100 rounded-full'>
                                                    <div className="text-xl font-bold mt-auto ">{response.point}</div>
                                                    <div color="success" variant="flat" className="text- border-white/30 text-xs mb-auto">score</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-center">
                                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{getTotalQuestions()}</div>
                                    <div className="text-xs sm:text-sm text-blue-600">Total Questions</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                                        {getAnsweredQuestionsCount()}
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600">Questions Answered</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                                        {getRequiredQuestionsCount()}
                                    </div>
                                    <div className="text-xs sm:text-sm text-purple-600">Required Questions</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                                        {Math.round((getAnsweredQuestionsCount() / (getTotalQuestions() || 1)) * 100)}%
                                    </div>
                                    <div className="text-xs sm:text-sm text-orange-600">Completion Rate</div>
                                </div>


                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Dimensions and Questions List */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-3 sm:space-y-4">

                    {dimensionsWithQuestions.map((dimension, dimensionIndex) => {

                        let questionCounter = 0

                        for (let i = 0; i < dimensionIndex; i++) {

                            questionCounter += dimensionsWithQuestions[i]?.questions?.length || 0

                        }

                        return (
                            <motion.div
                                key={dimension.id || dimensionIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: dimensionIndex * 0.1 }}
                                className='bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm'
                            >

                                <Card className="border-0 shadow bg-gradient-to-r from-cyan-50 to-emerald-50 mb-4 sm:mb-6">
                                    <CardBody className="p-4 sm:p-6">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-1 sm:p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                                                <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg sm:text-xl font-bold text-cyan-900 break-words">
                                                    {dimension.title}
                                                </h2>
                                                {dimension.description && (
                                                    <p className="text-cyan-700 mt-1 text-sm sm:text-base break-words">
                                                        {dimension.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="space-y-3 sm:space-y-4 bg-white">

                                    {dimension.questions?.map((question, questionIndex) => {

                                        const globalQuestionNumber = questionCounter + questionIndex + 1

                                        const answer = getAnswerForQuestion(question.id)

                                        const QuestionIcon = getQuestionIcon(question.type)

                                        return (
                                            <motion.div
                                                key={question.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: (dimensionIndex * 0.1) + (questionIndex * 0.05) }}
                                            >
                                                <Card className="border-0 shadow transition-all duration-300 group cursor-pointer hover:shadow-md"
                                                >
                                                    <CardBody className="p-4 sm:p-6">
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl">
                                                                    <QuestionIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                                                                            {globalQuestionNumber}. {question.text}
                                                                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                                        </h3>
                                                                        {question.description && (
                                                                            <p className="text-gray-600 mt-1 text-xs sm:text-sm break-words">{question.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {answer ? (
                                                                    <div className="mt-2 sm:mt-4">
                                                                        {renderAnswer(question, answer)}
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                                                        <p className="text-gray-500 italic text-sm sm:text-base">Not answered</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}

export default UserResponsePage