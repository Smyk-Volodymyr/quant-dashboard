"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, AreaSeries, Time } from "lightweight-charts";
interface ChartData {
  time: number; // Unix timestamp у секундах
  value: number; // Total Equity
}

interface EquityChartProps {
  data: ChartData[];
}

export default function EquityChart({ data }: EquityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Ініціалізація графіка з темною темою
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8", // text-slate-400
      },
      grid: {
        vertLines: { color: "#1e293b" }, // border-slate-800
        horzLines: { color: "#1e293b" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1e293b",
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: { color: "#3b82f6", labelBackgroundColor: "#3b82f6" },
        horzLine: { color: "#3b82f6", labelBackgroundColor: "#3b82f6" },
      }
    });

    chartRef.current = chart;

    // 2. Додаємо Area Series (графік із градієнтною заливкою)
    // 2. Додаємо Area Series (графік із градієнтною заливкою)
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6", // blue-500
      topColor: "rgba(59, 130, 246, 0.4)",
      bottomColor: "rgba(59, 130, 246, 0.0)",
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // 3. Завантажуємо дані
    if (data.length > 0) {
      // Явно вказуємо TypeScript, що наш number — це сумісний формат Time
      const typedData = data.map(item => ({
        time: item.time as Time,
        value: item.value
      }));

      areaSeries.setData(typedData);
      chart.timeScale().fitContent(); // Автоматично масштабує графік
    }

    // 4. Ресайз (адаптація під розмір вікна)
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    // Очищення пам'яті при видаленні компонента
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full h-full relative">
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-slate-500">
          Збір даних для побудови графіка...
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}