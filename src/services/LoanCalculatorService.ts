export interface LoanCalculatorResult {
  loan_amount: number;
  interest_rate: number;
  loan_term: number; // in months
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  amortization_schedule: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remaining_balance: number;
  }[];
  eligibility: {
    eligible: boolean;
    max_loan_amount: number;
    reason: string;
  };
  affordability: {
    debt_to_income_ratio: number;
    monthly_income: number;
    monthly_expenses: number;
    disposable_income: number;
    affordability_score: number;
  };
  risk_assessment: {
    risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

export class LoanCalculatorService {
  private static instance: LoanCalculatorService;

  private constructor() {}

  public static getInstance(): LoanCalculatorService {
    if (!LoanCalculatorService.instance) {
      LoanCalculatorService.instance = new LoanCalculatorService();
    }
    return LoanCalculatorService.instance;
  }

  /**
   * Calculate loan details
   */
  public async calculateLoan(
    loanAmount: number,
    interestRate: number,
    loanTerm: number,
    monthlyIncome: number,
    monthlyExpenses: number
  ): Promise<LoanCalculatorResult> {
    try {
      // Calculate monthly payment using amortization formula
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                          (Math.pow(1 + monthlyRate, loanTerm) - 1);

      // Calculate total payment and total interest
      const totalPayment = monthlyPayment * loanTerm;
      const totalInterest = totalPayment - loanAmount;

      // Generate amortization schedule
      const amortizationSchedule = [];
      let remainingBalance = loanAmount;

      for (let month = 1; month <= loanTerm; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        amortizationSchedule.push({
          month,
          payment: parseFloat(monthlyPayment.toFixed(2)),
          principal: parseFloat(principalPayment.toFixed(2)),
          interest: parseFloat(interestPayment.toFixed(2)),
          remaining_balance: parseFloat(Math.max(0, remainingBalance).toFixed(2))
        });
      }

      // Calculate eligibility
      const eligible = monthlyPayment <= (monthlyIncome - monthlyExpenses) * 0.4;
      const maxLoanAmount = (monthlyIncome - monthlyExpenses) * 0.4 * 
                          ((Math.pow(1 + monthlyRate, loanTerm) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)));

      // Calculate affordability metrics
      const debtToIncomeRatio = (monthlyPayment / monthlyIncome) * 100;
      const disposableIncome = monthlyIncome - monthlyExpenses;
      const affordabilityScore = this.calculateAffordabilityScore(
        debtToIncomeRatio,
        disposableIncome,
        loanAmount,
        monthlyIncome
      );

      // Calculate risk assessment
      const riskScore = this.calculateRiskScore(
        debtToIncomeRatio,
        affordabilityScore,
        interestRate,
        loanTerm
      );
      
      const riskLevel = this.getRiskLevel(riskScore);
      const riskFactors = this.getRiskFactors(debtToIncomeRatio, interestRate, loanTerm);

      return {
        loan_amount: loanAmount,
        interest_rate: interestRate,
        loan_term: loanTerm,
        monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
        total_payment: parseFloat(totalPayment.toFixed(2)),
        total_interest: parseFloat(totalInterest.toFixed(2)),
        amortization_schedule: amortizationSchedule,
        eligibility: {
          eligible,
          max_loan_amount: parseFloat(maxLoanAmount.toFixed(2)),
          reason: eligible ? 'Loan is affordable' : 'Monthly payment exceeds 40% of disposable income'
        },
        affordability: {
          debt_to_income_ratio: parseFloat(debtToIncomeRatio.toFixed(2)),
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
          disposable_income: disposableIncome,
          affordability_score: affordabilityScore
        },
        risk_assessment: {
          risk_score: riskScore,
          risk_level: riskLevel,
          factors: riskFactors
        }
      };
    } catch (error) {
      console.error('Error calculating loan details:', error);
      throw error;
    }
  }

  /**
   * Calculate affordability score
   */
  private calculateAffordabilityScore(
    debtToIncomeRatio: number,
    disposableIncome: number,
    loanAmount: number,
    monthlyIncome: number
  ): number {
    let score = 100;

    // Debt to income ratio (50% weight)
    if (debtToIncomeRatio > 40) {
      score -= 50;
    } else if (debtToIncomeRatio > 30) {
      score -= 30;
    } else if (debtToIncomeRatio > 20) {
      score -= 15;
    }

    // Loan amount to income ratio (30% weight)
    const loanToIncomeRatio = (loanAmount / (monthlyIncome * 12)) * 100;
    if (loanToIncomeRatio > 50) {
      score -= 30;
    } else if (loanToIncomeRatio > 30) {
      score -= 15;
    }

    // Disposable income (20% weight)
    const disposableToIncomeRatio = (disposableIncome / monthlyIncome) * 100;
    if (disposableToIncomeRatio < 20) {
      score -= 20;
    } else if (disposableToIncomeRatio < 30) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    debtToIncomeRatio: number,
    affordabilityScore: number,
    interestRate: number,
    loanTerm: number
  ): number {
    let score = 100;

    // Debt to income ratio (40% weight)
    if (debtToIncomeRatio > 40) {
      score -= 40;
    } else if (debtToIncomeRatio > 30) {
      score -= 25;
    } else if (debtToIncomeRatio > 20) {
      score -= 10;
    }

    // Affordability score (30% weight)
    if (affordabilityScore < 60) {
      score -= 30;
    } else if (affordabilityScore < 80) {
      score -= 15;
    }

    // Interest rate (20% weight)
    if (interestRate > 20) {
      score -= 20;
    } else if (interestRate > 15) {
      score -= 10;
    }

    // Loan term (10% weight)
    if (loanTerm > 60) {
      score -= 10;
    } else if (loanTerm > 48) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get risk level based on score
   */
  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'low';
    if (riskScore >= 60) return 'medium';
    if (riskScore >= 40) return 'high';
    return 'critical';
  }

  /**
   * Get risk factors
   */
  private getRiskFactors(debtToIncomeRatio: number, interestRate: number, loanTerm: number): string[] {
    const factors: string[] = [];

    if (debtToIncomeRatio > 40) {
      factors.push('High debt-to-income ratio');
    } else if (debtToIncomeRatio > 30) {
      factors.push('Elevated debt-to-income ratio');
    }

    if (interestRate > 20) {
      factors.push('Very high interest rate');
    } else if (interestRate > 15) {
      factors.push('High interest rate');
    }

    if (loanTerm > 60) {
      factors.push('Very long loan term');
    } else if (loanTerm > 48) {
      factors.push('Long loan term');
    }

    return factors;
  }
}

export default LoanCalculatorService;
