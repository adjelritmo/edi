import guest_api from "../../server/guest"

import ErrorMessage from "../toaster/error"

import successMessage from "../toaster/success"

import doLogin from "./doLogin"

const validateInput = (formData, isLogin = false) => {
   
    if (!isLogin) {
        
        if (!formData.firstName || formData.firstName.trim() === '') {
            
            return { valid: false, message: "First name is required." }
        
        }

        if (!formData.surname || formData.surname.trim() === '') {
        
            return { valid: false, message: "Surname is required." }
        
        }

        if (!formData.country || formData.country.trim() === '') {
        
            return { valid: false, message: "Country is required." }
        
        }

        if (!formData.centerId || formData.centerId.trim() === '') {
        
            return { valid: false, message: "Research center is required." }
        
        }

        if (!formData.gender || formData.gender.trim() === '') {
        
            return { valid: false, message: "Gender is required." }
        
        }

        if (!formData.researchPosition || formData.researchPosition.trim() === '') {
        
            return { valid: false, message: "Research position is required." }
        
        }

        if (!formData.bornDate || formData.bornDate.trim() === '') {
        
            return { valid: false, message: "Date of birth is required." }
        
        }
    
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email || !emailRegex.test(formData.email)) {
    
        return { valid: false, message: "Invalid email address." }
    
    }

    if (!formData.password || formData.password.trim() === '') {
    
        return { valid: false, message: "Password is required." }
    
    }

    if (!isLogin && formData.password.length < 6) {
    
        return { valid: false, message: "Password must be at least 6 characters long." }
    
    }

    return { valid: true, message: "Valid data." }

}

const doRegister = async (edi_data, navigate, onLoadUser) => {

    const { valid, message } = validateInput(edi_data, false)

    if (!valid) {

        ErrorMessage(message)

        return
    }

    try {

        const response = await guest_api.post('/register', { edi_data })

        if (response.status === 200 || response.status === 201) {

            await doLogin(edi_data.email, edi_data.password, navigate, onLoadUser)

            successMessage("Success on register")
        }

    } catch (error) {

        console.error("Registration error:", error)

        if (error.response) {

            if (error.response.status === 401 || error.response.status === 404) {

                ErrorMessage('Not authorized to register with this data.')

            } else if (error.response.status === 409) {

                ErrorMessage('This email is already registered.')

            } else if (error.response.status === 400) {

                ErrorMessage('Invalid data provided.')

            } else {

                ErrorMessage('Server error. Please try again later.')

            }

        } else if (error.request) {

            ErrorMessage('No response from server. Please check your connection.')

        } else {

            ErrorMessage('Unexpected registration error.')

        }

    }

}

export default doRegister