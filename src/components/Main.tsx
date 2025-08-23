import { useState } from 'react';
import { chainsArray } from '../constant/chain';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { MarketSelect } from './MarketSelect';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getTransactionsAll } from '@/api/pendle';
import type { Market } from '@/api/pendle';
import { compute } from '@/compute';
import { Chart } from './Chart';

export function From() {
    const [selectedChain, setSelectedChain] = useState<string>(chainsArray[0]?.chainId.toString() || "1");
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [underlyingAmount, setUnderlyingAmount] = useState<number>(1500);
    const [pointsPerDay, setPointsPerDay] = useState<number>(1);
    const [pendleMultiplier, setPendleMultiplier] = useState<number>(36);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChainChange = (value: string) => {
        setSelectedChain(value);
    };
    const simulate = async () => {
        if (!selectedMarket) return;
        
        setIsLoading(true);
        try {
            const txs = await getTransactionsAll(selectedChain, selectedMarket.address.toString());
            console.log(txs);
            
            const { tTimes, ytPrice, points, weightedImplied, maturityDate } = compute({
                transactions: txs,
                maturity: selectedMarket.expiry,
                underlyingAmount,
                pointsPerDayPerUnderlying: pointsPerDay,
                multiplier: pendleMultiplier
            });
            
            console.log("res", tTimes, ytPrice, points, weightedImplied, maturityDate);
            
            // Prepare chart data
            const chartData = tTimes.map((time, index) => ({
                time: time.toISOString(), // Use ISO string for proper sorting
                ytPrice: ytPrice[index] || 0,
                points: points[index] || 0,
                fairValue: Math.pow(1 + (weightedImplied || 0), (maturityDate.getTime() - time.getTime()) / (1000 * 60 * 60 * 24 * 365)) - 1
            }));
            
            setChartData(chartData);
        } catch (error) {
            console.error('Simulation failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (  
        <div className='space-y-8'>
            <div className='flex items-center gap-4 flex-wrap'>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Chain</label>
                    <Select value={selectedChain} onValueChange={handleChainChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select a chain" />
                        </SelectTrigger>
                        <SelectContent>
                            {chainsArray.map((chain) => (
                                <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                                    {chain.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Market</label>
                    <MarketSelect selectedChain={selectedChain} selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket} />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Underlying Amount</label>
                    <Input
                        type="number"
                        value={underlyingAmount}
                        onChange={(e) => setUnderlyingAmount(Number(e.target.value))}
                        placeholder="1500"
                        className="w-40"
                        min="0"
                    />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Points/Day</label>
                    <Input
                        type="number"
                        value={pointsPerDay}
                        onChange={(e) => setPointsPerDay(Number(e.target.value))}
                        placeholder="1"
                        className="w-40"
                        min="0"
                    />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Pendle Multiplier</label>
                    <Input
                        type="number"
                        value={pendleMultiplier}
                        onChange={(e) => setPendleMultiplier(Number(e.target.value))}
                        placeholder="36"
                        className="w-40"
                        min="0"
                    />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-foreground whitespace-nowrap'>Simulate</label>
                                            <Button 
                            className="px-12 py-3 text-base font-semibold"
                            onClick={simulate}
                            disabled={isLoading || !selectedMarket}
                        >
                            {isLoading ? 'Running...' : 'Run'}
                        </Button>
                </div>
            </div>
            
            {/* Chart Display */}
            {chartData.length > 0 && selectedMarket && (
                <div className="mt-8">
                    <Chart 
                        data={chartData}
                        marketName={selectedMarket.name}
                        underlyingAmount={underlyingAmount}
                        chainName={chainsArray.find(chain => chain.chainId.toString() === selectedChain)?.name || 'Unknown'}
                    />
                </div>
            )}
        </div>
    );
}