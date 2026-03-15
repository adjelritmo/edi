import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react"
import { FileText, AlertTriangle, X, Trash2, ShieldAlert, User } from "lucide-react"
import deleteForm from "../../../../functions/admin/forms/deleteForm"

// crie essa função no backend/requests, similar ao deleteUser

const DeleteForm = ({ form, forms, setForms, isOpen, onOpenChange }) => {

    const [isLoading, setIsLoading] = useState(false)

    const [isError, setIsError] = useState(false)

    const [confirmText, setConfirmText] = useState("")

    const handleDelete = async () => {

        if (confirmText.trim() === "confirm delete") {

            setIsLoading(true)

            const result = await deleteForm(form?.id, forms, setForms)

            if (result === 200)

                onOpenChange(false)

            setIsLoading(false)

        } else

            setIsError(true)
    }

    const modalVariants = {

        initial: { opacity: 0, scale: 0.9 },

        animate: { opacity: 1, scale: 1 },

        exit: { opacity: 0, scale: 0.9 }

    }

    const iconVariants = {

        initial: { scale: 0, rotate: -180 },

        animate: { scale: 1, rotate: 0 },

        exit: { scale: 0, rotate: 180 }
        
    }

    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            size="md"
            hideCloseButton
            motionProps={{
                variants: {
                    enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                    exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
                }
            }}
        >
            <ModalContent className="relative overflow-hidden">
                {(onClose) => (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="delete-form-modal"
                            variants={modalVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {/* Barras decorativas */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full opacity-20"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-100 rounded-full opacity-20"></div>

                            {/* Botão fechar */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 hover:bg-red-50 rounded-full transition-all duration-200 group"
                            >
                                <X className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                            </button>

                            <ModalHeader className="flex flex-col gap-1 text-center p-6 pb-0 relative z-1">
                                <motion.div
                                    variants={iconVariants}
                                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                                    className="flex justify-center mb-4"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                        <div className="relative p-4 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg">
                                            <ShieldAlert className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                                    Delete Form
                                </h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <p className="text-sm text-gray-500 font-medium">This action is permanent</p>
                                </div>
                            </ModalHeader>

                            <ModalBody className="p-6 relative z-1">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-red-800 text-sm">{form?.title}</p>
                                            <p className="text-red-700 text-xs mt-1">{form?.description}</p>
                                            {form?.creator && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="w-4 h-4 text-red-500" />
                                                    <p className="text-red-700 text-xs">
                                                        Created by: {form.creator.firstName} {form.creator.surname}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-amber-800 text-sm mb-2">Important Notice</p>
                                            <ul className="text-amber-700 text-sm space-y-1">
                                                <li className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                                    The form and all its questions will be permanently deleted
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                                    This action cannot be undone
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                    <p className="text-start text-sm text-gray-600">
                                        Type <span className="font-mono bg-gray-200 px-2 py-1 rounded text-red-600 font-bold">confirm delete</span> to proceed
                                    </p>
                                    <Input
                                        onChange={(e) => { setConfirmText(e.target.value); setIsError(false) }}
                                        errorMessage="Please enter 'confirm delete' correctly"
                                        isInvalid={isError}
                                        isClearable
                                        className="mt-2"
                                        classNames={{ label: 'text-center', errorMessage: 'text-start' }}
                                        label="Type here to confirm..."
                                        type="text"
                                    />
                                </div>
                            </ModalBody>

                            <ModalFooter className="flex justify-end gap-3 p-6 pt-0 relative z-1">
                                <Button
                                    color="default"
                                    variant="flat"
                                    onPress={onClose}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                                    startContent={<X className="w-4 h-4" />}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    isLoading={isLoading}
                                    onPress={handleDelete}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                                    startContent={!isLoading && <Trash2 className="w-4 h-4" />}
                                >
                                    {isLoading ? "Deleting..." : "Delete Form"}
                                </Button>
                            </ModalFooter>
                        </motion.div>
                    </AnimatePresence>
                )}
            </ModalContent>
        </Modal>
    )
}

export default DeleteForm
