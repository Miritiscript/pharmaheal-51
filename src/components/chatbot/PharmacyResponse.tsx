
import React from 'react';
import { Pill, AlertCircle, XCircle, Leaf, Apple, FileText, AlertTriangle } from 'lucide-react';
import { type GeminiResponse } from '@/services/geminiService';

interface PharmacyResponseProps {
  response: GeminiResponse;
}

const PharmacyResponse: React.FC<PharmacyResponseProps> = ({ response }) => {
  // Check if the response indicates an unsupported or irrelevant query
  if (response.text?.includes("not a valid medical query") || 
      !response.categories || 
      Object.keys(response.categories).length === 0) {
    return (
      <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Invalid or Unsupported Query</h3>
            <p className="text-amber-700 dark:text-amber-200 mt-1">
              Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, 
              indications, contraindications, herbal medicine alternatives, or food-based treatments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we have a normal text response without categories
  if (!response.categories) {
    return <div className="whitespace-pre-wrap">{response.text}</div>;
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
          <div className="pl-6 text-sm whitespace-pre-line dark:text-white">{drugRecommendations}</div>
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

export default PharmacyResponse;
