import guest_api from "../../server/guest"

import errorMessage from "../toaster/error"

const getAllCentersNames = async (setCenters) => {

    try {

        const centers = await guest_api.get('/find/all/centers')

        if (centers.status === 200)

            setCenters(centers.data)

    } catch (error) {

        errorMessage('An error occured when trying load centers')
        
    }
}

export default getAllCentersNames