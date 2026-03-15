import collaborator_api from "../../../server/collaborator"
import errorMessage from "../../toaster/error"

const getFormsCollaborator = async () => {

    try {

        const response = await collaborator_api.get('/get/all/forms')
        
        if (response.status === 200) {

            return response.data

        } else {

            errorMessage("Error when trying load forms")

            return []

        }

    } catch (error) {

        console.error("Error: ", error)

        errorMessage("Error when trying to load forms")

        return []
        
    }
}

export default getFormsCollaborator