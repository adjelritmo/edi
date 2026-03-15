import { useContext, useMemo, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Chip, Card, CardBody, Avatar, Tabs, Tab, Select, SelectItem, Pagination, Tooltip, Button } from "@heroui/react"
import { Search, Users as UsersIcon, BarChart3, FileText, Home, Users, FileSpreadsheet, BadgeInfo, Eye, Edit, Trash2 } from "lucide-react"
import { AppContext } from "../../../contexts/app_context"
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import ViewUser from "../../../components/user/admin/users/viewUser"
import UserData from "../../../components/user/admin/users/userData"

const ResearchUnit = () => {

    const { center: _centerData } = useContext(AppContext)

    const [activeTab, setActiveTab] = useState("overview")

    const navigate = useNavigate()

    const [centerData, setCenterData] = useState(null)
    const [members, setMembers] = useState([])
    const [forms, setForms] = useState([])
    const [chartDataFromBackend, setChartData] = useState({})
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

    // Estados para filtro e paginação de membros
    const [filterValue, setFilterValue] = useState("")
    const [page, setPage] = useState(1)
    const rowsPerPage = 10

    // Estatísticas do centro
    const centerStats = useMemo(() => ({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === "active").length,
        totalForms: forms.length,
        publishedForms: forms.filter(f => f.status === "published").length,
        totalResponses: forms.reduce((sum, form) => sum + (form.responses || 0), 0),
        averageResponseRate: forms.length > 0 ? Math.round((forms.reduce((sum, form) => sum + (form.responses || 0), 0) / members.length) * 100) : 0,
        pendingActions: 3,
        upcomingDeadlines: forms.filter(f => f.endDate && new Date(f.endDate) > new Date()).length
    }), [members, forms])

    // Processar dados para o gráfico de linhas - usando chartData do backend
    const chartData = useMemo(() => {
        const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Se não houver dados do backend, retorna array vazio ou com zeros
        if (!chartDataFromBackend || Object.keys(chartDataFromBackend).length === 0) {
            return allMonths.map(month => ({ month, responses: 0 }))
        }

        // Pega os dados do ano selecionado
        const yearData = chartDataFromBackend[selectedYear]

        if (!yearData) {
            return allMonths.map(month => ({ month, responses: 0 }))
        }

        // Determinar até qual mês mostrar
        const currentYear = new Date().getFullYear().toString()
        const currentMonth = new Date().getMonth() // 0-11 (Janeiro = 0)

        // Se for o ano atual, mostra apenas até o mês atual
        // Se for ano anterior, mostra todos os meses
        const lastMonthToShow = selectedYear === currentYear ? currentMonth : 11

        // Mapeia os meses para o formato do gráfico e FILTRA os meses futuros
        const data = allMonths
            .map((month, index) => {
                const monthNumber = index + 1 // 1-12 (para acessar os dados do backend)
                return {
                    month,
                    responses: yearData[monthNumber] || 0,
                    monthIndex: index // guarda o índice para filtrar depois
                }
            })
            .filter(item => item.monthIndex <= lastMonthToShow) // REMOVE meses futuros

        return data
    }, [chartDataFromBackend, selectedYear])

    // Gerar anos disponíveis baseado no chartData do backend
    const availableYears = useMemo(() => {
        if (chartDataFromBackend && Object.keys(chartDataFromBackend).length > 0) {
            return Object.keys(chartDataFromBackend).sort().reverse()
        }
        // Se não houver dados, retorna o ano atual
        return [new Date().getFullYear().toString()]
    }, [chartDataFromBackend])

    // Filtrar membros baseado no valor do filtro
    const filteredMembers = useMemo(() => {
        let filtered = [...members]

        if (filterValue) {
            const lowerFilter = filterValue.toLowerCase()
            filtered = filtered.filter(member =>
                member.firstName?.toLowerCase().includes(lowerFilter) ||
                member.surname?.toLowerCase().includes(lowerFilter) ||
                member.researchPosition?.toLowerCase().includes(lowerFilter) ||
                member.email?.toLowerCase().includes(lowerFilter)
            )
        }

        return filtered
    }, [members, filterValue])

    // Paginação dos membros
    const pages = Math.ceil(filteredMembers.length / rowsPerPage) || 1

    const paginatedMembers = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredMembers.slice(start, end)
    }, [page, filteredMembers])

    useEffect(() => {
        if (_centerData) {
            setCenterData(_centerData.center)
            setForms(_centerData.publication || [])
            setMembers(_centerData.users || [])
            setChartData(_centerData.chartData || {})

            // Se houver anos disponíveis, seleciona o primeiro
            if (_centerData?.chartData) {
                const years = Object.keys(_centerData.chartData).sort().reverse()
                if (years.length > 0) {
                    setSelectedYear(years[0])
                }
            }
        }
    }, [_centerData])

    // Resetar página quando o filtro mudar
    useEffect(() => {
        setPage(1)
    }, [filterValue])

    // Colunas da tabela de membros
    const memberColumns = [
        { name: "NAME", uid: "name" },
        { name: "RESEARCH POSITION", uid: "researchPosition" },
        { name: "JOIN DATE", uid: "joinDate" }
    ]

    // Render cell para tabela de membros
    const renderMemberCell = useCallback((member, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={`${member.firstName} ${member.surname}`}
                            className="bg-gradient-to-br from-cyan-500 to-emerald-500 text-white "
                        />

                        <div className="flex flex-col ">
                            <span className="font-semibold text-gray-900">
                                {member.firstName} {member.surname}
                            </span>
                            <span className="text-sm text-gray-500">{member.email}</span>
                        </div>
                    </div>
                )
            case "researchPosition":
                return (
                    <Chip variant="flat" color="primary" size="sm" className="capitalize">
                        {member.researchPosition || "Member"}
                    </Chip>
                )
            case "status":
                const statusColorMap = {
                    active: "success",
                    inactive: "danger",
                    pending: "warning"
                }
                return (
                    <Chip
                        className="capitalize"
                        color={statusColorMap[member.status] || "default"}
                        size="sm"
                        variant="flat"
                    >
                        {member.status || "active"}
                    </Chip>
                )
            case "joinDate":
                return (
                    <span className="text-sm text-gray-600">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                )
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button isIconOnly size="sm" variant="light" className="text-default-400">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Member">
                            <Button isIconOnly size="sm" variant="light" className="text-default-400">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Member">
                            <Button isIconOnly size="sm" variant="light" className="text-danger">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    </div>
                )
            default:
                return member[columnKey] || '-'
        }
    }, [])

    // Bottom content da tabela de membros
    const membersBottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-small text-default-400">
                    Total {filteredMembers.length} members
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    page={page}
                    total={pages}
                    onChange={setPage}
                    classNames={{
                        cursor: 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white cursor-pointer'
                    }}
                />
            </div>
        )
    }, [page, pages, filteredMembers.length])

    // Renderização
    return (
        <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header do Dashboard */}
            <div className="flex flex-col md:flex-row justify-between bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-12 items-start md:items-center gap-2 mb-8">
                <div className="flex justify-between mx-auto min-w-5xl max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                            {centerData?.name || centerData?.acronym} Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage your research center, members, and forms
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto min-w-6xl px-8 max-w-5xl -mt-12">
                {/* Tabs de Navegação */}
                <Tabs
                    aria-label="Dashboard tabs"
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                    className="mb-8 shadow rounded-lg"
                >
                    <Tab
                        key="overview"
                        title={
                            <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Overview
                            </div>
                        }
                    />
                    <Tab
                        key="members"
                        title={
                            <div className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" />
                                Members ({centerStats?.totalMembers})
                            </div>
                        }
                    />
                    <Tab
                        key="forms"
                        title={
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Forms ({centerStats?.totalForms})
                            </div>
                        }
                    />
                    <Tab
                        key="settings"
                        title={
                            <div className="flex items-center gap-2">
                                <BadgeInfo className="h-4 w-4" />
                                Unit Info
                            </div>
                        }
                    />
                </Tabs>
            </div>

            <div className="max-w-6xl px-8 mx-auto">
                {activeTab === "overview" && (
                    <>
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                            <Card shadow="none" className="shadow border-none bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm opacity-90">Total Members</p>
                                            <p className="text-3xl font-bold mt-2">{centerStats?.totalMembers}</p>
                                        </div>
                                        <Users className="h-12 w-12 opacity-80" />
                                    </div>
                                </CardBody>
                            </Card>

                            <Card shadow="none" className="shadow border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm opacity-90">Published Forms</p>
                                            <p className="text-3xl font-bold mt-2">{centerStats?.totalForms}</p>
                                        </div>
                                        <FileSpreadsheet className="h-12 w-12 opacity-80" />
                                    </div>
                                </CardBody>
                            </Card>

                            <Card shadow="none" className="shadow border-none bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm opacity-90">Total Responses</p>
                                            <p className="text-3xl font-bold mt-2">{centerStats?.totalResponses}</p>
                                        </div>
                                        <BarChart3 className="h-12 w-12 opacity-80" />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Gráfico de Linhas com Recharts */}
                        <Card shadow="none" className="shadow mb-12">
                            <CardBody className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Response Growth Trend</h3>
                                        <p className="text-gray-600">
                                            Monthly form submission growth analysis
                                            {selectedYear === new Date().getFullYear().toString() && (
                                                <span className="text-cyan-600 ml-2">(Up to current month)</span>
                                            )}
                                        </p>
                                    </div>
                                    <Select
                                        size="lg"
                                        disallowEmptySelection
                                        selectedKeys={[selectedYear]}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-32"
                                    >
                                        {availableYears.map(year => (
                                            <SelectItem key={year}>{year}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <RechartsTooltip
                                                formatter={(value) => [`${value} responses`, 'Submissions']}
                                                labelFormatter={(label) => `Month: ${label}`}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                formatter={(value) => <span className="text-sm font-medium">Monthly Submissions</span>}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="responses"
                                                stroke="url(#colorGradient)"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 5,
                                                    fill: "#10b981",
                                                    stroke: "#fff",
                                                    strokeWidth: 2,
                                                    transition: 'all 0.2s'
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                    fill: "#06b6d4",
                                                    stroke: "#fff",
                                                    strokeWidth: 2,
                                                    transition: 'all 0.2s'
                                                }}
                                                name="Submissions"
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            />
                                            <defs>
                                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                                </linearGradient>
                                            </defs>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>
                    </>
                )}

                {activeTab === "members" && (
                    <Card shadow="none" className="shadow">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Unit Members</h3>
                                    <p className="text-gray-600">Manage research team members</p>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        isClearable
                                        size="lg"
                                        placeholder="Search members..."
                                        startContent={<Search className="h-4 w-4 text-gray-400" />}
                                        value={filterValue}
                                        onClear={() => setFilterValue("")}
                                        onValueChange={setFilterValue}
                                        className="w-80"
                                    />
                                </div>
                            </div>

                            <Table
                                shadow="none"
                                className="w-full"
                                aria-label="Members table"
                                bottomContent={membersBottomContent}
                                bottomContentPlacement="outside"
                            >
                                <TableHeader columns={memberColumns}>
                                    {(column) => (
                                        <TableColumn
                                            key={column.uid}
                                            align={column.uid === "actions" ? "center" : "start"}
                                        >
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody
                                    items={paginatedMembers}
                                    emptyContent={
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <UsersIcon className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-gray-500">No members found</p>
                                            {filterValue && (
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Try adjusting your search
                                                </p>
                                            )}
                                        </div>
                                    }
                                >
                                    {(member) => (
                                        <TableRow key={member.id}>
                                            {(columnKey) => (
                                                <TableCell>{renderMemberCell(member, columnKey)}</TableCell>
                                            )}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                )}

                {activeTab === "forms" && (
                    <Card shadow="none" className="shadow">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Published Forms</h3>
                                    <p className="text-gray-600">Manage and track form submissions</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {forms.map(form => (
                                    <Card shadow="none" key={form.id} className="shadow">
                                        <CardBody className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900">{form.title}</h4>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                {form.endDate && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Due Date:</span>
                                                        <span className="font-medium">
                                                            {new Date(form.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Published:</span>
                                                    <span className="font-medium">
                                                        {form.startDate ? new Date(form.startDate).toLocaleDateString() : 'Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {activeTab === "settings" && (
                    <Card shadow="none" className="shadow">
                        <CardBody className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Unit Info</h3>

                            <div className="space-y-8">
                                {/* Informações Básicas */}
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Center Name</p>
                                            <p className="font-medium">{centerData?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Code</p>
                                            <p className="font-medium">{centerData?.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Coordinator</p>
                                            <p className="font-medium">You</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            <p className="font-medium lowercase">{centerData?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="font-medium">{centerData?.country}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">City</p>
                                            <p className="font-medium">{centerData?.city}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default ResearchUnit