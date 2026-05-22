import { Logger } from '@serviceos/shared';
const logger = new Logger('TaxCalculator');
export class TaxCalculator {
  calculateFederal(income: number) {
    return { federal: income * 0.22, brackets: 'standard' };
  }
  calculateState(income: number, state: string) {
    const rates: any = { CA: 0.093, NY: 0.065, TX: 0 };
    return { state: rates[state] || 0.05, amount: income * (rates[state] || 0.05) };
  }
  estimatedQuarterly(annualIncome: number) {
    const quarterly = (annualIncome * 0.22) / 4;
    return { q1: quarterly, q2: quarterly, q3: quarterly, q4: quarterly };
  }
}
