import { useContext, useMemo, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Chip, Pagination, Card, CardBody, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tooltip, Tabs, Tab, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react"
import { Search, Eye, Users as UsersIcon, CheckCircle, Clock, BarChart3, FileText, Mail, AlertCircle, Download as DownloadIcon, Clock as ClockIcon, CheckSquare, Type, MessageSquare, List, Star, ArrowLeft, Building, View, HelpCircle, TrendingUp, ListCheck, MoreVertical } from "lucide-react"
import { AppContext } from "../../../contexts/app_context"
import { useEffect } from "react"
import getMediaPerQuestionAdmin from "../../../functions/admin/forms/responses/getMediaPerQuestion"

const FormResponsesAdminView = () => {

    const [filterValue, setFilterValue] = useState("")
    const [selectedKeys, setSelectedKeys] = useState(new Set([]))
    const [statusFilter, setStatusFilter] = useState("all")
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [sortDescriptor, setSortDescriptor] = useState({ column: "id", direction: "ascending" })
    const [page, setPage] = useState(1)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [activeTab, setActiveTab] = useState("responses")
    const [questionAverages, setQuestionAverages] = useState([])
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useContext(AppContext)

    const form = location?.state?.form || null
    const submissions = form?.submissions || []
    const totalMembers = location?.state?.totalMembers || 0
    const currentCenterName = user?.centerName || "Your Center"

    const statusOptions = [
        { name: "All", uid: "all" },
        { name: "Completed", uid: "completed" },
        { name: "In Progress", uid: "in_progress" }
    ]

    const statusColorMap = {
        completed: "success",
        in_progress: "warning",
        draft: "default"
    }

    const statusIconMap = {
        completed: CheckCircle,
        in_progress: Clock,
        draft: FileText
    }

    const columns = [
        { name: "MEMBER ID", uid: "id", sortable: true },
        { name: "SCORE", uid: "score", sortable: true },
        { name: "DURATION", uid: "duration" },
        { name: "ACTIONS", uid: "actions" }
    ]

    // Colunas para a tabela de médias por questão - ORDEM: [id, question, media, max, min]
    const questionColumns = [
        { name: "ID", uid: "id", sortable: true },
        { name: "QUESTION", uid: "questionText", sortable: true },
        { name: "AVERAGE", uid: "media", sortable: true },
        { name: "MAX POINT", uid: "max", sortable: true },
        { name: "MIN POINT", uid: "min", sortable: true }
    ]

    const hasSearchFilter = Boolean(filterValue)

    const filteredItems = useMemo(() => {
        let filteredSubmissions = [...submissions]
        if (hasSearchFilter) {
            filteredSubmissions = filteredSubmissions.filter((submission) =>
                submission.id?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
                submission.point?.toString().includes(filterValue)
            )
        }
        if (statusFilter !== "all") {
            filteredSubmissions = filteredSubmissions.filter((submission) => submission.status === statusFilter)
        }
        return filteredSubmissions
    }, [submissions, filterValue, statusFilter])

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredItems.slice(start, end)
    }, [page, filteredItems, rowsPerPage])

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const column = sortDescriptor.column
            let first, second
            switch (column) {
                case "score":
                    first = a.point || 0
                    second = b.point || 0
                    break
                case "duration":
                    first = parseTimeSpent(a.timeSpent) || 0
                    second = parseTimeSpent(b.timeSpent) || 0
                    break
                case "date":
                    first = a.submittedAt ? new Date(a.submittedAt) : new Date(0)
                    second = b.submittedAt ? new Date(b.submittedAt) : new Date(0)
                    break
                default:
                    first = a[column]
                    second = b[column]
            }
            const cmp = first < second ? -1 : first > second ? 1 : 0
            return sortDescriptor.direction === "descending" ? -cmp : cmp
        })
    }, [sortDescriptor, items])

    // Ordenação para questões
    const sortedQuestions = useMemo(() => {
        return [...questionAverages].sort((a, b) => {
            const column = sortDescriptor.column
            let first, second
            switch (column) {
                case "media":
                    first = a.media || 0
                    second = b.media || 0
                    break
                case "max":
                    first = a.max || 0
                    second = b.max || 0
                    break
                case "min":
                    first = a.min || 0
                    second = b.min || 0
                    break
                case "questionText":
                    first = a.questionText?.toLowerCase() || ""
                    second = b.questionText?.toLowerCase() || ""
                    break
                default:
                    first = a[column]
                    second = b[column]
            }
            const cmp = first < second ? -1 : first > second ? 1 : 0
            return sortDescriptor.direction === "descending" ? -cmp : cmp
        })
    }, [sortDescriptor, questionAverages])

    const parseTimeSpent = useCallback((timeSpent) => {
        if (!timeSpent) return 0
        try {
            if (typeof timeSpent === 'number') {
                return timeSpent
            }
            const cleaned = timeSpent.toString().trim().toLowerCase()
            let minutes = 0
            let seconds = 0
            const minuteMatch = cleaned.match(/(\d+)\s*m/)
            const secondMatch = cleaned.match(/(\d+)\s*s/)
            if (minuteMatch) minutes = parseInt(minuteMatch[1])
            if (secondMatch) seconds = parseInt(secondMatch[1])
            return minutes + (seconds / 60)
        } catch (error) {
            console.error("Error parsing timeSpent:", timeSpent, error)
            return 0
        }
    }, [])

    const formatTimeSpent = useCallback((timeSpent) => {
        const minutes = parseTimeSpent(timeSpent)
        const wholeMinutes = Math.floor(minutes)
        const remainingSeconds = Math.round((minutes - wholeMinutes) * 60)
        if (wholeMinutes === 0) {
            return `${remainingSeconds}s`
        } else if (remainingSeconds === 0) {
            return `${wholeMinutes}m`
        } else {
            return `${wholeMinutes}m ${remainingSeconds}s`
        }
    }, [parseTimeSpent])

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Invalid date'
        }
    }, [])

    const stats = useMemo(() => {
        const totalSubmissions = submissions.length
        const totalPoints = submissions.reduce((sum, s) => sum + (s.point || 0), 0)
        const totalDuration = submissions.reduce((sum, s) => sum + parseTimeSpent(s.timeSpent), 0)
        return {
            totalResponses: totalSubmissions,
            completedResponses: totalSubmissions,
            averageScore: totalSubmissions > 0 ? Math.round(totalPoints / totalSubmissions) : 0,
            completionRate: totalMembers > 0 ? Math.round((totalSubmissions / totalMembers) * 100) : 0,
            averageDuration: totalSubmissions > 0 ? Math.round(totalDuration / totalSubmissions) : 0,
            pendingMembers: Math.max(0, totalMembers - totalSubmissions)
        }
    }, [submissions, totalMembers, parseTimeSpent])

    // Stats para as questões
    const questionStats = useMemo(() => {
        const totalQuestions = questionAverages.length
        const overallAverage = questionAverages.reduce((sum, q) => sum + (q.media || 0), 0) / totalQuestions
        const highestRated = [...questionAverages].sort((a, b) => (b.media || 0) - (a.media || 0))[0]
        const lowestRated = [...questionAverages].sort((a, b) => (a.media || 0) - (b.media || 0))[0]

        return {
            totalQuestions,
            overallAverage: overallAverage.toFixed(2),
            highestRated,
            lowestRated
        }
    }, [questionAverages])

    const renderCell = useCallback((submission, columnKey) => {
        switch (columnKey) {
            case "id":
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <FileText className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{`${submission?.user?.firstName} ${submission?.user?.surname}` || 'N/A'}</span>
                        </div>
                    </div>
                )
            case "score":
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                {submission.point || 0}
                            </span>
                            <span className="text-xs text-gray-500">points</span>
                        </div>
                        <Progress value={(submission.point || 0)} maxValue={100} color="primary" size="sm" className="max-w-32" classNames={{ indicator: "bg-gradient-to-r from-cyan-500 to-emerald-500", track: "bg-gray-200" }} />
                    </div>
                )
            case "date":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatDate(submission.submittedAt)}</span>
                    </div>
                )
            case "duration":
                const duration = parseTimeSpent(submission.timeSpent)
                let durationColor = "success"
                if (duration > 30) durationColor = "warning"
                if (duration > 60) durationColor = "danger"
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <Chip color={durationColor} variant="flat" size="sm">
                                {formatTimeSpent(submission.timeSpent)}
                            </Chip>
                        </div>
                    </div>
                )
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <MoreVertical className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                onAction={(key) => {
                                    if (key === "view") {
                                        setSelectedSubmission(submission)
                                        setIsDetailsModalOpen(true)
                                    } else if (key === "view-user-responses") {
                                        navigate('user', { state: { form: form, user: submission.user } })
                                    }
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View Details
                                </DropdownItem>
                                <DropdownItem key="view-user-responses" startContent={<ListCheck className="h-4 w-4" />}>
                                    View User Responses
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )
            default:
                return submission[columnKey] || '-'
        }
    }, [formatDate, parseTimeSpent, formatTimeSpent])

    // Render cell para tabela de questões
    const renderQuestionCell = useCallback((question, columnKey) => {
        switch (columnKey) {
            case "id":
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <HelpCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-semibold text-gray-900">#{question.id}</span>
                    </div>
                )
            case "questionText":
                return (
                    <div className="max-w-lg">
                        <p className="text-sm text-gray-900 line-clamp-2" title={question.questionText}>
                            {question.questionText}
                        </p>
                    </div>
                )
            case "media":
                const percentage = ((question.media || 0) / 5) * 100
                let color = "success"
                if (percentage < 60) color = "warning"
                if (percentage < 40) color = "danger"

                return (
                    <div className="flex flex-col gap-2 min-w-[100px]">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">
                                {question.media?.toFixed(2) || "0.00"}
                            </span>
                        </div>
                        <Progress
                            value={percentage}
                            maxValue={100}
                            color={color}
                            size="sm"
                            classNames={{
                                indicator: color === "success" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" :
                                    color === "warning" ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                                        "bg-gradient-to-r from-red-500 to-pink-500",
                                track: "bg-gray-200"
                            }}
                        />
                    </div>
                )
            case "max":
                return (
                    <Chip size="sm" variant="flat" color="primary" className="font-semibold mx-auto">
                        {question.max}
                    </Chip>
                )
            case "min":
                return (
                    <Chip size="sm" variant="flat" color="default" className="font-semibold mx-auto">
                        {question.min}
                    </Chip>
                )
            default:
                return question[columnKey] || '-'
        }
    }, [])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center mx-auto min-w-5xl max-w-5xl">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                    classNames={{
                        cursor: "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                    }}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(prev => Math.min(prev + 1, pages))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        )
    }, [selectedKeys, filteredItems.length, page, pages])

    useEffect(() => {

        if (!form?.id) return

        getMediaPerQuestionAdmin(form.id).then(setQuestionAverages)

    }, [form?.id])

    return (
        <div className="min-h-screen">
            <Modal scrollBehavior="outside" className="rounded-2xl" isOpen={isDetailsModalOpen} classNames={{ closeButton: 'cursor-pointer' }} onClose={() => { setIsDetailsModalOpen(false); setSelectedSubmission(null) }}>
                <ModalContent className="rounded-2xl">
                    <>
                        <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white p-6">
                            <div className="flex items-center gap-2">
                                <div>
                                    <h2 className="text-2xl font-bold">Submission Details</h2>
                                    <p className="text-white/90 text-sm">
                                        Response #{selectedSubmission?.id || 'N/A'} • {selectedSubmission?.point || 0} points
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="p-6 space-y-2">
                            {selectedSubmission ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                                        <Card shadow="none" className="bg-gray-50">
                                            <CardBody className="p-4">
                                                <p className="text-sm text-gray-600 text-sm">Total Score</p>
                                                <p className="text-sm font-bold mt-auto">
                                                    {selectedSubmission.point || 0} pts
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card shadow="none" className="bg-gray-50">
                                            <CardBody className="p-4">
                                                <p className="text-sm text-gray-600 text-sm">Completion Time</p>
                                                <p className="text-sm font-bold mt-auto">
                                                    {formatTimeSpent(selectedSubmission.timeSpent)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card shadow="none" className="bg-gray-50">
                                            <CardBody className="p-4">
                                                <p className="text-sm text-gray-600 text-sm">Submitted</p>
                                                <p className="text-sm font-bold mt-auto">
                                                    {formatDate(selectedSubmission.submittedAt)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Submission ID</p>
                                                <p className="font-medium text-gray-900">{selectedSubmission.id}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Form ID</p>
                                                <p className="font-medium text-gray-900">{selectedSubmission.formId || form?.id || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Status</p>
                                                <Chip color="success" variant="flat" size="sm" startContent={<CheckCircle className="h-4 w-4" />}>
                                                    Completed
                                                </Chip>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No submission selected</p>
                                </div>
                            )}
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>

            {/* Header */}
            <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-12">
                <div className="flex justify-between items-center mb-8 mx-auto max-w-5xl">
                    <div className="flex items-center gap-2">
                        <Button isIconOnly variant="light" onPress={() => navigate(-1, { replace: true })} className="bg-white shadow border border-gray-200 hover:shadow transition-all duration-200">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Form Responses</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-medium text-2xl text-cyan-600">{form?.title || 'Form'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO CONDICIONAL POR TAB */}
            <div className="mx-auto min-w-5xl max-w-5xl -mt-10 flex flex-col gap-4">

                {/* TAB RESPONSES */}
                {activeTab === "responses" && (
                    <>
                        {/* Search e Info */}
                        <div className="flex justify-between gap-2 items-end w-full">
                            <Input
                                isClearable
                                size="lg"
                                variant="bordered"
                                className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                                placeholder="Search responses by ID or score..."
                                startContent={<Search className="text-default-300" />}
                                value={filterValue}
                                onClear={() => setFilterValue("")}
                                onValueChange={(value) => {
                                    setFilterValue(value)
                                    setPage(1)
                                }}
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-700">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Building className="h-6 w-6" />
                                    <span className="font-medium">{currentCenterName}</span>
                                </div>
                                {form?.publications?.[0]?.endDate && (
                                    <Chip color="warning" variant="flat">
                                        Due: {formatDate(form.publications[0].endDate).split(',')[0]}
                                    </Chip>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards - Responses */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4 mb-4 w-full">
                            {[
                                {
                                    title: "Total Responses",
                                    value: stats.totalResponses,
                                    icon: UsersIcon,
                                    color: "text-cyan-600",
                                    bgColor: "bg-cyan-100",
                                    subtitle: `of ${totalMembers} members`,
                                    tooltip: `Completion rate: ${stats.completionRate}%`
                                },
                                {
                                    title: "Average Score",
                                    value: stats.averageScore,
                                    icon: BarChart3,
                                    color: "text-emerald-600",
                                    bgColor: "bg-emerald-100",
                                    subtitle: "average points",
                                    tooltip: `Based on ${stats.totalResponses} responses`
                                },
                                {
                                    title: "Completion Rate",
                                    value: `${stats.completionRate}%`,
                                    icon: CheckCircle,
                                    color: "text-green-600",
                                    bgColor: "bg-green-100",
                                    subtitle: "form completion",
                                    tooltip: `${stats.totalResponses}/${totalMembers} members responded`
                                },
                                {
                                    title: "Avg Duration",
                                    value: `${stats.averageDuration}m`,
                                    icon: Clock,
                                    color: "text-blue-600",
                                    bgColor: "bg-blue-100",
                                    subtitle: "per response",
                                    tooltip: "Average time spent on form"
                                },
                                {
                                    title: "Pending",
                                    value: stats.pendingMembers,
                                    icon: AlertCircle,
                                    color: stats.pendingMembers > 0 ? "text-amber-600" : "text-green-600",
                                    bgColor: stats.pendingMembers > 0 ? "bg-amber-100" : "bg-green-100",
                                    subtitle: "members pending",
                                    tooltip: "Members who haven't responded yet"
                                }
                            ].map((stat, index) => (
                                <Tooltip key={index} content={stat.tooltip}>
                                    <Card shadow="none" className="border-none shadow-sm hover:shadow transition-all duration-300">
                                        <CardBody className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                                    {stat.subtitle && (
                                                        <p className="text-xs text-gray-500">{stat.subtitle}</p>
                                                    )}
                                                </div>
                                                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Tooltip>
                            ))}
                        </div>
                    </>
                )}

                {/* TAB QUESTIONS */}
                {activeTab === "questions" && (
                    <>
                        {/* Stats Cards - Questions */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 mb-4 w-full">
                            <Card shadow="none" className="border-none shadow-sm hover:shadow transition-all duration-300">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{questionStats.totalQuestions}</p>
                                            <p className="text-sm text-gray-600">Total Questions</p>
                                        </div>
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <HelpCircle className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card shadow="none" className="border-none shadow-sm hover:shadow transition-all duration-300">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-emerald-600">{questionStats.highestRated?.media?.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">Highest Score</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">Q{questionStats.highestRated?.id}</p>
                                        </div>
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card shadow="none" className="border-none shadow-sm hover:shadow transition-all duration-300">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-amber-600">{questionStats.lowestRated?.media?.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">Lowest Score</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">Q{questionStats.lowestRated?.id}</p>
                                        </div>
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-amber-600 rotate-180" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card shadow="none" className="border-none shadow-sm hover:shadow transition-all duration-300">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-cyan-600">{questionStats.overallAverage}</p>
                                            <p className="text-sm text-gray-600">Global Average</p>
                                            <p className="text-xs text-gray-500">Across all questions</p>
                                        </div>
                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                            <BarChart3 className="h-6 w-6 text-cyan-600" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </>
                )}

                {/* Tabs Navigation - SEMPRE ABAIXO DOS CARDS */}
                <div className="rounded-2xl shadow max-w-sm">
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={setActiveTab}
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-3 w-full",
                            cursor: "w-full bg-gradient-to-r from-cyan-500 to-emerald-500",
                            tab: "max-w-fit px-4 h-10",
                            tabContent: "group-data-[selected=true]:text-cyan-600"
                        }}
                    >
                        <Tab
                            key="responses"
                            title={
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4" />
                                    <span>Responses</span>
                                    <Chip size="sm" variant="flat" color="primary">{submissions.length}</Chip>
                                </div>
                            }
                        />
                        <Tab
                            key="questions"
                            title={
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>Question Averages</span>
                                    <Chip size="sm" variant="flat" color="secondary">{questionAverages.length}</Chip>
                                </div>
                            }
                        />
                    </Tabs>
                </div>

                {/* TABELAS - ABAIXO DAS TABS */}
                {activeTab === "responses" ? (
                    <Table
                        isHeaderSticky
                        aria-label="Responses table"
                        bottomContent={bottomContent}
                        bottomContentPlacement="outside"
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                        classNames={{ wrapper: 'shadow' }}
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "center" : "start"}
                                    allowsSorting={column.sortable}
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                <div className="p-8 text-center">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No responses found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {submissions.length === 0
                                            ? "No submissions have been made for this form yet."
                                            : "Try adjusting your filters"}
                                    </p>
                                    {stats.pendingMembers > 0 && (
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            className="mt-4"
                                            startContent={<Mail className="h-4 w-4" />}
                                            onPress={() => alert(`Sending reminders to ${stats.pendingMembers} pending members`)}
                                        >
                                            Send Reminders ({stats.pendingMembers})
                                        </Button>
                                    )}
                                </div>
                            }
                            items={sortedItems}
                        >
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <Table
                        isHeaderSticky
                        aria-label="Question averages table"
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                        classNames={{ wrapper: 'shadow' }}
                    >
                        <TableHeader columns={questionColumns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align="start"
                                    allowsSorting={column.sortable}
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                <div className="p-8 text-center">
                                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No question data available</p>
                                </div>
                            }
                            items={sortedQuestions}
                        >
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderQuestionCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}

export default FormResponsesAdminView