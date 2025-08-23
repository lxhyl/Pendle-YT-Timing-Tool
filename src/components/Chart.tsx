import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface ChartData {
    time: string;
    ytPrice: number;
    points: number;
    fairValue: number;
}

interface ChartProps {
    data: ChartData[];
    marketName: string;
    underlyingAmount: number;
    chainName: string;
}

export function Chart({ data, marketName, underlyingAmount, chainName }: ChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available for chart
            </div>
        );
    }

                // Format data for Recharts and sort by time
            const sortedData = data
                .map((item, index) => ({
                    time: new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    ytPrice: item.ytPrice,
                    points: item.points,
                    fairValue: item.fairValue
                }))
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            // Sample data to reduce points for smoother curves
            const sampleSize = Math.min(100, sortedData.length); // Max 100 points
            const step = Math.max(1, Math.floor(sortedData.length / sampleSize));
            const chartData = sortedData.filter((_, index) => index % step === 0);

    return (
        <div className="w-full bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-center mb-6 text-foreground">
                {marketName} on {chainName} [{underlyingAmount} underlying coin]
            </h3>
            
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    
                    {/* X Axis - Time */}
                    <XAxis 
                        dataKey="time" 
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                    />
                    
                    {/* Left Y Axis - YT Price */}
                    <YAxis 
                        yAxisId="left"
                        orientation="left"
                        label={{ value: 'YT Price', angle: -90, position: 'insideLeft', fill: '#888888' }}
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                        domain={[0, 'dataMax + 0.01']}
                        tickFormatter={(value) => value.toFixed(4)}
                    />
                    
                    {/* Right Y Axis - Points */}
                    <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Points earned if bought at this time until maturity', angle: 90, position: 'insideRight', fill: '#888888' }}
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                        domain={[0, 'dataMax + 20000000']}
                        tickFormatter={(value) => {
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                            }
                            return value.toString();
                        }}
                    />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: any, name: string) => {
                            if (name === 'Points earned if bought at this time until maturity') {
                                const numValue = Number(value);
                                if (numValue >= 1000000) {
                                    return [`${(numValue / 1000000).toFixed(2)}M`, name];
                                } else if (numValue >= 1000) {
                                    return [`${(numValue / 1000).toFixed(2)}K`, name];
                                }
                                return [value, name];
                            }
                            if (name === 'YT Price' || name === 'Fair Value Curve of YT') {
                                const numValue = Number(value);
                                return [numValue.toFixed(4), name];
                            }
                            return [value, name];
                        }}
                    />
                    
                    <Legend 
                        wrapperStyle={{ 
                            paddingTop: '20px',
                            color: '#ffffff'
                        }}
                    />
                    
                    {/* YT Price Line - Blue */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ytPrice"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        dot={false}
                        name="YT Price"
                    />
                    
                    {/* Points Line - Orange */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="points"
                        stroke="#f97316"
                        strokeWidth={1.5}
                        dot={false}
                        name="Points earned if bought at this time until maturity"
                    />
                    
                    {/* Fair Value Curve - Green Dotted */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="fairValue"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Fair Value Curve of YT"
                    />
                </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 text-sm text-muted-foreground text-center">
                在 yt 价格低于公平价值曲线时购买以最大化积分
            </div>
        </div>
    );
}
