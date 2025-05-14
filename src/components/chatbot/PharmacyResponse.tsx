
import React from 'react';
import { Pill, AlertCircle, XCircle, Leaf, Apple, FileText, AlertTriangle } from 'lucide-react';
import { type GeminiResponse } from '@/services/geminiService';

interface PharmacyResponseProps {
  response: GeminiResponse;
}

const PharmacyResponse: React.FC<PharmacyResponseProps> = ({ response }) => {
  // For debugging - log the full response to see what we're getting
  console.log("Pharmacy response received:", {
    textLength: response.text?.length || 0,
    hasCategories: !!response.categories,
    categoryKeys: response.categories ? Object.keys(response.categories) : [],
    error: response.error || 'none'
  });
  
  // Check if the response indicates an unsupported or irrelevant query
  if (response.text?.includes("not a valid medical query") || 
      response.isRelevant === false ||
      response.error) {
    return (
      <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Invalid or Unsupported Query</h3>
            <p className="text-amber-700 dark:text-amber-200 mt-1">
              {response.error || "Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, indications, contraindications, herbal medicine alternatives, or food-based treatments."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we have raw text but no structured categories, parse the text into sections
  if (!response.categories || Object.keys(response.categories).length === 0) {
    console.log("No categories found, parsing from raw text");
    
    // Try to parse sections from the raw text
    const parsedCategories = parseRawTextToCategories(response.text);
    response.categories = parsedCategories;
  }
  
  // If we still don't have categories after trying to parse, just display the raw text
  if (!response.categories || Object.keys(response.categories).length === 0) {
    console.log("Showing raw text response as fallback");
    return <div className="whitespace-pre-wrap">{response.text || "No response received from the medical service."}</div>;
  }

  const { 
    diseaseDescription,
    drugRecommendations,
    sideEffects,
    contraindications,
    herbalAlternatives,
    foodBasedTreatments 
  } = response.categories;

  // Check if food-based treatments section contains the "No scientifically-backed" message
  const noFoodTreatments = foodBasedTreatments?.includes("No scientifically-backed food-based treatments found for this condition");

  return (
    <div className="space-y-4">
      {diseaseDescription && (
        <div className="space-y-2">
          <div className="flex items-center text-blue-500 font-medium gap-2">
            <FileText className="w-4 h-4" />
            <h3>1️⃣ Disease Description</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{diseaseDescription.replace(/•/g, '📌 ')}</div>
        </div>
      )}
      
      {drugRecommendations && (
        <div className="space-y-2">
          <div className="flex items-center text-primary font-medium gap-2">
            <Pill className="w-4 h-4" />
            <h3>2️⃣ Drug Recommendations</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{drugRecommendations.replace(/•/g, '💊 ')}</div>
        </div>
      )}
      
      {sideEffects && (
        <div className="space-y-2">
          <div className="flex items-center text-amber-500 font-medium gap-2">
            <AlertCircle className="w-4 h-4" />
            <h3>3️⃣ Side Effects & Indications</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{sideEffects.replace(/•/g, '🔹 ')}</div>
        </div>
      )}
      
      {contraindications && (
        <div className="space-y-2">
          <div className="flex items-center text-destructive font-medium gap-2">
            <XCircle className="w-4 h-4" />
            <h3>4️⃣ Contraindications & Interactions</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{contraindications.replace(/•/g, '⚠️ ')}</div>
        </div>
      )}
      
      {herbalAlternatives && (
        <div className="space-y-2">
          <div className="flex items-center text-green-600 font-medium gap-2">
            <Leaf className="w-4 h-4" />
            <h3>5️⃣ Herbal Medicine Alternatives</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{herbalAlternatives.replace(/•/g, '🌿 ')}</div>
        </div>
      )}
      
      {foodBasedTreatments && (
        <div className="space-y-2">
          <div className="flex items-center text-orange-500 font-medium gap-2">
            <Apple className="w-4 h-4" />
            <h3>6️⃣ Food-Based Treatments</h3>
          </div>
          <div className={`pl-6 text-sm whitespace-pre-line ${noFoodTreatments ? 'italic text-muted-foreground dark:text-gray-400' : 'dark:text-white'}`}>
            {foodBasedTreatments.replace(/•/g, noFoodTreatments ? '❗ ' : '🍎 ')}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-4">
        Disclaimer: This information is not a substitute for professional medical advice, diagnosis, or treatment.
      </div>
    </div>
  );
};

// Helper function to parse raw text into structured categories
function parseRawTextToCategories(text: string = "") {
  console.log("Attempting to parse raw text:", text.substring(0, 100) + "...");
  
  if (!text) return {};
  
  const categories: Record<string, string> = {};
  
  // Try to find sections using numbered headers like "1. DISEASE DESCRIPTION"
  const sectionRegexes = [
    { key: "diseaseDescription", regex: /1\.?\s*(?:DISEASE\s*)?DESCRIPTION\s*([\s\S]*?)(?=2\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i },
    { key: "drugRecommendations", regex: /2\.?\s*(?:DRUG\s*)?RECOMMENDATIONS\s*([\s\S]*?)(?=3\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i },
    { key: "sideEffects", regex: /3\.?\s*(?:SIDE\s*)?EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i },
    { key: "contraindications", regex: /4\.?\s*(?:CONTRA)?INDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i },
    { key: "herbalAlternatives", regex: /5\.?\s*(?:HERBAL\s*)?[^\n]*?(?:ALTERNATIVES?|MEDICINE|REMEDIES)\s*([\s\S]*?)(?=6\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i },
    { key: "foodBasedTreatments", regex: /6\.?\s*(?:FOOD[\s\-]*BASED)?\s*TREATMENTS?\s*([\s\S]*?)(?=Disclaimer|Medical\s*Disclaimer|$)/i }
  ];
  
  sectionRegexes.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      categories[key] = match[1].trim();
      console.log(`Parsed section: ${key} with content length: ${match[1].trim().length}`);
    }
  });
  
  // If we didn't find sections with numbers, try with just the section names
  if (Object.keys(categories).length < 4) {
    console.log("Trying alternative parsing method");
    
    const sectionNames = [
      { key: "diseaseDescription", names: ["DISEASE DESCRIPTION", "ABOUT THE CONDITION", "DESCRIPTION"] },
      { key: "drugRecommendations", names: ["DRUG RECOMMENDATIONS", "MEDICATIONS", "TREATMENTS"] },
      { key: "sideEffects", names: ["SIDE EFFECTS", "ADVERSE EFFECTS", "INDICATIONS"] },
      { key: "contraindications", names: ["CONTRAINDICATIONS", "INTERACTIONS", "WARNINGS"] },
      { key: "herbalAlternatives", names: ["HERBAL", "ALTERNATIVE MEDICINE", "NATURAL REMEDIES"] },
      { key: "foodBasedTreatments", names: ["FOOD", "DIETARY", "NUTRITION"] }
    ];
    
    // Split the text by double newlines to get sections
    const sections = text.split(/\n\s*\n/);
    
    sections.forEach(section => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return;
      
      // Check which section this might be
      sectionNames.forEach(({ key, names }) => {
        if (!categories[key] && names.some(name => trimmedSection.toUpperCase().includes(name))) {
          categories[key] = trimmedSection;
        }
      });
    });
  }
  
  // If we still don't have all sections, look for bullet points and distribute them
  if (Object.keys(categories).length < 6) {
    // If there are bullet points but not assigned to categories, try to distribute them
    const bulletPoints = text.match(/•[^\n]+((\n\s*•[^\n]+)*)/g);
    
    if (bulletPoints && bulletPoints.length >= 6) {
      if (!categories.diseaseDescription) categories.diseaseDescription = bulletPoints[0];
      if (!categories.drugRecommendations) categories.drugRecommendations = bulletPoints[1];
      if (!categories.sideEffects) categories.sideEffects = bulletPoints[2];
      if (!categories.contraindications) categories.contraindications = bulletPoints[3];
      if (!categories.herbalAlternatives) categories.herbalAlternatives = bulletPoints[4];
      if (!categories.foodBasedTreatments) categories.foodBasedTreatments = bulletPoints[5];
    }
  }
  
  // Last resort: if we couldn't parse anything meaningful, just use the whole text
  if (Object.keys(categories).length === 0) {
    categories.diseaseDescription = text;
  }
  
  // Create default values for any missing categories
  if (!categories.diseaseDescription) categories.diseaseDescription = "• Information about this condition not available\n• Please consult a healthcare professional";
  if (!categories.drugRecommendations) categories.drugRecommendations = "• Medication information not available\n• Please consult a healthcare professional";
  if (!categories.sideEffects) categories.sideEffects = "• Side effect information not available\n• All medications may have side effects";
  if (!categories.contraindications) categories.contraindications = "• Contraindication information not available\n• Always inform your doctor about all medications you take";
  if (!categories.herbalAlternatives) categories.herbalAlternatives = "• Herbal alternative information not available\n• Always consult with a healthcare provider before using herbal supplements";
  if (!categories.foodBasedTreatments) categories.foodBasedTreatments = "• No scientifically-backed food-based treatments found for this condition";
  
  console.log("Parsing complete, found categories:", Object.keys(categories).join(", "));
  return categories;
}

export default PharmacyResponse;
