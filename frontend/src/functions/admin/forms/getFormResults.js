import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"



const getFormResults = async (formId, setLoading) => {

    setLoading(true)

    try {

        const formResults = await admin_api.get(`/dashboard/form-result/${formId}`)

        if (formResults.status === 200)
            
            return formResults.data

    } catch (error) {

        console.log(error)

        errorMessage("Error when trying load form")

    } finally {

        setLoading(false)

    }
}

export default getFormResults