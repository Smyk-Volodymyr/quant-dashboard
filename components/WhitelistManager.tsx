"use client";

import React, { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ListPlus, Trash2, Plus, Server } from "lucide-react";
import { updateWhitelistAction } from "@/app/actions/system";

const addPairSchema = z.object({
  symbol: z.string()
    .min(1, "Поле не може бути порожнім")
    .toUpperCase()
    .regex(/^[A-Z0-9]{2,10}\/[A-Z0-9]{2,10}$/, "Формат: BTC/USDT"),
});

type AddPairForm = z.infer<typeof addPairSchema>;

interface WhitelistManagerProps {
  currentWhitelist?: string[];
}

export const WhitelistManager: React.FC<WhitelistManagerProps> = memo(({ currentWhitelist = [] }) => {
  const [localList, setLocalList] = useState<string[]>(currentWhitelist);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    setLocalList(currentWhitelist);
  }, [currentWhitelist]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPairForm>({
    resolver: zodResolver(addPairSchema),
  });

  const syncWithServer = async (newList: string[], successMsg: string) => {
    setIsMutating(true);
    setLocalList(newList);

    try {
      const result = await updateWhitelistAction(newList);
      if (result?.error) throw new Error(result.error);

      toast.success("Систему оновлено", { description: successMsg });
    } catch (err: any) {
      setLocalList(currentWhitelist);
      toast.error("Помилка синхронізації", { description: err.message || "Не вдалося зберегти Whitelist." });
    } finally {
      setIsMutating(false);
    }
  };

  const onAddPair = async (data: AddPairForm) => {
    if (localList.includes(data.symbol)) {
      toast.error("Дублікат", { description: `Пара ${data.symbol} вже є в активному списку.` });
      return;
    }

    const newList = [...localList, data.symbol];
    await syncWithServer(newList, `Пару ${data.symbol} додано до роботи.`);
    reset();
  };

  const onRemovePair = async (symbolToRemove: string) => {
    const newList = localList.filter((sym) => sym !== symbolToRemove);
    await syncWithServer(newList, `Пару ${symbolToRemove} видалено з роботи.`);
  };

  return (
    <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col relative overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <ListPlus size={16} className="mr-2 text-blue-400" aria-hidden="true" />
          <h2 className="font-mono text-sm tracking-widest text-slate-200 uppercase">Active Whitelist</h2>
        </div>
        <div className="flex items-center text-[10px] font-mono text-slate-500 bg-[#000000]/50 px-2 py-1 rounded">
          <Server size={10} className={`mr-1 ${isMutating ? 'animate-pulse text-yellow-500' : 'text-green-500'}`} />
          {localList.length} PAIRS
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4 relative z-10">
        <form onSubmit={handleSubmit(onAddPair)} noValidate className="flex flex-col gap-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="symbol-input"
                type="text"
                placeholder="EX: SOL/USDT"
                className={`w-full bg-[#000000]/50 border px-3 py-2.5 rounded-xl text-slate-100 font-mono text-sm uppercase placeholder:text-slate-700 focus:ring-1 focus:outline-none transition-all ${errors.symbol ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-blue-500/50 hover:border-white/20'
                  }`}
                {...register("symbol")}
                disabled={isMutating}
                aria-invalid={!!errors.symbol}
                aria-describedby={errors.symbol ? "symbol-error" : undefined}
              />
            </div>
            <button
              type="submit"
              disabled={isMutating}
              aria-label="Додати торгову пару"
              className="px-4 bg-white/5 border border-white/5 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-white/20 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>
          {errors.symbol && (
            <span id="symbol-error" className="text-xs text-red-400 font-mono ml-1 mt-1">
              {errors.symbol.message}
            </span>
          )}
        </form>

        <div className="flex-1 bg-[#000000]/30 border border-white/5 rounded-xl overflow-hidden flex flex-col">
          {localList.length === 0 ? (
            <div className="p-6 text-center text-slate-600 font-mono text-xs flex flex-col items-center justify-center h-32">
              <span className="opacity-50">WHITELIST IS EMPTY</span>
              <span className="text-[10px] mt-1">Engine will not execute any trades</span>
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {localList.map((symbol) => (
                <li
                  key={symbol}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors group"
                >
                  <span className="font-mono text-sm font-bold text-slate-200">{symbol}</span>
                  <button
                    onClick={() => onRemovePair(symbol)}
                    disabled={isMutating}
                    aria-label={`Видалити ${symbol} зі списку`}
                    className="text-slate-600 hover:text-red-400 focus:outline-none focus:text-red-400 transition-colors disabled:opacity-50 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
});

WhitelistManager.displayName = "WhitelistManager";