/*const getCalculatePointer = (anwers_list) => {

    try {

        if (!anwers_list) {
       
            return {}
       
        }

        // Filtrar apenas as propriedades que são objetos com value e dimention
        const validAnswers = Object.entries(anwers_list).filter(([key, value]) => {
       
            return value && typeof value === 'object' && 'value' in value && 'dimention' in value;
       
        })

        if (validAnswers.length === 0) {
       
            return {}
       
        }

        const groupedByDimension = {}
        
        validAnswers.forEach(([key, item]) => {

            const dimension = item.dimention

            const value = item.value
            
            if (!groupedByDimension[dimension]) {

                groupedByDimension[dimension] = []

            }
            
            groupedByDimension[dimension].push(value)
        })

        const dimensionsValues = {}

        let totalSum = 0

        let dimensionCount = 0
        
        Object.keys(groupedByDimension).forEach(dimension => {
            // Ignorar dimensões que não são relevantes (como 'others')
            if (dimension === 'others') {
                return
            }

            const values = groupedByDimension[dimension]

            let total = 0

            let validCount = 0
            
            values.forEach(value => {
                let score = 0
                
                switch(value) {
                    case "Strongly Disagree":
                        score = 1
                        break
                    case "Disagree":
                        score = 2
                        break
                    case "Neutral":
                        score = 3
                        break
                    case "Agree":
                        score = 4
                        break
                    case "Strongly Agree":
                        score = 5
                        break
                    default:
                        score = 0
                        break
                }
                
                if (score > 0) {
                    total += score
                    validCount++
                }
            })
            
            const media = validCount > 0 ? total / validCount : 0

            dimensionsValues[dimension] = parseFloat((25 * media - 25).toFixed(2))
            
            totalSum += dimensionsValues[dimension]

            dimensionCount++

        })

        // Calcular a média final apenas das dimensões processadas
        const finalAverage = dimensionCount > 0 ? totalSum / dimensionCount : 0
       
        dimensionsValues.finalAverage = parseFloat(finalAverage.toFixed(2))

        return dimensionsValues
        
    } catch (error) {
       
        console.error("Erro ao calcular pontuações:", error)
       
        return {}
    
    }
}


module.exports = getCalculatePointer
*/

const getCalculatePointer = (anwers_list) => {

    try {

        if (!anwers_list) {

            return {}

        }

        // Filtrar apenas as propriedades que são objetos com value e dimention
        const validAnswers = Object.entries(anwers_list).filter(([key, value]) => {

            return value && typeof value === 'object' && 'value' in value && 'dimention' in value;

        })

        if (validAnswers.length === 0) {

            return {}

        }

        const groupedByDimension = {}

        validAnswers.forEach(([key, item]) => {

            const dimension = item.dimention

            const value = item.value

            if (!groupedByDimension[dimension]) {

                groupedByDimension[dimension] = []

            }

            groupedByDimension[dimension].push(value)

        })

        const dimensionsValues = {}

        let totalSum = 0

        let dimensionCount = 0

        Object.keys(groupedByDimension).forEach(dimension => {
           
            // Ignorar dimensões que não são relevantes (como 'others')
            if (dimension === 'others') {
                return
            }

            const values = groupedByDimension[dimension]

            let total = 0

            let validCount = 0

            values.forEach(value => {
                let score = 0

                switch (value) {
                    case "Strongly Disagree":
                        score = 1
                        break
                    case "Disagree":
                        score = 2
                        break
                    case "Neutral":
                        score = 3
                        break
                    case "Agree":
                        score = 4
                        break
                    case "Strongly Agree":
                        score = 5
                        break
                    default:
                        score = 0
                        break
                }

                if (score > 0) {
                    total += score
                    validCount++
                }
            })

            const media = validCount > 0 ? total / validCount : 0

            dimensionsValues[dimension] = parseFloat((25 * media - 25).toFixed(2))

            totalSum += dimensionsValues[dimension]

            dimensionCount++

        })

        // Calcular a média final apenas das dimensões processadas
        const finalAverage = dimensionCount > 0 ? totalSum / dimensionCount : 0

        return {

            dimensionsValues: dimensionsValues,

            finalAverage: parseFloat(finalAverage.toFixed(2))

        }

    } catch (error) {

        console.error("Erro ao calcular pontuações:", error)

        return {}

    }
}

module.exports = getCalculatePointer