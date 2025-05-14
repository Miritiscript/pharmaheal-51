
/**
 * Type definitions for the Gemini API client configuration
 */
export interface GeminiConfig {
  API_URL: string;
  API_KEY: string;
  DEFAULT_PARAMS: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  TIMEOUT_MS: number;
}

/**
 * Types for consistency checking in response formats
 */
export interface GeminiResponseFormat {
  diseaseDescription?: string;
  drugRecommendations?: string;
  sideEffects?: string;
  contraindications?: string;
  herbalAlternatives?: string;
  foodBasedTreatments?: string;
}

/**
 * Type for the enhanced response parser outputs
 */
export interface ParsedSections {
  [key: string]: string;
}
