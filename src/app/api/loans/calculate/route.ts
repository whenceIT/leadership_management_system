import { NextRequest, NextResponse } from 'next/server';
import LoanCalculatorService from '@/services/LoanCalculatorService';

const loanCalculatorService = LoanCalculatorService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      loan_amount,
      interest_rate,
      loan_term,
      monthly_income,
      monthly_expenses
    } = body;

    // Validate required fields
    if (!loan_amount || !interest_rate || !loan_term || !monthly_income || !monthly_expenses) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Calculate loan details
    const result = await loanCalculatorService.calculateLoan(
      loan_amount,
      interest_rate,
      loan_term,
      monthly_income,
      monthly_expenses
    );

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Error calculating loan details' },
      { status: 500 }
    );
  }
}
