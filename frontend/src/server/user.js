import axios from 'axios'

const user_api = axios.create({

    baseURL: import.meta.env.VITE_USER_API

})

user_api.interceptors.request.use(

    async config => {

        const token = localStorage.getItem('@equicenter')

        if (token)

            config.headers.Authorization = `Bearer ${token}`

        return config
    },

    error => Promise.reject(error)

)

user_api.interceptors.response.use(

    response => response,

    error => {

        if (error.response && error.response.status === 401) {

            localStorage.removeItem('@equicenter')

            window.location.reload()

            window.location.replace('/edi/login')

        }

        return Promise.reject(error)
    }
)


export default user_api

//import.meta.env.VITE_USER_API
//import.meta.env.VITE_USER_API_DEV