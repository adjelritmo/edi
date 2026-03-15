import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../../components/user/sidebars"
import { useEffect } from "react"

const IndexUser = () => {

     const location = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Sidebar fixa - não scrolla */}
            <div className="h-screen sticky top-0 flex-shrink-0 border-r z-1 border-gray-200">
                <Sidebar />
            </div>
            
            {/* Conteúdo principal - scrollável */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <div className="mx-auto pb-20 md:pb-2 bg-gradient-to-br from-gray-50 to-white">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default IndexUser