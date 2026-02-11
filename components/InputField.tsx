import React from 'react';
import { Tooltip } from './Tooltip';
import { VariableDefinition } from '../types';

interface InputFieldProps {
  definition: VariableDefinition;
  value: number | '';
  onChange: (value: number | '') => void;
  unit?: string;
  step?: number;
  min?: number;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  definition, 
  value, 
  onChange, 
  unit = '',
  step = 1,
  min = 0
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          {definition.name} ({definition.symbol})
          <Tooltip 
            title={definition.name}
            symbol={definition.symbol}
            content={definition.definition}
          />
        </label>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              onChange('');
            } else {
              const num = parseFloat(val);
              onChange(isNaN(num) ? 0 : num);
            }
          }}
          step={step}
          min={min}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all font-mono"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};