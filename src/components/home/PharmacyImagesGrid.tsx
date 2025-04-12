
import React from 'react';

const PharmacyImagesGrid: React.FC = () => {
  const pharmacyImages = [
    {
      url: "/assets/pharmacy-images/diabetes-monitoring.jpg",
      alt: "Blood glucose meter for diabetes monitoring",
      caption: "Diabetes management tools"
    },
    {
      url: "/assets/pharmacy-images/healthy-food.jpg",
      alt: "Fresh vegetables and healthy food",
      caption: "Nutrition & balanced diet"
    },
    {
      url: "/assets/pharmacy-images/blood-pressure.jpg",
      alt: "Blood pressure monitor",
      caption: "Hypertension monitoring"
    },
    {
      url: "/assets/pharmacy-images/herbal-tea.jpg",
      alt: "Herbal tea and medicinal plants",
      caption: "Herbal wellness supplements"
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
