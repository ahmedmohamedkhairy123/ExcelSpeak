import React from 'react'
import { TableInfo, HistoryItem } from '../types'

interface SidebarProps {
    tables: TableInfo[]
    history: HistoryItem[]
    onClearHistory: () => void
    onSelectHistory: (item: HistoryItem) => void
    activeTab: 'files' | 'history'
    setActiveTab: (tab: 'files' | 'history') => void
    isOpen: boolean
    onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
    tables,
    history,
    onClearHistory,
    onSelectHistory,
    activeTab,
    setActiveTab,
    isOpen,
    onClose
}) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 h-full border-r border-slate-200 bg-white flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <div className="text-2xl">📈</div>
                            <h1 className="text-xl font-bold">ExcelSpeak</h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Analytics Engine</p>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>

                <div className="flex p-2 gap-2">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'files' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        📂 Data Sources
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        📜 History
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'files' ? (
                        <div className="space-y-4">
                            {tables.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-4xl text-slate-300 mb-2">📄</div>
                                    <p className="text-sm text-slate-400">No files uploaded yet.</p>
                                </div>
                            ) : (
                                tables.map((t, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{t.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{t.rowCount} rows</span>
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-700 truncate">{t.fileName}</h3>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase">Recent Queries</h3>
                                <button onClick={onClearHistory} className="text-xs text-red-500 hover:text-red-700">
                                    🗑️ Clear
                                </button>
                            </div>
                            {history.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-10">No history yet.</p>
                            ) : (
                                history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onSelectHistory(item)
                                            onClose()
                                        }}
                                        className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200"
                                    >
                                        <p className="text-sm text-slate-700 line-clamp-2 mb-1">{item.query}</p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">{item.sql}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Sidebar