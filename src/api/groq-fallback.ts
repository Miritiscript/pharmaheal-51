
// Function to simulate the Supabase Edge Function behavior for local development
// This provides a consistent API interface whether we're in development or production

import { generateLocalFallbackResponse } from '../services/medical/localFallback';

export default async function handler(req: Request): Promise<Response> {
  try {
    // Define standard headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers, status: 204 });
    }

    const body = await req.json();
    const { messages } = body;
    
    console.log("Local Groq fallback API called with:", {
      messageCount: messages?.length || 0,
      firstMessagePreview: messages?.[0]?.content?.substring(0, 50)
    });
    
    // Extract the first user message for better logging and processing
    const userMessage = messages?.find((m: any) => m.role === 'user')?.content || '';
    console.log(`Processing query locally: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`);
    
    // Generate a response using our local fallback system
    const responseText = await generateLocalFallbackResponse(userMessage);
    
    // Return a structured response matching Groq's API format
    return new Response(JSON.stringify({
      id: "chatcmpl-local-" + Date.now().toString(),
      object: "chat.completion",
      created: Date.now(),
      model: "local-fallback",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: responseText
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 500,
        total_tokens: 600
      }
    }), {
      headers
    });
  } catch (error) {
    console.error("Error in local Groq endpoint:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
      fallbackMessage: "Sorry, we're unable to find a response right now. Please try again later."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
