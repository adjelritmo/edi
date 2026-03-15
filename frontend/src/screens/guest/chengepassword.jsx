import React, { useContext, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Input } from "@heroui/react"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { IoMdClose } from "react-icons/io"
import updatePassword from "../../functions/guest/forgotpassword/updatePassword"
import { AppContext } from "../../contexts/app_context"

const PasswordChange = () => {

    const navigate = useNavigate()

    const location = useLocation()

    const [isLoading, setIsLoading] = useState(false)

    const [isSuccess, setIsSuccess] = useState(false)

    const [showNewPassword, setShowNewPassword] = useState(false)

    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [errors, setErrors] = useState({})

    const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false })

    const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" })

    const { user, onLoadUser } = useContext(AppContext)

    const validateField = (field, value) => {
        switch (field) {
            case "newPassword":
                if (!value.trim()) return "New password is required"
                if (value.length < 8) return "Password must be at least 8 characters"
                return ""

            case "confirmPassword":
                if (!value.trim()) return "Please confirm your password"
                if (value !== formData.newPassword) return "Passwords do not match"
                return ""

            default:
                return ""
        }
    }

    const validateForm = () => {

        const newErrors = {

            newPassword: validateField("newPassword", formData.newPassword),

            confirmPassword: validateField("confirmPassword", formData.confirmPassword)

        }

        setErrors(newErrors)

        return !newErrors.newPassword && !newErrors.confirmPassword
    }

    const handleInputChange = (field, value) => {

        setFormData(prev => ({ ...prev, [field]: value }))

        if (touched[field]) {

            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))

        }

    }

    const handleBlur = (field) => {

        setTouched(prev => ({ ...prev, [field]: true }))

        setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }))

    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        setTouched({ newPassword: true, confirmPassword: true })

        const newErrors = { newPassword: validateField("newPassword", formData.newPassword), confirmPassword: validateField("confirmPassword", formData.confirmPassword) }

        setErrors(newErrors)

        if (newErrors.newPassword || newErrors.confirmPassword) {
            return
        }

        setIsLoading(true)

        await updatePassword(location?.state?.email, formData.newPassword, navigate, setIsSuccess)

        setIsLoading(false)

    }

    if (isSuccess) {

        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Password Changed!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Your password has been successfully updated. You'll be redirected to the dashboard shortly.
                    </p>

                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                        <p className="text-green-800 text-sm">
                            Your account security has been updated successfully.
                        </p>
                    </div>

                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-2xl shadow overflow-hidden"
            >
                {/* Coluna Esquerda: Imagem */}
                <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 p-8">
                    <img
                        src="/edi/chenge.png"
                        alt="Password change illustration"
                        className="max-w-xs w-full h-auto"
                    />
                </div>

                {/* Coluna Direita: Formulário */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-4">
                    {/* Header */}
                    <div className="text-left">
                        <div className="flex justify-end">
                            <button onClick={() => navigate(-1)} className="inline-flex items-center text-cyan-600 hover:text-cyan-700 text-3xl font-medium cursor-pointer">
                                <IoMdClose className="text-3xl h-6 w-6 cursor-pointer" />
                            </button>
                        </div>

                        <div className="flex justify-center mb-2">
                            <div className="p-3 bg-gradient-to-r from-cyan-100 to-emerald-100 rounded-full">
                                <Lock className="h-10 w-10 text-cyan-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 text-center">
                            Change Password
                        </h2>
                        <p className="text-gray-500 text-sm text-center mb-3">
                            Update your password to keep your account secure
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <Input
                            label="New Password"
                            placeholder="Enter your new password"
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onValueChange={(value) => handleInputChange("newPassword", value)}
                            onBlur={() => handleBlur("newPassword")}
                            startContent={<Lock size={18} className="text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="focus:outline-none cursor-pointer text-gray-400 hover:text-cyan-600"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            required
                            isInvalid={!!errors.newPassword && touched.newPassword}
                            errorMessage={errors.newPassword}
                            variant="bordered"
                        />

                        <Input
                            label="Confirm New Password"
                            placeholder="Confirm your new password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onValueChange={(value) => handleInputChange("confirmPassword", value)}
                            onBlur={() => handleBlur("confirmPassword")}
                            startContent={<Lock size={18} className="text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="focus:outline-none cursor-pointer text-gray-400 hover:text-cyan-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            required
                            isInvalid={!!errors.confirmPassword && touched.confirmPassword}
                            errorMessage={errors.confirmPassword}
                            variant="bordered"
                        />

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:from-cyan-600 hover:to-emerald-600 py-3"
                            size="lg"
                        >
                            Update Password
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Make sure your new password is strong and unique. We recommend using at least 8 characters with a mix of letters, numbers, and symbols.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default PasswordChange