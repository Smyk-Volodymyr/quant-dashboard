"use client";

import React, { useEffect } from "react";
import { Trade } from "@/hooks/useTradeStream";
import { X, Target, Clock, ArrowRight, Activity, Zap } from "lucide-react";

interface TradeDrawerProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeDrawer: React.FC<TradeDrawerProps> = ({ trade, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !trade) return null;

  const isProfit = trade.pnl_usdt >= 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative w-full max-w-md h-full bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#000000]/50">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isProfit ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <Target size={20} />
            </div>
            <div>
              <h2 id="drawer-title" className="font-bold text-lg font-mono text-white leading-none">
                {trade.symbol}
              </h2>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${trade.direction === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                {trade.direction}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Закрити панель"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <div className="flex flex-col items-center justify-center py-8 bg-[#000000]/30 border border-white/5 rounded-2xl">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Realized PnL</span>
            <div className={`text-4xl font-mono font-bold tracking-tighter ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{Number(trade.pnl_usdt).toFixed(2)} USDT
            </div>
            <div className={`text-sm font-mono mt-1 ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
              ({isProfit ? '+' : ''}{Number(trade.pnl_percent).toFixed(2)}%)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailCard
              label="Entry Price"
              value={`$${Number(trade.entry_price)}`}
              subValue={new Date(trade.entry_time).toLocaleTimeString()}
            />
            <DetailCard
              label="Exit Price"
              value={`$${Number(trade.exit_price)}`}
              subValue={new Date(trade.exit_time).toLocaleTimeString()}
            />
          </div>

          <div className="h-px bg-white/5 w-full my-4" />

          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Execution Context</h3>

            <div className="flex items-center justify-between p-3 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center text-slate-400">
                <Activity size={16} className="mr-2" />
                <span className="text-sm font-mono">Close Reason</span>
              </div>
              <span className="font-mono text-sm font-bold text-white bg-white/10 px-2 py-1 rounded">
                {trade.close_reason || "MANUAL"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center text-slate-400">
                <Zap size={16} className="mr-2 text-yellow-500/70" />
                <span className="text-sm font-mono">Order Book Imbalance (OBI)</span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {Number(trade.obi).toFixed(4)}
              </span>
            </div>
          </div>

        </div>

        <footer className="p-6 border-t border-white/5 bg-[#000000]/50">
          <p className="text-[10px] text-slate-600 font-mono uppercase text-center tracking-widest">
            Trade ID: <span className="opacity-50">{trade.id}</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

function DetailCard({ label, value, subValue }: { label: string, value: string, subValue: string }) {
  return (
    <div className="bg-[#000000]/30 border border-white/5 rounded-xl p-4 flex flex-col">
      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-lg font-mono font-bold text-slate-200">{value}</span>
      <span className="text-xs font-mono text-slate-600 mt-1 flex items-center">
        <Clock size={12} className="mr-1" /> {subValue}
      </span>
    </div>
  );
}