import { useContext, useState, useEffect, useMemo } from "react"

import { Award, Target, TrendingUp, Activity, Info, RefreshCw, AlertCircle, Calendar, Trophy, Users, Globe, Building } from "lucide-react"

import { Card, CardBody, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Spinner, Button, Tabs, Tab } from "@heroui/react"

import { AppContext } from "../../../contexts/app_context"

import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

import getCoordinatorDashboard from "../../../functions/collaborator/dashboard/getCoordinatorDashboard"

import getMyDashBoardCoordinator from "../../../functions/collaborator/dashboard/getMyDashboard"




export default function HomePage() {

    const { user } = useContext(AppContext)

    const [isLoading, setIsLoading] = useState(true)

    const [memberDashboardData, setMemberDashboardData] = useState(null)

    const [coordinatorDashboardData, setCoordinatorDashboardData] = useState(null)

    const [error, setError] = useState(null)

    const [isBest, setIsBest] = useState(false)

    const [selectedDimension, setSelectedDimension] = useState("motivation")

    const [startYear, setStartYear] = useState("")

    const [endYear, setEndYear] = useState("")

    const [activeTab, setActiveTab] = useState(user?.role === "coordinator" ? "coordinator" : "member")

    const emotionNameMapping = {
        'motivation': 'Motivation',
        'skills': 'Skills',
        'engagement': 'Engagement',
        'collaboration': 'Collaboration',
        'innovation': 'Innovation',
        'leadership': 'Leadership',
        'impact': 'Impact',
        'others': 'Others'
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#A4DE6C']

    // MEMBER DASHBOARD FUNCTIONS
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
        dimensionsData: [],
        dimensionDistribution: [],
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

    const getZeroDataCoordinator = () => ({
        stats: [
            {
                title: "Your Research Unit",
                value: 0,
                description: "Average score of your research center",
                color: "from-blue-500 to-cyan-500",
                icon: Users
            },
            {
                title: "Best Research Unit",
                value: 0,
                description: "Average score of the best research center",
                color: "from-green-500 to-emerald-500",
                icon: Trophy
            },
            {
                title: "Global Score",
                value: 0,
                description: "Average score of all research centers",
                color: "from-purple-500 to-pink-500",
                icon: Globe
            }
        ],
        dimensionsData: [],
        dimensionDistribution: [],
        progressByYear: {
            userCenter: [],
            bestCenter: [],
            global: []
        },
        centersInfo: {
            userCenter: null,
            bestCenter: null,
            userCenterId: null
        },
        counts: {
            userCenter: 0,
            bestCenter: 0,
            global: 0
        },
        comparisons: {},
        allCentersRanking: [],
        metadata: {},
        table: [],
        chartData: {}
    })

    const transformMemberApiData = (apiData) => {

        console.log("\n\n", apiData.data, "\n\n")

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
                order: index,
                status: item.status || "No Data"
            }
        })

        // Criar dados para gráfico de pizza
        const dimensionDistribution = table.map(item => ({

            name: emotionNameMapping[item.dimension] || item.dimension,

            value: parseFloat(item.user) || 0

        }))

        // Processar chartData para o gráfico de progresso - CORRIGIDO
        const processedProgressByYear = {
            user: [],
            center: [],
            global: []
        }

        // Extrair anos do chartData
        const years = Object.keys(chartData || {})

        // Para cada ano, agregar todas as dimensões em um único objeto
        years.forEach(year => {
            const yearData = chartData[year] || []

            // Calcular média total para o usuário neste ano
            const userTotalAvg = yearData.reduce((sum, dim) => sum + (dim.user || 0), 0) / (yearData.length || 1)
            // Calcular média total para o centro neste ano
            const centerTotalAvg = yearData.reduce((sum, dim) => sum + (dim.center || 0), 0) / (yearData.length || 1)
            // Calcular média total para o global neste ano
            const globalTotalAvg = yearData.reduce((sum, dim) => sum + (dim.global || 0), 0) / (yearData.length || 1)

            // Criar uma única entrada por ano para cada categoria
            processedProgressByYear.user.push({
                year: parseInt(year),
                totalAverage: userTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.user || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })

            processedProgressByYear.center.push({
                year: parseInt(year),
                totalAverage: centerTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.center || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })

            processedProgressByYear.global.push({
                year: parseInt(year),
                totalAverage: globalTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.global || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })
        })

        // Encontrar a primeira dimensão com dados para selecionar por padrão
        const defaultDimension = table.find(item => parseFloat(item.user) > 0)?.dimension || "motivation"

        // Calcular range de anos disponíveis
        let yearRange = null
        const allYears = years.map(y => parseInt(y)).filter(Boolean)

        if (allYears.length > 0) {
            const minYear = Math.min(...allYears)
            const maxYear = Math.max(...allYears)
            yearRange = { minYear, maxYear }
        }

        return {
            stats: [
                {
                    title: "Your Score",
                    value: parseFloat(userScore.toFixed(1)),
                    description: `Average of current submission`,
                    color: "from-blue-500 to-cyan-500"
                },
                {
                    title: "Research Unit Score",
                    value: parseFloat(centerScore.toFixed(1)),
                    description: `Average of ${center_sub} submissions in your center`,
                    color: "from-green-500 to-emerald-500"
                },
                {
                    title: "Global Score",
                    value: parseFloat(globalScore.toFixed(1)),
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
            progressByYear: processedProgressByYear,
            lastSubmission: last_submission,
            currentUser: user,
            userInfo: user,
            yearsCovered: {
                user: years,
                center: years,
                global: years
            },
            yearRange,
            table,
            chartData,
            samples: {
                userSubmissions: [],
                centerSubmissions: [],
                recentGlobalSubmissions: []
            }
        }
    }

    const transformCoordinatorApiData = (apiData) => {

        if (!apiData || !apiData.data) {
            return getZeroDataCoordinator()
        }


        const { userCenter = 0, bestCenter = 0, globalCenter = 0, userCenterSub = 0, bestCenterSub = 0, globalCenterSub = 0, table = [], chartData = {}, isUserCenterBest } = apiData.data

        setIsBest(isUserCenterBest)

        // Preparar dados das dimensões a partir da tabela
        const dimensionsData = table.map((item, index) => {

            const bestValue = parseFloat(item.best) || 0

            const centerValue = parseFloat(item.center) || 0

            const globalValue = parseFloat(item.global) || 0

            return {
                name: emotionNameMapping[item.dimension] || item.dimension,
                userCenter: centerValue,
                bestCenter: bestValue,
                global: globalValue,
                color: COLORS[index % COLORS.length],
                description: emotionNameMapping[item.dimension] || item.dimension,
                emotion: item.dimension,
                order: index,
                status: item.status || "No Data"
            }
        })

        // Criar dados para gráfico de pizza
        const dimensionDistribution = table.map(item => ({
            name: emotionNameMapping[item.dimension] || item.dimension,
            value: parseFloat(item.center) || 0
        }))

        // Processar chartData para o gráfico de progresso - CORRIGIDO
        const processedProgressByYear = {
            userCenter: [],
            bestCenter: [],
            global: []
        }

        // Extrair anos do chartData
        const years = Object.keys(chartData || {})

        // Para cada ano, agregar todas as dimensões em um único objeto
        years.forEach(year => {
            const yearData = chartData[year] || []

            // Calcular média total para o centro do usuário neste ano
            const userCenterTotalAvg = yearData.reduce((sum, dim) => sum + (dim.center || 0), 0) / (yearData.length || 1)
            // Calcular média total para o melhor centro neste ano
            const bestCenterTotalAvg = yearData.reduce((sum, dim) => sum + (dim.best || 0), 0) / (yearData.length || 1)
            // Calcular média total para o global neste ano
            const globalTotalAvg = yearData.reduce((sum, dim) => sum + (dim.global || 0), 0) / (yearData.length || 1)

            // Criar uma única entrada por ano para cada categoria
            processedProgressByYear.userCenter.push({
                year: parseInt(year),
                totalAverage: userCenterTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.center || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })

            processedProgressByYear.bestCenter.push({
                year: parseInt(year),
                totalAverage: bestCenterTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.best || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })

            processedProgressByYear.global.push({
                year: parseInt(year),
                totalAverage: globalTotalAvg,
                dimensions: yearData.map(dimData => ({
                    emotion: dimData.dimension,
                    name: emotionNameMapping[dimData.dimension] || dimData.dimension,
                    averageScore: dimData.global || 0,
                    order: dimensionsData.find(d => d.emotion === dimData.dimension)?.order || 0
                }))
            })
        })

        // Encontrar a primeira dimensão com dados para selecionar por padrão
        const defaultDimension = table.find(item => parseFloat(item.center) > 0)?.dimension || "motivation"

        // Calcular range de anos disponíveis
        let yearRange = null
        const allYears = years.map(y => parseInt(y)).filter(Boolean)

        if (allYears.length > 0) {
            const minYear = Math.min(...allYears)
            const maxYear = Math.max(...allYears)
            yearRange = { minYear, maxYear }
        }

        return {
            stats: [
                {
                    title: "Your Research Unit",
                    value: parseFloat(userCenter.toFixed(1)),
                    description: `Average of ${userCenterSub} submissions in your center`,
                    color: "from-blue-500 to-cyan-500",
                    icon: Users
                },
                {
                    title: "Best Research Unit",
                    value: parseFloat(bestCenter.toFixed(1)),
                    description: `Average of ${bestCenterSub} submissions in the best center`,
                    color: "from-green-500 to-emerald-500",
                    icon: Trophy
                },
                {
                    title: "Global Score",
                    value: parseFloat(globalCenter.toFixed(1)),
                    description: `Average of ${globalCenterSub} total submissions`,
                    color: "from-purple-500 to-pink-500",
                    icon: Globe
                }
            ],
            counts: {
                userCenter: userCenterSub,
                bestCenter: bestCenterSub,
                global: globalCenterSub
            },
            dimensionsData,
            defaultDimension,
            dimensionDistribution,
            progressByYear: processedProgressByYear,
            centersInfo: {
                userCenter: null,
                bestCenter: null
            },
            comparisons: {},
            allCentersRanking: [],
            metadata: {},
            yearsCovered: {
                userCenter: years,
                bestCenter: years,
                global: years
            },
            yearRange,
            table,
            chartData
        }
    }

    // Buscar dados quando o componente montar - carrega AMBOS os dashboards
    useEffect(() => {

        const fetchAllData = async () => {

            try {

                setIsLoading(true)

                setError(null)
                // Carregar ambos os dashboards em paralelo
                await Promise.all([getMyDashBoardCoordinator(setMemberDashboardData), getCoordinatorDashboard(setCoordinatorDashboardData)])

            } catch (err) {

                console.error("Error fetching dashboard:", err)

                setError("Failed to load dashboard data")

            } finally {

                setIsLoading(false)

            }

        }

        fetchAllData()

    }, [user])

    // Dados transformados baseados na tab ativa
    const transformedData = useMemo(() => {

        if (activeTab === "coordinator") {

            if (!coordinatorDashboardData) {

                return getZeroDataCoordinator()

            }

            return transformCoordinatorApiData(coordinatorDashboardData)

        } else {

            if (!memberDashboardData) {

                return getZeroData()

            }

            return transformMemberApiData(memberDashboardData)

        }

    }, [activeTab, memberDashboardData, coordinatorDashboardData])

    // Atualizar dimensão selecionada quando os dados mudam
    useEffect(() => {
        if (transformedData.defaultDimension && transformedData.defaultDimension !== selectedDimension) {
            setSelectedDimension(transformedData.defaultDimension)
        }
    }, [transformedData.defaultDimension])

    // Preparar opções de anos baseado nos dados de progresso
    const yearOptions = useMemo(() => {
        const allYears = new Set()

        if (activeTab === "coordinator") {
            // Adicionar anos do userCenter
            transformedData.progressByYear.userCenter?.forEach(p => allYears.add(p.year))
            // Adicionar anos do bestCenter
            transformedData.progressByYear.bestCenter?.forEach(p => allYears.add(p.year))
            // Adicionar anos globais
            transformedData.progressByYear.global?.forEach(p => allYears.add(p.year))
        } else {
            // Adicionar anos do usuário
            transformedData.progressByYear.user?.forEach(p => allYears.add(p.year))
            // Adicionar anos do centro
            transformedData.progressByYear.center?.forEach(p => allYears.add(p.year))
            // Adicionar anos globais
            transformedData.progressByYear.global?.forEach(p => allYears.add(p.year))
        }

        // Se não houver anos, usar o range se existir
        if (allYears.size === 0 && transformedData.yearRange) {
            const { minYear, maxYear } = transformedData.yearRange
            for (let year = minYear; year <= maxYear; year++) {
                allYears.add(year)
            }
        }

        // Se ainda não houver anos, usar últimos 5 anos
        if (allYears.size === 0) {
            const currentYear = new Date().getFullYear()
            for (let year = currentYear - 4; year <= currentYear; year++) {
                allYears.add(year)
            }
        }

        return Array.from(allYears).sort((a, b) => a - b).map(year => year.toString())
    }, [transformedData, activeTab])

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
        return yearOptions.filter(year => parseInt(year) >= start).map(year => ({ key: year, label: year }))
    }, [startYear, yearOptions])

    // Atualizar endYear quando startYear mudar
    useEffect(() => {
        if (startYear && endYear) {
            const start = parseInt(startYear)
            const end = parseInt(endYear)

            if (end < start) {
                // Se endYear for menor que startYear, definir para o mesmo ano ou o próximo disponível
                const newEndYear = endYearOptions.length > 0 ? endYearOptions[0].key : startYear
                setEndYear(newEndYear)
            }
        }
    }, [startYear, endYear, endYearOptions])

    // Preparar dados para o gráfico de progresso
    const prepareProgressChartData = useMemo(() => {
        const data = []

        if (!startYear || !endYear || !transformedData.progressByYear) {
            return data
        }

        const start = parseInt(startYear)
        const end = parseInt(endYear)

        // Para cada ano no range
        for (let year = start; year <= end; year++) {
            const yearStr = year.toString()

            if (activeTab === "coordinator") {
                // Encontrar dados do userCenter para este ano
                const userCenterYearData = transformedData.progressByYear.userCenter?.find(p => p.year === year)
                const bestCenterYearData = transformedData.progressByYear.bestCenter?.find(p => p.year === year)
                const globalYearData = transformedData.progressByYear.global?.find(p => p.year === year)

                // Encontrar a dimensão específica nos dados do ano
                const userCenterDim = userCenterYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )
                const bestCenterDim = bestCenterYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )
                const globalDim = globalYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )

                const userCenterValue = userCenterDim?.averageScore || 0
                const bestCenterValue = bestCenterDim?.averageScore || 0
                const globalValue = globalDim?.averageScore || 0

                data.push({
                    year: yearStr,
                    userCenter: userCenterValue,
                    bestCenter: bestCenterValue,
                    global: globalValue,
                    hasData: userCenterYearData || bestCenterYearData || globalYearData
                })
            } else {
                // Encontrar dados do usuário para este ano
                const userYearData = transformedData.progressByYear.user?.find(p => p.year === year)
                const centerYearData = transformedData.progressByYear.center?.find(p => p.year === year)
                const globalYearData = transformedData.progressByYear.global?.find(p => p.year === year)

                // Encontrar a dimensão específica nos dados do ano
                const userDim = userYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )
                const centerDim = centerYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )
                const globalDim = globalYearData?.dimensions?.find(d =>
                    d.emotion === selectedDimension || d.name === selectedDimension
                )

                const memberValue = userDim?.averageScore || 0
                const centerValue = centerDim?.averageScore || 0
                const globalValue = globalDim?.averageScore || 0

                data.push({
                    year: yearStr,
                    member: memberValue,
                    researchCenter: centerValue,
                    allCenters: globalValue,
                    hasData: userYearData || centerYearData || globalYearData
                })
            }
        }

        return data
    }, [selectedDimension, startYear, endYear, transformedData, activeTab])

    // Preparar dados da tabela
    const tableData = useMemo(() => {
        if (!transformedData?.dimensionsData || transformedData.dimensionsData.length === 0) {
            // Retornar dados zerados se não houver
            return Object.values(emotionNameMapping).map((name, index) => ({
                name,
                ...(activeTab === "coordinator" ? {
                    userCenter: 0,
                    bestCenter: 0,
                    global: 0
                } : {
                    member: 0,
                    researchCenter: 0,
                    allCenters: 0
                }),
                color: COLORS[index % COLORS.length],
                description: name,
                difference: 0,
                status: "No Data",
                statusColor: "default",
                id: index
            }))
        }

        return transformedData.dimensionsData.map((dimension, index) => {
            if (activeTab === "coordinator") {
                // Calcular diferença entre userCenter e bestCenter
                const difference = (dimension.userCenter || 0) - (dimension.bestCenter || 0)
                let status, statusColor

                if (dimension.userCenter === 0) {
                    status = "No Data"
                    statusColor = "default"
                } else {
                    status = difference > 10 ? "Above Average" : difference < -10 ? "Below Average" : "Average"
                    statusColor = status === "Above Average" ? "success" : status === "Below Average" ? "danger" : "warning"
                }

                return {
                    ...dimension,
                    userCenter: parseFloat(dimension.userCenter.toFixed(1)),
                    bestCenter: parseFloat(dimension.bestCenter.toFixed(1)),
                    global: parseFloat(dimension.global.toFixed(1)),
                    difference: parseFloat(difference.toFixed(1)),
                    status,
                    statusColor,
                    id: index
                }
            } else {
                const difference = (dimension.member || 0) - (dimension.researchCenter || 0)
                let status, statusColor

                if (dimension.member === 0) {
                    status = "No Data"
                    statusColor = "default"
                } else {
                    status = difference > 10 ? "Above Average" : difference < -10 ? "Below Average" : "Average"
                    statusColor = status === "Above Average" ? "success" : status === "Below Average" ? "danger" : "warning"
                }

                return {
                    ...dimension,
                    member: parseFloat(dimension.member.toFixed(1)),
                    researchCenter: parseFloat(dimension.researchCenter.toFixed(1)),
                    allCenters: parseFloat(dimension.allCenters.toFixed(1)),
                    difference: parseFloat(difference.toFixed(1)),
                    status,
                    statusColor,
                    id: index
                }
            }
        })
    }, [transformedData?.dimensionsData, activeTab])

    // Opções de dimensão para o select (apenas dimensões específicas)
    const dimensionOptions = useMemo(() => {
        const options = []

        // Adicionar apenas dimensões do usuário/userCenter
        transformedData.dimensionsData?.forEach(dim => {
            options.push({
                key: dim.emotion || dim.name,
                label: dim.name
            })
        })

        return options
    }, [transformedData.dimensionsData])

    // Calcular anos cobertos
    const yearsCoveredText = useMemo(() => {
        if (transformedData.yearsCovered) {
            if (activeTab === "coordinator") {
                const { userCenter = [], bestCenter = [], global = [] } = transformedData.yearsCovered
                return {
                    userCenter: userCenter.length > 0 ? `${userCenter.length} years (${Math.min(...userCenter)}-${Math.max(...userCenter)})` : "No years",
                    bestCenter: bestCenter.length > 0 ? `${bestCenter.length} years` : "No years",
                    global: global.length > 0 ? `${global.length} years` : "No years"
                }
            } else {
                const { user = [], center = [], global = [] } = transformedData.yearsCovered
                return {
                    user: user.length > 0 ? `${user.length} years (${Math.min(...user)}-${Math.max(...user)})` : "No years",
                    center: center.length > 0 ? `${center.length} years` : "No years",
                    global: global.length > 0 ? `${global.length} years` : "No years"
                }
            }
        }
        return activeTab === "coordinator"
            ? { userCenter: "No data", bestCenter: "No data", global: "No data" }
            : { user: "No data", center: "No data", global: "No data" }
    }, [transformedData.yearsCovered, activeTab])

    // Encontrar nome da dimensão selecionada
    const selectedDimensionName = useMemo(() => {
        const dim = transformedData.dimensionsData?.find(d =>
            d.emotion === selectedDimension || d.name === selectedDimension
        )
        return dim?.name || selectedDimension
    }, [selectedDimension, transformedData.dimensionsData])

    // Se estiver carregando, mostrar spinner
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-4 text-gray-600">Loading dashboards...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header com tabs */}
            <div className="mb-6 sm:mb-8 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent lg:pt-20 pb-26">
                <div className="flex justify-between items-start flex-wrap gap-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="mb-2 text-5xl md:text-6xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Research unit EDI coordinator</h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            Here will be possible to average your EDI of your research unit
                        </p>
                    </div>
                </div>

                {/* Tabs para alternar entre os dashboards */}
                <div className="mt-2 flex justify-between items-start flex-wrap gap-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(key) => setActiveTab(key)}
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6",
                            cursor: "w-full bg-blue-500",
                            tab: "px-0 h-12"
                        }}
                    >
                        <Tab
                            key="coordinator"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Building className="h-4 w-4" />
                                    <span>Your Research Unit Track</span>
                                </div>
                            }
                        />
                        <Tab
                            key="member"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Award className="h-4 w-4" />
                                    <span>Your Track</span>
                                </div>
                            }
                        />
                    </Tabs>
                </div>

                {error && (
                    <div className="mt-4 flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <p className="text-yellow-800 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-6">
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-2 sm:overflow-visible sm:mx-0 sm:px-0">
                    {transformedData.stats.map((stat, index) => {
                        let Icon
                        if (activeTab === "coordinator") {
                            Icon = stat.icon || Trophy
                        } else {
                            if (stat.title === "Your Score") Icon = Award
                            else if (stat.title === "Research Unit Score") Icon = Target
                            else Icon = TrendingUp
                        }

                        return (
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
                                                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Tooltip>
                        )
                    })}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-2 sm:gap-2 mb-6 sm:mb-8">
                    {/* Yearly Progress Chart */}
                    <Card className="border-none xl:col-span-3 bg-gradient-to-br from-white to-gray-50/80 shadow">
                        <CardBody className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-2" />
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
                            <div className="h-64 sm:h-80 lg:h-96">
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
                                                return numValue > 0 ? [numValue.toFixed(1), 'Score'] : ['No data', 'Score']
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
                                                                        {p.name}: {numValue > 0 ? numValue.toFixed(1) : 'No data'}
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
                                        {activeTab === "coordinator" ? (
                                            <>
                                                <Line
                                                    type="monotone"
                                                    dataKey="userCenter"
                                                    stroke="#0088FE"
                                                    strokeWidth={2}
                                                    name="Your RU Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#0088FE",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#0088FE" }}
                                                    connectNulls={true}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="bestCenter"
                                                    stroke="#00C49F"
                                                    strokeWidth={2}
                                                    name="Best RU Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#00C49F",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#00C49F" }}
                                                    connectNulls={true}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="global"
                                                    stroke="#FFBB28"
                                                    strokeWidth={2}
                                                    name="Global Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#FFBB28",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#FFBB28" }}
                                                    connectNulls={true}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Line
                                                    type="monotone"
                                                    dataKey="member"
                                                    stroke="#0088FE"
                                                    strokeWidth={2}
                                                    name="Your Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#0088FE",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#0088FE" }}
                                                    connectNulls={true}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="researchCenter"
                                                    stroke="#00C49F"
                                                    strokeWidth={2}
                                                    name="RU Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#00C49F",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#00C49F" }}
                                                    connectNulls={true}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="allCenters"
                                                    stroke="#FFBB28"
                                                    strokeWidth={2}
                                                    name="Global Score"
                                                    dot={{
                                                        r: 4,
                                                        stroke: "#FFBB28",
                                                        strokeWidth: 2,
                                                        fill: "#fff",
                                                        fillOpacity: 1
                                                    }}
                                                    activeDot={{ r: 6, fill: "#FFBB28" }}
                                                    connectNulls={true}
                                                />
                                            </>
                                        )}
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
                                {activeTab === "coordinator" ? "Your RU Dimension Distribution" : "Dimension Distribution"}
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
                                                return value === 0 ? ['0 (no data)', name] : [parseFloat(value).toFixed(1), name]
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-xs text-gray-500">
                                <p>{activeTab === "coordinator" ? "Distribution of your research unit's scores across dimensions" : "Distribution of your scores across dimensions"}</p>
                                {transformedData.dimensionDistribution && transformedData.dimensionDistribution.every(d => d.value === 0) && (
                                    <p className="text-gray-400 italic">
                                        {activeTab === "coordinator" ? "No dimension data available for your research unit" : "No dimension data available"}
                                    </p>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Detailed Metrics Table Close to Best */}
                <Card className="border-none bg-white shadow mb-6 sm:mb-8">
                    <CardBody className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Detailed Score Metrics</h3>
                            <div className="flex gap-2">
                                {(activeTab === "coordinator" ? transformedData.stats[0].value === 0 : transformedData.stats[0].value === 0) && (
                                    <Chip color="warning" variant="flat" size="sm">
                                        {activeTab === "coordinator" ? "No Data Available for Your RU" : "No Data Available"}
                                    </Chip>
                                )}
                                {activeTab === "coordinator" && isBest && (
                                    <Chip color="success" variant="flat" size="sm">
                                        Your RU is the Best!
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
                                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">
                                    {activeTab === "coordinator" ? "Your RU Score" : "Your Score"}
                                </TableColumn>
                                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">
                                    {activeTab === "coordinator" ? "Best RU Score" : "RU Score"}
                                </TableColumn>
                                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">Global Score</TableColumn>
                                <TableColumn className="bg-gray-50 text-center text-xs sm:text-sm font-semibold">Your Position</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {tableData.map((dimension) => (
                                    <TableRow key={dimension.id} className="border-b hover:bg-gray-50/50">
                                        <TableCell>
                                            <div className="flex items-center min-w-[120px]">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                                    style={{
                                                        backgroundColor: (activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 ? '#e5e7eb' : dimension.color
                                                    }}
                                                />
                                                <span className={`font-medium text-xs sm:text-sm ${(activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {dimension.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <Chip
                                                    color={(activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 ? "default" : "primary"}
                                                    variant="flat"
                                                    size="sm"
                                                    classNames={{
                                                        content: `text-xs font-medium ${(activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 ? 'text-gray-500' : ''}`
                                                    }}
                                                >
                                                    {activeTab === "coordinator" ? dimension.userCenter : dimension.member}
                                                    {(activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 && <span className="text-xs ml-1">(no data)</span>}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`text-center text-xs sm:text-sm ${(activeTab === "coordinator" ? dimension.bestCenter : dimension.researchCenter) === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {activeTab === "coordinator" ? dimension.bestCenter : dimension.researchCenter}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`text-center text-xs sm:text-sm ${dimension.global === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {dimension.global}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Chip color={dimension.statusColor} variant="flat" size="sm" classNames={{ content: `text-xs font-medium` }}>
                                                    <div className="flex gap-2 items-center">
                                                        <p>{dimension.status}</p>
                                                        {dimension.status === "No Data" && (
                                                            <Tooltip content={
                                                                activeTab === "coordinator"
                                                                    ? "No submissions recorded for this dimension in your research unit"
                                                                    : "No submissions recorded for this dimension"
                                                            }>
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