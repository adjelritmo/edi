import axios from 'axios'

const admin_api = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_API
})

admin_api.interceptors.request.use(

    async config => {

        const token = localStorage.getItem('@equicenter')

        if (token)

            config.headers.Authorization = `Bearer ${token}`

        return config
    },

    error => Promise.reject(error)

)

admin_api.interceptors.response.use(

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

export default admin_api

//import.meta.env.VITE_ADMIN_API
//import.meta.env.VITE_ADMIN_API_DEV