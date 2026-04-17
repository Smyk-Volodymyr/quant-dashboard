import { useState, useCallback } from "react";
import { toast } from "sonner";
import { toggleEngineAction, triggerKillSwitchAction } from "@/app/actions/system";

export function useEngineControl() {
  const [isMutating, setIsMutating] = useState(false);

  const toggleEngine = useCallback(async (newState: boolean) => {
    setIsMutating(true);
    try {
      const result = await toggleEngineAction(newState);

      if (result.error) throw new Error(result.error);

      if (newState) {
        toast.success("Engine Online", { description: "Бот відновлює пошук точок входу." });
      } else {
        toast.warning("Engine Paused", { description: "Нові позиції відкриватися не будуть. Активні угоди супроводжуються." });
      }
    } catch (err: any) {
      console.error("Engine toggle error:", err);
      toast.error("Помилка синхронізації", { description: err.message || "Не вдалося змінити стан двигуна." });
    } finally {
      setIsMutating(false);
    }
  }, []);

  const triggerKillSwitch = useCallback(async () => {
    setIsMutating(true);
    try {
      const result = await triggerKillSwitchAction();

      if (result.error) throw new Error(result.error);

      toast.error("🚨 FORCE KILL-SWITCH АКТИВОВАНО", { 
        description: "Надіслано сигнал на негайне закриття всіх позицій по ринку." 
      });
    } catch (err: any) {
      console.error("Kill-Switch error:", err);
      toast.error("Критична помилка", { description: err.message || "Не вдалося відправити сигнал Kill-Switch до БД." });
    } finally {
      setIsMutating(false);
    }
  }, []);

  return { toggleEngine, triggerKillSwitch, isMutating };
}