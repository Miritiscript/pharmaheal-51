
import React from 'react';

const PharmacyImagesGrid: React.FC = () => {
  const pharmacyImages = [
    {
      url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Blood glucose meter for diabetes monitoring",
      caption: "Diabetes management tools"
    },
    {
      url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Fresh vegetables and healthy food",
      caption: "Nutrition & balanced diet"
    },
    {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Blood pressure monitor",
      caption: "Hypertension monitoring"
    },
    {
      url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
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
