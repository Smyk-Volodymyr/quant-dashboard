// hooks/useSystemState.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { playTerminalSound } from "@/lib/audio"; // Імпортуємо аудіо

// Строга типізація нашої БД
export interface SystemState {
  id: number;
  is_running: boolean;
  kill_switch_active: boolean;
  current_dynamic_whitelist: string[];
  last_ping: string;
  starting_balance: number;
}

export function useSystemState() {
  const [sysState, setSysState] = useState<SystemState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    // 1. Початкове завантаження конфігурації
    async function fetchState() {
      try {
        const { data, error } = await supabase
          .from("system_state")
          .select("*")
          .eq("id", 1) // Завжди беремо єдиний рядок конфігу
          .single();

        if (error) throw error;
        
        if (isMounted && data) {
          setSysState(data as SystemState);
        }
      } catch (err) {
        console.error("Помилка завантаження стану системи:", err);
        toast.error("Помилка ініціалізації", { 
          description: "Не вдалося отримати конфігурацію ядра." 
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchState();

    // 2. Підписка на оновлення в реальному часі
    const subscription = supabase
      .channel("state_channel")
      .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "system_state" 
      }, (payload) => {
        const newState = payload.new as SystemState;

        // Використовуємо callback для доступу до ПОПЕРЕДНЬОГО стану (prevState)
        setSysState((prevState) => {
          // Якщо Kill-Switch щойно увімкнули (раніше був false, став true)
          if (prevState && !prevState.kill_switch_active && newState.kill_switch_active) {
            playTerminalSound('siren');
            toast.warning("🚨 СИСТЕМНА ТРИВОГА", {
              description: "Kill-Switch активовано! Торгівлю зупинено.",
            });
          }

          // Якщо двигун увімкнули/вимкнули вручну з іншого пристрою (опціонально)
          if (prevState && prevState.is_running !== newState.is_running && !newState.kill_switch_active) {
            if (newState.is_running) {
               toast.success("Engine Online (Remote Update)");
            } else {
               toast.warning("Engine Paused (Remote Update)");
            }
          }

          return newState; // Оновлюємо стан UI
        });
      })
      .subscribe();

    // Очищення пам'яті
    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  return { sysState, isStateLoading: isLoading };
}