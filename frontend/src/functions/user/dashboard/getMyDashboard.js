import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

const getMyDashBoard = async (setDashboard) => {

    try {

        const dashboard = await user_api.get(`/user/dashboard/member`)

        if (dashboard.status === 200) {

            setDashboard(dashboard.data)

            return 200

        }

        errorMessage('Unexpected response from server')

        return 0

    } catch (error) {

        errorMessage(`Failed to delete user: ${error.message}`)

        console.error('Delete user error:', error)

        return 0

    }
}

export default getMyDashBoard