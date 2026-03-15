import admin_api from "../../../server/admin"
import errorMessage from "../../toaster/error"
import successMessage from "../../toaster/success"

const deleteUser = async (userId, users, setUsers) => {

    try {
        const response = await admin_api.delete(`/delete/a/user/${userId}`)

        if (response.status === 200) {
            setUsers(users.filter(user => user.id !== userId))
            successMessage('user was deleted successfully')
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

export default deleteUser