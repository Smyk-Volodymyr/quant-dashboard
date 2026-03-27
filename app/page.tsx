"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EquityChart from "@/components/EquityChart";
import { toast } from "sonner";
import {
  Activity, Wallet, TrendingUp, ShieldAlert,
  LayoutDashboard, History, Settings, CheckCircle2, XCircle
} from "lucide-react";

export default function Dashboard() {
  const [sysState, setSysState] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ winRate: 0, todayPnl: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Отримуємо стан системи (Whitelist, Kill-Switch)
      const { data: stateData } = await supabase.from("system_state").select("*").single();
      if (stateData) setSysState(stateData);

      // 2. Отримуємо останній баланс
      const { data: snapData } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();
      if (snapData) setSnapshot(snapData);

      const { data: historyData } = await supabase
        .from("portfolio_snapshots")
        .select("timestamp, total_equity")
        .order("timestamp", { ascending: true }) // Графік потребує хронологічного порядку!
        .limit(500);

      if (historyData) {
        // Форматуємо дані під вимоги Lightweight Charts
        const formattedData = historyData.map(item => ({
          time: Math.floor(new Date(item.timestamp).getTime() / 1000), // Unix time в секундах
          value: Number(item.total_equity)
        }));
        setChartData(formattedData);
      }

      // 3. Отримуємо останні 50 угод для метрик та таблиці
      const { data: tradesData } = await supabase
        .from("trades")
        .select("*")
        .order("exit_time", { ascending: false })
        .limit(50);

      if (tradesData) {
        setTrades(tradesData);

        // Вираховуємо Win Rate
        const wins = tradesData.filter(t => t.pnl_usdt > 0).length;
        const wr = tradesData.length > 0 ? (wins / tradesData.length) * 100 : 0;

        // Вираховуємо PnL за сьогодні
        const today = new Date().toISOString().split('T')[0];
        const pnl = tradesData
          .filter(t => t.exit_time.startsWith(today))
          .reduce((acc, curr) => acc + Number(curr.pnl_usdt), 0);

        setMetrics({ winRate: wr, todayPnl: pnl });
      }
      setLoading(false);
    }

    fetchData();

    // === МАГІЯ REAL-TIME (WebSockets) ===

    // Підписка на нові угоди (таблиця trades)
    const tradesSubscription = supabase
      .channel('trades_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades' }, (payload) => {
        const newTrade = payload.new;

        // Оновлюємо таблицю угод (додаємо нову наверх)
        setTrades((currentTrades) => [newTrade, ...currentTrades].slice(0, 50));

        // Показуємо красиве сповіщення
        if (newTrade.pnl_usdt > 0) {
          toast.success(`Trade Closed: ${newTrade.symbol}`, {
            description: `Profit: +$${Number(newTrade.pnl_usdt).toFixed(2)} 🚀`,
          });
        } else {
          toast.error(`Trade Closed: ${newTrade.symbol}`, {
            description: `Loss: -$${Math.abs(newTrade.pnl_usdt).toFixed(2)} 🛡️`,
          });
        }
      })
      .subscribe();

    // Підписка на оновлення балансу (таблиця portfolio_snapshots)
    const snapshotSubscription = supabase
      .channel('snapshots_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portfolio_snapshots' }, (payload) => {
        const newSnap = payload.new;

        // Оновлюємо віджет "Total Equity"
        setSnapshot(newSnap);

        // Додаємо нову точку на графік Equity Curve
        setChartData((currentData) => [
          ...currentData,
          {
            time: Math.floor(new Date(newSnap.timestamp).getTime() / 1000),
            value: Number(newSnap.total_equity)
          }
        ]);
      })
      .subscribe();

    // Підписка на статус системи (таблиця system_state)
    const stateSubscription = supabase
      .channel('state_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_state' }, (payload) => {
        setSysState(payload.new);

        // Якщо Kill-Switch активувався щойно, показуємо Alert!
        if (payload.new.kill_switch_active) {
          toast.warning("🚨 СИСТЕМНА ТРИВОГА", {
            description: "Kill-Switch активовано! Торгівлю зупинено до 00:00.",
          });
        }
      })
      .subscribe();

    // Очищення підписок при закритті вкладки (щоб не було витоку пам'яті)
    return () => {
      supabase.removeChannel(tradesSubscription);
      supabase.removeChannel(snapshotSubscription);
      supabase.removeChannel(stateSubscription);
    };
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#09090b] text-slate-400">Ініціалізація терміналу...</div>;
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-50 font-sans overflow-hidden">

      {/* SIDEBAR (Бокова панель) */}
      <aside className="w-64 border-r border-slate-800 bg-[#09090b] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Activity className="text-blue-500 mr-2" size={20} />
          <span className="font-bold text-lg tracking-tight">Quant Studio</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <a href="#" className="flex items-center px-3 py-2.5 bg-slate-800/50 text-blue-400 rounded-lg text-sm font-medium">
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-50 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <History size={18} className="mr-3" /> Trade History
          </a>
          <a href="#" className="flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-50 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <Settings size={18} className="mr-3" /> Configuration
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Engine Version: v3.1.0-live
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">

        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Live Overview</h1>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${sysState?.is_running ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${sysState?.is_running ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {sysState?.is_running ? 'Engine Online' : 'Engine Offline'}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 space-y-8">

          {/* KPI WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Total Equity Card */}
            <div className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-sm font-medium">Total Equity</span>
                <Wallet size={16} />
              </div>
              <div className="text-3xl font-bold font-mono">
                ${snapshot ? Number(snapshot.total_equity).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <p className="text-xs text-slate-500 mt-2">Available: ${snapshot ? Number(snapshot.free_balance).toFixed(2) : '0'}</p>
            </div>

            {/* Today's PnL Card */}
            <div className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-sm font-medium">Today's PnL</span>
                <TrendingUp size={16} className={metrics.todayPnl >= 0 ? "text-green-500" : "text-red-500"} />
              </div>
              <div className={`text-3xl font-bold font-mono ${metrics.todayPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                {metrics.todayPnl >= 0 ? '+' : ''}{metrics.todayPnl.toFixed(2)} USDT
              </div>
              <p className="text-xs text-slate-500 mt-2">Realized profit past 24h</p>
            </div>

            {/* Win Rate Card */}
            <div className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-sm font-medium">Win Rate (Last 50)</span>
                <Activity size={16} />
              </div>
              <div className="text-3xl font-bold font-mono">
                {metrics.winRate.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${metrics.winRate}%` }}></div>
              </div>
            </div>

            {/* Kill-Switch Card */}
            <div className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-sm font-medium">Kill-Switch Status</span>
                <ShieldAlert size={16} />
              </div>
              <div className="flex items-center mt-2">
                {sysState?.kill_switch_active ? (
                  <><XCircle className="text-red-500 mr-2" size={28} /><span className="text-xl font-bold text-red-500">TRIGGERED</span></>
                ) : (
                  <><CheckCircle2 className="text-green-500 mr-2" size={28} /><span className="text-xl font-bold text-green-500">SAFE</span></>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">Max daily drawdown: -3.00%</p>
            </div>

          </div>

          {/* RECENT TRADES (Takes 2/3 width) */}
          <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-[#09090b] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
              <h3 className="font-semibold">Recent Executions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">Pair</th>
                    <th className="px-6 py-3 font-medium">Side</th>
                    <th className="px-6 py-3 font-medium">Entry / Exit</th>
                    <th className="px-6 py-3 font-medium text-right">PnL (USDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {trades.length > 0 ? trades.slice(0, 8).map((trade, i) => (
                    <tr key={trade.id || i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono">{new Date(trade.exit_time).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${trade.direction === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {Number(trade.entry_price)} <span className="text-slate-600">→</span> {Number(trade.exit_price)}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${trade.pnl_usdt >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl_usdt > 0 ? '+' : ''}{Number(trade.pnl_usdt).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Очікування перших угод...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRID: CHARTS & TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* EQUITY CURVE CHART */}
            <div className="border border-slate-800 rounded-xl bg-[#09090b] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Portfolio Growth (Equity Curve)</h2>
                <span className="text-xs text-slate-500">Real-time tracking</span>
              </div>
              <div className="h-[350px] w-full">
                <EquityChart data={chartData} />
              </div>
            </div>

            {/* DYNAMIC UNIVERSE (Takes 1/3 width) */}
            <div className="border border-slate-800 rounded-xl bg-[#09090b] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/20">
                <h3 className="font-semibold flex items-center">
                  <Activity size={16} className="mr-2 text-blue-500" /> Dynamic Universe
                </h3>
                <p className="text-xs text-slate-500 mt-1">Top volume scanned daily</p>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                <div className="flex flex-wrap gap-2">
                  {sysState?.current_dynamic_whitelist?.length > 0 ? (
                    sysState.current_dynamic_whitelist.map((coin: string) => (
                      <span key={coin} className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-md border border-slate-700/50">
                        {coin.replace('/USDT', '')}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">Сканування ринку...</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}