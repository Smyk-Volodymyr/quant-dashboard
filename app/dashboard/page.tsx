"use client";

import React from "react";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { useSystemState } from "@/hooks/useSystemState";
import { useTradeStream } from "@/hooks/useTradeStream";
import { Wallet, TrendingUp, ShieldAlert, Crosshair, BarChart2, Activity } from "lucide-react";
import { BotRecoveryPanel } from "@/components/BotRecoveryPanel";
import { RecentTradesTable } from "@/components/RecentTradesTable";
import { EquityChart } from "@/components/EquityChart";
import { ManualOverridesPanel } from "@/components/ManualOverridesPanel";
import { PingIndicator } from "@/components/PingIndicator";
import { WidgetErrorBoundary } from "@/components/WidgetErrorBoundary";

export default function DashboardPage() {
  const { snapshot, chartData, analytics, isPortfolioLoading } = usePortfolioStream();
  const { sysState, isStateLoading } = useSystemState();
  const { trades, metrics, isTradesLoading } = useTradeStream();

  if (isStateLoading || isPortfolioLoading) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center font-mono text-slate-500 animate-pulse">
        <Activity size={16} className="mr-3 text-blue-500" />
        INITIALIZING_TERMINAL...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 gap-4 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-b border-white/5 pb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Terminal Overview</h1>
          <p className="text-sm text-slate-500 font-mono mt-1">Live market execution and portfolio metrics</p>
        </div>

        <div className="flex items-center gap-3">

          <PingIndicator lastPing={sysState?.last_ping} />

          <div className="flex items-center gap-2 px-4 py-2 bg-[#000000]/50 backdrop-blur-xl border border-white/5 rounded-full shadow-lg">
            <div className={`h-2.5 w-2.5 rounded-full ${sysState?.kill_switch_active ? 'bg-red-500 animate-pulse' : sysState?.is_running ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
            <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
              {sysState?.kill_switch_active ? 'SYSTEM HALTED' : sysState?.is_running ? 'ENGINE ONLINE' : 'ENGINE PAUSED'}
            </span>
          </div>

        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 shrink-0">
        <KPICard title="Total Equity" value={`$${Number(snapshot?.total_equity || 0).toFixed(2)}`} icon={Wallet} />
        <KPICard title="Free Balance" value={`$${Number(snapshot?.free_balance || 0).toFixed(2)}`} icon={Wallet} color="text-slate-400" />
        <KPICard title="Today's PnL" value={`$${metrics.todayPnl.toFixed(2)}`} icon={TrendingUp} color={metrics.todayPnl >= 0 ? "text-green-400" : "text-red-400"} />
        <KPICard title="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} icon={Crosshair} />
        <KPICard title="Exposure" value={`${analytics.exposurePct.toFixed(1)}%`} icon={BarChart2} color="text-yellow-400" />
        <KPICard title="Max Drawdown" value={`-${analytics.maxDrawdown.toFixed(2)}%`} icon={ShieldAlert} color="text-orange-400" />
      </section>

      <section className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">

        <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">

          <div className="flex-1 min-h-0 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <WidgetErrorBoundary widgetName="Equity Chart">
              <EquityChart data={chartData} />
            </WidgetErrorBoundary>
          </div>

          <div className="flex-1 min-h-0 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden relative">
            <WidgetErrorBoundary widgetName="Recent Trades">
              <RecentTradesTable trades={trades} />
            </WidgetErrorBoundary>
          </div>

        </div>

        <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
          <BotRecoveryPanel currentBalance={sysState?.starting_balance} />
          <ManualOverridesPanel
            isRunning={sysState?.is_running ?? false}
            killSwitchActive={sysState?.kill_switch_active ?? false}
          />        </aside>

      </section>

    </div>
  );
}

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