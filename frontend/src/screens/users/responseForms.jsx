import { useState, useCallback, useEffect, useContext } from 'react'

import { Button, Input, Textarea, Card, CardBody, Select, SelectItem, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Progress, Accordion, AccordionItem } from "@heroui/react"

import { ArrowLeft, Send, Calendar, Star, FileText, Circle, CheckSquare, List, CheckCircle, Home, ListCheck, FolderOpen, AlertCircle, Save } from 'lucide-react'

import { useNavigate, useLocation, useBeforeUnload } from 'react-router-dom'

import { motion, AnimatePresence } from 'framer-motion'

import submitFormResponse from '../../functions/user/responses/addResponse'

import { AppContext } from '../../contexts/app_context'

import typeUserEnum from '../../functions/constants/type_user_enum'

import submitFormCoordinaatorResponse from '../../functions/collaborator/forms/responses/addResponse'




const CustomRadio = ({ children, value, checked, onChange, ...props }) => {
    return (
        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-200">
            <div className="flex items-center">
                <input
                    type="radio"
                    value={value}
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full transition-colors"
                    {...props}
                />
            </div>
            <span className="text-gray-900 font-medium">{children}</span>
        </label>
    )
}

const CustomCheckbox = ({ children, checked, onChange, ...props }) => {
    return (
        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-200">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                {...props}
            />
            <span className="text-gray-900 font-medium">{children}</span>
        </label>
    )
}

const FormResponse = () => {

    const { user } = useContext(AppContext)

    const navigate = useNavigate()

    const location = useLocation()

    const [currentForm, setCurrentForm] = useState(null)

    const [responses, setResponses] = useState({})

    const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0)

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isLoading, setIsLoading] = useState(true)

    const [showSuccess, setShowSuccess] = useState(false)

    const [startTime, setStartTime] = useState(null)

    const [currentUser, setCurrentUser] = useState(null)

    const [showSaveDraftModal, setShowSaveDraftModal] = useState(false)

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const [hasStarted, setHasStarted] = useState(false)

    const [isSavingDraft, setIsSavingDraft] = useState(false)

    useEffect(() => {

        setCurrentUser(user)

    }, [user])

    // Verificar se há alterações não salvas
    useEffect(() => {

        const hasResponses = Object.keys(responses).length > 0

        setHasUnsavedChanges(hasResponses)

    }, [responses])

    // Handler para tentativa de saída
    const handleExitAttempt = () => {

        if (hasUnsavedChanges) {

            setShowSaveDraftModal(true)

        } else {

            navigate(-1)

        }

    }

    // Handler para salvar rascunho
    const handleSaveDraft = async () => {

        if (!currentUser) {

            console.error('User not loaded')

            return

        }

        const timeSpent = calculateTimeSpent()

        const draftData = {
            formId: currentForm.id,
            userId: currentUser.id,
            centerId: currentUser.centerId,
            responses: responses,
            timeSpent: timeSpent,
            isDraft: true,
            currentDimensionIndex,
            currentQuestionIndex
        }

        setIsSavingDraft(true)

        try {

            // Aqui você precisa implementar a função para salvar o rascunho
            // Exemplo: await saveFormDraft(draftData, setIsSavingDraft)

            // Simulando sucesso
            setTimeout(() => {

                setIsSavingDraft(false)

                setShowSaveDraftModal(false)

                navigate(-1)

            }, 1000)

        } catch (error) {

            console.error('Failed to save draft:', error)

            setIsSavingDraft(false)

        }

    }

    // Handler para antes de descarregar a página
    useBeforeUnload((event) => {

        if (hasUnsavedChanges) {

            event.preventDefault()

            event.returnValue = "You have unsaved changes. Are you sure you want to leave?"

        }

    })

    // Iniciar o cronômetro quando o usuário começar a responder
    useEffect(() => {

        if (Object.keys(responses).length > 0 && !startTime && !hasStarted) {

            setStartTime(new Date())

            setHasStarted(true)

            console.log('Form timer started from existing responses:', new Date())

        }

    }, [responses, startTime, hasStarted])

    const dimensionsWithQuestions = currentForm?.dimensions?.filter(dimension => dimension.questions && dimension.questions.length > 0) || []

    const currentDimension = dimensionsWithQuestions[currentDimensionIndex]

    const currentQuestion = currentDimension?.questions?.[currentQuestionIndex]

    const getTotalQuestions = () => {

        return dimensionsWithQuestions.reduce((total, dimension) =>

            total + (dimension.questions?.length || 0), 0

        )

    }

    const getCurrentQuestionNumber = () => {

        let count = 0

        for (let i = 0; i < currentDimensionIndex; i++) {

            count += dimensionsWithQuestions[i]?.questions?.length || 0

        }

        return count + currentQuestionIndex + 1

    }

    // Encontrar a primeira questão não respondida
    const findFirstUnansweredQuestion = () => {

        for (let dimIdx = 0; dimIdx < dimensionsWithQuestions.length; dimIdx++) {

            const dimension = dimensionsWithQuestions[dimIdx]

            for (let qIdx = 0; qIdx < dimension.questions.length; qIdx++) {

                const question = dimension.questions[qIdx]

                if (!responses[question.id]) {

                    return { dimensionIndex: dimIdx, questionIndex: qIdx }

                }

            }

        }

        // Se todas foram respondidas, retorna a primeira
        return { dimensionIndex: 0, questionIndex: 0 }

    }

    const checkAllRequiredQuestionsAnswered = () => {

        if (!currentForm || !dimensionsWithQuestions) return true

        for (const dimension of dimensionsWithQuestions) {

            for (const question of dimension.questions || []) {

                if (question.isRequired || question.required) {

                    const response = responses[question.id]


                    if (!response) return false

                    if (question.type === "checkbox" && Array.isArray(response)) {

                        if (response.length === 0) return false

                    }

                    if (question.type === "radio" && response === "") {

                        return false

                    }

                    if (!response) return false
                }
            }
        }

        return true

    }

    useEffect(() => {

        loadForm()

    }, [location?.state?.form])

    const loadForm = () => {

        const form = location?.state?.form || null


        if (!form) {

            setIsLoading(false)

            return

        }

        const parseOptions = (raw) => {

            if (!raw) return []


            try {

                if (typeof raw === 'string') {

                    return JSON.parse(raw)

                }

                if (Array.isArray(raw)) {

                    return raw.filter(Boolean)

                }

                return []

            } catch (error) {

                console.warn('Error parsing options:', error)


                return []

            }

        }

        const mapQuestions = (questions = []) => {

            if (!Array.isArray(questions)) {

                return []

            }

            return questions.map((q) => {

                if (!q) return null


                let min, max, minLabel, maxLabel

                if (q.type === 'rating') {

                    if (q.settings && typeof q.settings === 'string') {

                        try {

                            const settings = JSON.parse(q.settings)

                            min = settings.min || 1

                            max = settings.max || 5

                            minLabel = settings.minLabel || 'Poor'

                            maxLabel = settings.maxLabel || 'Excellent'

                        } catch (e) {
                            min = 1
                            max = 5
                            minLabel = 'Poor'
                            maxLabel = 'Excellent'
                        }
                    } else if (q.settings && typeof q.settings === 'object') {
                        min = q.settings.min || 1
                        max = q.settings.max || 5
                        minLabel = q.settings.minLabel || 'Poor'
                        maxLabel = q.settings.maxLabel || 'Excellent'
                    } else {
                        min = 1
                        max = 5
                        minLabel = 'Poor'
                        maxLabel = 'Excellent'
                    }
                }

                return {
                    id: q.id || Date.now() + Math.random(),
                    type: q.type || 'text',
                    text: q.text || '',
                    isRequired: q.isRequired || false,
                    description: q.description || '',
                    helpText: q.helpText || '',
                    options: parseOptions(q.options),
                    min,
                    max,
                    minLabel,
                    maxLabel,
                    order_in_dimension: q.order_in_dimension || 0
                }
            }).filter(q => q !== null)
        }

        let formattedForm

        if (form.dimensions && Array.isArray(form.dimensions)) {
            formattedForm = {
                id: form.id,
                title: form.title || '',
                description: form.description || '',
                status: form.status || 'active',
                dimensions: form.dimensions.map((dimension, idx) => ({
                    id: dimension.id || Date.now() + idx,
                    title: dimension.title || `Dimension ${idx + 1}`,
                    description: dimension.description || '',
                    emotion: dimension.emotion || 'others',
                    order_in_form: dimension.order_in_form || idx,
                    questions: mapQuestions(dimension.questions || [])
                }))
            }
        } else {
            formattedForm = {
                id: form.id,
                title: form.title || '',
                description: form.description || '',
                status: form.status || 'active',
                dimensions: []
            }
        }

        // Ordenar dimensões pela order_in_form
        formattedForm.dimensions.sort((a, b) =>
            (a.order_in_form || 0) - (b.order_in_form || 0)
        )

        // Ordenar questões dentro de cada dimensão pela order_in_dimension
        formattedForm.dimensions.forEach(dimension => {
            if (dimension.questions && dimension.questions.length > 0) {
                dimension.questions.sort((a, b) =>
                    (a.order_in_dimension || 0) - (b.order_in_dimension || 0)
                )
            }
        })

        // Filtrar apenas dimensões que têm perguntas
        const validDimensions = formattedForm.dimensions.filter(dimension =>
            dimension.questions && dimension.questions.length > 0
        )

        // Carregar respostas salvas do localStorage (simulação)
        const savedResponses = loadSavedResponses(form.id)
        if (savedResponses) {
            setResponses(savedResponses.responses)

            // Continuar da questão salva ou encontrar primeira não respondida
            if (savedResponses.currentDimensionIndex !== undefined && savedResponses.currentQuestionIndex !== undefined) {
                setCurrentDimensionIndex(savedResponses.currentDimensionIndex)
                setCurrentQuestionIndex(savedResponses.currentQuestionIndex)
            } else {
                const unanswered = findFirstUnansweredQuestion()
                setCurrentDimensionIndex(unanswered.dimensionIndex)
                setCurrentQuestionIndex(unanswered.questionIndex)
            }
        } else {
            // Iniciar da primeira questão não respondida
            const unanswered = findFirstUnansweredQuestion()
            setCurrentDimensionIndex(unanswered.dimensionIndex)
            setCurrentQuestionIndex(unanswered.questionIndex)
        }

        setCurrentForm({
            ...formattedForm,
            dimensions: validDimensions
        })
        setIsLoading(false)
    }

    // Função para carregar respostas salvas (simulação - você deve implementar sua própria lógica)
    const loadSavedResponses = (formId) => {
        try {
            const saved = localStorage.getItem(`form_draft_${formId}`)
            if (saved) {
                return JSON.parse(saved)
            }
        } catch (error) {
            console.error('Error loading saved responses:', error)
        }
        return null
    }

    // Função para salvar respostas no localStorage (simulação)
    const saveResponsesToLocal = (formId, responses, dimIndex, qIndex) => {

        try {
            const draftData = {
                formId,
                responses,
                currentDimensionIndex: dimIndex,
                currentQuestionIndex: qIndex,
                timestamp: new Date().toISOString()
            }

            localStorage.setItem(`form_draft_${formId}`, JSON.stringify(draftData))

        } catch (error) {

            console.error('Error saving responses:', error)

        }
    }

    const updateResponse = useCallback((questionId, value, _dimention) => {

        if (!hasStarted && Object.keys(responses).length === 0) {

            setStartTime(new Date())

            setHasStarted(true)

        }

        setResponses(prev => ({ ...prev, [questionId]: { value, dimention: _dimention } }))

        // Salvar automaticamente no localStorage
        if (currentForm) {

            saveResponsesToLocal(currentForm.id, { ...responses, [questionId]: { value, dimention: _dimention }, currentDimensionIndex, currentQuestionIndex})

        }

    }, [responses, hasStarted, currentForm, currentDimensionIndex, currentQuestionIndex])

    const getQuestionIcon = (type) => {
        switch (type) {
            case "text": return FileText
            case "textarea": return FileText
            case "radio": return Circle
            case "checkbox": return CheckSquare
            case "dropdown": return List
            case "date": return Calendar
            case "rating": return Star
            default: return FileText
        }
    }

    const validateCurrentQuestion = () => {
        if (!currentQuestion) return true
        if (!currentQuestion.isRequired) return true

        const response = responses[currentQuestion.id]
        if (!response) return false

        if (currentQuestion.type === "checkbox" && Array.isArray(response)) {
            return response.length > 0
        }

        if (currentQuestion.type === "radio" && response === "") {
            return false
        }

        return !!response
    }

    const goToNext = () => {
        const isLastQuestionInDimension = currentQuestionIndex === currentDimension.questions.length - 1
        const isLastDimension = currentDimensionIndex === dimensionsWithQuestions.length - 1

        if (isLastQuestionInDimension && isLastDimension) {
            return
        }

        if (isLastQuestionInDimension) {
            setCurrentDimensionIndex(prev => prev + 1)
            setCurrentQuestionIndex(0)
        } else {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const goToPrevious = () => {
        const isFirstQuestionInDimension = currentQuestionIndex === 0
        const isFirstDimension = currentDimensionIndex === 0

        if (isFirstQuestionInDimension && isFirstDimension) {
            return
        }

        if (isFirstQuestionInDimension) {
            setCurrentDimensionIndex(prev => prev - 1)
            const prevDimensionQuestions = dimensionsWithQuestions[currentDimensionIndex - 1]?.questions || []
            setCurrentQuestionIndex(prevDimensionQuestions.length - 1)
        } else {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const calculateTimeSpent = () => {
        if (!startTime) return '0m 0s'
        const endTime = new Date()
        const diffMs = endTime - startTime
        const minutes = Math.floor(diffMs / 60000)
        const seconds = Math.floor((diffMs % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }

    const getQuestionOptions = (question) => {
        if (!question.options) return []
        return Array.isArray(question.options) ? question.options : []
    }

    const handleSubmit = async () => {
        if (!currentUser) {
            console.error('User not loaded')
            return
        }

        if (!checkAllRequiredQuestionsAnswered()) {
            alert('Please answer all required questions before submitting.')
            return
        }

        // Calcular tempo gasto
        const timeSpent = calculateTimeSpent()

        const submissionData = {
            formId: currentForm.id,
            responses: responses,
            timeSpent: timeSpent
        }

        setIsSubmitting(true)

        let result = 0

        if (currentUser.role === typeUserEnum.COLLABORATOR || currentUser.role === typeUserEnum.COLLABORATOR) {
            result = await submitFormCoordinaatorResponse(submissionData, setIsSubmitting)
        } else {
            result = await submitFormResponse(submissionData, setIsSubmitting)
        }

        if (result === 200) {
            // Limpar rascunho salvo após submissão bem-sucedida
            if (currentForm) {
                localStorage.removeItem(`form_draft_${currentForm.id}`)
            }
            setShowSuccess(true)
        } else {
            setIsSubmitting(false)
        }
    }

    const renderQuestion = (question, dimension) => {

        const IconComponent = getQuestionIcon(question.type)

        const currentResponse = responses[question.id]?.value

        const questionOptions = getQuestionOptions(question)

        return (
            <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="mb-6 shadow border-0 rounded-xl bg-gradient-to-br from-cyan-50 to-emerald-50 submitFormResponse">
                    <CardBody className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <FolderOpen className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className='flex justify-between'>
                                    <h3 className="text-lg sm:text-xl font-bold text-cyan-900 break-words">
                                        {dimension.title}
                                    </h3>
                                    {dimension.emotion && (
                                        <span className="inline-block ml-2 px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full capitalize mt-1">
                                            {dimension.emotion}
                                        </span>
                                    )}
                                </div>

                                {dimension.description && (
                                    <p className="text-cyan-700 mt-1 text-sm sm:text-base break-words">
                                        {dimension.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="mb-6 shadow border-0 rounded-xl bg-gradient-to-br from-white to-gray-50/50">
                    <div className='flex p-3 justify-end'>
                        <Progress aria-label="Loading..." classNames={{ indicator: 'bg-gradient-to-r from-cyan-500 to-emerald-500' }} className="max-w-full rounded-full" value={(getCurrentQuestionNumber() / getTotalQuestions()) * 100} />
                    </div>
                    <CardBody className="p-4 sm:p-6 lg:p-8">
                        <div className="space-y-4 sm:space-y-6">
                            <motion.div
                                className="border-l-4 border-blue-500 pl-3 sm:pl-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-start gap-3 mb-2">
                                    <motion.div
                                        className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex-shrink-0 mt-1"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 break-words">
                                            {question.text}
                                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        </h3>
                                        {question.description && (
                                            <motion.p
                                                className="text-gray-600 mt-2 leading-relaxed text-sm sm:text-base break-words"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                {question.description}
                                            </motion.p>
                                        )}
                                        {question.helpText && (
                                            <p className="text-sm text-cyan-600 mt-1 italic">
                                                {question.helpText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {question.type === "text" && (
                                    <Input
                                        value={currentResponse || ""}
                                        onChange={(e) => updateResponse(question.id, e.target.value)}
                                        placeholder={question.helpText || "Your answer"}
                                        aria-label={question.text}
                                        variant="bordered"
                                        classNames={{
                                            input: "text-base sm:text-lg py-3 sm:py-4"
                                        }}
                                    />
                                )}

                                {question.type === "textarea" && (
                                    <Textarea
                                        value={currentResponse || ""}
                                        onChange={(e) => updateResponse(question.id, e.target.value)}
                                        placeholder={question.helpText || "Your answer"}
                                        aria-label={question.text}
                                        variant="bordered"
                                        minRows={4}
                                        classNames={{
                                            input: "text-base sm:text-lg"
                                        }}
                                    />
                                )}

                                {question.type === "radio" && (
                                    <div className="space-y-2 sm:space-y-3" role="radiogroup" aria-label={question.text}>
                                        {questionOptions.map((option, optIndex) => (
                                            <motion.div
                                                key={optIndex}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <CustomRadio
                                                    value={option}
                                                    checked={currentResponse === option}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            updateResponse(question.id, option, dimension.emotion)
                                                        }
                                                    }}
                                                >
                                                    <span className="break-words">{option}</span>
                                                </CustomRadio>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {question.type === "checkbox" && (
                                    <div className="space-y-2 sm:space-y-3" role="group" aria-label={question.text}>
                                        {questionOptions.map((option, optIndex) => (
                                            <motion.div
                                                key={optIndex}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <CustomCheckbox
                                                    checked={Array.isArray(currentResponse) ? currentResponse.includes(option) : false}
                                                    onChange={(e) => {
                                                        const currentArray = Array.isArray(currentResponse) ? currentResponse : []
                                                        if (e.target.checked) {
                                                            updateResponse(question.id, [...currentArray, option], dimension.emotion)
                                                        } else {
                                                            updateResponse(question.id, currentArray.filter(item => item !== option), dimension.emotion)
                                                        }
                                                    }}
                                                >
                                                    <span className="break-words">{option}</span>
                                                </CustomCheckbox>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {question.type === "dropdown" && (
                                    <Select
                                        selectedKeys={currentResponse ? [currentResponse] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0]
                                            updateResponse(question.id, selected, dimension.emotion)
                                        }}
                                        placeholder="Select an option"
                                        aria-label={question.text}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "h-11 sm:h-12 text-base sm:text-lg"
                                        }}
                                    >
                                        {questionOptions.map((option) => (
                                            <SelectItem key={option} value={option} className="text-base sm:text-lg">
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                                {question.type === "date" && (
                                    <Input
                                        type="date"
                                        value={currentResponse || ""}
                                        onChange={(e) => updateResponse(question.id, e.target.value, dimension.emotion)}
                                        aria-label={question.text}
                                        variant="bordered"
                                        classNames={{
                                            input: "text-base sm:text-lg py-3 sm:py-4"
                                        }}
                                    />
                                )}

                                {question.type === "rating" && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
                                            aria-label={`Scale from ${question.min || 1} to ${question.max || 5}`}>
                                            <span className="text-sm font-semibold text-purple-700 text-center sm:text-left">
                                                {question.minLabel || "Minimum"}
                                            </span>
                                            <div className="flex gap-1 sm:gap-2 justify-center" role="radiogroup">
                                                {Array.from({ length: (question.max || 5) - (question.min || 1) + 1 }, (_, i) => {
                                                    const value = i + (question.min || 1)
                                                    const isSelected = currentResponse === value
                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button
                                                                variant={isSelected ? "solid" : "flat"}
                                                                color={isSelected ? "primary" : "default"}
                                                                size="md"
                                                                className={`min-w-10 h-10 sm:min-w-12 sm:h-12 font-bold ${isSelected
                                                                    ? 'shadow scale-110 transition-all duration-200'
                                                                    : 'hover:scale-105 transition-transform'
                                                                    }`}
                                                                onPress={() => updateResponse(question.id, value, dimension.emotion)}
                                                                aria-label={`Rating ${value}`}
                                                            >
                                                                {value}
                                                            </Button>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                            <span className="text-sm font-semibold text-purple-700 text-center sm:text-right">
                                                {question.maxLabel || "Maximum"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        )
    }

    const renderSuccessScreen = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <Card className="max-w-md w-full shadow border-0 rounded-2xl overflow-hidden">
                <CardBody className="p-6 sm:p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mb-6"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                    </motion.div>

                    <motion.h2
                        className="text-2xl sm:text-3xl font-bold text-gray-900"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Form Submitted!
                    </motion.h2>

                    <motion.p
                        className="text-gray-600 text-base sm:text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Thank you for your feedback.
                    </motion.p>

                    <motion.p
                        className="text-gray-500 mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        Your responses have been successfully recorded.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row justify-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            color="primary"
                            onPress={() => navigate(-1, { replace: true })}
                            startContent={<ListCheck className="h-4 w-4" />}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold py-5 sm:py-6"
                            size="lg"
                        >
                            Back to Forms
                        </Button>

                        <Button
                            variant="flat"
                            onPress={() => navigate('/edi/', { replace: true })}
                            startContent={<Home className="h-4 w-4" />}
                            className="font-semibold py-5 sm:py-6"
                        >
                            Go to Home
                        </Button>
                    </motion.div>
                </CardBody>
            </Card>
        </motion.div>
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg" className="mb-4" />
                    <p className="text-gray-600">Loading form...</p>
                </div>
            </div>
        )
    }

    if (showSuccess) {
        return renderSuccessScreen()
    }

    if (!currentForm || dimensionsWithQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
                    <p className="text-gray-600 mb-6 px-4">The form you are trying to access does not exist or has no questions.</p>
                    <Button onPress={() => navigate(-1, { replace: true })} variant="flat">
                        Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full md:w-4xl mx-auto px-3 sm:px-4 md:px-6 mx-auto mb-5 pt-16 sm:pt-20 max-w-7xl'>
            <Button
                variant="flat"
                onPress={handleExitAttempt}
                aria-label="Back"
                startContent={<ArrowLeft className="h-4 w-4" />}
                className="font-semibold mb-3"
            >
                Back
            </Button>

            {/* Modal de Confirmação para Salvar Rascunho */}
            <Modal isOpen={showSaveDraftModal} onOpenChange={setShowSaveDraftModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                    <h2 className="text-xl font-bold">Save Draft?</h2>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p>You have unsaved changes. Do you want to save your progress as a draft?</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Your answers will be saved and you can continue later from where you left off.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    color='danger'
                                    onPress={() => {
                                        onClose()
                                        navigate(-1)
                                    }}
                                >
                                    Don't Save
                                </Button>
                                <Button
                                    className='bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                                    isLoading={isSavingDraft}
                                    onPress={handleSaveDraft}
                                    startContent={!isSavingDraft && <Save className="h-4 w-4" />}
                                >
                                    {isSavingDraft ? "Saving..." : "Save Draft"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <div className="mt-auto mb-auto bg-gradient-to-br from-cyan-50 via-blue-50 to-white shadow rounded-xl sm:rounded-2xl">
                <motion.div
                    className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-emerald-500 shadow rounded-t-xl sm:rounded-t-2xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex gap-2">
                                <motion.div
                                    className="p-1 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img className="w-12 h-12 mt-8 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-white border-2 rounded-full" src="/edi/equicenter.png" alt="Equicenter logo" />
                                </motion.div>
                                <div className="text-white flex-1 min-w-0">
                                   <Accordion hideIndicator={true} classNames={{ Accordion: 'p-0 m-0 ', wrap: 'm-0 p-0' }}>
                                    <AccordionItem
                                        key="1"
                                        aria-label="accordion"
                                        classNames={{
                                            title: 'text-xl sm:text-2xl text-white lg:text-3xl font-bold mb-1 sm:mb-2 drop-shadow break-words mt-0 pt-0',
                                            subtitle: 'cursor-pointer text-gray-900 max-w-64',
                                            content: 'w-full text-white/90 text-sm sm:text-base text-justify lg:text-lg leading-relaxed break-words'
                                        }}
                                        subtitle="Press to expand form description"
                                        title={currentForm?.title}
                                    >
                                        {currentForm?.description}
                                    </AccordionItem>

                                </Accordion> </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                    <div className="max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            {currentQuestion && renderQuestion(currentQuestion, currentDimension)}
                        </AnimatePresence>

                        <motion.div
                            className="flex gap-3 justify-between mt-6 sm:mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex gap-3">
                                <Button
                                    variant="flat"
                                    isDisabled={currentDimensionIndex === 0 && currentQuestionIndex === 0}
                                    onPress={goToPrevious}
                                    aria-label="Previous question"
                                    className="font-semibold text-sm sm:text-base"
                                >
                                    Previous
                                </Button>
                            </div>

                            {getCurrentQuestionNumber() < getTotalQuestions() ? (
                                <Button
                                    color="primary"
                                    isDisabled={!validateCurrentQuestion()}
                                    onPress={goToNext}
                                    aria-label="Next question"
                                    className="font-semibold px-4 sm:px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 border-0 text-sm sm:text-base"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    color="primary"
                                    isLoading={isSubmitting}
                                    isDisabled={!validateCurrentQuestion()}
                                    onPress={handleSubmit}
                                    aria-label="Submit form"
                                    className="font-semibold px-4 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-sm sm:text-base"
                                    startContent={!isSubmitting && <Send className="h-4 w-4" />}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Form"}
                                </Button>
                            )}
                        </motion.div>

                        <motion.div
                            className="text-center mt-4 sm:mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="text-xs sm:text-sm text-gray-500">
                                <span className="text-red-500">*</span> Indicates required field
                            </p>
                            {!checkAllRequiredQuestionsAnswered() && (
                                <p className="text-xs sm:text-sm text-amber-600 mt-2">
                                    Please answer all required questions before submitting.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormResponse