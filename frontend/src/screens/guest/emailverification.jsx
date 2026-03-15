import React, { useContext, useState } from "react"

import { useLocation, useNavigate } from "react-router-dom"

import { Button, InputOtp, Form } from "@heroui/react"

import { IoMdClose } from "react-icons/io"

import { ShieldCheck } from "lucide-react"

import { motion } from "framer-motion"

import verifyCode from "../../functions/guest/forgotpassword/verifyCode"




const EmailVerification = () => {

    const location = useLocation()

    const [otp, setOtp] = useState("")

    const [isLoading, setIsLoading] = useState(false)

    const [isVerified, setIsVerified] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {

        setIsLoading(true)

        try {

            e.preventDefault()

            await verifyCode(location?.state?.email, otp, navigate, setIsVerified)


        } catch (error) {

        } finally {
            setIsLoading(false)
        }

    }

    const handleResendCode = () => {

        console.log("Reenviar código")

    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-2xl shadow overflow-hidden">
                {/* Coluna Esquerda: Imagem */}
                <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 p-8">

                    <img src="/edi/checkemail.png" alt="Email verification illustration" className="max-w-xs w-full h-auto" />

                </div>

                {/* Coluna Direita: Formulário */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-4">
                    {/* Header */}
                    <div className="text-left mb-8">

                        <div className="flex justify-end">

                            <button onClick={() => navigate(-1)} className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-6 text-3xl font-medium cursor-pointer">

                                <IoMdClose className="text-3xl h-6 w-6 cursor-pointer" />

                            </button>

                        </div>

                        <div className="flex justify-center mb-3">

                            <div className="p-3 bg-gradient-to-r from-cyan-100 to-emerald-100 rounded-full">

                                <ShieldCheck className="h-10 w-10 text-cyan-600" />

                            </div>

                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">

                            {isVerified ? "Email Verified!" : "Verify Your Email"}

                        </h2>

                        <p className="text-gray-500 text-sm text-center">

                            {isVerified ? "Your email has been successfully verified." : "Enter the 6-digit code sent to your email address."}

                        </p>

                    </div>

                    {!isVerified ? (
                        <Form className="flex w-full flex-col items-center gap-1" onSubmit={handleSubmit}>

                            <div className="flex justify-center">

                                <InputOtp className="h-20 mx-auto" size="lg" isRequired aria-label="OTP input field" length={6} value={otp} onValueChange={setOtp} classNames={{ input: "text-lg font-semibold", inputWrapper: "h-20 w-20 mx-1 bg-gray-50 border-gray-200" }} />

                            </div>

                            <Button type="submit" isLoading={isLoading} className="w-10/12 h-14 font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:from-cyan-600 hover:to-emerald-600 py-3">
                                Verify Email
                            </Button>

                            <div className="text-center">

                                <p className="text-sm text-gray-600 mt-2">
                                    Didn't receive the code?
                                </p>

                                <button type="button" onClick={handleResendCode} className="text-sm text-cyan-600 hover:underline cursor-pointer font-medium">
                                    Resend code
                                </button>
                            </div>
                        </Form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-green-800 text-sm">
                                    Your email has been successfully verified. You can now access your account.
                                </p>
                            </div>

                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            {isVerified ? "Your account is now secure and verified." : "Check your inbox and spam folder for the verification code."}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default EmailVerification