import { useContext, useMemo, useCallback, useState, useEffect } from "react"

import { FaNewspaper, FaBook } from 'react-icons/fa'

import { LayoutDashboard, Users, FileText, User, LogOut, Library, Home, Building, Menu, X } from "lucide-react"

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"

import { useNavigate, useLocation } from "react-router-dom"

import { AppContext } from "../../contexts/app_context"

import typeUserEnum from "../../functions/constants/type_user_enum"

import { motion, AnimatePresence } from "framer-motion"




export default function Sidebar() {

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const [isMobile, setIsMobile] = useState(false)

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navigate = useNavigate()

    const location = useLocation()

    const { user, logout } = useContext(AppContext)


    // Detectar se é mobile
    useEffect(() => {

        const checkScreenSize = () => {

            setIsMobile(window.innerWidth < 768)

        }

        checkScreenSize()

        window.addEventListener('resize', checkScreenSize)


        return () => window.removeEventListener('resize', checkScreenSize)

    }, [])

    // Configuração dos menus por role
    const menuConfig = useMemo(() => ({

        [typeUserEnum.ADMIN_ALPHA]: [
            { name: "Dashboard", icon: LayoutDashboard, path: '/edi/user' },
            { name: "Centers", icon: Building, path: '/edi/user/management-centers' },
            { name: "Users", icon: Users, path: '/edi/user/management-users' },
            { name: "Forms", icon: FileText, path: '/edi/user/management-forms' },
        ],

        [typeUserEnum.ADMIN]: [
            { name: "Dashboard", icon: LayoutDashboard, path: '/edi/user' },
            { name: "Centers", icon: Building, path: '/edi/user/management-centers' },
            { name: "Users", icon: Users, path: '/edi/user/management-users' },
            { name: "Forms", icon: FileText, path: '/edi/user/management-forms' },
        ],

        [typeUserEnum.COLLABORATOR]: [
            { name: "Home", icon: Home, path: '/edi/user/coordinator' },
            { name: "My Center", icon: Building, path: '/edi/user/coordinator/your/center' },
            { name: "Center's members", icon: Users, path: '/edi/user/coordinator/management-users' },
            { name: "Forms", icon: FileText, path: '/edi/user/coordinator/management-forms' },
        ],

        [typeUserEnum.PARTICIPANT]: [
            { name: "Home", icon: Home, path: '/edi/user/participant' },
            { name: "Forms", icon: FileText, path: '/edi/user/participant/forms' },
            { name: "News", icon: FaNewspaper, path: '/edi/user/participant/contents' },
            { name: 'Resources', icon: FaBook, path: '/edi/user/participant/resources' },
        ]

    }), [])

    // Filtrar menus baseado no role do usuário
    const menus = useMemo(() => {

        const userRole = user?.role

        return menuConfig[userRole] || []

    }, [user?.role, menuConfig])

    // Informações do usuário
    const userInfo = useMemo(() => ({

        initials: `${user?.firstName?.[0]?.toUpperCase() || ''}${user?.surname?.[0]?.toUpperCase() || ''}`,

        displayName: `${user?.firstName || ''} ${user?.surname || ''}`.trim(),

        role: user?.role || '',

        roleDisplayName: getRoleDisplayName(user?.role)

    }), [user])

    // Nomes dos roles
    function getRoleDisplayName(role) {

        const roleNames = {

            'admin': "Administrador",

            'collaborator': "Colaborador",

            'participant': "Member"

        }

        return roleNames[role] || role

    }

    // Navegação
    const handleNavigation = useCallback((path, name = null) => {

        if (name === 'goout') {

            onOpen()

            return

        }

        navigate(path)

        setMobileMenuOpen(false)

    }, [navigate, onOpen])

    const handleLogout = useCallback(() => {

        onOpenChange(false)

        setMobileMenuOpen(false)

        logout()

    }, [logout, onOpenChange, navigate])

    const isActiveMenu = useCallback((menuPath) => {

        return location.pathname === menuPath

    }, [location.pathname])

    // Sidebar para desktop
    const DesktopSidebar = () => (
        <motion.aside
            className="h-screen p-1 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50 shadow-sm relative overflow-hidden w-16 md:flex"
            initial={false}
        >
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute top-10 -left-10 w-32 h-32 bg-cyan-500 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 -right-10 w-24 h-24 bg-emerald-500 rounded-full blur-xl"></div>
            </div>

            {/* Topo com logo */}
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-center mb-8">
                    <motion.div className="cursor-pointer group" onClick={() => handleNavigation('/edi/')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <motion.div className="rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg relative overflow-hidden w-12 h-12" whileHover={{ rotate: 5, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                            <img src="/edi/equicenter.png" className="w-8 h-8 rounded-xl" alt="EquiCenter Logo" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Menu principal */}
                <nav className="flex flex-col justify-center items-center gap-2">
                    {menus.map((menu) => {

                        const IconComponent = menu.icon

                        const isActive = isActiveMenu(menu.path)

                        return (
                            <motion.div key={menu.name} className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Tooltip content={menu.name} placement="right" showArrow={true}>
                                    <Button isIconOnly onPress={() => handleNavigation(menu.path, menu.name)} className={`relative transition-all duration-200 ${isActive ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white w-12 h-12 shadow" : "hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 border w-12 h-12 border-transparent hover:border-cyan-200"}`} variant="flat">
                                        <IconComponent className="h-5 w-5" />
                                    </Button>
                                </Tooltip>
                            </motion.div>
                        )
                    })}
                </nav>
            </div>

            <div className="relative z-10">
                <Dropdown placement="top-start">
                    <DropdownTrigger>
                        <motion.div className="flex justify-center items-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 cursor-pointer shadow-lg relative overflow-hidden group mx-auto w-12 h-12" whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                            <Avatar className="flex-shrink-0 bg-white/20 text-white shadow-md border border-white/20" name={userInfo.initials} size="sm" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </motion.div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu" variant="flat" className="p-2 min-w-[220px]">
                        <DropdownItem onPress={() => handleNavigation("/edi/profile")} key="profile" startContent={<User className="h-4 w-4" />} className="rounded-xl px-3 py-3 hover:bg-cyan-50 text-gray-700 data-[hover=true]:text-cyan-600 transition-all duration-200" textValue="Profile">
                            <div className="flex flex-col">
                                <span className="font-medium">My Account</span>
                                <span className="text-xs text-gray-500">Manage your information</span>
                            </div>
                        </DropdownItem>

                        <DropdownItem key="divider" className="h-px bg-gray-200 my-2" isReadOnly />

                        <DropdownItem onPress={onOpen} key="logout" startContent={<LogOut className="h-4 w-4" />} className="rounded-xl px-3 py-3 hover:bg-red-50 text-red-600 data-[hover=true]:bg-red-100 font-medium transition-all duration-200" textValue="Logout">
                            <div className="flex flex-col">
                                <span className="font-medium">Sign Out</span>
                                <span className="text-xs text-red-500">End session</span>
                            </div>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {/* Botão de logout direto */}
                <motion.div
                    className="flex justify-center mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={onOpen}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </motion.div>
            </div>

            {/* Gradiente decorativo animado */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-30"
                animate={{
                    backgroundPosition: ["0%", "100%", "0%"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    backgroundSize: "200% 100%",
                    backgroundImage: "linear-gradient(to right, #06b6d4, #10b981, #06b6d4)"
                }}
            />
        </motion.aside>
    )

    // Bottom Navigation para mobile
    const MobileBottomNav = () => (
        <>
            {/* Overlay para fechar o menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Menu lateral mobile */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden"
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", damping: 30 }}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-xl bg-white/20 flex items-center justify-center shadow-lg w-10 h-10">
                                    <img src="/edi/equicenter.png" className="w-6 h-6 rounded-xl" alt="EquiCenter Logo" />
                                </div>
                                <div>
                                    <p className="font-medium">{userInfo.displayName}</p>
                                    <p className="text-xs text-white/80">{userInfo.roleDisplayName}</p>
                                </div>
                            </div>
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={() => setMobileMenuOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="p-4 space-y-1">
                            {menus.map((menu) => {
                                const IconComponent = menu.icon
                                const isActive = isActiveMenu(menu.path)

                                return (
                                    <Button
                                        key={menu.name}
                                        onPress={() => handleNavigation(menu.path, menu.name)}
                                        className={`w-full justify-start h-12 ${isActive ? "bg-cyan-50 text-cyan-600 border-l-4 border-cyan-500" : "text-gray-700 hover:bg-gray-100"}`}
                                        variant="light"
                                        startContent={<IconComponent className="h-5 w-5" />}
                                    >
                                        {menu.name}
                                    </Button>
                                )
                            })}
                        </nav>

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-1 bg-white">
                            <Button
                                onPress={() => handleNavigation("/edi/profile")}
                                className="w-full justify-start h-12 text-gray-700 hover:bg-gray-100"
                                variant="light"
                                startContent={<User className="h-5 w-5" />}
                            >
                                My Account
                            </Button>
                            <Button
                                onPress={onOpen}
                                className="w-full justify-start h-12 text-red-600 hover:bg-red-50"
                                variant="light"
                                startContent={<LogOut className="h-5 w-5" />}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Barra de navegação inferior */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow">
                <div className="flex items-center justify-around p-1">
                    {/* Botão menu hamburguer */}
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center p-1 flex-1 max-w-16"
                    >
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`w-12 h-12 ${mobileMenuOpen ? "text-cyan-600 bg-cyan-50" : "text-gray-600"}`}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <span className="text-xs mt-1 text-gray-600">Menu</span>
                    </motion.div>

                    {/* Menus principais (máximo 3 para caber na tela) */}
                    {menus.slice(0, 3).map((menu) => {

                        const IconComponent = menu.icon

                        const isActive = isActiveMenu(menu.path)

                        return (
                            <motion.div
                                key={menu.name}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center p-1 flex-1 max-w-16"
                            >
                                <Button
                                    isIconOnly
                                    onPress={() => handleNavigation(menu.path, menu.name)}
                                    className={`w-12 h-12 ${isActive ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                                    variant={isActive ? "solid" : "light"}
                                >
                                    <IconComponent className="h-5 w-5" />
                                </Button>
                                <span className={`text-xs mt-1 ${isActive ? "text-cyan-600 font-medium" : "text-gray-600"} truncate w-full text-center`}>
                                    {menu.name}
                                </span>
                            </motion.div>
                        )
                    })}

                    {/* Avatar do usuário */}
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center p-1 flex-1 max-w-16"
                    >
                        <Dropdown placement="top-start">
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500"
                                >
                                    <Avatar
                                        className="bg-white/20 text-white"
                                        name={userInfo.initials}
                                        size="sm"
                                    />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="User menu" variant="flat" className="p-2 min-w-[200px]">
                                <DropdownItem
                                    onPress={() => handleNavigation("/edi/profile")}
                                    key="profile"
                                    startContent={<User className="h-4 w-4" />}
                                    className="rounded-lg"
                                >
                                    My Account
                                </DropdownItem>
                                <DropdownItem
                                    onPress={onOpen}
                                    key="logout"
                                    startContent={<LogOut className="h-4 w-4" />}
                                    className="rounded-lg text-red-600"
                                >
                                    Sign Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <span className="text-xs mt-1 text-gray-600">Profile</span>
                    </motion.div>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Sidebar para desktop */}
            <div className="hidden md:block">
                <DesktopSidebar />
            </div>

            {/* Bottom navigation para mobile */}
            <div className="md:hidden">
                <MobileBottomNav />
            </div>

            {/* Espaço para a barra inferior no mobile - IMPORTANTE para evitar sobreposição */}
            {isMobile && <div className="h-16 md:h-0" />}

            {/* Modal de Confirmação de Logout (comum para ambos) */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Sign Out</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to sign out? You will need to log in again to access your account.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleLogout}>
                                    Sign Out
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}