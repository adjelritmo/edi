import admin_api from "../../../server/admin"

import errorMessage from "../../toaster/error"

const getUsers = async (setusers, setIsLoading) => {

    setIsLoading(true)

    try {

        const users = await admin_api.get('/get/all/users')
       
        if (users.status === 200)

            setusers(users.data)

    } catch (error) {

        errorMessage('An error occured when trying load users')

    } finally {

        setIsLoading(false)

    }
}

export default getUsers