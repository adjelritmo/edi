const getFormResultData = (submissions) => {

    try {
        // Obter dimensões dinamicamente do primeiro submission
        const getDimensions = () => {
            if (!submissions || submissions.length === 0) return []
            const firstSub = submissions.find(s => s.dimensionsValues && Object.keys(s.dimensionsValues).length > 0)
            return firstSub ? Object.keys(firstSub.dimensionsValues) : []
        }

        const dimensions = getDimensions()

        // Calcular total de uma submissão (média de todas as dimensões)
        const calculateTotal = (submission) => {
            if (!submission.dimensionsValues) return 0
            const values = Object.values(submission.dimensionsValues).filter(v => typeof v === 'number')
            return values.length > 0 
                ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
                : 0
        }

        // 1. AGRUPAR POR CENTRO
        const groupedByCenter = submissions.reduce((acc, submission) => {
            const centerId = submission.centerId
            const centerName = submission.center?.name || `Center ${centerId}`
            const centerRegion = submission.center?.country || 'Unknown'

            if (!acc[centerId]) {
                acc[centerId] = {
                    id: centerId,
                    nome: centerName,
                    regiao: centerRegion,
                    submissions: []
                }
            }

            acc[centerId].submissions.push(submission)
            return acc
        }, {})

        // 2. PROCESSAR CADA CENTRO
        const centersData = Object.values(groupedByCenter).map(center => {
            // Calcular médias por dimensão
            const dimAverages = {}
            
            dimensions.forEach(dim => {
                const sum = center.submissions.reduce((acc, sub) => {
                    return acc + (sub.dimensionsValues?.[dim] || 0)
                }, 0)
                dimAverages[dim] = parseFloat((sum / center.submissions.length).toFixed(2))
            })

            // Total geral
            const total = parseFloat(
                (Object.values(dimAverages).reduce((a, b) => a + b, 0) / dimensions.length).toFixed(2)
            )

            return {
                id: center.id,
                nome: center.nome,
                regiao: center.regiao,
                ...dimAverages,  // spread das dimensões dinamicamente
                total: total,
                submissionsCount: center.submissions.length
            }
        })

        // 3. ORDENAR E ATRIBUIR POSIÇÕES
        const sortedCenters = centersData.sort((a, b) => b.total - a.total)
        const mediaGeral = sortedCenters.length > 0 
            ? parseFloat((sortedCenters.reduce((sum, c) => sum + c.total, 0) / sortedCenters.length).toFixed(2))
            : 0
        
        const finalCenters = sortedCenters.map((center, index) => {
            const posicao = index + 1
            const alertaEspecial = center.total < mediaGeral
            const critico = center.total < (mediaGeral - 10)
            
            // Pontos fortes (top 2 dimensões)
            const dimEntries = dimensions.map(dim => [dim, center[dim]])
            const sortedDims = dimEntries.sort((a, b) => b[1] - a[1])
            const pontosFortes = sortedDims.slice(0, 2).filter(([_, val]) => val >= 70).map(([key, _]) => key)
            const pontosMelhoria = sortedDims.slice(-2).filter(([_, val]) => val < 70).map(([key, _]) => key)

            let atencao = "Maintain current performance levels."
            if (critico) {
                atencao = `CRITICAL: Significantly below average (${mediaGeral}).`
            } else if (alertaEspecial) {
                atencao = `ATTENTION: Below global average (${mediaGeral}).`
            }

            return {
                ...center,
                posicao,
                alertaEspecial,
                critico,
                atencao,
                pontosFortes: pontosFortes.length > 0 ? pontosFortes : ['Balanced'],
                pontosMelhoria: pontosMelhoria.length > 0 ? pontosMelhoria : []
            }
        })

        // 4. MELHOR CENTRO
        const melhorCentro = finalCenters[0] || null
        const bestCenterData = melhorCentro ? {
            nome: melhorCentro.nome,
            pontuacao: melhorCentro.total,
            criterios: dimensions.reduce((acc, dim) => {
                acc[dim] = melhorCentro[dim]
                return acc
            }, {}),
            motivo: `Leading with ${melhorCentro.total} points.`,
            pontosFortes: melhorCentro.pontosFortes
        } : null

        // 5. ESTATÍSTICAS
        const totalRespostas = submissions.length
        const totalCentros = finalCenters.length
        const percentualMelhoria = totalCentros > 0 
            ? Math.round((finalCenters.filter(c => !c.alertaEspecial).length / totalCentros) * 100)
            : 0

        // 6. INSIGHTS
        const insights = melhorCentro ? [
            `${melhorCentro.nome} is the top performer`,
            `${percentualMelhoria}% of centers above average`,
            `${finalCenters.filter(c => c.alertaEspecial).length} centers need attention`
        ] : []

        return {
            title: "Centers Evaluation Report",
            description: `Evaluation of ${totalCentros} centers with ${totalRespostas} submissions.`,
            generatedAt: new Date().toISOString(),
            
            statistics: {
                totalRespostas,
                totalCentros,
                mediaGeral,
                variacaoSemestral: 0,
                percentualMelhoria
            },
            
            bestCenter: bestCenterData,
            centers: finalCenters,
            insights,
            
            // Informação extra sobre dimensões disponíveis
            availableDimensions: dimensions
        }

    } catch (error) {
        console.error('Erro:', error)
        return null
    }
}

module.exports = getFormResultData