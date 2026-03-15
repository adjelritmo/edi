import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"

const deleteCenter = async (centerId, centers, setCenters) => {

    try {

        const response = await admin_api.delete(`/delete/a/center/${centerId}`)

        if (response.status === 200) {

            setCenters(centers.filter(center => center.id !== centerId))

            successMessage('Center was deleted successfully')

            return 200

        }

        errorMessage('Unexpected response from server')

        return 0

    } catch (error) {

        errorMessage(`Failed to delete center: ${error.message}`)

        console.error('Delete center error:', error)

        return 0
    }
}

export default deleteCenter