
import React from 'react';
import { BrainCircuit, PlayCircle, Pill, Search, HeartPulse, ClipboardCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI Medical Assistant",
      description: "Get reliable answers to your medical questions using our advanced AI chatbot."
    },
    {
      icon: <PlayCircle className="w-6 h-6" />,
      title: "Educational Videos",
      description: "Watch curated educational videos about diseases, treatments, and wellness topics."
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: "Drug Information",
      description: "Learn about medications, their uses, side effects, and potential interactions."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Universal Search",
      description: "Find any medical information quickly with our powerful search functionality."
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Chronic Disease Management",
      description: "Access resources to help manage chronic health conditions effectively."
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "Reliable Sources",
      description: "All information is sourced from reputable medical resources and research."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
