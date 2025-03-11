
import React from 'react';

const PharmacyImagesGrid: React.FC = () => {
  const pharmacyImages = [
    {
      url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Variety of medication tablets and pills",
      caption: "Prescription medications and treatments"
    },
    {
      url: "https://images.unsplash.com/photo-1631549916768-4119b4220039?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Medical syringes and vials",
      caption: "Injectable medications and vaccines"
    },
    {
      url: "https://images.unsplash.com/photo-1585435557343-3b348031e799?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Pharmacist reviewing medication",
      caption: "Expert pharmaceutical care"
    },
    {
      url: "https://images.unsplash.com/photo-1587854680352-936b22b91030?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      alt: "Colorful medication pills",
      caption: "Advanced pharmaceutical treatments"
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
