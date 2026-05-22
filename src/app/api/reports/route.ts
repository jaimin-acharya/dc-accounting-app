import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, format } from "date-fns";

export async function GET() {
  try {
    const [projects, invoices, expenses] = await Promise.all([
      prisma.project.findMany(),
      prisma.invoice.findMany({ where: { status: { not: "CANCELLED" } } }),
      prisma.expense.findMany(),
    ]);

    // 1. Calculate Monthly aggregate data (last 12 months)
    const monthlyMap: Record<string, { revenue: number; expense: number }> = {};
    const now = new Date();
    
    // Initialize last 12 months with chronological order
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, "MMM yyyy"); // e.g. "Mar 2024"
      monthlyMap[key] = { revenue: 0, expense: 0 };
    }

    // Populate revenue from invoices
    invoices.forEach((inv) => {
      const key = format(new Date(inv.date), "MMM yyyy");
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key].revenue += inv.totalAmount;
      }
    });

    // Populate expenses
    expenses.forEach((exp) => {
      const key = format(new Date(exp.date), "MMM yyyy");
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key].expense += exp.amount;
      }
    });

    const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
      month: month.split(" ")[0], // e.g. "Mar"
      revenue: data.revenue,
      expense: data.expense,
      profit: data.revenue - data.expense,
    }));

    // 2. Calculate Project Profitability
    const projectProfitability = projects.map((p) => {
      const projectInvoices = invoices.filter((i) => i.projectId === p.id);
      const projectExpenses = expenses.filter((e) => e.projectId === p.id);

      const revenue = projectInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const cost = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const profit = revenue - cost;
      const margin = revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(1)) : 0;

      return {
        name: p.name,
        revenue,
        cost,
        profit,
        margin,
      };
    });

    return NextResponse.json({
      monthlyData,
      projectProfitability,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch reports" }, { status: 500 });
  }
}
