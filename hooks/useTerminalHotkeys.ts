"use client";

import { useEffect } from "react";
import { useEngineControl } from "./useEngineControl";
import { useSystemState } from "./useSystemState";
import { toast } from "sonner";

export function useTerminalHotkeys() {
  const { toggleEngine, triggerKillSwitch, isMutating } = useEngineControl();
  const { sysState } = useSystemState();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        
        if (sysState?.kill_switch_active || isMutating) {
          toast("Система вже заблокована", { description: "Kill-Switch вже активний." });
          return;
        }

        toast.error("Executing Emergency Override...");
        await triggerKillSwitch();
      }

      if (e.key.toLowerCase() === 'p') {
        e.preventDefault(); 
        
        if (sysState?.kill_switch_active || isMutating) return;

        const currentState = sysState?.is_running ?? false;
        toast("Manual Override", { 
          description: currentState ? "Pausing Engine..." : "Starting Engine..." 
        });
        
        await toggleEngine(!currentState);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sysState, toggleEngine, triggerKillSwitch, isMutating]);
}