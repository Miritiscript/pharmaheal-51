
// A service to interact with Google's Gemini API

const GEMINI_API_KEY = "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

export interface GeminiResponse {
  text: string;
  categories?: {
    diseaseDescription?: string;
    drugRecommendations?: string;
    sideEffects?: string;
    contraindications?: string;
    herbalAlternatives?: string;
    foodBasedTreatments?: string;
  };
}

// List of topics that are considered medical and within scope
const MEDICAL_TOPIC_KEYWORDS = [
  "disease", "symptom", "diagnosis", "treatment", "medicine", "drug", "medication",
  "antibiotic", "vaccine", "health", "medical", "doctor", "nurse", "pharmacy",
  "hospital", "clinic", "patient", "dosage", "prescription", "side effect", "pain",
  "blood", "heart", "kidney", "liver", "lung", "brain", "surgery", "cancer", "diabetes",
  "hypertension", "asthma", "arthritis", "allergies", "virus", "infection", "condition",
  "syndrome", "disorder", "supplement", "vitamin", "mineral", "nutrition", "diet",
  "wellness", "herbal", "natural remedy", "alternative medicine", "contraindication",
  "interaction", "immune", "chronic", "acute", "dose", "recovery", "therapy", "wound",
  "injury", "emergency", "preventive", "healing", "illness", "prescription"
];

// Function to check if a query is medical-related
const isMedicalQuery = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase();
  
  // Check for known non-medical topics
  const nonMedicalIndicators = [
    /\b(celebrity|movie|song|actor|actress|singer|film|tv show|television|sports|team|player|game|politics|politician|election|president)\b/i,
    /\b(car|vehicle|truck|bus|train|plane|airplane|transportation|travel|vacation|hotel|resort)\b/i,
    /\b(computer|laptop|phone|smartphone|device|gadget|technology|app|software|program|code|programming)\b/i,
    /\b(history|war|battle|king|queen|emperor|empire|country|nation|region)\b/i,
    /\b(food recipe|restaurant|cooking|chef|meal|dinner|lunch|breakfast)\b/i,
    /\b(music|band|concert|album|song|genre|artist)\b/i,
  ];
  
  for (const regex of nonMedicalIndicators) {
    if (regex.test(normalizedQuery)) {
      return false;
    }
  }
  
  // Check for medical keywords
  for (const keyword of MEDICAL_TOPIC_KEYWORDS) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // If no clear indicators are found, perform a more detailed analysis
  
  // Check for "what is" questions about specific conditions
  if (normalizedQuery.includes("what is") || 
      normalizedQuery.includes("how to treat") || 
      normalizedQuery.includes("symptoms of") ||
      normalizedQuery.includes("causes of") ||
      normalizedQuery.includes("cure for") ||
      normalizedQuery.includes("medicine for") ||
      normalizedQuery.includes("remedy for")) {
    return true;
  }
  
  // Default to being cautious - if we're not sure, assume it's not medical
  return false;
};

export const generatePharmacyResponse = async (query: string): Promise<GeminiResponse> => {
  if (!query.trim()) {
    throw new Error("Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, indications, contraindications, herbal medicine alternatives, or food-based treatments.");
  }
  
  // Check if the query is medical-related
  if (!isMedicalQuery(query)) {
    throw new Error("PharmaHeal is a medical assistant. Please ask a question related to health, medication, or wellness.");
  }
  
  try {
    const prompt = `
You are an AI pharmacy assistant providing information about medications, treatments, and health conditions. 
Provide accurate, comprehensive, and helpful information about the following query: "${query}"

Format your response with the following sections, using bullet points for each item (not paragraphs):

1. DISEASE DESCRIPTION: Provide key details in point form on the cause, nature, and background of the disease/condition
   Format each point as: "• Key information about the disease/condition"

2. DRUG RECOMMENDATIONS: List effective medications with proper dosage guidelines
   Format each recommendation as: "• Drug name – Recommended dosage"

3. SIDE EFFECTS & INDICATIONS: Warnings on potential side effects and drug use cases
   Format each item as: "• Main side effect/indication"

4. CONTRAINDICATIONS & INTERACTIONS: Medical conditions, allergies, or drug interactions to be aware of
   Format each item as: "• Contraindication/interaction"

5. HERBAL MEDICINE ALTERNATIVES: Scientifically supported natural remedies if applicable
   Format each item as: "• Herbal alternative - usage/dosage"

6. FOOD-BASED TREATMENTS: Nutritional guidance and dietary recommendations
   Format each item as: "• Food item - benefit"
   
   IF NO FOOD-BASED TREATMENTS EXIST for this condition, clearly state: "• No scientifically-backed food-based treatments found for this condition."
   
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
  const diseaseDescriptionMatch = text.match(/DISEASE DESCRIPTION:?([\s\S]*?)(?=DRUG RECOMMENDATIONS|$)/i);
  const drugRecommendationsMatch = text.match(/DRUG RECOMMENDATIONS:?([\s\S]*?)(?=SIDE EFFECTS|$)/i);
  const sideEffectsMatch = text.match(/SIDE EFFECTS[^:]*:?([\s\S]*?)(?=CONTRAINDICATIONS|$)/i);
  const contraindicationsMatch = text.match(/CONTRAINDICATIONS[^:]*:?([\s\S]*?)(?=HERBAL MEDICINE|$)/i);
  const herbalAlternativesMatch = text.match(/HERBAL MEDICINE[^:]*:?([\s\S]*?)(?=FOOD-BASED|$)/i);
  const foodBasedTreatmentsMatch = text.match(/FOOD-BASED TREATMENTS:?([\s\S]*?)(?=\n\n|$)/i);
  
  if (diseaseDescriptionMatch?.[1]) categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
  if (drugRecommendationsMatch?.[1]) categories.drugRecommendations = drugRecommendationsMatch[1].trim();
  if (sideEffectsMatch?.[1]) categories.sideEffects = sideEffectsMatch[1].trim();
  if (contraindicationsMatch?.[1]) categories.contraindications = contraindicationsMatch[1].trim();
  if (herbalAlternativesMatch?.[1]) categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
  if (foodBasedTreatmentsMatch?.[1]) categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
  
  return categories;
};
