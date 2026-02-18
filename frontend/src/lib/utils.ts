import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeLeft(pickupTimeEnd: string, nowMs?: number): string {
  try {
    const [hh, mm, ss] = pickupTimeEnd.split(':').map(Number);
    const now = nowMs != null ? new Date(nowMs) : new Date();
    const endTime = new Date();
    endTime.setHours(hh || 23, mm || 59, ss || 59, 0);
    
    // If time already passed today, add a day
    if (endTime <= now) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'заканчивается';
    
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    
    if (h > 0) return `${h}ч ${m}м`;
    if (m > 0) return `${m}м ${s}с`;
    return `${s}с`;
  } catch {
    return 'заканчивается';
  }
}
