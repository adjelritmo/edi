import collaborator_api from "../../../server/collaborator"
import errorMessage from "../../toaster/error"


const getCenterUsers = async () => {

    try {

        const users = await collaborator_api.get(`/get/center/with-users`)

        if (users.status === 200)

            return users.data

        else return []

    } catch (error) {

        console.log(error)

        errorMessage('An error occured when trying load users')
        
    }
}

export default getCenterUsers