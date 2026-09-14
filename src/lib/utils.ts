import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hr`;
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isStudentNavActive(pathname: string, label: string): boolean {
  const p = pathname.split('?')[0].replace(/\/$/, '') || '/';

  if (label === 'Home') {
    return p === '/' || p === '/dashboard' || p === '/home';
  }

  if (label === 'Results') {
    return p.startsWith('/results') || p.startsWith('/my-tests') || p.includes('/results/');
  }

  if (label === 'Exams') {
    if (p.includes('/results/')) return false;
    return p.startsWith('/exams') || p.startsWith('/tests');
  }

  if (label === 'Practice') {
    return p.startsWith('/practice');
  }

  if (label === 'Profile') {
    return p.startsWith('/profile') || p.startsWith('/settings');
  }

  return false;
}
