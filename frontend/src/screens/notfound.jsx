import React, { useContext } from "react"
import { Home, FileText, LayoutDashboard, Users, Building, Library, Bell, User } from "lucide-react"
import { Link } from "react-router-dom"
import { AppContext } from "../contexts/app_context"
import typeUserEnum from "../functions/constants/type_user_enum"

const NotFound = () => {

    const { user } = useContext(AppContext)

    const getQuickLinks = () => {
        const userRole = user?.role

        if (!userRole) 
            return []

        if (userRole === typeUserEnum.PARTICIPANT) {
            return [
                { to: "/edi/user/participant", label: "Home", icon: Home },
                { to: "/edi/user/participant/contents", label: "Contents", icon: Library },
                { to: "/edi/user/participant/notifications", label: "Notifications", icon: Bell }
            ]
        }

        if (userRole === typeUserEnum.COLLABORATOR) {
            return [
                { to: "/edi/user/coordinator", label: "Home", icon: Home },
                { to: "/edi/user/coordinator/management-forms", label: "Forms", icon: FileText },
                { to: "/edi/user/coordinator/management-contents", label: "Contents", icon: Library }
            ]
        }

        if (userRole === typeUserEnum.ADMIN) {
            return [
                { to: "/edi/user", label: "Dashboard", icon: LayoutDashboard },
                { to: "/edi/user/management-centers", label: "Centers", icon: Building },
                { to: "/edi/user/management-forms", label: "Forms", icon: FileText }
            ]
        }

        return []
    }

    // Link principal baseado no role
    const getMainLink = () => {
        const userRole = user?.role

        if (userRole === typeUserEnum.PARTICIPANT) {

            return { to: "/edi/user/participant", label: "Go to Home", icon: Home }

        }

        if (userRole === typeUserEnum.COLLABORATOR) {

            return { to: "/edi/user/coordinator", label: "Go to Home", icon: Home }

        }

        // Admin ou default
        return { to: "/edi/user", label: "Go to Dashboard", icon: LayoutDashboard }
    }

    const quickLinks = getQuickLinks()

    const mainLink = getMainLink()

    const userRole = user?.role
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50/30 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="text-center">
                    {/* Ícone/Ilustração animada */}
                    <div className="mb-8 relative">
                        <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <FileText className="h-16 w-16 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                404
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="mb-10">
                        <h1 className="text-8xl font-black text-gray-800 mb-4 bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                            404
                        </h1>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                            The page you are looking for doesn't exist or has been moved.
                            {user && ` Let's get you back to your ${userRole === typeUserEnum.ADMIN ? 'dashboard' : 'home page'}.`}
                        </p>
                    </div>

                    {/* Ações principais */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link 
                            to={mainLink.to}
                            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <mainLink.icon size={20} />
                            <span>{mainLink.label}</span>
                        </Link>
                        
                        <Link 
                            to="/edi/" 
                            className="group flex items-center justify-center gap-3 border-2 border-cyan-200 text-gray-700 px-8 py-4 rounded-2xl hover:border-cyan-500 hover:bg-white transition-all duration-300 font-semibold shadow hover:shadow-md"
                        >
                            <Home size={20} />
                            <span>Back to Main Site</span>
                        </Link>
                    </div>

                    {/* Links rápidos baseados no perfil */}
                    {user && quickLinks.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100 p-8 shadow">
                            <h3 className="font-bold text-gray-800 mb-6 text-lg flex items-center justify-center gap-2">
                                <User size={20} />
                                Your Quick Links
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center">
                                {quickLinks.map((link, index) => (
                                    <Link 
                                        key={index} 
                                        to={link.to} 
                                        className="group flex flex-col items-center p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-300"
                                    >
                                        <link.icon className="h-6 w-6 text-cyan-600 mb-2" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600 text-center">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensagem para usuários não logados */}
                    {!user && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100 p-8 shadow">
                            <h3 className="font-bold text-gray-800 mb-4 text-lg">
                                Please Log In
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Sign in to access your personalized dashboard and quick links.
                            </p>
                            <Link 
                                to="/edi/login"
                                replace={true}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 font-semibold"
                            >
                                <User size={18} />
                                Do Login to Explore More
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotFound