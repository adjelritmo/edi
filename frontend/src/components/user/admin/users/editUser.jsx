import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Select, SelectItem } from "@heroui/react"
import { Building, User, Sparkles, Shield } from "lucide-react"
import { AppContext } from "../../../../contexts/app_context"
import editUser from "../../../../functions/admin/users/editUser"

const EditUserModal = ({ user, isOpen, onOpenChange, users, setUsers }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [formData, setFormData] = useState({ centerId: "", role: "" })
    const [label, setLabel] = useState('')


    const { centersNames } = useContext(AppContext)

    const roles = [
        { key: "admin", label: "Administrator" },
        { key: "coordinator", label: "Coordinator" },
        { key: "member", label: "Member" },
    ]

    const centers = centersNames || []

    // Preencher formData quando user mudar ou modal abrir
    useEffect(() => {
        if (user && isOpen) {
            setFormData({ centerId: user.centerId?.toString() || "", role: user.role || "" })
        }
    }, [user, isOpen])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) 
            setFormErrors(prev => ({ ...prev, [field]: "" }))
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.centerId) errors.centerId = "Research center is required"
        if (!formData.role.trim()) errors.role = "Role is required"
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setIsLoading(true)
        try {
            const result = await editUser(user.id, formData, users, setUsers, label)
            if (result === 200)
                onOpenChange(false)
        } catch (error) {
            console.error("Error updating user:", error)
        }
        setIsLoading(false)
    }

    const handleOpenChange = (open) => {
        if (!open) {
            setFormData({ centerId: "", role: "" })
            setFormErrors({})
        }
        onOpenChange(open)
    }

    const modalVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    }

    return (
        <Modal backdrop="blur" isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="3xl"
            classNames={{ base: "bg-white dark:bg-gray-900", closeButton: "hover:bg-cyan-50 text-gray-500 text-2xl cursor-pointer hover:text-cyan-600" }}>
            <ModalContent>
                <motion.div variants={modalVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-xl">
                        {/* Painel esquerdo */}
                        <div className="w-full md:w-2/5 bg-gradient-to-br from-cyan-500 to-emerald-500 p-8 flex flex-col justify-center items-center text-white">
                            <div className="text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                        <img className="w-32 h-32 border-2 border-white/30 rounded-full" src="/edi/equicenter.png" alt="EquiCenter Logo" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold mb-3">Edit User Profile</h2>

                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 mb-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-start text-lg">{user?.firstName} {user?.surname}</p>
                                            <p className="text-cyan-100 text-sm">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-cyan-100" />
                                            <span className="text-cyan-100">Current Role: </span>
                                            <span className="font-semibold capitalize">{user?.role || "Not set"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-cyan-100" />
                                            <span className="text-cyan-100">Current Center: </span>
                                            <span className="font-semibold">{user?.center?.name || "Not assigned"}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-cyan-100 text-sm mb-6">
                                    Update the research center and role for this user. Changes will take effect immediately.
                                </p>
                            </div>
                        </div>

                        {/* Painel direito */}
                        <div className="w-full md:w-3/5 p-8">
                            <ModalHeader className="flex flex-col gap-1 text-center p-0 mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                    Update User Settings
                                </h2>
                                <p className="text-sm text-gray-500">Modify center assignment and permissions</p>
                            </ModalHeader>

                            <ModalBody className="p-0">
                                <div className="space-y-6">
                                    {/* Centro de Pesquisa */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Research Center</label>
                                        <Select
                                            placeholder="Select research center"
                                            selectedKeys={formData.centerId ? [formData.centerId] : []}
                                            startContent={<Building size={20} className="text-gray-400" />}
                                            onSelectionChange={keys => handleInputChange("centerId", Array.from(keys)[0] || "")}
                                            isInvalid={!!formErrors.centerId}
                                            errorMessage={formErrors.centerId}
                                            variant="bordered"
                                            classNames={{ trigger: "h-12 bg-white" }}
                                        >
                                            {centers.map(center => (
                                                <SelectItem onPress={()=> setLabel(center.name)} key={center.id.toString()}>{center.name}</SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    {/* Role/Função */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                                        <Select
                                            placeholder="Select user role"
                                            selectedKeys={formData.role ? [formData.role] : []}
                                            startContent={<Sparkles size={20} className="text-gray-400" />}
                                            onSelectionChange={keys => handleInputChange("role", Array.from(keys)[0] || "")}
                                            isInvalid={!!formErrors.role}
                                            errorMessage={formErrors.role}
                                            variant="bordered"
                                            classNames={{ trigger: "h-12 bg-white" }}
                                        >
                                            {roles.map(role => (
                                                <SelectItem key={role.key}>{role.label}</SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    {/* Informações do usuário */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">Full Name</p>
                                                <p className="font-medium">{user?.firstName} {user?.surname}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Email</p>
                                                <p className="font-medium">{user?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Country</p>
                                                <p className="font-medium">{user?.country || "Not set"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botões */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button color="default" variant="flat" onPress={() => onOpenChange(false)} className="min-w-24 border border-gray-300">
                                            Cancel
                                        </Button>
                                        <Button isLoading={isLoading} color="primary" onPress={handleSubmit}
                                            className="min-w-24 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md">
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                        </div>
                    </div>
                </motion.div>
            </ModalContent>
        </Modal>
    )
}

export default EditUserModal
