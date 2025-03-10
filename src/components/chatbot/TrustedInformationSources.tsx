
import React from 'react';
import { Globe, BookOpen, Heart, Leaf } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import InfoSourceCategory from './InfoSourceCategory';
import InfoLink from './InfoLink';

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
        <InfoSourceCategory 
          title="Government & Health Organizations" 
          icon={<Globe className="w-5 h-5 text-primary" />}
        >
          <InfoLink 
            href="https://www.who.int/" 
            emoji="🌍" 
            text="World Health Organization (WHO)" 
          />
          <InfoLink 
            href="https://www.cdc.gov/" 
            emoji="🏥" 
            text="Centers for Disease Control and Prevention (CDC)" 
          />
          <InfoLink 
            href="https://www.nih.gov/" 
            emoji="🇺🇸" 
            text="National Institutes of Health (NIH)" 
          />
          <InfoLink 
            href="https://www.nhs.uk/" 
            emoji="🇬🇧" 
            text="National Health Service (NHS)" 
          />
          <InfoLink 
            href="https://www.fda.gov/" 
            emoji="💊" 
            text="U.S. Food & Drug Administration (FDA)" 
          />
        </InfoSourceCategory>

        {/* Medical Research & Drug Databases */}
        <InfoSourceCategory 
          title="Medical Research & Drug Databases" 
          icon={<BookOpen className="w-5 h-5 text-primary" />}
        >
          <InfoLink 
            href="https://pubmed.ncbi.nlm.nih.gov/" 
            emoji="📚" 
            text="PubMed" 
          />
          <InfoLink 
            href="https://www.cochranelibrary.com/" 
            emoji="🔬" 
            text="Cochrane Library" 
          />
          <InfoLink 
            href="https://www.drugs.com/" 
            emoji="💊" 
            text="Drugs.com" 
          />
          <InfoLink 
            href="https://medlineplus.gov/" 
            emoji="🏥" 
            text="MedlinePlus" 
          />
          <InfoLink 
            href="https://www.rxlist.com/" 
            emoji="📖" 
            text="RxList" 
          />
        </InfoSourceCategory>

        {/* Health & Wellness Information */}
        <InfoSourceCategory 
          title="Health & Wellness Information" 
          icon={<Heart className="w-5 h-5 text-primary" />}
        >
          <InfoLink 
            href="https://www.mayoclinic.org/" 
            emoji="🏥" 
            text="Mayo Clinic" 
          />
          <InfoLink 
            href="https://my.clevelandclinic.org/" 
            emoji="💡" 
            text="Cleveland Clinic" 
          />
          <InfoLink 
            href="https://www.healthline.com/" 
            emoji="📖" 
            text="Healthline" 
          />
          <InfoLink 
            href="https://www.health.harvard.edu/" 
            emoji="🏛" 
            text="Harvard Health" 
          />
        </InfoSourceCategory>

        {/* Alternative & Herbal Medicine */}
        <InfoSourceCategory 
          title="Alternative & Herbal Medicine" 
          icon={<Leaf className="w-5 h-5 text-primary" />}
        >
          <InfoLink 
            href="https://www.nccih.nih.gov/" 
            emoji="🌿" 
            text="National Center for Complementary and Integrative Health (NCCIH)" 
          />
          <InfoLink 
            href="https://examine.com/" 
            emoji="🍃" 
            text="Examine.com" 
          />
          <InfoLink 
            href="https://www.herbmed.org/" 
            emoji="🌱" 
            text="HerbMed" 
          />
        </InfoSourceCategory>
      </div>
    </div>
  );
};

export default TrustedInformationSources;
