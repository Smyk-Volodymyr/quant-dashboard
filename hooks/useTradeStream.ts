"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { playTerminalSound } from "@/lib/audio"; // Імпортуємо наш аудіо-модуль

// Якщо ти ще не виніс типи в окремий файл, можна залишити їх тут або імпортувати
export interface Trade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  pnl_usdt: number;
  pnl_percent: number;
  entry_time: string;
  exit_time: string;
  close_reason: string | null;
  obi: number;
}

export function useTradeStream() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // 1. Завантаження початкових даних та підписка на оновлення
  useEffect(() => {
    let isMounted = true;

    async function fetchTrades() {
      try {
        // Отримуємо останні 50 угод при першому завантаженні
        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .order("exit_time", { ascending: false })
          .limit(50);

        if (error) throw error;
        
        if (isMounted && data) {
          setTrades(data as Trade[]);
        }
      } catch (err) {
        console.error("Помилка завантаження угод:", err);
        toast.error("Помилка даних", { description: "Не вдалося завантажити історію торгів." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTrades();

    // Підписуємося на нові угоди (INSERT)
    const subscription = supabase
      .channel("trades_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades" }, (payload) => {
        const newTrade = payload.new as Trade;
        
        // Оновлюємо стан, додаючи нову угоду на початок списку і зберігаючи лише 50 останніх
        setTrades((current) => [newTrade, ...current].slice(0, 50));

        // Озвучуємо та показуємо сповіщення
        if (newTrade.pnl_usdt > 0) {
          playTerminalSound('profit'); // <--- Звук прибутку
          toast.success(`Trade Closed: ${newTrade.symbol}`, {
            description: `Profit: +$${Number(newTrade.pnl_usdt).toFixed(2)} 🚀`,
          });
        } else {
          playTerminalSound('loss'); // <--- Звук збитку
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