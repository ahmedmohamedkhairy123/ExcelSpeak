import React from 'react'
import { RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <RefreshCw className={`${sizeClasses[size]} text-indigo-600 animate-spin mb-3`} />
            <p className={`${textSizes[size]} text-slate-600 font-medium`}>{text}</p>
        </div>
    )
}

export default LoadingSpinner