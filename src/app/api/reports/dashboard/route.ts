import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subMonths, format } from 'date-fns';

export async function GET() {
  try {
    const [projects, invoices, materials, contractors, accounts, expenses] = await Promise.all([
      prisma.project.findMany(),
      prisma.invoice.findMany({ where: { status: { not: 'CANCELLED' } } }),
      prisma.material.findMany(),
      prisma.contractor.findMany({ where: { isActive: true } }),
      prisma.ledgerAccount.findMany(),
      prisma.expense.findMany(),
    ]);

    // Current metrics
    const totalRevenue = invoices
      .filter(i => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')
      .reduce((s, i) => s + i.paidAmount, 0);

    const totalExpenses = accounts
      .filter(a => a.type === 'EXPENSE')
      .reduce((s, a) => s + a.openingBalance, 0) + expenses.reduce((s, e) => s + e.amount, 0);

    const pendingPayments = invoices
      .filter(i => i.status !== 'PAID')
      .reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

    const materialValue = materials.reduce((s, m) => s + m.currentStock * m.unitCost, 0);
    const lowStockCount = materials.filter(m => m.currentStock < m.minStockLevel).length;

    // 1. 6-Month Cash Flow (Income vs Expenses)
    const cashFlowMap: Record<string, { income: number; expense: number }> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, 'MMM'); // e.g. "Oct"
      cashFlowMap[key] = { income: 0, expense: 0 };
    }

    invoices.forEach(inv => {
      const key = format(new Date(inv.date), 'MMM');
      if (cashFlowMap[key] !== undefined) {
        cashFlowMap[key].income += inv.totalAmount;
      }
    });

    expenses.forEach(exp => {
      const key = format(new Date(exp.date), 'MMM');
      if (cashFlowMap[key] !== undefined) {
        cashFlowMap[key].expense += exp.amount;
      }
    });

    const cashFlowData = Object.entries(cashFlowMap).map(([month, val]) => ({
      month,
      income: val.income,
      expense: val.expense,
    }));

    // 2. 6-Month Revenue vs Target Budget
    const monthlyRevenue = Object.entries(cashFlowMap).map(([month, val]) => ({
      month,
      revenue: val.income,
      budget: 2000000, // Fixed target standard of ₹20 Lakhs
    }));

    // 3. Expense Breakdown by Category
    const categoryTotals: Record<string, number> = {};
    let totalExpenseSum = 0;

    expenses.forEach(exp => {
      const cat = exp.category; // e.g. "MATERIAL", "LABOR"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
      totalExpenseSum += exp.amount;
    });

    const categoryColorMapping: Record<string, string> = {
      MATERIAL: '#10B981',
      LABOR: '#34D399',
      EQUIPMENT: '#047857',
      TRANSPORT: '#A7F3D0',
      PROFESSIONAL_FEES: '#8b5cf6',
      UTILITIES: '#3b82f6',
      ADMIN: '#064E3B',
      MISC: '#eab308',
    };

    const categories = Object.keys(categoryColorMapping);
    
    // Format to percentages for Recharts
    const expenseBreakdown = categories.map(cat => {
      const amount = categoryTotals[cat] || 0;
      const pct = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
      
      // Capitalize category name for label e.g. "Material"
      const label = cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ');

      return {
        name: label,
        value: pct,
        color: categoryColorMapping[cat],
      };
    }).filter(item => item.value > 0); // Only return categories that have actual expenses

    // If no expense exists yet, add dynamic fallback categories with 0 values
    if (expenseBreakdown.length === 0) {
      expenseBreakdown.push(
        { name: 'Materials', value: 0, color: '#10B981' },
        { name: 'Labor', value: 0, color: '#34D399' },
        { name: 'Equipment', value: 0, color: '#047857' },
        { name: 'Transport', value: 0, color: '#A7F3D0' },
        { name: 'Admin', value: 0, color: '#064E3B' }
      );
    }

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingPayments,
      activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
      totalProjects: projects.length,
      contractorCount: contractors.length,
      materialValue,
      lowStockCount,
      projects: projects.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        progress: p.progress,
        status: p.status,
        contractValue: p.contractValue,
      })),
      cashFlowData,
      monthlyRevenue,
      expenseBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
