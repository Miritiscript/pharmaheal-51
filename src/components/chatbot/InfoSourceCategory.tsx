
import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoSourceCategoryProps {
  title: string;
  icon: ReactNode;
  children: React.ReactNode;
}

const InfoSourceCategory: React.FC<InfoSourceCategoryProps> = ({ 
  title, 
  icon, 
  children 
}) => {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {children}
      </ul>
    </div>
  );
};

export default InfoSourceCategory;
