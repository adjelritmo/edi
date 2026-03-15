import collaborator_api from "../../../server/collaborator"

import errorMessage from "../../toaster/error"

const getMyDashBoardCoordinator = async (setDashboard) => {

    try {

        const dashboard = await collaborator_api.get(`/user/dashboard`)

        if (dashboard.status === 200) {

            setDashboard(dashboard.data)

            console.log("\n\n", dashboard.data, "\n\n")

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

export default getMyDashBoardCoordinator