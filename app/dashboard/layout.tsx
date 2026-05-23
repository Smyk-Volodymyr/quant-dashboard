"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Settings, TerminalSquare, LogOut } from "lucide-react";
import { useTerminalHotkeys } from "@/hooks/useTerminalHotkeys";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useTerminalHotkeys();

  useEffect(() => {
    const verifyAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    };

    verifyAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-slate-500 animate-pulse">
        <Activity size={16} className="mr-3 text-blue-500" />
        VERIFYING_ACCESS_TOKEN...
      </div>
    );
  }

  const navItems = [
    {
      name: "Terminal",
      href: "/dashboard",
      icon: TerminalSquare,
      exact: true,
    },
    {
      name: "Setting",
      href: "/dashboard/settings",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/5 via-[#050505] to-[#050505] pointer-events-none -z-10" />

      <aside className="w-64 border-r border-white/5 bg-[#050505]/80 backdrop-blur-xl flex flex-col shrink-0 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0">
          <div className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center mr-3">
            <Activity size={16} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-sm tracking-tight text-white">QUANT_CORE</span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0-prod</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
              >
                <item.icon
                  size={18}
                  className={`mr-3 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="mr-3 text-slate-500 group-hover:text-red-400 transition-colors" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-[#050505]/80 backdrop-blur-xl">
          <div className="flex items-center">
            <Activity size={20} className="text-blue-400 mr-2" />
            <span className="font-mono font-bold text-sm text-white">QUANT_CORE</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}