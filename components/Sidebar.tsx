
import React from 'react';
import { TableInfo, HistoryItem } from '../types';
import { Database, FileText, History, Trash2, Layers, X } from 'lucide-react';

interface SidebarProps {
    tables: TableInfo[];
    history: HistoryItem[];
    onClearHistory: () => void;
    onSelectHistory: (item: HistoryItem) => void;
    activeTab: 'files' | 'history';
    setActiveTab: (tab: 'files' | 'history') => void;
    isOpen: boolean;
    onClose: () => void;
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
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 h-full border-r border-slate-200 bg-white flex flex-col transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Layers size={24} />
                            <h1 className="text-xl font-bold">DataInsight</h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Analytics Engine</p>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex p-2 gap-2">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Database size={16} /> Data Sources
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <History size={16} /> History
                        </div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'files' ? (
                        <div className="space-y-4">
                            {tables.length === 0 ? (
                                <div className="text-center py-10">
                                    <FileText className="mx-auto text-slate-300 mb-2" size={32} />
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
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {t.columns.slice(0, 3).map(c => (
                                                <span key={c} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                                                    {c}
                                                </span>
                                            ))}
                                            {t.columns.length > 3 && (
                                                <span className="text-[10px] text-slate-400">+{t.columns.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase">Recent Queries</h3>
                                <button onClick={onClearHistory} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                    <Trash2 size={12} /> Clear
                                </button>
                            </div>
                            {history.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-10">No history yet.</p>
                            ) : (
                                history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onSelectHistory(item);
                                            onClose();
                                        }}
                                        className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all group"
                                    >
                                        <p className="text-sm text-slate-700 line-clamp-2 mb-1 group-hover:text-indigo-600">{item.query}</p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">{item.sql}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Analyst Profile</p>
                            <p className="text-[10px] text-slate-500">Professional Tier</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
