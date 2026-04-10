import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useSystemState() {
  const [sysState, setSysState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchState() {
      try {
        const { data, error } = await supabase.from("system_state").select("*").single();
        if (error) throw error;
        
        const stateWithRecovery = {
          ...data,
          starting_balance: data?.starting_balance ?? 145.62
        };

        if (isMounted) {
          setSysState(stateWithRecovery);
        }
      } catch (err) {
        console.error("Помилка завантаження стану системи:", err);
        toast.error("Помилка ініціалізації", { description: "Не вдалося отримати конфігурацію ядра." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchState();

    const subscription = supabase
      .channel("state_channel")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "system_state" }, (payload) => {
        const newState = {
          ...payload.new,
          starting_balance: payload.new.starting_balance ?? 145.62
        };
        setSysState(newState);

        if (payload.new.kill_switch_active) {
          toast.warning("🚨 СИСТЕМНА ТРИВОГА", {
            description: "Kill-Switch активовано! Торгівлю зупинено до 00:00.",
          });
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  return { sysState, isStateLoading: isLoading };
}