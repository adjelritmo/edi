import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"


const deleteForm = async (id, forms, setForms) => {

    try {

        const res = await admin_api.delete(`/delete/a/form/${id}`)

        if (res.status === 200) {

            setForms(forms.filter(f => f.id !== id))

            successMessage("form was deleted")

            return 200

        }

        return 0

    } catch (err) {

        console.error(err)

        errorMessage("Error ocurred when remove a form")
        
        return 500
    }
}

export default deleteForm