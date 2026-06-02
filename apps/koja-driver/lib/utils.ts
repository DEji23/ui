import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
}
