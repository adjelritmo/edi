const calculateValue = (answers = []) => {

    let result = 0

    for (const [questionId, answer] of Object.entries(answers)) {
        

        switch (answer) {
            case "Stronly Disagree":
                result += 1
                break;
            case "Disagree":
                result += 2
                break;
            case "Neutral":
                result += 3
                break;
            case "Agree":
                result += 4
                break;
            case "Strongly Agree":
                result += 5
                break;

            default:
                result += 0
                break;
        }
    }

    return parseFloat(result)
}

export default calculateValue