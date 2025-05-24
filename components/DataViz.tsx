
import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { QueryResult } from '../types';

interface DataVizProps {
    data: QueryResult;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DataViz: React.FC<DataVizProps> = ({ data }) => {
    const { columns, values } = data;

    const chartData = useMemo(() => {
        return values.map(v => {
            const obj: any = {};
            columns.forEach((col, i) => {
                const val = v[i];
                obj[col] = isNaN(Number(val)) ? val : Number(val);
            });
            return obj;
        });
    }, [columns, values]);

    // Heuristics for chart selection
    const numericCols = columns.filter((_, i) => values.length > 0 && !isNaN(Number(values[0][i])));
    const stringCols = columns.filter((_, i) => values.length > 0 && isNaN(Number(values[0][i])));

    if (chartData.length === 0 || numericCols.length === 0) return null;

    const xAxis = stringCols[0] || columns[0];
    const yAxis = numericCols[0];

    // Logic to pick chart type
    let ChartType: any = BarChart;
    if (chartData.length > 15) ChartType = LineChart;
    if (chartData.length <= 5) ChartType = PieChart;

    const renderChart = () => {
        if (ChartType === PieChart) {
            return (
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey={yAxis}
                        nameKey={xAxis}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            );
        }

        const Comp = ChartType;
        return (
            <Comp data={chartData}>
                <CartGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {numericCols.map((col, idx) => (
                    ChartType === BarChart ? (
                        <Bar key={col} dataKey={col} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ) : (
                        <Line key={col} type="monotone" dataKey={col} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    )
                ))}
            </Comp>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Visual Insight</h3>
                <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">
                        Auto-Generated {ChartType.displayName || ChartType.name}
                    </span>
                </div>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const CartGrid = CartesianGrid;

export default DataViz;
