import { useState } from 'react'

import { Badge, Avatar, Card, CardBody, CardHeader, Input, Textarea, Select, SelectItem, Button, Divider, Chip, Link } from '@heroui/react'

import { MdEmail } from 'react-icons/md'

import { Users, Target, BarChart3, Award, Globe, Shield, ArrowRight, Mail, ExternalLink, Cpu } from "lucide-react"

import { useNavigate } from 'react-router-dom'

import warningMessage from '../functions/toaster/info'

const AboutContact = () => {

    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleChange = (value, name) => {

        setFormData({ ...formData, [name]: value })

    }

    const goToLogin = () => {

        navigate('/edi/login')

    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        setIsSubmitting(true)

        setTimeout(() => {

            warningMessage('this acion is not implemented...')

            setFormData({ name: '', email: '', subject: '', message: '' })

            setIsSubmitting(false)

        }, 2000)

    }

    const missionStats = [
        { number: "10+", label: "Research Institutions" },
        { number: "5", label: "Countries Reached" },
        { number: "1K+", label: "Assessments Completed" },
        { number: "95%", label: "Satisfaction Rate" }
    ]

    const coreValues = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Integrity",
            description: "We maintain the highest standards of ethical research and data privacy in all our assessments."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Inclusion",
            description: "Every voice matters. We design tools that capture diverse perspectives and experiences."
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Evidence-Based",
            description: "Our methodologies are grounded in rigorous research and validated through extensive testing."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Perspective",
            description: "We understand and respect cultural differences in EDI approaches across institutions worldwide."
        }
    ]

    const teamMembers = [
        {
            name: 'STEP Project',
            email: 'step@ipb.pt',
            department: 'Horizon Europe',
            description: 'EDI+ Tool is a product of STEP Project funded by Horizon Europe.',
            link: 'https://step.ipb.pt/'
        },
        {
            name: 'Ana I. Pereira',
            email: 'apereira@ipb.pt',
            department: 'Polytechnic Institute of Bragança',
            description: 'Coordinating the development and implementation of the EDI+ Tool.',
            link: 'https://cedri.ipb.pt/people/integrated-members/ana-isabel-pereira'
        },
        {
            name: 'M. Fátima Pacheco',
            email: 'pacheco@ipb.pt',
            department: 'Polytechnic Institute of Bragança',
            description: 'Coordinating the development and implementation of the EDI+ Tool.',
            link: 'https://cedri.ipb.pt/people/integrated-members/maria-f.-pacheco'
        }
    ]

    const subjectOptions = [
        { key: 'partnership', label: 'Institutional Partnership' },
        { key: 'assessment', label: 'EDI Assessment' },
        { key: 'technical', label: 'Technical Support' },
        { key: 'general', label: 'General Information' },
        { key: 'other', label: 'Other' }
    ]

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <div className="bg-white mb-6">
                <div className="mx-auto">
                    <div className="text-center mx-auto mb-6">
                        <div className='bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-transparent pb-12'>
                            <div className='max-w-5xl mx-auto'>
                                <h1 className="text-5xl md:pt-20 md:text-6xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-6">
                                    About  <Badge variant="faded" className="left-12 md:left-16 -top-1 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-6xl" content="+">
                                        <h1 className="text-5xl md:text-6xl mr-4 font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                            EDI
                                        </h1>
                                    </Badge> Tool
                                </h1>
                                <p className="text-2xl text-gray-600 leading-relaxed mb-8">
                                    Empowering research institutions worldwide to achieve excellence in
                                    <span className="font-semibold text-cyan-600"> Equity, Diversity, and Inclusion </span>
                                    through innovative assessment tools and data-driven insights.
                                </p>
                            </div>
                        </div>

                        {/* Project Information */}
                        <div className="bg-cyan-50 max-w-5xl mx-auto -mt-10 rounded-lg p-6 border border-cyan-200 mb-3">
                            <p className="text-cyan-800 text-lg leading-relaxed flex items-start">
                                <span className="flex-shrink-0 mt-1 mr-3">
                                    <Globe className="w-5 h-5 text-cyan-600" />
                                </span>
                                <span>
                                    <strong>EDI+ Tool</strong> is a product of{' '}
                                    <Link
                                        href="https://step.ipb.pt/"
                                        isExternal
                                        className="font-semibold text-cyan-700 hover:text-cyan-900"
                                    >
                                        STEP Project
                                    </Link>{' '}
                                    funded by Horizon Europe.
                                </span>
                            </p>

                            <p className="text-cyan-800 text-lg leading-relaxed flex items-start">
                                <span className="flex-shrink-0 mt-1 mr-3">
                                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                                </span>
                                <span>
                                    The EDI survey was developed by{' '}
                                    <Link
                                        href="https://www.linkedin.com/in/sofiane-mahi-6876361ab/"
                                        isExternal
                                        className="font-semibold text-cyan-700 hover:text-cyan-900"
                                    >
                                        Sofiane Mahi
                                    </Link>{' '}
                                    from the University of Reims Champagne-Ardenne.
                                </span>
                            </p>

                            <p className="text-cyan-800 text-lg leading-relaxed flex items-start mt-4">
                                <span className="flex-shrink-0 mt-1 mr-3">
                                    <Cpu className="w-5 h-5 text-cyan-600" />
                                </span>
                                <span>
                                    The IT development was carried out by the{' '}
                                    <Link
                                        href="https://www.ipb.pt/"
                                        isExternal
                                        className="font-semibold text-cyan-700 hover:text-cyan-900"
                                    >
                                        Polytechnic Institute of Bragança
                                    </Link>.
                                </span>
                            </p>
                        </div>

                        {/* Coordinators Info */}
                        <div className="bg-emerald-50 max-w-5xl mx-auto rounded-lg p-6 border border-emerald-200">
                            <p className="text-emerald-800 mb- text-lg flex items-start">
                                <span className="flex-shrink-0 mt-1 mr-3">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </span>
                                <span>
                                    The EDI+ Tool is coordinated by{' '}
                                    <Link
                                        href="https://cedri.ipb.pt/people/integrated-members/ana-isabel-pereira"
                                        isExternal
                                        className="font-semibold text-emerald-700 hover:text-emerald-900"
                                    >
                                        Ana I. Pereira
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href="https://cedri.ipb.pt/people/integrated-members/maria-f.-pacheco"
                                        isExternal
                                        className="font-semibold text-emerald-700 hover:text-emerald-900"
                                    >
                                        M. Fátima Pacheco
                                    </Link>.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 mx-auto  px-4 py-16">
                <div className='container mx-auto max-w-5xl'>
                    <Chip color="primary" variant="flat" className="mb-4">
                        Our Mission
                    </Chip>
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Transforming Research Culture Through Data
                    </h2>
                </div>
                <div className="container max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
                    <div>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            EDI+ is a comprehensive initiative dedicated to helping research institutions
                            measure, understand, and improve their equality, diversity, and inclusion metrics.
                            We believe that inclusive research environments drive innovation and excellence.
                        </p>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Our platform provides evidence-based assessment tools, actionable insights,
                            and benchmarking capabilities that enable institutions to create meaningful,
                            sustainable change in their organizational culture.
                        </p>

                        {

                            /*
                              <div className="grid grid-cols-4 gap-2">
                                {missionStats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl font-bold text-cyan-600 mb-1">{stat.number}</div>
                                        <small className="text-gray-600">{stat.label}</small>
                                    </div>
                                ))}
                            </div>
                            */
                        }
                    </div>

                    <div className="relative">
                        <Card className="bg-gradient-to-br from-cyan-500 to-emerald-500 shadow text-white">
                            <CardBody className="p-8">
                                <div className="flex gap-2 items-center">
                                    <Target className="w-12 h-12 mb-4" />
                                    <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                </div>
                                <p className="text-cyan-50 text-xl leading-relaxed">
                                    A world where every research institution embraces and embodies
                                    true equality, diversity, and inclusion, creating environments
                                    where all researchers can thrive and innovate without barriers.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="mx-auto max-w-6xl px-4 py-16 bg-white">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <Chip color="secondary" variant="flat" className="mb-4">
                        Our Values
                    </Chip>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Principles That Guide Our Work
                    </h2>
                    <p className="text-lg text-gray-600">
                        These core values shape every aspect of our platform and partnerships.
                    </p>
                </div>

                <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {coreValues.map((value, index) => (
                        <Card key={index} className="shadow transition-all duration-300 border border-gray-100">
                            <CardBody className="p-6 text-center">
                                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-600">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="mx-auto max-w-6xl px-4 py-16">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <Chip color="warning" variant="flat" className="mb-4">
                        Our Contact
                    </Chip>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-lg text-gray-600">
                        Contact us for more information about the EDI+ Tool and partnerships.
                    </p>
                </div>

                <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
                    {teamMembers.map((member, index) => (
                        <Card key={index} className="shadow transition-all duration-300">
                            <CardBody className="p-6 text-center">
                                <Avatar
                                    className="w-20 h-20 mx-auto mb-4 border-4 border-cyan-100 bg-gradient-to-r from-cyan-500 to-emerald-500"
                                    classNames={{
                                        name: "text-2xl font-bold text-white"
                                    }}
                                    name={member.name.split(' ').map(n => n[0]).join('')}
                                />
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-2">{member.department}</p>
                                <p className="text-gray-600 text-center mb-4 leading-relaxed">
                                    {member.description}
                                </p>


                                <Button
                                    variant="light"
                                    startContent={<MdEmail className="text-lg" />}
                                    as="a"
                                    href={`mailto:${member.email}`}
                                    className="text-gray-700 hover:text-cyan-600 mb-4"
                                >
                                    {member.email}
                                </Button>


                                <div className="mb-4">
                                    <Link
                                        href={member.link}
                                        isExternal
                                        className="flex items-center justify-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                                    >
                                        View Profile
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Contact Form Section 
                        <div className="mx-auto px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h2>
                    <p className="text-gray-600 text-2xl max-w-5xl mx-auto">
                        We're here to help research institutions achieve excellence in equality, diversity, and inclusion.
                    </p>
                </div>

                <Divider className="max-w-4xl mx-auto my-8" />

               
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow">
                        <CardHeader className="pb-0 pt-6 px-6">
                            <h2 className="text-2xl font-bold text-gray-800">Send Us a Message</h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name *"
                                        name="name"
                                        value={formData.name}
                                        onValueChange={(value) => handleChange(value, 'name')}
                                        required
                                        placeholder="Your full name"
                                        variant="bordered"
                                        classNames={{
                                            input: "text-base"
                                        }}
                                    />
                                    <Input
                                        label="Email Address *"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onValueChange={(value) => handleChange(value, 'email')}
                                        required
                                        placeholder="your.email@example.com"
                                        variant="bordered"
                                        classNames={{
                                            input: "text-base"
                                        }}
                                    />
                                </div>

                                <Select
                                    label="Subject *"
                                    name="subject"
                                    selectedKeys={formData.subject ? [formData.subject] : []}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0]
                                        handleChange(value, 'subject')
                                    }}
                                    required
                                    variant="bordered"
                                    placeholder="Select a subject"
                                >
                                    {subjectOptions.map((option) => (
                                        <SelectItem key={option.key}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Textarea
                                    label="Message *"
                                    name="message"
                                    value={formData.message}
                                    onValueChange={(value) => handleChange(value, 'message')}
                                    required
                                    placeholder="Please describe your message or question..."
                                    variant="bordered"
                                    minRows={6}
                                    classNames={{
                                        input: "resize-vertical"
                                    }}
                                />

                                <div className='flex justify-end'>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white py-6 text-base font-semibold"
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
            */}


            {/* CTA Section */}
            <div className="container max-w-6xl mx-auto px-4 py-16">
                <Card className="shadow bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-center">
                    <CardBody className="p-12">
                        <Award className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="text-4xl text-center font-bold mb-4">
                            Ready to Transform Your Institution?
                        </h2>
                        <p className="text-cyan-50 text-xl text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join hundreds of research institutions already using EDI+ to create more inclusive
                            and equitable research environments.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onPress={goToLogin}
                                color="primary"
                                variant="solid"
                                className="bg-white text-cyan-600 font-semibold text-lg px-8 py-6"
                                endContent={<ArrowRight className="w-5 h-5" />}
                            >
                                Login to explore more
                            </Button>
                            <Button
                                as={Link}
                                href='mailto:step@ipb.pt'
                                variant="flat"
                                className="bg-cyan-400/40 text-white font-semibold text-lg px-8 py-6"
                                startContent={<Mail className="w-5 h-5" />}
                            >
                                Contact Our Team
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Partners/Recognition */}
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="text-center">
                    <p className="text-gray-500 mb-8">
                        Trusted by leading research institutions worldwide
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                        {["European Research Council", "Horizon Europe", "Science Foundation", "Global Research Network", "Academic Excellence Initiative"].map((partner, index) => (
                            <div key={index} className="text-gray-400 font-semibold text-sm">
                                {partner}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutContact