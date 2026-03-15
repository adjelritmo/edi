import { useState, useMemo, useCallback } from "react"

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Textarea, Progress, Badge } from "@heroui/react"

import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Link as LinkIcon, FileText, Video, Image, File, BarChart3, MoreVertical, Share2, Settings, ChevronDown, CheckCircle, AlertCircle, Users as UsersIcon, Calendar, Clock, UserCheck, UserX } from "lucide-react"

const ContentManagement = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const [selectedContent, setSelectedContent] = useState(null)

    const [filterValue, setFilterValue] = useState("")

    const [typeFilter, setTypeFilter] = useState(new Set(["all"]))

    const [statusFilter, setStatusFilter] = useState(new Set(["all"]))

    const [selectedKeys, setSelectedKeys] = useState(new Set([]))

    const [sortDescriptor, setSortDescriptor] = useState({ column: "title", direction: "ascending" })

    const [page, setPage] = useState(1)

    const [rowsPerPage, setRowsPerPage] = useState(10)

    const contents = [
        {
            id: 1,
            title: "User Manual",
            description: "Complete system usage guide",
            type: "pdf",
            url: "https://example.com/manual.pdf",
            status: "published",
            views: 1245,
            downloads: 892,
            created: "2024-01-15",
            updated: "2024-03-20",
            author: "Maria Silva",
            category: "Documentation",
            size: "2.4 MB"
        },
        {
            id: 2,
            title: "Video Tutorial",
            description: "Video tutorial on how to use main features",
            type: "video",
            url: "https://youtube.com/watch?v=abc123",
            status: "published",
            views: 3567,
            downloads: 0,
            created: "2024-02-10",
            updated: "2024-03-18",
            author: "João Santos",
            category: "Tutorial",
            duration: "15:30"
        },
        {
            id: 3,
            title: "Company Presentation",
            description: "PDF with company presentation",
            type: "pdf",
            url: "https://example.com/presentation.pdf",
            status: "published",
            views: 876,
            downloads: 567,
            created: "2024-01-30",
            updated: "2024-03-15",
            author: "Ana Costa",
            category: "Corporate",
            size: "5.1 MB"
        },
        {
            id: 4,
            title: "Recorded Webinar",
            description: "Recording of the latest webinar",
            type: "video",
            url: "https://vimeo.com/123456",
            status: "published",
            views: 2345,
            downloads: 123,
            created: "2024-02-28",
            updated: "2024-03-22",
            author: "Carlos Oliveira",
            category: "Education",
            duration: "45:15"
        },
        {
            id: 5,
            title: "Scientific Paper",
            description: "PDF of the paper published at the conference",
            type: "pdf",
            url: "https://example.com/paper.pdf",
            status: "draft",
            views: 0,
            downloads: 0,
            created: "2024-03-10",
            updated: "2024-03-10",
            author: "Pedro Almeida",
            category: "Research",
            size: "3.2 MB"
        },
        {
            id: 6,
            title: "Tutorial Playlist",
            description: "List of tutorial videos for beginners",
            type: "link",
            url: "https://youtube.com/playlist?list=abc123",
            status: "published",
            views: 1876,
            downloads: 0,
            created: "2024-02-15",
            updated: "2024-03-19",
            author: "Mariana Lima",
            category: "Education",
            items: 12
        },
        {
            id: 7,
            title: "Annual Report",
            description: "PDF with annual activity report",
            type: "pdf",
            url: "https://example.com/report.pdf",
            status: "archived",
            views: 345,
            downloads: 234,
            created: "2024-01-20",
            updated: "2024-03-05",
            author: "Ricardo Souza",
            category: "Reports",
            size: "8.7 MB"
        },
        {
            id: 8,
            title: "Technical Documentation",
            description: "Link to API technical documentation",
            type: "link",
            url: "https://api.docs.example.com",
            status: "published",
            views: 4567,
            downloads: 0,
            created: "2024-02-05",
            updated: "2024-03-25",
            author: "Fernanda Torres",
            category: "Documentation",
            items: 1567
        }
    ]

    const typeOptions = [
        { name: "All", uid: "all", icon: File, color: "text-gray-600", bgColor: "bg-gray-100" },
        { name: "PDF", uid: "pdf", icon: FileText, color: "text-red-600", bgColor: "bg-red-100" },
        { name: "Video", uid: "video", icon: Video, color: "text-blue-600", bgColor: "bg-blue-100" },
        { name: "Link", uid: "link", icon: LinkIcon, color: "text-green-600", bgColor: "bg-green-100" },
        { name: "Image", uid: "image", icon: Image, color: "text-purple-600", bgColor: "bg-purple-100" }
    ]

    const statusOptions = [
        { name: "All", uid: "all" },
        { name: "Published", uid: "published" },
        { name: "Draft", uid: "draft" },
        { name: "Archived", uid: "archived" }
    ]

    const categoryOptions = [
        "Documentation",
        "Tutorial",
        "Corporate",
        "Education",
        "Research",
        "Reports",
        "News",
        "Events"
    ]

    const statusColorMap = {
        published: "success",
        draft: "warning",
        archived: "danger"
    }

    const typeColorMap = {
        pdf: "danger",
        video: "primary",
        link: "success",
        image: "secondary",
        file: "default"
    }

    const columns = [
        { name: "CONTENT", uid: "title", sortable: true },
        { name: "TYPE", uid: "type", sortable: true },
        { name: "CATEGORY", uid: "category", sortable: true },
        { name: "STATUS", uid: "status", sortable: true },
        { name: "METRICS", uid: "metrics", sortable: true },
        { name: "CREATED", uid: "created", sortable: true },
        { name: "AUTHOR", uid: "author", sortable: true },
        { name: "ACTIONS", uid: "actions" }
    ]

    const hasSearchFilter = Boolean(filterValue)

    const filteredItems = useMemo(() => {
        
        let filteredContents = [...contents]

        if (hasSearchFilter) {

            filteredContents = filteredContents.filter((content) => content.title.toLowerCase().includes(filterValue.toLowerCase()) || content.description.toLowerCase().includes(filterValue.toLowerCase()) || content.category.toLowerCase().includes(filterValue.toLowerCase()) || content.author.toLowerCase().includes(filterValue.toLowerCase()))

        }

        const selectedType = Array.from(typeFilter)[0]

        if (selectedType !== "all") {

            filteredContents = filteredContents.filter((content) => content.type === selectedType)
       
        }

        const selectedStatus = Array.from(statusFilter)[0]
        
        if (selectedStatus !== "all") {
        
            filteredContents = filteredContents.filter((content) => content.status === selectedStatus)
        
        }

        return filteredContents

    }, [contents, filterValue, typeFilter, statusFilter])

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

    const items = useMemo(() => {

        const start = (page - 1) * rowsPerPage
        
        const end = start + rowsPerPage
        
        return filteredItems.slice(start, end)
    
    }, [page, filteredItems, rowsPerPage])

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const column = sortDescriptor.column
            let first, second

            switch (column) {
                case "metrics":
                    first = a.views || 0
                    second = b.views || 0
                    break
                case "created":
                    first = new Date(a.created)
                    second = new Date(b.created)
                    break
                default:
                    first = a[column]
                    second = b[column]
            }

            if (typeof first === 'string' && typeof second === 'string') {
                first = first.toLowerCase()
                second = second.toLowerCase()
            }

            const cmp = first < second ? -1 : first > second ? 1 : 0
            return sortDescriptor.direction === "descending" ? -cmp : cmp
        })
    }, [sortDescriptor, items])

    const renderCell = useCallback((content, columnKey) => {
        switch (columnKey) {
            case "title":
                const typeConfig = typeOptions.find(t => t.uid === content.type) || typeOptions[0]
                const TypeIcon = typeConfig.icon
                return (
                    <div className="flex items-center gap-2">
                        <div className={`p-2 ${typeConfig.bgColor} rounded-lg`}>
                            <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{content.title}</span>
                            <span className="text-xs text-gray-500 max-w-60 line-clamp-2">
                                {content.description}
                            </span>
                        </div>
                    </div>
                )

            case "type":
                const typeOption = typeOptions.find(t => t.uid === content.type)
                const IconComponent = typeOption?.icon || File
                return (
                    <Chip
                        variant="flat"
                        color={typeColorMap[content.type] || "default"}
                        size="sm"
                        startContent={<IconComponent className="h-4 w-4" />}
                    >
                        {typeOption?.name}
                    </Chip>
                )

            case "category":
                return (
                    <Chip variant="flat" size="sm" className="capitalize">
                        {content.category}
                    </Chip>
                )

            case "status":
                return (
                    <Chip
                        variant="flat"
                        color={statusColorMap[content.status]}
                        size="sm"
                        className="capitalize"
                    >
                        {content.status}
                    </Chip>
                )

            case "metrics":
                const totalEngagement = content.views + content.downloads
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{content.views.toLocaleString()} views</span>
                            <span className="text-xs text-gray-500">
                                {content.downloads > 0 ? `${content.downloads} downloads` : "No downloads"}
                            </span>
                        </div>
                        <Progress
                            value={Math.min((totalEngagement / 5000) * 100, 100)}
                            color="primary"
                            size="sm"
                            className="max-w-32"
                        />
                    </div>
                )

            case "created":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{content.created}</span>
                        <span className="text-xs text-gray-500">Created</span>
                    </div>
                )

            case "author":
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{content.author}</span>
                        <span className="text-xs text-gray-500">Author</span>
                    </div>
                )

            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <ChevronDown className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                onAction={(key) => {
                                    switch (key) {
                                        case "view":
                                            window.open(content.url, '_blank')
                                            break
                                        case "edit":
                                            setSelectedContent(content)
                                            onOpen()
                                            break
                                        case "download":
                                            console.log("Download:", content)
                                            break
                                        case "share":
                                            console.log("Share:", content)
                                            break
                                        case "delete":
                                            console.log("Delete:", content)
                                            break
                                    }
                                }}
                            >
                                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                                    View
                                </DropdownItem>
                                <DropdownItem key="download" startContent={<Download className="h-4 w-4" />}>
                                    Download
                                </DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit className="h-4 w-4" />}>
                                    Edit
                                </DropdownItem>
                                <DropdownItem key="share" startContent={<Share2 className="h-4 w-4" />}>
                                    Share
                                </DropdownItem>
                                <DropdownItem key="analytics" startContent={<BarChart3 className="h-4 w-4" />}>
                                    Statistics
                                </DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 className="h-4 w-4" />}>
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )

            default:
                return content[columnKey] || '-'
        }
    }, [onOpen])

    const stats = useMemo(() => ({
        totalContent: contents.length,
        pdfCount: contents.filter(c => c.type === 'pdf').length,
        videoCount: contents.filter(c => c.type === 'video').length,
        linkCount: contents.filter(c => c.type === 'link').length,
        totalViews: contents.reduce((total, content) => total + content.views, 0),
        totalDownloads: contents.reduce((total, content) => total + content.downloads, 0),
        publishedCount: contents.filter(c => c.status === 'published').length,
        averageEngagement: Math.round(contents.reduce((total, content) => total + content.views, 0) / contents.length)
    }), [contents])

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                        <p className="text-gray-600">Manage PDFs, videos, links and other content</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                        size="lg"
                        startContent={<Plus className="text-small" />}
                        onPress={() => {
                            setSelectedContent(null)
                            onOpen()
                        }}
                    >
                        New Content
                    </Button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col gap-2 mt-10">
                    <div className="flex justify-between gap-2 items-end">
                        <Input
                            isClearable
                            size="lg"
                            variant="bordered"
                            className="w-full sm:max-w-[50%] bg-white rounded-2xl"
                            placeholder="Search content..."
                            startContent={<Search className="text-default-300" />}
                            value={filterValue}
                            onClear={() => setFilterValue("")}
                            onValueChange={(value) => {
                                setFilterValue(value)
                                setPage(1)
                            }}
                        />
                        <div className="flex gap-2">
                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button size="lg" className="bg-white shadow" endContent={<ChevronDown className="text-small" />} variant="flat">
                                        Type
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Type Filter"
                                    closeOnSelect={false}
                                    selectedKeys={typeFilter}
                                    selectionMode="single"
                                    onSelectionChange={setTypeFilter}
                                >
                                    {typeOptions.map((type) => (
                                        <DropdownItem key={type.uid} className="capitalize">
                                            {type.name}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>

                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button size="lg" className="bg-white shadow" endContent={<ChevronDown className="text-small" />} variant="flat">
                                        Status
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Status Filter"
                                    closeOnSelect={false}
                                    selectedKeys={statusFilter}
                                    selectionMode="single"
                                    onSelectionChange={setStatusFilter}
                                >
                                    {statusOptions.map((status) => (
                                        <DropdownItem key={status.uid} className="capitalize">
                                            {status.name}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>

                            <Button
                                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                                size="lg"
                                endContent={<Download className="text-small" />}
                                onPress={() => alert("Exporting data...")}
                            >
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {[
                        {
                            title: "Total Content",
                            value: stats.totalContent,
                            icon: File,
                            color: "text-cyan-600",
                            bgColor: "bg-cyan-100"
                        },
                        {
                            title: "PDFs",
                            value: stats.pdfCount,
                            icon: FileText,
                            color: "text-red-600",
                            bgColor: "bg-red-100"
                        },
                        {
                            title: "Videos",
                            value: stats.videoCount,
                            icon: Video,
                            color: "text-blue-600",
                            bgColor: "bg-blue-100"
                        },
                        {
                            title: "Total Views",
                            value: stats.totalViews.toLocaleString(),
                            icon: Eye,
                            color: "text-green-600",
                            bgColor: "bg-green-100"
                        },
                        {
                            title: "Published",
                            value: stats.publishedCount,
                            icon: CheckCircle,
                            color: "text-emerald-600",
                            bgColor: "bg-emerald-100"
                        }
                    ].map((stat, index) => (
                        <Card key={index} className="border-none shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                    </div>
                                    <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }, [filterValue, typeFilter, statusFilter, stats, typeOptions, statusOptions, onOpen])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${filteredItems.length} selected`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(prev => Math.min(prev + 1, pages))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        )
    }, [selectedKeys, filteredItems.length, page, pages])

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Edit/Create Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {selectedContent ? "Edit Content" : "New Content"}
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Select
                                        label="Content Type"
                                        placeholder="Select type"
                                        defaultSelectedKeys={selectedContent ? [selectedContent.type] : []}
                                    >
                                        {typeOptions.filter(t => t.uid !== 'all').map(type => (
                                            <SelectItem key={type.uid} value={type.uid} startContent={<type.icon className="h-4 w-4" />}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Input
                                        label="Title"
                                        placeholder="Enter content title"
                                        defaultValue={selectedContent?.title}
                                    />

                                    <Textarea
                                        label="Description"
                                        placeholder="Describe the content"
                                        defaultValue={selectedContent?.description}
                                    />

                                    <Input
                                        label="URL/Link"
                                        placeholder="https://..."
                                        defaultValue={selectedContent?.url}
                                    />

                                    <Select
                                        label="Category"
                                        placeholder="Select a category"
                                        defaultSelectedKeys={selectedContent ? [selectedContent.category] : []}
                                    >
                                        {categoryOptions.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        defaultSelectedKeys={selectedContent ? [selectedContent.status] : ["draft"]}
                                    >
                                        {statusOptions.filter(s => s.uid !== 'all').map(status => (
                                            <SelectItem key={status.uid} value={status.uid}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    {selectedContent ? "Save Changes" : "Create Content"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Main Table */}
            <Table
                isHeaderSticky
                aria-label="Content management table"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={
                        <div className="p-8 text-center">
                            <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No content found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                    }
                    items={sortedItems}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default ContentManagement