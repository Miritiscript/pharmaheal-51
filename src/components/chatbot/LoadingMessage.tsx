
import * as React from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface LoadingMessageProps {
  retryCount?: number;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ retryCount = 0 }) => {
  const { theme } = useTheme();
  const [dots, setDots] = React.useState('.');
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[90%] ${
          theme === 'dark' 
            ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-t-xl rounded-br-xl' 
            : 'glass rounded-t-xl rounded-br-xl'
        } p-3 shadow-sm animate-pulse`}
      >
        <div className="flex items-start gap-2">
          <Bot className="w-5 h-5 mt-1 text-primary shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">
                {retryCount > 0 
                  ? `Generating response (retry ${retryCount})${dots}` 
                  : `Generating response${dots}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
