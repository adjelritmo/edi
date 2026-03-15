import React, { useState } from "react"

import { Input, Button, Card, CardBody, CardFooter, Chip, Badge, Tabs, Tab, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"

import { Search, Plus, FileText, Download, BookOpen, Grid3X3, List, Share2, Bookmark, Eye, Calendar, User, ArrowUpDown, MoreVertical, Link2, Video, Link } from "lucide-react"

import getContentThumbnail from "../functions/guest/extractPhoto"



const Resources = () => {

    const [activeFilter, setActiveFilter] = useState("all")

    const [searchQuery, setSearchQuery] = useState("")

    const [sortBy, setSortBy] = useState("recent")

    const [viewMode, setViewMode] = useState("grid")


    const [selectedItem, setSelectedItem] = useState(null)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const filters = [
        { name: "All", icon: <Plus size={18} />, type: "all" },
        { name: "PDF", icon: <FileText size={18} />, type: "pdf" },
        { name: "Video", icon: <Video size={18} />, type: "video" },
        { name: "Links", icon: <Link size={18} />, type: "link" },
    ]

    const sortOptions = [
        { key: "recent", label: "Most Recent" },
        { key: "title", label: "Title A-Z" },
    ]

    const resources = [
        {
            id: 1,
            title: "STEP Project Short Videos",
            image: "/edi/step.png",
            link: "https://www.youtube.com/watch?v=hOohrtdPIXE&list=PLB0ir8WmooZmJEVBxsitfipwQC-BK_PkG",
            type: "video",
            description: "Interactive dashboard for tracking and visualizing diversity metrics across departments.",
        },
        {
            id: 2,
            title: "Inclusion Assessment Tool",
            image: "/edi/ue.png",
            link: "https://commission.europa.eu/topics/equality-and-inclusion/equality-and-inclusion-key-actions_en",
            type: "link",
            description: "Comprehensive tool for assessing inclusion levels and identifying areas for improvement.",
        },
        {
            id: 3,
            title: "Equity Monitoring System",
            image: "/edi/erc.png",
            link: "https://erc.europa.eu/manage-your-project/ethics-guidance",
            type: "link",
            description: "Data on ethical practices, training, and institutional compliance, promoting a culture of transparency, accountability, and research integrity",
        },
        {
            id: 4,
            title: "Othering is the problem of our time. Belonging is the solution",
            image: "/edi/other.png",
            link: "https://belonging.berkeley.edu/",
            type: "link",
            description: "",
        }
    ]


    const filteredResources = resources.filter(item => {

        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = activeFilter === "all" || item.type === activeFilter

        return matchesSearch && matchesFilter

    })

    const getTypeColor = (type) => {

        const colors = {
            pdf: "success",
            video: "primary",
            article: "secondary",
            link: "warning",
            resource: "default"
        }

        return colors[type] || "default"

    }

    const formatDate = (dateString) => {

        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'

        })

    }

    const handleItemClick = (item) => {

        setSelectedItem(item)

        onOpen()

    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            {/* Header */}
            <div className="bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent pb-12">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-5xl mx-auto">
                        <h1 className="text-5xl md:text-6xl md:pt-20 md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                            <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                                <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge> Resources
                        </h1>
                        <p className="text-gray-600 text-2xl mt-2 mb-3">
                            Find training materials, events, and official resources to deepen your understanding of EDI, research ethics, and civic engagement.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Search and Controls */}
                <div className="max-w-6xl mx-auto -mt-20 mb-8">
                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto">
                        <Input
                            placeholder="Search Resources"
                            startContent={<Search className="text-gray-500" size={20} />}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            variant="bordered"
                            classNames={{
                                input: "text-base",
                                inputWrapper: "rounded-2xl py-8 shadow-sm border-gray-200 bg-white"
                            }}
                        />
                    </div>
                </div>

                {/* Filters Section */}
                <div className="max-w-6xl mx-auto mb-8">
                    <Tabs
                        selectedKey={activeFilter}
                        onSelectionChange={setActiveFilter}
                        variant="underlined"
                        classNames={{
                           
                            cursor: "w-full bg-cyan-500",
                            tabContent: "group-data-[selected=true]:text-cyan-500"
                        }}
                    >
                        {filters.map(filter => (
                            <Tab
                                key={filter.type}
                                title={
                                    <div className="flex items-center gap-2">
                                        {filter.icon}
                                        <span>{filter.name}</span>
                                    </div>
                                }
                            />
                        ))}
                    </Tabs>
                </div>

                {/* Content Section */}
                <div className="max-w-6xl mx-auto">
                    {/* Results Header */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources
                            {searchQuery && ` for "${searchQuery}"`}
                        </p>

                        <div className="flex items-center gap-2">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="flat" startContent={<ArrowUpDown size={16} />}>
                                        Sort: {sortOptions.find(opt => opt.key === sortBy)?.label}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    selectionMode="single"
                                    selectedKeys={[sortBy]}
                                    onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
                                >
                                    {sortOptions.map(option => (
                                        <DropdownItem key={option.key}>
                                            {option.label}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>

                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            >
                                {viewMode === "grid" ? <List size={18} /> : <Grid3X3 size={18} />}
                            </Button>
                        </div>
                    </div>

                    {/* Resource Grid */}
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                            {filteredResources.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group shadow hover:shadow-lg transition-all duration-300 border border-gray-200/60 hover:border-cyan-200/80 bg-white"
                                    isPressable
                                    onPress={() => handleItemClick(item)}
                                >
                                    <CardBody className="p-0 overflow-hidden relative">
                                        <div className="relative">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                            />

                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <Calendar size={12} />
                                                <span>{formatDate(item.date)}</span>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {item.description}
                                            </p>

                                            <Chip color={getTypeColor(item.type)} size="sm" classNames={{ content: "font-semibold" }}>
                                                {item.type.toUpperCase()}
                                            </Chip>
                                        </div>

                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-2">
                            {filteredResources.map((item) => (
                                <Card key={item.id} className="w-full h-46 shadow transition-all duration-300 cursor-pointer" isPressable onPress={() => handleItemClick(item)}>
                                    <CardBody className="p-0">
                                        <div className="flex gap-2">
                                            <img src={item.image} alt={item.title} className="w-46 h-46 rounded-lg flex-shrink-0" />
                                            <div className="flex-1 p-6 min-w-0">
                                                <h1>{item.title}</h1>
                                                <p className="text-gray-600 mb-3">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} />
                                                            {formatDate(item.date)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Chip color={getTypeColor(item.type)} size="sm" classNames={{ content: "font-semibold" }}>
                                                    {item.type.toUpperCase()}
                                                </Chip>
                                            </div>

                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {filteredResources.length === 0 && (
                        <Card className="shadow text-center py-16">
                            <CardBody className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources found</h3>
                                <p className="text-gray-600 mb-6">
                                    We couldn't find any resources matching your search. Try adjusting your filters or search terms.
                                </p>
                                <Button
                                    variant="flat"
                                    onPress={() => {
                                        setSearchQuery("")
                                        setActiveFilter("all")
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <Modal classNames={{ closeButton: 'cursor-pointer' }} isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-2">
                                {selectedItem && (
                                    <>
                                        <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                                    </>
                                )}
                            </ModalHeader>
                            <ModalBody>
                                {selectedItem && (
                                    <div className="space-y-4">
                                        <img
                                            src={getContentThumbnail(selectedItem.image)}
                                            alt={selectedItem.title}
                                            className="h-48 w-full rounded-lg"
                                        />
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Chip
                                                    color={getTypeColor(selectedItem.type)}
                                                    variant="solid"
                                                    className="mb-2"
                                                >
                                                    {selectedItem.type.toUpperCase()}
                                                </Chip>
                                                <div className="flex gap-2 text-sm">
                                                    <Calendar size={16} className="text-gray-500" />
                                                    <span>{formatDate(selectedItem.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{selectedItem.description}</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" color="danger" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                                    startContent={<Link2 size={16} />}
                                    onPress={() => window.open(selectedItem?.link, '_blank')}
                                >
                                    View Link
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default Resources