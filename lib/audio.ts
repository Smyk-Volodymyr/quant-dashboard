"use client";

type SoundType = 'profit' | 'loss' | 'siren';

export const playTerminalSound = (type: SoundType) => {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = type === 'siren' ? 0.8 : 0.5;
    
    audio.play().catch(e => console.warn("Audio autoplay prevented by browser:", e));
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
};