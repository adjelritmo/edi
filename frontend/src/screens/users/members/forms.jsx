import React, { useState, useContext, useEffect } from 'react'

import { Card, CardBody, Button, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Badge, Tabs, Tab } from "@heroui/react"

import { FileText, CheckCircle, Clock, Eye, BarChart3, Calendar, Users, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'

import { useLoaderData, useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'

import { AppContext } from '../../../contexts/app_context'




const Forms = () => {

    const { user } = useContext(AppContext)

    const publishedFormsData = useLoaderData()

    const navigate = useNavigate()

    const [selectedForm, setSelectedForm] = useState(null)

    const [showResponseModal, setShowResponseModal] = useState(false)

    const [activeTab, setActiveTab] = useState('all')

    const [forms, setForms] = useState([])

    const [isLoading, setIsLoading] = useState(true)

    const [drafts, setDrafts] = useState({}) // Armazenar informações de rascunho

    // Carregar rascunhos do localStorage
    useEffect(() => {

        const loadDrafts = () => {

            try {

                const draftsData = {}

                for (let i = 0; i < localStorage.length; i++) {

                    const key = localStorage.key(i)

                    if (key.startsWith('form_draft_')) {

                        try {

                            const draft = JSON.parse(localStorage.getItem(key))

                            draftsData[draft.formId] = {

                                hasDraft: true,

                                timestamp: draft.timestamp,

                                responses: draft.responses,

                                currentDimensionIndex: draft.currentDimensionIndex,

                                currentQuestionIndex: draft.currentQuestionIndex

                            }

                        } catch (e) {

                            console.error('Error parsing draft:', e)

                        }

                    }

                }

                setDrafts(draftsData)

            } catch (error) {

                console.error('Error loading drafts:', error)

            }

        }

        loadDrafts()

    }, [])

    useEffect(() => {

        setIsLoading(true)

        if (Array.isArray(publishedFormsData)) {

            const transformedForms = publishedFormsData.map(publishedForm => {

                if (!publishedForm || !publishedForm.form) {

                    console.warn('Invalid form data:', publishedForm)

                    return null

                }

                const formData = publishedForm.form

                // Verificar se há rascunho para este formulário

                const hasDraft = drafts[formData.id]?.hasDraft || false

                const draftInfo = drafts[formData.id]

                return {
                    id: formData.id,

                    title: formData.title || 'Untitled Form',

                    description: formData.description || '',

                    status: formData.status || 'active',

                    createdAt: formData.createdAt,

                    updatedAt: formData.updatedAt,

                    publicationId: publishedForm.id,

                    startDate: publishedForm?.startDate,

                    endDate: publishedForm?.endDate,

                    hasDraft, // Adicionar informação de rascunho

                    draftInfo, // Informações detalhadas do rascunho


                    creator: formData.creator ? {

                        id: formData.creator.id,

                        name: `${formData.creator.firstName || ''} ${formData.creator.surname || ''}`.trim() || 'Unknown',

                        firstName: formData.creator.firstName,

                        surname: formData.creator.surname

                    } : null,

                    dimensions: formData.dimensions || [],

                    questions: formData.dimensions?.flatMap(dim =>

                        dim.questions?.map(q => ({

                            ...q,

                            dimensionId: dim.id

                        })) || []

                    ) || [],


                    submissions: formData.submissions || [],

                    _count: {
                        questions: formData.dimensions?.reduce((total, dim) => total + (dim.questions?.length || 0), 0) || 0,

                        dimensions: formData.dimensions?.length || 0,

                        responses: formData.submissions?.length || 0

                    }
                }
            }).filter(form => form !== null) // Remover forms nulos

            const sortedForms = transformedForms.sort((a, b) => {
                // Primeiro, mostrar formulários com rascunho (incompletos)
                if (a.hasDraft && !b.hasDraft) return -1

                if (!a.hasDraft && b.hasDraft) return 1


                const userStatusA = getFormUserStatus(a, user)

                const userStatusB = getFormUserStatus(b, user)

                if (userStatusA.canRespond && !userStatusB.canRespond) return -1

                if (!userStatusA.canRespond && userStatusB.canRespond) return 1


                if (userStatusA.status === 'completed' && userStatusB.status !== 'completed') return -1

                if (userStatusA.status !== 'completed' && userStatusB.status === 'completed') return 1

                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)

            })

            setForms(sortedForms)

        }

        setIsLoading(false)

    }, [publishedFormsData, user, drafts]) // Adicionar drafts como dependência

    const currentUser = user

    const isFormActive = (form) => {

        if (!form) return false

        const now = new Date()

        const startDate = form?.startDate ? new Date(form.startDate) : null

        const endDate = form?.endDate ? new Date(form.endDate) : null


        if (!startDate || !endDate) return false


        const isWithinPeriod = now >= startDate && now <= endDate

        return form.status === 'active' && isWithinPeriod
    }


    const getFormUserStatus = (form, userParam = currentUser) => {
        // Verificar se form é null ou undefined
        if (!form) {
            return {
                status: 'unknown',
                label: 'Unknown',
                color: 'default',
                icon: FileText,
                canRespond: false,
                canView: false
            }
        }

        if (!userParam) {
            return {
                status: 'unknown',
                label: 'Loading...',
                color: 'default',
                icon: FileText,
                canRespond: false,
                canView: false
            }
        }

        // Verificar primeiro se há rascunho
        if (form.hasDraft) {
            return {
                status: 'incomplete',
                label: 'Incomplete',
                color: 'warning',
                icon: AlertCircle,
                draftInfo: form.draftInfo,
                canRespond: true,
                canView: false,
                isDraft: true
            }
        }

        const userSubmission = form?.submissions?.find(submission => submission.userId === userParam.id)

        if (userSubmission) {
            return {
                status: 'completed',
                label: 'Answered',
                color: 'success',
                icon: CheckCircle,
                submission: userSubmission,
                canRespond: false,
                canView: true
            }
        }

        if (isFormActive(form)) {
            return {
                status: 'available',
                label: 'Available',
                color: 'primary',
                icon: FileText,
                canRespond: true,
                canView: false
            }
        }

        const now = new Date()
        const endDate = form?.endDate ? new Date(form.endDate) : null
        if (endDate && now > endDate) {
            return {
                status: 'expired',
                label: 'Expired',
                color: 'warning',
                icon: Clock,
                canRespond: false,
                canView: false
            }
        }

        const startDate = form?.startDate ? new Date(form.startDate) : null
        if (startDate && now < startDate) {
            return {
                status: 'upcoming',
                label: 'Upcoming',
                color: 'secondary',
                icon: Calendar,
                canRespond: false,
                canView: false
            }
        }

        if (form?.status === 'paused') {
            return {
                status: 'paused',
                label: 'Paused',
                color: 'warning',
                icon: Clock,
                canRespond: false,
                canView: false
            }
        }

        return {
            status: 'draft',
            label: 'Draft',
            color: 'default',
            icon: FileText,
            canRespond: false,
            canView: false
        }
    }

    const getFilteredForms = () => {
        const validForms = forms.filter(form => form !== null)

        switch (activeTab) {
            case 'active':
                return validForms.filter(form => isFormActive(form))
            case 'completed':
                return validForms.filter(form => {
                    const status = getFormUserStatus(form)
                    return status.status === 'completed'
                })
            case 'incomplete':
                return validForms.filter(form => form.hasDraft)
            case 'upcoming':
                return validForms.filter(form => {
                    const now = new Date()
                    const startDate = form?.startDate ? new Date(form.startDate) : null
                    return form?.status === 'active' && startDate && now < startDate
                })
            case 'expired':
                return validForms.filter(form => {
                    const now = new Date()
                    const endDate = form?.endDate ? new Date(form.endDate) : null
                    return form?.status === 'active' && endDate && now > endDate
                })
            case 'all':
                return validForms
            default:
                return validForms.filter(form => form?.status === activeTab)
        }
    }

    const getUserStats = () => {
        const validForms = forms.filter(form => form !== null)
        const activeForms = validForms.filter(form => isFormActive(form))
        const completedForms = validForms.filter(form => {
            const status = getFormUserStatus(form)
            return status.status === 'completed'
        })
        const incompleteForms = validForms.filter(form => form.hasDraft)
        const upcomingForms = validForms.filter(form => {
            const now = new Date()
            const startDate = form?.startDate ? new Date(form.startDate) : null
            return form?.status === 'active' && startDate && now < startDate
        })

        const totalActiveForms = activeForms.length
        const totalCompletedForms = completedForms.length
        const totalIncompleteForms = incompleteForms.length
        const completionRate = totalActiveForms > 0 ? Math.round((totalCompletedForms / totalActiveForms) * 100) : 0

        return {
            totalForms: validForms.length,
            activeForms: totalActiveForms,
            completedForms: totalCompletedForms,
            incompleteForms: totalIncompleteForms,
            upcomingForms: upcomingForms.length,
            completionRate,
            pendingForms: totalActiveForms - totalCompletedForms
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch (error) {
            return 'Invalid date'
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not specified'
        try {
            return new Date(dateString).toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Invalid date'
        }
    }

    const FormCard = ({ form }) => {

        if (!form)
            return null

        const userStatus = getFormUserStatus(form)

        const StatusIcon = userStatus.icon

        const getPublicationInfo = () => {

            const now = new Date()

            const startDate = form?.startDate ? new Date(form.startDate) : null

            const endDate = form?.endDate ? new Date(form.endDate) : null

            if (!startDate || !endDate) {
                return {
                    text: 'No dates specified',
                    color: 'bg-gray-100 text-gray-800',
                    icon: Calendar
                }
            }

            if (now < startDate) {
                return {
                    text: `Starts: ${formatDate(form.startDate)}`,
                    color: 'bg-blue-100 text-blue-800',
                    icon: Calendar
                }
            } else if (now > endDate) {
                return {
                    text: `Ended: ${formatDate(form.endDate)}`,
                    color: 'bg-gray-100 text-gray-800',
                    icon: Clock
                }
            } else {
                const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
                return {
                    text: `Ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
                    color: 'bg-green-100 text-green-800',
                    icon: Clock
                }
            }
        }

        const publicationInfo = getPublicationInfo()

        const getButtonConfig = () => {
            if (userStatus.isDraft) {
                return {
                    text: 'Continue Draft',
                    color: 'warning',
                    className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow hover:shadow-xl',
                    action: () => navigate('/edi/user/participant/responses-forms', {
                        state: {
                            form,
                            publicationId: form.publicationId,
                            hasDraft: true,
                            draftInfo: userStatus.draftInfo
                        }
                    })
                }
            } else if (userStatus.canRespond) {
                return {
                    text: 'Answer Now',
                    color: 'primary',
                    className: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:shadow-xl',
                    action: () => navigate('/edi/user/participant/responses-forms', {
                        state: {
                            form,
                            publicationId: form.publicationId
                        }
                    })
                }
            } else if (userStatus.canView) {
                return {
                    text: 'View My Response',
                    color: 'success',
                    className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:shadow-xl',
                    action: () => navigate('/edi/user/participant/form-response', {
                        state: {
                            form,
                            preview: true,
                            submission: userStatus.submission
                        }
                    })
                }
            } else {
                return {
                    text: 'View Details',
                    color: 'default',
                    className: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
                    action: () => {
                        setSelectedForm(form)
                        setShowResponseModal(true)
                    }
                }
            }
        }

        const buttonConfig = getButtonConfig()

        const stats = {
            questionsCount: form._count?.questions || 0,
            dimensionsCount: form._count?.dimensions || 0,
            responsesCount: form._count?.responses || 0
        }

        // Calcular progresso do rascunho
        const getDraftProgress = () => {
            if (!userStatus.isDraft || !form.questions || form.questions.length === 0) return 0

            const totalQuestions = form.questions.length
            const answeredQuestions = Object.keys(userStatus.draftInfo?.responses || {}).length
            return Math.round((answeredQuestions / totalQuestions) * 100)
        }

        const draftProgress = getDraftProgress()

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -4 }} className="relative">
                <Card className={`border-0 rounded-2xl overflow-hidden relative group bg-gradient-to-br from-white to-gray-50/50 shadow hover:shadow-xl transition-all duration-300 ${userStatus.status === 'completed' ? 'ring-2 ring-green-200' : userStatus.status === 'incomplete' ? 'ring-2 ring-amber-200' : userStatus.status === 'available' ? 'ring-2 ring-blue-200' : ''}`}>

                    {userStatus.isDraft && (
                        <div className="absolute top-2 left-2 z-10">
                            <Chip
                                color="warning"
                                variant="solid"
                                size="sm"
                                className="text-white border-0 shadow"
                                startContent={<AlertCircle className="h-3 w-3" />}
                            >
                                Draft
                            </Chip>
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-emerald-500 p-6 relative">
                        <div className="absolute top-0 right-4">
                            <Chip
                                color={userStatus.color}
                                variant="solid"
                                size="sm"
                                className="text-white border-0 shadow"
                                startContent={<StatusIcon className="h-3 w-3" />}
                            >
                                {userStatus.label}
                            </Chip>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                                <img
                                    className="w-12 h-12 border-white border-2 rounded-full"
                                    src="/edi/equicenter.png"
                                    alt="Equicenter logo"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                            <div className="text-white flex-1">
                                <h3 className="text-xl font-bold mb-2 drop-shadow line-clamp-2">
                                    {form.title || 'Untitled Form'}
                                </h3>
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                                    {form.description || 'No description'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardBody className="p-6">
                        <div className="mb-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${publicationInfo.color}`}>
                                <publicationInfo.icon className="h-3 w-3" />
                                {publicationInfo.text}
                            </div>
                        </div>

                        {/* Barra de progresso para rascunhos */}
                        {userStatus.isDraft && draftProgress > 0 && (
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{draftProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${draftProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Last saved: {formatDateTime(userStatus.draftInfo?.timestamp)}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">Questions</div>
                                    <div className="font-semibold text-gray-900">{stats.questionsCount}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">Dimensions</div>
                                    <div className="font-semibold text-gray-900">{stats.dimensionsCount}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">Created</div>
                                    <div className="font-semibold text-gray-900">{formatDate(form.createdAt)}</div>
                                </div>
                            </div>
                        </div>

                        {userStatus.status === 'completed' && userStatus.submission && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="font-medium">You have submitted this form</span>
                                    </div>
                                    <span className="text-green-600 text-xs">
                                        {formatDate(userStatus.submission.submittedAt)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {userStatus.isDraft && (
                            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 text-amber-700 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">You have an incomplete draft</span>
                                </div>
                            </div>
                        )}

                        <Button
                            onPress={buttonConfig.action}
                            className={`w-full font-semibold py-6 rounded-xl transition-all duration-200 hover:scale-105 ${buttonConfig.className}`}
                            endContent={<ArrowRight className="h-4 w-4" />}
                        >
                            {buttonConfig.text}
                        </Button>

                        {form.creator && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500">
                                    Created by <span className="font-medium text-gray-700">{form.creator.name}</span>
                                </p>
                            </div>
                        )}
                    </CardBody>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
            </motion.div>
        )
    }

    const stats = getUserStats()

    const filteredForms = getFilteredForms()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white to-blue-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <Spinner size="lg" className="mx-auto" />
                        <p className="text-gray-600 mt-4">Loading forms...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white to-blue-50">
            <div className="">
                <motion.div className="text-center mb-2 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-24 pb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="flex items-center justify-center gap-2">
                        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="p-4 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">EDI+ Survey</h1>
                            </div>
                            <p className="text-gray-600 text-lg mt-2">
                                {/*Manage and respond to forms available to you*/}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {forms.length > 0 && (
                    <motion.div className="mb-8 -mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                        <div className="flex overflow-x-auto pb-4 -mx-2 px-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-2 sm:overflow-visible sm:mx-0 sm:px-0">
                            <Card className="border-0 shadow bg-white min-w-[280px] sm:min-w-0 flex-shrink-0 mx-1 sm:mx-0">
                                <CardBody className="p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Available Survey</p>
                                            <p className="text-2xl font-bold text-blue-600">{stats.totalForms}</p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="border-0 shadow bg-white min-w-[280px] sm:min-w-0 flex-shrink-0 mx-1 sm:mx-0">
                                <CardBody className="p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Answered Survey</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.completedForms}</p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-xl">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="border-0 shadow bg-white min-w-[280px] sm:min-w-0 flex-shrink-0 mx-1 sm:mx-0">
                                <CardBody className="p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Incomplete Survey</p>
                                            <p className="text-2xl font-bold text-amber-600">{stats.incompleteForms}</p>
                                        </div>
                                        <div className="p-3 bg-amber-100 rounded-xl">
                                            <AlertCircle className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </motion.div>
                )}
                <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>

                    {forms.length > 0 && (
                        <motion.div className=''
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Tabs
                                aria-label="Form options"
                                selectedKey={activeTab}
                                onSelectionChange={setActiveTab}
                                className="mb-4"
                                variant="bordered"
                            >
                                <Tab
                                    key="all"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            <span className="hidden sm:inline">All</span>
                                            <Badge color="default" variant="flat" className="ml-1">
                                                {stats.totalForms}
                                            </Badge>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="active"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="hidden sm:inline">Available</span>
                                            <Badge color="primary" variant="flat" className="ml-1">
                                                {stats.activeForms}
                                            </Badge>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="completed"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="hidden sm:inline">Answered</span>
                                            <Badge color="success" variant="flat" className="ml-1">
                                                {stats.completedForms}
                                            </Badge>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="incomplete"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="hidden sm:inline">Incomplete</span>
                                            <Badge color="warning" variant="flat" className="ml-1">
                                                {stats.incompleteForms}
                                            </Badge>
                                        </div>
                                    }
                                />

                            </Tabs>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
                        {forms.length === 0 ? (
                            <motion.div
                                className="text-center py-12"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No forms available
                                </h3>
                                <p className="text-gray-600">There are no forms assigned to you at the moment.</p>
                            </motion.div>
                        ) : filteredForms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                                {filteredForms.map(form => (
                                    <FormCard key={form.id} form={form} />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="text-center py-12"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {activeTab === 'active' ? 'No active forms available' :
                                        activeTab === 'incomplete' ? 'No incomplete forms' :
                                            activeTab === 'completed' ? 'No forms answered' :
                                                activeTab === 'upcoming' ? 'No upcoming forms' :
                                                    'No forms found in this category'}
                                </h3>
                                <p className="text-gray-600">
                                    {activeTab === 'active' ? 'All active forms have been answered or are awaiting release.' :
                                        activeTab === 'incomplete' ? 'You have no incomplete drafts.' :
                                            activeTab === 'completed' ? 'You have not answered any forms yet.' :
                                                activeTab === 'upcoming' ? 'There are no upcoming forms scheduled.' :
                                                    'There are no forms to display in this category.'}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <Modal classNames={{ closeButton: 'cursor-pointer' }} isOpen={showResponseModal} onClose={() => setShowResponseModal(false)} size="lg">
                    <ModalContent>
                        <ModalHeader>Form Details</ModalHeader>
                        <ModalBody>
                            {selectedForm && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{selectedForm.title || 'Untitled Form'}</h3>
                                        <p className="text-gray-600 mt-2">{selectedForm.description || 'No description'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-medium capitalize">{getFormUserStatus(selectedForm).label}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Created</p>
                                            <p className="font-medium">{formatDate(selectedForm.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Questions</p>
                                            <p className="font-medium">{selectedForm._count?.questions || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Dimensions</p>
                                            <p className="font-medium">{selectedForm._count?.dimensions || 0}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm text-gray-500 mb-2">Publication Period</p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Starts</p>
                                                <p className="font-medium">{formatDate(selectedForm?.startDate)}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Ends</p>
                                                <p className="font-medium">{formatDate(selectedForm?.endDate)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedForm.creator && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500">Created by</p>
                                            <p className="font-medium">{selectedForm.creator.name}</p>
                                        </div>
                                    )}

                                    {selectedForm.hasDraft && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500 mb-2">Draft Information</p>
                                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                <p className="text-sm text-amber-700">
                                                    You have an incomplete draft. Last saved: {formatDateTime(selectedForm.draftInfo?.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                className='bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                                variant="light"
                                onPress={() => {
                                    setShowResponseModal(false)
                                    const status = getFormUserStatus(selectedForm)
                                    if (status.canRespond) {
                                        navigate('/edi/user/participant/responses-forms', { state: { form: selectedForm, publicationId: selectedForm.publicationId, hasDraft: selectedForm.hasDraft, draftInfo: selectedForm.draftInfo } })
                                    }
                                }}
                            >
                                {getFormUserStatus(selectedForm)?.isDraft ? 'Continue Draft' : getFormUserStatus(selectedForm)?.canRespond ? 'Answer Now' : 'Close'}
                            </Button>
                            <Button onPress={() => setShowResponseModal(false)} variant="light" color='danger'>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    )
}

export default Forms