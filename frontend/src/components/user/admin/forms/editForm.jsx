import React, { useState, useMemo, useCallback, useContext, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Checkbox, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem, Divider, useDisclosure } from "@heroui/react"
import { FileText, Circle, CheckSquare, List, Calendar, Star, Plus, Trash2, MoreVertical, ArrowUp, ArrowDown, Eye, Save, Edit3, LayoutGrid, FolderOpen } from 'lucide-react'
import { AppContext } from "../../../../contexts/app_context"
import editForm from "../../../../functions/admin/forms/editForm"
import warningMessage from "../../../../functions/toaster/info"

const EditForm = ({ form, forms, setForms, isOpen, onOpenChange }) => {

    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
    const { isOpen: isDimensionOpen, onOpen: onDimensionOpen, onOpenChange: onDimensionOpenChange } = useDisclosure()

    const [currentForm, setCurrentForm] = useState({ id: '', title: '', description: '', status: 'active', dimensions: [] })
    const [originalForm, setOriginalForm] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
    const [editingDimensionIndex, setEditingDimensionIndex] = useState(null)
    const [previewStates, setPreviewStates] = useState({})
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [dimensionToRemove, setDimensionToRemove] = useState(null)

    const emotionOptions = useMemo(() => [
        "skills", "engagement",
        "innovation", "leadership", "impact",
        "motivation", "awareness", "barriers", "collaboration", "knowledge", "competence", "impact", "attitude", "others"
    ], [])

    /* ---------- tipos de pergunta ---------- */
    const questionTypes = useMemo(() => [
        { id: "text", name: "Short Answer", icon: FileText, hasOptions: false, hasPlaceholder: true, color: "text-cyan-600" },
        { id: "textarea", name: "Paragraph", icon: FileText, hasOptions: false, hasPlaceholder: true, color: "text-emerald-600" },
        { id: "radio", name: "Multiple Choice", icon: Circle, hasOptions: true, hasPlaceholder: false, color: "text-cyan-600" },
        { id: "checkbox", name: "Checkboxes", icon: CheckSquare, hasOptions: true, hasPlaceholder: false, color: "text-emerald-600" },
        { id: "dropdown", name: "Dropdown", icon: List, hasOptions: true, hasPlaceholder: false, color: "text-cyan-600" },
        { id: "date", name: "Date", icon: Calendar, hasOptions: false, hasPlaceholder: false, color: "text-emerald-600" },
        { id: "rating", name: "Linear Scale", icon: Star, hasOptions: false, hasPlaceholder: false, color: "text-cyan-600" }
    ], [])

    useEffect(() => {
        if (isOpen && form)
            loadForm()
    }, [isOpen, form])

    const loadForm = () => {
        if (!form)
            return

        const parseOptions = (raw) => {
            if (!raw)
                return []

            let temp = raw
            if (typeof temp === 'string') {
                try {
                    const parsed = JSON.parse(temp)
                    temp = parsed
                } catch (error) {
                    console.warn('Failed to parse options JSON:', error)
                    return []
                }
            }

            if (Array.isArray(temp)) {
                return temp.filter(Boolean)
            }

            if (typeof temp === 'object' && temp !== null) {
                return Object.values(temp).filter(Boolean)
            }

            return []
        }

        const mapQuestions = (questions = []) => {
            if (!Array.isArray(questions)) {
                return []
            }

            return questions.map((q, idx) => {
                if (!q)
                    return null

                const mappedQuestion = {
                    id: q.id || Date.now() + idx,
                    type: q.type || 'text',
                    text: q.text || '',
                    isRequired: q.isRequired || false,
                    description: q.description || '',
                    helpText: q.helpText || '',
                    order_in_dimension: q.order_in_dimension || (idx + 1), // CORRIGIDO: +1 para começar de 1
                    options: parseOptions(q.options),
                    min: q.settings?.min || (q.type === 'rating' ? 1 : undefined),
                    max: q.settings?.max || (q.type === 'rating' ? 5 : undefined),
                    minLabel: q.settings?.minLabel || (q.type === 'rating' ? 'Poor' : undefined),
                    maxLabel: q.settings?.maxLabel || (q.type === 'rating' ? 'Excellent' : undefined)
                }

                return mappedQuestion
            }).filter(q => q !== null)
        }

        let formattedForm

        if (form.dimensions && Array.isArray(form.dimensions) && form.dimensions.length > 0) {
            formattedForm = {
                id: form.id,
                title: form.title || '',
                description: form.description || '',
                status: form.status || 'active',
                creatorId: form.creatorId,
                creator: form.creator,
                dimensions: form.dimensions.map((dim, idx) => ({
                    id: dim.id || Date.now() + idx,
                    title: dim.title || `Dimension ${idx + 1}`,
                    description: dim.description || '',
                    emotion: dim.emotion || 'others',
                    order_in_form: dim.order_in_form || (idx + 1), // CORRIGIDO: +1 para começar de 1
                    questions: mapQuestions(dim.questions || [])
                }))
            }
        } else if (form.questions && Array.isArray(form.questions) && form.questions.length > 0) {
            formattedForm = {
                id: form.id,
                title: form.title || '',
                description: form.description || '',
                status: form.status || 'active',
                creatorId: form.creatorId,
                creator: form.creator,
                dimensions: [{
                    id: 1,
                    title: 'Main Dimension',
                    description: 'Main questions dimension',
                    emotion: 'others',
                    order_in_form: 1, // CORRIGIDO: 1 em vez de 0
                    questions: mapQuestions(form.questions)
                }]
            }
        } else {
            formattedForm = {
                id: form.id,
                title: form.title || '',
                description: form.description || '',
                status: form.status || 'active',
                creatorId: form.creatorId,
                creator: form.creator,
                dimensions: [{
                    id: 1,
                    title: 'Main Dimension',
                    description: 'Main questions dimension',
                    emotion: 'others',
                    order_in_form: 1, // CORRIGIDO: 1 em vez de 0
                    questions: []
                }]
            }
        }

        // Ordenar dimensões
        formattedForm.dimensions.sort((a, b) => (a.order_in_form || 0) - (b.order_in_form || 0))

        // Ordenar questões dentro de cada dimensão
        formattedForm.dimensions.forEach(dimension => {
            dimension.questions.sort((a, b) => (a.order_in_dimension || 0) - (b.order_in_dimension || 0))
        })

        setCurrentForm(formattedForm)
        setOriginalForm(JSON.parse(JSON.stringify(formattedForm)))
    }

    const addDimension = useCallback(() => {
        const newDimension = {
            id: Date.now(),
            title: 'New Dimension',
            description: 'Description of the new dimension',
            emotion: 'others',
            order_in_form: currentForm.dimensions.length + 1, // CORRIGIDO: +1 para começar de 1
            questions: []
        }

        setCurrentForm(prev => ({ ...prev, dimensions: [...prev.dimensions, newDimension] }))
        setEditingDimensionIndex(currentForm.dimensions.length)
        onDimensionOpen()
    }, [currentForm.dimensions.length, onDimensionOpen])

    const updateDimension = useCallback((idx, field, value) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            dimensions[idx] = { ...dimensions[idx], [field]: value }
            return { ...prev, dimensions }
        })
    }, [])

    const confirmRemoveDimension = useCallback(idx => {
        if (currentForm.dimensions.length <= 1) {
            warningMessage('You must have at least one dimension')
            return
        }
        setDimensionToRemove(idx)
    }, [currentForm.dimensions.length])

    const removeDimension = useCallback(() => {
        if (dimensionToRemove === null)
            return

        setCurrentForm(prev => {
            const updatedDimensions = prev.dimensions.filter((_, i) => i !== dimensionToRemove)

            // CORRIGIDO: Reordenar começando de 1
            updatedDimensions.forEach((dim, idx) => {
                dim.order_in_form = idx + 1
            })

            return { ...prev, dimensions: updatedDimensions }
        })

        if (editingDimensionIndex === dimensionToRemove) {
            setEditingDimensionIndex(null)
            onDimensionOpenChange(false)
        }

        setDimensionToRemove(null)
    }, [dimensionToRemove, editingDimensionIndex, onDimensionOpenChange])

    const cancelRemoveDimension = useCallback(() => setDimensionToRemove(null), [])

    const addQuestion = useCallback((type, dimensionIndex) => {
        const base = {
            id: Date.now(),
            type,
            text: '',
            isRequired: false,
            description: ''
        }

        let question
        switch (type) {
            case 'text':
            case 'textarea':
            case 'date':
                question = { ...base, helpText: '' }
                break
            case 'radio':
                question = {
                    ...base,
                    options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
                }
                break
            case 'checkbox':
            case 'dropdown':
                question = {
                    ...base,
                    options: ['Option 1']
                }
                break
            case 'rating':
                question = {
                    ...base,
                    min: 1,
                    max: 5,
                    minLabel: 'Poor',
                    maxLabel: 'Excellent'
                }
                break
            default:
                question = base
        }

        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const dimension = dimensions[dimensionIndex]

            // CORRIGIDO: order_in_dimension começa em 1
            question.order_in_dimension = dimension.questions.length + 1

            dimensions[dimensionIndex] = {
                ...dimension,
                questions: [...dimension.questions, question]
            }

            return { ...prev, dimensions }
        })

        setEditingQuestionIndex({
            dimensionIndex,
            questionIndex: currentForm.dimensions[dimensionIndex]?.questions.length || 0
        })

        onEditOpen()
    }, [currentForm.dimensions, onEditOpen])

    const updateQuestion = useCallback((dimensionIndex, questionIndex, field, value) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const updatedQuestions = [...dimensions[dimensionIndex].questions]
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value }
            dimensions[dimensionIndex] = { ...dimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions }
        })
    }, [])

    const addOption = useCallback((dimensionIndex, questionIndex) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const question = dimensions[dimensionIndex].questions[questionIndex]
            const newOption = `Option ${question.options.length + 1}`
            const updatedQuestions = [...dimensions[dimensionIndex].questions]
            updatedQuestions[questionIndex] = { ...question, options: [...question.options, newOption] }
            dimensions[dimensionIndex] = { ...dimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions }
        })
    }, [])

    const updateOption = useCallback((dimensionIndex, questionIndex, optionIndex, value) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const updatedQuestions = [...dimensions[dimensionIndex].questions]
            const updatedOptions = [...updatedQuestions[questionIndex].options]
            updatedOptions[optionIndex] = value
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions }
            dimensions[dimensionIndex] = { ...dimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions }
        })
    }, [])

    const removeOption = useCallback((dimensionIndex, questionIndex, optionIndex) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const updatedQuestions = [...dimensions[dimensionIndex].questions]
            const updatedOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions }
            dimensions[dimensionIndex] = { ...dimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions }
        })
    }, [])

    const removeQuestion = useCallback((dimensionIndex, questionIndex) => {
        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const dimension = dimensions[dimensionIndex]
            const updatedQuestions = dimension.questions.filter((_, i) => i !== questionIndex)

            // CORRIGIDO: Reordenar começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            dimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions }
        })

        setPreviewStates(prev => {
            const newStates = { ...prev }
            delete newStates[`${dimensionIndex}-${questionIndex}`]
            return newStates
        })
    }, [])

    const duplicateQuestion = useCallback((dimensionIndex, questionIndex) => {
        const questionToDuplicate = currentForm.dimensions[dimensionIndex].questions[questionIndex]
        const duplicatedQuestion = { ...questionToDuplicate, id: Date.now() }

        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const dimension = dimensions[dimensionIndex]
            const updatedQuestions = [...dimension.questions]

            updatedQuestions.splice(questionIndex + 1, 0, duplicatedQuestion)

            // CORRIGIDO: Reordenar começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            dimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions }
        })
    }, [currentForm.dimensions])

    const moveQuestion = useCallback((dimensionIndex, questionIndex, direction) => {
        const questions = currentForm.dimensions[dimensionIndex].questions
        if (direction === 'up' && questionIndex === 0)
            return
        if (direction === 'down' && questionIndex === questions.length - 1)
            return

        const newIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1

        setPreviewStates(prev => {
            const newStates = { ...prev }
            const movingState = newStates[`${dimensionIndex}-${questionIndex}`]
            delete newStates[`${dimensionIndex}-${questionIndex}`]
            newStates[`${dimensionIndex}-${newIndex}`] = movingState
            return newStates
        })

        setCurrentForm(prev => {
            const dimensions = [...prev.dimensions]
            const dimension = dimensions[dimensionIndex]
            const updatedQuestions = [...dimension.questions]

            const [movedQuestion] = updatedQuestions.splice(questionIndex, 1)
            updatedQuestions.splice(newIndex, 0, movedQuestion)

            // CORRIGIDO: Reordenar começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            dimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions }
        })

        setEditingQuestionIndex({ dimensionIndex, questionIndex: newIndex })
    }, [currentForm.dimensions])

    const updatePreviewState = useCallback((dimensionIndex, questionIndex, field, value) => {
        setPreviewStates(prev => ({
            ...prev,
            [`${dimensionIndex}-${questionIndex}`]: {
                ...prev[`${dimensionIndex}-${questionIndex}`],
                [field]: value
            }
        }))
    }, [])

    const getPreviewState = useCallback((dimensionIndex, questionIndex, field, defaultValue = '') => {
        return previewStates[`${dimensionIndex}-${questionIndex}`]?.[field] ?? defaultValue
    }, [previewStates])

    const validateForm = useCallback(() => {
        if (!currentForm.title.trim())
            return 'Form title is required'

        if (!currentForm.dimensions.length)
            return 'At least one dimension is required'

        for (const dimension of currentForm.dimensions) {
            if (!dimension.title.trim())
                return 'All dimensions must have a title'

            if (!dimension.emotion)
                return 'All dimensions must have an emotion type'

            for (const question of dimension.questions) {
                if (!question.text.trim())
                    return 'All questions must have text'

                if (question.options?.some(opt => !opt.trim()))
                    return 'All options must have text'
            }
        }

        return null
    }, [currentForm.title, currentForm.dimensions])

    const hasChanges = useCallback(() => {
        return JSON.stringify(currentForm) !== JSON.stringify(originalForm)
    }, [currentForm, originalForm])

    const handleSubmit = async () => {
        const validationError = validateForm()

        if (validationError) {
            warningMessage(validationError)
            return
        }

        /* monta payload exatamente como o sequelize espera */
        const editedData = {
            id: currentForm.id,
            title: currentForm.title,
            description: currentForm.description,
            creator: currentForm.creator,
            status: currentForm.status,
            dimensions: currentForm.dimensions.map((dimension, dimensionIndex) => ({
                id: dimension.id || undefined,
                title: dimension.title,
                description: dimension.description,
                emotion: dimension.emotion,
                order_in_form: dimension.order_in_form || (dimensionIndex + 1), // CORRIGIDO: +1
                questions: dimension.questions.map((question, questionIndex) => ({
                    id: question.id || undefined,
                    text: question.text,
                    description: question.description || null,
                    type: question.type,
                    isRequired: question.isRequired,
                    helpText: question.helpText || null,
                    order_in_dimension: question.order_in_dimension || (questionIndex + 1), // CORRIGIDO: +1
                    options: question.options ? question.options : null,
                    formId: currentForm.id
                }))
            }))
        }

        setIsLoading(true)

        try {
            const result = await editForm(editedData, forms, setForms, setIsLoading)

            if (result === 200) {
                onOpenChange(false)
                setCurrentStep(0)
                setIsPreviewMode(false)
                setPreviewStates({})
            }
        } catch (error) {
            console.error('Failed to update form:', error)
            warningMessage('Failed to update form. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangeStatus = async () => {
        const validationError = validateForm()

        if (validationError) {
            warningMessage(validationError)
            return
        }

        /* monta payload exatamente como o sequelize espera */
        const editedData = {
            id: currentForm.id,
            title: currentForm.title,
            description: currentForm.description,
            creator: currentForm.creator,
            status: currentForm.status === 'active' ? 'draft' : 'active',
            dimensions: currentForm.dimensions.map((dimension, dimensionIndex) => ({
                id: dimension.id || undefined,
                title: dimension.title,
                description: dimension.description,
                emotion: dimension.emotion,
                order_in_form: dimension.order_in_form || (dimensionIndex + 1), // CORRIGIDO: +1
                questions: dimension.questions.map((question, questionIndex) => ({
                    id: question.id || undefined,
                    text: question.text,
                    description: question.description || null,
                    type: question.type,
                    isRequired: question.isRequired,
                    helpText: question.helpText || null,
                    order_in_dimension: question.order_in_dimension || (questionIndex + 1), // CORRIGIDO: +1
                    options: question.options ? question.options : null,
                    formId: currentForm.id
                }))
            }))
        }

        setIsLoading(true)

        try {
            const result = await editForm(editedData, forms, setForms, setIsLoading)

            if (result === 200) {
                onOpenChange(false)
                setCurrentStep(0)
                setIsPreviewMode(false)
                setPreviewStates({})
            }
        } catch (error) {
            console.error('Failed to update form:', error)
            warningMessage('Failed to update form. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    /* ---------- componentes auxiliares ---------- */
    const CustomRadio = useCallback(({ children, value, checked, onChange, ...props }) => {
        return (
            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-200">
                <div className="flex items-center">
                    <input
                        type="radio"
                        value={value}
                        checked={checked}
                        onChange={onChange}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded-full transition-colors"
                        {...props}
                    />
                </div>
                <span className="text-gray-900 font-medium">{children}</span>
            </label>
        )
    }, [])

    const CustomCheckbox = useCallback(({ children, checked, onChange, ...props }) => {
        return (
            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-200">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded transition-colors"
                    {...props}
                />
                <span className="text-gray-900 font-medium">{children}</span>
            </label>
        )
    }, [])

    /* ---------- renderizações ---------- */
    const renderQuestionEditor = useCallback((dimensionIndex, questionIndex) => {
        const question = currentForm.dimensions[dimensionIndex]?.questions[questionIndex]
        if (!question) return null

        const typeConfig = questionTypes.find((t) => t.id === question.type)
        return (
            <div className="space-y-6 p-1">
                <div className="space-y-4">
                    <Input
                        label="Question"
                        value={question.text}
                        onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "text", e.target.value)}
                        placeholder="Enter your question"
                        aria-label="Question text"
                        classNames={{ input: "text-lg font-medium" }}
                    />
                    <Textarea
                        label="Description (optional)"
                        value={question.description}
                        onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "description", e.target.value)}
                        placeholder="Additional description"
                        aria-label="Question description"
                    />
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Checkbox
                            isSelected={question.isRequired}
                            onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "isRequired", e.target.checked)}
                            aria-label="Required question"
                        />
                        <span className="text-sm font-medium text-gray-700">Required question</span>
                    </div>
                </div>

                {typeConfig?.hasPlaceholder && (
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <Input
                            label="Help Text"
                            value={question.helpText}
                            onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "helpText", e.target.value)}
                            placeholder="Text that appears in the field"
                            aria-label="Help text"
                        />
                    </div>
                )}

                {typeConfig?.hasOptions && (
                    <div className="space-y-4 bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-cyan-900">Options</span>
                            <Button
                                size="sm"
                                onPress={() => addOption(dimensionIndex, questionIndex)}
                                aria-label="Add option"
                                color="primary"
                                variant="flat"
                                startContent={<Plus className="h-4 w-4" />}
                            >
                                Add Option
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-3 items-center group">
                                    <div className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0"></div>
                                    <Input
                                        value={option}
                                        onChange={(e) => updateOption(dimensionIndex, questionIndex, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        aria-label={`Option ${optionIndex + 1}`}
                                        classNames={{ input: "font-medium" }}
                                    />
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => removeOption(dimensionIndex, questionIndex, optionIndex)}
                                        isDisabled={question.options.length <= 1}
                                        aria-label={`Remove option ${optionIndex + 1}`}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {question.type === "rating" && (
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <h4 className="text-sm font-semibold text-cyan-900 mb-4">Rating Scale Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Minimum Value"
                                value={question.min}
                                onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "min", parseInt(e.target.value) || 1)}
                                min="1"
                                max="10"
                                aria-label="Minimum rating value"
                            />
                            <Input
                                type="number"
                                label="Maximum Value"
                                value={question.max}
                                onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "max", parseInt(e.target.value) || 5)}
                                min="2"
                                max="10"
                                aria-label="Maximum rating value"
                            />
                            <Input
                                label="Minimum Label"
                                value={question.minLabel}
                                onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "minLabel", e.target.value)}
                                aria-label="Minimum rating label"
                            />
                            <Input
                                label="Maximum Label"
                                value={question.maxLabel}
                                onChange={(e) => updateQuestion(dimensionIndex, questionIndex, "maxLabel", e.target.value)}
                                aria-label="Maximum rating label"
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    }, [questionTypes, currentForm.dimensions, updateQuestion, addOption, updateOption, removeOption])

    const renderPurePreview = useCallback((dimensionIndex, questionIndex) => {
        const question = currentForm.dimensions[dimensionIndex]?.questions[questionIndex]
        if (!question) return null

        const typeConfig = questionTypes.find((t) => t.id === question.type)

        return (
            <Card className="mb-6 shadow border-0 rounded-xl bg-gradient-to-br from-white to-gray-50/50">
                <CardBody className="p-8">
                    <div className="space-y-6">
                        <div className="border-l-4 border-cyan-500 pl-4">
                            <h3 className="font-bold text-xl text-gray-900" aria-label={`Question ${questionIndex + 1}`}>
                                {question.text || "Untitled Question"}
                                {question.isRequired && <span className="text-red-500 ml-2" aria-hidden="true">*</span>}
                            </h3>
                            {question.description && (
                                <p className="text-gray-600 mt-2 leading-relaxed">{question.description}</p>
                            )}
                        </div>

                        {question.type === "text" && (
                            <Input
                                placeholder={question.helpText || "Your answer"}
                                aria-label="Short answer input"
                                variant="bordered"
                                classNames={{ input: "text-lg py-4" }}
                            />
                        )}

                        {question.type === "textarea" && (
                            <Textarea
                                placeholder={question.helpText || "Your answer"}
                                aria-label="Paragraph input"
                                variant="bordered"
                                minRows={4}
                                classNames={{ input: "text-lg" }}
                            />
                        )}

                        {question.type === "radio" && (
                            <div className="space-y-3" role="radiogroup" aria-label={question.text}>
                                {question.options.map((option, optIndex) => (
                                    <CustomRadio
                                        key={optIndex}
                                        value={option}
                                        checked={getPreviewState(dimensionIndex, questionIndex, `radio_${optIndex}`, false)}
                                        onChange={(e) => updatePreviewState(dimensionIndex, questionIndex, `radio_${optIndex}`, e.target.checked)}
                                    >
                                        {option}
                                    </CustomRadio>
                                ))}
                            </div>
                        )}

                        {question.type === "checkbox" && (
                            <div className="space-y-3" role="group" aria-label={question.text}>
                                {question.options.map((option, optIndex) => (
                                    <CustomCheckbox
                                        key={optIndex}
                                        checked={getPreviewState(dimensionIndex, questionIndex, `checkbox_${optIndex}`, false)}
                                        onChange={(e) => updatePreviewState(dimensionIndex, questionIndex, `checkbox_${optIndex}`, e.target.checked)}
                                    >
                                        {option}
                                    </CustomCheckbox>
                                ))}
                            </div>
                        )}

                        {question.type === "dropdown" && (
                            <Select
                                placeholder="Select an option"
                                aria-label={question.text}
                                variant="bordered"
                                classNames={{ trigger: "h-12 text-lg" }}
                            >
                                {question.options.map((option, optIndex) => (
                                    <SelectItem key={optIndex} value={option} className="text-lg">
                                        {option}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}

                        {question.type === "date" && (
                            <Input
                                type="date"
                                aria-label="Date selection"
                                variant="bordered"
                                classNames={{ input: "text-lg py-4" }}
                            />
                        )}

                        {question.type === "rating" && (
                            <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-6 rounded-xl border border-cyan-200">
                                <div className="flex items-center justify-between mb-4" aria-label={`Rating scale from ${question.min} to ${question.max}`}>
                                    <span className="text-sm font-semibold text-cyan-700">{question.minLabel}</span>
                                    <div className="flex gap-2" role="radiogroup">
                                        {Array.from({ length: question.max - question.min + 1 }, (_, i) => {
                                            const value = i + question.min
                                            const isSelected = getPreviewState(dimensionIndex, questionIndex, "rating") === value
                                            return (
                                                <Button
                                                    key={i}
                                                    variant={isSelected ? "solid" : "flat"}
                                                    color={isSelected ? "primary" : "default"}
                                                    size="lg"
                                                    className={`min-w-12 h-12 font-bold ${isSelected
                                                        ? 'shadow scale-110 transition-all duration-200'
                                                        : 'hover:scale-105 transition-transform'
                                                        }`}
                                                    onPress={() => updatePreviewState(dimensionIndex, questionIndex, "rating", value)}
                                                    aria-label={`Rating ${value}`}
                                                >
                                                    {value}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <span className="text-sm font-semibold text-cyan-700">{question.maxLabel}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        )
    }, [questionTypes, CustomRadio, CustomCheckbox, getPreviewState, updatePreviewState, currentForm.dimensions])

    const renderQuestionPreview = useCallback((dimensionIndex, questionIndex) => {
        const question = currentForm.dimensions[dimensionIndex]?.questions[questionIndex]
        if (!question) return null

        const typeConfig = questionTypes.find((t) => t.id === question.type)

        return (
            <Card className="mb-6 shadow hover:shadow transition-all duration-300 border border-gray-200 rounded-xl group">
                <CardBody className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 ${typeConfig?.color}`}>
                                        <typeConfig.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900" aria-label={`Question ${questionIndex + 1}`}>
                                            {question.text || "Untitled Question"}
                                            {question.isRequired && <span className="text-red-500 ml-2" aria-hidden="true">*</span>}
                                        </h3>
                                        {question.description && (
                                            <p className="text-gray-600 mt-1 text-sm leading-relaxed">{question.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        aria-label="Question options"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Question actions">
                                    <DropdownItem
                                        onPress={() => { setEditingQuestionIndex({ dimensionIndex, questionIndex }); onEditOpen() }}
                                        startContent={<Edit3 className="h-4 w-4" />}
                                    >
                                        Edit
                                    </DropdownItem>
                                    <DropdownItem
                                        onPress={() => duplicateQuestion(dimensionIndex, questionIndex)}
                                        startContent={<Plus className="h-4 w-4" />}
                                    >
                                        Duplicate
                                    </DropdownItem>
                                    <DropdownItem
                                        className="text-danger"
                                        color="danger"
                                        onPress={() => removeQuestion(dimensionIndex, questionIndex)}
                                        startContent={<Trash2 className="h-4 w-4" />}
                                    >
                                        Delete
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>

                        <div className="ml-11">
                            {question.type === "text" && <Input placeholder={question.helpText || "Your answer"} aria-label="Short answer input" />}
                            {question.type === "textarea" && <Textarea placeholder={question.helpText || "Your answer"} aria-label="Paragraph input" />}
                            {question.type === "radio" && (
                                <div className="space-y-2" role="radiogroup" aria-label={question.text}>
                                    {question.options.map((option, optIndex) => (
                                        <CustomRadio
                                            key={optIndex}
                                            value={option}
                                            checked={getPreviewState(dimensionIndex, questionIndex, `radio_${optIndex}`, false)}
                                            onChange={(e) => updatePreviewState(dimensionIndex, questionIndex, `radio_${optIndex}`, e.target.checked)}
                                        >
                                            {option}
                                        </CustomRadio>
                                    ))}
                                </div>
                            )}
                            {question.type === "checkbox" && (
                                <div className="space-y-2" role="group" aria-label={question.text}>
                                    {question.options.map((option, optIndex) => (
                                        <CustomCheckbox
                                            key={optIndex}
                                            checked={getPreviewState(dimensionIndex, questionIndex, `checkbox_${optIndex}`, false)}
                                            onChange={(e) => updatePreviewState(dimensionIndex, questionIndex, `checkbox_${optIndex}`, e.target.checked)}
                                        >
                                            {option}
                                        </CustomCheckbox>
                                    ))}
                                </div>
                            )}
                            {question.type === "dropdown" && (
                                <Select placeholder="Select an option" aria-label={question.text}>
                                    {question.options.map((option, optIndex) => (
                                        <SelectItem key={optIndex} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                            {question.type === "date" && <Input type="date" aria-label="Date selection" />}
                            {question.type === "rating" && (
                                <div className="flex items-center justify-between" aria-label={`Rating scale from ${question.min} to ${question.max}`}>
                                    <span className="text-sm text-gray-600">{question.minLabel}</span>
                                    <div className="flex gap-1" role="radiogroup">
                                        {Array.from({ length: question.max - question.min + 1 }, (_, i) => {
                                            const value = i + question.min
                                            const isSelected = getPreviewState(dimensionIndex, questionIndex, "rating") === value
                                            return (
                                                <Button
                                                    key={i}
                                                    variant={isSelected ? "solid" : "flat"}
                                                    color={isSelected ? "primary" : "default"}
                                                    size="sm"
                                                    onPress={() => updatePreviewState(dimensionIndex, questionIndex, "rating", value)}
                                                    aria-label={`Rating ${value}`}
                                                >
                                                    {value}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <span className="text-sm text-gray-600">{question.maxLabel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }, [questionTypes, CustomRadio, CustomCheckbox, getPreviewState, updatePreviewState, duplicateQuestion, removeQuestion, onEditOpen, currentForm.dimensions])

    const renderPreviewContent = () => {
        const totalQuestions = currentForm.dimensions.reduce((total, dimension) => total + dimension.questions.length, 0)

        return (
            <div className="bg-gradient-to-br from-white to-gray-50 min-h-[80vh] rounded-xl">
                <div className="flex gap-6 items-center bg-gradient-to-r from-cyan-500 via-cyan-600 to-emerald-500 p-6 rounded-t-xl shadow">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                        <img className="w-20 h-20 border-white border-2 rounded-full" src="/edi/equicenter.png" alt="Equicenter logo" />
                    </div>
                    <div className="text-white flex-1">
                        <h1 className="text-2xl font-bold mb-2 drop-shadow">{currentForm.title}</h1>
                        <p className="text-white/90 leading-relaxed">{currentForm.description}</p>
                    </div>
                    <Button variant="flat" onPress={() => setIsPreviewMode(false)} aria-label="Exit preview" className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
                        <Eye className="text-white" />Back to Edit
                    </Button>
                </div>

                {totalQuestions > 0 ? (
                    <div className="p-6 max-w-4xl mx-auto">
                        <div className="mb-2 bg-white rounded-lg p-4 shadow border-2 border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">
                                    Question {currentStep + 1} of {totalQuestions}
                                </span>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-white to-gray-50 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {(() => {
                            let questionCount = 0
                            for (let dimensionIndex = 0; dimensionIndex < currentForm.dimensions.length; dimensionIndex++) {
                                const dimension = currentForm.dimensions[dimensionIndex]
                                for (let questionIndex = 0; questionIndex < dimension.questions.length; questionIndex++) {
                                    if (questionCount === currentStep) {
                                        return (
                                            <div key={`${dimensionIndex}-${questionIndex}`}>
                                                {questionIndex === 0 && (
                                                    <Card className="mb-6 bg-gradient-to-r from-cyan-50 to-emerald-50 border-cyan-200 shadow">
                                                        <CardBody className="p-6">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h2 className="text-xl font-bold text-cyan-900">{dimension.title}</h2>
                                                                <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full capitalize">
                                                                    {dimension.emotion}
                                                                </span>
                                                            </div>
                                                            {dimension.description && (
                                                                <p className="text-cyan-700 mt-2">{dimension.description}</p>
                                                            )}
                                                        </CardBody>
                                                    </Card>
                                                )}
                                                {renderPurePreview(dimensionIndex, questionIndex)}
                                            </div>
                                        )
                                    }
                                    questionCount++
                                }
                            }
                            return null
                        })()}

                        <div className="flex gap-3 justify-between mt-8">
                            <div className="flex gap-3">
                                <Button
                                    variant="flat"
                                    onPress={() => setIsPreviewMode(false)}
                                    aria-label="Back to edit form"
                                    startContent={<Edit3 className="h-4 w-4" />}
                                    className="font-semibold"
                                >
                                    Back to Edit
                                </Button>
                                <Button
                                    variant="flat"
                                    isDisabled={currentStep === 0}
                                    onPress={() => setCurrentStep((prev) => prev - 1)}
                                    aria-label="Previous question"
                                    className="font-semibold"
                                >
                                    Previous
                                </Button>
                            </div>

                            {currentStep < totalQuestions - 1 ? (
                                <Button
                                    color="primary"
                                    onPress={() => setCurrentStep((prev) => prev + 1)}
                                    aria-label="Next question"
                                    className="font-semibold px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 border-0"
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    color="primary"
                                    onPress={() => setIsPreviewMode(false)}
                                    aria-label="End preview"
                                    className="font-semibold px-6 bg-gradient-to-r from-cyan-500 to-emerald-600 border-0"
                                    startContent={<Save className="h-4 w-4" />}
                                >
                                    Submit Form
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No questions to preview</p>
                        <p className="text-sm mt-2">Add some questions to see the preview</p>
                        <Button
                            variant="flat"
                            onPress={() => setIsPreviewMode(false)}
                            className="mt-4 font-semibold"
                        >
                            Back to Editor
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    const renderEditorContent = (onClose) => {
        return (
            <>
                <div className="p-8">
                    <div className="flex gap-4 items-center mb-8">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow">
                            <img src="/edi/equicenter.png" className="h-16 w-16 rounded-xl" alt="Equicenter logo" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                Edit Form
                            </h1>
                            <small className="text-gray-600 font-medium">Modify your form with dimensions and questions</small>
                        </div>
                        <div className="flex flex-1 gap-4 justify-end items-center">
                            <div className="flex gap-3">
                                <Button
                                    variant="flat"
                                    onPress={() => { setCurrentStep(0); setIsPreviewMode(true) }}
                                    aria-label="Preview form"
                                    startContent={<Eye className="h-4 w-4" />}
                                    className="font-semibold"
                                >
                                    Preview Form
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="flat"
                                    onPress={onClose}
                                    aria-label="Cancel form editing"
                                    className="font-semibold"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    isLoading={isLoading}
                                    onPress={handleChangeStatus}
                                    color="primary"
                                    aria-label="Update status"
                                    className="font-semibold px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 border-0 shadow"
                                >
                                    {currentForm?.status === 'draft' ? "Make as Active" : "Make as Draft"}
                                </Button>

                                <Button
                                    isLoading={isLoading}
                                    onPress={handleSubmit}
                                    color="primary"
                                    aria-label="Update form"
                                    className="font-semibold px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 border-0 shadow"
                                    startContent={!isLoading && <Save className="h-4 w-4" />}
                                    isDisabled={!hasChanges()}
                                >
                                    {isLoading ? "Updating..." : "Update Form"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Card className="shadow border-0 rounded-2xl bg-gradient-to-b from-white to-gray-50/50">
                            <CardBody className="p-8">
                                <div className="space-y-6 mb-8">
                                    <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-6 rounded-xl border border-cyan-200">
                                        <Input
                                            value={currentForm.title}
                                            className='mb-3'
                                            onChange={(e) => setCurrentForm((prev) => ({ ...prev, title: e.target.value }))}
                                            classNames={{
                                                input: "text-3xl font-bold bg-transparent border-0 focus:ring-0 p-1", mainWrapper: "bg-transparent"
                                            }}
                                            aria-label="Form title"
                                            placeholder="Form Title"
                                        />
                                        <Textarea
                                            value={currentForm.description}
                                            onChange={(e) => setCurrentForm((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Form description (optional)"
                                            aria-label="Form description"
                                            classNames={{
                                                input: "bg-transparent border-0 focus:ring-0 p-0 text-lg resize-none",
                                                mainWrapper: "bg-transparent mt-4"
                                            }}
                                            minRows={2}
                                        />
                                    </div>
                                </div>

                                <Divider className="my-8" />

                                <div className="mt-6">
                                    {currentForm.dimensions.length > 0 && (
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                                                <FolderOpen className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="font-bold text-xl text-gray-900">
                                                Evaluation Dimensions ({currentForm.dimensions.length})
                                            </h3>
                                        </div>
                                    )}

                                    {currentForm.dimensions.map((dimension, dimensionIndex) => (
                                        <div key={dimension.id} className="mb-8">
                                            {/* Dimension Header */}
                                            <Card className="mb-6 bg-gradient-to-r from-cyan-50 to-emerald-50 border-cyan-200 shadow">
                                                <CardBody className="p-6">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h2 className="text-xl font-bold text-cyan-900">
                                                                    {dimension.title}
                                                                </h2>
                                                                <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full capitalize">
                                                                    {dimension.emotion}
                                                                </span>
                                                            </div>
                                                            {dimension.description && (
                                                                <p className="text-cyan-700">{dimension.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            {dimension.questions.length > 0 && (
                                                                <Dropdown>
                                                                    <DropdownTrigger>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="flat"
                                                                            className="bg-cyan-500 text-white hover:bg-cyan-600"
                                                                            startContent={<Plus className="h-4 w-4" />}
                                                                        >
                                                                            Add Question
                                                                        </Button>
                                                                    </DropdownTrigger>
                                                                    <DropdownMenu aria-label="Question types">
                                                                        {questionTypes.map((type) => (
                                                                            <DropdownItem
                                                                                key={type.id}
                                                                                onPress={() => addQuestion(type.id, dimensionIndex)}
                                                                                startContent={
                                                                                    <div className={`p-1 rounded ${type.color}`}>
                                                                                        <type.icon className="h-4 w-4" />
                                                                                    </div>
                                                                                }
                                                                            >
                                                                                {type.name}
                                                                            </DropdownItem>
                                                                        ))}
                                                                    </DropdownMenu>
                                                                </Dropdown>
                                                            )}
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() => { setEditingDimensionIndex(dimensionIndex); onDimensionOpen() }}
                                                                aria-label="Edit dimension"
                                                            >
                                                                <Edit3 className="h-4 w-4 text-cyan-600" />
                                                            </Button>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() => confirmRemoveDimension(dimensionIndex)}
                                                                aria-label="Remove dimension"
                                                                isDisabled={currentForm.dimensions.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            {/* Dimension Questions */}
                                            <div className="ml-4">
                                                {dimension.questions.length > 0 ? (
                                                    <>
                                                        {dimension.questions.map((question, questionIndex) => (
                                                            <div key={question.id} className="relative group">
                                                                {renderQuestionPreview(dimensionIndex, questionIndex)}
                                                                <div className="absolute right-16 top-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        onPress={() => moveQuestion(dimensionIndex, questionIndex, "up")}
                                                                        isDisabled={questionIndex === 0}
                                                                        aria-label="Move question up"
                                                                        className="bg-white shadow border"
                                                                    >
                                                                        <ArrowUp className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        onPress={() => moveQuestion(dimensionIndex, questionIndex, "down")}
                                                                        isDisabled={questionIndex === dimension.questions.length - 1}
                                                                        aria-label="Move question down"
                                                                        className="bg-white shadow border"
                                                                    >
                                                                        <ArrowDown className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-center mt-6 mb-8">
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        variant="flat"
                                                                        className="bg-cyan-500 text-white hover:bg-cyan-600"
                                                                        startContent={<Plus className="h-4 w-4" />}
                                                                    >
                                                                        Add Question to {dimension.title}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu aria-label="Question types">
                                                                    {questionTypes.map((type) => (
                                                                        <DropdownItem
                                                                            key={type.id}
                                                                            onPress={() => addQuestion(type.id, dimensionIndex)}
                                                                            startContent={
                                                                                <div className={`p-1 rounded ${type.color}`}>
                                                                                    <type.icon className="h-4 w-4" />
                                                                                </div>
                                                                            }
                                                                        >
                                                                            {type.name}
                                                                        </DropdownItem>
                                                                    ))}
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Card className="mb-6 border-2 border-dashed border-gray-300 bg-gray-50/50 shadow">
                                                        <CardBody className="text-center py-8">
                                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                            <p className="text-gray-500 font-medium mb-2">No questions in this dimension</p>
                                                            <p className="text-gray-400 text-sm mb-4">Add the first question to get started</p>
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        variant="flat"
                                                                        startContent={<Plus className="h-4 w-4" />}
                                                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 w-56 mx-auto text-white"
                                                                    >
                                                                        Add First Question
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu aria-label="Question types">
                                                                    {questionTypes.map((type) => (
                                                                        <DropdownItem
                                                                            key={type.id}
                                                                            onPress={() => addQuestion(type.id, dimensionIndex)}
                                                                            startContent={
                                                                                <div className={`p-1 rounded ${type.color}`}>
                                                                                    <type.icon className="h-4 w-4" />
                                                                                </div>
                                                                            }
                                                                        >
                                                                            {type.name}
                                                                        </DropdownItem>
                                                                    ))}
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Dimension Button at the end */}
                                    <Card className="border-2 border-dashed border-cyan-300 bg-cyan-50/50 hover:bg-cyan-50 transition-colors cursor-pointer">
                                        <CardBody className="text-center py-8">
                                            <div className="p-3 bg-cyan-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                <Plus className="h-8 w-8 text-cyan-600" />
                                            </div>
                                            <p className="text-cyan-700 font-medium mb-2">Add New Dimension</p>
                                            <p className="text-cyan-600 text-sm mb-4">Create additional evaluation dimensions</p>

                                            <Button
                                                variant="flat"
                                                onPress={addDimension}
                                                startContent={<Plus className="h-4 w-4" />}
                                                className="bg-cyan-500 w-56 mx-auto text-white hover:bg-cyan-600"
                                            >
                                                Add New Dimension
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Modal
                classNames={{ base: 'rounded-3xl bg-white radio', bady: 'rounded-3xl' }}
                scrollBehavior="outside"
                className='rounded-2xl'
                size={isPreviewMode ? "3xl" : "5xl"}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent >
                    {(onClose) => (
                        <div className="bg-gradient-to-br rounded-3xl from-gray-50 to-cyan-50/30">
                            {isPreviewMode ? renderPreviewContent() : renderEditorContent(onClose)}
                        </div>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Question Modal */}
            <Modal scrollBehavior="outside" className='rounded-3xl' isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <Edit3 className="h-6 w-6 text-cyan-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Edit Question</h2>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                {editingQuestionIndex !== null &&
                                    renderQuestionEditor(editingQuestionIndex.dimensionIndex, editingQuestionIndex.questionIndex)}
                            </ModalBody>
                            <ModalFooter className="bg-white rounded-b-2xl pt-0 p-6">
                                <div className="flex gap-3 w-full justify-end">
                                    <Button variant="flat" onPress={onClose} aria-label="Cancel question edit" className="font-semibold">
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={onClose} aria-label="Save question"
                                        className="font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 border-0">
                                        Save Changes
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Dimension Modal */}
            <Modal scrollBehavior="outside" className='rounded-3xl' isOpen={isDimensionOpen} onOpenChange={onDimensionOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gradient-to-r from-cyan-50 to-emerald-50 border-b">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-6 w-6 text-cyan-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Edit Dimension</h2>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                {editingDimensionIndex !== null && (
                                    <div className="space-y-6">
                                        <Input
                                            label="Dimension Title"
                                            value={currentForm.dimensions[editingDimensionIndex]?.title || ""}
                                            onChange={(e) => updateDimension(editingDimensionIndex, "title", e.target.value)}
                                            placeholder="Enter dimension title"
                                            aria-label="Dimension title"
                                            classNames={{
                                                input: "text-lg font-medium"
                                            }}
                                        />
                                        <Textarea
                                            label="Dimension Description (optional)"
                                            value={currentForm.dimensions[editingDimensionIndex]?.description || ""}
                                            onChange={(e) => updateDimension(editingDimensionIndex, "description", e.target.value)}
                                            placeholder="Dimension description"
                                            aria-label="Dimension description"
                                        />
                                        <Select
                                            label="Emotion Type"
                                            selectedKeys={[currentForm.dimensions[editingDimensionIndex]?.emotion || "others"]}
                                            onChange={(e) => updateDimension(editingDimensionIndex, "emotion", e.target.value)}
                                            aria-label="Emotion type"
                                        >
                                            {emotionOptions.map((emotion) => (
                                                <SelectItem key={emotion} value={emotion} className="capitalize">
                                                    {emotion}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="bg-gray-50 border-t p-6">
                                <div className="flex gap-3 w-full justify-between">
                                    <Button
                                        variant="flat"
                                        color="danger"
                                        onPress={() => {
                                            confirmRemoveDimension(editingDimensionIndex)
                                            onClose()
                                        }}
                                        aria-label="Delete dimension"
                                        className="font-semibold"
                                        isDisabled={currentForm.dimensions.length <= 1}
                                    >
                                        Delete Dimension
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="flat" onPress={onClose} aria-label="Cancel dimension edit" className="font-semibold">
                                            Cancel
                                        </Button>
                                        <Button color="primary" onPress={onClose} aria-label="Save dimension"
                                            className="font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 border-0">
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Remove Dimension Confirmation Modal */}
            <Modal scrollBehavior="outside" className='rounded-3xl' isOpen={dimensionToRemove !== null} onOpenChange={() => setDimensionToRemove(null)} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Remove Dimension</h2>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        Are you sure you want to remove the dimension "<span className="font-semibold">{currentForm.dimensions[dimensionToRemove]?.title}</span>"?
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        This action cannot be undone. All questions in this dimension will also be removed.
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter className="bg-gray-50 border-t p-6">
                                <div className="flex gap-3 w-full justify-end">
                                    <Button variant="flat" onPress={cancelRemoveDimension} aria-label="Cancel removal" className="font-semibold">
                                        Cancel
                                    </Button>
                                    <Button color="danger" onPress={removeDimension} aria-label="Confirm removal"
                                        className="font-semibold bg-gradient-to-r from-red-500 to-orange-500 border-0">
                                        Remove Dimension
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default EditForm