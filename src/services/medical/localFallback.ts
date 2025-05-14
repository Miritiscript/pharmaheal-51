
import { CommonDiseases } from './commonDiseases';

/**
 * Generates a local fallback response when both Gemini and Groq APIs fail
 * This helps maintain a consistent user experience even during API outages
 */
export const generateLocalFallbackResponse = async (prompt: string): Promise<string> => {
  console.log("Generating local fallback response for:", prompt.substring(0, 100) + "...");
  
  // Extract potential disease/condition keywords from the prompt
  const promptLower = prompt.toLowerCase();
  
  // Check if any common disease names are in the prompt
  const matchedDisease = CommonDiseases.find(disease => 
    promptLower.includes(disease.name.toLowerCase()) ||
    disease.alternateNames.some(alt => promptLower.includes(alt.toLowerCase()))
  );
  
  // If we have a matched disease, return its pre-written content
  if (matchedDisease) {
    console.log("Found matched disease for local fallback:", matchedDisease.name);
    return matchedDisease.content;
  }
  
  // Extract keywords that might indicate what the query is about
  const medicalKeywords = [
    "disease", "condition", "syndrome", "disorder",
    "treatment", "medication", "drug", "pill", "medicine",
    "therapy", "symptom", "diagnosis", "prevention"
  ];
  
  const foundKeywords = medicalKeywords.filter(keyword => promptLower.includes(keyword));
  
  // Create a general response based on keywords found
  let responseTitle = "your medical query";
  
  if (foundKeywords.length > 0) {
    if (promptLower.includes("treatment") || promptLower.includes("drug") || 
        promptLower.includes("medication") || promptLower.includes("medicine")) {
      responseTitle = "this treatment";
    } else if (promptLower.includes("disease") || promptLower.includes("condition") || 
               promptLower.includes("syndrome") || promptLower.includes("disorder")) {
      responseTitle = "this condition";
    }
  }
  
  // Generate a query-customized but generic structured response
  return `
1. DISEASE DESCRIPTION
• ${responseTitle.charAt(0).toUpperCase() + responseTitle.slice(1)} is a recognized medical concern
• Multiple factors may contribute to its development including genetic and environmental factors
• Proper medical evaluation and diagnosis is recommended for accurate information

2. DRUG RECOMMENDATIONS
• Treatment options should be determined by healthcare professionals
• Medications are typically prescribed based on specific diagnosis, severity, and patient factors
• Please consult with a qualified healthcare provider for personalized treatment recommendations

3. SIDE EFFECTS & INDICATIONS
• All medications have potential side effects that vary by individual
• Common side effects depend on the specific treatment prescribed
• Close monitoring during treatment is essential

4. CONTRAINDICATIONS & INTERACTIONS
• Many medications have specific contraindications
• Drug interactions are possible with various medications
• Always inform your healthcare provider about all medications you take

5. HERBAL MEDICINE ALTERNATIVES
• Some complementary treatments may be used alongside conventional medicine
• Evidence for alternative treatments varies significantly
• Discuss all alternative treatments with your healthcare provider

6. FOOD-BASED TREATMENTS
• Dietary changes may help manage symptoms or support treatment
• Specific nutritional needs should be discussed with healthcare providers
• A balanced diet is generally recommended during treatment

Medical Disclaimer: This information is provided by a local backup system and is not a substitute for professional medical advice. Please consult qualified healthcare professionals for diagnosis and treatment.`;
};
