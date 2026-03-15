import { useContext, useState, useEffect, useMemo } from "react"
import { Award, Target, TrendingUp, Activity, Info, RefreshCw, AlertCircle, Calendar } from "lucide-react"
import { Card, CardBody, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Spinner, Button } from "@heroui/react"
import { AppContext } from "../../../contexts/app_context"
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import getMyDashBoard from "../../../functions/user/dashboard/getMyDashboard"

export default function HomePage() {
  const { user, setDashboard_data } = useContext(AppContext)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDimension, setSelectedDimension] = useState("motivation")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")

  const emotionNameMapping = {
    'collaboration': 'Collaboration',
    'engagement': 'Engagement',
    'impact': 'Impact',
    'innovation': 'Innovation',
    'leadership': 'Leadership',
    'motivation': 'Motivation',
    'skills': 'Skills',
    'others': 'Others'
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#A4DE6C']

  // Dados ZERADOS quando não há dados
  const getZeroData = () => ({
    stats: [
      {
        title: "Your Score",
        value: 0,
        description: "Average of all your submissions",
        color: "from-blue-500 to-cyan-500"
      },
      {
        title: "Research Unit Score",
        value: 0,
        description: "Average score of your research center",
        color: "from-green-500 to-emerald-500"
      },
      {
        title: "Global Score",
        value: 0,
        description: "Average score of all research centers",
        color: "from-purple-500 to-pink-500"
      }
    ],
    counts: {
      user: 0,
      center: 0,
      global: 0
    },
    dimensionsData: Object.values(emotionNameMapping).map((name, index) => ({
      name,
      member: 0,
      researchCenter: 0,
      allCenters: 0,
      color: COLORS[index % COLORS.length],
      description: name,
      emotion: Object.keys(emotionNameMapping).find(key => emotionNameMapping[key] === name) || 'others'
    })),
    dimensionDistribution: Object.values(emotionNameMapping).map((name) => ({ name, value: 0 })),
    progressByYear: {
      user: [],
      center: [],
      global: []
    },
    lastSubmission: null,
    currentUser: null,
    userInfo: null,
    table: [],
    chartData: {},
    samples: {
      userSubmissions: [],
      centerSubmissions: [],
      recentGlobalSubmissions: []
    }
  })

  const transformApiData = (apiData) => {
    if (!apiData || !apiData.data) {
      return getZeroData()
    }

    const {
      userScore = 0,
      centerScore = 0,
      globalScore = 0,
      center_sub = 0,
      global_sub = 0,
      table = [],
      chartData = {},
      last_submission = null
    } = apiData.data

    // Preparar dados das dimensões a partir da tabela
    const dimensionsData = table.map((item, index) => {
      const userValue = parseFloat(item.user) || 0
      const centerValue = parseFloat(item.center) || 0
      const globalValue = parseFloat(item.global) || 0

      return {
        name: emotionNameMapping[item.dimension] || item.dimension,
        member: userValue,
        researchCenter: centerValue,
        allCenters: globalValue,
        color: COLORS[index % COLORS.length],
        description: emotionNameMapping[item.dimension] || item.dimension,
        emotion: item.dimension,
        order: index
      }
    })

    // Criar dados para gráfico de pizza
    const dimensionDistribution = table.map(item => ({
      name: emotionNameMapping[item.dimension] || item.dimension,
      value: parseFloat(item.user) || 0
    }))

    // Processar chartData para o gráfico de progresso
    const processedChartData = {
      user: [],
      center: [],
      global: []
    }

    // Extrair anos do chartData
    const years = Object.keys(chartData || {})

    years.forEach(year => {
      const yearData = chartData[year] || []

      // Para cada dimensão no ano, criar entrada no progressByYear
      yearData.forEach(dimData => {
        // Dados do usuário para esta dimensão neste ano
        processedChartData.user.push({
          year: parseInt(year),
          totalAverage: dimData.user,
          dimensions: [{
            emotion: dimData.dimension,
            name: emotionNameMapping[dimData.dimension] || dimData.dimension,
            averageScore: dimData.user,
            order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
          }]
        })

        // Dados do centro para esta dimensão neste ano
        processedChartData.center.push({
          year: parseInt(year),
          totalAverage: dimData.center,
          dimensions: [{
            emotion: dimData.dimension,
            name: emotionNameMapping[dimData.dimension] || dimData.dimension,
            averageScore: dimData.center,
            order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
          }]
        })

        // Dados globais para esta dimensão neste ano
        processedChartData.global.push({

          year: parseInt(year),

          totalAverage: dimData.global,

          dimensions: [{
            emotion: dimData.dimension,
            name: emotionNameMapping[dimData.dimension] || dimData.dimension,
            averageScore: dimData.global,
            order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
          }]
        })
      })
    })

    // Encontrar a primeira dimensão com dados para selecionar por padrão
    const defaultDimension = table.find(item => parseFloat(item.user) > 0)?.dimension || "motivation"

    setDashboard_data({
      stats: [
        {
          title: "Your Score",
          value: parseFloat(userScore.toFixed(2)),
          description: `Average of current submission`,
          color: "from-blue-500 to-cyan-500"
        },
        {
          title: "Research Unit Score",
          value: parseFloat(centerScore.toFixed(2)),
          description: `Average of ${center_sub} submissions in your center`,
          color: "from-green-500 to-emerald-500"
        },
        {
          title: "Global Score",
          value: parseFloat(globalScore.toFixed(2)),
          description: `Average of ${global_sub} total submissions`,
          color: "from-purple-500 to-pink-500"
        }
      ],
      counts: {
        user: 1,
        center: center_sub,
        global: global_sub
      },
      dimensionsData,
      defaultDimension,
      dimensionDistribution,
      progressByYear: processedChartData,
      lastSubmission: last_submission,
      last_submission,
      currentUser: user,
      userInfo: user,
      yearsCovered: {
        user: years,
        center: years,
        global: years
      },
      yearRange: years.length > 0 ? {
        minYear: Math.min(...years.map(y => parseInt(y))),
        maxYear: Math.max(...years.map(y => parseInt(y)))
      } : null,
      table,
      chartData
    })

    return {
      stats: [
        {
          title: "Your Score",
          value: parseFloat(userScore.toFixed(2)),
          description: `Average of current submission`,
          color: "from-blue-500 to-cyan-500"
        },
        {
          title: "Research Unit Score",
          value: parseFloat(centerScore.toFixed(2)),
          description: `Average of ${center_sub} submissions in your center`,
          color: "from-green-500 to-emerald-500"
        },
        {
          title: "Global Score",
          value: parseFloat(globalScore.toFixed(2)),
          description: `Average of ${global_sub} total submissions`,
          color: "from-purple-500 to-pink-500"
        }
      ],
      counts: {
        user: 1,
        center: center_sub,
        global: global_sub
      },
      dimensionsData,
      defaultDimension,
      dimensionDistribution,
      progressByYear: processedChartData,
      lastSubmission: last_submission,
      last_submission,
      currentUser: user,
      userInfo: user,
      yearsCovered: {
        user: years,
        center: years,
        global: years
      },
      yearRange: years.length > 0 ? {
        minYear: Math.min(...years.map(y => parseInt(y))),
        maxYear: Math.max(...years.map(y => parseInt(y)))
      } : null,
      table,
      chartData
    }
  }

  // Buscar dados quando o componente montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await getMyDashBoard(setDashboardData)
      } catch (err) {
        console.error("Error fetching dashboard:", err)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Dados transformados
  const transformedData = useMemo(() => {
    if (!dashboardData) {
      return getZeroData()
    }
    return transformApiData(dashboardData)
  }, [dashboardData])

  // Atualizar dimensão selecionada quando os dados mudam
  useEffect(() => {
    if (transformedData.defaultDimension && transformedData.defaultDimension !== selectedDimension) {
      setSelectedDimension(transformedData.defaultDimension)
    }
  }, [transformedData.defaultDimension])

  // Preparar opções de anos baseado no chartData
  const yearOptions = useMemo(() => {
    const years = Object.keys(transformedData.chartData || {})
    return years.sort((a, b) => parseInt(a) - parseInt(b))
  }, [transformedData.chartData])

  // Inicializar startYear e endYear quando os dados forem carregados
  useEffect(() => {
    if (yearOptions.length > 0 && !startYear) {
      setStartYear(yearOptions[0])
      setEndYear(yearOptions[yearOptions.length - 1])
    }
  }, [yearOptions, startYear])

  // Filtrar opções do endYear baseado no startYear selecionado
  const endYearOptions = useMemo(() => {
    if (!startYear || yearOptions.length === 0) return []
    const start = parseInt(startYear)
    return yearOptions
      .filter(year => parseInt(year) >= start)
      .map(year => ({ key: year, label: year }))
  }, [startYear, yearOptions])

  // Atualizar endYear quando startYear mudar
  useEffect(() => {
    if (startYear && endYear) {
      const start = parseInt(startYear)
      const end = parseInt(endYear)
      if (end < start) {
        const newEndYear = endYearOptions.length > 0 ? endYearOptions[0].key : startYear
        setEndYear(newEndYear)
      }
    }
  }, [startYear, endYear, endYearOptions])

  // Preparar dados para o gráfico de progresso usando chartData
  const prepareProgressChartData = useMemo(() => {
    const data = []
    if (!startYear || !endYear || !transformedData.chartData) {
      return data
    }

    const start = parseInt(startYear)
    const end = parseInt(endYear)

    for (let year = start; year <= end; year++) {
      const yearStr = year.toString()
      const yearData = transformedData.chartData[yearStr] || []

      // Encontrar a dimensão selecionada nos dados do ano
      const dimensionData = yearData.find(d => d.dimension === selectedDimension)

      data.push({
        year: yearStr,
        member: dimensionData?.user || 0,
        researchCenter: dimensionData?.center || 0,
        allCenters: dimensionData?.global || 0,
        hasData: !!dimensionData
      })
    }

    return data
  }, [selectedDimension, startYear, endYear, transformedData.chartData])

  const getStatusColor = (status) => {
    const color = status === "Average" ? "warning" :
      status === "Below Average" ? "danger" :
        "success"
    return color
  }

  // Opções de dimensão para o select
  const dimensionOptions = useMemo(() => {
    return transformedData.table.map(item => ({
      key: item.dimension,
      label: emotionNameMapping[item.dimension] || item.dimension
    }))
  }, [transformedData.table])

  // Encontrar nome da dimensão selecionada
  const selectedDimensionName = useMemo(() => {
    const dim = transformedData.table.find(d => d.dimension === selectedDimension)
    return dim ? (emotionNameMapping[dim.dimension] || dim.dimension) : selectedDimension
  }, [selectedDimension, transformedData.table])

  // Se estiver carregando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header com indicador de dados */}
      <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26">
        <div className="flex justify-between items-start flex-wrap gap-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="mb-2 text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Member Dashboard</h1>
            <p className="text-gray-600 mt-2 text-xl sm:text-base">
              {user ? `Welcome back, ${user.firstName} ${user.surname}, this is your score across all EDI+ dimensions` : 'Track your score across all EDI+ dimensions'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-6">
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-2 sm:overflow-visible sm:mx-0 sm:px-0">
          {transformedData.stats.map((stat, index) => (
            <Tooltip key={index} content={stat.description}>
              <Card className="border-none bg-gradient-to-br from-white to-gray-50/80 shadow min-w-[260px] sm:min-w-0 flex-shrink-0 mx-2 sm:mx-0">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                        {stat.value === 0 && (
                          <span className="text-xs text-gray-400 ml-2">(no data)</span>
                        )}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-3 bg-gradient-to-r ${stat.color} rounded-full opacity-${stat.value === 0 ? '50' : '100'}`}>
                      {stat.title === "Your Score" && <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                      {stat.title === "Research Unit Score" && <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                      {stat.title === "Global Score" && <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-5 gap-2 sm:gap-2 mb-6 sm:mb-8">
        {/* Yearly Progress Chart */}
        <Card className="border-none xl:col-span-3 bg-gradient-to-br from-white to-gray-50/80 shadow">
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-2">
              <h3 className="text-sm sm:text-sm font-bold text-gray-900 flex items-center">
                Yearly Progress - {selectedDimensionName}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <Select
                  label="Dimension"
                  placeholder="Select dimension"
                  selectedKeys={[selectedDimension]}
                  onSelectionChange={(keys) => setSelectedDimension(Array.from(keys)[0] || transformedData.defaultDimension || "motivation")}
                  className="w-full sm:min-w-[180px]"
                  size="sm"
                >
                  {dimensionOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>

                <div className="flex flex-1 gap-2">
                  <Select
                    label="Start"
                    placeholder="Start year"
                    selectedKeys={[startYear]}
                    onSelectionChange={(keys) => {
                      const newStart = Array.from(keys)[0] || ""
                      setStartYear(newStart)
                    }}
                    className="min-w-[100px]"
                    size="sm"
                    disabled={!yearOptions.length}
                  >
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="End"
                    placeholder="End year"
                    selectedKeys={[endYear]}
                    onSelectionChange={(keys) => setEndYear(Array.from(keys)[0] || "")}
                    className="min-w-[100px]"
                    size="sm"
                    disabled={!endYearOptions.length}
                  >
                    {endYearOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div className="h-64 sm:h-80 lg:h-96 ">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareProgressChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                    fontSize={12}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <RechartsTooltip
                    formatter={(value) => {
                      const numValue = parseFloat(value)
                      return numValue > 0 ? [numValue.toFixed(2), 'Score'] : ['No data', 'Score']
                    }}
                    labelFormatter={(year) => `Year: ${year}`}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const hasData = payload.some(p => p.value > 0)
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
                            <p className="font-semibold text-sm">Year: {label}</p>
                            <p className="text-xs text-gray-600 mb-1">Dimension: {selectedDimensionName}</p>
                            {!hasData && <p className="text-xs text-gray-500 italic">No data for this year</p>}
                            {payload.map((p, idx) => {
                              const numValue = parseFloat(p.value)
                              return (
                                <p key={idx} className="text-xs" style={{ color: p.color }}>
                                  {p.name}: {numValue > 0 ? numValue.toFixed(2) : 'No data'}
                                </p>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="member"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Your Score"
                    dot={{ r: 4, stroke: "#0088FE", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, fill: "#0088FE" }}
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="researchCenter"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="RU Score"
                    dot={{ r: 4, stroke: "#00C49F", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, fill: "#00C49F" }}
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="allCenters"
                    stroke="#FFBB28"
                    strokeWidth={2}
                    name="Global Score"
                    dot={{ r: 4, stroke: "#FFBB28", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, fill: "#FFBB28" }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p>Showing <span className="font-medium">{selectedDimensionName}</span> from {startYear} to {endYear}</p>
                  {transformedData.yearRange && (
                    <p className="text-xs text-gray-500">
                      Data available from {transformedData.yearRange.minYear} to {transformedData.yearRange.maxYear}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {prepareProgressChartData.filter(d => d.hasData).length} of {prepareProgressChartData.length} years have data
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Dimension Distribution Chart */}
        <Card className="border-none xl:col-span-2 bg-gradient-to-br from-white to-gray-50/80 shadow">
          <CardBody className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2" />
              Dimension Distribution
            </h3>
            <div className="h-64 sm:h-80 lg:h-96 text-[11px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transformedData.dimensionDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentage = (percent * 100).toFixed(0)
                      return percentage === "0" ? `${name}: 0%` : `${name}: ${percentage}%`
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(transformedData.dimensionDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value === 0 ? '#e5e7eb' : COLORS[index % COLORS.length]}
                        stroke={entry.value === 0 ? '#d1d5db' : '#fff'}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => {
                      return value === 0 ? ['0 (no data)', name] : [parseFloat(value).toFixed(2), name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Distribution of your scores across dimensions</p>
              {transformedData.dimensionDistribution && transformedData.dimensionDistribution.every(d => d.value === 0) && (
                <p className="text-gray-400 italic">No dimension data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Detailed Metrics Table */}
        <Card className="border-none bg-white shadow mb-6 sm:mb-8">
          <CardBody className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Detailed Metrics</h3>
              <div className="flex gap-2">
                {transformedData.stats[0].value === 0 && (
                  <Chip color="warning" variant="flat" size="sm">
                    No Data Available
                  </Chip>
                )}
              </div>
            </div>
            <Table
              className="rounded-lg bg-white"
              aria-label="Performance metrics table"
              classNames={{
                base: "min-w-full rounded-lg bg-white",
                table: "min-w-[600px]"
              }}
              shadow="none"
            >
              <TableHeader>
                <TableColumn className="bg-gray-50 text-left text-xs sm:text-sm font-semibold">Dimension</TableColumn>
                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">Your Score</TableColumn>
                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">RU Score</TableColumn>
                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">Global Score</TableColumn>
                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">Your Position</TableColumn>
              </TableHeader>
              <TableBody className="p-0">
                {transformedData.table.map((dimension, index) => (
                  <TableRow key={dimension.dimension} className="border-b p-0 hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center min-w-[120px]">
                        <div
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{
                            backgroundColor: parseFloat(dimension.user) === 0 ? '#e5e7eb' : COLORS[index % COLORS.length]
                          }}
                        />
                        <span className={`font-medium text-xs sm:text-sm ${parseFloat(dimension.user) === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                          {emotionNameMapping[dimension.dimension] || dimension.dimension}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <Chip
                          color={parseFloat(dimension.user) === 0 ? "default" : "primary"}
                          variant="flat"
                          size="sm"
                          classNames={{
                            content: `text-xs font-medium ${parseFloat(dimension.user) === 0 ? 'text-gray-500' : ''}`
                          }}
                        >
                          {dimension.user}
                          {parseFloat(dimension.user) === 0 && <span className="text-xs ml-1">(no data)</span>}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-center text-xs sm:text-sm ${parseFloat(dimension.center) === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                        {dimension.center}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-center text-xs sm:text-sm ${parseFloat(dimension.global) === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                        {dimension.global}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip color={getStatusColor(dimension.status)} variant="flat" size="sm" classNames={{ content: `text-xs font-medium` }}>
                          <div className="flex gap-2 items-center">
                            <p>{dimension.status}</p>
                            {dimension.status === "No Data" && (
                              <Tooltip content="No submissions recorded for this dimension">
                                <Info className="h-3 w-3 ml-1 cursor-pointer" />
                              </Tooltip>
                            )}
                          </div>
                        </Chip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}