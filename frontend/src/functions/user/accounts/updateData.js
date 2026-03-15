import collaborator_api from "../../../server/collaborator"

import user_api from "../../../server/user"

import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"



const validateUpdateInput = (formData) => {

    if (formData?.firstName !== undefined && formData?.firstName?.trim() === '') {

        return { valid: false, message: "First name cannot be empty." }

    }

    if (formData?.surname !== undefined && formData?.surname?.trim() === '') {

        return { valid: false, message: "Surname cannot be empty." }

    }


    if (formData?.email !== undefined) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(formData?.email)) {

            return { valid: false, message: "Invalid email address." }

        }

    }

    if (formData?.password !== undefined && formData?.password?.trim() !== '') {

        if (formData?.password?.length < 6) {

            return { valid: false, message: "Password must be at least 6 characters long." }

        }

    }

    if (formData?.bornDate !== undefined) {

        const birthDate = new Date(formData?.bornDate)

        if (birthDate > new Date()) {

            return { valid: false, message: "Birth date cannot be in the future." }

        }

    }

    return { valid: true, message: "Valid data." }

}

const doUpdateUser = async (formData, user, setUser) => {

    const { valid, message } = validateUpdateInput(formData)

    if (!valid) {

        errorMessage(message)

        return
    }

    try {

        const updateData = {}

        if (formData?.firstName !== undefined && formData?.firstName?.trim() !== '') {

            updateData.firstName = formData?.firstName?.trim()

        }

        if (formData?.surname !== undefined && formData?.surname?.trim() !== '') {

            updateData.surname = formData?.surname?.trim()

        }

        if (formData?.email !== undefined && formData?.email?.trim() !== '') {

            updateData.email = formData?.email.trim()

        }

        if (formData?.password !== undefined && formData?.password?.trim() !== '') {

            updateData.password = formData?.password

        }

        if (formData?.country !== undefined && formData?.country?.trim() !== '') {

            updateData.country = formData?.country.trim()

        }

        if (formData?.professional_country !== undefined && formData?.professional_country?.trim() !== '') {

            updateData.professional_country = formData?.professional_country.trim()

        }

        if (formData?.centerId !== undefined && formData?.centerId !== '') {

            updateData.centerId = formData?.centerId

        }

        if (formData?.gender !== undefined && formData?.gender?.trim() !== '') {

            updateData.gender = formData?.gender.trim()

        }

        if (formData?.researchPosition !== undefined && formData?.researchPosition?.trim() !== '') {

            updateData.researchPosition = formData?.researchPosition.trim()

        }

        if (formData?.bornDate !== undefined && formData?.bornDate !== '') {

            updateData.bornDate = formData?.bornDate

        }

        if (formData?.role !== undefined && formData?.role?.trim() !== '') {

            updateData.role = formData?.role.trim()

        }

        if (Object.keys(updateData).length === 0) {

            errorMessage("No data provided for update.")

            return

        }

        let response = null

        if (user.role === "admin" || user.role === "admin_alpha")

            response = await admin_api.put(`/update/user`, updateData)

        else if (user.role === "coordinator")

            response = await collaborator_api.put(`/update/user`, updateData)

        else

            response = await user_api.put(`/update/user`, updateData)

        if (response.status === 200) {

            successMessage("User updated successfully!")

            formData.centerName = user.centerName?.trim() || ""

            setUser(formData)

            return 200

        } else {

            errorMessage("Failed to update user.")

        }


    } catch (error) {

        console.error("Update user error:", error)

        if (error.response) {

            if (error.response.status === 404) {

                errorMessage('User not found.')

            } else if (error.response.status === 409) {

                errorMessage('This email is already registered to another user.')

            } else if (error.response.status === 403) {

                errorMessage('You do not have permission to update this user.')

            } else if (error.response.status === 400) {

                errorMessage('Invalid data provided.')

            } else {

                errorMessage('Server error. Please try again later.')

            }

        } else if (error.request) {

            errorMessage('No response from server. Please check your connection.')

        } else {

            errorMessage('Unexpected error while updating user.')

        }

    }

}

export default doUpdateUser