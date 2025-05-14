
import { GeminiResponse } from "@/services/geminiService";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  pharmacyData?: any;
  fallbackUsed?: boolean;
  error?: boolean;
  source?: string; // Added source property to track which system provided the response
}

export interface ChatHistory {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title: string;
}
