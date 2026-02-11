import React, { useState } from 'react';
import { LabVariableFlow } from './LabVariableFlow';
import { LabFormulaBuilder } from './LabFormulaBuilder';
import { LabDecisionSupport } from './LabDecisionSupport';
import { TableProperties, Calculator, Scale } from 'lucide-react';

type LabModule = 'variable' | 'formula' | 'decision';

export const AdvancedLab: React.FC = () => {
  const [activeModule, setActiveModule] = useState<LabModule>('variable');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Lab Module</h2>
          <p className="text-slate-400 text-sm">Experimental financial modeling and decision synthesis.</p>
        </div>
        
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveModule('variable')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeModule === 'variable' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableProperties size={16} />
            Variable Flows
          </button>
          <button
            onClick={() => setActiveModule('formula')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeModule === 'formula' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator size={16} />
            Formula Synthesis
          </button>
          <button
            onClick={() => setActiveModule('decision')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeModule === 'decision' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale size={16} />
            Decision Support
          </button>
        </div>
      </div>

      <div className="bg-slate-850 rounded-xl border border-slate-700/50 p-6 min-h-[500px]">
        {activeModule === 'variable' && <LabVariableFlow />}
        {activeModule === 'formula' && <LabFormulaBuilder />}
        {activeModule === 'decision' && <LabDecisionSupport />}
      </div>
    </div>
  );
};