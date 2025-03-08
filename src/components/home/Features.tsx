
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, PlayCircle, HeartPulse, Leaf } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <div 
      className="glass-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToChatbot = () => {
    navigate('/chatbot');
  };

  const handleNavigateToVideos = () => {
    navigate('/videos');
  };

  const handleNavigateToChronicDiseaseVideos = () => {
    navigate('/videos?category=chronic');
  };

  const handleNavigateToNutritionVideos = () => {
    navigate('/videos?category=nutrition');
  };

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI Medical Assistant",
      description: "Get reliable answers to your medical questions using our advanced AI chatbot.",
      onClick: handleNavigateToChatbot
    },
    {
      icon: <PlayCircle className="w-6 h-6" />,
      title: "Educational Videos",
      description: "Watch curated educational videos about diseases, treatments, and wellness topics.",
      onClick: handleNavigateToVideos
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Chronic Disease Management",
      description: "Access resources to help manage chronic health conditions effectively.",
      onClick: handleNavigateToChronicDiseaseVideos
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Nutrition & Wellness",
      description: "Learn about healthy food choices and lifestyle practices for optimal wellbeing.",
      onClick: handleNavigateToNutritionVideos
    }
  ];

  return (
    <section className="bg-muted/50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Features Designed for Your Health Needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            PharmaHeal combines AI technology with medical expertise to provide you with accessible and reliable health information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={feature.onClick}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
