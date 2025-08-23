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

export function From() {
    const [selectedChain, setSelectedChain] = useState<string>(chainsArray[0]?.chainId.toString() || "1");

    const handleChainChange = (value: string) => {
        setSelectedChain(value);
    };

    return (  
        <div className='flex'>
            <Select value={selectedChain} onValueChange={handleChainChange}>
                <SelectTrigger className="w-40 mt-2">
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
            {/* <MarketSelect></MarketSelect> */}
        </div>
    
    );
}