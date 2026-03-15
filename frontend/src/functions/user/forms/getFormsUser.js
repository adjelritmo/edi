import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

const getFormsUser = async () => {

    try {

        const forms = await user_api.get('/get/user-forms')

        if (forms.status === 200)

            return forms.data

        else
            
            return []

    } catch (error) {

        console.log(error)
        
        errorMessage("Error when trying load forms")
        
    } 
}

export default getFormsUser