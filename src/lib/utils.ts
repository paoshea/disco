import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge for optimal CSS class handling
 * @param inputs - Class names to combine
 * @returns Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats a number to a human-readable string with units
 * @param value - Number to format
 * @param unit - Unit to append (optional)
 * @returns Formatted string
 */
export function formatNumber(value: number, unit?: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  });

  if (value >= 1_000_000) {
    return `${formatter.format(value / 1_000_000)}M${unit ? ' ' + unit : ''}`;
  }
  if (value >= 1_000) {
    return `${formatter.format(value / 1_000)}k${unit ? ' ' + unit : ''}`;
  }
  return `${formatter.format(value)}${unit ? ' ' + unit : ''}`;
}

/**
 * Debounces a function call
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Creates a throttled function that only invokes the provided function at most once per wait period
 * @param fn - Function to throttle
 * @param wait - Wait period in milliseconds
 * @returns Throttled function
 */
export function throttle<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  wait: number
): (...args: Args) => void {
  let lastCall = 0;
  return function (...args: Args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      fn(...args);
      lastCall = now;
    }
  };
}

/**
 * Generates a random string of specified length
 * @param length - Length of the string to generate
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value - Value to check
 * @returns True if empty, false otherwise
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
