/*const calculateAverage = (submissionsArray) => {

    if (!submissionsArray || submissionsArray.length === 0)

        return 0

    const total = submissionsArray.reduce((sum, submission) => sum + submission.point, 0)

    return parseFloat((total / submissionsArray.length).toFixed(2))

}

module.exports = calculateAverage
*/

const calculateAverage = (submissionsArray) => {

    if (!submissionsArray || submissionsArray.length === 0) {
        return 0
    }

    let total = 0

    let validCount = 0

    for (const submission of submissionsArray) {

        let value = 0

        if (submission.dimensionsValues) {

            const dims = submission.dimensionsValues

            const values = Object.values(dims).filter(v => typeof v === 'number')
            
            value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

        } else {
            // Usar campo point tradicional
            value = submission.point || 0

        }

        total += value

        validCount++

    }

    return validCount > 0 ? parseFloat((total / validCount).toFixed(2)) : 0

}

module.exports = calculateAverage