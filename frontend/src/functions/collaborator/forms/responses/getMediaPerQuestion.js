import collaborator_api from "../../../../server/collaborator"

import errorMessage from "../../../toaster/error"



const getMediaPerQuestion = async (formId) => {
    
    try {

        const { data, status } = await collaborator_api.get(`/calculate/media/per/response/${formId}`)

        if (status === 200 || status === 201) {

            console.log(data)

            // Transformar o objeto em array formatado
            const response = data || {}
            
            const formattedArray = Object.entries(response).map(([id, item]) => ({
                id,
                questionText: item.questionText,
                media: parseFloat(item.media) || 0,
                min: item.min || 0,
                max: item.max || 0
            }))

            return formattedArray

        } else {

            errorMessage("Error when trying to load your responses")

            return []
        }

    } catch (error) {

        console.error("Error :", error)
        
        if (error.response?.status === 404) {

            errorMessage("No responses found for this form")

        } else if (error.response?.status === 401) {

            errorMessage("Please log in to view your responses")

        } else {

            errorMessage("Error when trying to load your responses...")
            
        }
        
        return []
    }
}

export default getMediaPerQuestion