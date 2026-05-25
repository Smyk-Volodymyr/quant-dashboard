"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePortfolioStream() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchPortfolio() {
      try {
        // 1. Отримуємо поточного юзера
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Фільтруємо знімок тільки для цього юзера
        const { data: snapData, error: snapError } = await supabase
          .from("portfolio_snapshots")
          .select("*")
          .eq("user_id", user.id) // 👈 ДОДАНО ФІЛЬТР
          .order("timestamp", { ascending: false })
          .limit(1)
          .single();
        
        if (snapError && snapError.code !== 'PGRST116') throw snapError;
        if (isMounted && snapData) setSnapshot(snapData);

        const { data: historyData, error: historyError } = await supabase
          .from("portfolio_snapshots")
          .select("timestamp, total_equity")
          .eq("user_id", user.id) // 👈 ДОДАНО ФІЛЬТР
          .order("timestamp", { ascending: false })
          .limit(150);

        if (historyError) throw historyError;

        if (isMounted && historyData) {
          const formattedData = historyData.reverse().map((item: any) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000),
            value: Number(item.total_equity)
          }));
          
          setChartData(formattedData);
        }

        const channelName = `snapshots_channel_${crypto.randomUUID()}`;
        const channel = supabase.channel(channelName);

        channel.on(
          "postgres_changes", 
          { 
            event: "INSERT", 
            schema: "public", 
            table: "portfolio_snapshots",
            filter: `user_id=eq.${user.id}` // 👈 ДОДАНО ФІЛЬТР ДЛЯ WEBSOCKET
          }, 
          (payload) => {
            const newSnap = payload.new;
            setSnapshot(newSnap);
            
            const newTimeSec = Math.floor(new Date(newSnap.timestamp).getTime() / 1000);

            setChartData((currentData) => {
              if (currentData.length === 0) return [{ time: newTimeSec, value: Number(newSnap.total_equity) }];
              
              const lastPoint = currentData[currentData.length - 1];

              if (lastPoint.time === newTimeSec) {
                const updatedData = [...currentData];
                updatedData[updatedData.length - 1] = { time: newTimeSec, value: Number(newSnap.total_equity) };
                return updatedData;
              }

              if (newTimeSec > lastPoint.time) {
                return [
                  ...currentData,
                  { time: newTimeSec, value: Number(newSnap.total_equity) }
                ];
              }

              return currentData;
            });
          }
        ).subscribe();

      } catch (err) {
        console.error("Помилка завантаження портфеля:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPortfolio();

    return () => {
      isMounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    let peak = 0;
    let maxDrawdown = 0;
    
    chartData.forEach(point => {
      if (point.value > peak) peak = point.value;
      const currentDrawdown = peak > 0 ? ((peak - point.value) / peak) * 100 : 0;
      if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
    });

    const total = snapshot ? Number(snapshot.total_equity) : 0;
    const free = snapshot ? Number(snapshot.free_balance) : 0;
    const exposureUsdt = Math.max(0, total - free);
    const exposurePct = total > 0 ? (exposureUsdt / total) * 100 : 0;

    return { maxDrawdown, exposureUsdt, exposurePct };
  }, [chartData, snapshot]);

  return { snapshot, chartData, analytics, isPortfolioLoading: isLoading };
}