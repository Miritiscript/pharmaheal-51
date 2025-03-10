
// A service to interact with Google's Gemini API

const GEMINI_API_KEY = "AIzaSyD1qnDdRGGrwWmZp9Fp_pz1NYEFnhkcsMo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export interface GeminiResponse {
  text: string;
  categories?: {
    drugRecommendations?: string;
    sideEffects?: string;
    contraindications?: string;
    herbalAlternatives?: string;
    foodBasedTreatments?: string;
  };
}

export const generatePharmacyResponse = async (query: string): Promise<GeminiResponse> => {
  try {
    const prompt = `
You are an AI pharmacy assistant providing information about medications, treatments, and health conditions. 
Provide accurate, comprehensive, and helpful information about the following query: "${query}"

Format your response with the following sections, using bullet points for each item (not paragraphs):

1. DRUG RECOMMENDATIONS: List effective medications with proper dosage guidelines
   Format each recommendation as: "• Drug name – Recommended dosage"

2. SIDE EFFECTS & INDICATIONS: Warnings on potential side effects and drug use cases
   Format each item as: "• Main side effect/indication"

3. CONTRAINDICATIONS & INTERACTIONS: Medical conditions, allergies, or drug interactions to be aware of
   Format each item as: "• Contraindication/interaction"

4. HERBAL MEDICINE ALTERNATIVES: Scientifically supported natural remedies if applicable
   Format each item as: "• Herbal alternative - usage/dosage"

5. FOOD-BASED TREATMENTS: Nutritional guidance and dietary recommendations
   Format each item as: "• Food item - benefit"
   THIS SECTION IS REQUIRED - Always include food-based treatments that may help with the condition
   
All information should be presented in bullet point format (•) for easy reading, never in paragraphs.
Each section should have at least 3-5 bullet points with brief, concise information.

Important: Always include a disclaimer that this information is not a substitute for professional medical advice.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Failed to get response from Gemini API");
    }

    // Extract the generated text
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Parse the structured information based on sections
    const categories = parseCategories(text);

    return {
      text,
      categories,
    };
  } catch (error) {
    console.error("Error generating pharmacy response:", error);
    throw error;
  }
};

const parseCategories = (text: string): GeminiResponse["categories"] => {
  const categories: GeminiResponse["categories"] = {};
  
  // Extract sections based on headers
  const drugRecommendationsMatch = text.match(/DRUG RECOMMENDATIONS:?([\s\S]*?)(?=SIDE EFFECTS|$)/i);
  const sideEffectsMatch = text.match(/SIDE EFFECTS[^:]*:?([\s\S]*?)(?=CONTRAINDICATIONS|$)/i);
  const contraindicationsMatch = text.match(/CONTRAINDICATIONS[^:]*:?([\s\S]*?)(?=HERBAL MEDICINE|$)/i);
  const herbalAlternativesMatch = text.match(/HERBAL MEDICINE[^:]*:?([\s\S]*?)(?=FOOD-BASED|$)/i);
  const foodBasedTreatmentsMatch = text.match(/FOOD-BASED TREATMENTS:?([\s\S]*?)(?=\n\n|$)/i);
  
  if (drugRecommendationsMatch?.[1]) categories.drugRecommendations = drugRecommendationsMatch[1].trim();
  if (sideEffectsMatch?.[1]) categories.sideEffects = sideEffectsMatch[1].trim();
  if (contraindicationsMatch?.[1]) categories.contraindications = contraindicationsMatch[1].trim();
  if (herbalAlternativesMatch?.[1]) categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
  if (foodBasedTreatmentsMatch?.[1]) categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
  
  return categories;
};
