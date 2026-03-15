import axios from 'axios'

const guest_api = axios.create({
    baseURL: import.meta.env.VITE_GUEST_API
})

export default guest_api

//import.meta.env.VITE_GUEST_API
//import.meta.env.VITE_GUEST_API_DEV