import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"

const editUser = async (userId, formData, users, setUsers, label) => {

    try {

        const response = await admin_api.put(`/edit/a/user/${userId}`, {

            role: formData.role,

            centerId: formData.centerId

        })

        if (response.status === 200) {

            if (label)
                setUsers(users.map(user => user.id === userId ? { ...user, role: formData.role, centerId: formData.centerId, center: { name: label } } : user))
            else
                setUsers(users.map(user => user.id === userId ? { ...user, role: formData.role, centerId: formData.centerId } : user))

            successMessage("User was updated successfully")

            return 200
        }

        errorMessage("Unexpected response from server")

        return 0

    } catch (error) {

        errorMessage(`Failed to update user: ${error.message}`)

        console.error("Edit user error:", error)
        return 0
    }
}

export default editUser
