"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { connectExchangeAction } from "@/app/actions/exchange";

const exchangeSchema = z.object({
  apiKey: z.string().min(32, "API Key виглядає занадто коротким"),
  apiSecret: z.string().min(32, "API Secret виглядає занадто коротким"),
});

type ExchangeForm = z.infer<typeof exchangeSchema>;

interface Props {
  isConnected: boolean;
}

export const ExchangeConnectionForm: React.FC<Props> = ({ isConnected }) => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(isConnected);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExchangeForm>({
    resolver: zodResolver(exchangeSchema),
  });

  const onSubmit = (data: ExchangeForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("apiKey", data.apiKey);
      formData.append("apiSecret", data.apiSecret);

      const result = await connectExchangeAction(formData);

      if (result?.error) {
        toast.error("Помилка підключення", { description: result.error });
      } else {
        setIsSuccess(true);
        reset();
        toast.success("Біржу підключено", {
          description: "Ключі успішно зашифровано та збережено."
        });
      }
    });
  };

  return (
    <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col relative overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10 bg-[#000000]/50">
        <div className="flex items-center">
          <ShieldCheck size={18} className="mr-3 text-blue-400" />
          <div>
            <h2 className="font-mono text-sm tracking-widest text-slate-200 uppercase">Binance Futures API</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">End-to-End Encrypted Storage</p>
          </div>
        </div>
        {isSuccess && (
          <div className="flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle2 size={12} className="text-green-500 mr-1.5" />
            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">Connected</span>
          </div>
        )}
      </div>

      <div className="p-6 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-3">
            <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 font-mono leading-relaxed">
              Переконайтеся, що ви увімкнули <span className="text-slate-200 font-bold">Enable Futures</span> для ваших ключів.
              Забороніть <span className="text-slate-200 font-bold">Enable Withdrawals</span>. Ключі зберігаються у зашифрованому вигляді (AES-256-GCM) і ніколи не передаються на клієнт.
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">API Key</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Введіть Binance API Key"
                  className={`w-full bg-[#000000]/50 border px-4 py-3 pl-10 rounded-xl text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:ring-1 focus:outline-none transition-all ${errors.apiKey ? "border-red-500/50 focus:ring-red-500/50" : "border-white/5 focus:ring-blue-500/50 hover:border-white/10"
                    }`}
                  {...register("apiKey")}
                  disabled={isPending}
                />
                <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              {errors.apiKey && <span className="text-xs text-red-400 ml-1 font-mono">{errors.apiKey.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Secret Key</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Введіть Binance Secret Key"
                  className={`w-full bg-[#000000]/50 border px-4 py-3 pl-10 rounded-xl text-slate-200 font-mono text-sm placeholder:text-slate-700 focus:ring-1 focus:outline-none transition-all ${errors.apiSecret ? "border-red-500/50 focus:ring-red-500/50" : "border-white/5 focus:ring-blue-500/50 hover:border-white/10"
                    }`}
                  {...register("apiSecret")}
                  disabled={isPending}
                />
                <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              {errors.apiSecret && <span className="text-xs text-red-400 ml-1 font-mono">{errors.apiSecret.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 py-3 bg-white/5 border border-white/10 text-slate-200 font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-white/20 disabled:opacity-50 transition-all flex items-center justify-center group"
          >
            {isPending ? (
              <span className="animate-pulse">ENCRYPTING & SAVING...</span>
            ) : (
              <>
                {isSuccess ? "UPDATE KEYS" : "CONNECT EXCHANGE"}
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </article>
  );
};