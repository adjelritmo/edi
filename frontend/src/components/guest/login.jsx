import { useState, useEffect, useContext } from "react"

import { motion, AnimatePresence } from "framer-motion"

import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Button, Input, Select, SelectItem, Badge, Autocomplete, AutocompleteItem, Avatar } from "@heroui/react"

import { Eye, EyeOff, Mail, Lock, Calendar, MapPin, Building, ArrowLeft, GraduationCap, User } from "lucide-react"

import doLogin from "../../functions/guest/doLogin"

import doRegister from "../../functions/guest/doRegister"

import { useNavigate } from "react-router-dom"

import { AppContext } from "../../contexts/app_context"

import getCountries from "../../functions/constants/get_countries"



const Login = ({ _isLogin }) => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const [isLogin, setIsLogin] = useState(_isLogin)

    const [isLoading, setIsLoading] = useState(false)

    const [showPassword, setShowPassword] = useState(false)

    const [formErrors, setFormErrors] = useState({})

    const [formData, setFormData] = useState({ email: "", password: "", firstName: "", surname: "", country: "", professional_country: "", centerId: null, gender: "", researchPosition: "", bornDate: "" })

    const navigate = useNavigate()

    const { onLoadUser, centersNames } = useContext(AppContext)

    useEffect(() => {
        if (isOpen) {
            setIsLogin(_isLogin)
        }
    }, [isOpen, _isLogin])

    const countries = getCountries()

    const genders = [
        { key: "female", label: "Female" },
        { key: "male", label: "Male" },
        { key: "non-binary", label: "Non-binary" },
        { key: "not answer", label: "Prefer not to answer" }
    ]

    const researchPositions = [
        { key: "early stage researcher", label: "Early stage researcher" },
        { key: "managerial staff", label: "Managerial staff" },
        { key: "professor", label: "Professor" },
        { key: "senior researcher", label: "Senior Researcher" },
        { key: "technical staff", label: "Technical staff" },
    ]

    const centers = centersNames

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {

        const errors = {}

        if (isLogin) {
            // Validation for login
            if (!formData.email.trim()) errors.email = "Email is required"
            if (!formData.password.trim()) errors.password = "Password is required"
        } else {
            // Validation for registration
            if (!formData.firstName.trim()) errors.firstName = "First name is required"
            if (!formData.surname.trim()) errors.surname = "Surname is required"
            if (!formData.email.trim()) errors.email = "Email is required"
            if (!formData.password.trim()) errors.password = "Password is required"
            if (!formData.country.trim()) errors.country = "Country is required"
            if (!formData.professional_country.trim()) errors.professional_country = "professional country is required"
            if (!formData.centerId) errors.centerId = "Research center is required"
            if (!formData.gender.trim()) errors.gender = "Gender is required"
            if (!formData.researchPosition.trim()) errors.researchPosition = "Research position is required"
            if (!formData.bornDate.trim()) errors.bornDate = "Birth date is required"
        }

        setFormErrors(errors)

        return Object.keys(errors).length === 0

    }

    const handleSubmit = async () => {

        if (!validateForm()) {
            return // Stop if validation fails
        }

        setIsLoading(true)
        if (isLogin) {
            await doLogin(formData.email, formData.password, navigate, onLoadUser)
        } else {
            await doRegister(formData, navigate, onLoadUser)
        }
        setIsLoading(false)
    }

    const toggleFormMode = () => {
        setIsLogin(!isLogin)
        // Clear errors when switching modes
        setFormErrors({})
    }

    // Reset form when modal closes
    const handleOpenChange = (isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) {
            // Reset form data and errors when modal closes
            setFormData({
                email: "",
                password: "",
                firstName: "",
                surname: "",
                country: "",
                professional_country: "",
                centerId: "",
                gender: "",
                researchPosition: "",
                bornDate: ""
            })
            setFormErrors({})
            setShowPassword(false)
        }
    }

    // Variantes de animação para o formulário de login
    const loginVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    }

    // Variantes de animação para o formulário de registro
    const registerVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <>
            <Button onPress={onOpen} className={`font-semibold ${_isLogin ? "bg-transparent text-cyan-600 border-2 border-cyan-600 hover:bg-cyan-600 hover:text-white" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 shadow"}`} size="md">
                {_isLogin ? "Login" : "Register"}
            </Button>

            <Modal backdrop="blur" scrollBehavior="outside" isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="4xl" classNames={{ base: "bg-white dark:bg-gray-900", closeButton: `hover:bg-cyan-50 text-gray-500 cursor-pointer ${isLogin ? "" : "text-white"} hover:text-cyan-600` }}>
                <ModalContent>
                    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow">
                        {/* Painel esquerdo - Formulário */}
                        <div className={`w-full md:w-1/2 p-5 ${isLogin ? 'md:order-1' : ''}`}>
                            <ModalHeader className="flex flex-col gap-1 text-center relative p-0 mb-3">
                                {!isLogin && (<button onClick={toggleFormMode} className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-cyan-50 transition-colors cursor-pointer text-cyan-600">
                                    <ArrowLeft size={20} />
                                </button>
                                )}

                                {
                                    isLogin && (
                                        <div className="flex justify-center mb-2">
                                            <div className="p-3 bg-gradient-to-r from-cyan-100 to-emerald-100 rounded-full">
                                                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                                    <img className="w-36 h-36 rounded-full" src="/edi/equicenter.png" alt="" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="text-center">
                                    <Badge variant="faded" className="-right-2 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-4xl" content={isLogin ? "+" : ""}>
                                        <h2 className="text-2xl text-center font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                            {isLogin ? "Sign in to EDI" : "Create Account"}
                                        </h2>
                                    </Badge>
                                </div>

                                <p className="text-sm text-gray-500 mt-1">
                                    {isLogin ? "Enter your credentials to continue" : "Join our research community"}
                                </p>
                            </ModalHeader>

                            <ModalBody className="p-0">
                                <AnimatePresence mode="wait">
                                    {
                                        isLogin ?
                                            (
                                                <motion.div key="login-form" variants={loginVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-2">
                                                    <Input
                                                        label="Email"
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        value={formData.email}
                                                        onValueChange={(value) => handleInputChange("email", value)}
                                                        className="mb-1"
                                                        startContent={<Mail size={18} className="text-gray-400" />}
                                                        required
                                                        isInvalid={!!formErrors.email}
                                                        errorMessage={formErrors.email}
                                                        variant="bordered"
                                                    />

                                                    <Input
                                                        label="Password"
                                                        placeholder="Enter your password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onValueChange={(value) => handleInputChange("password", value)}
                                                        endContent={
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="focus:outline-none cursor-pointer text-gray-400 hover:text-cyan-600"
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        }
                                                        startContent={<Lock size={18} className="text-gray-400" />}
                                                        required
                                                        isInvalid={!!formErrors.password}
                                                        errorMessage={formErrors.password}
                                                        variant="bordered"
                                                    />

                                                    <div className="flex justify-end items-center mt-2 mb-4">

                                                        {
                                                            /*
                                                            
                                                             <button
                                                              onClick={() => navigate("/edi/forgot-password")}
                                                              type="button"
                                                              className="text-sm text-cyan-600 hover:underline cursor-pointer"
                                                            >
                                                              Forgot password?
                                                            </button>
                                                            */
                                                        }
                                                    </div>

                                                    <Button
                                                        isLoading={isLoading}
                                                        className="w-full font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:from-cyan-600 hover:to-emerald-600"
                                                        onPress={handleSubmit}
                                                        size="lg"
                                                    >
                                                        SIGN IN
                                                    </Button>
                                                </motion.div>
                                            )
                                            :
                                            (
                                                <motion.div
                                                    key="register-form"
                                                    variants={registerVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-1"
                                                >
                                                    <div className="grid grid-cols-2 gap-1 ">
                                                        <Input
                                                            label="First Name"
                                                            placeholder="Enter your first name"
                                                            value={formData.firstName}
                                                            onValueChange={(value) => handleInputChange("firstName", value)}
                                                            required
                                                            isInvalid={!!formErrors.firstName}
                                                            errorMessage={formErrors.firstName}
                                                            startContent={<User size={18} className="text-gray-400" />}
                                                            variant="bordered"
                                                        />
                                                        <Input
                                                            label="Surname"
                                                            placeholder="Enter your surname"
                                                            value={formData.surname}
                                                            onValueChange={(value) => handleInputChange("surname", value)}
                                                            required
                                                            isInvalid={!!formErrors.surname}
                                                            errorMessage={formErrors.surname}
                                                            variant="bordered"
                                                        />
                                                    </div>

                                                    <Input
                                                        label="Email"
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        value={formData.email}
                                                        startContent={<Mail size={18} className="text-gray-400" />}
                                                        onValueChange={(value) => handleInputChange("email", value)}
                                                        required
                                                        isInvalid={!!formErrors.email}
                                                        errorMessage={formErrors.email}
                                                        variant="bordered"
                                                    />

                                                    <div className="grid grid-cols-2 gap-1">
                                                        <Select
                                                            label="Research Center"
                                                            placeholder="Select your center"
                                                            selectedKeys={formData.centerId ? [formData.centerId] : []}
                                                            startContent={<Building size={18} className="text-gray-400" />}
                                                            onChange={(e) => handleInputChange("centerId", e.target.value)}
                                                            isInvalid={!!formErrors.centerId}
                                                            errorMessage={formErrors.centerId}
                                                            variant="bordered"
                                                        >
                                                            {centers.map((center) => (
                                                                <SelectItem key={center.id}>{center.name}</SelectItem>
                                                            ))}
                                                        </Select>

                                                        <Select
                                                            label="Research Position"
                                                            placeholder="Select your position"
                                                            selectedKeys={formData.researchPosition ? [formData.researchPosition] : []}
                                                            startContent={<GraduationCap size={18} className="text-gray-400" />}
                                                            onChange={(e) => handleInputChange("researchPosition", e.target.value)}
                                                            isInvalid={!!formErrors.researchPosition}
                                                            errorMessage={formErrors.researchPosition}
                                                            variant="bordered"
                                                        >
                                                            {researchPositions.map((position) => (
                                                                <SelectItem key={position.key}>{position.label}</SelectItem>
                                                            ))}
                                                        </Select>
                                                    </div>

                                                    <Autocomplete
                                                        allowsCustomValue
                                                        defaultItems={countries}
                                                        label="Select your country of professional activity"
                                                        startContent={<MapPin size={18} className="text-gray-400" />}
                                                        onSelectionChange={(key) => handleInputChange("professional_country", key)}
                                                        onInputChange={(key) => handleInputChange("professional_country", key)}
                                                        isInvalid={!!formErrors.professional_country}
                                                        isClearable
                                                        errorMessage={formErrors.professional_country}
                                                        variant="bordered"
                                                    >
                                                        {(professional_country) => (
                                                            <AutocompleteItem
                                                                startContent={
                                                                    <Avatar
                                                                        alt={professional_country.key}
                                                                        className="w-6 h-6"
                                                                        src={professional_country.flag}
                                                                    />
                                                                }
                                                                key={professional_country.key}
                                                            >
                                                                {professional_country.label}
                                                            </AutocompleteItem>
                                                        )}
                                                    </Autocomplete>

                                                    <Autocomplete
                                                        allowsCustomValue
                                                        defaultItems={countries}
                                                        label="Select your country (where you from)"
                                                        startContent={<MapPin size={18} className="text-gray-400" />}
                                                        onSelectionChange={(key) => handleInputChange("country", key)}
                                                        onInputChange={(key) => handleInputChange("country", key)}
                                                        isInvalid={!!formErrors.country}
                                                        isClearable
                                                        errorMessage={formErrors.country}
                                                        variant="bordered"
                                                    >
                                                        {(country) => (
                                                            <AutocompleteItem
                                                                startContent={
                                                                    <Avatar
                                                                        alt={country.key}
                                                                        className="w-6 h-6"
                                                                        src={country.flag}
                                                                    />
                                                                }
                                                                key={country.key}
                                                            >
                                                                {country.label}
                                                            </AutocompleteItem>
                                                        )}
                                                    </Autocomplete>


                                                    <div className="grid grid-cols-2 gap-1">
                                                        <Input
                                                            label="Birth Date"
                                                            type="date"
                                                            placeholder="Select your birth date"
                                                            value={formData.bornDate}
                                                            startContent={<Calendar size={18} className="text-gray-400" />}
                                                            onValueChange={(value) => handleInputChange("bornDate", value)}
                                                            isInvalid={!!formErrors.bornDate}
                                                            errorMessage={formErrors.bornDate}
                                                            variant="bordered"
                                                        />

                                                        <Select
                                                            label="Gender"
                                                            placeholder="Select your gender"
                                                            selectedKeys={formData.gender ? [formData.gender] : []}
                                                            onChange={(e) => handleInputChange("gender", e.target.value)}
                                                            isInvalid={!!formErrors.gender}
                                                            errorMessage={formErrors.gender}
                                                            variant="bordered"
                                                        >
                                                            {genders.map((gender) => (
                                                                <SelectItem key={gender.key}>{gender.label}</SelectItem>
                                                            ))}
                                                        </Select>
                                                    </div>

                                                    <Input label="Password" placeholder="Enter your password" type={showPassword ? "text" : "password"} value={formData.password} onValueChange={(value) => handleInputChange("password", value)} endContent={<button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none cursor-pointer text-gray-400 hover:text-cyan-600" >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                    }
                                                        startContent={<Lock size={18} className="text-gray-400" />}
                                                        required
                                                        isInvalid={!!formErrors.password}
                                                        errorMessage={formErrors.password}
                                                        variant="bordered"
                                                    />

                                                    <Button
                                                        isLoading={isLoading}
                                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold w-full mt-2 shadow hover:from-cyan-600 hover:to-emerald-600"
                                                        onPress={handleSubmit}
                                                        size="lg"
                                                    >
                                                        Create Account
                                                    </Button>
                                                </motion.div>
                                            )}
                                </AnimatePresence>
                            </ModalBody>
                        </div>

                        {/* Painel direito - Mensagem de boas-vindas */}
                        <div className={`w-full md:w-1/2 bg-gradient-to-br from-cyan-500 to-emerald-500 p-8 flex flex-col justify-center items-center text-white ${isLogin ? '' : 'md:order-2'}`}>
                            <div className="text-center">
                                {
                                    !isLogin && (
                                        <div className="mb-6 flex justify-center">
                                            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                                <img className="w-40 h-40 boder-white border-2 rounded-full" src="/edi/equicenter.png" alt="" />
                                            </div>
                                        </div>
                                    )
                                }
                                <h2 className="text-3xl font-bold mb-4">
                                    {isLogin ? "Welcome!" : "Welcome Back!"}
                                </h2>
                                <p className="mb-8 text-center text-cyan-100">
                                    {isLogin ? "Enter your personal details and start your journey with us" : "To stay connected with us, please login with your personal info"}
                                </p>
                                <Button color="default" className="bg-white/10 hover:bg-white/20 rounded-full px-8 py-6 text-white font-medium border-2 border-white/30 backdrop-blur-sm transition-all" onPress={toggleFormMode}>
                                    {isLogin ? "SIGN UP" : "SIGN IN"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </>
    )
}

export default Login