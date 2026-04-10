import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useTradeStream() {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchTrades() {
      try {
        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .order("exit_time", { ascending: false })
          .limit(50);

        if (error) throw error;
        if (isMounted && data) setTrades(data);
      } catch (err) {
        console.error("Помилка завантаження угод:", err);
        toast.error("Помилка даних", { description: "Не вдалося завантажити історію торгів." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTrades();

    const subscription = supabase
      .channel("trades_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades" }, (payload) => {
        const newTrade = payload.new;
        
        setTrades((current) => [newTrade, ...current].slice(0, 50));

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

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  const metrics = useMemo(() => {
    const wins = trades.filter(t => t.pnl_usdt > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayPnl = trades
      .filter(t => t.exit_time.startsWith(today))
      .reduce((acc, curr) => acc + Number(curr.pnl_usdt), 0);

    return { winRate, todayPnl };
  }, [trades]);

  return { trades, metrics, isTradesLoading: isLoading };
}