
// Follow this setup guide to integrate the Supabase Edge Functions with your app:
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 15000;

interface RequestBody {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info"
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("CORS preflight request received");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    console.log("Request received:", JSON.stringify(requestData).substring(0, 200) + "...");
    
    // Extract the query from the messages
    const query = requestData.messages?.find(m => m.role === "user")?.content || "";
    console.log(`Processing query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    
    const { 
      model = "llama-3.1-70b-versatile", 
      messages, 
      temperature = 0.7, 
      max_tokens = 4096, 
      top_p = 1.0 
    } = requestData as RequestBody;
    
    // Get the Groq API key from environment variables
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      console.error("GROQ_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "GROQ_API_KEY environment variable is not set",
          fallbackMessage: "Sorry, we're unable to find a response right now. Please try again later."
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log(`Calling Groq API with model: ${model}`);
    
    // Create a promise with timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), DEFAULT_TIMEOUT_MS);
    });
    
    // Call the Groq API with timeout
    const responsePromise = fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p
      })
    });
    
    // Race between API call and timeout
    const response = await Promise.race([responsePromise, timeoutPromise]) as Response;

    // If the API call wasn't successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      console.error(`HTTP status: ${response.status}, statusText: ${response.statusText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Groq API error: ${response.status}`, 
          fallbackMessage: "Fallback response triggered, Groq not available."
        }),
        { headers: corsHeaders, status: response.status }
      );
    }

    // Return the API response
    const data = await response.json();
    console.log("Groq API response received, length:", JSON.stringify(data).length);
    console.log("Response choices:", data.choices ? data.choices.length : "none");
    
    return new Response(JSON.stringify(data), { headers: corsHeaders });
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return a structured error response with a fallback message
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        fallbackMessage: "Sorry, we're unable to find a response right now. Please try again later."
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
