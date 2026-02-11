import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { CashFlowData } from '../types';

interface ResultsChartProps {
  data: CashFlowData[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit = '$M' }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CashFlowData;
    const suffix = unit.replace('$', ''); // e.g., 'M' or 'k'

    return (
      <div className="bg-slate-850 border border-slate-700 p-3 rounded-lg shadow-xl z-50 min-w-[200px]">
        <p className="text-slate-200 font-semibold mb-2 border-b border-slate-700 pb-1">Year {label}</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Net Cash Flow:</span>
            <span className={`font-mono font-medium ${data.cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.cashFlow.toFixed(2)}{suffix}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-purple-400">PV (Discounted):</span>
            <span className="font-mono text-slate-200">
              {data.discountedCashFlow.toFixed(2)}{suffix}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/50">
            <span className="text-gold-500">Cumulative NPV:</span>
            <span className={`font-mono font-medium ${data.cumulativeNPV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.cumulativeNPV.toFixed(2)}{suffix}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ResultsChart: React.FC<ResultsChartProps> = ({ data, unit = '$M' }) => {
  const suffix = unit.replace('$', '');

  return (
    <div className="h-[400px] w-full bg-slate-850 p-4 rounded-xl border border-slate-700/50 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Cash Flow Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#94a3b8" 
            tick={{fill: '#94a3b8'}}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} 
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{fill: '#94a3b8'}}
            tickFormatter={(value) => `${value}${suffix}`}
          />
          <RechartsTooltip 
            content={(props) => <CustomTooltip {...props} unit={unit} />}
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLine y={0} stroke="#475569" />
          
          <Bar 
            dataKey="cashFlow" 
            name="Net Cash Flow" 
            barSize={20} 
            fillOpacity={0.8}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.cumulativeNPV < 0 ? '#ef4444' : '#22c55e'} 
              />
            ))}
          </Bar>
          <Line 
            type="monotone" 
            dataKey="cumulativeNPV" 
            name="Cumulative NPV" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#f59e0b' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};