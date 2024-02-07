import React from 'react'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="mt-12 pt-8 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-600">
                        <p className="font-medium">
                            Built with ❤️ by{' '}
                            <a
                                href="mailto:ahmedmohamedkhairy123@gmail.com"
                                className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                            >
                                Ahmed Mohamed Khairy
                            </a>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            A generous contribution to the open-source community
                        </p>
                    </div>

                    <div className="text-sm text-slate-500">
                        <p>
                            © {currentYear} ExcelSpeak • AI Data Analytics Platform •{' '}
                            <span className="text-indigo-500 font-medium">All Rights Reserved</span>
                        </p>
                        <p className="text-xs mt-1">
                            Sharing knowledge generously to empower data-driven decisions worldwide
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="mailto:ahmedmohamedkhairy123@gmail.com"
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors font-medium"
                        >
                            ✉️ Contact Creator
                        </a>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        This project is shared generously under the MIT License •
                        Made possible by the visionary generosity of{' '}
                        <span className="text-indigo-400 font-medium">Ahmed Mohamed Khairy</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer