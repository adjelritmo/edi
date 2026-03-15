import { useContext, useState } from "react"

import { useNavigate } from "react-router-dom"

import { Mail } from "lucide-react"

import { Input, Button } from "@heroui/react"

import { motion } from "framer-motion"

import { IoMdClose } from "react-icons/io"

import sendEmail from "../../functions/guest/forgotpassword/sendEmail"
import { AppContext } from "../../contexts/app_context"




const ForgotPassword = () => {

    const [email, setEmail] = useState("")

    const { loginGuest, onLoadGuest } = useContext(AppContext)

    const [isLoading, setIsLoading] = useState(false)

    const [error, setError] = useState("")

    const [touched, setTouched] = useState(false)

    const navigate = useNavigate()

    const validateEmail = (email) => {

        if (!email.trim()) return "Email is required"

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))

            return "Please enter a valid email address"

        return ""

    }

    const handleInputChange = (value) => {

        setEmail(value)

        if (touched) {

            setError(validateEmail(value))

        }
    }

    const handleBlur = () => {

        if (!touched)

            setTouched(true)

        setError(validateEmail(email))

    }

    const handleSubmit = async (e) => {

        setIsLoading(true)

        try {

            e.preventDefault()

            setTouched(true)

            const emailError = validateEmail(email)

            if (emailError) {

                setError(emailError)

                return
            }

            setError("")

            await sendEmail(email, onLoadGuest, navigate)


        } catch (error) {

        } finally {

            setIsLoading(false)

        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-2xl shadow overflow-hidden">
                {/* Coluna Esquerda: Imagem */}
                <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 p-8">
                    <img src="/edi/forget.png" alt="Forgot password illustration" className="max-w-xs w-full h-auto" />
                </div>

                {/* Coluna Direita: Formulário */}
                <div className="w-full md:w-1/2 flex flex-col p-4 justify-center">
                    <div className="flex justify-end">
                        <button onClick={() => navigate('/edi/login', { replace: true })} className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-6 text-3xl font-medium cursor-pointer">
                            <IoMdClose className="text-3xl h-6 w-6 cursor-pointer" />
                        </button>
                    </div>
                    {/* Header */}
                    <div className="text-left mb-8">

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Forgot Password?
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Enter the email address associated with your account.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input label="Email Address" type="email" placeholder="you@example.com" startContent={<Mail size={18} className="text-gray-400" />} value={email} onValueChange={handleInputChange}
                                onBlur={handleBlur}
                                required
                                isInvalid={!!error}
                                errorMessage={error}
                                variant="bordered"
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button type="submit" isLoading={isLoading} className="w-full font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:from-cyan-600 hover:to-emerald-600 py-3" size="lg">
                                Next
                            </Button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            We'll send you a link to reset your password. Check your inbox.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ForgotPassword