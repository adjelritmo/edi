import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"

const getCenters = async (setCenters) => {

    try {

        const centers = await admin_api.get('/get/all/centers')

        if (centers.status === 200)
            setCenters(centers.data)
        
    } catch (error) {
        
        errorMessage('An error occured when trying load centers')
    }
}

export default getCenters