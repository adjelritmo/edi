import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"

const getForms = async (setForms, setLoading) => {

    setLoading(true)

    try {

        const forms = await admin_api.get('/get/all/forms')

        if (forms.status === 200)
            setForms(forms.data)

    } catch (error) {
        console.log(error)
        errorMessage("Error when trying load forms")
    } finally {
        setLoading(false)
    }
}

export default getForms