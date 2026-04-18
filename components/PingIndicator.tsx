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

    // Функція, яка вираховує різницю в часі
    const updatePing = () => {
      const now = new Date();
      const pingTime = new Date(lastPing);
      // Math.max(0, ...) рятує від розсинхрону часу між сервером і комп'ютером
      const diffSec = Math.max(0, Math.floor((now.getTime() - pingTime.getTime()) / 1000));

      if (diffSec < 15) {
        // До 15 секунд — все ідеально
        setStatus('healthy');
        setTimeAgo(`${diffSec}s ago`);
      } else if (diffSec < 60) {
        // Від 15 до 60 секунд — затримка (можливо, велике навантаження)
        setStatus('warning');
        setTimeAgo(`${diffSec}s ago`);
      } else {
        // Більше хвилини — бот, швидше за все, впав або завис
        setStatus('critical');
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    updatePing(); // Викликаємо одразу при рендері
    const interval = setInterval(updatePing, 1000); // Оновлюємо кожну секунду

    return () => clearInterval(interval); // Очищаємо пам'ять
  }, [lastPing]);

  // Візуальні стилі залежно від статусу
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