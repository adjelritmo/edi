import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Avatar, AutocompleteItem, Autocomplete } from "@heroui/react"
import { Plus, Building, Mail, MapPin, Globe, Hash, Book } from "lucide-react"
import { useDisclosure } from "@heroui/react"
import addCenter from "../../../../functions/admin/centers/addCenter"
import getCountries from "../../../../functions/constants/get_countries"

const AddCenter = ({ centers, setCenters }) => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        email: "",
        country: "",
        city: "",
        research_area: ""
    })

    const countries = getCountries()

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.name.trim()) errors.name = "Name is required"
        if (!formData.code.trim()) errors.code = "Code is required"
        if (!formData.email.trim()) errors.email = "Email is required"
        if (!formData.country.trim()) errors.country = "Country is required"
        if (!formData.city.trim()) errors.city = "City is required"
        if (!formData.research_area.trim()) errors.research_area = "Research area is required"
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }
        setIsLoading(true)

        const result = await addCenter(formData, centers, setCenters)

        if (result === 200) {
            onOpenChange(false)
            setFormData({ name: "", code: "", address: "", email: "", country: "", city: "", research_area: "" })
        }


        setIsLoading(false)

    }

    const formVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    }

    return (
        <>
            <Button
                onPress={onOpen}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 shadow"
                startContent={<Plus className="h-4 w-4" />}
            >
                Add New Center
            </Button>

            <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                radius="lg"
                scrollBehavior="outside"
                size="4xl"
                classNames={{
                    base: "bg-white dark:bg-gray-900",
                    closeButton: "hover:bg-cyan-50 text-gray-500 text-2xl cursor-pointer hover:text-cyan-600"
                }}
            >
                <ModalContent>
                    <div className="flex flex-col md:flex-row rounded-lg shadow">
                        <div className="w-full md:w-1/2 p-5">
                            <ModalHeader className="flex flex-col gap-1 text-center p-0 mb-3">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                    Add New Research Center
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter details to create a new research center
                                </p>
                            </ModalHeader>

                            <ModalBody className="p-0 ">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="add-center-form"
                                        variants={formVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="space-y-2"
                                    >
                                        <Input
                                            label="Center Name"
                                            placeholder="Enter center name"
                                            value={formData.name}
                                            onValueChange={(value) => handleInputChange("name", value)}
                                            startContent={<Building size={18} className="text-gray-400" />}
                                            required
                                            isInvalid={!!formErrors.name}
                                            errorMessage={formErrors.name}
                                            variant="bordered"
                                        />

                                        <Input
                                            label="Research Area"
                                            placeholder="Enter research area"
                                            value={formData.research_area}
                                            onValueChange={(value) => handleInputChange("research_area", value)}
                                            startContent={<Book size={18} className="text-gray-400" />}
                                            required
                                            isInvalid={!!formErrors.research_area}
                                            errorMessage={formErrors.research_area}
                                            variant="bordered"
                                        />

                                        <Input
                                            label="Code"
                                            placeholder="Enter center code"
                                            value={formData.code}
                                            onValueChange={(value) => handleInputChange("code", value)}
                                            startContent={<Hash size={18} className="text-gray-400" />}
                                            required
                                            isInvalid={!!formErrors.code}
                                            errorMessage={formErrors.code}
                                            variant="bordered"
                                        />

                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="Enter center email"
                                            value={formData.email}
                                            onValueChange={(value) => handleInputChange("email", value)}
                                            startContent={<Mail size={18} className="text-gray-400" />}
                                            required
                                            isInvalid={!!formErrors.email}
                                            errorMessage={formErrors.email}
                                            variant="bordered"
                                        />

                                        <div className="flex flex-col gap-2">
                                            
                                            <Autocomplete
                                                allowsCustomValue
                                                defaultItems={countries}
                                                label="Country"
                                                placeholder="Select country"
                                                startContent={<MapPin size={18} className="text-gray-400" />}
                                                onSelectionChange={(key) => handleInputChange("country", key)}
                                                onInputChange={(key) => handleInputChange("country", key)}
                                                isClearable
                                                isInvalid={!!formErrors.country}
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

                                            <Input
                                                label="City"
                                                placeholder="Enter city"
                                                value={formData.city}
                                                onValueChange={(value) => handleInputChange("city", value)}
                                                startContent={<MapPin size={18} className="text-gray-400" />}
                                                required
                                                isInvalid={!!formErrors.city}
                                                errorMessage={formErrors.city}
                                                variant="bordered"
                                            />
                                        </div>
                                        <Button
                                            isLoading={isLoading}
                                            className="w-full font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md hover:from-cyan-600 hover:to-emerald-600"
                                            onPress={handleSubmit}
                                            size="lg"
                                        >
                                            Create Center
                                        </Button>
                                    </motion.div>
                                </AnimatePresence>
                            </ModalBody>
                        </div>

                        <div className="w-full rounded-r-lg md:w-1/2 bg-gradient-to-br from-cyan-500 to-emerald-500 p-8 flex flex-col justify-center items-center text-white">
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-gradient-to-r from-cyan-100 to-emerald-100 rounded-full">
                                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                            <img className="w-40 h-40 rounded-full" src="/edi/equicenter.png" alt="Center Logo" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">
                                    New Research Center
                                </h2>
                                <p className="mb-8 text-center text-cyan-100">
                                    Add a new research center to expand our community
                                </p>
                            </div>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </>
    )
}

export default AddCenter