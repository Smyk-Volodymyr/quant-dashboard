import React, { useRef, memo, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Trade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  pnl_usdt: number;
  exit_time: string;
}

interface RecentTradesTableProps {
  trades: Trade[];
}

export const RecentTradesTable: React.FC<RecentTradesTableProps> = memo(({ trades }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Стан фільтрів
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [filterProfit, setFilterProfit] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');

  // Стан пагінації
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50; // Кількість угод на одну сторінку

  // 1. Отримуємо унікальні монети для Dropdown
  const uniqueSymbols = useMemo(() => {
    const symbols = new Set(trades.map(t => t.symbol));
    return Array.from(symbols).sort();
  }, [trades]);

  // 2. Застосовуємо фільтри (Мемоізовано для продуктивності)
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchSymbol = filterSymbol === 'ALL' || t.symbol === filterSymbol;
      const matchProfit = filterProfit === 'ALL'
        || (filterProfit === 'PROFIT' && t.pnl_usdt > 0)
        || (filterProfit === 'LOSS' && t.pnl_usdt <= 0);
      return matchSymbol && matchProfit;
    });
  }, [trades, filterSymbol, filterProfit]);

  // 3. Застосовуємо пагінацію
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrades.slice(start, start + itemsPerPage);
  }, [filteredTrades, currentPage, itemsPerPage]);

  // Скидаємо на 1 сторінку, якщо змінилися фільтри
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterSymbol, filterProfit]);

  // Ініціалізація віртуалізатора (працює з пагінованими даними)
  const rowVirtualizer = useVirtualizer({
    count: paginatedTrades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 57,
    overscan: 5,
  });

  return (
    <div className="w-full flex flex-col h-full bg-[#09090b] text-sm">

      {/* TOOLBAR: Фільтри */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Filter size={16} className="text-slate-500" aria-hidden="true" />

          <select
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            aria-label="Фільтр за монетою"
            className="bg-[#09090b] border border-slate-700 text-slate-300 text-xs rounded outline-none focus:ring-1 focus:ring-blue-500 py-1.5 px-2"
          >
            <option value="ALL">All Pairs</option>
            {uniqueSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>

          <select
            value={filterProfit}
            onChange={(e) => setFilterProfit(e.target.value as any)}
            aria-label="Фільтр за профітом"
            className="bg-[#09090b] border border-slate-700 text-slate-300 text-xs rounded outline-none focus:ring-1 focus:ring-blue-500 py-1.5 px-2"
          >
            <option value="ALL">All PnL</option>
            <option value="PROFIT">Winners Only</option>
            <option value="LOSS">Losers Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {paginatedTrades.length} of {filteredTrades.length}
        </div>
      </div>

      {/* HEADER (Зафіксований) */}
      <div role="rowgroup" className="flex sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs text-slate-400 uppercase font-medium">
        <div role="columnheader" className="px-6 py-3 w-[20%]">Time</div>
        <div role="columnheader" className="px-6 py-3 w-[20%]">Pair</div>
        <div role="columnheader" className="px-6 py-3 w-[15%]">Side</div>
        <div role="columnheader" className="px-6 py-3 w-[25%]">Entry / Exit</div>
        <div role="columnheader" className="px-6 py-3 w-[20%] text-right">PnL (USDT)</div>
      </div>

      {/* BODY (Віртуалізований скрол-контейнер) */}
      <div ref={parentRef} className="flex-1 overflow-auto outline-none min-h-75" tabIndex={0}>
        {paginatedTrades.length > 0 ? (
          <div
            role="rowgroup"
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
            aria-live="polite"
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const trade = paginatedTrades[virtualRow.index];
              return (
                <div
                  key={trade.id}
                  role="row"
                  className="flex items-center absolute top-0 left-0 w-full border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                  style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div role="cell" className="px-6 py-4 w-[20%] text-slate-400 font-mono tabular-nums">
                    {new Date(trade.exit_time).toLocaleTimeString()}
                  </div>
                  <div role="cell" className="px-6 py-4 w-[20%] font-bold text-slate-200">
                    {trade.symbol}
                  </div>
                  <div role="cell" className="px-6 py-4 w-[15%]">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${trade.direction === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      {trade.direction}
                    </span>
                  </div>
                  <div role="cell" className="px-6 py-4 w-[25%] font-mono text-slate-300 tabular-nums">
                    {Number(trade.entry_price)} <span className="text-slate-600 px-1">→</span> {Number(trade.exit_price)}
                  </div>
                  <div role="cell" className={`px-6 py-4 w-[20%] text-right font-mono font-bold tabular-nums ${trade.pnl_usdt >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {trade.pnl_usdt > 0 ? '+' : ''}{Number(trade.pnl_usdt).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            {trades.length === 0 ? "Очікування перших угод..." : "За цими фільтрами угод не знайдено."}
          </div>
        )}
      </div>

      {/* FOOTER: Пагінація */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} className="mr-1" /> Prev
          </button>

          <span className="text-xs text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
});

RecentTradesTable.displayName = 'RecentTradesTable';