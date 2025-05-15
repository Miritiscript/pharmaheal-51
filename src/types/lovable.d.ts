
/**
 * Type definitions for Lovable environment
 */

interface LovableWindow {
  version: string;
  // Add other properties as needed in the future
}

declare global {
  interface Window {
    lovable?: LovableWindow;
  }
}

export {};
