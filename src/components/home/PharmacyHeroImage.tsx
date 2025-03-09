
import React from 'react';

const PharmacyHeroImage: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl shadow-elevation-3">
      <div className="absolute inset-0 bg-gradient-to-br from-pharma-700/80 to-vibrant-pink-dark/50 z-10 mix-blend-multiply"></div>
      <img 
        src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80" 
        alt="Modern pharmacy with pharmacist assisting customers" 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20">
        <p className="text-white text-sm md:text-base font-medium">
          Professional pharmaceutical care and wellness guidance
        </p>
      </div>
    </div>
  );
};

export default PharmacyHeroImage;
