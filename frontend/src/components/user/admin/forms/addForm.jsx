import React, { useState, useMemo, useCallback, useContext } from 'react'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Checkbox, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem, Divider, useDisclosure } from "@heroui/react"

import { FileText, Circle, CheckSquare, List, Calendar, Star, Plus, Trash2, MoreVertical, ArrowUp, ArrowDown, Eye, Save, Edit3, LayoutGrid, FolderOpen } from 'lucide-react'

import { AppContext } from "../../../../contexts/app_context"

import addForm from "../../../../functions/admin/forms/addForm"

import warningMessage from "../../../../functions/toaster/info"



const AddForm = ({ forms, setForms }) => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
    const { isOpen: isSectionOpen, onOpen: onSectionOpen, onOpenChange: onSectionOpenChange } = useDisclosure()

    const emotionOptions = useMemo(() => [
        "motivation", "awareness", "barriers", "collaboration", "knowledge", "competence", "attitude", "others"
    ], [])

    const [currentForm, setCurrentForm] = useState({
        title: "Performance Evaluation Form",
        description: "Comprehensive employee performance assessment",
        status: 'active',
        dimensions: [
            {
                id: 1,
                title: "Motivation",
                description: "Assessment of employee drive and enthusiasm",
                emotion: "motivation",
                order_in_form: 1, // Alterado: começar de 1, não 0
                questions: []
            },
            {
                id: 2,
                title: "Awareness",
                description: "Evaluation of technical and professional capabilities",
                emotion: "awareness",
                order_in_form: 2,
                questions: []
            },
            {
                id: 3,
                title: "Barriers",
                description: "Measurement of involvement and commitment",
                emotion: "barriers",
                order_in_form: 3,
                questions: []
            },
            {
                id: 4,
                title: "Collaboration",
                description: "Assessment of teamwork and cooperation",
                emotion: "collaboration",
                order_in_form: 4,
                questions: []
            },
            {
                id: 5,
                title: "Knowledge",
                description: "Evaluation of creativity and problem-solving",
                emotion: "knowledge",
                order_in_form: 5,
                questions: []
            },
            {
                id: 6,
                title: "Competence",
                description: "Assessment of guidance and influence",
                emotion: "competence",
                order_in_form: 6,
                questions: []
            },
            {
                id: 7,
                title: "Attitude",
                description: "Measurement of results and contributions",
                emotion: "attitude",
                order_in_form: 7,
                questions: []
            }
        ]
    })

    const [isLoading, setIsLoading] = useState(false)
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
    const [editingDimensionIndex, setEditingDimensionIndex] = useState(null)
    const [previewStates, setPreviewStates] = useState({})
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [dimensionToRemove, setDimensionToRemove] = useState(null)

    const questionTypes = useMemo(() => [
        { id: "text", name: "Short Answer", icon: FileText, hasOptions: false, hasPlaceholder: true, color: "text-cyan-600" },
        { id: "textarea", name: "Paragraph", icon: FileText, hasOptions: false, hasPlaceholder: true, color: "text-emerald-600" },
        { id: "radio", name: "Multiple Choice", icon: Circle, hasOptions: true, hasPlaceholder: false, color: "text-cyan-600" },
        { id: "checkbox", name: "Checkboxes", icon: CheckSquare, hasOptions: true, hasPlaceholder: false, color: "text-emerald-600" },
        { id: "dropdown", name: "Dropdown", icon: List, hasOptions: true, hasPlaceholder: false, color: "text-cyan-600" },
        { id: "date", name: "Date", icon: Calendar, hasOptions: false, hasPlaceholder: false, color: "text-emerald-600" },
        { id: "rating", name: "Linear Scale", icon: Star, hasOptions: false, hasPlaceholder: false, color: "text-cyan-600" }
    ], [])

    // Add new dimension - CORRIGIDO
    const addDimension = useCallback(() => {
        const newDimension = {
            id: Date.now(),
            title: "New Dimension",
            description: "Description of the new dimension",
            emotion: "others",
            order_in_form: currentForm.dimensions.length + 1,
            questions: []
        }

        setCurrentForm((prev) => ({
            ...prev,
            dimensions: [...prev.dimensions, newDimension]
        }))
        setEditingDimensionIndex(currentForm.dimensions.length)
        onSectionOpen()
    }, [currentForm.dimensions.length, onSectionOpen])

    // Update dimension
    const updateDimension = useCallback((index, field, value) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            updatedDimensions[index] = { ...updatedDimensions[index], [field]: value }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [])

    // Remove dimension with confirmation
    const confirmRemoveDimension = useCallback((index) => {
        if (currentForm.dimensions.length <= 1) {
            warningMessage("You must have at least one dimension")
            return
        }
        setDimensionToRemove(index)
    }, [currentForm.dimensions.length])

    // Actually remove dimension after confirmation - CORRIGIDO
    const removeDimension = useCallback(() => {
        if (dimensionToRemove === null)
            return

        // Reorder remaining dimensions
        setCurrentForm((prev) => {
            const updatedDimensions = prev.dimensions.filter((_, i) => i !== dimensionToRemove)

            // CORRIGIDO: Reordenar começando de 1
            updatedDimensions.forEach((dim, idx) => {
                dim.order_in_form = idx + 1
            })

            return { ...prev, dimensions: updatedDimensions }
        })

        if (editingDimensionIndex === dimensionToRemove) {
            setEditingDimensionIndex(null)
            onSectionOpenChange(false)
        }

        setDimensionToRemove(null)
    }, [dimensionToRemove, editingDimensionIndex, onSectionOpenChange])

    // Cancel dimension removal
    const cancelRemoveDimension = useCallback(() => {
        setDimensionToRemove(null)
    }, [])

    // Add question to dimension - CORRIGIDO
    const addQuestion = useCallback((type, dimensionIndex) => {
        const baseQuestion = {
            id: Date.now(),
            type: type,
            text: "",
            isRequired: false,
            description: ""
        }
        let newQuestion
        switch (type) {
            case "text":
            case "textarea":
            case "date":
                newQuestion = { ...baseQuestion, helpText: "" }
                break
            case "radio":
                newQuestion = {
                    ...baseQuestion,
                    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
                }
                break
            case "checkbox":
            case "dropdown":
                newQuestion = {
                    ...baseQuestion,
                    options: ["Option 1"]
                }
                break
            case "rating":
                newQuestion = {
                    ...baseQuestion,
                    min: 1,
                    max: 5,
                    minLabel: "Poor",
                    maxLabel: "Excellent"
                }
                break
            default:
                newQuestion = baseQuestion
        }

        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const dimension = updatedDimensions[dimensionIndex]

            // CORRIGIDO: order_in_dimension começa em 1
            newQuestion.order_in_dimension = dimension.questions.length + 1

            updatedDimensions[dimensionIndex] = {
                ...dimension,
                questions: [...dimension.questions, newQuestion]
            }
            return { ...prev, dimensions: updatedDimensions }
        })

        setEditingQuestionIndex({ dimensionIndex, questionIndex: currentForm.dimensions[dimensionIndex]?.questions.length || 0 })
        onEditOpen()
    }, [currentForm.dimensions, onEditOpen])

    // Update question
    const updateQuestion = useCallback((dimensionIndex, questionIndex, field, value) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const updatedQuestions = [...updatedDimensions[dimensionIndex].questions]
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value }
            updatedDimensions[dimensionIndex] = { ...updatedDimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [])

    // Add option
    const addOption = useCallback((dimensionIndex, questionIndex) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const question = updatedDimensions[dimensionIndex].questions[questionIndex]
            const newOption = `Option ${question.options.length + 1}`
            const updatedQuestions = [...updatedDimensions[dimensionIndex].questions]
            updatedQuestions[questionIndex] = { ...question, options: [...question.options, newOption] }
            updatedDimensions[dimensionIndex] = { ...updatedDimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [])

    // Update option
    const updateOption = useCallback((dimensionIndex, questionIndex, optionIndex, value) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const updatedQuestions = [...updatedDimensions[dimensionIndex].questions]
            const updatedOptions = [...updatedQuestions[questionIndex].options]
            updatedOptions[optionIndex] = value
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions }
            updatedDimensions[dimensionIndex] = { ...updatedDimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [])

    // Remove option
    const removeOption = useCallback((dimensionIndex, questionIndex, optionIndex) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const updatedQuestions = [...updatedDimensions[dimensionIndex].questions]
            const updatedOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
            updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions }
            updatedDimensions[dimensionIndex] = { ...updatedDimensions[dimensionIndex], questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [])

    // Remove question - CORRIGIDO
    const removeQuestion = useCallback((dimensionIndex, questionIndex) => {
        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const dimension = updatedDimensions[dimensionIndex]
            const updatedQuestions = dimension.questions.filter((_, i) => i !== questionIndex)

            // CORRIGIDO: Update order_in_dimension começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            updatedDimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })

        setPreviewStates((prev) => {
            const newStates = { ...prev }
            delete newStates[`${dimensionIndex}-${questionIndex}`]
            return newStates
        })
    }, [])

    // Duplicate question - CORRIGIDO
    const duplicateQuestion = useCallback((dimensionIndex, questionIndex) => {
        const questionToDuplicate = currentForm.dimensions[dimensionIndex].questions[questionIndex]
        const duplicatedQuestion = { ...questionToDuplicate, id: Date.now() }

        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const dimension = updatedDimensions[dimensionIndex]
            const updatedQuestions = [...dimension.questions]

            // Insert duplicated question and update orders
            updatedQuestions.splice(questionIndex + 1, 0, duplicatedQuestion)

            // CORRIGIDO: Recalcular order_in_dimension começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            updatedDimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })
    }, [currentForm.dimensions])

    // Move question - CORRIGIDO
    const moveQuestion = useCallback((dimensionIndex, questionIndex, direction) => {
        const questions = currentForm.dimensions[dimensionIndex].questions
        if (direction === "up" && questionIndex === 0) return
        if (direction === "down" && questionIndex === questions.length - 1) return

        const newIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1

        setPreviewStates((prev) => {
            const newStates = { ...prev }
            const movingState = newStates[`${dimensionIndex}-${questionIndex}`]
            if (movingState !== undefined) {
                delete newStates[`${dimensionIndex}-${questionIndex}`]
                newStates[`${dimensionIndex}-${newIndex}`] = movingState
            }
            return newStates
        })

        setCurrentForm((prev) => {
            const updatedDimensions = [...prev.dimensions]
            const dimension = updatedDimensions[dimensionIndex]
            const updatedQuestions = [...dimension.questions]

            const [movedQuestion] = updatedQuestions.splice(questionIndex, 1)
            updatedQuestions.splice(newIndex, 0, movedQuestion)

            // CORRIGIDO: Recalcular order_in_dimension começando de 1
            updatedQuestions.forEach((q, idx) => {
                q.order_in_dimension = idx + 1
            })

            updatedDimensions[dimensionIndex] = { ...dimension, questions: updatedQuestions }
            return { ...prev, dimensions: updatedDimensions }
        })

        setEditingQuestionIndex({ dimensionIndex, questionIndex: newIndex })
    }, [currentForm.dimensions])

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

    const updatePreviewState = useCallback((dimensionIndex, questionIndex, field, value) => {
        setPreviewStates((prev) => ({
            ...prev,
            [`${dimensionIndex}-${questionIndex}`]: {
                ...prev[`${dimensionIndex}-${questionIndex}`],
                [field]: value
            }
        }))
    }, [])

    const getPreviewState = useCallback((dimensionIndex, questionIndex, field, defaultValue = "") => {
        return previewStates[`${dimensionIndex}-${questionIndex}`]?.[field] ?? defaultValue
    }, [previewStates])

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
                        classNames={{
                            input: "text-lg font-medium"
                        }}
                    />
                    <Textarea
                        label="Description (optional)"
                        value={question.description || ""}
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
                            value={question.helpText || ""}
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
                                        classNames={{
                                            input: "font-medium"
                                        }}
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
                                classNames={{
                                    input: "text-lg py-4"
                                }}
                            />
                        )}

                        {question.type === "textarea" && (
                            <Textarea
                                placeholder={question.helpText || "Your answer"}
                                aria-label="Paragraph input"
                                variant="bordered"
                                minRows={4}
                                classNames={{
                                    input: "text-lg"
                                }}
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
                                classNames={{
                                    trigger: "h-12 text-lg"
                                }}
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
                                classNames={{
                                    input: "text-lg py-4"
                                }}
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

    const validateForm = useCallback(() => {
        if (!currentForm.title.trim()) return "Form title is required"
        if (currentForm.dimensions.length === 0) return "At least one dimension is required"

        for (let dimension of currentForm.dimensions) {
            if (!dimension.title.trim()) return "All dimensions must have a title"
            if (!dimension.emotion) return "All dimensions must have an emotion type"

            const emptyQuestion = dimension.questions.find((q) => !q.text.trim())
            if (emptyQuestion) return "All questions must have text"

            const invalidOptions = dimension.questions.find((q) => q.options && q.options.some((opt) => !opt.trim()))
            if (invalidOptions) return "All options must have text"
        }

        return null
    }, [currentForm.title, currentForm.dimensions])

    const handleSubmit = async () => {
        const validationError = validateForm()

        if (validationError) {
            warningMessage(validationError)
            return
        }

        const formDataForBackend = {
            title: currentForm.title,
            description: currentForm.description,
            status: currentForm.status,
            dimensions: currentForm.dimensions.map((dimension, dimensionIndex) => ({
                title: dimension.title,
                description: dimension.description,
                emotion: dimension.emotion,
                order_in_form: dimension.order_in_form, // Já está correto
                questions: dimension.questions.map((question, questionIndex) => ({
                    text: question.text,
                    description: question.description || null,
                    type: question.type,
                    isRequired: question.isRequired,
                    helpText: question.helpText || null,
                    order_in_dimension: question.order_in_dimension, // Já está correto
                    options: question.options ? question.options : null,
                    formId: null
                }))
            }))
        }

        setIsLoading(true)
        try {
            const result = await addForm(formDataForBackend, forms, setForms, setIsLoading)
            if (result === 200) onOpenChange(false)
        } catch (error) {
            console.error("Failed to save form:", error)
        } finally {
            setIsLoading(false)
        }
    }

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
                                                            <h2 className="text-xl font-bold text-cyan-900">{dimension.title}</h2>
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
                                Create New Form
                            </h1>
                            <small className="text-gray-600 font-medium">Design your custom form with dimensions and questions</small>
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
                                    aria-label="Cancel form creation"
                                    className="font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    isLoading={isLoading}
                                    onPress={handleSubmit}
                                    color="primary"
                                    aria-label="Save form"
                                    className="font-semibold px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 border-0 shadow"
                                    startContent={!isLoading && <Save className="h-4 w-4" />}
                                >
                                    {isLoading ? "Saving..." : "Save Form"}
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
                                                                onPress={() => { setEditingDimensionIndex(dimensionIndex); onSectionOpen() }}
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
            <Button
                onPress={onOpen}
                size="lg"
                aria-label="Open form creation modal"
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 min-w-40 text-white font-semibold border-0 shadow hover:shadow transition-all duration-300"
                startContent={<Plus className="h-5 w-5" />}
            >
                Create New Form
            </Button>

            <Modal classNames={{ base: 'rounded-3xl bg-white radio', bady: 'rounded-3xl', closeButton: 'cursor-pointer' }} scrollBehavior="outside" className='rounded-2xl' size={isPreviewMode ? "3xl" : "5xl"} isDismissable={false} isKeyboardDismissDisabled={true} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent >
                    {(onClose) => (
                        <div className="bg-gradient-to-br rounded-3xl from-gray-50 to-cyan-50/30">
                            {isPreviewMode ? renderPreviewContent() : renderEditorContent(onClose)}
                        </div>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Question Modal */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" className='rounded-3xl' isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
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
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" className='rounded-3xl' isOpen={isSectionOpen} onOpenChange={onSectionOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-t-2xl">
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
                            <ModalFooter className="bg-white rounded-b-2xl p-6 pt-0">
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
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" className='rounded-3xl' isOpen={dimensionToRemove !== null} onOpenChange={() => setDimensionToRemove(null)} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gradient-to-r rounded-t-2xl from-red-50 to-orange-50">
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
                            <ModalFooter className="bg-white rounded-b-2xl p-6">
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

export default AddForm