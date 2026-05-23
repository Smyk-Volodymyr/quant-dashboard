"use client";

import React, { useState, useTransition } from "react";
import { loginAction, signupAction } from "@/app/actions/auth";
import { ShieldAlert, Terminal, LockKeyhole, ArrowRight, Mail } from "lucide-react";

export const LoginForm = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isRegisterMode
        ? await signupAction(formData)
        : await loginAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <article className="w-full max-w-sm relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

      <div className="relative bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div className="px-8 pt-8 pb-6 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Terminal size={24} className="text-blue-400" />
          </div>
          <h1 className="font-mono font-bold text-slate-100 text-xl tracking-tight">
            QUANT_CORE <span className="text-blue-500">SaaS</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {isRegisterMode ? "Create New Workspace" : "Client Access Layer"}
          </p>
        </div>

        <div className="px-8 pb-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <ShieldAlert size={16} className="mr-2 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">
                Client Email
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="operator@quant.local"
                  className="w-full bg-[#000000]/50 border border-white/5 px-4 py-3 pl-10 rounded-xl text-slate-200 font-mono text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/10 outline-none transition-all"
                  disabled={isPending}
                />
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">
                Passphrase
              </label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-[#000000]/50 border border-white/5 px-4 py-3 pl-10 rounded-xl text-slate-200 font-mono text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/10 outline-none transition-all"
                  disabled={isPending}
                />
                <LockKeyhole size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 focus:ring-4 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm group/btn"
            >
              {isPending ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>
                  {isRegisterMode ? "INITIALIZE WORKSPACE" : "AUTHENTICATE"}
                  <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-[10px] text-slate-500 font-mono uppercase tracking-widest hover:text-blue-400 transition-colors underline-offset-4 hover:underline"
              >
                {isRegisterMode ? "Already have access? Sign In" : "New Operator? Request Access"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
};