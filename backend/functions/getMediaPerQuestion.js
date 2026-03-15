const getPoint = (answer) => {

    let point = 0

    switch (answer) {

        case "Strongly Disagree":

            point = 1
            break

        case "Disagree":

            point = 2
            break

        case "Neutral":

            point = 3
            break

        case "Agree":

            point = 4
            break

        case "Strongly Agree":

            point = 5
            break

        default:

            point = 0
            break

    }

    return point

}

const getMax = (answers) => {

    let max = 0

    try {

        answers.forEach(answer => {

            if (getPoint(answer.answer) > max)
                max = getPoint(answer.answer)

        })

        return max

    } catch (error) {

    }

}

const getMin = (answers) => {

    let min = 5

    try {

        answers.forEach(answer => {

            if (getPoint(answer.answer) < min)
                min = getPoint(answer.answer)

        })

    } catch (error) {

    }

    return min

}

const getMean = (answers) => {

    let mean = 0

    try {

        let sum = 0

        const totalAnswers = answers.length

        answers.forEach(awr => {

            sum += getPoint(awr.answer)

        })

        mean = sum / totalAnswers

    } catch (error) {

    }

    return parseFloat(mean).toFixed(2)

}

const getMediaPerQuestion = (answers) => {

    let answersGouped = {}

    try {

        answers.forEach(answer => {

            const resp = answers.filter(awr => awr.questionId === answer.questionId)

            answersGouped[answer.questionId] = {
                questionText: answer.question.text,
                media: getMean(resp),
                min: getMin(resp),
                max: getMax(resp)
            }

        })

        return answersGouped

    } catch (error) {

    }

}

module.exports = getMediaPerQuestion