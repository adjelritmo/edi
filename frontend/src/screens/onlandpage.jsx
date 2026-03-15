import { LiaUsersSolid } from "react-icons/lia"

import { SiGooglemaps } from "react-icons/si"

import { MdAdminPanelSettings } from "react-icons/md"

import { BsCalendar2CheckFill, BsArrowUpRight, BsClock } from "react-icons/bs"

import { useContext, useState } from "react"

import { AppContext } from "../contexts/app_context"

import typeUserEnum from "../functions/constants/type_user_enum"

import { useNavigate } from "react-router-dom"

import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Badge } from "@heroui/react"

import getYouTubeThumbnail from "../functions/guest/extractPhoto"



const Home = () => {

    const { user } = useContext(AppContext)

    const navigate = useNavigate()

    const [activeResourceFilter, setActiveResourceFilter] = useState('all')

    const goToApp = () => {

        const role = user?.role

        if (role === typeUserEnum.ADMIN)

            navigate('/edi/user', { replace: true })

        else if (role === typeUserEnum.COLLABORATOR)

            navigate('/edi/user/coordinator', { replace: true })

        else if (role === typeUserEnum.PARTICIPANT)

            navigate('/edi/user/participant', { replace: true })

        else

            navigate('/edi/login', { replace: true })
    }

    // Dados reais para notícias
    const recentNews = [
        {
            id: 1,
            title: "She Figures",
            image: "/edi/shefigures.png",
            link: "https://projects.research-and-innovation.ec.europa.eu/en/knowledge-publications-tools-and-data/interactive-reports/she-figures-2024",
            type: "video",
            category: "Statistics",
            description: "Comprehensive framework for implementing EDI+ practices in research institutions and academic environments.",
            date: "2025-02-01"
        },
        {
            id: 2,
            title: "CeDRI EDI+ Commission",
            image: "/edi/cedri.png",
            link: "https://cedri.ipb.pt/communication/news/cedri-framework-for-equality,-equity,-diversity,-inclusion,-ethical-responsibility,-and-civic-engagement",
            type: "pdf",
            category: "Research",
            description: "Complete guide to advanced research methodologies and statistical analysis techniques for academic research.",
            date: "2024-10-01",
        }
    ]

    // Dados mockados para recursos - com a nova estrutura
    const resources = [
        {
            id: 1,
            title: "STEP Project Short Videos",
            image: "/edi/step.png",
            link: "https://www.youtube.com/watch?v=hOohrtdPIXE&list=PLB0ir8WmooZmJEVBxsitfipwQC-BK_PkG",
            type: "tool",
            description: "Interactive dashboard for tracking and visualizing diversity metrics across departments.",
        },
        {
            id: 2,
            title: "Inclusion Assessment Tool",
            image: "/edi/ue.png",
            link: "https://commission.europa.eu/topics/equality-and-inclusion/equality-and-inclusion-key-actions_en",
            type: "tool",
            description: "Comprehensive tool for assessing inclusion levels and identifying areas for improvement.",
        },
        {
            id: 3,
            title: "Equity Monitoring System",
            image: "/edi/erc.png",
            link: "https://erc.europa.eu/manage-your-project/ethics-guidance",
            type: "system",
            description: "Data on ethical practices, training, and institutional compliance, promoting a culture of transparency, accountability, and research integrity",
        },
        {
            id: 4,
            title: "Othering is the problem of our time. Belonging is the solution",
            image: "/edi/other.png",
            link: "https://belonging.berkeley.edu/",
            type: "platform",
            description: "",
        }
    ]

    const filteredResources = activeResourceFilter === 'all' ? resources : resources.filter(resource => resource.type === activeResourceFilter)

    const getTypeColor = (type) => {

        switch (type) {
            case 'pdf':
                return "primary"
            case 'report':
                return "success"
            case 'guide':
                return "warning"
            case 'tool':
                return "secondary"
            case 'system':
                return "danger"
            case 'platform':
                return "default"
            default:
                return "default"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative text-center px-4 py-8 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent"></div>
                <div className="max-w-6xl mx-auto relative z-10">

                    <h1 className="text-emerald-500 mt-4 text-5xl md:text-6xl lg:text-6xl font-bold mb-2 leading-tight">
                        <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                            <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                EDI
                            </h1>
                        </Badge> Tool
                    </h1>
                    <h1 className="text-cyan-500 text-5xl md:text-6xl lg:text-6xl font-bold mb-6 leading-tight">
                        Equity, Diversity & Inclusion
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed max-w-4xl mx-auto">
                        Empowering research institutions worldwide to achieve excellence in Equity, Diversity, and Inclusion through innovative assessment tools and data-driven insights.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        <Button
                            onPress={goToApp}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 shadow hover:shadow-xl transform hover:-translate-y-1 px-8 py-6 text-lg font-semibold"
                            size="lg"
                        >
                            {user && user?.role !== 'guest' ? "Login to Explore More" : "Login to Explore More"}
                        </Button>
                    </div>
                </div>
            </section>

            {/* EDI+ Capabilities Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-emerald-50/20 to-white"></div>
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="text-center mb-10">
                        <h2 className="font-bold text-5xl md:text-6xl mb-6 bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                            <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                                <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge> Tool Capabilities
                        </h2>
                        <p className="text-gray-600 text-2xl max-w-6xl mx-auto">
                            Transform your research center with comprehensive EDI+ capabilities designed for meaningful impact
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-6xl mx-auto">
                        {/* Card 1 - Data Visualization */}
                        <Card className="group hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 shadow-sm hover:shadow-lg">
                            <CardHeader className="flex items-center justify-center p-6">
                                <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg">
                                    <LiaUsersSolid className="text-white text-2xl" />
                                </div>
                            </CardHeader>
                            <CardBody className="text-center">
                                <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-cyan-600 transition-colors duration-300">
                                    Data Insights & Visualization
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Gather and visualize EDI-related institutional and individual data through interactive dashboards and comprehensive analytics.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Card 2 - Reflection & Action */}
                        <Card className="group hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 shadow-sm hover:shadow-lg">
                            <CardHeader className="flex items-center justify-center p-6">
                                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <BsCalendar2CheckFill className="text-white text-2xl" />
                                </div>
                            </CardHeader>
                            <CardBody className="text-center">
                                <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                                    Reflection & Action
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Encourage reflection and action on inclusion, ethical research, and civic responsibility through guided processes and tools.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Card 3 - Reporting Support */}
                        <Card className="group hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 shadow-sm hover:shadow-lg">
                            <CardHeader className="flex items-center justify-center p-6">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                                    <MdAdminPanelSettings className="text-white text-2xl" />
                                </div>
                            </CardHeader>
                            <CardBody className="text-center">
                                <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                                    Advanced Reporting
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Support internal reporting with automated insights, customizable dashboards, and comprehensive analytics.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Card 4 - Resources & Best Practices */}
                        <Card className="group hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 shadow-sm hover:shadow-lg">
                            <CardHeader className="flex items-center justify-center p-6">
                                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                                    <SiGooglemaps className="text-white text-2xl" />
                                </div>
                            </CardHeader>
                            <CardBody className="text-center">
                                <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-amber-600 transition-colors duration-300">
                                    Knowledge Hub
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Provide resources, events, and good practices to improve EDI+ culture of responsible research and innovation.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Notícias Recentes Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-bold text-5xl md:text-6xl mb-6 bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                            <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                                <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge> News
                        </h2>
                        <p className="text-gray-600 text-2xl max-w-6xl mx-auto">
                            Stay informed with the latest developments in Equity, Diversity, Inclusion, Ethics, and Civic Engagement
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-6xl mx-auto">
                        {recentNews.map((news) => (
                            <Card key={news.id} className="group shadow hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 hover:shadow-lg">
                                <CardHeader className="p-0 relative overflow-hidden">
                                    <img src={news.image} alt={news.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                                </CardHeader>
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-center gap-2 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <span>{news.date}</span>
                                        </div>
                                        <Chip color={getTypeColor(news.type)} size="sm" className="text-white font-semibold mt-auto mb-auto">
                                            {news.type.toUpperCase()}
                                        </Chip>
                                    </div>
                                    <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-cyan-600 transition-colors duration-300 leading-tight">
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {news.description}
                                    </p>
                                    <Button fullWidth as="a" href={news.link} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 group-hover:-translate-y-1 shadow hover:shadow-lg" endContent={<BsArrowUpRight className="text-sm transition-transform group-hover:translate-x-1" />}>
                                        Read Full
                                    </Button>
                                </CardBody>

                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button onPress={() => navigate('/edi/news')} variant="bordered" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all duration-300 px-8 py-6 font-semibold" size="lg">
                            View all news
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recursos Section - ATUALIZADA */}
            <section className="py-20 bg-gradient-to-b from-gray-50 via-gray-100 to-white">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-bold text-5xl md:text-6xl mb-6 bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                            <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                                <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge> Resources
                        </h2>
                        <p className="text-gray-600 text-2xl max-w-6xl mx-auto mb-8">
                            Explore our interactive tools and platforms designed to enhance your EDI+ initiatives
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-6xl mx-auto">
                        {filteredResources.map((resource) => (
                            <Card key={resource.id} className="group hover:-translate-y-2 transition-all duration-500 border border-gray-200/50 shadow-sm hover:shadow-lg overflow-hidden">
                                <CardHeader className="p-0 relative overflow-hidden">
                                    <img
                                        src={getYouTubeThumbnail(resource.image)}
                                        alt={resource.title}
                                        className="h-48 w-full group-hover:scale-110 transition-transform duration-500"
                                    />

                                </CardHeader>
                                <CardBody className="p-6">
                                    <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-cyan-600 transition-colors duration-300 leading-tight">
                                        {resource.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {resource.description}
                                    </p>
                                    <Button
                                        fullWidth
                                        as="a"
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gradient-to-r mt-auto from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 group-hover:-translate-y-1 shadow hover:shadow-lg font-semibold"
                                        endContent={<BsArrowUpRight className="text-sm transition-transform group-hover:translate-x-1" />}
                                    >
                                        Access Resource
                                    </Button>
                                </CardBody>

                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button onPress={() => navigate('/edi/resources')}
                            variant="bordered"
                            className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all duration-300 px-8 py-6 font-semibold"
                            size="lg"
                        >
                            Explore more resources
                        </Button>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="text-center py-20 px-4 bg-gradient-to-r from-cyan-50 to-emerald-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h4 className="font-bold text-4xl mb-6 text-gray-800 leading-tight">
                        Ready to Transform Your Research Unit?
                    </h4>
                    <p className="text-gray-600 text-xl mb-10 max-w-6xl mx-auto leading-relaxed">
                        Join leading research institutions in measuring and improving equality metrics with our comprehensive EDI+ Tool.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        <Button
                            onPress={goToApp}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 shadow hover:shadow-xl transform hover:-translate-y-1 px-8 py-6 text-lg font-semibold"
                            size="lg"
                        >
                            {user && user?.role !== 'guest' ? "Explore More" : "Login to Explore More"}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home