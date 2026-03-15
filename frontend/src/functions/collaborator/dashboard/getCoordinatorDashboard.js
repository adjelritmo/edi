import collaborator_api from "../../../server/collaborator"
import errorMessage from "../../toaster/error"


const getCoordinatorDashboard = async (setDashboard) => {
    try {
        const response = await collaborator_api.get(`/dashboard`)

        if (response.status === 200) {
            
            if (response.status === 200) {

                setDashboard(response.data)
                
                return response.data

            } else {

                errorMessage(response.data.error || 'Failed to load dashboard data')

                return null

            }

        } else {

            errorMessage('Unexpected response from server')

            return null

        }

    } catch (error) {
        
        console.error('Get coordinator dashboard error:', error)

        if (error.response) {
            // Erro com resposta do servidor
            switch (error.response.status) {
                case 401:
                    errorMessage('Session expired. Please login again.')
                    break
                case 403:
                    errorMessage('You do not have permission to access dashboard data')
                    break
                case 404:
                    errorMessage('Dashboard endpoint not found')
                    break
                case 500:
                    errorMessage('Server error. Please try again later.')
                    break
                default:
                    errorMessage(`Failed to load dashboard: ${error.response.data?.error || 'Unknown error'}`)
            }
        } else if (error.request) {
            // Erro de rede (sem resposta)
            errorMessage('Network error. Please check your internet connection.')
        } else {
            // Outros erros
            errorMessage(`Failed to load dashboard: ${error.message}`)
        }

        return null
    }
}

export default getCoordinatorDashboard