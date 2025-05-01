import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Transaction, Budgets } from '@/models/model';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || currentMonth.toString());
    const year = parseInt(searchParams.get('year') || currentYear.toString());
    
    // Get all budgets for the specified month and year
    const budgets = await Budgets.find({ month, year });
    
    // Create start and end date for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get all transactions for the specified month
    const transactions = await Transaction.find({
      date: { $gte: startDate, $lte: endDate },
      type: { $ne: 'Income' } // Exclude Income transactions
    });
    
    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
transactions.forEach((transaction : any) => {
  const { type, amount } = transaction;
  if (!spendingByCategory[type]) {
    spendingByCategory[type] = 0;
  }
  spendingByCategory[type] += amount;
});
    
    // Combine budget and spending data
    const summary = budgets.map((budget : any) => {
      const { category, amount } = budget;
      const spent = spendingByCategory[category] || 0;
      const remaining = amount - spent;
      const percentage = amount > 0 ? (spent / amount) * 100 : 0;
      
      return {
        category,
        budgeted: amount,
        spent,
        remaining,
        percentage: Math.min(percentage, 100) // Cap at 100%
      };
    });
    
    // Add categories that have spending but no budget
    Object.keys(spendingByCategory).forEach(category => {
      const hasBudget = summary.some((item: any) => item.category === category);
      if (!hasBudget) {
        summary.push({
          category,
          budgeted: 0,
          spent: spendingByCategory[category],
          remaining: -spendingByCategory[category],
          percentage: 100 // 100% over budget
        });
      }
    });
    
    return NextResponse.json({
      month,
      year,
      summary
    });
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json({ error: 'Failed to fetch budget summary' }, { status: 500 });
  }
}