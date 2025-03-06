
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, HeartPulse, Mail, ShieldAlert } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">PharmaHeal</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Providing reliable medical information through AI assistance and educational content.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <HeartPulse className="w-4 h-4 text-primary" />
              <span>Your health, our priority</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/chatbot" className="text-foreground/80 hover:text-primary transition-colors">
                  AI Medical Assistant
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-foreground/80 hover:text-primary transition-colors">
                  Educational Videos
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-foreground/80 hover:text-primary transition-colors flex items-center"
                >
                  Medical Resources
                  <ExternalLink className="ml-1 w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <Link to="#" className="text-foreground/80 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:support@pharmaheal.app" className="text-foreground/80 hover:text-primary transition-colors">
                  Contact Support
                </a>
              </div>
              <p className="pt-2 text-xs">
                <strong>Medical Disclaimer:</strong> The information provided is not medical advice and should not replace consultation with healthcare professionals.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PharmaHeal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
