import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"

const getForm = async (formId, setForm, setLoading) => {

    setLoading(true)

    try {

        const form = await admin_api.get(`/get/forms/data/${formId}`)

        if (form.status === 200)
            setForm(form.data)

    } catch (error) {
        console.log(error)
        errorMessage("Error when trying load form")
    } finally {
        setLoading(false)
    }
}

export default getForm