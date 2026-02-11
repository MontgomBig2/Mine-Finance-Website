export interface ProjectInputs {
  initialInvestment: number | ''; // P ($M)
  lifeOfMine: number | '';        // n (Years)
  annualRevenue: number | '';     // A ($M/year)
  discountRate: number | '';      // i (%)
}

export interface CalculationResult {
  npv: number;
  cashFlows: CashFlowData[];
}

export interface CashFlowData {
  year: number;
  cashFlow: number;
  discountedCashFlow: number;
  cumulativeNPV: number;
}

export interface VariableDefinition {
  symbol: string;
  name: string;
  definition: string;
  formula?: string;
}

export const DEFINITIONS: Record<keyof ProjectInputs | 'npv', VariableDefinition> = {
  initialInvestment: {
    symbol: 'P',
    name: 'Initial Investment',
    definition: 'The total upfront capital expenditure required to start the mining project. This includes exploration, equipment, and infrastructure costs incurred at Year 0.',
  },
  lifeOfMine: {
    symbol: 'n',
    name: 'Life of Mine',
    definition: 'The expected operational duration of the mine in years, determined by the ore reserves and the annual production rate.',
  },
  annualRevenue: {
    symbol: 'A',
    name: 'Annual Net Cash Flow',
    definition: 'The estimated net cash flow generated per year. Calculated as (Revenue - Operating Costs - Taxes - Royalties).',
  },
  discountRate: {
    symbol: 'i',
    name: 'Discount Rate',
    definition: 'The rate of return used to discount future cash flows back to their present value. It reflects the opportunity cost of capital and the risk profile of the project.',
  },
  npv: {
    symbol: 'NPV',
    name: 'Net Present Value',
    definition: 'The sum of the present values of incoming and outgoing cash flows over a period of time. A positive NPV indicates the project is projected to generate profit above the discount rate.',
    formula: 'NPV = \\sum_{t=1}^{n} \\frac{R_t}{(1+i)^t} - P'
  }
};