import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

const getFormsResponses = async (formId) => {
    
    try {

        const { data, status } = await user_api.get(`/user/my-responses/form/${formId}`)

        if (status === 200 || status === 201) {

            return data.response

        } else {

            errorMessage("Error when trying to load your responses")

            return null
        }

    } catch (error) {

        console.error("Error in getFormsResponses:", error)
        
        if (error.response?.status === 404) {

            errorMessage("No responses found for this form")

        } else if (error.response?.status === 401) {

            errorMessage("Please log in to view your responses")

        } else {

            errorMessage("Error when trying to load your responses...")
            
        }
        
        return null
    }
}

export default getFormsResponses