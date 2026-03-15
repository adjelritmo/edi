import { useContext, useState } from "react"
import Login from "./guest/login"
import { AppContext } from "../contexts/app_context"
import { useNavigate, useLocation } from "react-router-dom"
import typeUserEnum from "../functions/constants/type_user_enum"
import { Avatar, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react"
import { MdLogout, MdPerson, MdDashboard } from "react-icons/md"

const Header = () => {

    const { user, logout } = useContext(AppContext)

    const navigate = useNavigate()

    const location = useLocation()

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const role = user?.role === typeUserEnum.PARTICIPANT ? `Member` : `${user?.role}`

    const initialName = user ? `${user.firstName[0].toUpperCase()}${user?.surname[0].toUpperCase()}` : user?.email[0].toUpperCase() || 'Guest'

    const navigationItems = [
        { label: 'Home', path: '/edi/', id: 'home' },
        { label: 'News', path: '/edi/news', id: 'news' },
        { label: 'Resources', path: '/edi/resources', id: 'resources' },
        { label: 'About Us', path: '/edi/about', id: 'about' },
    ]

    const goToApp = () => {

        const role = user?.role

        if (role === typeUserEnum.ADMIN || role === typeUserEnum.ADMIN_ALPHA)

            navigate('/edi/user', { replace: true })

        else if (role === typeUserEnum.COLLABORATOR)

            navigate('/edi/user/coordinator', { replace: true })

        else if (role === typeUserEnum.PARTICIPANT)

            navigate('/edi/user/participant', { replace: true })

        else

            navigate('/edi/login', { replace: true })
    }

    const handleNavigation = (path) => {

        navigate(path)

        setIsMenuOpen(false)

    }

    const handleLogout = () => {

        logout()

        navigate('/edi/')

    }

    const isActiveLink = (path) => {

        return location.pathname === path

    }

    return (
        <>
            {/* Header fixo */}
            <div className="fixed w-full bg-white z-40 shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleNavigation('/edi/')}
                        >
                            <img
                                className="h-10 w-10 rounded-full"
                                src="/edi/equicenter.png"
                                alt="EquiCenter logo"
                            />
                            <Badge
                                variant="faded"
                                className="left-2 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-4xl"
                                content="+"
                            >
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge>
                        </div>

                        {/* Navigation - Desktop */}
                        <nav className="hidden md:flex space-x-8">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`transition-all cursor-pointer duration-200 font-medium ${isActiveLink(item.path)
                                        ? 'text-cyan-500 border-b-2 border-cyan-500'
                                        : 'text-gray-600 hover:text-cyan-500'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* User Menu / Login Buttons */}
                        {user && user?.role !== 'guest' ? (
                            <div className="flex items-center gap-4">

                                {/* User Dropdown */}
                                <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">

                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {user?.firstName || user.email?.split('@')[0]}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {user?.role?.toLowerCase()}
                                                </p>
                                            </div>

                                            <Avatar
                                                className="border-2 border-cyan-600 bg-gradient-to-r from-cyan-500 to-emerald-500"
                                                classNames={{ name: 'text-xl font-bold' }}
                                                name={initialName}
                                            />
                                        </div>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="User menu"
                                        variant="flat"
                                    >
                                        <DropdownItem
                                            key="profile"
                                            startContent={<MdPerson className="text-lg" />}
                                            onClick={() => navigate('/edi/profile')}
                                        >
                                            My Profile
                                        </DropdownItem>
                                        <DropdownItem
                                            key="dashboard"
                                            startContent={<MdDashboard className="text-lg" />}
                                            onClick={() => goToApp()}
                                        >
                                            Dashboard
                                        </DropdownItem>
                                        <DropdownItem
                                            key="logout"
                                            startContent={<MdLogout className="text-lg" />}
                                            onClick={handleLogout}
                                            className="text-danger"
                                            color="danger"
                                        >
                                            Log Out
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Login _isLogin={true} />
                                <Login _isLogin={false} />
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                                <span className={`block h-0.5 w-6 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 bg-white absolute top-16 left-0 right-0 shadow-lg z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav className="flex flex-col space-y-2">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`text-left px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 font-medium ${isActiveLink(item.path)
                                            ? 'bg-cyan-50 text-cyan-500 border-l-4 border-cyan-500'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-500'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Mobile Login Buttons */}
                                {(!user || user?.role === 'guest') && (
                                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 mt-2">
                                        <div className="px-4">
                                            <Login _isLogin={true} />
                                        </div>
                                        <div className="px-4">
                                            <Login _isLogin={false} />
                                        </div>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Espaço reservado para evitar sobreposição de conteúdo */}
            <div className="h-16"></div>
        </>
    )
}

export default Header