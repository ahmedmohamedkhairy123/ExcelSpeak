import React, { RefObject } from 'react'
import { CleanOption } from '../types'

interface UploadSectionProps {
    cleanOption: CleanOption
    setCleanOption: (opt: CleanOption) => void
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: RefObject<HTMLInputElement | null>  // Changed to accept null
    isUploading: boolean
}

const UploadSection: React.FC<UploadSectionProps> = ({
    cleanOption,
    setCleanOption,
    handleFileUpload,
    fileInputRef,
    isUploading
}) => {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    📁 Data Input
                </h2>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    On Error:
                    <select
                        value={cleanOption}
                        onChange={(e) => setCleanOption(e.target.value as CleanOption)}
                        className="bg-transparent border-none focus:ring-0 cursor-pointer text-indigo-600 font-bold outline-none ml-1"
                    >
                        <option value={CleanOption.NONE}>IGNORE</option>
                        <option value={CleanOption.ZERO}>ZERO</option>
                        <option value={CleanOption.DROP}>DROP</option>
                    </select>
                </div>
            </div>

            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all cursor-pointer group overflow-hidden">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    onChange={handleFileUpload}
                />

                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="text-center p-4 relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <div className="text-2xl">➕</div>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Import CSV/XLSX</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">Drag & Drop or Click</p>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-2xl z-20 backdrop-blur-sm">
                        <div className="animate-spin text-indigo-600 mb-2 text-2xl">🔄</div>
                        <span className="text-xs font-bold text-slate-600 animate-pulse">Processing Data...</span>
                    </div>
                )}
            </label>
        </div>
    )
}

export default UploadSection