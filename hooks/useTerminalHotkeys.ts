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
      // e.metaKey = Cmd (на Mac), e.ctrlKey = Ctrl (на Windows)
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (!isCmdOrCtrl) return;

      // Cmd + K : KILL-SWITCH
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault(); // Зупиняємо стандартну поведінку браузера
        
        if (sysState?.kill_switch_active || isMutating) {
          toast("Система вже заблокована", { description: "Kill-Switch вже активний." });
          return;
        }

        // Тут ми не питаємо confirmKill, бо хоткей - це вже усвідомлена дія
        toast.error("Executing Emergency Override...");
        await triggerKillSwitch();
      }

      // Cmd + P : PAUSE / PLAY ENGINE
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault(); // Забороняємо браузеру відкривати меню Друку (Print)
        
        if (sysState?.kill_switch_active || isMutating) return;

        const currentState = sysState?.is_running ?? false;
        toast("Manual Override", { 
          description: currentState ? "Pausing Engine..." : "Starting Engine..." 
        });
        
        // Відправляємо протилежний стан (інверсія поточного)
        await toggleEngine(!currentState);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sysState, toggleEngine, triggerKillSwitch, isMutating]);
}