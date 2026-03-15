import axios from 'axios'

const collaborator_api = axios.create({

    baseURL: import.meta.env.VITE_COLLABORATOR_API

})



collaborator_api.interceptors.request.use(

    async config => {

        const token = localStorage.getItem('@equicenter')

        if (token)

            config.headers.Authorization = `Bearer ${token}`

        return config
    },

    error => Promise.reject(error)

)

collaborator_api.interceptors.response.use(

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

export default collaborator_api


//import.meta.env.VITE_COLLABORATOR_API_DEV
//import.meta.env.VITE_COLLABORATOR_API