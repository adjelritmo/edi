import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerBody, 
    DrawerFooter, 
    Button, 
    Card, 
    CardBody,
    Chip,
    Divider
} from "@heroui/react"
import { Building, MapPin, Mail, Phone, User, Target, Globe } from "lucide-react"

const ViewCenter = ({ isOpen, onOpenChange, center }) => {
    return (
        <Drawer classNames={{closeButton: 'cursor-pointer'}} isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="md">
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <Building className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{center?.name || "Center Details"}</h2>
                                    <p className="text-sm text-gray-500">{center?.code || "Center Code"}</p>
                                </div>
                            </div>
                        </DrawerHeader>

                        <Divider />

                        <DrawerBody className="py-2">
                            {/* Research Area */}
                            <div className="mb-2" shadow="none">
                                <div className="p-3">
                                    <div className="flex items-start gap-3">
                                        <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Research Area</p>
                                            <p className="text-sm text-gray-600">{center?.research_area || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-2" shadow="none">
                                <div className="p-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Location</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div>
                                                    <p className="text-xs text-gray-500">City</p>
                                                    <p className="text-sm text-gray-600">{center?.city || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Country</p>
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3 text-gray-400" />
                                                        <p className="text-sm text-gray-600">{center?.country || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="mb-2" shadow="none">
                                <div className="p-3">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Contact</p>
                                            <div className="mt-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-600">{center?.email || "No email"}</p>
                                                </div>
                                                {center?.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-gray-600">{center.phone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coordinator */}
                            <div className="mb-2" shadow="none">
                                <div className="p-3">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Coordinator</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-600">
                                                    {center?.coordinator 
                                                        ? `${center.coordinator.firstName || ''} ${center.coordinator.surname || ''}`.trim()
                                                        : "Not assigned"
                                                    }
                                                </p>
                                                {center?.coordinator && (
                                                    <Chip size="sm" color="warning" variant="flat">Coordinator</Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Members Count */}
                            <div shadow="none">
                                <div className="p-3">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Members</p>
                                            <p className="text-sm text-gray-600">{center?.totalUsers || 0} researchers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DrawerBody>

                        <Divider />

                        <DrawerFooter>
                            <Button color="primary" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default ViewCenter