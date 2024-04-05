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
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-60 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <div className="text-4xl text-indigo-400">📊</div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ready for Analysis</h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed">
                        Your data is indexed and optimized. Enter a prompt or SQL query above to uncover insights.
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Intelligence Summary Cards */}
            {result.explanation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Logic Explanation */}
                    <div className="md:col-span-2 bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100/80 transition-colors" />

                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                            🧠 Logic Strategy
                        </h3>
                        <p className="text-slate-700 text-base md:text-lg leading-relaxed font-medium relative z-10">
                            {result.explanation}
                        </p>
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 truncate relative z-10">
                            {result.sql}
                        </div>
                    </div>

                    {/* Predictive Snapshot */}
                    {result.insights && (
                        <div className="bg-slate-900 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <div className="text-6xl">✨</div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50" />

                            <div className="relative z-10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                                    🔮 Global Insight
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Prediction</p>
                                        <p className="text-sm font-bold mt-1 leading-snug text-indigo-100">{result.insights.prediction}</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Confidence Score</p>
                                            <span className="text-xl font-mono font-bold text-emerald-400">{(result.insights.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000 ease-out"
                                                style={{ width: `${(result.insights.confidence || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {result.insights.whatIf && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                                            <p className="text-[9px] font-black uppercase text-indigo-300 mb-1">Simulation</p>
                                            <p className="text-xs font-medium text-slate-300 italic">"{result.insights.whatIf}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tabular Output */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        📋 Result Dataset
                    </h3>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all bg-transparent px-4 py-2 rounded-xl border border-transparent hover:border-slate-200 hover:shadow-sm"
                    >
                        ⬇️ Export CSV
                    </button>
                </div>

                {result.values.length > 0 ? (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                                <tr className="border-b border-slate-200 shadow-sm">
                                    {result.columns.map(col => (
                                        <th key={col} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {result.values.slice(0, 100).map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-8 py-4 text-sm font-medium text-slate-600 whitespace-nowrap group-hover:text-indigo-900 transition-colors">
                                                {cell !== null && cell !== undefined ? String(cell) : <span className="text-slate-300 italic text-xs">null</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {result.values.length > 100 && (
                            <div className="p-4 text-center text-slate-500 text-sm border-t border-slate-100">
                                Showing 100 of {result.values.length} rows
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400 italic">
                        No data returned from query
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResultsView