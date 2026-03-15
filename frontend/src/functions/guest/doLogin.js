import guest_api from "../../server/guest"
import typeUserEnum from "../constants/type_user_enum"
import ErrorMessage from "../toaster/error"


const doLogin = async (email, password, navigate, onLoadUser) => {

    try {

        const edi_data = { email, password }

        const login = await guest_api.post('/login', { edi_data })

        if (login.status === 200) {

            localStorage.setItem('@equicenter', login.data.equicenter_code)

            const user = await onLoadUser()

            if (user?.role === typeUserEnum.ADMIN || user?.role === typeUserEnum.ADMIN_ALPHA)

                navigate('/edi/user', { replace: true })

            else if (user?.role === typeUserEnum.COLLABORATOR)

                navigate('/edi/user/coordinator', { replace: true })

            else

                navigate('/edi/user/participant', { replace: true })

        }


    } catch (error) {

        if (error.status === 401 || error.status === 404)

            ErrorMessage('Invalid email or password')

        else {

            console.log(error.message)

            ErrorMessage('Erro no login')

        }


    }
}

export default doLogin