/*const getDataToTable = (user_submission, center_submissions, global_submissions) => {

    try {
        // Função para calcular médias de um array de submissões
        const aggregateSubmissions = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return {
                    leadership: 0,
                    innovation: 0,
                    collaboration: 0,
                    engagement: 0,
                    skills: 0,
                    motivation: 0,
                    others: 0
                }
            }

            // Calcular soma de cada categoria
            const sums = submissions.reduce((acc, submission) => {
                return {
                    leadership: acc.leadership + (submission.leadership || 0),
                    innovation: acc.innovation + (submission.innovation || 0),
                    collaboration: acc.collaboration + (submission.collaboration || 0),
                    engagement: acc.engagement + (submission.engagement || 0),
                    skills: acc.skills + (submission.skills || 0),
                    motivation: acc.motivation + (submission.motivation || 0),
                    others: acc.others + (submission.others || 0)
                }
            }, {
                leadership: 0,
                innovation: 0,
                collaboration: 0,
                engagement: 0,
                skills: 0,
                motivation: 0,
                others: 0
            })

            // Calcular médias
            const count = submissions.length
            return {
                leadership: parseFloat(sums.leadership / count).toFixed(2),
                innovation: parseFloat(sums.innovation / count).toFixed(2),
                collaboration: parseFloat(sums.collaboration / count).toFixed(2),
                engagement: parseFloat(sums.engagement / count).toFixed(2),
                skills: parseFloat(sums.skills / count).toFixed(2),
                motivation: parseFloat(sums.motivation / count).toFixed(2),
                others: parseFloat(sums.others / count).toFixed(2),
            }
        }

        // Função para determinar o status baseado na comparação apenas com o centro
        const getStatus = (userValue, centerValue) => {
            if (userValue > centerValue) {
                return 'Above Average'
            } else if (userValue < centerValue) {
                return 'Below Average'
            } else {
                return 'Average'
            }
        }

        // Agrupar center_submissions
        const centerAggregated = aggregateSubmissions(center_submissions)

        // Agrupar global_submissions
        const globalAggregated = aggregateSubmissions(global_submissions)

        const user_data = {
            leadership: parseFloat(user_submission?.leadership || 0).toFixed(2),
            innovation: parseFloat(user_submission?.innovation || 0).toFixed(2),
            collaboration: parseFloat(user_submission?.collaboration || 0).toFixed(2),
            engagement: parseFloat(user_submission?.engagement || 0).toFixed(2),
            skills: parseFloat(user_submission?.skills || 0).toFixed(2),
            motivation: parseFloat(user_submission?.motivation || 0).toFixed(2),
            others: parseFloat(user_submission?.others || 0).toFixed(2),
        }

        // Lista de dimensões
        const dimensions = [
            'leadership',
            'innovation',
            'collaboration',
            'engagement',
            'skills',
            'motivation',
            'others'
        ]

        // Criar array com os dados formatados
        const tableData = dimensions.map(dimension => {
            const userValue = user_data[dimension]
            const centerValue = centerAggregated[dimension]
            const globalValue = globalAggregated[dimension]
            
            return {
                dimension: dimension,
                user: parseFloat(userValue).toFixed(2),
                center: parseFloat(centerValue).toFixed(2),
                global: parseFloat(globalValue).toFixed(2),
                status: getStatus(userValue, centerValue)
            }
        })

        return tableData

    } catch (error) {
        console.error('Erro ao agregar submissões:', error)
        return []
    }
}

module.exports = getDataToTable
*/

const getDataToTable = (user_submission, center_submissions, global_submissions) => {

    try {
        // Função para extrair todas as dimensões únicas de um array de submissões
        const getAllDimensions = (submissions) => {
            const dimensionsSet = new Set()
            
            submissions.forEach(sub => {
                if (sub.dimensionsValues && typeof sub.dimensionsValues === 'object') {
                    Object.keys(sub.dimensionsValues).forEach(key => dimensionsSet.add(key))
                }
            })
            
            return Array.from(dimensionsSet)
        }

        // Coletar todas as dimensões disponíveis
        const dimensions = getAllDimensions([
            user_submission,
            ...(center_submissions || []),
            ...(global_submissions || [])
        ])

        // Se não houver dimensões, retornar array vazio
        if (dimensions.length === 0) {
            return []
        }

        // Função para extrair valor de uma dimensão
        const getDimensionValue = (submission, dimensionKey) => {
            if (!submission) return 0

            // Novo formato dimensionsValues
            if (submission.dimensionsValues && submission.dimensionsValues[dimensionKey] !== undefined) {
                return parseFloat(submission.dimensionsValues[dimensionKey]) || 0
            }

            return 0
        }

        // Função para calcular médias de um array de submissões
        const aggregateSubmissions = (submissions) => {
            if (!submissions || submissions.length === 0) {
                return dimensions.reduce((acc, key) => {
                    acc[key] = 0
                    return acc
                }, {})
            }

            // Calcular soma de cada dimensão
            const sums = submissions.reduce((acc, submission) => {
                dimensions.forEach(key => {
                    acc[key] += getDimensionValue(submission, key)
                })
                return acc
            }, dimensions.reduce((acc, key) => {
                acc[key] = 0
                return acc
            }, {}))

            // Calcular médias
            const count = submissions.length
            return dimensions.reduce((acc, key) => {
                acc[key] = parseFloat((sums[key] / count).toFixed(2))
                return acc
            }, {})
        }

        // Função para determinar o status baseado na comparação com o centro
        const getStatus = (userValue, centerValue) => {
            if (userValue > centerValue) {
                return 'Above Average'
            } else if (userValue < centerValue) {
                return 'Below Average'
            } else {
                return 'Average'
            }
        }

        // Agrupar center_submissions
        const centerAggregated = aggregateSubmissions(center_submissions)

        // Agrupar global_submissions
        const globalAggregated = aggregateSubmissions(global_submissions)

        // Extrair dados do usuário
        const user_data = dimensions.reduce((acc, key) => {
            acc[key] = getDimensionValue(user_submission, key)
            return acc
        }, {})

        // Criar array com os dados formatados
        const tableData = dimensions.map(dimension => {
            const userValue = user_data[dimension]
            const centerValue = centerAggregated[dimension]
            const globalValue = globalAggregated[dimension]
            
            return {
                dimension: dimension,
                user: userValue.toFixed(2),
                center: centerValue.toFixed(2),
                global: globalValue.toFixed(2),
                status: getStatus(userValue, centerValue)
            }
        })

        return tableData

    } catch (error) {
        console.error('Erro ao agregar submissões:', error)
        return []
    }
}

module.exports = getDataToTable