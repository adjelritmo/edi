import password_api from "../../../server/password"

import ErrorMessage from "../../toaster/error"




const sendEmail = async (edi_email, onLoadGuest, navigate) => {

    try {

        const sedmail = await password_api.post('/forgot-password', { edi_email })

        if (sedmail.status === 200) {

            localStorage.setItem('@equicenter-guest', sedmail.data.edi_code)

            onLoadGuest()

            navigate('email-verification', { state: { email: edi_email } })

        }

    } catch (error) {

        if (error.status === 401 || error.status === 404)

            ErrorMessage('Invalid email')

        else {

            console.log(error.message)

            ErrorMessage('Error on try ask code')

        }


    }
}

export default sendEmail