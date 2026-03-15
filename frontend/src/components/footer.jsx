import React from 'react'

import { MdEmail } from 'react-icons/md'

import { BsArrowUpCircleFill } from 'react-icons/bs'

import { Badge } from '@heroui/react'

const Footer = () => {

    const scrollToTop = () => {

        window.scrollTo({ top: 0, behavior: 'smooth' })

    }

    const contactEmails = [
        { 
            label: 'STEP Project', 
            email: 'step@ipb.pt' 
        }
        
    ]

    return (
        <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Badge 
                                variant="faded" 
                                className="left-2 h-10 w-10 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent font-bold text-4xl" 
                                content="+"
                            >
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                    EDI
                                </h1>
                            </Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">Digital platform developed to support research centers and related institutions in performing self-assessments on EDI+ across their research practices.</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contactEmails.map((contact, index) => (
                                <a
                                    key={index}
                                    href={`mailto:${contact.email}`}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 group"
                                >
                                    <MdEmail className="text-cyan-400 text-lg flex-shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                                            {contact.label}
                                        </span>
                                        <span className="text-gray-400 text-xs truncate">
                                            {contact.email}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-gray-900 border-t border-gray-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © 2025 EDI+. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400 text-sm hidden sm:inline">
                                Made with ❤️ for research equality
                            </span>
                            <button
                                onClick={scrollToTop}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full"
                                aria-label="Scroll to top"
                            >
                                <BsArrowUpCircleFill className="text-2xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer