"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/app/actions/auth";
import { ShieldAlert, Terminal, LockKeyhole, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Логін обов'язковий"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);

      const result = await loginAction(undefined, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <article className="w-full max-w-sm relative group">
      {/* Ефект світіння позаду картки */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

      <div className="relative bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Декоративна лінія зверху */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div className="px-8 pt-8 pb-6 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Terminal size={24} className="text-blue-400" />
          </div>
          <h1 className="font-mono font-bold text-slate-100 text-xl tracking-tight">
            QUANT_CORE <span className="text-blue-500">v1.0</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Restricted Access Layer
          </p>
        </div>

        <div className="px-8 pb-8 flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <ShieldAlert size={16} className="mr-2 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">
                Operator ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="admin"
                  className={`w-full bg-[#000000]/50 border px-4 py-3 rounded-xl text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:ring-1 focus:outline-none transition-all ${errors.username
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-white/5 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/10"
                    }`}
                  {...register("username")}
                  disabled={isPending}
                />
              </div>
              {errors.username && (
                <span className="text-xs text-red-400 ml-1">{errors.username.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full bg-[#000000]/50 border px-4 py-3 rounded-xl text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:ring-1 focus:outline-none transition-all ${errors.password
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-white/5 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/10"
                    }`}
                  {...register("password")}
                  disabled={isPending}
                />
                <LockKeyhole size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              {errors.password && (
                <span className="text-xs text-red-400 ml-1">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 focus:ring-4 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm group/btn"
            >
              {isPending ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
              ) : (
                <>
                  INITIALIZE
                  <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </article>
  );
};