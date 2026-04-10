import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useEngineControl() {
  const [isMutating, setIsMutating] = useState(false);
  const supabase = createClient();

  const toggleEngine = useCallback(async (currentRunningState: boolean) => {
    setIsMutating(true);
    try {
      const newState = !currentRunningState;
      const { error } = await supabase
        .from("system_state")
        .update({ is_running: newState })
        .eq("id", 1);

      if (error) throw error;

      if (newState) {
        toast.success("Engine Online", { description: "Бот відновлює пошук точок входу." });
      } else {
        toast.warning("Engine Paused", { description: "Нові позиції відкриватися не будуть. Активні угоди супроводжуються." });
      }
    } catch (err) {
      console.error("Engine toggle error:", err);
      toast.error("Помилка синхронізації", { description: "Не вдалося змінити стан двигуна." });
    } finally {
      setIsMutating(false);
    }
  }, [supabase]);

  // Екстрена зупинка
  const triggerKillSwitch = useCallback(async () => {
    setIsMutating(true);
    try {
      // При Kill-Switch ми також вимикаємо is_running для повної зупинки
      const { error } = await supabase
        .from("system_state")
        .update({ 
          kill_switch_active: true, 
          is_running: false 
        })
        .eq("id", 1);

      if (error) throw error;

      toast.error("🚨 FORCE KILL-SWITCH АКТИВОВАНО", { 
        description: "Надіслано сигнал на негайне закриття всіх позицій по ринку." 
      });
    } catch (err) {
      console.error("Kill-Switch error:", err);
      toast.error("Критична помилка", { description: "Не вдалося відправити сигнал Kill-Switch до БД." });
    } finally {
      setIsMutating(false);
    }
  }, [supabase]);

  return { toggleEngine, triggerKillSwitch, isMutating };
}