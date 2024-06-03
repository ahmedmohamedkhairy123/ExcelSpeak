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
            if (tables.length === 0) {
                alert("Please upload data files first before using AI analysis.")
                return
            }

            setIsLoading(true)
            setResult(null)

            try {
                // Import dynamically to avoid loading if not needed
                const { processAgentRequest } = await import('./services/gemini')

                // Get schema and sample data
                const schema = await getDbSchema()
                const sampleRes = tables.length > 0
                    ? await executeSql(`SELECT * FROM ${tables[0].name} LIMIT 5`)
                    : { values: [] }

                // Get AI analysis
                const analysis = await processAgentRequest(userInput, schema, sampleRes.values)

                // Execute generated SQL
                const dbResult = await executeSql(analysis.sql)

                const finalOutput: QueryResult = {
                    ...dbResult,
                    explanation: analysis.explanation,
                    insights: analysis.insights,
                    sql: analysis.sql
                }

                setResult(finalOutput)

                // Add to history
                const newItem: HistoryItem = {
                    id: Date.now().toString(),
                    query: userInput,
                    sql: analysis.sql,
                    timestamp: Date.now()
                }
                const newHistory = [newItem, ...history.slice(0, 19)]
                setHistory(newHistory)
                localStorage.setItem('excelspeak_history', JSON.stringify(newHistory))
            } catch (err: any) {
                console.error("Analysis error:", err)

                // User-friendly error messages
                let errorMessage = "Analysis failed. "

                if (err.message.includes('API key')) {
                    errorMessage += "Please configure your Gemini API key in the .env file. Get a free key from: https://makersuite.google.com/app/apikey"
                } else if (err.message.includes('quota')) {
                    errorMessage += "API quota exceeded. Please try again later or check your billing."
                } else if (err.message.includes('SQL Error')) {
                    errorMessage += `SQL Error: ${err.message.replace('SQL Error: ', '')}`
                } else {
                    errorMessage += err.message || "Please try again with a different query."
                }

                alert(errorMessage)

                // Fallback to mock if AI fails
                try {
                    const mockSql = `SELECT * FROM ${tables[0].name} LIMIT 10`
                    const dbResult = await executeSql(mockSql)

                    const finalOutput: QueryResult = {
                        ...dbResult,
                        explanation: "Using fallback analysis. For full AI features, configure your Gemini API key.",
                        insights: {
                            prediction: "Configure Gemini API for advanced predictions",
                            confidence: 0.5,
                            reasoning: "Using basic data display without AI analysis",
                            whatIf: "With Gemini API, you would get predictive insights here"
                        },
                        sql: mockSql
                    }
                    setResult(finalOutput)
                } catch (fallbackError) {
                    // Just show error
                }
            } finally {
                setIsLoading(false)
            }
        } else {
            // Direct SQL mode (unchanged)
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