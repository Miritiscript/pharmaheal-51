
import React from 'react';

const PharmacyImagesGrid: React.FC = () => {
  const pharmacyImages = [
    {
      url: "/lovable-uploads/logo.png",
      alt: "PharmaHeal branding",
      caption: "Quality healthcare"
    },
    {
      url: "/lovable-uploads/favicon.png",
      alt: "PharmaHeal logo",
      caption: "Trusted pharmacy advice"
    },
    {
      url: "/lovable-uploads/pharmaheal.png",
      alt: "Medical consultation",
      caption: "Personalized care"
    },
    {
      url: "/lovable-uploads/logo.png",
      alt: "Wellness solutions",
      caption: "Comprehensive wellness"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {pharmacyImages.map((image, index) => (
        <div key={index} className="relative overflow-hidden rounded-xl shadow-elevation-2 aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-secondary/40 z-10 mix-blend-multiply"></div>
          <img 
            src={image.url} 
            alt={image.alt} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-20">
            <p className="text-white text-xs md:text-sm font-medium">
              {image.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PharmacyImagesGrid;
