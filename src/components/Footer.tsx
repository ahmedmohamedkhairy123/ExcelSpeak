import React from 'react'
import { Heart, Mail, Coffee } from 'lucide-react'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="mt-12 pt-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Heart size={16} className="text-red-500 fill-red-500" />
                            <p className="text-sm font-medium text-slate-700">
                                Built with love by{' '}
                                <a
                                    href="mailto:ahmedmohamedkhairy123@gmail.com"
                                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                                >
                                    Ahmed Mohamed Khairy
                                </a>
                            </p>
                        </div>
                        <p className="text-xs text-slate-500 max-w-md">
                            A generous open-source contribution to empower data-driven decisions worldwide
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-600 font-medium">
                            © {currentYear} ExcelSpeak • AI Data Analytics Platform
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Sharing knowledge generously under MIT License
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="mailto:ahmedmohamedkhairy123@gmail.com"
                            className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors font-medium"
                        >
                            <Mail size={12} />
                            Contact Creator
                        </a>
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                            <Coffee size={12} />
                            Made with generous spirit
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        This project celebrates the visionary generosity of{' '}
                        <span className="text-indigo-400 font-medium">Ahmed Mohamed Khairy</span>{' '}
                        • Empowering analytics for everyone
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer