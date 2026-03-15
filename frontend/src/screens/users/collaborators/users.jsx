import { useMemo, useState, useCallback, useContext } from "react"
import { useLoaderData } from "react-router-dom"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, User, Pagination, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip, Select, SelectItem } from "@heroui/react"
import { Users as UsersIcon, Mail, Calendar, Eye, Pause, LogOut, UserX, CheckCircle, XCircle, AlertCircle, Search, ChevronDown, Download, MoreVertical, Building } from "lucide-react"
import ViewUser from "../../../components/user/admin/users/viewUser"
import { AppContext } from "../../../contexts/app_context"
import deleteUser from "../../../functions/collaborator/users/deleteUser"

const CenterMembers = () => {

    const membersData = useLoaderData()

    const members = Array.isArray(membersData?.users) ? membersData?.users : []

    const { user: currentUser } = useContext(AppContext)

    const [users, setUsers] = useState(members)

    const [filterValue, setFilterValue] = useState("")

    const [selectedKeys, setSelectedKeys] = useState(new Set([]))

    const [statusFilter, setStatusFilter] = useState(new Set(["all"]))

    const [roleFilter, setRoleFilter] = useState(new Set(["all"]))

    const [rowsPerPage, setRowsPerPage] = useState(20)

    const [isViewUser, setIsViewUser] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const [selectedUser, setSelectedUser] = useState(null)

    const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" })

    const [page, setPage] = useState(1)

    const { isOpen: isRemoveModalOpen, onOpen: onRemoveModalOpen, onClose: onRemoveModalClose } = useDisclosure()

    const hasSearchFilter = Boolean(filterValue)

    const currentCenterId = currentUser?.centerId

    const currentCenterName = currentUser?.centerName || "Your Center"

    const centerUsers = useMemo(() => {
        return users
    }, [users, currentCenterId])

    // Extrair opções únicas para os filtros
    const roleOptions = useMemo(() => {

        const roles = [...new Set(centerUsers.map(user => user.role).filter(Boolean))]

        return [{ name: "All", uid: "all" }, ...roles.map(role => ({ name: role, uid: role }))]

    }, [centerUsers])

    const removeUser = async (userId) => {

        try {

            setIsLoading(true)

            const res = await deleteUser(userId, users, setUsers)

            if (res === 200)

                onRemoveModalClose()

        } catch (error) {

            console.log(error)

        } finally {

            setIsLoading(false)

        }

    }

    const statusOptions = [
        { name: "All", uid: "all" },
        { name: "Active", uid: "active" },
        { name: "Inactive", uid: "inactive" },
        { name: "Pending", uid: "pending" },
    ]

    const statusColorMap = {
        active: "success",
        inactive: "danger",
        pending: "warning",
        default: "default"
    }

    const statusIconMap = {
        active: CheckCircle,
        inactive: XCircle,
        pending: AlertCircle,
        default: UsersIcon
    }

    const columns = [
        { name: "NAME", uid: "name", sortable: true },
        { name: "EMAIL", uid: "email" },
        { name: "ROLE", uid: "role", sortable: true },
        { name: "MEMBER SINCE", uid: "memberSince", sortable: true },
        { name: "ACTIONS", uid: "actions" }
    ]

    const handleRoleChange = (e) => {
        setRoleFilter(new Set(e.target.value.split(",")));
    }

    const filteredItems = useMemo(() => {

        let filteredUsers = [...centerUsers]

        // Filtro de busca geral
        if (hasSearchFilter) {

            filteredUsers = filteredUsers.filter((user) => {

                const searchStr = `${user.firstName || ''} ${user.surname || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase()

                return searchStr.includes(filterValue.toLowerCase())

            })
        }

        const selectedStatus = Array.from(statusFilter)[0]

        if (selectedStatus !== "all") {

            filteredUsers = filteredUsers.filter((user) =>

                user.status?.toLowerCase() === selectedStatus

            )

        }


        const selectedRole = Array.from(roleFilter)[0]

        if (selectedRole !== "all") {

            filteredUsers = filteredUsers.filter((user) =>

                user.role?.toLowerCase() === selectedRole.toLowerCase()

            )

        }

        return filteredUsers

    }, [centerUsers, filterValue, statusFilter, roleFilter, hasSearchFilter])

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

    const items = useMemo(() => {

        const start = (page - 1) * rowsPerPage

        const end = start + rowsPerPage

        return filteredItems.slice(start, end)

    }, [page, filteredItems, rowsPerPage])

    const sortedItems = useMemo(() => {

        return [...items].sort((a, b) => {

            const column = sortDescriptor.column

            let first = a[column]

            let second = b[column]


            if (column === "memberSince") {

                first = new Date(a.createdAt || 0)

                second = new Date(b.createdAt || 0)

            }

            if (typeof first === 'string' && typeof second === 'string') {

                first = first.toLowerCase()

                second = second.toLowerCase()

            }

            const cmp = first < second ? -1 : first > second ? 1 : 0

            return sortDescriptor.direction === "descending" ? -cmp : cmp

        })

    }, [sortDescriptor, items])

    const renderCell = useCallback((user, columnKey) => {

        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-3">
                        <User
                            avatarProps={{ radius: "lg", src: user.avatar }}
                            name={`${user.firstName || ''} ${user.surname || ''} ${user.id === currentUser.id ? "(you)" : ""}`}
                            classNames={{ name: "text-sm font-semibold", description: "text-xs text-gray-500" }}
                        />
                    </div>
                )
            case "role":
                return (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={user.role?.toLowerCase().includes("member") ? "primary" : "secondary"}
                        className="capitalize"
                    >
                        {user.role}
                    </Chip>
                )
            case "status":
                const StatusIcon = statusIconMap[user.status] || UsersIcon
                return (
                    <Chip
                        variant="flat"
                        color={statusColorMap[user.status] || "default"}
                        size="sm"
                        startContent={<StatusIcon className="h-3 w-3" />}
                        className="capitalize"
                    >
                        {user.status}
                    </Chip>
                )
            case "email":
                return (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate max-w-[180px]">{user.email}</span>
                    </div>
                )
            case "memberSince":
                if (!user.createdAt) return "N/A"
                const memberSince = new Date(user.createdAt)
                return (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{memberSince.toLocaleDateString()}</span>
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
                                aria-label="Member actions"
                                onAction={async (key) => {
                                    setSelectedUser(user)
                                    switch (key) {
                                        case "view":
                                            setIsViewUser(true)
                                            break
                                        case "remove":
                                            onRemoveModalOpen()
                                            break
                                    }
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View Profile
                                </DropdownItem>
                                {user.role?.toLowerCase().includes("member") && (
                                    <DropdownItem key="remove" className="text-danger" color="danger" startContent={<LogOut className="h-4 w-4" />}>
                                        Remove from Center
                                    </DropdownItem>
                                )}

                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )
            default:
                return <span className="text-sm text-gray-700">{user[columnKey] || "N/A"}</span>
        }
    }, [onRemoveModalOpen])

    const stats = useMemo(() => ({

        totalMembers: centerUsers.length,

        activeMembers: membersData?.answered,

        pendingMembers: membersData?.notAnswered,

        inactiveMembers: centerUsers.filter(u => u.status === 'inactive').length,

        averageAge: centerUsers.length > 0 ? Math.round(centerUsers.reduce((sum, user) => {

            if (!user.bornDate)
                return sum

            const age = new Date().getFullYear() - new Date(user.bornDate).getFullYear()

            return sum + age

        }, 0) / centerUsers.filter(u => u.bornDate).length) : 0

    }), [centerUsers])

    const topContent = useMemo(() => {
        return (
            <div className="min-w-5xl max-w-5xl mx-auto -mt-6">
                <div className="flex justify-between gap-2 items-end">
                    <Input
                        isClearable
                        size="lg"
                        variant="bordered"
                        className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                        placeholder="Search members..."
                        startContent={<Search className="text-default-300" />}
                        value={filterValue}
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => {
                            setFilterValue(value)
                            setPage(1)
                        }}
                    />
                    <div className="flex-1 flex justify-end gap-2">

                        <Select
                            className="min-w-40 max-w-40 bg-white rounded-2xl"
                            variant="bordered"
                            items={roleOptions}
                            size="sm"
                            radius="lg"
                            selectedKeys={roleFilter}
                            label="Role"
                            placeholder="filter by role"
                            onChange={handleRoleChange}
                        >
                            {(role) => <SelectItem key={role.uid}>{role.name}</SelectItem>}
                        </Select>

                        <Button
                            color="primary"
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                            endContent={<Download className="text-small" />}
                            onPress={() => alert("Exporting data...")}
                        >
                            Export
                        </Button>
                    </div>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 mb-4">
                    {[
                        {
                            title: "Total Members enroll in EDI+ tool",
                            value: stats.totalMembers,
                            icon: UsersIcon,
                            color: "text-cyan-600",
                            bgColor: "bg-cyan-100"
                        },
                        {
                            title: "Members that already answered the survey",
                            value: stats.activeMembers,
                            icon: CheckCircle,
                            color: "text-green-600",
                            bgColor: "bg-green-100"
                        },
                        {
                            title: "number of members enroll but don’t answer yet in EDI+ survey",
                            value: stats.pendingMembers,
                            icon: AlertCircle,
                            color: "text-amber-600",
                            bgColor: "bg-amber-100"
                        },


                    ].map((stat, index) => (
                        <Tooltip key={index} content={stat.title}>
                            <Card className="border-none shadow">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            </div>
        )
    }, [filterValue, statusFilter, roleFilter, stats, statusOptions, roleOptions])

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
                    color="default"
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

    return (
        <div className="bg-white min-h-screen">

            <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Research Unit</h1>
                            <p className="text-gray-600">Your research unit´s members</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Building className="h-6 w-6" />
                            <span className="font-medium">{currentCenterName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedUser && (
                <>
                    <ViewUser
                        users={users}
                        setUsers={() => { }} // Remover função não necessária se usar loader
                        isOpen={isViewUser}
                        onOpenChange={setIsViewUser}
                        currentCenterName={currentCenterName}
                        user={selectedUser}
                    />

                    {/* Remove from Center Modal */}
                    <Modal isOpen={isRemoveModalOpen} onClose={onRemoveModalClose}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <LogOut className="h-5 w-5 text-red-500" />
                                            <span>Remove from Center</span>
                                        </div>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-3 bg-red-100 rounded-full">
                                                <UserX className="h-8 w-8 text-red-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-900">
                                                    Remove {selectedUser?.firstName} {selectedUser?.surname}?
                                                </p>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    This member will be removed from {currentCenterName}.
                                                    They will lose access to center resources and activities.
                                                </p>
                                                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                                    <AlertCircle className="h-4 w-4 text-amber-500 inline mr-2" />
                                                    <span className="text-sm text-amber-700">
                                                        This action cannot be undone
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button variant="flat" onPress={onClose}>
                                            Cancel
                                        </Button>
                                        <Button isLoading={isLoading} color="danger" onPress={async () => {
                                            removeUser(selectedUser?.id)
                                        }}>
                                            Remove Member
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            )}

            <div className="max-w-5xl mx-auto">

                {/* Main Table */}
                <Table
                    isHeaderSticky
                    aria-label="Center members table"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={setSelectedKeys}
                    onSortChange={setSortDescriptor}
                    classNames={{
                        wrapper: "max-h-[600px] shadow",
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
                        emptyContent={
                            <div className="p-8 text-center">
                                <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No members found</p>
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

export default CenterMembers