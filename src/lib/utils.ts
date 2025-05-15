
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detects if the application is running in the Lovable environment
 */
export function isLovableEnvironment(): boolean {
  return typeof window !== 'undefined' && 'lovable' in window;
}

/**
 * Gets the current Lovable version if available
 */
export function getLovableVersion(): string | null {
  if (isLovableEnvironment() && window.lovable?.version) {
    return window.lovable.version;
  }
  return null;
}
