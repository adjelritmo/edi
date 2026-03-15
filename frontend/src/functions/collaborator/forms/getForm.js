import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"

const getForm = async (formData) => {

    try {

        const form = await admin_api.get(`/get/forms/responses/data`, { formData })

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