import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"




const getUserResponses = async (formId, userId) => {

    try {

        if (!formId || !userId) {

            errorMessage("Error when trying to load your responses")

            return null

        }

        const { data, status } = await admin_api.get(`/responses/form/${formId}/${userId}`)

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

export default getUserResponses