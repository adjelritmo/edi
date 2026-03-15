import collaborator_api from "../../../server/collaborator"
import errorMessage from "../../toaster/error"

const getCenterData = async (setCenter) => {

    try {

        const center = await collaborator_api.get('/center/data')

        if (center.status === 200)

            setCenter(center.data)
        
    } catch (error) {
        
        errorMessage('An error occured when trying load center data')

    }
}

export default getCenterData