'use client';

import React, { useMemo, useState } from 'react';
import WatchlistStockChip from './WatchlistStockChip';
import { Button } from '@/components/ui/button';
import { ArrowDownAZ, ArrowUpDown, ArrowUpZA } from 'lucide-react';
import { WatchlistItem } from '@/database/models/watchlist.model';

interface WatchlistManagerProps {
    initialItems: WatchlistItem[];
    userId: string;
}

export default function WatchlistManager({ initialItems, userId }: WatchlistManagerProps) {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const toggleSort = () => {
        if (sortOrder === null) setSortOrder('asc');
        else if (sortOrder === 'asc') setSortOrder('desc');
        else setSortOrder(null);
    };

    const sortedItems = useMemo(() => {
        if (!sortOrder) return initialItems;

        return [...initialItems].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.symbol.localeCompare(b.symbol);
            }
            return b.symbol.localeCompare(a.symbol);
        });
    }, [initialItems, sortOrder]);

    const watchlistSymbols = sortedItems.map((item) => item.symbol);

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                        <span className="mr-2">Manage Symbols</span>
                        <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                            {watchlistSymbols.length}
                        </span>
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSort}
                        className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                        title={
                            sortOrder === 'asc'
                                ? 'Sorted A-Z'
                                : sortOrder === 'desc'
                                    ? 'Sorted Z-A'
                                    : 'Default Order'
                        }
                    >
                        {sortOrder === 'asc' && <ArrowDownAZ className="w-4 h-4 mr-2" />}
                        {sortOrder === 'desc' && <ArrowUpZA className="w-4 h-4 mr-2" />}
                        {sortOrder === null && <ArrowUpDown className="w-4 h-4 mr-2" />}
                        <span className="text-xs">
                            {sortOrder === 'asc'
                                ? 'A-Z'
                                : sortOrder === 'desc'
                                    ? 'Z-A'
                                    : 'Sort'}
                        </span>
                    </Button>
                </div>

                {watchlistSymbols.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {sortedItems.map((item) => (
                            <WatchlistStockChip
                                key={item.symbol}
                                symbol={item.symbol}
                                userId={userId}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No stocks in watchlist.</p>
                )}
            </div>

            <div className="bg-gray-900/20 rounded-xl border border-gray-800 p-5">
                <h3 className="text-base font-semibold text-white mb-2">What this page is for</h3>
                <p className="text-sm text-gray-400 leading-6">
                    Use this space to keep your saved symbols organized and create simple price alerts. The watchlist is intentionally focused on quick symbol management instead of a second full-screen chart workspace.
                </p>
            </div>
        </div>
    );
}
