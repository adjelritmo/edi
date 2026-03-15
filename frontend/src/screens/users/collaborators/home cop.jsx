import { useContext, useState, useEffect, useMemo } from "react"

import { Award, Target, TrendingUp, Activity, Info, RefreshCw, AlertCircle, Calendar, Trophy, Users, Globe, Building } from "lucide-react"

import { Card, CardBody, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Spinner, Button, Tabs, Tab } from "@heroui/react"

import { AppContext } from "../../../contexts/app_context"

import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

import getCoordinatorDashboard from "../../../functions/collaborator/dashboard/getCoordinatorDashboard"

import getMyDashBoardCoordinator from "../../../functions/collaborator/dashboard/getMyDashboard"





export default function HomePage() {

    const { user, setDashboard_data } = useContext(AppContext)

    const [isLoading, setIsLoading] = useState(true)

    const [memberDashboardData, setMemberDashboardData] = useState(null)

    const [coordinatorDashboardData, setCoordinatorDashboardData] = useState(null)

    const [error, setError] = useState(null)

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
        dimensionsData: Object.values(emotionNameMapping).map((name, index) => ({
            name,
            member: 0,
            researchCenter: 0,
            allCenters: 0,
            color: COLORS[index % COLORS.length],
            description: name,
            emotion: Object.keys(emotionNameMapping).find(key => emotionNameMapping[key] === name) || 'others'
        })),
        dimensionDistribution: Object.values(emotionNameMapping).map((name, index) => ({
            name,
            value: 0
        })),
        progressByYear: {
            user: [],
            center: [],
            global: []
        },
        dimensionAveragesByYear: {
            user: {},
            center: {},
            global: {}
        },
        lastSubmission: null,
        currentUser: null,
        userInfo: null,
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
        //counts: {
        //    userCenter: 0,
        //    bestCenter: 0,
        //    global: 0
        //},
        dimensionsData: Object.values(emotionNameMapping).map((name, index) => ({
            name,
            userCenter: 0,
            bestCenter: 0,
            global: 0,
            color: COLORS[index % COLORS.length],
            description: name,
            emotion: Object.keys(emotionNameMapping).find(key => emotionNameMapping[key] === name) || 'others'
        })),
        dimensionDistribution: Object.values(emotionNameMapping).map((name, index) => ({
            name,
            value: 0
        })),
        progressByYear: {
            userCenter: [],
            bestCenter: [],
            global: []
        },
        dimensionAveragesByYear: {
            userCenter: {},
            bestCenter: {},
            global: {}
        },
        centersInfo: {
            userCenter: null,
            bestCenter: null,
            userCenterId: null
        },
        counts: {
            userCenter: 0,
            global: 0,
            bestCenter: 0,
            totalCenters: 0,
            yearsCovered: {
                userCenter: [],
                global: [],
                bestCenter: []
            }
        },
        comparisons: {
            userCenterVsGlobal: null,
            userCenterVsBestCenter: null,
            bestCenterVsGlobal: null
        },
        allCentersRanking: [],
        metadata: {
            hasBestCenter: false,
            isUserCenterBest: false,
            totalSubmissions: 0,
            calculationDate: new Date().toISOString()
        }
    })

    const transformMemberApiData = (apiData) => {
        if (!apiData || !apiData.data) {
            return getZeroData()
        }

        const {
            totalAverages = {},
            progressByYear = { user: [], center: [], global: [] },
            dimensionAveragesByYear = { user: {}, center: {}, global: {} },
            counts = { user: 0, center: 0, global: 0 },
            currentUser = null,
            userInfo = null,
            lastUserSubmission = null,
            userDimensions = [],
            centerDimensions = [],
            globalDimensions = [],
            yearsCovered = { user: [], center: [], global: [] }
        } = apiData.data

        // Extrair médias totais
        const userAverage = totalAverages.user || 0
        const centerAverage = totalAverages.center || 0
        const globalAverage = totalAverages.global || 0

        // Calcular estatísticas principais (convertendo para porcentagem)
        const userOverallScore = userAverage * 20 // Convertendo de escala 1-5 para 0-100%
        const centerScore = centerAverage * 20
        const globalScore = globalAverage * 20

        // Preparar dados das dimensões
        let dimensionsData
        if (!userDimensions || userDimensions.length === 0) {
            // Se não houver dimensões, criar array zerado
            dimensionsData = Object.values(emotionNameMapping).map((name, index) => ({
                name,
                member: 0,
                researchCenter: centerScore,
                allCenters: globalScore,
                color: COLORS[index % COLORS.length],
                description: name,
                emotion: Object.keys(emotionNameMapping).find(key => emotionNameMapping[key] === name) || 'others'
            }))
        } else {
            // Usar as dimensões do usuário como base
            dimensionsData = userDimensions.map((dim, index) => {
                // Encontrar dimensões correspondentes no center e global
                const centerDim = centerDimensions?.find(d => d.emotion === dim.emotion)
                const globalDim = globalDimensions?.find(d => d.emotion === dim.emotion)

                // Converter scores para porcentagem (escala de 1-5 para 0-100%)
                const memberScore = dim.averageScore ? parseFloat((dim.averageScore * 20).toFixed(1)) : 0
                const researchCenterScore = centerDim?.averageScore ? parseFloat((centerDim.averageScore * 20).toFixed(1)) : 0
                const allCentersScore = globalDim?.averageScore ? parseFloat((globalDim.averageScore * 20).toFixed(1)) : 0

                return {
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    member: memberScore,
                    researchCenter: researchCenterScore,
                    allCenters: allCentersScore,
                    color: COLORS[index % COLORS.length],
                    description: dim.description || emotionNameMapping[dim.emotion] || dim.emotion,
                    emotion: dim.emotion,
                    order: dim.order || index
                }
            })

            // Adicionar dimensões que possam estar faltando
            const existingEmotions = new Set(dimensionsData.map(d => d.emotion))
            Object.entries(emotionNameMapping).forEach(([emotion, name], index) => {
                if (!existingEmotions.has(emotion)) {
                    dimensionsData.push({
                        name,
                        member: 0,
                        researchCenter: centerScore,
                        allCenters: globalScore,
                        color: COLORS[dimensionsData.length % COLORS.length],
                        description: name,
                        emotion,
                        order: dimensionsData.length + index
                    })
                }
            })

            // Ordenar pela ordem
            dimensionsData.sort((a, b) => (a.order || 0) - (b.order || 0))
        }

        // Criar dados para gráfico de pizza usando userAverage por dimensão
        const dimensionDistribution = dimensionsData.map(dim => ({
            name: dim.name,
            value: dim.member || 0
        }))

        // Processar progresso por ano
        const processedProgressByYear = {
            user: (progressByYear.user || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)), // Converter para %
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)), // Converter para %
                    order: dim.order
                })) || []
            })),
            center: (progressByYear.center || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)),
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)),
                    order: dim.order
                })) || []
            })),
            global: (progressByYear.global || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)),
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)),
                    order: dim.order
                })) || []
            }))
        }

        // Processar última submissão se existir
        let lastSubmission = null
        if (lastUserSubmission) {
            const { submissionId, submittedAt, timeSpent, totalScore, calculatedAverage, formId, center, user: submitter, dimensionScores = [] } = lastUserSubmission

            const formattedDimensionScores = dimensionScores.map(dim => ({
                name: emotionNameMapping[dim.emotion] || dim.emotion,
                value: dim.averageScore ? parseFloat((dim.averageScore * 20).toFixed(1)) : 0
            }))

            lastSubmission = {
                id: submissionId,
                submittedAt: submittedAt,
                year: lastUserSubmission.year,
                timeSpent: timeSpent,
                point: totalScore || calculatedAverage,
                formId: formId,
                center: center,
                user: submitter,
                dimensionScores: formattedDimensionScores
            }
        }

        // Calcular range de anos disponíveis
        let yearRange = null
        const allYears = [
            ...processedProgressByYear.user.map(p => p.year),
            ...processedProgressByYear.center.map(p => p.year),
            ...processedProgressByYear.global.map(p => p.year)
        ].filter(Boolean)

        if (allYears.length > 0) {
            const minYear = Math.min(...allYears)
            const maxYear = Math.max(...allYears)
            yearRange = { minYear, maxYear }
        } else if (lastSubmission && lastSubmission.year) {
            yearRange = { minYear: lastSubmission.year, maxYear: lastSubmission.year }
        }

        // Encontrar a primeira dimensão com dados para selecionar por padrão
        let defaultDimension = dimensionsData.find(d => d.member > 0)?.emotion || "motivation"

        // Atualizar contexto apenas se for a tab ativa
        if (activeTab === "member") {
            setDashboard_data({
                stats: [
                    {
                        title: "Your Score",
                        value: parseFloat(userOverallScore.toFixed(1)),
                        description: `Average of ${counts.user} submissions`,
                        color: "from-blue-500 to-cyan-500"
                    },
                    {
                        title: "Research Unit Score",
                        value: parseFloat(centerScore.toFixed(1)),
                        description: `Average of ${counts.center} submissions in your center`,
                        color: "from-green-500 to-emerald-500"
                    },
                    {
                        title: "Global Score",
                        value: parseFloat(globalScore.toFixed(1)),
                        description: `Average of ${counts.global} total submissions`,
                        color: "from-purple-500 to-pink-500"
                    }
                ],
                counts,
                dimensionsData,
                defaultDimension,
                dimensionDistribution,
                progressByYear: processedProgressByYear,
                dimensionAveragesByYear,
                lastSubmission,
                currentUser,
                userInfo,
                yearsCovered,
                yearRange,
                samples: {
                    userSubmissions: [],
                    centerSubmissions: [],
                    recentGlobalSubmissions: []
                }
            })
        }

        return {
            stats: [
                {
                    title: "Your Score",
                    value: parseFloat(userOverallScore.toFixed(1)),
                    description: `Average of ${counts.user} submissions`,
                    color: "from-blue-500 to-cyan-500"
                },
                {
                    title: "Research Unit Score",
                    value: parseFloat(centerScore.toFixed(1)),
                    description: `Average of ${counts.center} submissions in your center`,
                    color: "from-green-500 to-emerald-500"
                },
                {
                    title: "Global Score",
                    value: parseFloat(globalScore.toFixed(1)),
                    description: `Average of ${counts.global} total submissions`,
                    color: "from-purple-500 to-pink-500"
                }
            ],
            counts,
            dimensionsData,
            defaultDimension,
            dimensionDistribution,
            progressByYear: processedProgressByYear,
            dimensionAveragesByYear,
            lastSubmission,
            currentUser,
            userInfo,
            yearsCovered,
            yearRange,
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

        const {
            totalAverages = {},
            dimensionAverages = {},
            progressByYear = { userCenter: [], bestCenter: [], global: [] },
            dimensionAveragesByYear = { userCenter: {}, bestCenter: {}, global: {} },
            counts = { userCenter: 0, bestCenter: 0, global: 0 },
            centersInfo = { userCenter: null, bestCenter: null },
            comparisons = {},
            allCentersRanking = [],
            metadata = {}
        } = apiData.data

        // Extrair médias totais
        const userCenterAverage = totalAverages.userCenter || 0
        const bestCenterAverage = totalAverages.bestCenter || 0
        const globalAverage = totalAverages.global || 0

        // Calcular estatísticas principais (convertendo para porcentagem)
        const userCenterScore = userCenterAverage * 20 // Convertendo de escala 1-5 para 0-100%
        const bestCenterScore = bestCenterAverage * 20
        const globalScore = globalAverage * 20

        // Preparar dados das dimensões
        let dimensionsData
        const userCenterDims = dimensionAverages.userCenter || []
        const bestCenterDims = dimensionAverages.bestCenter || []
        const globalDims = dimensionAverages.global || []

        if (!userCenterDims || userCenterDims.length === 0) {
            // Se não houver dimensões, criar array zerado
            dimensionsData = Object.values(emotionNameMapping).map((name, index) => ({
                name,
                userCenter: 0,
                bestCenter: bestCenterScore,
                global: globalScore,
                color: COLORS[index % COLORS.length],
                description: name,
                emotion: Object.keys(emotionNameMapping).find(key => emotionNameMapping[key] === name) || 'others'
            }))
        } else {
            // Usar as dimensões do userCenter como base
            dimensionsData = userCenterDims.map((dim, index) => {
                // Encontrar dimensões correspondentes no bestCenter e global
                const bestCenterDim = bestCenterDims?.find(d => d.emotion === dim.emotion)
                const globalDim = globalDims?.find(d => d.emotion === dim.emotion)

                // Converter scores para porcentagem (escala de 1-5 para 0-100%)
                const userCenterScore = dim.averageScore ? parseFloat((dim.averageScore * 20).toFixed(1)) : 0
                const bestCenterScoreValue = bestCenterDim?.averageScore ? parseFloat((bestCenterDim.averageScore * 20).toFixed(1)) : 0
                const globalScoreValue = globalDim?.averageScore ? parseFloat((globalDim.averageScore * 20).toFixed(1)) : 0

                return {
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    userCenter: userCenterScore,
                    bestCenter: bestCenterScoreValue,
                    global: globalScoreValue,
                    color: COLORS[index % COLORS.length],
                    description: dim.description || emotionNameMapping[dim.emotion] || dim.emotion,
                    emotion: dim.emotion,
                    order: dim.order || index
                }
            })

            // Adicionar dimensões que possam estar faltando
            const existingEmotions = new Set(dimensionsData.map(d => d.emotion))
            Object.entries(emotionNameMapping).forEach(([emotion, name], index) => {
                if (!existingEmotions.has(emotion)) {
                    dimensionsData.push({
                        name,
                        userCenter: 0,
                        bestCenter: bestCenterScore,
                        global: globalScore,
                        color: COLORS[dimensionsData.length % COLORS.length],
                        description: name,
                        emotion,
                        order: dimensionsData.length + index
                    })
                }
            })

            // Ordenar pela ordem
            dimensionsData.sort((a, b) => (a.order || 0) - (b.order || 0))
        }

        // Criar dados para gráfico de pizza usando userCenter por dimensão
        const dimensionDistribution = dimensionsData.map(dim => ({
            name: dim.name,
            value: dim.userCenter || 0
        }))

        // Processar progresso por ano
        const processedProgressByYear = {
            userCenter: (progressByYear.userCenter || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)), // Converter para %
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)), // Converter para %
                    order: dim.order
                })) || []
            })),
            bestCenter: (progressByYear.bestCenter || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)),
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)),
                    order: dim.order
                })) || []
            })),
            global: (progressByYear.global || []).map(yearData => ({
                year: yearData.year,
                totalAverage: parseFloat((yearData.totalAverage * 20).toFixed(1)),
                count: yearData.count || 0,
                dimensions: yearData.dimensions?.map(dim => ({
                    emotion: dim.emotion,
                    name: emotionNameMapping[dim.emotion] || dim.emotion,
                    averageScore: parseFloat((dim.averageScore * 20).toFixed(1)),
                    order: dim.order
                })) || []
            }))
        }

        // Calcular range de anos disponíveis
        let yearRange = null
        const allYears = [
            ...processedProgressByYear.userCenter.map(p => p.year),
            ...processedProgressByYear.bestCenter.map(p => p.year),
            ...processedProgressByYear.global.map(p => p.year)
        ].filter(Boolean)

        if (allYears.length > 0) {
            const minYear = Math.min(...allYears)
            const maxYear = Math.max(...allYears)
            yearRange = { minYear, maxYear }
        }

        // Encontrar a primeira dimensão com dados para selecionar por padrão
        let defaultDimension = dimensionsData.find(d => d.userCenter > 0)?.emotion || "motivation"

        // Atualizar contexto apenas se for a tab ativa
        if (activeTab === "coordinator") {
            setDashboard_data({
                stats: [
                    {
                        title: "Your Research Unit",
                        value: parseFloat(userCenterScore.toFixed(1)),
                        description: `Average of ${counts.userCenter} submissions in your center`,
                        color: "from-blue-500 to-cyan-500",
                        icon: Users
                    },
                    {
                        title: "Best Research Unit",
                        value: parseFloat(bestCenterScore.toFixed(1)),
                        description: `Average of ${counts.bestCenter} submissions in the best center`,
                        color: "from-green-500 to-emerald-500",
                        icon: Trophy
                    },
                    {
                        title: "Global Score",
                        value: parseFloat(globalScore.toFixed(1)),
                        description: `Average of ${counts.global} total submissions`,
                        color: "from-purple-500 to-pink-500",
                        icon: Globe
                    }
                ],
                counts,
                dimensionsData,
                defaultDimension,
                dimensionDistribution,
                progressByYear: processedProgressByYear,
                dimensionAveragesByYear,
                centersInfo,
                comparisons,
                allCentersRanking,
                metadata,
                yearsCovered: counts.yearsCovered || { userCenter: [], bestCenter: [], global: [] },
                yearRange,
                samples: {
                    userCenterSubmissions: [],
                    bestCenterSubmissions: [],
                    recentGlobalSubmissions: []
                }
            })
        }

        return {
            stats: [
                {
                    title: "Your Research Unit",
                    value: parseFloat(userCenterScore.toFixed(1)),
                    description: `Average of ${counts.userCenter} submissions in your center`,
                    color: "from-blue-500 to-cyan-500",
                    icon: Users
                },
                {
                    title: "Best Research Unit",
                    value: parseFloat(bestCenterScore.toFixed(1)),
                    description: `Average of ${counts.bestCenter} submissions in the best center`,
                    color: "from-green-500 to-emerald-500",
                    icon: Trophy
                },
                {
                    title: "Global Score",
                    value: parseFloat(globalScore.toFixed(1)),
                    description: `Average of ${counts.global} total submissions`,
                    color: "from-purple-500 to-pink-500",
                    icon: Globe
                }
            ],
            counts,
            dimensionsData,
            defaultDimension,
            dimensionDistribution,
            progressByYear: processedProgressByYear,
            dimensionAveragesByYear,
            centersInfo,
            comparisons,
            allCentersRanking,
            metadata,
            yearsCovered: counts.yearsCovered || { userCenter: [], bestCenter: [], global: [] },
            yearRange
        }
    }

    // Buscar dados quando o componente montar - carrega AMBOS os dashboards
    useEffect(() => {

        const fetchAllData = async () => {

            try {

                setIsLoading(true)

                setError(null)

                // Carregar ambos os dashboards em paralelo
                const [memberData, coordinatorData] = await Promise.all([getMyDashBoardCoordinator(setMemberDashboardData), getCoordinatorDashboard(setCoordinatorDashboardData)])


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

    // Atualizar contexto quando a tab mudar
    useEffect(() => {
        if (activeTab === "coordinator" && coordinatorDashboardData) {
            transformCoordinatorApiData(coordinatorDashboardData)
        } else if (activeTab === "member" && memberDashboardData) {
            transformMemberApiData(memberDashboardData)
        }
    }, [activeTab])

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
        if (!transformedData?.dimensionsData) {
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
                    status = difference > 10 ? "Above Best" : difference < -10 ? "Below Best" : "Close to Best"
                    statusColor = status === "Above Best" ? "success" : status === "Below Best" ? "danger" : "warning"
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

    // Função para atualizar dados
    const fetchDashboardData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            if (activeTab === "coordinator") {
                const data = await getCoordinatorDashboard()
                setCoordinatorDashboardData(data)
            } else {
                const data = await getMyDashBoard()
                setMemberDashboardData(data)
            }
        } catch (err) {
            setError("Failed to refresh data. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

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

    // Determinar título e descrição baseado na tab ativa
    const dashboardTitle = activeTab === "coordinator" ? "Research Unit Dashboard" : "Member Dashboard"
    const dashboardDescription = activeTab === "coordinator"
        ? (user ? `Welcome back, ${user.firstName} ${user.surname}, this is your research unit's performance compared to others` : 'Track your research unit performance across all EDI+ dimensions')
        : (user ? `Welcome back, ${user.firstName} ${user.surname}, this is your score across all EDI+ dimensions` : 'Track your score across all EDI+ dimensions')

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
                    <div className="mt-4 flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
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
                                                    {stat.value}%
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
                                            domain={[0, 100]}
                                            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                                            fontSize={12}
                                        />
                                        <RechartsTooltip
                                            formatter={(value) => {
                                                const numValue = parseFloat(value)
                                                return numValue > 0 ? [`${numValue.toFixed(1)}%`, 'Score'] : ['No data', 'Score']
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
                                                                        {p.name}: {numValue > 0 ? `${numValue.toFixed(1)}%` : 'No data'}
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
                                                    strokeDasharray={transformedData.stats[0].value === 0 ? "5 5" : "0"}
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
                                                    strokeDasharray={transformedData.stats[1].value === 0 ? "5 5" : "0"}
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
                                                    strokeDasharray={transformedData.stats[2].value === 0 ? "5 5" : "0"}
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
                                                    strokeDasharray={transformedData.stats[0].value === 0 ? "5 5" : "0"}
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
                                                    strokeDasharray={transformedData.stats[1].value === 0 ? "5 5" : "0"}
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
                                                    strokeDasharray={transformedData.stats[2].value === 0 ? "5 5" : "0"}
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
                            <div className="h-64 sm:h-80 lg:h-96">
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
                                                return value === 0 ? ['0% (no data)', name] : [`${parseFloat(value).toFixed(1)}%`, name]
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

                {/* Detailed Metrics Table */}
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
                                {activeTab === "coordinator" && transformedData.metadata?.isUserCenterBest && (
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
                                                    {activeTab === "coordinator" ? dimension.userCenter : dimension.member}%
                                                    {(activeTab === "coordinator" ? dimension.userCenter : dimension.member) === 0 && <span className="text-xs ml-1">(no data)</span>}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`text-center text-xs sm:text-sm ${(activeTab === "coordinator" ? dimension.bestCenter : dimension.researchCenter) === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {activeTab === "coordinator" ? dimension.bestCenter : dimension.researchCenter}%
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`text-center text-xs sm:text-sm ${dimension.global === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {dimension.global}%
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