"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface PingIndicatorProps {
  lastPing?: string;
}

export const PingIndicator: React.FC<PingIndicatorProps> = ({ lastPing }) => {
  const [timeAgo, setTimeAgo] = useState<string>("WAITING...");
  const [status, setStatus] = useState<'healthy' | 'warning' | 'critical'>('warning');

  useEffect(() => {
    if (!lastPing) return;

    const updatePing = () => {
      const now = new Date();
      const pingTime = new Date(lastPing);
      const diffSec = Math.max(0, Math.floor((now.getTime() - pingTime.getTime()) / 1000));

      if (diffSec < 15) {
        setStatus('healthy');
        setTimeAgo(`${diffSec}s ago`);
      } else if (diffSec < 60) {
        setStatus('warning');
        setTimeAgo(`${diffSec}s ago`);
      } else {
        setStatus('critical');
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    updatePing();
    const interval = setInterval(updatePing, 1000);

    return () => clearInterval(interval);
  }, [lastPing]);

  const styles = {
    healthy: { color: 'text-green-400', icon: Wifi, bg: 'bg-green-500/10 border-green-500/20' },
    warning: { color: 'text-yellow-400', icon: Wifi, bg: 'bg-yellow-500/10 border-yellow-500/20' },
    critical: { color: 'text-red-400', icon: WifiOff, bg: 'bg-red-500/10 border-red-500/20' }
  };

  const CurrentStyle = styles[status];
  const Icon = CurrentStyle.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 border rounded-full transition-colors ${CurrentStyle.bg}`}
      title="Останній сигнал від бекенд-ядра бота"
    >
      <Icon size={12} className={`${CurrentStyle.color} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
        Ping: <span className={`font-bold ${CurrentStyle.color}`}>{timeAgo}</span>
      </span>
    </div>
  );
};