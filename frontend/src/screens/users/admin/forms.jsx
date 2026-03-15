import { useContext, useMemo, useState, useCallback, useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Card, CardBody, Select, SelectItem, Spinner } from "@heroui/react"

import { Search, Eye, Users as UsersIcon, CheckCircle, Clock, MoreVertical, BarChart3, FileText, Building2, Edit, Trash2, Copy, Archive, BarChart, ListCheck } from "lucide-react"

import getForms from "../../../functions/admin/forms/getForms"

import DeleteForm from "../../../components/user/admin/forms/deleteForm"

import AddForm from "../../../components/user/admin/forms/addForm"

import EditForm from "../../../components/user/admin/forms/editForm"

import duplicateForm from "../../../functions/admin/forms/duplicateForm"

import { AppContext } from "../../../contexts/app_context"

const FormsManagement = () => {

    const [isLoading, setIsLoading] = useState(true)

    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const [selectedForm, setSelectedForm] = useState(null)

    const [filterValue, setFilterValue] = useState("")

    const [selectedKeys, setSelectedKeys] = useState(new Set([]))

    const [statusFilter, setStatusFilter] = useState(new Set(["all"]))

    const [rowsPerPage, setRowsPerPage] = useState(5)

    const [sortDescriptor, setSortDescriptor] = useState({ column: "title", direction: "ascending" })

    const [page, setPage] = useState(1)

    const [forms, setForms] = useState([])

    const { user } = useContext(AppContext)

    const navigate = useNavigate()

    useEffect(() => {

        getForms(setForms, setIsLoading)

    }, [])

    const statusOptions = [
        { name: "All", uid: "all" },
        { name: "Active", uid: "active" },
        { name: "Paused", uid: "paused" },
        { name: "Draft", uid: "draft" },
        { name: "Archived", uid: "archived" }
    ]

    const statusColorMap = {
        active: "success",
        paused: "warning",
        draft: "default",
        archived: "danger"
    }

    const statusIconMap = {
        active: CheckCircle,
        paused: Clock,
        draft: FileText,
        archived: Archive
    }

    const columns = [
        { name: "FORM", uid: "title", sortable: true },
        { name: "CREATOR", uid: "creator", sortable: true },
        { name: "STATUS", uid: "status", sortable: true },
        { name: "RESPONSES", uid: "responses", sortable: true },
        { name: "CREATED", uid: "created", sortable: true },
        { name: "UPDATED", uid: "updated", sortable: true },
        { name: "ACTIONS", uid: "actions" }
    ]

    const hasSearchFilter = Boolean(filterValue)

    const filteredItems = useMemo(() => {

        let filteredForms = [...forms]

        if (hasSearchFilter) {

            filteredForms = filteredForms.filter((form) => form.title?.toLowerCase().includes(filterValue.toLowerCase()) || form.description?.toLowerCase().includes(filterValue.toLowerCase()))

        }

        const selectedStatus = Array.from(statusFilter)[0]

        if (selectedStatus !== "all") {

            filteredForms = filteredForms.filter((form) => form.status === selectedStatus)

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
                case "responses":
                    first = a.responses || 0
                    second = b.responses || 0
                    break
                case "created":
                case "updated":
                    first = a[column] ? new Date(a[column]) : new Date(0)
                    second = b[column] ? new Date(b[column]) : new Date(0)
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
    }, [sortDescriptor, items])

    const handleStatusChange = (e) => {
        setStatusFilter(new Set(e.target.value.split(",")));
    }

    const handleEdit = (form) => {

        setSelectedForm(form)

        setIsEditModalOpen(true)

    }

    const handleDelete = (form) => {

        setSelectedForm(form)

        setIsDeletedModalOpen(true)

    }

    const handleDuplicate = async (form) => {

        const formToDuplicate = {
            ...form,

            title: `${form.title} (Copy)`,

            responses: 0,

            status: 'draft'

        }

        await duplicateForm(formToDuplicate, forms, setForms, setIsLoading)
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
                        <span className="text-xs text-gray-500">
                            {form.creator?.role || form.creator?.role === 'admin_alpha' ? "Admin" : '' || 'Admin'}
                        </span>
                    </div>
                )

            case "status":
                const StatusIcon = statusIconMap[form.status]
                return (
                    <Chip
                        variant="flat"
                        color={statusColorMap[form.status]}
                        size="sm"
                        startContent={StatusIcon && <StatusIcon className="h-4 w-4" />}
                        className="capitalize"
                    >
                        {form.status}
                    </Chip>
                )

            case "responses":
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">{form.submissions?.length || 0}</span>
                        </div>

                    </div>
                )

            case "created":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900"> {form.createdAt ? new Date(form.createdAt).toLocaleDateString('pt-PT') : ""}</span>
                        <span className="text-xs text-gray-500">Created</span>
                    </div>
                )

            case "updated":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{form.updatedAt ? new Date(form.updatedAt).toLocaleDateString('pt-PT') : ""}</span>
                        <span className="text-xs text-gray-500">Last Updated</span>
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
                                onAction={async (key) => {
                                    switch (key) {
                                        case "view":
                                            navigate(`/edi/user/management-forms/view/form/${form.id}`, { state: { form } })
                                            break
                                        case "responses":
                                            navigate(`/edi/user/management-forms/view/form/${form.id}/responses`, { state: { form } })
                                            break
                                        case "edit":
                                            handleEdit(form)
                                            break
                                        case "duplicate":
                                            await handleDuplicate(form)
                                            break
                                        case "results":
                                            navigate(`view/form/results`, { state: { form: form } })
                                            break
                                        case "delete":
                                            handleDelete(form)
                                            break
                                    }
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View
                                </DropdownItem>
                                <DropdownItem key="responses" startContent={<ListCheck className="h-4 w-4" />}>
                                    View Responses
                                </DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit className="h-4 w-4" />}>
                                    Edit
                                </DropdownItem>
                                <DropdownItem key="duplicate" startContent={<Copy className="h-4 w-4" />}>
                                    Duplicate
                                </DropdownItem>
                                <DropdownItem key="results" startContent={<BarChart3 className="h-4 w-4" />}>
                                    View Results
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Trash2 className="h-4 w-4" />}
                                >
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )

            default:
                return form[columnKey] || '-'
        }
    }, [navigate, user, handleDuplicate])

    const stats = useMemo(() => ({
        totalForms: forms.length,
        activeForms: forms.filter(f => f.status === 'active').length,
        totalResponses: forms.reduce((total, form) => total + (form.submissions?.length || 0), 0),
        draftForms: forms.filter(f => f.status === 'draft').length,
        archivedForms: forms.filter(f => f.status === 'archived').length
    }), [forms])

    const topContent = useMemo(() => {
        return (

            <div className="flex flex-col gap-2 -mt-14">
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
                    <div className="flex-1 flex justify-end items-center gap-2">

                        <Select
                            className="bg-white max-w-32"
                            variant="bordered"
                            label="Status"
                            size="sm"
                            radius="lg"
                            items={statusOptions}
                            selectedKeys={statusFilter}
                            placeholder="Filter by role"
                            onChange={handleStatusChange}
                        >
                            {(status) => <SelectItem key={status.uid}>{status.name}</SelectItem>}
                        </Select>

                        <AddForm forms={forms} setForms={setForms} />
                    </div>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4 mb-4">
                    {[
                        {
                            title: "Total Forms",
                            value: stats.totalForms,
                            icon: FileText,
                            color: "text-cyan-600",
                            bgColor: "bg-cyan-100"
                        },
                        {
                            title: "Active",
                            value: stats.activeForms,
                            icon: CheckCircle,
                            color: "text-green-600",
                            bgColor: "bg-green-100"
                        },
                        {
                            title: "Total Responses",
                            value: stats.totalResponses.toLocaleString(),
                            icon: UsersIcon,
                            color: "text-blue-600",
                            bgColor: "bg-blue-100"
                        },
                        {
                            title: "Drafts",
                            value: stats.draftForms,
                            icon: FileText,
                            color: "text-amber-600",
                            bgColor: "bg-amber-100"
                        },
                        {
                            title: "Archived",
                            value: stats.archivedForms,
                            icon: Archive,
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
    }, [filterValue, statusFilter, stats, forms])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
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
                        cursor: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow'
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

    return (
        <div className="bg-white min-h-screen">
            {/* Modal de Delete */}
            <DeleteForm
                forms={forms}
                setForms={setForms}
                isOpen={isDeletedModalOpen}
                onOpenChange={setIsDeletedModalOpen}
                form={selectedForm}
            />

            <EditForm
                formId={selectedForm?.id}
                forms={forms}
                setForms={setForms}
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                form={selectedForm}
            />

            <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26 mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center ">
                        <div className="">
                            <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Forms Management</h1>
                            <p className="text-gray-600">Create and manage all organization forms</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Building2 className="h-6 w-6" />
                        </div>
                    </div>

                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Main Table */}
                <Table
                    isHeaderSticky
                    aria-label="Forms management table"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={setSelectedKeys}
                    onSortChange={setSortDescriptor}
                    classNames={{
                        wrapper: 'shadow'
                    }}
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
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Loading forms..." />}
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

export default FormsManagement