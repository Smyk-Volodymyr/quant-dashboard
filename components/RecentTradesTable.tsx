"use client";

import React, { useRef, useState, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Filter } from 'lucide-react';
import { TradeDrawer } from './TradeDrawer';
import { Trade } from '@/hooks/useTradeStream';

interface RecentTradesTableProps {
  trades: Trade[];
  totalCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  loadMore: () => void;
  filterSymbol: string;
  setFilterSymbol: (s: string) => void;
  filterProfit: string;
  setFilterProfit: (s: 'ALL' | 'PROFIT' | 'LOSS') => void;
}

export const RecentTradesTable: React.FC<RecentTradesTableProps> = memo(({
  trades, totalCount, isLoading, isFetchingNextPage, hasMore, loadMore,
  filterSymbol, setFilterSymbol, filterProfit, setFilterProfit
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 57,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= trades.length - 5 &&
      hasMore &&
      !isFetchingNextPage
    ) {
      loadMore();
    }
  }, [virtualItems, trades.length, hasMore, isFetchingNextPage, loadMore]);

  return (
    <div className="w-full flex flex-col h-full bg-[#09090b] text-sm relative">

      {/* Фільтри */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Filter size={16} className="text-slate-500" />

          <select
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="bg-[#09090b] border border-slate-700 text-slate-300 text-xs rounded py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Pairs</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>

          <select
            value={filterProfit}
            onChange={(e) => setFilterProfit(e.target.value as any)}
            className="bg-[#09090b] border border-slate-700 text-slate-300 text-xs rounded py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All PnL</option>
            <option value="PROFIT">Winners Only</option>
            <option value="LOSS">Losers Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Loaded {trades.length} of {totalCount}
        </div>
      </div>

      {/* Заголовки таблиці */}
      <div className="flex sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs text-slate-400 uppercase font-medium shrink-0">
        <div className="px-6 py-3 w-[20%]">Time</div>
        <div className="px-6 py-3 w-[20%]">Pair</div>
        <div className="px-6 py-3 w-[15%]">Side</div>
        <div className="px-6 py-3 w-[25%]">Entry / Exit</div>
        <div className="px-6 py-3 w-[20%] text-right">PnL (USDT)</div>
      </div>

      {/* Скролл контейнер */}
      <div ref={parentRef} className="flex-1 overflow-auto outline-none">
        {isLoading && trades.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500 animate-pulse font-mono">
            FETCHING_TRADES...
          </div>
        ) : trades.length > 0 ? (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {virtualItems.map((virtualRow) => {
              const trade = trades[virtualRow.index];
              return (
                <div
                  key={`${trade.id}-${virtualRow.index}`}
                  onClick={() => {
                    setSelectedTrade(trade);
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center absolute top-0 left-0 w-full border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer transition-colors"
                  style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="px-6 py-4 w-[20%] font-mono text-slate-400">{new Date(trade.exit_time).toLocaleTimeString()}</div>
                  <div className="px-6 py-4 w-[20%] font-bold text-slate-200">{trade.symbol}</div>
                  <div className="px-6 py-4 w-[15%]">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${trade.direction === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{trade.direction}</span>
                  </div>
                  <div className="px-6 py-4 w-[25%] font-mono text-slate-300">{Number(trade.entry_price)} <span className="text-slate-600 px-1">→</span> {Number(trade.exit_price)}</div>
                  <div className={`px-6 py-4 w-[20%] text-right font-mono font-bold ${trade.pnl_usdt >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnl_usdt > 0 ? '+' : ''}{Number(trade.pnl_usdt).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">Записів не знайдено</div>
        )}

        {/* Індикатор завантаження нових даних знизу списку */}
        {isFetchingNextPage && (
          <div className="py-4 text-center text-xs text-slate-500 font-mono animate-pulse">
            LOADING_MORE_DATA...
          </div>
        )}
      </div>

      <TradeDrawer trade={selectedTrade} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
});

RecentTradesTable.displayName = 'RecentTradesTable';