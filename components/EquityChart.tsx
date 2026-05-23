"use client";

import React, { useEffect, useRef, memo } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries, Time, DeepPartial, ChartOptions } from "lightweight-charts";

interface ChartDataPoint {
  time: number;
  value: number;
}

interface EquityChartProps {
  data: ChartDataPoint[];
}

const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "#64748b",
    fontFamily: "Geist Mono, ui-monospace, monospace",
  },
  grid: {
    vertLines: { color: "rgba(255, 255, 255, 0.03)" },
    horzLines: { color: "rgba(255, 255, 255, 0.03)" },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    borderColor: "#1e293b",
    barSpacing: 10,
  },
};

export const EquityChart: React.FC<EquityChartProps> = memo(({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const seriesApiRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
    });

    chartApiRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6",
      topColor: "rgba(59, 130, 246, 0.2)",
      bottomColor: "rgba(59, 130, 246, 0.0)",
      lineWidth: 2,
    });

    seriesApiRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 300,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const series = seriesApiRef.current;
    const chart = chartApiRef.current;

    if (!series || !chart || !data || data.length === 0) return;

    const uniqueSortedData = Array.from(new Map(data.map(item => [item.time, item])).values())
      .sort((a, b) => a.time - b.time)
      .map(item => ({
        time: item.time as Time,
        value: item.value
      }));

    series.setData(uniqueSortedData);
    chart.timeScale().fitContent();

  }, [data]);

  return (
    <div className="w-full h-full relative group flex-1 min-h-[300px]">
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm z-10 bg-[#050505]/50">
          Завантаження історії...
        </div>
      )}
      <div ref={chartContainerRef} className="absolute inset-0" />
    </div>
  );
});

EquityChart.displayName = "EquityChart";