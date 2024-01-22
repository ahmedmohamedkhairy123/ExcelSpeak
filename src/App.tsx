import React from 'react'

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="bg-white p-12 rounded-3xl shadow-2xl border border-blue-100 text-center max-w-md">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    ExcelSpeak
                </h1>
                <p className="text-slate-600 mb-2">AI-powered Data Analytics Platform</p>
                <p className="text-sm text-slate-500 mb-6">Phase 2: React + TypeScript Setup Complete</p>
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100">
                    ✓ Project structure created successfully
                </div>
            </div>
        </div>
    )
}

export default App