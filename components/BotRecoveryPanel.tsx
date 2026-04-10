"use client";

import React, { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { HardDrive, ServerCrash } from "lucide-react";

const recoverySchema = z.object({
  startingBalance: z.number({
    message: "Введіть коректне число",
  })
    .min(10, "Баланс занадто малий для торгівлі")
    .max(1000000, "Перевищено ліміт безпеки"),
});

type RecoveryForm = z.infer<typeof recoverySchema>;

interface BotRecoveryPanelProps {
  currentBalance?: number;
}

export const BotRecoveryPanel: React.FC<BotRecoveryPanelProps> = memo(({ currentBalance }) => {
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RecoveryForm>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      startingBalance: currentBalance ?? 145.62,
    },
  });

  useEffect(() => {
    if (currentBalance !== undefined) {
      reset({ startingBalance: currentBalance }, { keepDirty: false });
    }
  }, [currentBalance, reset]);

  const onSubmit = async (data: RecoveryForm) => {
    try {
      const { error } = await supabase
        .from("system_state")
        .update({ starting_balance: data.startingBalance })
        .eq("id", 1);

      if (error) throw error;

      toast.success("Crash Recovery Updated", {
        description: `Новий baseline: $${data.startingBalance.toFixed(2)}. Бот захищений.`,
        icon: <HardDrive className="text-green-500" size={16} />,
      });

      reset(data);
    } catch (err) {
      console.error("Помилка оновлення recovery baseline:", err);
      toast.error("Помилка синхронізації", {
        description: "Не вдалося зберегти налаштування в Supabase.",
      });
    }
  };

  return (
    <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group">
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/10 to-transparent blur opacity-50 pointer-events-none"></div>

      <div className="px-5 py-4 border-b border-white/5 flex items-center relative z-10">
        <HardDrive size={16} className="mr-2 text-blue-400" />
        <h2 className="font-mono text-sm tracking-widest text-slate-200 uppercase">Recovery Baseline</h2>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
              <input
                type="number"
                step="0.01"
                className={`w-full bg-[#000000]/50 border pl-8 pr-4 py-3 rounded-xl text-slate-100 font-mono text-sm focus:ring-1 focus:outline-none transition-all ${errors.startingBalance ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-blue-500/50 hover:border-white/20'
                  }`}
                {...register('startingBalance')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full py-3 bg-white/5 text-slate-300 border border-white/5 rounded-xl hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase tracking-widest flex items-center justify-center"
          >
            {isSubmitting ? "SYNCING..." : "UPDATE SYSTEM"}
          </button>
        </form>
      </div>
    </article>
  );
});

BotRecoveryPanel.displayName = "BotRecoveryPanel";