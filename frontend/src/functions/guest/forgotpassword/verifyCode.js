import password_api from "../../../server/password"

import ErrorMessage from "../../toaster/error"




const verifyCode = async (email, password, navigate, setIsVerified) => {




    try {

        const verify_code = await password_api.post('/forgot-password/check/email/verify-code', { email, password })

        if (verify_code.status === 200) {

            setIsVerified(true)

            navigate('/edi/forgot-password/chenges-passwords', { state: { email: email } })

        }


    } catch (error) {

        if (error.status === 401 || error.status === 404)

            ErrorMessage('Invalid code')

        else {

            console.log(error.message)

            ErrorMessage('Invalid code')

        }


    }
}

export default verifyCode