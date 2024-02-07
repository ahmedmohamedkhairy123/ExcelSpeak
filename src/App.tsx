import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import QuerySection from './components/QuerySection'
import ResultsView from './components/ResultsView'
import { TableInfo, QueryResult, HistoryItem, CleanOption } from './types'

const App: React.FC = () => {
    const [tables, setTables] = useState<TableInfo[]>([])
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [activeTab, setActiveTab] = useState<'files' | 'history'>('files')
    const [mode, setMode] = useState<'agent' | 'server'>('agent')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const [userInput, setUserInput] = useState('')
    const [rawSql, setRawSql] = useState('')
    const [result, setResult] = useState<QueryResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const [cleanOption, setCleanOption] = useState<CleanOption>(CleanOption.NONE)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const savedHistory = localStorage.getItem('excelspeak_history')
        if (savedHistory) setHistory(JSON.parse(savedHistory))
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Will be implemented in Phase 5
        setIsUploading(true)
        setTimeout(() => {
            setIsUploading(false)
            alert('File upload will be implemented in Phase 5')
        }, 1000)
    }

    const handleRunAnalysis = async () => {
        // Will be implemented in Phase 6
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            alert('Analysis will be implemented in Phase 6')
        }, 1500)
    }

    const handleExport = () => {
        alert('Export will be implemented in later phases')
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
            <Sidebar
                tables={tables}
                history={history}
                onClearHistory={() => { setHistory([]); localStorage.removeItem('excelspeak_history') }}
                onSelectHistory={(item) => {
                    setUserInput(item.query)
                    setRawSql(item.sql)
                    setMode(item.sql ? 'server' : 'agent')
                    setIsSidebarOpen(false)
                }}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-slate-50/50">
                <Header
                    setIsSidebarOpen={setIsSidebarOpen}
                    mode={mode}
                    setMode={setMode}
                />

                <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-4 space-y-6">
                            <UploadSection
                                cleanOption={cleanOption}
                                setCleanOption={setCleanOption}
                                handleFileUpload={handleFileUpload}
                                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                                isUploading={isUploading}
                            />
                        </div>

                        <div className="xl:col-span-8">
                            <QuerySection
                                mode={mode}
                                userInput={userInput}
                                setUserInput={setUserInput}
                                rawSql={rawSql}
                                setRawSql={setRawSql}
                                handleRunAnalysis={handleRunAnalysis}
                                isLoading={isLoading}
                                hasTables={tables.length > 0}
                            />
                        </div>
                    </section>

                    <ResultsView
                        result={result}
                        isLoading={isLoading}
                        hasTables={tables.length > 0}
                        handleExport={handleExport}
                    />
                </div>

                {/* Copyright Footer */}
                <footer className="mt-auto py-6 px-8 border-t border-slate-200 bg-white/50">
                    <div className="max-w-[1600px] mx-auto w-full text-center">
                        <p className="text-sm text-slate-500">
                            Built with ❤️ by{' '}
                            <a
                                href="mailto:ahmedmohamedkhairy123@gmail.com"
                                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                Ahmed Mohamed Khairy
                            </a>
                            {' • '}
                            <span className="text-slate-400">
                                Empowering data-driven decisions through AI intelligence
                            </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            © {new Date().getFullYear()} ExcelSpeak AI Analytics Platform • All intellectual insights preserved
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default App