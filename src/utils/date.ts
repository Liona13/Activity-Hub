import { DATE_FORMATS } from '@/constants/config';

export function formatDate(date: string | Date, format: keyof typeof DATE_FORMATS = 'FULL'): string {
  return new Date(date).toLocaleDateString('en-US', DATE_FORMATS[format]);
}

export function isDateInPast(date: string | Date): boolean {
  return new Date(date) < new Date();
}

export function isDateInFuture(date: string | Date): boolean {
  return new Date(date) > new Date();
}

export function getActivityStatus(startDate: string | Date, endDate: string | Date): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

export function getRelativeTimeString(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) > 7) {
    return formatDate(date, 'SHORT');
  }

  if (diffInDays > 0) return `in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
  if (diffInDays < 0) return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ago`;
  if (diffInHours > 0) return `in ${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
  if (diffInHours < 0) return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) === 1 ? '' : 's'} ago`;
  if (diffInMinutes > 0) return `in ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`;
  if (diffInMinutes < 0) return `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) === 1 ? '' : 's'} ago`;
  return 'just now';
} 