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
          .order("timestamp", { ascending: true })
          .limit(500);

        if (historyError) throw historyError;

        if (isMounted && historyData) {
          const formattedData = historyData.map(item => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000),
            value: Number(item.total_equity)
          }));
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
        setChartData((currentData) => [
          ...currentData,
          {
            time: Math.floor(new Date(newSnap.timestamp).getTime() / 1000),
            value: Number(newSnap.total_equity)
          }
        ]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  // === НОВА ЛОГІКА АНАЛІТИКИ (Max Drawdown & Exposure) ===
  const analytics = useMemo(() => {
    // 1. Розрахунок Max Drawdown (Peak-to-Trough)
    let peak = 0;
    let maxDrawdown = 0;
    
    chartData.forEach(point => {
      if (point.value > peak) peak = point.value;
      const currentDrawdown = peak > 0 ? ((peak - point.value) / peak) * 100 : 0;
      if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
    });

    // 2. Розрахунок Exposure (Завантаженість портфеля)
    const total = snapshot ? Number(snapshot.total_equity) : 0;
    const free = snapshot ? Number(snapshot.free_balance) : 0;
    const exposureUsdt = Math.max(0, total - free); // Кошти у відкритих позиціях
    const exposurePct = total > 0 ? (exposureUsdt / total) * 100 : 0;

    return { maxDrawdown, exposureUsdt, exposurePct };
  }, [chartData, snapshot]);

  // Повертаємо analytics разом з іншими даними
  return { snapshot, chartData, analytics, isPortfolioLoading: isLoading };
}