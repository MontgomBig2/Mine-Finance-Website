import { ProjectInputs, CalculationResult, CashFlowData } from '../types';

export const calculateProjectMetrics = (inputs: ProjectInputs): CalculationResult => {
  const safeInput = (val: number | '') => (val === '' ? 0 : val);

  const initialInvestment = safeInput(inputs.initialInvestment);
  const lifeOfMine = safeInput(inputs.lifeOfMine);
  const annualRevenue = safeInput(inputs.annualRevenue);
  const discountRate = safeInput(inputs.discountRate);
  
  const rate = discountRate / 100;
  const cashFlows: CashFlowData[] = [];
  
  // Year 0
  cashFlows.push({
    year: 0,
    cashFlow: -initialInvestment,
    discountedCashFlow: -initialInvestment,
    cumulativeNPV: -initialInvestment
  });

  let currentNPV = -initialInvestment;

  for (let t = 1; t <= lifeOfMine; t++) {
    // Basic annuity model for this demo
    const flow = annualRevenue; 
    const discountedFlow = flow / Math.pow(1 + rate, t);
    currentNPV += discountedFlow;

    cashFlows.push({
      year: t,
      cashFlow: flow,
      discountedCashFlow: discountedFlow,
      cumulativeNPV: currentNPV
    });
  }

  return {
    npv: currentNPV,
    cashFlows
  };
};

export const formatCurrency = (value: number | ''): string => {
  const val = value === '' ? 0 : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val * 1_000_000); // Assuming inputs are in Millions
};

export const formatCurrencyShort = (value: number | ''): string => {
   const val = value === '' ? 0 : value;
   return `$${val.toFixed(2)}M`;
};