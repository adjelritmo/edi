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

module.exports = validateInput