
import React from 'react';
import { Pill, AlertCircle, XCircle, Leaf, Apple } from 'lucide-react';
import { type GeminiResponse } from '@/services/geminiService';

interface PharmacyResponseProps {
  response: GeminiResponse;
}

const PharmacyResponse: React.FC<PharmacyResponseProps> = ({ response }) => {
  if (!response.categories) {
    return <div className="whitespace-pre-wrap">{response.text}</div>;
  }

  const { 
    drugRecommendations,
    sideEffects,
    contraindications,
    herbalAlternatives,
    foodBasedTreatments 
  } = response.categories;

  return (
    <div className="space-y-4">
      {drugRecommendations && (
        <div className="space-y-2">
          <div className="flex items-center text-primary font-medium gap-2">
            <Pill className="w-4 h-4" />
            <h3>✅ Drug Recommendations</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line">{drugRecommendations}</div>
        </div>
      )}
      
      {sideEffects && (
        <div className="space-y-2">
          <div className="flex items-center text-amber-500 font-medium gap-2">
            <AlertCircle className="w-4 h-4" />
            <h3>✅ Side Effects & Indications</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line">{sideEffects.replace(/•/g, '🔹 ')}</div>
        </div>
      )}
      
      {contraindications && (
        <div className="space-y-2">
          <div className="flex items-center text-destructive font-medium gap-2">
            <XCircle className="w-4 h-4" />
            <h3>✅ Contraindications & Interactions</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line">{contraindications.replace(/•/g, '⚠️ ')}</div>
        </div>
      )}
      
      {herbalAlternatives && (
        <div className="space-y-2">
          <div className="flex items-center text-green-600 font-medium gap-2">
            <Leaf className="w-4 h-4" />
            <h3>✅ Herbal Medicine Alternatives</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line">{herbalAlternatives.replace(/•/g, '🌿 ')}</div>
        </div>
      )}
      
      {foodBasedTreatments && (
        <div className="space-y-2">
          <div className="flex items-center text-orange-500 font-medium gap-2">
            <Apple className="w-4 h-4" />
            <h3>✅ Food-Based Treatments</h3>
          </div>
          <div className="pl-6 text-sm whitespace-pre-line">{foodBasedTreatments.replace(/•/g, '🍎 ')}</div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-4">
        Disclaimer: This information is not a substitute for professional medical advice, diagnosis, or treatment.
      </div>
    </div>
  );
};

export default PharmacyResponse;
