import React, { useMemo, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
    ComposedChart, Label
} from 'recharts'
import { QueryResult } from '../types'

interface DataVizProps {
    data: QueryResult
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#8b5cf6']

const DataViz: React.FC<DataVizProps> = ({ data }) => {
    const [chartType, setChartType] = useState<'auto' | 'bar' | 'line' | 'pie' | 'area' | 'scatter'>('auto')
    const { columns, values } = data

    // Transform data for charts
    const chartData = useMemo(() => {
        return values.slice(0, 100).map(v => {
            const obj: any = {}
            columns.forEach((col, i) => {
                const val = v[i]
                // Try to convert to number if possible
                if (val !== null && val !== undefined) {
                    const numVal = Number(val)
                    obj[col] = isNaN(numVal) ? val : numVal
                } else {
                    obj[col] = null
                }
            })
            return obj
        })
    }, [columns, values])

    // Heuristics for chart selection
    const numericCols = useMemo(() => {
        return columns.filter((col, i) => {
            if (values.length === 0) return false
            const sampleVal = values[0][i]
            if (sampleVal === null || sampleVal === undefined) return false
            return !isNaN(Number(sampleVal))
        })
    }, [columns, values])

    const stringCols = useMemo(() => {
        return columns.filter((col, i) => {
            if (values.length === 0) return false
            const sampleVal = values[0][i]
            if (sampleVal === null || sampleVal === undefined) return true
            return isNaN(Number(sampleVal))
        })
    }, [columns, values])

    // Determine best chart type
    const determineChartType = (): 'bar' | 'line' | 'pie' | 'area' | 'scatter' => {
        if (chartType !== 'auto') return chartType

        if (chartData.length === 0) return 'bar'

        // Pie chart for small datasets with categorical data
        if (chartData.length <= 5 && stringCols.length > 0 && numericCols.length === 1) {
            return 'pie'
        }

        // Line chart for time series or many data points
        if (chartData.length > 15) {
            return 'line'
        }

        // Area chart for cumulative data
        if (numericCols.length === 1 && chartData.length > 5) {
            return 'area'
        }

        // Default to bar chart
        return 'bar'
    }

    const selectedChartType = determineChartType()

    // Find best columns for visualization
    const xAxisCol = stringCols[0] || numericCols[0] || columns[0]
    const yAxisCols = numericCols.length > 0 ? numericCols : [columns[0]]

    if (chartData.length === 0 || columns.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-slate-600">No data available for visualization</p>
            </div>
        )
    }

    const renderChart = () => {
        switch (selectedChartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey={yAxisCols[0]}
                            nameKey={xAxisCol}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, yAxisCols[0]]} />
                        <Legend />
                    </PieChart>
                )

            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey={xAxisCol}
                            tick={{ fontSize: 10 }}
                            stroke="#94a3b8"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {yAxisCols.slice(0, 4).map((col, idx) => (
                            <Line
                                key={col}
                                type="monotone"
                                dataKey={col}
                                stroke={COLORS[idx % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                )

            case 'area':
                return (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey={xAxisCol} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {yAxisCols.slice(0, 3).map((col, idx) => (
                            <Area
                                key={col}
                                type="monotone"
                                dataKey={col}
                                stroke={COLORS[idx % COLORS.length]}
                                fill={COLORS[idx % COLORS.length]}
                                fillOpacity={0.3}
                            />
                        ))}
                    </AreaChart>
                )

            case 'scatter':
                return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            dataKey={yAxisCols[0] || columns[0]}
                            name={yAxisCols[0] || columns[0]}
                            tick={{ fontSize: 10 }}
                            stroke="#94a3b8"
                        />
                        <YAxis
                            type="number"
                            dataKey={yAxisCols[1] || columns[1]}
                            name={yAxisCols[1] || columns[1]}
                            tick={{ fontSize: 10 }}
                            stroke="#94a3b8"
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Data Points" data={chartData} fill="#4f46e5" />
                    </ScatterChart>
                )

            default: // bar chart
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey={xAxisCol}
                            tick={{ fontSize: 10 }}
                            stroke="#94a3b8"
                            angle={xAxisCol.length > 10 ? -45 : 0}
                            textAnchor={xAxisCol.length > 10 ? 'end' : 'middle'}
                            height={xAxisCol.length > 10 ? 60 : 40}
                        />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        {yAxisCols.slice(0, 6).map((col, idx) => (
                            <Bar
                                key={col}
                                dataKey={col}
                                fill={COLORS[idx % COLORS.length]}
                                radius={[4, 4, 0, 0]}
                                name={col}
                            />
                        ))}
                    </BarChart>
                )
        }
    }

    const getChartName = (type: string) => {
        const names: Record<string, string> = {
            bar: 'Bar Chart',
            line: 'Line Chart',
            pie: 'Pie Chart',
            area: 'Area Chart',
            scatter: 'Scatter Plot'
        }
        return names[type] || 'Visualization'
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        📈 Visual Insight
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {chartData.length} rows, {columns.length} columns
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-medium text-slate-600">Chart Type:</span>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as any)}
                            className="text-xs font-bold text-indigo-600 bg-transparent border-none focus:ring-0 cursor-pointer"
                        >
                            <option value="auto">Auto Select</option>
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="area">Area Chart</option>
                            <option value="scatter">Scatter Plot</option>
                        </select>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1.5 rounded">
                        {getChartName(selectedChartType)}
                    </div>
                </div>
            </div>

            <div className="h-80 w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        No data to visualize
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Data Points</p>
                        <p className="text-lg font-bold text-slate-800">{chartData.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Numeric Columns</p>
                        <p className="text-lg font-bold text-slate-800">{numericCols.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Chart Type</p>
                        <p className="text-lg font-bold text-slate-800">{getChartName(selectedChartType)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Auto Detection</p>
                        <p className="text-lg font-bold text-slate-800">{chartType === 'auto' ? '✓ On' : '✗ Off'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataViz