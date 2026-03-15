import React, { useState } from "react";
import {
    Input,
    Button,
    Card,
    CardBody,
    CardFooter,
    Chip,
    Divider,
    Badge,
    Tabs,
    Tab,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";
import {
    Search,
    Plus,
    FileText,
    Video,
    Link,
    BookOpen,
    Download,
    Filter,
    Grid3X3,
    List,
    Share2,
    Bookmark,
    Eye,
    Calendar,
    User,
    ArrowUpDown,
    MoreVertical
} from "lucide-react";
import { BsArrowUpRight } from "react-icons/bs";

const News = () => {

    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedItem, setSelectedItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const filters = [
        { name: "All", icon: <Plus size={18} />, type: "all" },
        { name: "PDF", icon: <FileText size={18} />, type: "pdf" },
        { name: "Video", icon: <Video size={18} />, type: "video" },
        { name: "Article", icon: <BookOpen size={18} />, type: "article" },
        { name: "Links", icon: <Link size={18} />, type: "link" },
    ];

    const sortOptions = [
        { key: "recent", label: "Most Recent" },
        { key: "title", label: "Title A-Z" },
    ];

    const contents = [
        {
            id: 1,
            title: "CeDRI EDI+ Commission",
            image: "/cedri.png",
            link: "https://cedri.ipb.pt/communication/news/cedri-framework-for-equality,-equity,-diversity,-inclusion,-ethical-responsibility,-and-civic-engagement",
            author: "Dr. Maria Silva",
            type: "pdf",
            category: "Research",
            description: "Complete guide to advanced research methodologies and statistical analysis techniques for academic research.",
            date: "2024-01-15",
            readTime: "5 min"
        },
        {
            id: 2,
            title: "She Figures",
            image: "/shefigures.png",
            link: "https://projects.research-and-innovation.ec.europa.eu/en/knowledgepublications-tools-and-data/interactive-reports/she-figures-2024",
            author: "Prof. João Santos",
            type: "video",
            category: "Statistics",
            description: "Comprehensive framework for implementing EDI+ practices in research institutions and academic environments.",
            date: "2024-01-14",
            readTime: "7 min"
        }
    ]


    const filteredContents = contents.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.link.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = activeFilter === "all" || item.type === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const getTypeIcon = (type) => {
        const icons = {
            pdf: <FileText size={16} />,
            video: <Video size={16} />,
            article: <BookOpen size={16} />,
            link: <Link size={16} />,
            resource: <Download size={16} />
        };
        return icons[type] || <FileText size={16} />;
    };

    const getTypeColor = (type) => {
        const colors = {
            pdf: "success",
            video: "primary",
            article: "secondary",
            link: "warning",
            resource: "default"
        };
        return colors[type] || "default";
    };

    const getTypeVariant = (type) => {
        const variants = {
            pdf: "solid",
            video: "solid",
            article: "solid",
            link: "solid",
            resource: "solid"
        };
        return variants[type] || "flat";
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        onOpen();
    };

    const getActionButton = (item) => {
        const actions = {
            pdf: { label: "Download", icon: <Download size={16} />, color: "success" },
            video: { label: "Watch", icon: <Video size={16} />, color: "primary" },
            article: { label: "Read", icon: <BookOpen size={16} />, color: "secondary" },
            link: { label: "Visit", icon: <Link size={16} />, color: "warning" },
            resource: { label: "Get", icon: <Download size={16} />, color: "default" }
        };
        return actions[item.type] || actions.pdf;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">

            <div className="bg-white">
                <div className="w-full mx-auto px-4 py-12">
                    <div className="text-center max-w-5xl mx-auto">
                        <h1 className="text-4xl mt-20 md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                            EDI+ News
                        </h1>
                        <p className="text-gray-600 text-2xl mt-4">
                            Share here some news about Equity, Diversity, Inclusion, Ethics, and Civic Engagement in research.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-8">
                {/* Search and Controls */}
                <div className="max-w-7xl mx-auto -mt-16 mb-8">

                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto">
                        <Input isClearable
                            placeholder="Search by title..."
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
                <div className="max-w-7xl mx-auto mb-8">
                    <Tabs
                        selectedKey={activeFilter}
                        onSelectionChange={setActiveFilter}
                        variant="underlined"
                        classNames={{
                            tabList: "gap-2 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-cyan-500",
                            tab: "max-w-fit px-0 h-12",
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
                                        <Badge
                                            variant="flat"
                                            color={filter.type === activeFilter ? "primary" : "default"}
                                            size="sm"
                                        >
                                            {filter.count}
                                        </Badge>
                                    </div>
                                }
                            />
                        ))}
                    </Tabs>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto">
                    {/* Results Header */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredContents.length}</span> News
                            {searchQuery && ` for "${searchQuery}"`}
                        </p>

                        <div className="flex items-center gap-3">
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

                    {/* Content Grid/List */}
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {filteredContents.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-cyan-200/80 bg-white"
                                    isPressable
                                    onPress={() => handleItemClick(item)}
                                >
                                    <CardBody className="p-0 overflow-hidden relative">
                                        <div className="relative">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-center gap-2 text-xs text-gray-500 mb-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                    <User size={12} />
                                                    <span>{item.author}</span>
                                                    <span>•</span>
                                                    <Calendar size={12} />
                                                    <span>{formatDate(item.date)}</span>
                                                </div>

                                                <Chip
                                                    color={getTypeColor(item.type)}
                                                    variant={getTypeVariant(item.type)}
                                                    size="sm"
                                                    classNames={{
                                                        content: "font-semibold"
                                                    }}
                                                >
                                                    {item.type.toUpperCase()}
                                                </Chip>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-4">
                            {filteredContents.map((item) => (
                                <Card isPressable onPress={() => handleItemClick(item)} key={item.id} className="hover:shadow-lg w-full transition-all duration-300">
                                    <CardBody className="p-4">
                                        <div className="flex gap-4">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <Chip
                                                            color={getTypeColor(item.type)}
                                                            variant={getTypeVariant(item.type)}
                                                            size="sm"
                                                            className="mb-2"
                                                        >
                                                            {item.type.toUpperCase()}
                                                        </Chip>
                                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 mb-3 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <User size={14} />
                                                            {item.author}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(item.date)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {getTypeIcon(item.type)}
                                                            {item.size || item.duration || item.readTime || item.format || item.items}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {filteredContents.length === 0 && (
                        <Card className="text-center py-16">
                            <CardBody className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No News found</h3>
                                <p className="text-gray-600 mb-6">
                                    We couldn't find any content matching your search. Try adjusting your filters or search terms.
                                </p>
                                <Button
                                    variant="flat"
                                    onPress={() => {
                                        setSearchQuery("");
                                        setActiveFilter("all");
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
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedItem && (
                                    <>
                                        <Chip
                                            color={getTypeColor(selectedItem.type)}
                                            variant={getTypeVariant(selectedItem.type)}
                                            className="mb-2"
                                        >
                                            {selectedItem.type.toUpperCase()}
                                        </Chip>
                                        <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                                    </>
                                )}
                            </ModalHeader>
                            <ModalBody>
                                {selectedItem && (
                                    <div className="space-y-4">
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.title}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-500" />
                                                <span>{selectedItem.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-500" />
                                                <span>{formatDate(selectedItem.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(selectedItem.type)}
                                                <span>
                                                    {selectedItem.size || selectedItem.duration || selectedItem.readTime || selectedItem.format || selectedItem.items}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Eye size={16} className="text-gray-500" />
                                                <span>{selectedItem.downloads || selectedItem.views || selectedItem.reads || selectedItem.visits} views</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{selectedItem.description}</p>

                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    as="a"
                                    href={selectedItem.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 group-hover:-translate-y-1 shadow-md hover:shadow-lg"
                                    endContent={<BsArrowUpRight className="text-sm transition-transform group-hover:translate-x-1" />}
                                >
                                    Read Full
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default News;