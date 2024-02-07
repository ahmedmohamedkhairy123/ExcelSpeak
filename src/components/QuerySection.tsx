import React from 'react'

interface QuerySectionProps {
    mode: 'agent' | 'server'
    userInput: string
    setUserInput: (s: string) => void
    rawSql: string
    setRawSql: (s: string) => void
    handleRunAnalysis: () => void
    isLoading: boolean
    hasTables: boolean
}

const QuerySection: React.FC<QuerySectionProps> = ({
    mode,
    userInput,
    setUserInput,
    rawSql,
    setRawSql,
    handleRunAnalysis,
    isLoading,
    hasTables
}) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {mode === 'agent' ? '🤖 Prompt Intelligence' : '💻 Direct SQL Control'}
                </h2>
                {mode === 'agent' && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold">Gemini AI</span>
                )}
            </div>

            <div className="relative flex-1">
                <textarea
                    value={mode === 'agent' ? userInput : rawSql}
                    onChange={(e) => mode === 'agent' ? setUserInput(e.target.value) : setRawSql(e.target.value)}
                    placeholder={mode === 'agent' ? "Ask anything about your data... e.g., 'What is the correlation between price and demand?'" : "Enter raw SQL query..."}
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-medium"
                />

                <div className="absolute bottom-4 right-4">
                    <button
                        onClick={handleRunAnalysis}
                        disabled={isLoading || !hasTables}
                        className={`
                            text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2
                            ${isLoading || !hasTables
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:shadow-lg'
                            }
                        `}
                    >
                        {isLoading ? (
                            <>🔄 Analyzing...</>
                        ) : (
                            <>▶️ {mode === 'agent' ? 'Generate Insight' : 'Execute'}</>
                        )}
                    </button>
                </div>
            </div>

            {!hasTables && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                    <div className="text-amber-600">⚠️</div>
                    <span className="text-xs font-bold text-amber-700">Data connection required. Please upload files to begin.</span>
                </div>
            )}
        </div>
    )
}

export default QuerySection