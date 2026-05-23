"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { playTerminalSound } from "@/lib/audio";

export interface SystemState {
  id: string;
  user_id: string;
  is_running: boolean;
  kill_switch_active: boolean;
  current_dynamic_whitelist: string[];
  last_ping: string;
  starting_balance: number;
  leverage: number;
  risk_per_trade_pct: number;
}

export function useSystemState() {
  const [sysState, setSysState] = useState<SystemState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchState() {
      try {
        const { data, error } = await supabase
          .from("bot_settings")
          .select("*")
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log("SystemState: Налаштування ще не створені.");
            return;
          }
          throw error;
        }
        
        if (isMounted && data) {
          setSysState(data as SystemState);
        }
      } catch (err) {
        console.error("Помилка завантаження стану системи:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchState();

    const channelName = `state_channel_${crypto.randomUUID()}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes", 
      { event: "UPDATE", schema: "public", table: "bot_settings" }, 
      (payload) => {
        const newState = payload.new as SystemState;

        setSysState((prevState) => {
          if (prevState && !prevState.kill_switch_active && newState.kill_switch_active) {
            playTerminalSound('siren');
            toast.warning("🚨 СИСТЕМНА ТРИВОГА", {
              description: "Kill-Switch активовано! Торгівлю зупинено.",
            });
          }

          if (prevState && prevState.is_running !== newState.is_running && !newState.kill_switch_active) {
            if (newState.is_running) {
               toast.success("Engine Online (Remote Update)");
            } else {
               toast.warning("Engine Paused (Remote Update)");
            }
          }

          return newState;
        });
      }
    ).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []); 

  return { sysState, isStateLoading: isLoading };
}