import axios from 'axios'

const password_api = axios.create({

    baseURL: import.meta.env.VITE_PASSWORD_API_DEV

})

export default password_api

//import.meta.env.VITE_PASSWORD_API
//import.meta.env.VITE_PASSWORD_API_DEV