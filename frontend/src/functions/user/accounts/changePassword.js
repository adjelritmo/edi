import admin_api from "../../../server/admin"

import collaborator_api from "../../../server/collaborator"

import user_api from "../../../server/user"

import errorMessage from "../../toaster/error"

import successMessage from "../../toaster/success"


const validatePasswordChange = (currentPassword, newPassword, confirmPassword) => {
    
    const errors = []

    if (!currentPassword || currentPassword.trim() === '') {
        
        errors.push("Current password is required")
    
    }

    if (!newPassword || newPassword.trim() === '') {
        
        errors.push("New password is required")
    
    }

    if (newPassword && newPassword.length < 6) {
       
        errors.push("Password must be at least 6 characters long")
    
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
        
        errors.push("Password confirmation is required")
    
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
       
        errors.push("New password and confirmation do not match")
   
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
        
        errors.push("New password must be different from current password")
    
    }

    // Validações opcionais de força da senha
   /* if (newPassword) {
        const hasUpperCase = /[A-Z]/.test(newPassword)
        const hasLowerCase = /[a-z]/.test(newPassword)
        const hasNumbers = /\d/.test(newPassword)
        
        if (!hasUpperCase) {
            errors.push("Password must contain at least one uppercase letter")
        }
        
        if (!hasLowerCase) {
            errors.push("Password must contain at least one lowercase letter")
        }
        
        if (!hasNumbers) {
            errors.push("Password must contain at least one number")
        }
    
    }*/

    return errors
}

const changePassword = async (currentPassword, newPassword, confirmPassword, user) => {

    try {
        // Validações client-side
        const validationErrors = validatePasswordChange(currentPassword, newPassword, confirmPassword)
        
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => errorMessage(error))
            return 0
        }

        let response = null
        const passwordData = {
            currentPassword,
            newPassword,
            confirmPassword
        }

        // Determinar qual API usar baseado no role
        if (user.role === "admin") {
            response = await admin_api.put('/update/user/password', passwordData)
        } else if (user.role === "coordinator" || user.role === "collaborator") {
            response = await collaborator_api.put('/update/user/password', passwordData)
        } else {
            response = await user_api.put('/update/user/password', passwordData)
        }

        // Verificar resposta do servidor
        if (response.status === 200) {
            successMessage('Password changed successfully!')
            return 200
        } else if (response.status === 401) {
            errorMessage('Current password is incorrect')
            return 401
        } else if (response.status === 400) {
            // Se o servidor retornar mensagens de erro específicas
            if (response.data && response.data.message) {
                errorMessage(response.data.message)
            } else if (response.data && response.data.errors) {
                response.data.errors.forEach(error => errorMessage(error))
            } else {
                errorMessage('Invalid password data')
            }
            return 400
        } else if (response.status === 409) {
            errorMessage('Password cannot be the same as current password')
            return 409
        } else {
            errorMessage('Unexpected response from server')
            console.error('Unexpected response:', response)
            return response.status || 0
        }

    } catch (error) {
        console.error('Change password error:', error)
        
        // Tratamento específico de erros de rede
        if (error.code === 'ECONNABORTED') {
            errorMessage('Request timeout. Please try again.')
        } else if (!error.response) {
            errorMessage('Network error. Please check your connection.')
        } else {
            // Erros do servidor
            const status = error.response.status
            const data = error.response.data
            
            if (status === 401) {
                errorMessage('Current password is incorrect')
            } else if (status === 400) {
                if (data && data.message) {
                    errorMessage(data.message)
                } else if (data && data.errors) {
                    data.errors.forEach(err => errorMessage(err))
                } else {
                    errorMessage('Invalid password data')
                }
            } else if (status === 409) {
                errorMessage('New password cannot be the same as current password')
            } else if (status === 429) {
                errorMessage('Too many attempts. Please try again later.')
            } else if (status >= 500) {
                errorMessage('Server error. Please try again later.')
            } else {
                errorMessage(`Failed to change password: ${data?.message || 'Unknown error'}`)
            }
        }
        
        return 0
    }
}

export default changePassword