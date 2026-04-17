"use client";

import React, { useEffect, useRef, memo } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries, Time, DeepPartial, ChartOptions } from "lightweight-charts";

interface ChartDataPoint {
  time: number; // Unix timestamp у секундах
  value: number; // Total Equity
}

interface EquityChartProps {
  data: ChartDataPoint[];
}

// Конфігурація стилів графіка (винесено за межі компонента)
const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: "transparent" }, // Прозорість!
    textColor: "#64748b", // slate-500
    fontFamily: "Geist Mono, ui-monospace, monospace",
  },
  grid: {
    vertLines: { color: "rgba(255, 255, 255, 0.03)" }, // Ледь помітні лінії
    horzLines: { color: "rgba(255, 255, 255, 0.03)" },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    borderColor: "#1e293b",
    barSpacing: 10,
  },
  rightPriceScale: {
    borderColor: "#1e293b",
    alignLabels: true,
  },
  handleScale: {
    mouseWheel: true,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
  },
  crosshair: {
    mode: 1, // Magnet mode
    vertLine: { color: "#3b82f6", labelBackgroundColor: "#3b82f6" },
    horzLine: { color: "#3b82f6", labelBackgroundColor: "#3b82f6" },
  },
  localization: {
    priceFormatter: (price: number) => `$${price.toFixed(2)}`,
  },
};

export const EquityChart: React.FC<EquityChartProps> = memo(({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Використовуємо useRef для зберігання інстансів за межами React-стейту
  const chartApiRef = useRef<IChartApi | null>(null);
  const seriesApiRef = useRef<ISeriesApi<"Area"> | null>(null);

  // Ref для відстеження останньої обробленої точки даних (дублікати)
  const lastProcessedTimeRef = useRef<number>(0);

  // === ЕФЕКТ 1: Ініціалізація та адаптивність ===
  // Спрацьовує ОДИН раз при монтуванні
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Створюємо інстанс графіка (ініціалізуємо його з розмірами контейнера)
    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      // Ми не можемо покластися на width/height контейнера зараз, 
      // тому ініціалізуємо з мінімальними розмірами
      width: 100,
      height: 100,
    });
    chartApiRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6", // або "#06b6d4" для неонового cyan
      topColor: "rgba(59, 130, 246, 0.2)",
      bottomColor: "rgba(59, 130, 246, 0.0)",
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });
    seriesApiRef.current = series;

    // 3. === КРИТИЧНО ДЛЯ RESIZABLE ПАНЕЛЕЙ ===
    // Створюємо ResizeObserver для спостереження за контейнером
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;

      const { width, height } = entries[0].contentRect;

      // Застосовуємо нові розміри до canvas
      if (chartApiRef.current) {
        chartApiRef.current.applyOptions({
          width: Math.floor(width), // floor для уникнення артефактів sub-pixel
          height: Math.floor(height),
        });

        // Можна опціонально скролити до нової точки, щоб вона завжди була видима
        // chart.timeScale().scrollToPosition(0, true);
      }
    });

    // Починаємо спостереження
    resizeObserver.observe(chartContainerRef.current);

    console.log("📈 EquityChart: Initialized with core logic & ResizeObserver");

    // Cleanup: Очищення пам'яті
    return () => {
      console.log("📉 EquityChart: Destroyed instances");
      resizeObserver.disconnect();
      chart.remove();
      // Очищаємо посилання
      chartApiRef.current = null;
      seriesApiRef.current = null;
      lastProcessedTimeRef.current = 0;
    };
  }, []); // Порожній масив залежностей!

  // === ЕФЕКТ 2: Обробка потокових даних (При зміні пропса data) ===
  useEffect(() => {
    const series = seriesApiRef.current;
    const chart = chartApiRef.current;

    // Перевіряємо, чи є дані для відображення
    const dataAvailable = data && data.length > 0;

    // Якщо даних немає, нічого не робимо (залишаємо Skeleton Loader)
    if (!series || !chart || !dataAvailable) return;

    const formattedData = data.map(item => ({
      time: item.time as Time,
      value: item.value
    }));

    // Початкове завантаження історичних даних
    if (lastProcessedTimeRef.current === 0) {
      series.setData(formattedData);
      chart.timeScale().fitContent(); // Масштабуємо

      const lastPoint = formattedData[formattedData.length - 1];
      lastProcessedTimeRef.current = lastPoint.time as number;
      console.log(`📈 EquityChart: Loaded ${formattedData.length} historical points`);
    }
    // Інкрементальний апдейт (одна точка)
    // Інкрементальний апдейт (одна точка)
    else {
      const lastIncomingPoint = formattedData[formattedData.length - 1];
      const lastIncomingTime = lastIncomingPoint.time as number;

      // ДОЗВОЛЯЄМО оновлення тієї ж самої секунди (>=)
      if (lastIncomingTime >= lastProcessedTimeRef.current) {
        try {
          series.update(lastIncomingPoint);
          lastProcessedTimeRef.current = lastIncomingTime;
        } catch (error) {
          console.error("Помилка оновлення графіка:", error);
        }
      }
    }
  }, [data]); // Залежність тільки від data

  return (
    <div className="w-full h-full relative group">
      {/* Skeleton Loader: Рендеримо, якщо масив даних порожній */}
      {data.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center z-10 text-slate-500 bg-[#09090b]/50 backdrop-blur-sm rounded-xl font-mono text-sm"
        >
          <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Збір даних...
        </div>
      )}
      {/* Головний контейнер (Важливо: width: 100%, height: 100%) */}
      <div ref={chartContainerRef} className="w-full h-full outline-none" />
    </div>
  );
});

EquityChart.displayName = "EquityChart";