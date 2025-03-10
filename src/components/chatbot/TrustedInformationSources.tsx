
import React from 'react';
import { Globe, Hospital, ShieldCheck, BookOpen, Microscope, Pill, Heart, Leaf, User } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

const TrustedInformationSources: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`mt-12 p-6 rounded-xl ${theme === 'dark' ? 'bg-dark-surface border border-dark-border' : 'glass'}`}>
      <h2 className="text-2xl font-bold mb-3 text-center">Trusted Information Sources</h2>
      <p className="text-center text-muted-foreground mb-6">
        For verified medical advice, refer to these reputable sources:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Government & Health Organizations */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Globe className="w-5 h-5 text-primary" />
            Government & Health Organizations
          </h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://www.who.int/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🌍 World Health Organization (WHO)
              </a>
            </li>
            <li>
              <a 
                href="https://www.cdc.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🏥 Centers for Disease Control and Prevention (CDC)
              </a>
            </li>
            <li>
              <a 
                href="https://www.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🇺🇸 National Institutes of Health (NIH)
              </a>
            </li>
            <li>
              <a 
                href="https://www.nhs.uk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🇬🇧 National Health Service (NHS)
              </a>
            </li>
            <li>
              <a 
                href="https://www.fda.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                💊 U.S. Food & Drug Administration (FDA)
              </a>
            </li>
          </ul>
        </div>

        {/* Medical Research & Drug Databases */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            Medical Research & Drug Databases
          </h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://pubmed.ncbi.nlm.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                📚 PubMed
              </a>
            </li>
            <li>
              <a 
                href="https://www.cochranelibrary.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🔬 Cochrane Library
              </a>
            </li>
            <li>
              <a 
                href="https://www.drugs.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                💊 Drugs.com
              </a>
            </li>
            <li>
              <a 
                href="https://medlineplus.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🏥 MedlinePlus
              </a>
            </li>
            <li>
              <a 
                href="https://www.rxlist.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                📖 RxList
              </a>
            </li>
          </ul>
        </div>

        {/* Health & Wellness Information */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Heart className="w-5 h-5 text-primary" />
            Health & Wellness Information
          </h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://www.mayoclinic.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🏥 Mayo Clinic
              </a>
            </li>
            <li>
              <a 
                href="https://my.clevelandclinic.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                💡 Cleveland Clinic
              </a>
            </li>
            <li>
              <a 
                href="https://www.healthline.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                📖 Healthline
              </a>
            </li>
            <li>
              <a 
                href="https://www.health.harvard.edu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🏛 Harvard Health
              </a>
            </li>
          </ul>
        </div>

        {/* Alternative & Herbal Medicine */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Leaf className="w-5 h-5 text-primary" />
            Alternative & Herbal Medicine
          </h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://www.nccih.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🌿 National Center for Complementary and Integrative Health (NCCIH)
              </a>
            </li>
            <li>
              <a 
                href="https://examine.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🍃 Examine.com
              </a>
            </li>
            <li>
              <a 
                href="https://www.herbmed.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                🌱 HerbMed
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrustedInformationSources;
