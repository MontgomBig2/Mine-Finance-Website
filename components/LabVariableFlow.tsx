import React, { useState } from 'react';
import { Plus, Trash2, Play, Loader2, TableProperties, Copy, RotateCcw, Scale, Calculator, Check } from 'lucide-react';
import { ResultsChart } from './ResultsChart';

interface CashFlowRow {
  year: number;
  amount: number | '';
}

interface LabCalculationResult {
  npv: number;
  bcRatio: number;
  cashFlows: {
    year: number;
    cashFlow: number;
    discountedCashFlow: number;
    cumulativeNPV: number;
  }[];
}

// Simplified to standard increments
const UNITS = [
  { label: 'Thousands', symbol: '$k' },
  { label: 'Millions', symbol: '$M' },
  { label: 'Billions', symbol: '$B' },
];

export const LabVariableFlow: React.FC = () => {
  const [flows, setFlows] = useState<CashFlowRow[]>([
    { year: 0, amount: -50 },
    { year: 1, amount: 10 },
    { year: 2, amount: 15 },
    { year: 3, amount: 20 },
  ]);
  const [discountRate, setDiscountRate] = useState<number | ''>(10);
  const [selectedUnit, setSelectedUnit] = useState(UNITS[1]); // Default to Millions ($M)
  const [results, setResults] = useState<LabCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedNPV, setCopiedNPV] = useState(false);
  const [copiedBC, setCopiedBC] = useState(false);

  const addRow = () => {
    setFlows([...flows, { year: flows.length, amount: 0 }]);
  };

  const updateRow = (index: number, val: number | '') => {
    const newFlows = [...flows];
    newFlows[index].amount = val;
    setFlows(newFlows);
  };

  const removeRow = (index: number) => {
    const remaining = flows.filter((_, i) => i !== index);
    const reindexed = remaining.map((row, i) => ({ ...row, year: i }));
    setFlows(reindexed);
  };

  const copyRow = (index: number) => {
    const amountToCopy = flows[index].amount;
    setFlows([...flows, { year: flows.length, amount: amountToCopy }]);
  };

  const clearFlows = () => {
    setFlows([{ year: 0, amount: 0 }]);
    setResults(null);
  };

  const handleCalculate = () => {
    setLoading(true);

    try {
      const rate = (discountRate === '' ? 0 : discountRate) / 100;
      let cumulativeNPV = 0;
      let pvInflows = 0;
      let pvOutflows = 0;

      const calculatedFlows = flows.map((row) => {
        const cashFlow = row.amount === '' ? 0 : row.amount;
        const discountedCashFlow = cashFlow / Math.pow(1 + rate, row.year);
        cumulativeNPV += discountedCashFlow;

        if (discountedCashFlow > 0) {
          pvInflows += discountedCashFlow;
        } else {
          pvOutflows += Math.abs(discountedCashFlow);
        }

        return {
          year: row.year,
          cashFlow,
          discountedCashFlow,
          cumulativeNPV
        };
      });

      const bcRatio = pvOutflows === 0 ? (pvInflows > 0 ? 9999 : 0) : pvInflows / pvOutflows;

      setResults({
        npv: cumulativeNPV,
        bcRatio,
        cashFlows: calculatedFlows
      });
    } catch (error) {
      console.error("Calculation failed", error);
    } finally {
      setLoading(false);
    }
  };

  // e.g. $15.00M or $400.00k
  // Added decimals parameter for flexibility
  const formatMoney = (val: number, decimals: number = 2) => {
    const suffix = selectedUnit.symbol.replace('$', '');
    return `$${val.toFixed(decimals)}${suffix}`;
  };

  const copyToClipboard = (text: string, type: 'npv' | 'bc') => {
    navigator.clipboard.writeText(text);
    if (type === 'npv') {
        setCopiedNPV(true);
        setTimeout(() => setCopiedNPV(false), 2000);
    } else {
        setCopiedBC(true);
        setTimeout(() => setCopiedBC(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Left Column: Inputs */}
      <div className="md:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gold-400">Uneven Cash Flows</h3>
            <select 
                value={selectedUnit.label}
                onChange={(e) => setSelectedUnit(UNITS.find(u => u.label === e.target.value) || UNITS[1])}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-gold-500"
            >
                {UNITS.map(u => (
                    <option key={u.label} value={u.label}>{u.label} ({u.symbol})</option>
                ))}
            </select>
        </div>
        
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-800 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Year</div>
            <div className="col-span-5">Cash Flow ({selectedUnit.symbol})</div>
            <div className="col-span-4 text-right">Action</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {flows.map((row, index) => (
              <div key={index} className="grid grid-cols-12 p-3 border-t border-slate-800 items-center hover:bg-slate-800/50 transition-colors">
                <div className="col-span-3 font-mono text-slate-300">Year {row.year}</div>
                <div className="col-span-5 pr-4">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(index, e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-gold-500 outline-none font-mono"
                  />
                </div>
                <div className="col-span-4 flex items-center justify-end text-slate-600 gap-2">
                  <button 
                    onClick={() => removeRow(index)} 
                    className="hover:text-red-400 transition-colors p-1"
                    title="Delete Year"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="text-slate-700">|</span>
                  <button 
                    onClick={() => copyRow(index)} 
                    className="hover:text-gold-400 transition-colors p-1"
                    title="Duplicate to next year"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-800/50 border-t border-slate-700 flex flex-col gap-2">
            <button onClick={addRow} className="flex items-center gap-2 text-xs font-medium text-gold-500 hover:text-gold-400 w-full justify-center py-1">
              <Plus size={14} /> Add Year
            </button>
            <button onClick={clearFlows} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-400 w-full justify-center border-t border-slate-700/50 pt-2">
              <RotateCcw size={14} /> Clear
            </button>
          </div>
        </div>

        <div className="flex items-end gap-4">
            <div className="flex-1">
                <label className="text-sm text-slate-400 block mb-1">Discount Rate (%)</label>
                <input 
                    type="number" 
                    value={discountRate} 
                    onChange={(e) => setDiscountRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                />
            </div>
            <button 
                onClick={handleCalculate}
                disabled={loading}
                className="bg-gold-600 text-white px-6 py-2 rounded-md hover:bg-gold-500 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                Run Analysis
            </button>
        </div>
      </div>

      {/* Right Column: Visualization */}
      <div className="md:col-span-7 space-y-6">
        {results ? (
            <>
                {/* Result Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* NPV Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm relative group">
                        <button 
                            onClick={() => copyToClipboard(formatMoney(results.npv, 6), 'npv')}
                            className="absolute top-2 right-2 text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy NPV"
                        >
                            {copiedNPV ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Calculator size={16} className="text-gold-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">NPV</span>
                        </div>
                        <div 
                            className={`text-3xl font-bold font-mono tracking-tight break-all ${results.npv > 0 ? 'text-green-400' : 'text-red-400'}`}
                            title="Net Present Value (High Precision)"
                        >
                            {formatMoney(results.npv, 6)}
                        </div>
                    </div>

                    {/* B/C Ratio Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm relative group">
                        <button 
                            onClick={() => copyToClipboard(results.bcRatio.toFixed(2), 'bc')}
                            className="absolute top-2 right-2 text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy B/C Ratio"
                        >
                            {copiedBC ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Scale size={16} className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">B/C Ratio</span>
                        </div>
                        <div className={`text-3xl font-bold font-mono tracking-tight ${results.bcRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                            {results.bcRatio.toFixed(2)}x
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <ResultsChart data={results.cashFlows} unit={selectedUnit.symbol} />
            </>
        ) : (
             <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50 h-full flex flex-col items-center justify-center text-slate-600 gap-4 min-h-[400px]">
                <TableProperties size={64} strokeWidth={1} />
                <div className="text-center">
                    <h4 className="text-slate-400 font-medium">No Analysis Generated</h4>
                    <p className="text-sm text-slate-500 mt-1">Enter your cash flows and discount rate, then click "Run Analysis"</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};