import { useContext, useState, useEffect } from "react"

import { Button, Avatar, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Checkbox, Autocomplete, AutocompleteItem } from "@heroui/react"

import { Users, MapPin, Briefcase, Calendar, Mail, Award, Edit3, Save, Shield, Key, Lock, Trash2, AlertTriangle, AlertCircle, LogOut, Eye, EyeOff, Building } from "lucide-react"

import { AppContext } from "../../contexts/app_context"

import { useLocation, useNavigate } from "react-router-dom"

import doUpdateUser from "../../functions/user/accounts/updateData"

import doChangePassword from "../../functions/user/accounts/changePassword"

import doDeleteAccount from "../../functions/user/accounts/deleteAccount"
import getCountries from "../../functions/constants/get_countries"




const Profile = () => {

    const { user, setUser, logout } = useContext(AppContext)

    const navigate = useNavigate()

    const location = useLocation()

    const countries = getCountries()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)

    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const [isPasswordLoading, setIsPasswordLoading] = useState(false)

    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)

    const [showNewPassword, setShowNewPassword] = useState(false)

    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [deleteConfirmationText, setDeleteConfirmationText] = useState("")

    const [confirmDelete, setConfirmDelete] = useState(false)

    useEffect(() => {

        window.scrollTo(0, 0)

    }, [location.pathname])

    const [editFormData, setEditFormData] = useState({
        firstName: user?.firstName || "",
        role: user?.role,
        surname: user?.surname || "",
        email: user?.email || "",
        country: user?.country,
        professional_country: user?.professional_country,
        centerId: user?.centerId || "",
        gender: user?.gender || "not answer",
        researchPosition: user?.researchPosition || "early stage researcher",
        bornDate: user?.bornDate ? new Date(user?.bornDate).toISOString().split("T")[0] : "1990-01-01",
    })

    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const initialName = user
        ? `${user.firstName[0].toUpperCase()}${user.surname[0].toUpperCase()}`
        : user?.email[0].toUpperCase() || "Guest"

    const genderOptions = [
        { key: "female", label: "Female" },
        { key: "male", label: "Male" },
        { key: "non-binary", label: "Non-binary" },
        { key: "not answer", label: "Prefer not to answer" },
    ]

    const researchPositionOptions = [
        { key: "adm", label: "Administrative Staff" },
        { key: "early stage researcher", label: "Early Stage Researcher" },
        { key: "managerial staff", label: "Managerial Staff" },
        { key: "professor", label: "Professor" },
        { key: "senior researcher", label: "Senior Researcher" },
        { key: "technical staff", label: "Technical Staff" },
    ]

    const formatResearchPosition = (position) =>
        position?.replace(/([A-Z])/g, " $1").trim() || "Researcher"

    const handleEditSubmit = async () => {
        setIsLoading(true)
        try {
            const result = await doUpdateUser(editFormData, user, setUser)
            if (result && result === 200) {
                setIsEditModalOpen(false)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        setIsPasswordLoading(true)
        try {
            const result = await doChangePassword(
                passwordFormData.currentPassword,
                passwordFormData.newPassword,
                passwordFormData.confirmPassword,
                user
            )
            if (result && result === 200) {
                setIsChangePasswordModalOpen(false)
                setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsPasswordLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleteLoading(true)
        try {
            const result = await doDeleteAccount(user, logout)
            if (result && result === 200) {
                setIsConfirmDeleteModalOpen(false)
                setIsDeleteAccountModalOpen(false)
                navigate("/edi/login")
            }
        } catch (error) {
            console.log(error)
            alert(error.message || "Error deleting account")
        } finally {
            setIsDeleteLoading(false)
        }
    }

    const resetDeleteModal = () => {
        setDeleteConfirmationText("")
        setConfirmDelete(false)
        setIsDeleteLoading(false)
    }

    const resetPasswordModal = () => {
        setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setIsPasswordLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="relative">
                <div className="h-64 sm:h-80 bg-gradient-to-r from-cyan-400 via-cyan-700 to-emerald-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
                </div>

                {/* Avatar e informações principais */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20">
                    <div className="flex flex-col lg:flex-row items-center lg:items-end gap-2 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow border border-white/20">
                        <div className="relative">
                            <Avatar
                                classNames={{ name: "text-4xl font-bold" }}
                                name={initialName}
                                className="w-28 h-28 lg:w-36 lg:h-36 border-4 bg-gradient-to-r from-cyan-500 to-emerald-500 border-white shadow rounded-2xl"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                <Award className="w-3 h-3 fill-current" />
                            </div>
                        </div>

                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                        {user?.firstName} {user?.surname}
                                    </h1>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-gray-600">
                                        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                                            <Briefcase size={14} className="mr-2 text-blue-500" />
                                            <span className="capitalize">{formatResearchPosition(user?.researchPosition)}</span>
                                        </div>
                                        <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
                                            <MapPin size={14} className="mr-2 text-purple-500" />
                                            <span>{user?.country || "Portugal"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-center lg:justify-end">
                                    <Button
                                        variant="shadow"
                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:shadow-md transition-all duration-300"
                                        startContent={<Edit3 size={18} />}
                                        onPress={() => setIsEditModalOpen(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Informações pessoais adicionais */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {/* Personal Information */}
                    <Card className="border-none bg-gradient-to-br from-white to-blue-50/50 shadow rounded-2xl">
                        <CardBody className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Users className="h-5 w-5 text-blue-500 mr-3" />
                                Personal Information
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <p className="text-gray-900 font-medium">
                                            {user?.firstName} {user?.surname}
                                        </p>
                                    </div>
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <p className="text-gray-900 font-medium">{user?.email}</p>
                                    </div>
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                                        <p className="text-gray-900 font-medium">{user?.country || "Not specified"}</p>
                                    </div>
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                                        <p className="text-gray-900 font-medium">
                                            {user?.bornDate ? new Date(user.bornDate).toLocaleDateString() : "Not specified"}
                                        </p>
                                    </div>
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Professional Information */}
                    <Card className="border-none shadow bg-gradient-to-br from-white to-green-50/50 shadow rounded-2xl">
                        <CardBody className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Briefcase className="h-5 w-5 text-green-500 mr-3" />
                                Professional Information
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Research Position</label>
                                        <p className="text-gray-900 font-medium capitalize">{formatResearchPosition(user?.researchPosition)}</p>
                                    </div>
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Research Center</label>
                                        <p className="text-gray-900 font-medium">{user?.centerName || "Not specified"}</p>
                                    </div>
                                    <Building className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                        <p className="text-gray-900 font-medium capitalize">{user?.gender || "Not specified"}</p>
                                    </div>
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Your Profissional Country</label>
                                        <p className="text-gray-900 font-medium capitalize">{user?.professional_country || "Not specified"}</p>
                                    </div>
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <Card className="border-none bg-gradient-to-br from-white to-red-50/50 shadow rounded-2xl mt-6">
                    <CardBody className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Shield className="h-5 w-5 text-red-500 mr-3" />
                            Account Management
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Manage your account security and settings. Be careful with these actions as they are irreversible.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Change Password Card */}
                            <Card className="shadow border border-gray-200 hover:border-cyan-300 transition-colors">
                                <CardBody className="p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                            <Key className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Change Password</h4>
                                            <p className="text-sm text-gray-500">Update your password for enhanced security</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="flat"
                                        color="primary"
                                        className="w-full"
                                        startContent={<Lock className="h-4 w-4" />}
                                        onPress={() => setIsChangePasswordModalOpen(true)}
                                    >
                                        Change Password
                                    </Button>
                                </CardBody>
                            </Card>

                            {/* Delete Account Card */}
                            <Card className="shadow border border-gray-200 hover:border-red-300 transition-colors">
                                <CardBody className="p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Trash2 className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Delete Account</h4>
                                            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="flat"
                                        color="danger"
                                        className="w-full"
                                        startContent={<AlertTriangle className="h-4 w-4" />}
                                        onPress={() => setIsDeleteAccountModalOpen(true)}
                                    >
                                        Delete Account
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Edit Modal */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="rounded-2xl">
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Edit3 size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                                        <p className="text-white/90 text-sm">Update your personal and professional information</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input
                                            label="First Name"
                                            value={editFormData.firstName}
                                            onValueChange={(value) => setEditFormData((prev) => ({ ...prev, firstName: value }))}
                                            variant="bordered"
                                            isRequired
                                            classNames={{ input: "text-base", label: "text-gray-700 font-medium" }}
                                        />
                                        <Input
                                            label="Last Name"
                                            value={editFormData.surname}
                                            onValueChange={(value) => setEditFormData((prev) => ({ ...prev, surname: value }))}
                                            variant="bordered"
                                            isRequired
                                            classNames={{ input: "text-base", label: "text-gray-700 font-medium" }}
                                        />
                                    </div>

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={editFormData.email}
                                        onValueChange={(value) => setEditFormData((prev) => ({ ...prev, email: value }))}
                                        variant="bordered"
                                        isRequired
                                        classNames={{ input: "text-base", label: "text-gray-700 font-medium" }}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                                        <Autocomplete
                                            allowsCustomValue
                                            defaultItems={countries}
                                            label="Select your country"
                                            defaultSelectedKey={editFormData?.country?.toLowerCase()}
                                            value={editFormData?.country}
                                            startContent={<MapPin size={18} className="text-gray-400" />}
                                            onSelectionChange={(key) => setEditFormData((prev) => ({ ...prev, country: key }))}
                                            onInputChange={(key) => setEditFormData((prev) => ({ ...prev, country: key }))}
                                            isClearable
                                            isRequired
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

                                        <Input
                                            label="Date of Birth"
                                            type="date"
                                            value={editFormData.bornDate}
                                            onValueChange={(value) => setEditFormData((prev) => ({ ...prev, bornDate: value }))}
                                            variant="bordered"
                                            isRequired
                                            classNames={{ input: "text-base", label: "text-gray-700 font-medium" }}
                                        />

                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Briefcase className="h-5 w-5 text-green-500 mr-2" />
                                        Professional Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                        <Select
                                            label="Gender"
                                            selectedKeys={[editFormData.gender]}
                                            onSelectionChange={(keys) => setEditFormData((prev) => ({ ...prev, gender: Array.from(keys)[0] }))}
                                            variant="bordered"
                                            classNames={{ label: "text-gray-700 font-medium" }}
                                        >
                                            {genderOptions.map((option) => (
                                                <SelectItem key={option.key}>{option.label}</SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            label="Research Position"
                                            selectedKeys={[editFormData.researchPosition]}
                                            onSelectionChange={(keys) => setEditFormData((prev) => ({ ...prev, researchPosition: Array.from(keys)[0] }))}
                                            variant="bordered"
                                            classNames={{ label: "text-gray-700 font-medium" }}
                                        >
                                            {researchPositionOptions.map((option) => (
                                                <SelectItem key={option.key}>{option.label}</SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <Autocomplete
                                        allowsCustomValue
                                        defaultItems={countries}
                                        label="Select your country of professional activity"
                                        startContent={<MapPin size={18} className="text-gray-400" />}
                                        defaultSelectedKey={editFormData?.professional_country?.toLowerCase() ?? null}
                                        value={editFormData?.professional_country ?? ""}
                                        onSelectionChange={(key) => setEditFormData(prev => ({ ...prev, professional_country: key }))}
                                        onInputChange={(value) => setEditFormData(prev => ({ ...prev, professional_country: value }))}
                                        isClearable
                                        isRequired
                                        variant="bordered"
                                    >
                                        {(professional_country) => (
                                            <AutocompleteItem
                                                key={professional_country.key}
                                                startContent={
                                                    <Avatar
                                                        alt={professional_country.key}
                                                        className="w-6 h-6"
                                                        src={professional_country.flag}
                                                    />
                                                }
                                            >
                                                {professional_country.label}
                                            </AutocompleteItem>
                                        )}
                                    </Autocomplete>

                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 pt-0 bg-white rounded-b-2xl">
                                <div className="flex gap-2 w-full justify-end">
                                    <Button variant="light" color="danger" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        isLoading={isLoading}
                                        color="primary"
                                        onPress={handleEditSubmit}
                                        startContent={<Save size={18} />}
                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Change Password Modal */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" isOpen={isChangePasswordModalOpen} onClose={() => {
                setIsChangePasswordModalOpen(false)
                resetPasswordModal()
            }} className="rounded-2xl">
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Key size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Change Password</h2>
                                        <p className="text-white/90 text-sm">Update your password for enhanced security</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            className="max-w-full"
                                            endContent={
                                                <button
                                                    aria-label="toggle password visibility"
                                                    className="focus:outline-solid outline-transparent cursor-pointer"
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            }
                                            label="Current Password"
                                            value={passwordFormData.currentPassword}
                                            onValueChange={(value) => setPasswordFormData(prev => ({ ...prev, currentPassword: value }))}
                                            size="lg"
                                            placeholder="Enter your current Password"
                                            type={showCurrentPassword ? "text" : "password"}
                                            variant="bordered"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            className="max-w-full"
                                            endContent={
                                                <button
                                                    aria-label="toggle password visibility"
                                                    className="focus:outline-solid outline-transparent cursor-pointer"
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            }
                                            label="New Password"
                                            size="lg"
                                            placeholder="Enter a new password"
                                            value={passwordFormData.newPassword}
                                            onValueChange={(value) => setPasswordFormData(prev => ({ ...prev, newPassword: value }))}
                                            type={showNewPassword ? "text" : "password"}
                                            variant="bordered"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                                    </div>

                                    <div>
                                        <Input
                                            className="max-w-full"
                                            endContent={
                                                <button
                                                    aria-label="toggle password visibility"
                                                    className="focus:outline-solid outline-transparent cursor-pointer"
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            }
                                            label="Confirm New Password"
                                            size="lg"
                                            placeholder="Enter to confirm new password"
                                            value={passwordFormData.confirmPassword}
                                            onValueChange={(value) => setPasswordFormData(prev => ({ ...prev, confirmPassword: value }))}
                                            type={showConfirmPassword ? "text" : "password"}
                                            variant="bordered"
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 bg-white rounded-b-2xl">
                                <div className="flex gap-2 w-full justify-end">
                                    <Button variant="light" color="danger" onPress={() => {
                                        onClose()
                                        resetPasswordModal()
                                    }} >
                                        Cancel
                                    </Button>
                                    <Button
                                        isLoading={isPasswordLoading}
                                        color="primary"
                                        onPress={handleChangePassword}
                                        startContent={<Lock size={18} />}
                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold"
                                        isDisabled={!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete Account Modal (First Step - Warning) */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} className="rounded-2xl">
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <AlertTriangle size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Delete Account</h2>
                                        <p className="text-white/90 text-sm">Warning: This action is irreversible</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-red-800 mb-2">Critical Warning</h4>
                                                <p className="text-sm text-red-700">
                                                    Deleting your account will permanently remove all your data including:
                                                </p>
                                                <ul className="text-sm text-red-700 mt-2 space-y-1">
                                                    <li>• All your personal information</li>
                                                    <li>• Your research contributions and data</li>
                                                    <li>• Form submissions and responses</li>
                                                    <li>• Center associations and permissions</li>
                                                    <li>• Access to all platform features</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-amber-800 mb-1">Before you proceed</h4>
                                                <p className="text-sm text-amber-700">
                                                    Consider exporting your data or contacting support if you're experiencing issues.
                                                    Account deletion cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 bg-white rounded-b-2xl">
                                <div className="flex gap-2 w-full justify-between">
                                    <Button variant="flat" color="warning" onPress={onClose} >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            setIsDeleteAccountModalOpen(false)
                                            setIsConfirmDeleteModalOpen(true)
                                        }}
                                        startContent={<Trash2 size={18} />}
                                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold"
                                    >
                                        I Understand, Continue
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Confirm Delete Account Modal (Second Step - Final Confirmation) */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} scrollBehavior="outside" isOpen={isConfirmDeleteModalOpen} onClose={() => {
                setIsConfirmDeleteModalOpen(false)
                resetDeleteModal()
            }} className="rounded-2xl">
                <ModalContent className="rounded-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col rounded-t-2xl gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Trash2 size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Final Confirmation</h2>
                                        <p className="text-white/90 text-sm">Last step to permanently delete your account</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                            <h4 className="font-bold text-red-800">FINAL WARNING</h4>
                                        </div>
                                        <p className="text-sm text-red-700 mt-2">
                                            You are about to permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm:
                                            </label>
                                            <Input
                                                value={deleteConfirmationText}
                                                onValueChange={setDeleteConfirmationText}
                                                variant="bordered"
                                                size="lg"
                                                placeholder="DELETE MY ACCOUNT"
                                                classNames={{ input: "text-center font-mono" }}
                                            />
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                            <Checkbox
                                                isSelected={confirmDelete}
                                                onValueChange={setConfirmDelete}
                                                color="danger"
                                            />
                                            <div>
                                                <label className="text-sm font-medium text-gray-900 cursor-pointer">
                                                    I understand that all my data will be permanently deleted
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    I acknowledge that this action is irreversible and I will lose access to all platform features.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-2">
                                            <LogOut className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-800 mb-1">What happens next?</h4>
                                                <p className="text-sm text-blue-700">
                                                    After deletion, you will be immediately logged out and redirected to the login page.
                                                    Your account data will be permanently removed from our systems within 24 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="p-6 bg-white rounded-b-2xl">
                                <div className="flex gap-2 w-full justify-between">
                                    <Button variant="flat" color="primary" onPress={() => {
                                        onClose()
                                        resetDeleteModal()
                                    }} >
                                        Cancel
                                    </Button>
                                    <Button
                                        isLoading={isDeleteLoading}
                                        color="danger"
                                        onPress={handleDeleteAccount}
                                        startContent={<Trash2 size={18} />}
                                        className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow"
                                        isDisabled={deleteConfirmationText !== "DELETE MY ACCOUNT" || !confirmDelete}
                                    >
                                        Permanently Delete Account
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default Profile