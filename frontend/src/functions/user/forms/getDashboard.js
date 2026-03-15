import user_api from "../../../server/user"

const getDashboardData = async () => {
    
    try {
       
        const response = await user_api.get(`/dashboard/user`)
        
        if (response.data.success) {
         
            return response.data.data
       
        } else {
           
            throw new Error('API response not successful')
     
        }
        
    } catch (error) {
       
        console.error('Error fetching dashboard data:', error)
       
        return getEmptyDashboardData()

    }
}

const getEmptyDashboardData = () => {
    
    return {
    
        stats: [
            { icon: 'Award', title: "Overall Score", value: "0%", description: "No data available", color: "from-blue-500 to-cyan-500" },
            { icon: 'Target', title: "Forms Completed", value: "0", description: "No forms submitted", color: "from-green-500 to-emerald-500" },
            { icon: 'TrendingUp', title: "Completion Rate", value: "0%", description: "No activity yet", color: "from-purple-500 to-pink-500" },
            { icon: 'Activity', title: "Average Time", value: "0m 0s", description: "No time data", color: "from-orange-500 to-red-500" }
        ],

        dimensionsData: [],

        yearlyProgressData: { all: [] },

        dimensionDistribution: []

    }
}

export default getDashboardData