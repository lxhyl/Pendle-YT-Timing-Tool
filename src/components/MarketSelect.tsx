import {getActiveMarkets, type Market} from "@/api/pendle"
import {chainsArray} from "@/constant/chain"
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "./ui/input"


export function MarketSelect() {
    const [selectedChain, setSelectedChain] = useState<string>(chainsArray[0]?.chainId.toString() || "1")
    const [markets, setMarkets] = useState<Market[]>([])
    const [selectedMarket, setSelectedMarket] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        getActiveMarkets(Number(selectedChain)).then((d) => {
            console.log("markets", d)
            setMarkets(d)
            setSelectedMarket("") // Reset selected market when chain changes
            setIsLoading(false)
        }).catch((error) => {
            console.error("Failed to fetch markets:", error)
            setIsLoading(false)
        })
    }, [selectedChain])

    // Filter markets based on search term
    const filteredMarkets = markets.filter(market =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.underlyingAsset.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="w-full max-w-md space-y-4">
            {/* Chain Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Chain</label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger>
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

            {/* Market Selector with Search */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Market</label>
                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                    <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder={isLoading ? "Loading markets..." : "Select a market"} />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Search Input */}
                        <div className="p-2">
                            <Input
                                placeholder="Search markets..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        
                        {/* Market Items */}
                        {filteredMarkets.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                                {searchTerm ? "No markets found" : "No markets available"}
                            </div>
                        ) : (
                            filteredMarkets.map((market) => (
                                <SelectItem key={market.address} value={market.address.toString()}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{market.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {market.underlyingAsset} • Expires: {market.expiry}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Selected Market Info */}
            {selectedMarket && (
                <div className="p-3 bg-muted rounded-md">
                    <h4 className="font-medium text-sm">Selected Market:</h4>
                    {(() => {
                        const market = markets.find(m => m.address.toString() === selectedMarket)
                        if (!market) return null
                        
                        return (
                            <div className="mt-2 space-y-1 text-sm">
                                <div><strong>Name:</strong> {market.name}</div>
                                <div><strong>Underlying:</strong> {market.underlyingAsset}</div>
                                <div><strong>Expiry:</strong> {market.expiry}</div>
                                <div><strong>PT:</strong> {market.pt}</div>
                                <div><strong>YT:</strong> {market.yt}</div>
                                <div><strong>SY:</strong> {market.sy}</div>
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}