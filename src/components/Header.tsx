import React from 'react'

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void
    mode: 'agent' | 'server'
    setMode: (mode: 'agent' | 'server') => void
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, mode, setMode }) => {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                    ☰
                </button>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                        📊 ExcelSpeak
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
                    <button
                        onClick={() => setMode('agent')}
                        className={`px-4 py-2 rounded-lg transition-all ${mode === 'agent'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        🤖 AI Analyst
                    </button>
                    <button
                        onClick={() => setMode('server')}
                        className={`px-4 py-2 rounded-lg transition-all ${mode === 'server'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        💻 SQL Editor
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header