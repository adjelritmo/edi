import React, { useState, useContext, useMemo } from 'react'

import { Card, CardBody, Button, Chip, Divider, Modal, ModalContent, useDisclosure, Input, Textarea, Select, SelectItem, Checkbox, RadioGroup, Radio, Progress, Badge, Link } from "@heroui/react"

import { ArrowLeft, Eye, Download, Share2, BarChart3, Calendar, Users, FileText, CheckCircle, Clock, TrendingUp, MessageCircle, CheckSquare, List, Type, Star, FolderOpen, Building2, Percent, Target, PieChart, Building } from "lucide-react"

import { useNavigate, useLocation } from 'react-router-dom'

import { AppContext } from "../../../contexts/app_context"




const FormViewCollaborator = () => {

    const location = useLocation()

    const navigate = useNavigate()

    const { user: currentUser } = useContext(AppContext)

    const form = location?.state?.form || null

    const centerData = location?.state?.centerData || []

    const totalMembers = location?.state?.totalMembers || 0

    const currentCenterName = currentUser?.centerName || "Your Center"

    const [selectedDimension, setSelectedDimension] = useState(null)

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const processedForm = useMemo(() => {

        if (!form)
            return null

        const isPublished = form.publications && form.publications.length > 0

        const publicationData = isPublished ? form.publications[0] : null

        const totalQuestions = form.dimensions?.reduce((total, dimension) => total + (dimension.questions?.length || 0), 0) || 0

        const submissionsCount = form.submissions ? form.submissions.length : 0

        const completionRate = totalMembers > 0 ? Math.round((submissionsCount / totalMembers) * 100) : 0

        return {
            ...form,

            isPublished,

            publicationData,

            dueDate: publicationData?.endDate || null,

            publishStartDate: publicationData?.startDate || null,

            publishEndDate: publicationData?.endDate || null,

            totalQuestions,

            submissionsCount,

            totalMembers,

            completionRate

        }

    }, [form, totalMembers])

    const calculateCenterStats = useMemo(() => {

        if (!processedForm)

            return {

                totalResponses: 0,

                completionRate: 0,

                dimensionAverages: {

                }
            }

        const submissions = processedForm.submissions || []

        const totalResponses = submissions.length

        const dimensionAverages = {}

        if (processedForm.dimensions) {

            processedForm.dimensions.forEach((dimension, index) => {

                dimensionAverages[dimension.title] = Math.round(60 + (index * 10))

            })

        }

        return {

            totalResponses,

            completionRate: totalMembers > 0 ? Math.round((totalResponses / totalMembers) * 100) : 0,

            dimensionAverages: dimensionAverages,

            pendingMembers: totalMembers - totalResponses

        }

    }, [processedForm, totalMembers])

    const centerStats = calculateCenterStats

    const statusIconMap = {
        active: CheckCircle,
        paused: Clock,
        draft: FileText
    }

    const questionTypeIcons = {
        text: Type,
        textarea: MessageCircle,
        radio: CheckCircle,
        checkbox: CheckSquare,
        dropdown: List,
        date: Calendar,
        rating: Star
    }

    const getDimensionsWithQuestions = () => {

        if (!processedForm?.dimensions) return []

        // Ordenar dimensões por order_in_form
        const sortedDimensions = [...processedForm.dimensions]
            .sort((a, b) => {
                const orderA = a.order_in_form !== undefined ? a.order_in_form : Infinity
                const orderB = b.order_in_form !== undefined ? b.order_in_form : Infinity
                return orderA - orderB
            })

        // Filtrar dimensões com perguntas e ordenar perguntas dentro de cada dimensão
        return sortedDimensions
            .filter(dimension => dimension.questions && dimension.questions.length > 0)
            .map(dimension => ({
                ...dimension,
                questions: [...dimension.questions]
                    .sort((a, b) => {
                        const orderA = a.order_in_dimension !== undefined ? a.order_in_dimension : Infinity
                        const orderB = b.order_in_dimension !== undefined ? b.order_in_dimension : Infinity
                        return orderA - orderB
                    })
            }))

    }

    const parseOptions = (raw) => {

        if (!raw)
            return []

        let temp = raw

        while (typeof temp === 'string') {

            try {
                const parsed = JSON.parse(temp)

                if (parsed === temp)

                    break

                temp = parsed

            } catch {

                break

            }

            if (Array.isArray(temp))
                break

        }

        return Array.isArray(temp) ? temp.filter(Boolean) : []
    }

    const getQuestionOptions = (question) => {

        if (!question.options)

            return []

        try {

            if (Array.isArray(question.options)) {

                return question.options.filter(opt => opt !== null && opt !== undefined)

            }

            if (typeof question.options === 'string') {

                return parseOptions(question.options)

            }

            return []

        } catch (error) {

            console.error('Error parsing question options:', error)

            return []

        }

    }

    const getQuestionSettings = (question) => {

        return {

            min: 1,

            max: 5,

            minLabel: 'Poor',

            maxLabel: 'Excellent',

            allowOther: false

        }

    }

    const renderQuestionPreview = (question) => {

        const QuestionIcon = questionTypeIcons[question.type] || FileText

        const options = getQuestionOptions(question)

        const settings = getQuestionSettings(question)

        switch (question.type) {
            case 'text':
                return (
                    <Input
                        placeholder={question.helpText || "Text response..."}
                        variant="bordered"
                        isDisabled
                    />
                )
            case 'textarea':
                return (
                    <Textarea
                        placeholder={question.helpText || "Long answer..."}
                        variant="bordered"
                        isDisabled
                        minRows={3}
                    />
                )
            case 'dropdown':
                return (
                    <Select
                        placeholder="Select an option"
                        variant="bordered"
                        isDisabled
                    >
                        {options.map((option, index) => (
                            <SelectItem key={index} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </Select>
                )
            case 'radio':
                return (
                    <div className="space-y-3">
                        <RadioGroup isDisabled className="flex flex-col gap-3">
                            {options.map((option, index) => (
                                <Radio key={index} value={option} className="items-start">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900">{option}</span>
                                    </div>
                                </Radio>
                            ))}
                        </RadioGroup>
                    </div>
                )
            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <Checkbox key={index} isDisabled className="items-start">
                                <div className="flex flex-col">
                                    <span className="text-gray-900">{option}</span>
                                </div>
                            </Checkbox>
                        ))}
                    </div>
                )
            case 'date':
                return (
                    <Input type="date" variant="bordered" isDisabled />
                )
            case 'rating':
                const { min = 1, max = 5, minLabel = "Minimum", maxLabel = "Maximum" } = settings
                return (
                    <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-6 rounded-xl border border-cyan-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-cyan-700">{minLabel}</span>
                            <div className="flex gap-2">
                                {Array.from({ length: max - min + 1 }, (_, i) => {
                                    const value = i + min
                                    return (
                                        <Button
                                            key={i}
                                            variant="flat"
                                            color="primary"
                                            size="lg"
                                            className="min-w-12 h-12 font-bold"
                                            isDisabled
                                        >
                                            {value}
                                        </Button>
                                    )
                                })}
                            </div>
                            <span className="text-sm font-semibold text-cyan-700">{maxLabel}</span>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="text-gray-500 italic">
                        Question type not supported: {question.type}
                    </div>
                )
        }
    }

    const viewDimensionStats = (dimension) => {

        setSelectedDimension(dimension)

        onOpen()

    }

    if (!processedForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <FileText className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
                    <p className="text-gray-600 mb-6">Please go back and select a form to view.</p>
                    <Button color="primary" onPress={() => navigate(-1)} className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold">
                        Back to Forms
                    </Button>
                </div>
            </div>
        )
    }

    const StatusIcon = statusIconMap[processedForm.status]

    const dimensionsWithQuestions = getDimensionsWithQuestions()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Header */}
            <div className="mx-auto">
                <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26">
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 max-w-5xl mx-auto'>
                        <div className="flex items-center gap-2">
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={() => navigate(-1, { replace: true })}
                                className="bg-white shadow border border-gray-200 hover:shadow transition-all duration-200"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2">

                                <div>
                                    <h1 className="text-2xl max-w-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">{processedForm.title}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building className="h-4 w-4 text-gray-500" />
                                        <p className="text-gray-600">{currentCenterName}</p>
                                        <Chip color="primary" variant="flat" size="sm">
                                            {totalMembers} members
                                        </Chip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Center Stats Cards - 4 cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mx-auto max-w-5xl -mt-14 mb-8">
                    {/* Card 1: Center Responses */}
                    <Card className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {centerStats.totalResponses}
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">Unit Responses</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-gray-500">
                                    <span className="font-semibold">{processedForm.submissionsCount || 0}</span> of <span className="font-semibold">{totalMembers}</span> members responded
                                </p>
                            </div>
                        </CardBody>
                    </Card>


                    {/* Card 3: Total Questions */}
                    <Card className="bg-gradient-to-br from-white to-purple-50/50 border border-purple-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {processedForm.totalQuestions || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">Total Questions</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-gray-500">
                                    <span className="font-semibold">{processedForm.dimensions?.length || 0}</span> dimensions
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Card 4: Publication Status */}
                    <Card className="bg-gradient-to-br from-white to-cyan-50/50 border border-cyan-200 shadow rounded-2xl hover:shadow transition-all duration-300">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-cyan-600" />
                                    <div>
                                        <p className="font-semibold text-cyan-900">Publication Status</p>
                                    </div>
                                </div>
                                <Chip
                                    color={processedForm.isPublished ? "success" : "warning"}
                                    variant="flat"
                                >
                                    {processedForm.isPublished ? "Published" : "Not Published"}
                                </Chip>
                            </div>

                            {processedForm.isPublished ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Start:</span>
                                        <span className="font-medium">
                                            {processedForm.publishStartDate ? new Date(processedForm.publishStartDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">End:</span>
                                        <span className="font-medium">
                                            {processedForm.publishEndDate ? new Date(processedForm.publishEndDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-amber-600 mt-2">
                                    Publish to collect responses
                                </p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mx-auto max-w-5xl">
                    {/* Form Preview */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-0 shadow rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Eye className="h-6 w-6" />
                                    Form Preview
                                </h2>
                                <p className="text-white/90 mt-2">Preview how respondents see this form</p>
                            </div>
                            <CardBody className="p-8">
                                <div className="space-y-8">
                                    {dimensionsWithQuestions.length > 0 ? (
                                        dimensionsWithQuestions.map((dimension, dimensionIndex) => {
                                            const dimensionAvg = centerStats.dimensionAverages?.[dimension.title] || 0

                                            return (
                                                <div key={dimension.id || dimensionIndex} className="space-y-6">
                                                    {/* Dimension Header */}
                                                    <Card
                                                        className="bg-gradient-to-r from-cyan-50 to-emerald-50 border-cyan-200 shadow hover:shadow-md transition-all duration-300 cursor-pointer"
                                                        onClick={() => viewDimensionStats(dimension)}
                                                    >
                                                        <CardBody className="p-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-cyan-100 rounded-lg">
                                                                        <FolderOpen className="h-5 w-5 text-cyan-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-xl font-bold text-cyan-900">
                                                                            {dimension.title}
                                                                        </h3>
                                                                        {dimension.description && (
                                                                            <p className="text-cyan-700 mt-1">
                                                                                {dimension.description}
                                                                            </p>
                                                                        )}
                                                                        {dimension.emotion && (
                                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full capitalize mt-2">
                                                                                {dimension.emotion}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>

                                                    {/* Questions in Dimension */}
                                                    <div className="space-y-6">
                                                        {dimension.questions?.map((question, questionIndex) => {
                                                            const QuestionIcon = questionTypeIcons[question.type] || FileText
                                                            const options = getQuestionOptions(question)

                                                            return (
                                                                <div key={question.id || questionIndex} className="border border-gray-200 rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div className="flex items-start gap-3 flex-1">
                                                                            <div className="p-2 bg-cyan-100 rounded-lg mt-1">
                                                                                <QuestionIcon className="h-4 w-4 text-cyan-600" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                                                    {dimensionIndex + 1}.{questionIndex + 1}. {question.text}
                                                                                </h3>
                                                                                {question.description && (
                                                                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                                                                        {question.description}
                                                                                    </p>
                                                                                )}
                                                                                {question.helpText && (
                                                                                    <p className="text-sm text-cyan-600 mt-1 italic">
                                                                                        {question.helpText}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            {question.isRequired && (
                                                                                <Chip size="sm" color="danger" variant="flat">
                                                                                    Required
                                                                                </Chip>
                                                                            )}

                                                                        </div>
                                                                    </div>

                                                                    {renderQuestionPreview(question)}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="p-4 bg-gray-100 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                                <FileText className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No questions found
                                            </h3>
                                            <p className="text-gray-600">
                                                This form doesn't have any questions.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar com Responses e Summary */}
                    <div className="lg:col-span-1">
                        {/* Center Responses Panel */}
                        <Card className="bg-white border-0 shadow rounded-2xl overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Building className="h-6 w-6" />
                                    Center Responses
                                </h2>
                                <p className="text-white/90 mt-2">Responses from your center members</p>
                            </div>
                            <CardBody className="p-6">
                                <div className="space-y-4">
                                    {processedForm.submissions && processedForm.submissions.length > 0 ? (
                                        processedForm.submissions.slice(0, 5).map((submission, index) => (
                                            <div key={submission.id || index} className="border-b border-gray-200 bg-white">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-start flex-col">
                                                        <p className="font-semibold text-gray-900">Member #{submission.user.id}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString().split(',')[0] : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Time: {submission.timeSpent || 'N/A'} min
                                                        </p>
                                                    </div>
                                                    <small className='w-14 h-14 rounded-full flex flex-col justify-center items-center font-bold bg-gradient-to-br from-cyan-500 to-emerald-500 text-white'>
                                                        {submission.point || 0} pts
                                                    </small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="p-4 bg-gray-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-600 font-medium">No responses yet</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {processedForm.isPublished
                                                    ? "Share the form with your center members"
                                                    : "Publish the form to collect responses"}
                                            </p>
                                        </div>
                                    )}

                                    {processedForm.submissions && processedForm.submissions.length > 5 && (
                                        <div className="text-center pt-4">
                                            <Link showAnchorIcon color="primary" onClick={() => navigate('/edi/user/coordinator/form/responses/views', { state: { form: form } })} className="text-sm cursor-pointer">
                                                + {processedForm.submissions.length - 5} more responses
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Quick Stats Summary */}
                        <Card className="mt-2 bg-white border-0 shadow rounded-2xl">
                            <CardBody className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Form Status</span>
                                        <div className="flex items-center gap-2">
                                            {StatusIcon && <StatusIcon className="h-4 w-4" />}
                                            <Chip
                                                size="sm"
                                                color={processedForm.status === 'active' ? "success" : "warning"}
                                                variant="flat"
                                            >
                                                {processedForm.status}
                                            </Chip>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Dimensions</span>
                                        <span className="font-medium">
                                            {processedForm.dimensions?.length || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Created</span>
                                        <span className="font-medium">
                                            {processedForm.createdAt ? new Date(processedForm.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Last Updated</span>
                                        <span className="font-medium">
                                            {processedForm.updatedAt ? new Date(processedForm.updatedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Members Pending</span>
                                        <span className="font-medium text-amber-600">
                                            {centerStats.pendingMembers}
                                        </span>
                                    </div>
                                </div>

                                {
                                    /**
                                     *   {centerStats.pendingMembers > 0 && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm text-amber-800 font-medium">
                                                {centerStats.pendingMembers} members haven't responded yet
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="warning"
                                                className="mt-2 w-full"
                                                startContent={<Share2 className="h-3 w-3" />}
                                            >
                                                Send Reminder
                                            </Button>
                                        </div>
                                    )}
                                     */
                                }
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dimension Stats Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6">
                                <h2 className="text-xl font-bold text-white">
                                    {selectedDimension?.title} - Dimension Details
                                </h2>
                                <p className="text-white/90 text-sm mt-1">
                                    {currentCenterName}
                                </p>
                            </div>
                            <div className="p-6">
                                {selectedDimension && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-cyan-50 p-4 rounded-lg">
                                                <p className="text-sm text-cyan-700 font-medium">Questions</p>
                                                <p className="text-3xl font-bold text-cyan-900 mt-2">
                                                    {selectedDimension.questions?.length || 0}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-lg">
                                                <p className="text-sm text-emerald-700 font-medium">Emotion Type</p>
                                                <p className="text-3xl font-bold text-emerald-900 mt-2 capitalize">
                                                    {selectedDimension.emotion || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedDimension.description && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                                <p className="text-gray-700">{selectedDimension.description}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Questions Preview</h4>
                                            <div className="space-y-2">
                                                {selectedDimension.questions?.slice(0, 3).map((question, index) => (
                                                    <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                                        {index + 1}. {question.text}
                                                        <span className="ml-2 text-xs text-gray-400 capitalize">
                                                            ({question.type})
                                                        </span>
                                                    </div>
                                                ))}
                                                {selectedDimension.questions && selectedDimension.questions.length > 3 && (
                                                    <p className="text-sm text-gray-500 text-center">
                                                        + {selectedDimension.questions.length - 3} more questions
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    className="font-semibold"
                                >
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default FormViewCollaborator