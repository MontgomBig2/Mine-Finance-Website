import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowRight, Box, Zap, Trash, RotateCcw } from 'lucide-react';

const BLOCKS = ['P/F', 'P/A', 'A/P', 'A/F', 'F/P', 'F/A'];

export const LabFormulaBuilder: React.FC = () => {
  const [chain, setChain] = useState<string[]>([]);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addBlock = (block: string) => {
    setChain([...chain, block]);
  };

  const clearChain = () => {
    setChain([]);
    setResult('');
  };

  const handleSynthesize = async () => {
    if (chain.length === 0 || !process.env.API_KEY) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // "A/F into P/A" implies the list order
      const chainStr = chain.join(' into ');
      const prompt = `The user has chained ${chainStr} on the visual canvas. Synthesize these into one cohesive LaTeX formula and define the resulting relationship. Explain what financial conversion this represents.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setResult(response.text || 'Synthesis failed.');
    } catch (error) {
      setResult('Error synthesizing formula.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex flex-col md:flex-row gap-8">
           {/* Component Library */}
           <div className="w-full md:w-64 flex-shrink-0">
               <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Components</h3>
               <div className="grid grid-cols-2 gap-2">
                   {BLOCKS.map(block => (
                       <button
                           key={block}
                           onClick={() => addBlock(block)}
                           className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded text-sm font-mono transition-colors flex items-center justify-center gap-2"
                       >
                           <Box size={14} className="text-gold-500" />
                           {block}
                       </button>
                   ))}
               </div>
               <div className="mt-4 p-4 bg-slate-900/50 rounded text-xs text-slate-500 italic">
                   Click blocks to add them to the synthesis chain.
               </div>
           </div>

           {/* Canvas */}
           <div className="flex-1 bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 min-h-[200px] flex items-center p-6 relative">
                {chain.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none">
                        Drag blocks here (Click to add)
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-4">
                    {chain.map((block, idx) => (
                        <React.Fragment key={idx}>
                            <div className="bg-slate-800 text-white px-4 py-3 rounded shadow-lg border border-gold-500/30 flex items-center gap-2 font-mono">
                                {block}
                            </div>
                            {idx < chain.length - 1 && (
                                <ArrowRight className="text-slate-500" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
           </div>
       </div>

       {/* Actions & Result */}
       <div className="bg-slate-850 border-t border-slate-700 pt-6">
           <div className="flex items-center gap-4 mb-6">
               <button
                   onClick={handleSynthesize}
                   disabled={chain.length < 1 || loading}
                   className="bg-gold-600 text-white px-5 py-2 rounded-md hover:bg-gold-500 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
               >
                   <Zap size={18} />
                   {loading ? 'Synthesizing...' : 'Synthesize Formula'}
               </button>
               <button
                   onClick={clearChain}
                   className="text-slate-400 hover:text-white flex items-center gap-2 text-sm px-3 py-2"
               >
                   <RotateCcw size={16} />
                   Reset Canvas
               </button>
           </div>

           {result && (
               <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <h4 className="text-gold-400 font-semibold mb-2 flex items-center gap-2">
                       <Zap size={16} /> Resulting Definition
                   </h4>
                   <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                       {result}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};