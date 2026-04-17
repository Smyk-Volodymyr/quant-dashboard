"use client";

import React from "react";
import { useSystemState } from "@/hooks/useSystemState";
import { WhitelistManager } from "@/components/WhitelistManager"; // Компонент, який ми написали раніше
import { Network, ServerCrash } from "lucide-react";

export default function WhitelistPage() {
  const { sysState, isStateLoading } = useSystemState();

  if (isStateLoading) {
    return (
      <div className="p-8 flex items-center text-slate-500 font-mono text-sm animate-pulse">
        <Network size={16} className="mr-3" />
        FETCHING_SYSTEM_STATE...
      </div>
    );
  }

  if (!sysState) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-red-500 font-mono h-64 bg-red-950/10 rounded-2xl border border-red-900/20 m-8">
        <ServerCrash size={32} className="mb-4" />
        <p>CRITICAL ERROR: Unable to load system state.</p>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500">

      {/* Хедер сторінки */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
          Pairs Management
        </h1>
        <p className="text-sm text-slate-500 font-mono">
          Контролюй торгові пари в реальному часі. Видалення пари не закриває активні угоди, але запобігає відкриттю нових.
        </p>
      </header>

      {/* Основний контент */}
      <section className="grid gap-6">
        {/* Передаємо дані з хука в наш компонент */}
        <WhitelistManager currentWhitelist={sysState.current_dynamic_whitelist || []} />
      </section>

    </main>
  );
}