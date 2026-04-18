"use client";

import React from "react";

const SkeletonBase = ({ className = "", style }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded bg-slate-800 ${className}`} style={style} />
);

export const KPICardSkeleton = () => (
  <article className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-4 h-32.5">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-4 w-32 bg-slate-800/70" />
      <SkeletonBase className="h-5 w-5 rounded-full bg-slate-800/70" />
    </div>
    <SkeletonBase className="h-10 w-48 bg-slate-700" />
    <SkeletonBase className="h-3 w-40 bg-slate-800/70 mt-1" />
  </article>
);

export const ChartSkeleton = () => (
  <div className="relative p-4 flex flex-col h-full gap-4">
    <div className="flex justify-between items-center mb-2 shrink-0">
      <SkeletonBase className="h-5 w-40 bg-slate-700" />
      <SkeletonBase className="h-5 w-20 rounded-full bg-slate-800" />
    </div>
    <div className="flex-1 w-full relative flex">
      <div className="w-10 h-full flex flex-col justify-between py-2 border-r border-slate-800 pr-2">
        {[...Array(5)].map((_, i) => <SkeletonBase key={i} className="h-3 w-6" />)}
      </div>
      <div className="flex-1 h-full p-4 flex flex-col justify-center gap-10">
        <SkeletonBase className="h-1 w-full opacity-60" />
        <SkeletonBase className="h-1 w-full" />
        <SkeletonBase className="h-1 w-full opacity-60" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full flex flex-col h-full bg-[#09090b] text-sm outline-none">
    <div className="flex border-b border-slate-800 p-4 gap-4 bg-slate-900/40">
      {[20, 20, 15, 25, 20].map((width, i) => (
        <SkeletonBase key={i} style={{ width: `${width}%` }} className="h-4 bg-slate-700" />
      ))}
    </div>
    {[...Array(6)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex border-b border-slate-800/50 p-4 gap-4 items-center">
        {[20, 20, 15, 25, 20].map((width, colIndex) => (
          <SkeletonBase
            key={colIndex}
            style={{ width: `${width}%` }}
            className={`h-5 ${colIndex === 2 ? 'rounded-full h-6 w-12' : 'bg-slate-800/60'}`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const ControlsSkeleton = () => (
  <aside className="p-4 flex flex-col gap-8 h-full">
    <div>
      <SkeletonBase className="h-5 w-40 bg-slate-700 mb-4" />
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => <SkeletonBase key={i} className="h-6 w-16 border border-slate-700 bg-slate-800/80" />)}
      </div>
    </div>
    <div className="border border-slate-800 rounded-xl p-6 bg-[#09090b] flex flex-col gap-4">
      <SkeletonBase className="h-5 w-32 bg-slate-700" />
      <SkeletonBase className="h-10 w-full rounded-lg mt-4 bg-slate-800" />
      <SkeletonBase className="h-10 w-full rounded-lg bg-slate-800" />
    </div>
    <div className="border border-slate-800 rounded-xl p-6 bg-[#09090b] flex flex-col gap-4">
      <SkeletonBase className="h-5 w-32 bg-slate-700" />
      <SkeletonBase className="h-10 w-full rounded-lg mt-4 bg-slate-800" />
      <SkeletonBase className="h-10 w-full rounded-lg bg-red-950 border border-red-900" />
    </div>
  </aside>
);

export const DashboardSkeletonLayout = () => (
  <div className="flex h-screen bg-[#09090b] text-slate-50 font-sans overflow-hidden">

    <aside className="w-64 border-r border-slate-800 bg-[#09090b] flex-col hidden md:flex animate-pulse">
      <div className="h-16 border-b border-slate-800 p-6 flex items-center gap-2">
        <SkeletonBase className="h-5 w-5 rounded-full bg-slate-700" />
        <SkeletonBase className="h-5 w-32 bg-slate-700" />
      </div>
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => <SkeletonBase key={i} className="h-10 w-full rounded-lg bg-slate-800/80" />)}
      </div>
    </aside>

    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-10 animate-pulse">
        <SkeletonBase className="h-6 w-48 bg-slate-700" />
        <div className="flex items-center space-x-4">
          <SkeletonBase className="h-7 w-32 rounded-full bg-slate-800" />
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-hidden">

        <section aria-label="Завантаження показників" className="grid grid-cols-2 lg:grid-cols-6 gap-4 shrink-0">
          {[...Array(6)].map((_, i) => <KPICardSkeleton key={i} />)}
        </section>

        <section className="flex-1 min-h-125 border border-slate-800 rounded-xl overflow-hidden shadow-sm bg-[#09090b] flex">

          <div className="w-[75%] border-r border-slate-800 flex flex-col">
            <div className="h-[60%] border-b border-slate-800">
              <ChartSkeleton />
            </div>
            <div className="h-[40%] bg-slate-900/10 relative">
              <div className="absolute inset-0">
                <TableSkeleton />
              </div>
            </div>
          </div>

          <aside className="w-[25%] bg-slate-900/20">
            <ControlsSkeleton />
          </aside>
        </section>
      </div>
    </main>
  </div>
);