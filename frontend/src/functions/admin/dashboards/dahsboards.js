import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"

const getAdminDashBoard = async (setDashBoard) => {

    try {

        const centers = await admin_api.get('/user/admin/dashboard')

        if (centers.status === 200)

            setDashBoard(centers.data)

        
    } catch (error) {
        
        errorMessage('An error occured when trying data to dashboard')

    }
}

export default getAdminDashBoard