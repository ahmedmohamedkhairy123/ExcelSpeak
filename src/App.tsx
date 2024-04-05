import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import QuerySection from './components/QuerySection'
import ResultsView from './components/ResultsView'
import Footer from './components/Footer'
import { TableInfo, QueryResult, HistoryItem, CleanOption } from './types'
import { loadFileToTable, executeSql, getDbSchema, initDb } from './services/database'

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

        // Initialize database on app start
        initDb().catch(console.error)
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            // Initialize database first
            await initDb()

            const newTables: TableInfo[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const tableName = `table_${tables.length + i + 1}`

                try {
                    const info = await loadFileToTable(file, tableName, cleanOption, '')
                    newTables.push(info)

                    // Show success message for each file
                    console.log(`✅ File "${file.name}" loaded as table "${tableName}" with ${info.rowCount} rows`)
                } catch (err) {
                    console.error(`❌ Failed to load file "${file.name}":`, err)
                    alert(`Failed to load "${file.name}". Please ensure it's a valid CSV or Excel file.`)
                }
            }

            if (newTables.length > 0) {
                setTables(prev => [...prev, ...newTables])

                // Show summary
                alert(`Successfully loaded ${newTables.length} file(s) with ${newTables.reduce((sum, t) => sum + t.rowCount, 0)} total rows`)
            }
        } catch (err) {
            console.error('Upload error:', err)
            alert("Upload failed. Please ensure files are valid and try again.")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRunAnalysis = async () => {
        if (mode === 'agent') {
            if (!userInput.trim()) return
            setIsLoading(true)
            setResult(null)

            try {
                // For now, create a mock analysis until we implement Gemini in Phase 6
                const mockSql = tables.length > 0
                    ? `SELECT * FROM ${tables[0].name} LIMIT 10`
                    : "SELECT 'Please upload data first' as message"

                const dbResult = await executeSql(mockSql)

                const finalOutput: QueryResult = {
                    ...dbResult,
                    explanation: "This is a mock explanation. Gemini AI integration will be added in Phase 6.",
                    insights: {
                        prediction: "Data patterns suggest moderate growth in key metrics",
                        confidence: 0.75,
                        reasoning: "Based on initial data analysis and statistical trends",
                        whatIf: "If current trends continue, expect 15-20% growth over next quarter"
                    },
                    sql: mockSql
                }

                setResult(finalOutput)

                // Add to history
                const newItem: HistoryItem = {
                    id: Date.now().toString(),
                    query: userInput,
                    sql: mockSql,
                    timestamp: Date.now()
                }
                const newHistory = [newItem, ...history.slice(0, 19)]
                setHistory(newHistory)
                localStorage.setItem('excelspeak_history', JSON.stringify(newHistory))
            } catch (err: any) {
                alert(err.message || "Analysis failed. Please upload data first.")
            } finally {
                setIsLoading(false)
            }
        } else {
            // Direct SQL mode
            if (!rawSql.trim()) return
            setIsLoading(true)
            try {
                const dbResult = await executeSql(rawSql)
                setResult(dbResult)

                // Add to history
                const newItem: HistoryItem = {
                    id: Date.now().toString(),
                    query: "Manual SQL Query",
                    sql: rawSql,
                    timestamp: Date.now()
                }
                const newHistory = [newItem, ...history.slice(0, 19)]
                setHistory(newHistory)
                localStorage.setItem('excelspeak_history', JSON.stringify(newHistory))
            } catch (err: any) {
                alert(`SQL Error: ${err.message}`)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleExport = () => {
        if (!result || result.values.length === 0) {
            alert("No data to export")
            return
        }

        try {
            const csvContent = [
                result.columns.join(','),
                ...result.values.map(v => v.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `excelspeak_export_${Date.now()}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            alert("Export failed. Please try again.")
        }
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

                <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full flex-1">
                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-4 space-y-6">
                            <UploadSection
                                cleanOption={cleanOption}
                                setCleanOption={setCleanOption}
                                handleFileUpload={handleFileUpload}
                                fileInputRef={fileInputRef}
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

                    <Footer />
                </div>
            </main>
        </div>
    )
}

export default App