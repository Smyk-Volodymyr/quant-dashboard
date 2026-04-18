"use client";

import React, { memo, useState, useEffect } from "react";
import { useEngineControl } from "@/hooks/useEngineControl";
import { AlertOctagon, PauseCircle, PlayCircle, ShieldAlert } from "lucide-react";

interface ManualOverridesPanelProps {
  isRunning: boolean;
  killSwitchActive: boolean;
}

export const ManualOverridesPanel: React.FC<ManualOverridesPanelProps> = memo(({ isRunning, killSwitchActive }) => {
  const { toggleEngine, triggerKillSwitch, isMutating } = useEngineControl();
  const [confirmKill, setConfirmKill] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmKill) {
      timer = setTimeout(() => setConfirmKill(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [confirmKill]);

  const handleKillSwitchClick = () => {
    if (!confirmKill) {
      setConfirmKill(true);
    } else {
      triggerKillSwitch();
      setConfirmKill(false);
    }
  };

  return (
    <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col relative overflow-hidden">
      {killSwitchActive && <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>}

      <div className="px-5 py-4 border-b border-white/5 flex items-center relative z-10">
        <ShieldAlert size={16} className="mr-2 text-orange-500" />
        <h2 className="font-mono text-sm tracking-widest text-slate-200 uppercase">System Overrides</h2>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between p-4 bg-[#000000]/50 border border-white/5 rounded-xl">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-300">Trading Engine</h3>
            <p className="text-[10px] text-slate-600 mt-1 uppercase font-mono">
              {isRunning ? "ACTIVE / EXECUTING" : "HALTED / NO NEW ENTRIES"}
            </p>
          </div>
          <button
            onClick={() => toggleEngine(isRunning)}
            disabled={isMutating || killSwitchActive}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${isRunning ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full transition-transform ${isRunning ? 'translate-x-6 bg-green-400 shadow-[0_0_10px_#4ade80]' : 'translate-x-1 bg-slate-500'}`} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleKillSwitchClick}
            disabled={isMutating || killSwitchActive}
            className={`w-full py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center disabled:opacity-50 ${killSwitchActive
              ? 'bg-red-950/30 text-red-500 border-red-900/50 cursor-not-allowed'
              : confirmKill
                ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
                : 'bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500/10'
              }`}
          >
            <AlertOctagon className="mr-2" size={16} />
            {killSwitchActive ? "SYSTEM LOCKED" : confirmKill ? "CONFIRM EMERGENCY STOP" : "FORCE KILL-SWITCH"}
          </button>
        </div>
      </div>
    </article>
  );
});

ManualOverridesPanel.displayName = "ManualOverridesPanel";