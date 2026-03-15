import password_api from "../../../server/password"

import ErrorMessage from "../../toaster/error"

const updatePassword = async (email, password, navigate, setIsSuccess) => {

    try {

        const response = await password_api.post('/forgot-password/change/password', { email, password })

        if (response.status === 200) {

            setIsSuccess(true)

            navigate('/edi/login', { replace: true })

        }


    } catch (error) {

        console.log(error)

        ErrorMessage('failed on update password')

    }
}

export default updatePassword