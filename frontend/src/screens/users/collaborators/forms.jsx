import { useContext, useMemo, useState, useCallback } from "react"

import { useLoaderData, useNavigate } from "react-router-dom"

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Card, CardBody, Badge, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, DatePicker, Select, SelectItem } from "@heroui/react"

import { Search, Eye, Users as UsersIcon, CheckCircle, Clock, MoreVertical, BarChart3, FileText, Building2, UserCheck, UserX, ChevronDown, Download, Mail, Edit, Send, Calendar, CalendarDays, Trash, Trash2, AlertCircle, AlertTriangleIcon, Info, Building } from "lucide-react"

import { AppContext } from "../../../contexts/app_context"

import { today, getLocalTimeZone, parseDate } from "@internationalized/date"

import publishToCenter from "../../../functions/collaborator/forms/publishToCenter"

import editPublishToCenter from "../../../functions/collaborator/forms/editPublishToCenter"

import removePublishToCenter from "../../../functions/collaborator/forms/removerPublish"




const FormsCollaborator = () => {

    const [filterValue, setFilterValue] = useState("")

    const [selectedKeys, setSelectedKeys] = useState(new Set([]))

    const [statusFilter, setStatusFilter] = useState(new Set(['all']))

    const [rowsPerPage, setRowsPerPage] = useState(5)

    const [sortDescriptor, setSortDescriptor] = useState({ column: "title", direction: "ascending" })

    const [page, setPage] = useState(1)

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

    const [isPublishRemoveModalOpen, setIsPublishRemoveModalOpen] = useState(false)

    const [isDeletingPublication, setIsDeletingPublication] = useState(false)

    const [selectedForm, setSelectedForm] = useState(null)

    const [publishDates, setPublishDates] = useState({ startDate: today(getLocalTimeZone()), endDate: null })

    const [isPublishing, setIsPublishing] = useState(false)

    const formDatas = useLoaderData()

    const navigate = useNavigate()

    const { user } = useContext(AppContext)

    const [forms, setForms] = useState(Array.isArray(formDatas?.forms) ? formDatas.forms : [])

    const totalMembers = formDatas?.totalMembers || 0

    const statusOptions = [
        { name: "All", uid: "all" },
        { name: "Active", uid: "active" },
        { name: "Overdue", uid: "overdue" }
    ]

    const statusColorMap = {
        active: "success",
        draft: "warning",
        paused: "danger"
    }

    const statusIconMap = {
        active: CheckCircle,
        draft: Clock,
        paused: AlertCircle
    }

    const columns = [
        { name: "FORM", uid: "title", sortable: true },
        { name: "CREATOR", uid: "creator" },
        { name: "STATUS", uid: "status", sortable: true },
        { name: "PROGRESS", uid: "progress", sortable: true },
        { name: "MEMBERS", uid: "members", sortable: true },
        { name: "DUE DATE", uid: "dueDate", sortable: true },
        { name: "ACTIONS", uid: "actions" }
    ]

    const hasSearchFilter = Boolean(filterValue)

    const filteredItems = useMemo(() => {

        let filteredForms = [...forms]

        if (hasSearchFilter) {

            filteredForms = filteredForms.filter((form) => form.title.toLowerCase().includes(filterValue.toLowerCase()) || form.description.toLowerCase().includes(filterValue.toLowerCase()))

        }

        const currentFilter = Array.from(statusFilter)[0]

        if (currentFilter !== "all") {
            filteredForms = filteredForms.filter((form) => form.status === currentFilter)
        }

        return filteredForms

    }, [forms, filterValue, statusFilter])

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
                case "progress":

                    first = a.submissions ? (a.submissions.length / totalMembers) * 100 : 0

                    second = b.submissions ? (b.submissions.length / totalMembers) * 100 : 0

                    break

                case "members":

                    first = a.submissions ? a.submissions.length : 0

                    second = b.submissions ? b.submissions.length : 0

                    break

                case "dueDate":

                    const aDate = a.publications && a.publications.length > 0 ? new Date(a.publications[0].endDate) : new Date(0)

                    const bDate = b.publications && b.publications.length > 0 ? new Date(b.publications[0].endDate) : new Date(0)

                    first = aDate

                    second = bDate

                    break

                default:

                    first = a[column]

                    second = b[column]
            }

            if (typeof first === 'string' && typeof second === 'string') {

                first = first.toLowerCase()

                second = second.toLowerCase()

            }

            const cmp = first < second ? -1 : first > second ? 1 : 0

            return sortDescriptor.direction === "descending" ? -cmp : cmp

        })

    }, [sortDescriptor, items, totalMembers])

    const stringToCalendarDate = (dateString) => {

        if (!dateString)

            return null

        return parseDate(dateString.split('T')[0])
    }

    const verifyCoordinatorAnswered = useCallback((form) => {

        if (!user?.id || !form.submissions)

            return false

        return form.submissions.some(submission => submission.userId === user.id)

    }, [user])

    const isFormPublished = useCallback((form) => {

        return form.publications && form.publications.length > 0

    }, [])

    const getFormEndDate = useCallback((form) => {

        if (!form.publications || form.publications.length === 0)

            return null

        return form.publications[0].endDate

    }, [])


    const calculateDaysLeft = useCallback((endDate) => {

        if (!endDate)
            return null

        const dueDate = new Date(endDate)

        const today = new Date()

        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

        return daysLeft

    }, [])


    const getDueDateChip = useCallback((endDate) => {

        if (!endDate)
            return null

        const daysLeft = calculateDaysLeft(endDate)

        let chipColor = "success"

        let chipText = `${daysLeft} days`

        if (daysLeft <= 0) {
            chipColor = "danger"
            chipText = "Overdue"
        } else if (daysLeft <= 3) {
            chipColor = "danger"
        } else if (daysLeft <= 7) {
            chipColor = "warning"
        }

        return { chipColor, chipText }

    }, [calculateDaysLeft])

    const handleOpenPublishModal = useCallback((form) => {

        setSelectedForm(form)

        const todayDate = today(getLocalTimeZone())

        let endDate

        const currentEndDate = getFormEndDate(form)

        if (currentEndDate) {

            endDate = stringToCalendarDate(currentEndDate)

        } else {

            const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            endDate = parseDate(futureDate.toISOString().split('T')[0])
        }

        setPublishDates({

            startDate: todayDate,

            endDate: endDate

        })

        setIsPublishModalOpen(true)

    }, [getFormEndDate])


    const handleRemovePublication = async () => {

        if (!selectedForm || !selectedForm.publications?.[0]?.id)
            return

        setIsDeletingPublication(true)

        try {

            // const result = await removePublicationFromCenter(selectedForm.publications[0].id)
            const result = await removePublishToCenter(selectedForm.publications[0])

            if (result === 200) {
                // Atualize o estado local
                setForms(prevForms =>
                    prevForms.map(form =>
                        form.id === selectedForm.id
                            ? { ...form, publications: [] }
                            : form
                    )
                )

                setIsPublishRemoveModalOpen(false)

                setSelectedForm(null)

                warningMessage('Publication removed successfully')

            }

        } catch (error) {

            console.error("Error removing publication:", error)

            warningMessage('Failed to remove publication. Please try again.')

        } finally {

            setIsDeletingPublication(false)

        }
    }

    const handleOpenPublishRemoveModal = useCallback((form) => {

        setSelectedForm(form)

        setIsPublishRemoveModalOpen(true)

    }, [])

    const handlePublishForm = async () => {

        if (!publishDates.startDate || !publishDates.endDate)

            return

        setIsPublishing(true)

        try {

            const startDateStr = `${publishDates.startDate.year}-${String(publishDates.startDate.month).padStart(2, '0')}-${String(publishDates.startDate.day).padStart(2, '0')}`

            const endDateStr = `${publishDates.endDate.year}-${String(publishDates.endDate.month).padStart(2, '0')}-${String(publishDates.endDate.day).padStart(2, '0')}`

            const publishData = {

                id: selectedForm?.publications[0]?.id,

                formId: selectedForm?.id,

                startDate: startDateStr,

                endDate: endDateStr,

                centerId: selectedForm?.publications[0]?.centerId

            }

            if (isFormPublished(selectedForm))

                await editPublishToCenter(publishData, selectedForm, setForms)

            else

                await publishToCenter(publishData, selectedForm, setForms)

            setIsPublishModalOpen(false)

            setSelectedForm(null)

            setPublishDates({

                startDate: today(getLocalTimeZone()),

                endDate: null

            })

        } catch (error) {

            console.error("Error publishing form:", error)

        } finally {

            setIsPublishing(false)

        }

    }

    const handleStatusChange = (e) => {
        setStatusFilter(new Set(e.target.value.split(",")));
    }

    const renderCell = useCallback((form, columnKey) => {

        switch (columnKey) {

            case "title":

                return (
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <FileText className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{form.title}</span>
                            <span className="text-sm text-gray-500 max-w-60 line-clamp-2">
                                {form.description}
                            </span>
                        </div>
                    </div>
                )

            case "creator":
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                            {form.creator ? `${form.creator.firstName} ${form.creator.surname}` : 'Unknown'}
                        </span>
                    </div>
                )

            case "status":
                const StatusIcon = statusIconMap[form.status]
                return (
                    <Chip variant="flat" color={statusColorMap[form.status]} size="sm" startContent={StatusIcon && <StatusIcon className="h-4 w-4" />} className="capitalize">
                        {form.status}
                    </Chip>
                )

            case "progress":

                const submissionCount = form.submissions ? form.submissions.length : 0

                const progress = totalMembers > 0 ? (submissionCount / totalMembers) * 100 : 0

                let progressColor = "success"

                if (progress < 50) {
                    progressColor = "danger"
                } else if (progress < 80) {
                    progressColor = "warning"
                }

                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                            <span className="text-xs text-gray-500">
                                {submissionCount}/{totalMembers}
                            </span>
                        </div>
                        <Progress aria-label="progress" value={progress} color={progressColor} size="sm" className="max-w-32" />
                    </div>
                )

            case "members":

                const pending = totalMembers - (form.submissions ? form.submissions.length : 0)

                const responded = form.submissions ? form.submissions.length : 0

                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{responded} responded</span>
                        </div>
                        {pending > 0 && (
                            <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4 text-amber-500" />
                                <span className="text-sm text-amber-600">{pending} pending</span>
                            </div>
                        )}
                    </div>
                )

            case "dueDate":

                const endDate = getFormEndDate(form)

                if (!endDate) {
                    return isFormPublished(form) ? "No deadline" : "Not published"
                }

                const formattedDate = endDate.split('T')[0]

                const dueDateChip = getDueDateChip(endDate)

                return (
                    <div className="flex flex-col">
                        <span className="text-sm">{formattedDate}</span>
                        {dueDateChip && (
                            <Chip color={dueDateChip.chipColor} variant="flat" size="sm" className="mt-1 w-fit">
                                {dueDateChip.chipText}
                            </Chip>
                        )}
                    </div>
                )

            case "actions":

                const coordinatorAnswered = verifyCoordinatorAnswered(form)

                const published = isFormPublished(form)

                const pendingMembers = totalMembers - (form.submissions ? form.submissions.length : 0)

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
                                    switch (key) {
                                        case "view":
                                            navigate(`/edi/user/coordinator/forms/view`, {
                                                state: { form, totalMembers }
                                            })
                                            break
                                        case "responses":
                                            navigate(`/edi/user/coordinator/form/responses/views`, {
                                                state: { form, totalMembers }
                                            })
                                            break
                                        case "answer":
                                            if (!coordinatorAnswered) {
                                                navigate(`/edi/user/coordinator/responses-forms`, {
                                                    state: { form }
                                                })
                                            }
                                            break

                                        case "my-answer":
                                            if (coordinatorAnswered) {
                                                navigate(`/edi/user/coordinator/form-response`, {
                                                    state: { form }
                                                })
                                            }
                                            break

                                        case "remind":
                                            if (pendingMembers > 0) {
                                                // alert(`Sending reminder to ${pendingMembers} pending members`)
                                            }
                                            break
                                        case "edit":
                                            handleOpenPublishModal(form)
                                            break
                                        case "remove":
                                            handleOpenPublishRemoveModal(form)
                                            break
                                        case "publish":
                                            if (!published) {
                                                handleOpenPublishModal(form)
                                            }
                                            break
                                    }
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View Form
                                </DropdownItem>

                                {published ? (
                                    <>
                                        <DropdownItem key="responses" startContent={<BarChart3 className="h-4 w-4" />}>
                                            View Responses
                                        </DropdownItem>
                                        {!coordinatorAnswered && (
                                            <DropdownItem key="answer" startContent={<UsersIcon className="h-4 w-4" />}>
                                                Answer Form
                                            </DropdownItem>
                                        )}

                                        {coordinatorAnswered && (
                                            <DropdownItem key="my-answer" startContent={<UsersIcon className="h-4 w-4" />}>
                                                My Response
                                            </DropdownItem>
                                        )}

                                        <DropdownItem key="edit" className="text-amber-600" startContent={<Edit className="h-4 w-4 text-amber-600" />}>
                                            Edit Publication
                                        </DropdownItem>
                                        <DropdownItem key="remove" className="text-red-600" startContent={<Trash className="h-4 w-4 text-red-600" />}>
                                            Remove Publication
                                        </DropdownItem>

                                    </>
                                ) : (
                                    <DropdownItem key="publish" className="text-green-600" startContent={<Send className="h-4 w-4 text-green-600" />}>
                                        Publish to center
                                    </DropdownItem>
                                )}

                                {
                                    /**
                                     *  {pendingMembers > 0 && (
                                        <DropdownItem key="remind" startContent={<Mail className="h-4 w-4" />}>
                                            Send Reminder ({pendingMembers})
                                        </DropdownItem>
                                    )}
                                     */
                                }
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )

            default:
                return form[columnKey] || '-'
        }
    }, [navigate, totalMembers, verifyCoordinatorAnswered, isFormPublished, getFormEndDate, getDueDateChip, handleOpenPublishModal])

    const stats = useMemo(() => ({
        totalForms: forms.length,
        publishedForms: forms.filter(f => f.publications && f.publications.length > 0).length,
        activeForms: forms.filter(f => f.status === 'active').length,
        totalResponses: forms.reduce((total, form) => total + (form.submissions ? form.submissions.length : 0), 0),
        formsWithResponses: forms.filter(f => f.submissions && f.submissions.length > 0).length,
        averageCompletion: forms.length > 0 ?
            Math.round(forms.reduce((sum, form) => sum + (form.submissions ? form.submissions.length : 0), 0) / forms.length) : 0,
        pendingForms: forms.filter(f => f.submissions && f.submissions.length < totalMembers).length,
        overdueForms: forms.filter(f => {
            if (!f.publications || f.publications.length === 0) return false;
            const endDate = getFormEndDate(f);
            if (!endDate) return false;
            return calculateDaysLeft(endDate) <= 0;
        }).length
    }), [forms, totalMembers, getFormEndDate, calculateDaysLeft])

    const topContent = useMemo(() => {
        return (
            <div className="min-w-5xl max-w-5xl mx-auto -mt-14">
                <div className="flex justify-between gap-2 items-end">
                    <Input
                        isClearable
                        size="lg"
                        variant="bordered"
                        className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                        placeholder="Search forms..."
                        startContent={<Search className="text-default-300" />}
                        value={filterValue}
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => {
                            setFilterValue(value)
                            setPage(1)
                        }}
                    />
                    <div className="flex gap-2">

                        <Select
                            className="min-w-40 max-w-40 bg-white rounded-2xl"
                            variant="bordered"
                            items={statusOptions}
                            aria-label="Table Columns"
                            size="sm"
                            radius="lg"
                            selectedKeys={statusFilter}
                            label="Status"
                            placeholder="filter by status"
                            onChange={handleStatusChange}
                        >
                            {(status) => <SelectItem key={status.uid} className="capitalize">{status.name}</SelectItem>}
                        </Select>

                        <Button
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                            size="lg"
                            endContent={<Download className="text-small" />}
                            onPress={() => alert("Exporting data...")}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 mb-4">
                    {[
                        {
                            title: "Survey lanced",
                            value: stats.totalForms,
                            icon: FileText,
                            color: "text-cyan-600",
                            bgColor: "bg-cyan-100"
                        },
                        {
                            title: "Survey",
                            value: stats.publishedForms,
                            icon: Send,
                            color: "text-green-600",
                            bgColor: "bg-green-100"
                        },
                        {
                            title: "Overdue",
                            value: stats.overdueForms,
                            icon: AlertCircle,
                            color: "text-red-600",
                            bgColor: "bg-red-100"
                        }
                    ].map((stat, index) => (
                        <Card key={index} className="border-none shadow">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                    </div>
                                    <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }, [filterValue, statusFilter, stats])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 min-w-5xl max-w-5xl mx-auto px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${filteredItems.length} selected`}
                </span>
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
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={() => setPage(prev => Math.max(prev - 1, 1))}                    >
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={() => setPage(prev => Math.min(prev + 1, pages))}                    >
                        Next
                    </Button>
                </div>
            </div>
        )
    }, [selectedKeys, filteredItems.length, page, pages])

    return (
        <div className="bg-white min-h-screen">

            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" size="md" className="rounded-2xl" isOpen={isPublishModalOpen}
                onClose={() => {
                    setIsPublishModalOpen(false)
                    setSelectedForm(null)
                    setPublishDates({
                        startDate: today(getLocalTimeZone()),
                        endDate: null
                    })
                }}
            >
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Send size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {isFormPublished(selectedForm) ? "Edit Publication" : "Publish Form"}
                                        </h2>
                                        <p className="text-white/90 text-sm">
                                            {isFormPublished(selectedForm) ? `Update availability dates for ${selectedForm?.title}` : `Set availability dates for ${selectedForm?.title}`}
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <DatePicker
                                            label="Start Date"
                                            size="lg"
                                            labelPlacement="inside"
                                            variant="bordered"
                                            value={publishDates.startDate}
                                            onChange={(date) => setPublishDates(prev => ({ ...prev, startDate: date }))}
                                            granularity="day"
                                            showMonthAndYearPickers
                                            minValue={today(getLocalTimeZone())}
                                            className="w-full"
                                            startContent={<Calendar className="h-4 w-4 text-gray-400" />}
                                        />

                                        <DatePicker
                                            label="End Date"
                                            size="lg"
                                            labelPlacement="inside"
                                            variant="bordered"
                                            value={publishDates.endDate}
                                            onChange={(date) => setPublishDates(prev => ({ ...prev, endDate: date }))}
                                            granularity="day"
                                            showMonthAndYearPickers
                                            minValue={publishDates.startDate || today(getLocalTimeZone())}
                                            className="w-full"
                                            startContent={<Calendar className="h-4 w-4 text-gray-400" />}
                                        />
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-800 mb-1">Form Availability Period</h4>
                                                <p className="text-sm text-blue-700">
                                                    Set the time period when this form will be available to center members.
                                                    Members can only submit responses during this period.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 bg-white rounded-b-2xl">
                                <div className="flex gap-2 w-full justify-end">
                                    <Button variant="light" color="danger" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button isLoading={isPublishing} color="primary" onPress={handlePublishForm} startContent={<Send className="h-4 w-4" />} className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow" isDisabled={!publishDates.startDate || !publishDates.endDate}                         >
                                        {isPublishing ? "Saving..." : isFormPublished(selectedForm) ? "Update Publication" : "Publish Form"}
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal
                scrollBehavior="outside"
                size="md"
                classNames={{ closeButton: 'cursor-pointer' }}
                className="rounded-2xl"
                isOpen={isPublishRemoveModalOpen}
                onClose={() => {
                    setIsPublishRemoveModalOpen(false);
                    setSelectedForm(null)
                }}
            >
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <AlertTriangleIcon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Remove Publication</h2>
                                        <p className="text-white/90 text-sm">
                                            Are you sure you want to remove this publication?
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {selectedForm && (
                                        <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 rounded-xl border border-cyan-200">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-cyan-600" />
                                                <div>
                                                    <h3 className="font-semibold text-cyan-900">{selectedForm.title}</h3>
                                                    <p className="text-sm text-cyan-700">
                                                        Current publication: {getFormEndDate(selectedForm)
                                                            ? new Date(getFormEndDate(selectedForm)).toLocaleDateString()
                                                            : 'No end date set'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-red-800 mb-1">Important Warning</h4>
                                                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                                    <li>Members will no longer be able to submit responses</li>
                                                    <li>Existing submissions will be preserved</li>
                                                    <li>This action cannot be undone</li>
                                                    <li>You will need to publish again to re-open submissions</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 bg-white rounded-b-2xl">
                                <div className="flex gap-2">
                                    <Button variant="light" onPress={onClose} className="text-gray-700 font-medium">
                                        Cancel
                                    </Button>
                                    <Button isLoading={isDeletingPublication} color="danger" onPress={handleRemovePublication} startContent={<Trash2 className="h-4 w-4" />} className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow">
                                        {isDeletingPublication ? "Removing..." : "Remove Publication"}
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Header */}
            <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26 mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center ">
                        <div className="">
                            <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Survey Monitoring</h1>
                            <p className="text-gray-600">Survey Track the research unit survey</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Building className="h-6 w-6" />
                            <span className="font-medium">{user?.centerName || 'Your Center'}</span>
                            <Chip color="primary" variant="flat">
                                {totalMembers} members
                            </Chip>
                        </div>
                    </div>

                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Main Table */}
                <Table
                    isHeaderSticky
                    aria-label="Forms monitoring table"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={setSelectedKeys}
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
                                <p className="text-gray-500">No forms found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
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
            </div>
        </div>
    )
}

export default FormsCollaborator