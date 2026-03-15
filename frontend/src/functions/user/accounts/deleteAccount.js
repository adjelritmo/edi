import admin_api from "../../../server/admin"

import collaborator_api from "../../../server/collaborator"

import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"


const deleteAccount = async (user, logout) => {

    try {

        let response = null

        if (user.role === "admin")

            response = await admin_api.delete(`/delete/a/user`)

        else if (user.role === "coordinator")

            response = await collaborator_api.delete(`/delete/a/user`)

        else

            response = await user_api.delete(`/delete/a/user`)

        if (response.status === 200) {
            
            logout()
            
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

export default deleteAccount