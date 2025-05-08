
// This file simulates the Supabase Edge Function for local development
// In production, this would be replaced by the actual Supabase Edge Function

export default async function handler(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { model, messages, temperature, max_tokens, top_p } = body;
    
    // In a real implementation, this would call the Groq API
    // For this simulation, we'll return a mock response
    
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
• This is a fallback response from the Groq/Llama model
• The condition being described may require medical attention
• This information is provided as a fallback when primary sources are unavailable

2. DRUG RECOMMENDATIONS
• Medication choices should be determined by healthcare professionals
• Dosing must be personalized based on individual factors
• Regular monitoring is essential for all treatments

3. SIDE EFFECTS & INDICATIONS
• All medications have potential side effects that should be discussed with your doctor
• Benefits must outweigh risks for any treatment plan
• Report any new symptoms to your healthcare provider immediately

4. CONTRAINDICATIONS & INTERACTIONS
• Inform your doctor about all medications you are taking
• Some medical conditions may preclude certain treatments
• Drug-drug interactions can cause serious adverse events

5. HERBAL MEDICINE ALTERNATIVES
• Herbal medicine should be used under professional guidance
• Evidence for effectiveness varies widely
• Interactions with conventional medicine can occur

6. FOOD-BASED TREATMENTS
• Diet modifications may help manage certain conditions
• Nutritional counseling may be beneficial
• A balanced diet supports overall health during treatment

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
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in mock Groq endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
