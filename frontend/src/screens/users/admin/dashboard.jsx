import React, { useState, useEffect, useMemo } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardBody, Progress, Chip, Button, Pagination, Avatar, CircularProgress, Spinner } from "@heroui/react"
import { Users, FileText, BarChart3, Building, ChevronRight, PieChart, AlertCircle, RefreshCw, Building2 } from "lucide-react"
import getAdminDashBoard from "../../../functions/admin/dashboards/dahsboards"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {

  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        await getAdminDashBoard(setDashboard)
        setError(null)
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Mapear usuários para o formato da tabela
  const userData = useMemo(() => {
    if (!dashboard?.users) return []

    return dashboard.users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.surname || ''}`.trim() || 'Sem nome',
      email: user.email || 'Sem email',
      status: 'active', // Você pode ajustar conforme seus dados
      role: user.researchPosition || 'Researcher',
      center: 'Centro', // Adicione se tiver dados do centro
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : 'N/A',
      lastActive: 'N/A', // Adicione se tiver dados de último acesso
      avatar: (user.firstName?.charAt(0) || 'U') + (user.surname?.charAt(0) || '')
    }))
  }, [dashboard])

  // Mapear formulários para o formato da tabela
  const formData = useMemo(() => {
    if (!dashboard?.forms) return []

    return dashboard.forms.map(form => ({
      id: form.id,
      title: form.title || 'Sem título',
      submissions: form.submissions?.length || 0,
      status: form.status || 'active',
      type: 'Survey',
      created: form.createdAt ? new Date(form.createdAt).toLocaleDateString('pt-PT') : 'N/A',
      completionRate: Math.round(form.completion || 0),
      responsesToday: 0 // Calcular se tiver dados
    }))
  }, [dashboard])

  // Calcular estatísticas
  const stats = useMemo(() => ({
    totalUsers: dashboard?.totalUser || 0,
    activeUsers: dashboard?.users?.filter(u => u.status === 'active').length || 0,
    totalForms: dashboard?.forms?.length || 0,
    activeForms: dashboard?.totalAtiveForm || 0,
    totalCenters: dashboard?.totalCenters || 0,
    activeCenters: dashboard?.totalCenters || 0,
    totalContent: 0,
    publishedContent: 0,
    totalSubmissions: dashboard?.totalSubmissions || 0,
    todaySubmissions: 0,
    totalViews: 0,
    avgCompletion: dashboard?.forms?.length > 0 ? Math.round(dashboard.forms.reduce((sum, form) => sum + (form.completion || 0), 0) / dashboard.forms.length) : 0
  }), [dashboard])

  const statusColorMap = {
    active: "success",
    inactive: "default",
    pending: "warning",
    draft: "warning",
    published: "success",
    maintenance: "warning",
    archived: "danger"
  }

  const renderStatsCards = () => (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-2 -mt-16 mb-8">
      {[
        {
          title: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-cyan-600",
          bgColor: "bg-cyan-100",
          change: "+0%"
        },
        {
          title: "Active Forms",
          value: stats.activeForms,
          icon: FileText,
          color: "text-green-600",
          bgColor: "bg-green-100",
          change: "+0%"
        },
        {
          title: "Research Centers",
          value: stats.totalCenters,
          icon: Building,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          change: "+0%"
        },
        {
          title: "Total Submissions",
          value: stats.totalSubmissions.toLocaleString(),
          icon: BarChart3,
          color: "text-amber-600",
          bgColor: "bg-amber-100",
          change: "+0%"
        },
        {
          title: "Avg Completion",
          value: stats.avgCompletion + '%',
          icon: PieChart,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          change: "+0%"
        }
      ].map((stat, index) => (
        <Card key={index} className="border-none shadow-sm">
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
  )

  const renderRecentUsers = () => {
    const items = userData.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    const pages = Math.ceil(userData.length / rowsPerPage)

    return (
      <Card className="w-full max-w-5xl mx-auto border-none shadow">
        <CardBody className="p-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Button onPress={() => navigate('/edi/user/management-users')} size="sm" variant="light" endContent={<ChevronRight className="h-4 w-4" />}>
                View all
              </Button>
            </div>
          </div>

          <Table aria-label="Recent users table" removeWrapper>
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>EMAIL</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8" name={user.avatar} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" className="capitalize">
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pages > 1 && (
            <div className="flex justify-center p-4 border-t border-gray-200">
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
            </div>
          )}
        </CardBody>
      </Card>
    )
  }

  const renderRecentForms = () => (
    <Card className="border-none w-full max-w-5xl mx-auto mb-8 shadow">
      <CardBody className="p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
            <Button onPress={() => navigate('/edi/user/management-forms')} size="sm" variant="light" endContent={<ChevronRight className="h-4 w-4" />}>
              View all
            </Button>
          </div>
        </div>

        <Table aria-label="Recent forms table" removeWrapper>
          <TableHeader>
            <TableColumn>FORM</TableColumn>
            <TableColumn>SUBMISSIONS</TableColumn>
            <TableColumn>COMPLETION</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            {formData.map((form) => (
              <TableRow key={form.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{form.title}</span>
                    <span className="text-xs text-gray-500">Created: {form.created}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-lg">{form.submissions}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={form.completionRate} size="sm" className="max-w-32" />
                    <span className="text-sm text-gray-600">{form.completionRate}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={statusColorMap[form.status] || "default"}
                    variant="flat"
                    className="capitalize"
                  >
                    {form.status}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto" aria-label="Loading..." />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-danger">
          <AlertCircle className="h-8 w-8 mx-auto" />
          <p className="mt-4">{error}</p>
          <Button
            className="mt-4"
            color="primary"
            onPress={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
    
      <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center ">
            <div className="">
              <h1 className="text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-600">Complete system overview and management</p>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 className="h-6 w-6" />
              <span className="font-medium">Administration Panel</span>
            </div>
          </div>

        </div>
      </div>

      {renderStatsCards()}

      <div className="grid grid-cols-1 gap-2">
        {renderRecentUsers()}
        {renderRecentForms()}
      </div>
    </div>
  )
}

export default Dashboard