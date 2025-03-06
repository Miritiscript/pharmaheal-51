
import { GeminiResponse } from "@/services/geminiService";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  pharmacyData?: GeminiResponse;
}
