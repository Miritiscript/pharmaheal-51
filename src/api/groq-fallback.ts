
// Function to simulate the Supabase Edge Function behavior for local development
// This provides a consistent API interface whether we're in development or production

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
    const { model, messages, temperature, max_tokens, top_p } = body;
    
    console.log("Groq fallback API called with:", {
      modelRequested: model,
      messageCount: messages?.length || 0,
      firstMessagePreview: messages?.[0]?.content?.substring(0, 50)
    });
    
    // Extract the first user message for better logging
    const userMessage = messages?.find((m: any) => m.role === 'user')?.content || '';
    console.log(`Processing query: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`);
    
    // In a real implementation, this would call the Groq API
    // For this simulation, we'll return a formatted mock response
    // that matches the expected structure from the Gemini client
    
    return new Response(JSON.stringify({
      id: "chatcmpl-mock-id",
      object: "chat.completion",
      created: Date.now(),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: `
1. DISEASE DESCRIPTION
• Tuberculosis (TB) is a bacterial infection caused by Mycobacterium tuberculosis
• It primarily affects the lungs (pulmonary TB) but can affect other parts of the body
• TB is spread through airborne particles when infected individuals cough or sneeze

2. DRUG RECOMMENDATIONS
• First-line treatment: Combination therapy with isoniazid (INH), rifampin (RIF), ethambutol (EMB), and pyrazinamide (PZA)
• Standard treatment duration is 6-9 months, with initial intensive phase (2 months) followed by continuation phase
• Directly Observed Therapy (DOT) is recommended to ensure adherence

3. SIDE EFFECTS & INDICATIONS
• Isoniazid: Peripheral neuropathy, hepatotoxicity
• Rifampin: Orange discoloration of bodily fluids, drug interactions
• Ethambutol: Optic neuritis, decreased visual acuity
• Pyrazinamide: Hepatotoxicity, hyperuricemia

4. CONTRAINDICATIONS & INTERACTIONS
• Liver disease may require modified regimens due to hepatotoxicity risk
• Rifampin has significant interactions with many medications including oral contraceptives
• Previous allergic reactions to anti-TB medications
• Pregnancy considerations for certain medications

5. HERBAL MEDICINE ALTERNATIVES
• Herbal remedies are NOT recommended as primary treatment for TB
• Some immune-boosting herbs may be used as adjuncts only
• Always consult healthcare providers before using any herbal products
• No herbal treatment has been clinically proven effective against TB

6. FOOD-BASED TREATMENTS
• High-protein, calorie-rich diet to support recovery
• Foods rich in vitamins A, C, E, and zinc may support immune function
• Adequate hydration is important during treatment
• No specific food can cure TB; diet supports conventional treatment

Medical Disclaimer: This information is provided by an AI fallback system and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.`
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
    console.error("Error in mock Groq endpoint:", error);
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
