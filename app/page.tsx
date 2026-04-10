"use client";

import React from "react";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { useSystemState } from "@/hooks/useSystemState";
import { useTradeStream } from "@/hooks/useTradeStream";
import { Activity, Wallet, TrendingUp, ShieldAlert, Crosshair, BarChart2 } from "lucide-react";
import { BotRecoveryPanel } from "@/components/BotRecoveryPanel";
import { RecentTradesTable } from "@/components/RecentTradesTable";
import { EquityChart } from "@/components/EquityChart";
import { ManualOverridesPanel } from "@/components/ManualOverridesPanel";

export default function DashboardPage() {
  const { snapshot, chartData, analytics, isPortfolioLoading } = usePortfolioStream();
  const { sysState, isStateLoading } = useSystemState();
  const { trades, metrics, isTradesLoading } = useTradeStream();

  // Показуємо Skeleton тільки поки вантажаться критичні дані конфігу
  if (isStateLoading || isPortfolioLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-slate-500">
        <span className="animate-pulse">INITIALIZING_QUANT_CORE...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 font-sans relative overflow-x-hidden flex flex-col p-4 md:p-6 lg:p-8 gap-6">
      {/* Декоративний фон */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-tight text-white">QUANT_CORE <span className="text-blue-500 text-sm">v1.0</span></h1>
            <p className="text-xs text-slate-500 font-mono">Live Production Environment</p>
          </div>
        </div>

        {/* Статус системи */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#000000]/50 backdrop-blur-xl border border-white/5 rounded-full">
          <div className={`h-2.5 w-2.5 rounded-full ${sysState?.kill_switch_active ? 'bg-red-500 animate-pulse' : sysState?.is_running ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
            {sysState?.kill_switch_active ? 'SYSTEM HALTED' : sysState?.is_running ? 'ENGINE ONLINE' : 'ENGINE PAUSED'}
          </span>
        </div>
      </header>

      {/* KPI METRICS (Реальні дані) */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard title="Total Equity" value={`$${Number(snapshot?.total_equity || 0).toFixed(2)}`} icon={Wallet} />
        <KPICard title="Free Balance" value={`$${Number(snapshot?.free_balance || 0).toFixed(2)}`} icon={Wallet} color="text-slate-400" />
        <KPICard title="Today's PnL" value={`$${metrics.todayPnl.toFixed(2)}`} icon={TrendingUp} color={metrics.todayPnl >= 0 ? "text-green-400" : "text-red-400"} />
        <KPICard title="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} icon={Crosshair} />
        <KPICard title="Exposure" value={`${analytics.exposurePct.toFixed(1)}%`} icon={BarChart2} color="text-yellow-400" />
        <KPICard title="Max Drawdown" value={`-${analytics.maxDrawdown.toFixed(2)}%`} icon={ShieldAlert} color="text-orange-400" />
      </section>

      {/* WORKSPACE */}
      <section className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Ліва панель: Графік + Таблиця */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-[50%] bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <EquityChart data={chartData} />
          </div>
          <div className="h-[50%] bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden relative">
            <RecentTradesTable trades={trades} />
          </div>
        </div>

        {/* Права панель: Керування (Лише підключені до БД компоненти) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <BotRecoveryPanel currentBalance={sysState?.starting_balance} />
          <ManualOverridesPanel isRunning={sysState?.is_running} killSwitchActive={sysState?.kill_switch_active} />
        </aside>
      </section>
    </main>
  );
}

// Міні-компонент для KPI картки (Glassmorphism)
function KPICard({ title, value, icon: Icon, color = "text-white" }: { title: string, value: string | number, icon: any, color?: string }) {
  return (
    <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest">{title}</h3>
        <Icon size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <div className={`text-2xl font-mono font-bold tracking-tight ${color}`}>
        {value}
      </div>
    </article>
  );
}