const calculateAverage = require("./calculateMedia")

const getBestCenter = (submissions) => {

    let _submission = {}

    let best = 0

    submissions.forEach(element => {

        const center_submissions = submissions.filter(submission => submission.id === element.id)

        const media = calculateAverage(center_submissions)

        if (media > best) {

            best = media

            _submission = element

        }



    })

    return {

        media: best,

        bestCenterId: _submission.centerId

    }

}

module.exports = getBestCenter