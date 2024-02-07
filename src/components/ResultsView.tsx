import React from 'react'
import { QueryResult } from '../types'

interface ResultsViewProps {
    result: QueryResult | null
    isLoading: boolean
    hasTables: boolean
    handleExport: () => void
}

const ResultsView: React.FC<ResultsViewProps> = ({
    result,
    isLoading,
    hasTables,
    handleExport
}) => {
    if (!result) {
        if (!isLoading && hasTables) {
            return (
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <div className="text-4xl text-indigo-400">📊</div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Ready for Analysis</h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-3">
                        Your data is indexed and optimized. Enter a prompt or SQL query above to uncover insights.
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4">
                        🧠 Logic Strategy
                    </h3>
                    <p className="text-slate-700 text-base leading-relaxed font-medium">
                        {result.explanation || 'No explanation provided.'}
                    </p>
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 truncate">
                        {result.sql}
                    </div>
                </div>

                {result.insights && (
                    <div className="bg-slate-900 text-white p-7 rounded-3xl shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">
                            🔮 Global Insight
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500">Prediction</p>
                                <p className="text-sm font-bold mt-1 leading-snug text-indigo-100">{result.insights.prediction}</p>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500">Confidence Score</p>
                                    <span className="text-xl font-mono font-bold text-emerald-400">{(result.insights.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                        style={{ width: `${(result.insights.confidence || 0) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest">
                        📋 Result Dataset
                    </h3>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600"
                    >
                        ⬇️ Export CSV
                    </button>
                </div>
                <div className="p-8 text-center text-slate-400 italic">
                    Data table will appear here in later phases
                </div>
            </div>
        </div>
    )
}

export default ResultsView