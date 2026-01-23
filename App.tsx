
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Upload, Database, Terminal, Play, Download, BrainCircuit,
  Sparkles, MessageSquare, AlertCircle, RefreshCw, Menu, X, ChevronRight,
  BarChart3, LayoutDashboard, History as HistoryIcon, Table as TableIcon,
  ShieldCheck
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DataViz from './components/DataViz';
import { TableInfo, QueryResult, HistoryItem, CleanOption } from './types';
import { initDb, loadFileToTable, executeSql, getDbSchema } from './services/database';
import { processAgentRequest } from './services/gemini';
import { backendApi } from './services/backendApi';
import LoginModal from './components/loginModal'; // lowercase L
import { authApi } from './services/authApi';
import { mockApi } from './services/mockApi';
const App: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'history'>('files');
  const [mode, setMode] = useState<'agent' | 'server'>('agent');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
const [useBackend] = useState<'local'>('local'); // Always local mode
const [backendStatus, setBackendStatus] = useState<'disconnected' | 'connected' | 'checking'>('disconnected');
  const [userInput, setUserInput] = useState('');
  const [rawSql, setRawSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [cleanOption, setCleanOption] = useState<CleanOption>(CleanOption.NONE);
  const [customVal, setCustomVal] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  // Initialize mock data storage (3 lines)
  if (!localStorage.getItem('mock_users')) localStorage.setItem('mock_users', '[]');
  if (!localStorage.getItem('mock_history')) localStorage.setItem('mock_history', '[]');
  if (!localStorage.getItem('mock_tables')) localStorage.setItem('mock_tables', '[]');
  
  initDb();
  const savedHistory = localStorage.getItem('insight_history_v2');
  if (savedHistory) setHistory(JSON.parse(savedHistory));
}, []);
  // Check backend connection when useBackend changes
  // Check backend connection when useBackend changes
useEffect(() => {
  if (useBackend === 'backend' && isAuthenticated) {
    setBackendStatus('checking');
    backendApi.testConnection()
      .then(isConnected => {
        setBackendStatus(isConnected ? 'connected' : 'disconnected');
      })
      .catch(() => setBackendStatus('disconnected'));
  } else if (useBackend === 'mock') {
    setBackendStatus('connected'); // Mock is always connected
  } else {
    setBackendStatus('disconnected');
  }
}, [useBackend, isAuthenticated]);

  // Check backend connection on mount and when useBackend changes
  useEffect(() => {
    if (useBackend) {
      setBackendStatus('checking');
      backendApi.testConnection()
        .then(isConnected => {
          setBackendStatus(isConnected ? 'connected' : 'disconnected');
          if (isConnected) {
            // Load tables and history from backend
            backendApi.getTables().then(({ tables }) => {
              // Convert backend tables to frontend format
              const frontendTables: TableInfo[] = tables.map(t => ({
                name: t.name,
                columns: t.columns,
                rowCount: t.rowCount,
                fileName: t.fileName
              }));
              setTables(frontendTables);
            });

            backendApi.getHistory().then(({ history }) => {
              const frontendHistory: HistoryItem[] = history.map(h => ({
                id: h.id,
                query: h.query,
                sql: h.sql,
                timestamp: new Date(h.timestamp).getTime()
              }));
              setHistory(frontendHistory);
            });
          }
        })
        .catch(() => setBackendStatus('disconnected'));
    } else {
      setBackendStatus('disconnected');
    }
  }, [useBackend]);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  setIsUploading(true);
  try {
    const newTables: TableInfo[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // ALWAYS use Local SQL.js logic (simple, no modes)
      const tableName = `table_${tables.length + i + 1}`;
      const info = await loadFileToTable(file, tableName, cleanOption, customVal);
      newTables.push(info);
    }
    
    setTables(prev => [...prev, ...newTables]);
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Upload failed. Ensure files are valid CSV or XLSX format.");
  } finally {
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};
  const handleRunAnalysis = async () => {
    if (mode === 'agent') {
      if (!userInput.trim()) return;
      setIsLoading(true);
      setResult(null);

      try {
        const schema = await getDbSchema();
        const sampleRes = tables.length > 0
          ? await executeSql(`SELECT * FROM ${tables[0].name} LIMIT 5`)
          : { values: [] };

        const analysis = await processAgentRequest(userInput, schema, sampleRes.values);
        const dbResult = await executeSql(analysis.sql);

        const finalOutput: QueryResult = {
          ...dbResult,
          explanation: analysis.explanation,
          insights: analysis.insights,
          sql: analysis.sql
        };

        setResult(finalOutput);

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          query: userInput,
          sql: analysis.sql,
          timestamp: Date.now()
        };
        const newHistory = [newItem, ...history.slice(0, 19)];
        setHistory(newHistory);
        localStorage.setItem('insight_history_v2', JSON.stringify(newHistory));
      } catch (err: any) {
        alert(err.message || "Analytics engine error.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!rawSql.trim()) return;
      setIsLoading(true);
      try {
        const dbResult = await executeSql(rawSql);
        setResult(dbResult);
      } catch (err: any) {
        alert(`SQL Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExport = () => {
    if (!result) return;
    const csvContent = [
      result.columns.join(','),
      ...result.values.map(v => v.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_export_${Date.now()}.csv`;
    link.click();
  };
  // Show login screen if not authenticated
  // Only require login for Mock or Backend modes

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 selection:bg-indigo-100">
      <Sidebar
        tables={tables}
        history={history}
        onClearHistory={() => { setHistory([]); localStorage.removeItem('insight_history_v2'); }}
        onSelectHistory={(item) => {
          setUserInput(item.query);
          setRawSql(item.sql);
          setMode(item.sql ? 'server' : 'agent');
          setIsSidebarOpen(false);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
        {/* Professional Copyright Banner */}
        <div className="w-full bg-slate-900 py-2 px-4 flex justify-center items-center gap-2 overflow-hidden border-b border-indigo-500/20 shadow-md z-40">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] md:text-xs font-semibold tracking-wide text-slate-200">
              © copyright all rights reserved for any technical advice or inquiries contact <a href="mailto:ahmedmohamedkhairy123@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2 decoration-indigo-500/40">ahmedmohamedkhairy123@gmail.com</a>
            </span>
          </div>
        </div>


        {/* Responsive Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <LayoutDashboard size={20} className="text-indigo-600 hidden sm:block" />
                Intelligence Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
  <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
    <button
      onClick={() => setMode('agent')}
      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${mode === 'agent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      <Sparkles size={14} /> AI Analyst
    </button>
    <button
      onClick={() => setMode('server')}
      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${mode === 'server' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      <Terminal size={14} /> SQL Editor
    </button>
  </div>
  
  

  {/* Login/Logout Buttons */}
 {!isAuthenticated ? (
  <div className="flex gap-1">
    <button
      onClick={() => {
        setLoginMode('login');
        setShowLoginModal(true);
      }}
      className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors"
    >
      Login
    </button>
    <button
      onClick={() => {
        setLoginMode('signup');
        setShowLoginModal(true);
      }}
      className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 transition-colors"
    >
      Sign Up
    </button>
  </div>
) : (
  <button
    onClick={() => {
      authApi.logout();
      setIsAuthenticated(false);
    }}
    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-bold transition-all"
  >
    Logout
  </button>
)}
</div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Action Center: Upload & Prompt */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Upload & Data Config */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Database size={16} /> Data Input
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    N/A:
                    <select
                      value={cleanOption}
                      onChange={(e) => setCleanOption(e.target.value as CleanOption)}
                      className="bg-transparent border-none focus:ring-0 cursor-pointer text-indigo-600"
                    >
                      <option value={CleanOption.NONE}>IGNORE</option>
                      <option value={CleanOption.ZERO}>ZERO</option>
                      <option value={CleanOption.DROP}>DROP</option>
                    </select>
                  </div>
                </div>

                <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group">
                  <input ref={fileInputRef} type="file" multiple accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                  <div className="text-center p-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="text-indigo-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Import CSV/XLSX</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Cloud-native sync</p>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
                      <div className="flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-indigo-600" />
                        <span className="text-xs font-bold">Mapping...</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Right: Analysis Prompt */}
            <div className="xl:col-span-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                  {mode === 'agent' ? <MessageSquare size={16} /> : <Terminal size={16} />}
                  {mode === 'agent' ? 'Prompt Intelligence' : 'Direct SQL Control'}
                </h2>
                <div className="relative flex-1">
                  <textarea
                    value={mode === 'agent' ? userInput : rawSql}
                    onChange={(e) => mode === 'agent' ? setUserInput(e.target.value) : setRawSql(e.target.value)}
                    placeholder={mode === 'agent' ? "Ask anything about your data... e.g., 'What is the correlation between price and demand?'" : "Enter raw SQL query..."}
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-sm md:text-base placeholder:text-slate-400"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleRunAnalysis}
                      disabled={isLoading || tables.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 group text-sm"
                    >
                      {isLoading ? (
                        <><RefreshCw size={16} className="animate-spin" /> Analyzing...</>
                      ) : (
                        <><Play size={16} className="group-hover:translate-x-0.5 transition-transform" /> {mode === 'agent' ? 'Generate Insight' : 'Execute'}</>
                      )}
                    </button>
                  </div>
                </div>
                {tables.length === 0 && (
                  <div className="mt-3 space-y-2">
                    {/* Warning 1: No Files Uploaded */}
                    <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100 flex items-center gap-2">
                      <AlertCircle size={12} /> Data connection required. Please upload files.
                    </p>

                    {/* Warning 2: Backend Disconnected (Only shows if useBackend is true) */}
                    {useBackend && backendStatus === 'disconnected' && (
                      <p className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100 flex items-center gap-2">
                        <AlertCircle size={12} /> Backend server not connected. Start backend with: cd backend && npm run dev
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Results Display */}
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Intelligence Summary Cards */}
              {result.explanation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logic Explanation */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                      <BrainCircuit size={16} /> Logic Strategy
                    </h3>
                    <p className="text-slate-700 text-base md:text-lg leading-relaxed font-medium">
                      {result.explanation}
                    </p>
                    <div className="mt-6 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
  <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
    Generated SQL
  </div>
  <pre className="p-4 font-mono text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-60">
    {result.sql}
  </pre>
</div>
                  </div>

                  {/* Predictive Snapshot */}
                  {result.insights && (
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={80} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">Forward Projection</h3>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">AI Forecast</p>
                          <p className="text-sm font-bold mt-1 leading-snug">{result.insights.prediction}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Confidence</p>
                            <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${(result.insights.confidence || 0) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-lg font-mono font-bold text-emerald-400">{(result.insights.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">What-If Simulation</p>
                          <p className="text-xs font-medium text-slate-300 italic">"{result.insights.whatIf}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data Visualization */}
              <DataViz data={result} />

              {/* Tabular Output */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <TableIcon size={14} /> Result Dataset
                  </h3>
                  <button onClick={handleExport} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                    <Download size={12} /> Export
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="border-b border-slate-200 shadow-sm">
                        {result.columns.map(col => (
                          <th key={col} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {result.values.length > 0 ? (
                        result.values.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            {row.map((cell, j) => (
                              <td key={j} className="px-6 py-3.5 text-sm font-medium text-slate-600 whitespace-nowrap group-hover:text-indigo-600 transition-colors">
                                {cell !== null ? String(cell) : <span className="text-slate-300 italic text-xs">null</span>}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={result.columns.length} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                            No matching records found. Try adjusting your query parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : !isLoading && tables.length > 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <BarChart3 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Connection Established</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                Your tables are indexed and ready for analysis. Type a question or select a quick query to begin.
              </p>
            </div>
          ) : null}
        </div>
      </main>
      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        mode={loginMode}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setShowLoginModal(false);
        }}
      />
    </div>
  );
};

export default App;
