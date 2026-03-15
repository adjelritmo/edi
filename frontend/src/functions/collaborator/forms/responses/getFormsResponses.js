import collaborator_api from "../../../../server/collaborator"

import errorMessage from "../../../toaster/error"



const getCoordinatorFormsResponses = async (formId) => {
    
    try {

        const { data, status } = await collaborator_api.get(`/my-responses/form/${formId}`)

        if (status === 200 || status === 201) {

            return data.response

        } else {

            errorMessage("Error when trying to load your responses")

            return null
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
        
        return null
    }
}

export default getCoordinatorFormsResponses