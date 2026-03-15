import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

const getFormsUser = async (setForms, setLoading) => {

    setLoading(true)

    try {

        const forms = await user_api.get('/get/user-forms')

        if (forms.status === 200)

            setForms(forms.data)

    } catch (error) {

        console.log(error)

        errorMessage("Error when trying load forms")

    } finally {

        setLoading(false)

    }
}

export default getFormsUser