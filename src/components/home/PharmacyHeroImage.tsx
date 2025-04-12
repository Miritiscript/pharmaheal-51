
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from '@/components/ui/carousel';

const PharmacyHeroImage: React.FC = () => {
  const heroImages = [
    {
      src: "/lovable-uploads/pharmaheal.png",
      alt: "PharmaHeal medical services",
      caption: "Quality healthcare for your needs"
    },
    {
      src: "/lovable-uploads/logo.png",
      alt: "Nutrition and wellness",
      caption: "Personalized nutrition and wellness guidance"
    },
    {
      src: "/lovable-uploads/favicon.png",
      alt: "Chronic disease management",
      caption: "Expert chronic disease management solutions"
    }
  ];

  return (
    <Carousel className="w-full h-full relative overflow-hidden rounded-xl shadow-elevation-3">
      <CarouselContent>
        {heroImages.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pharma-700/80 to-vibrant-pink-dark/50 z-10 mix-blend-multiply"></div>
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20">
                <p className="text-white text-sm md:text-base font-medium">
                  {image.caption}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-30" />
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-30" />
    </Carousel>
  );
};

export default PharmacyHeroImage;
