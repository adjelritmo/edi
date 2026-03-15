import { useEffect, useState, useMemo, useCallback } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Select, SelectItem, Pagination, Card, CardBody, Spinner } from "@heroui/react"
import { Users as UsersIcon, Download, Eye, Edit, Trash2, MapPin, Building, Briefcase, Search, MoreVertical } from "lucide-react"
import getUsers from "../../../functions/admin/users/getUsers"
import DeleteUser from "../../../components/user/admin/users/deleteUser"
import ViewUser from "../../../components/user/admin/users/viewUser"
import EditUserModal from "../../../components/user/admin/users/editUser"
import { RiAdminFill } from "react-icons/ri"
import { GrUserManager } from "react-icons/gr"

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "GENDER", uid: "gender", sortable: true },
  { name: "BORN DATE", uid: "born date", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "RESEARCH POSITION", uid: "research Position", sortable: true },
  { name: "CENTER", uid: "center" },
  { name: "EMAIL", uid: "email" },
  { name: "COUNTRY", uid: "country", sortable: true },
  { name: "ACTIONS", uid: "actions" },
]

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "role", "center", "actions"]

export default function UsersPage() {

  const [users, setUsers] = useState([])

  const [filterValue, setFilterValue] = useState("")

  const [selectedKeys, setSelectedKeys] = useState(new Set([]))

  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS))

  const [statusFilter, setStatusFilter] = useState(new Set(["all"]))

  const [countryFilter, setCountryFilter] = useState(new Set(["all"]))

  const [centerFilter, setCenterFilter] = useState(new Set(["all"]))

  const [roleFilter, setRoleFilter] = useState(new Set(["all"]))

  const [rowsPerPage, setRowsPerPage] = useState(20)

  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false)

  const [isViewUser, setIsViewUser] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [isEditUser, setIsEditUser] = useState(false)

  const [seletedUser, setSeletedUser] = useState(null)

  const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" })

  const [page, setPage] = useState(1)

  const hasSearchFilter = Boolean(filterValue)

  const countryOptions = useMemo(() => {

    const countries = [...new Set(users.map(user => user.country).filter(Boolean))]

    return [{ name: "All", uid: "all" }, ...countries.map(country => ({ name: country, uid: country }))]

  }, [users])

  const centerOptions = useMemo(() => {

    const centers = [...new Set(users.map(user => user.center?.name).filter(Boolean))]

    return [{ name: "All", uid: "all" }, ...centers.map(center => ({ name: center, uid: center }))]

  }, [users])

  const roleOptions = useMemo(() => {

    const roles = [...new Set(users.map(user => user.role).filter(Boolean))]

    return [{ name: "All", uid: "all" }, ...roles.map(role => ({ name: role, uid: role }))]

  }, [users])

  const handleRoleChange = (e) => {
    setRoleFilter(new Set(e.target.value.split(",")));
  }

  const handleCenterChange = (e) => {
    setCenterFilter(new Set(e.target.value.split(",")));
  }

  const statusOptions = [
    { name: "All", uid: "all" },
    { name: "Active", uid: "active" },
    { name: "Paused", uid: "paused" },
    { name: "Vacation", uid: "vacation" },
  ]

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = useMemo(() => {

    let filteredUsers = [...users]

    if (hasSearchFilter) {

      filteredUsers = filteredUsers.filter((user) => user.name?.toLowerCase().includes(filterValue.toLowerCase()) || user.email?.toLowerCase().includes(filterValue.toLowerCase()) || user.role?.toLowerCase().includes(filterValue.toLowerCase()) || user.center?.name?.toLowerCase().includes(filterValue.toLowerCase()) || user.country?.toLowerCase().includes(filterValue.toLowerCase()))

    }

    const selectedStatus = Array.from(statusFilter)[0]

    if (selectedStatus !== "all") {

      filteredUsers = filteredUsers.filter((user) => user.status?.toLowerCase() === selectedStatus)

    }

    const selectedCountry = Array.from(countryFilter)[0]

    if (selectedCountry !== "all") {

      filteredUsers = filteredUsers.filter((user) => user.country === selectedCountry)

    }

    const selectedCenter = Array.from(centerFilter)[0]

    if (selectedCenter !== "all") {

      filteredUsers = filteredUsers.filter((user) => user.center?.name === selectedCenter)

    }

    const selectedRole = Array.from(roleFilter)[0]

    if (selectedRole !== "all") {

      filteredUsers = filteredUsers.filter((user) => user.role === selectedRole)

    }

    return filteredUsers

  }, [users, filterValue, statusFilter, countryFilter, centerFilter, roleFilter])

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
        case "born date":
          first = a.bornDate ? new Date(a.bornDate) : new Date(0)
          second = b.bornDate ? new Date(b.bornDate) : new Date(0)
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



  const renderCell = useCallback((user, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <UsersIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{user.firstName} {user.surname}</span>
              <span className="text-xs text-gray-500">{user.status || 'active'}</span>
            </div>
          </div>
        )
      case "role":
        let roleColor = "default"
        if (user.role?.toLowerCase().includes('admin')) roleColor = "danger"
        else if (user.role?.toLowerCase().includes('manager')) roleColor = "warning"
        else if (user.role?.toLowerCase().includes('coordinator')) roleColor = "success"

        return (
          <Chip variant="flat" color={roleColor} size="sm">
            {user.role}
          </Chip>
        )

      case "center":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{user.centerName}</span>
          </div>
        )

      case "country":
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">{user.country}</span>
          </div>
        )

      case "research Position":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{user.researchPosition}</span>
            <span className="text-xs text-gray-500">Research</span>
          </div>
        )

      case "email":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">{user.email}</span>
            <span className="text-xs text-gray-500">Email</span>
          </div>
        )

      case "born date":
        const age = user.bornDate ? new Date().getFullYear() - new Date(user.bornDate).getFullYear() : 'N/A'
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              {user.bornDate ? new Date(user.bornDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className="text-xs text-gray-500">{age !== 'N/A' ? `${age} years` : 'Age'}</span>
          </div>
        )

      case "gender":
        return (
          <Chip variant="flat" size="sm" className="capitalize">
            {user.gender}
          </Chip>
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
                    setIsViewUser(true)
                    setSeletedUser(user)
                  } else if (key === "edit") {
                    setSeletedUser(user)
                    setIsEditUser(true)
                  } else if (key === "delete") {
                    setSeletedUser(user)
                    setIsDeletedModalOpen(true)
                  }
                }}
              >
                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                  View Profile
                </DropdownItem>
                <DropdownItem key="edit" startContent={<Edit className="h-4 w-4" />}>
                  Edit Data
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 className="h-4 w-4" />}>
                  Delete User
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )

      default:
        return <span className="text-sm text-gray-700">{user[columnKey] || '-'}</span>
    }
  }, [])

  const stats = useMemo(() => ({

    users: users.length,

    admins: users.filter(u => u.role === 'admin' || u.role === 'admin_alpha').length,

    coordinators: users.filter(u => u.role === 'coordinator').length,

    members: users.filter(u => u.role === 'member').length

  }), [users])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        {/* Header */}

        <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-16 mb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center ">
              <div className="">
                <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Users Management</h1>
                <p className="text-gray-600">Manage your center members and their permissions</p>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Building className="h-6 w-6" />
                <span className="font-medium">Administration Panel</span>
              </div>
            </div>

          </div>
        </div>

        <div className="">
          {/* Filters and Search */}
          <div className="mx-auto max-w-5xl gap-2 -mt-18">
            <div className="flex justify-between gap-2 items-end">
              <Input
                isClearable
                size="lg"
                variant="bordered"
                className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                placeholder="Search users..."
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
                  className="min-w-40 bg-white rounded-2xl"
                  variant="bordered"
                  label="Filter by role"
                  size="sm"
                  radius="lg"
                  items={roleOptions}
                  selectedKeys={roleFilter}
                  placeholder="Filter by role"
                  onChange={handleRoleChange}
                >
                  {(role) => <SelectItem key={role.uid}>{role.name}</SelectItem>}
                </Select>

                <Select
                  className="min-w-40 bg-white rounded-2xl"
                  variant="bordered"
                  size="sm"
                  radius="lg"
                  label="Filter by center"
                  items={centerOptions}
                  selectedKeys={centerFilter}
                  placeholder="Filter by center"
                  onChange={handleCenterChange}
                >
                  {(center) => <SelectItem key={center.uid} className="capitalize">{center.name}</SelectItem>}
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
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {[
              {
                title: "Total Users",
                value: stats.users,
                icon: UsersIcon,
                color: "text-cyan-600",
                bgColor: "bg-cyan-100"
              },
              {
                title: "Coordinators",
                value: stats.coordinators,
                icon: GrUserManager,
                color: "text-green-600",
                bgColor: "bg-green-100"
              },
              {
                title: "Admins",
                value: stats.admins,
                icon: RiAdminFill,
                color: "text-amber-600",
                bgColor: "bg-amber-100"
              },
              {
                title: "Members",
                value: stats.members,
                icon: Briefcase,
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

      </div>
    )
  }, [filterValue, statusFilter, countryFilter, centerFilter, roleFilter, stats, roleOptions, centerOptions, statusOptions])

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 max-w-5xl w-full mx-auto flex justify-between items-center">
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

  useEffect(() => {
    getUsers(setUsers, setIsLoading)
  }, [])

  return (
    <div className="bg-white min-h-screen">

      <ViewUser users={users} setUsers={setUsers} isOpen={isViewUser} onOpenChange={setIsViewUser} user={seletedUser} />

      <EditUserModal users={users} setUsers={setUsers} isOpen={isEditUser} onOpenChange={setIsEditUser} user={seletedUser} />

      <DeleteUser users={users} setUsers={setUsers} isOpen={isDeletedModalOpen} onOpenChange={setIsDeletedModalOpen} user={seletedUser} />

      <Table
        isHeaderSticky
        aria-label="Users management table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: 'shadow max-w-5xl mx-auto',

        }}
      >
        <TableHeader columns={headerColumns}>
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
          loadingContent={<Spinner label="Loading users..." />}
          emptyContent={
            <div className="p-8 text-center">
              <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
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
  )
}