
import React from 'react';

const PharmacyHeroImage: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl shadow-elevation-3">
      <div className="absolute inset-0 bg-gradient-to-br from-pharma-700/80 to-vibrant-pink-dark/50 z-10 mix-blend-multiply"></div>
      <img 
        src="/assets/pharmacy-images/medicine-hero.jpg" 
        alt="Various medications, pills, and prescription drugs" 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20">
        <p className="text-white text-sm md:text-base font-medium">
          Reliable medication information and pharmaceutical guidance
        </p>
      </div>
    </div>
  );
};

export default PharmacyHeroImage;
