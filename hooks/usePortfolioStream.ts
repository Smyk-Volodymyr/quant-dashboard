import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function usePortfolioStream() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchPortfolio() {
      try {
        const { data: snapData, error: snapError } = await supabase
          .from("portfolio_snapshots")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(1)
          .single();
        
        if (snapError && snapError.code !== 'PGRST116') throw snapError;
        if (isMounted && snapData) setSnapshot(snapData);

        const { data: historyData, error: historyError } = await supabase
          .from("portfolio_snapshots")
          .select("timestamp, total_equity")
          .order("timestamp", { ascending: false })
          .limit(500);

        if (historyError) throw historyError;

        if (isMounted && historyData) {
          const chronologicalData = historyData.reverse();

          const uniqueDataMap = new Map();
          
          chronologicalData.forEach(item => {
            const timeSec = Math.floor(new Date(item.timestamp).getTime() / 1000);
            uniqueDataMap.set(timeSec, {
              time: timeSec,
              value: Number(item.total_equity)
            });
          });

          const formattedData = Array.from(uniqueDataMap.values()).sort((a, b) => a.time - b.time);
          setChartData(formattedData);
        }
      } catch (err) {
        console.error("Помилка завантаження портфеля:", err);
        toast.error("Помилка даних", { description: "Не вдалося завантажити історію балансу." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPortfolio();

    const subscription = supabase
      .channel("snapshots_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "portfolio_snapshots" }, (payload) => {
        const newSnap = payload.new;
        setSnapshot(newSnap);
        
        const newTimeSec = Math.floor(new Date(newSnap.timestamp).getTime() / 1000);

        setChartData((currentData) => {
          if (currentData.length === 0) return [{ time: newTimeSec, value: Number(newSnap.total_equity) }];
          
          const lastPoint = currentData[currentData.length - 1];

          // Якщо секунда та сама, оновлюємо існуючу точку (графік підтримує оновлення поточного часу)
          if (lastPoint.time === newTimeSec) {
            const updatedData = [...currentData];
            updatedData[updatedData.length - 1] = { time: newTimeSec, value: Number(newSnap.total_equity) };
            return updatedData;
          }

          // Якщо час пізніший, додаємо нову точку
          if (newTimeSec > lastPoint.time) {
            return [
              ...currentData,
              { time: newTimeSec, value: Number(newSnap.total_equity) }
            ];
          }

          // Якщо прийшли старі дані (out-of-order), ігноруємо їх щоб не зламати графік
          return currentData;
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
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