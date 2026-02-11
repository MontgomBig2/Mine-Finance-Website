import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  symbol?: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, title, symbol, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative flex items-center group">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help flex items-center text-slate-400 hover:text-gold-400 transition-colors"
      >
        {children || <Info size={16} />}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 text-sm">
          <div className="flex justify-between items-baseline mb-1 border-b border-slate-700 pb-1">
            <span className="font-semibold text-gold-400">{title}</span>
            {symbol && <span className="font-mono text-xs text-slate-500">{symbol}</span>}
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {content}
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-slate-700"></div>
        </div>
      )}
    </div>
  );
};