import React, { useState, useEffect } from 'react';
import { ProjectInputs, CalculationResult, DEFINITIONS } from './types';
import { calculateProjectMetrics, formatCurrencyShort } from './utils/finance';
import { InputField } from './components/InputField';
import { ResultsChart } from './components/ResultsChart';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { Tooltip } from './components/Tooltip';
import { AdvancedLab } from './components/AdvancedLab';
import { TrendingUp, DollarSign, Activity, Pickaxe, FlaskConical, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lab'>('dashboard');
  
  const [inputs, setInputs] = useState<ProjectInputs>({
    initialInvestment: '',
    lifeOfMine: '',
    annualRevenue: '',
    discountRate: '',
  });

  const [results, setResults] = useState<CalculationResult>({
    npv: 0,
    cashFlows: []
  });

  useEffect(() => {
    const metrics = calculateProjectMetrics(inputs);
    setResults(metrics);
  }, [inputs]);

  const updateInput = (key: keyof ProjectInputs, value: number | '') => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const isProfitable = results.npv > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-gold-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-lg shadow-gold-500/20">
              <Pickaxe className="text-slate-900 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MineFinance <span className="font-light">Pro</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'lab' 
                  ? 'bg-gold-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-gold-400'
              }`}
            >
              <FlaskConical size={16} />
              Advanced Lab
            </button>
          </div>

          <div className="text-sm text-slate-500 hidden md:block w-32 text-right">
            v2.1 Lab Module
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Inputs & Key Metrics */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Input Card */}
              <div className="bg-slate-850 border border-slate-700/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gold-500" />
                  Project Parameters
                </h2>
                
                <div className="space-y-6">
                  <InputField 
                    definition={DEFINITIONS.initialInvestment}
                    value={inputs.initialInvestment}
                    onChange={(v) => updateInput('initialInvestment', v)}
                    unit="$M"
                  />
                  <InputField 
                    definition={DEFINITIONS.lifeOfMine}
                    value={inputs.lifeOfMine}
                    onChange={(v) => updateInput('lifeOfMine', v)}
                    unit="Years"
                  />
                  <InputField 
                    definition={DEFINITIONS.annualRevenue}
                    value={inputs.annualRevenue}
                    onChange={(v) => updateInput('annualRevenue', v)}
                    unit="$M/yr"
                  />
                  <InputField 
                    definition={DEFINITIONS.discountRate}
                    value={inputs.discountRate}
                    onChange={(v) => updateInput('discountRate', v)}
                    unit="%"
                    step={0.5}
                  />
                </div>
              </div>

              {/* Quick Result Card */}
              <div className={`bg-gradient-to-br ${isProfitable ? 'from-slate-800 to-slate-900' : 'from-slate-800 to-red-900/20'} border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign size={80} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <span className="text-sm font-medium uppercase tracking-wider">Net Present Value</span>
                    <Tooltip 
                      title={DEFINITIONS.npv.name}
                      symbol={DEFINITIONS.npv.symbol}
                      content={DEFINITIONS.npv.definition}
                    />
                  </div>
                  
                  <div className={`text-4xl font-bold font-mono tracking-tight ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrencyShort(results.npv)}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm">
                     {isProfitable ? (
                       <span className="flex items-center text-green-500 bg-green-500/10 px-2 py-1 rounded">
                         <TrendingUp size={14} className="mr-1" /> Profitable
                       </span>
                     ) : (
                       <span className="flex items-center text-red-400 bg-red-500/10 px-2 py-1 rounded">
                         <Activity size={14} className="mr-1" /> Not Feasible
                       </span>
                     )}
                     <span className="text-slate-500">at {inputs.discountRate}% discount rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visualization & AI */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Chart */}
              <ResultsChart data={results.cashFlows} />

              {/* AI Advisor */}
              <GeminiAdvisor inputs={inputs} results={results} />
            </div>

          </div>
        ) : (
          <AdvancedLab />
        )}
      </main>
    </div>
  );
};

export default App;