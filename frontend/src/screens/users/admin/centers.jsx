import React, { useEffect, useMemo, useState, useCallback } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Pagination, Card, CardBody, Spinner, Select, SelectItem } from "@heroui/react"
import { Building, Mail, Phone, MapPin, Users as UsersIcon, Eye, Edit, Trash2, Plus, Search, ChevronDown, BarChart3, MoreVertical } from "lucide-react"
import getCenters from "../../../functions/admin/centers/getCenters"
import AddCenter from "../../../components/user/admin/centers/addcenter"
import DeleteCenter from "../../../components/user/admin/centers/removeCenter"
import EditCenter from "../../../components/user/admin/centers/editCenter"
import ViewCenter from "../../../components/user/admin/centers/viewcenterDetails"

export const columns = [
    { name: "CENTER", uid: "name", sortable: true },
    { name: "RESEARCH AREA", uid: "research_area", sortable: true },
    { name: "LOCATION", uid: "location", sortable: true },
    { name: "COORDINATOR", uid: "coordinator", sortable: true },
    { name: "MEMBERS", uid: "totalUsers", sortable: true },
    { name: "CONTACT", uid: "contact" },
    { name: "ACTIONS", uid: "actions" },
]

export const statusOptions = [
    { name: "All", uid: "all" },
    { name: "Active", uid: "active" },
    { name: "Inactive", uid: "inactive" },
    { name: "Maintenance", uid: "maintenance" },
]

export default function CentersPage() {
    const [centers, setCenters] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterValue, setFilterValue] = useState("")
    const [selectedKeys, setSelectedKeys] = useState(new Set([]))
    const [statusFilter, setStatusFilter] = useState(new Set(["all"]))
    const [researchAreaFilter, setResearchAreaFilter] = useState(new Set(["all"]))
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" })
    const [page, setPage] = useState(1)
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false)
    const [isViewCenter, setIsViewCenter] = useState(false)
    const [isEditCenter, setIsEditCenter] = useState(false)
    const [selectedCenter, setSelectedCenter] = useState(null)

    const hasSearchFilter = Boolean(filterValue)

    const statusColorMap = {
        active: "success",
        inactive: "danger",
        maintenance: "warning",
    }

    // Carregar centros
    useEffect(() => {
        getCenters(setCenters, setIsLoading)
    }, [])

    // Opções únicas para filtros
    const researchAreaOptions = useMemo(() => {
        const uniqueAreas = [...new Set(centers.map((center) => center.research_area).filter(Boolean))]
        return [{ name: "All", uid: "all" }, ...uniqueAreas.map((area) => ({ name: area, uid: area }))]
    }, [centers])

    // Filtrar centros
    const filteredItems = useMemo(() => {
        let filteredCenters = [...centers]

        if (hasSearchFilter) {
            filteredCenters = filteredCenters.filter((center) =>
                center.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
                center.code?.toLowerCase().includes(filterValue.toLowerCase()) ||
                center.research_area?.toLowerCase().includes(filterValue.toLowerCase()) ||
                center.city?.toLowerCase().includes(filterValue.toLowerCase()) ||
                center.country?.toLowerCase().includes(filterValue.toLowerCase()) ||
                `${center.coordinator?.firstName} ${center.coordinator?.surname}`.toLowerCase().includes(filterValue.toLowerCase())
            )
        }

        const selectedStatus = Array.from(statusFilter)[0]
        if (selectedStatus !== "all") {
            filteredCenters = filteredCenters.filter((center) => center.status === selectedStatus)
        }

        const selectedResearchArea = Array.from(researchAreaFilter)[0]
        if (selectedResearchArea !== "all") {
            filteredCenters = filteredCenters.filter((center) => center.research_area === selectedResearchArea)
        }

        return filteredCenters
    }, [centers, filterValue, statusFilter, researchAreaFilter, hasSearchFilter])

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredItems.slice(start, end)
    }, [page, filteredItems, rowsPerPage])

    // Ordenar itens
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const column = sortDescriptor.column
            let first, second

            switch (column) {
                case "totalUsers":
                    first = a.totalUsers || 0
                    second = b.totalUsers || 0
                    break
                case "coordinator":
                    first = a.coordinator ? `${a.coordinator.firstName} ${a.coordinator.surname}` : ''
                    second = b.coordinator ? `${b.coordinator.firstName} ${b.coordinator.surname}` : ''
                    break
                default:
                    first = a[column] || ''
                    second = b[column] || ''
            }

            if (typeof first === 'string' && typeof second === 'string') {
                first = first.toLowerCase()
                second = second.toLowerCase()
            }

            const cmp = first < second ? -1 : first > second ? 1 : 0
            return sortDescriptor.direction === "descending" ? -cmp : cmp
        })
    }, [sortDescriptor, items])

    const handleResearchAreaFilterChenge = (e) => {
        setResearchAreaFilter(new Set(e.target.value.split(",")));
    }

    // Renderizar célula da tabela
    const renderCell = useCallback((center, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <Building className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{center.name}</span>
                            <span className="text-xs text-gray-500">{center.code}</span>
                        </div>
                    </div>
                )

            case "research_area":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900 max-w-60 line-clamp-2">
                            {center.research_area || 'N/A'}
                        </span>
                    </div>
                )

            case "location":
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{center.city || 'N/A'}</span>
                        </div>
                        <span className="text-xs text-gray-500">{center.country || 'N/A'}</span>
                    </div>
                )

            case "coordinator":
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                            {center.coordinator
                                ? `${center.coordinator.firstName || ''} ${center.coordinator.surname || ''}`.trim()
                                : 'No coordinator'}
                        </span>
                        <span className="text-xs text-gray-500">Coordinator</span>
                    </div>
                )

            case "totalUsers":
                return (
                    <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">{center.totalUsers || 0}</span>
                        <span className="text-xs text-gray-500">members</span>
                    </div>
                )

            case "contact":
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{center.email || 'No email'}</span>
                        </div>
                        {center.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{center.phone}</span>
                            </div>
                        )}
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
                                    setSelectedCenter(center)
                                    if (key === "view") setIsViewCenter(true)
                                    else if (key === "edit") setIsEditCenter(true)
                                    else if (key === "delete") setIsDeletedModalOpen(true)
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View Details
                                </DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit className="h-4 w-4" />}>
                                    Edit Center
                                </DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 className="h-4 w-4" />}>
                                    Delete Center
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )

            default:
                return <span className="text-sm text-gray-700">{center[columnKey] || '-'}</span>
        }
    }, [])

    // Estatísticas
    const stats = useMemo(() => {
        const totalUsers = centers.reduce((sum, center) => sum + (center.totalUsers || 0), 0)
        const centersWithCoordinator = centers.filter(center =>
            center.coordinator &&
            center.coordinator.firstName &&
            center.coordinator.surname &&
            center.coordinator.firstName !== 'No'
        ).length

        return {
            totalCenters: centers.length,
            totalResearchers: totalUsers,
            averagePerCenter: centers.length > 0 ? Math.round(totalUsers / centers.length) : 0,
            centersWithCoordinator
        }
    }, [centers])

    // Top content
    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-16 mb-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center pt-8">
                            <div>
                                <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    Centers Management
                                </h1>
                                <p className="text-gray-600 mt-2">Manage your research centers and their resources</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Building className="h-6 w-6" />
                                <span className="font-medium">Administration Panel</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="max-w-5xl mx-auto w-full -mt-16">
                    <div className="flex justify-between gap-2 items-end">
                        <Input
                            isClearable
                            size="lg"
                            variant="bordered"
                            className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                            placeholder="Search centers..."
                            startContent={<Search className="text-default-300" />}
                            value={filterValue}
                            onClear={() => {
                                setFilterValue("")
                                setPage(1)
                            }}
                            onValueChange={(value) => {
                                setFilterValue(value)
                                setPage(1)
                            }}
                        />
                        <div className="flex-1 flex justify-end gap-2">
                            {
                                /**
                                 *  <Dropdown>
                                    <DropdownTrigger className="hidden sm:flex">
                                        <Button size="lg" className="bg-white shadow" endContent={<ChevronDown className="text-small" />} variant="flat">
                                            Status
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        disallowEmptySelection
                                        aria-label="Status Filter"
                                        closeOnSelect={false}
                                        selectedKeys={statusFilter}
                                        selectionMode="single"
                                        onSelectionChange={setStatusFilter}
                                    >
                                        {statusOptions.map((status) => (
                                            <DropdownItem key={status.uid} className="capitalize">
                                                {status.name}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                                 */
                            }

                            <Select
                                className="max-w-40 bg-white rounded-2xl"
                                variant="bordered"
                                label="Filter by center area"
                                size="sm"
                                radius="lg"
                                items={researchAreaOptions}
                                selectedKeys={researchAreaFilter}
                                placeholder="Filter by center area"
                                onChange={handleResearchAreaFilterChenge}
                            >
                                {(area) => <SelectItem key={area.uid}>{area.name}</SelectItem>}
                            </Select>

                            <AddCenter centers={centers} setCenters={setCenters}/>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-2 mt-8">
                    {[
                        {
                            title: "Total Centers",
                            value: stats.totalCenters,
                            icon: Building,
                            color: "text-cyan-600",
                            bgColor: "bg-cyan-100"
                        },
                        {
                            title: "Total Researchers",
                            value: stats.totalResearchers,
                            icon: UsersIcon,
                            color: "text-blue-600",
                            bgColor: "bg-blue-100"
                        },
                        {
                            title: "Average per Center",
                            value: stats.averagePerCenter,
                            icon: BarChart3,
                            color: "text-purple-600",
                            bgColor: "bg-purple-100"
                        },
                        {
                            title: "With Coordinator",
                            value: stats.centersWithCoordinator,
                            icon: UsersIcon,
                            color: "text-emerald-600",
                            bgColor: "bg-emerald-100"
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
    }, [filterValue, statusFilter, researchAreaFilter, stats, researchAreaOptions])

    // Bottom content
    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex max-w-5xl w-full mx-auto justify-between items-center">
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
        <div className="bg-gray-50 min-h-screen">
            {/* Modais */}
            <ViewCenter
                centers={centers}
                setCenters={setCenters}
                isOpen={isViewCenter}
                onOpenChange={setIsViewCenter}
                center={selectedCenter}
            />

            <EditCenter
                centers={centers}
                setCenters={setCenters}
                isOpen={isEditCenter}
                onOpenChange={setIsEditCenter}
                seletedCenter={selectedCenter}
            />

            <DeleteCenter
                centers={centers}
                setCenters={setCenters}
                isOpen={isDeletedModalOpen}
                onOpenChange={setIsDeletedModalOpen}
                centerData={selectedCenter}
            />

            {/* Tabela */}
            <div className="">
                <Table
                    isHeaderSticky
                    aria-label="Centers management table"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={setSelectedKeys}
                    onSortChange={setSortDescriptor}
                    classNames={{
                        wrapper: 'shadow max-w-5xl mx-auto rounded-xl',
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
                        loadingContent={<Spinner label="Loading centers..." />}
                        emptyContent={
                            <div className="p-8 text-center">
                                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No centers found</p>
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