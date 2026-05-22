"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface MonthlyDataItem {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface ProjectProfitabilityItem {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

const formatCurrency = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(20px)" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{label}</p>
        {payload.map((e: any) => (
          <p key={e.name} style={{ fontSize: "11.5px", color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

const reportTypes = [
  { icon: TrendingUp, label: "P&L Statement", desc: "Monthly/Quarterly/Annual", color: "#22c55e" },
  { icon: BarChart3, label: "Balance Sheet", desc: "Assets, Liabilities, Equity", color: "#3b82f6" },
  { icon: PieChart, label: "Expense Analysis", desc: "By category & project", color: "#10B981" },
  { icon: FileText, label: "GST Report", desc: "CGST, SGST, IGST summary", color: "#8b5cf6" },
  { icon: Calendar, label: "Cash Flow", desc: "Monthly cash statement", color: "#f97316" },
  { icon: BarChart3, label: "Project Report", desc: "Site-wise profitability", color: "#06b6d4" },
];

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [projectProfitability, setProjectProfitability] = useState<ProjectProfitabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to compile financial reports");
      const data = await res.json();
      setMonthlyData(data.monthlyData || []);
      setProjectProfitability(data.projectProfitability || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong loading reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalRevenueAllTime = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenseAllTime = monthlyData.reduce((s, d) => s + d.expense, 0);
  const hasData = totalRevenueAllTime > 0 || totalExpenseAllTime > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="section-title">Reports & Analytics</h1>
          <p className="section-subtitle">Financial reports with PDF & Excel export</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
            <Calendar size={14} />FY 2026-27
          </button>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }} onClick={() => alert("All reports exporting triggered...")}>
            <Download size={14} />Export All
          </button>
        </div>
      </div>

      {/* Report Tiles */}
      <div className="responsive-grid-3">
        {reportTypes.map((report, i) => (
          <motion.div
            key={report.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card hover-lift"
            style={{ padding: "18px 20px", cursor: "pointer" }}
            onClick={() => alert(`Generating details for ${report.label}...`)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${report.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <report.icon size={17} color={report.color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>{report.label}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{report.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ flex: 1, padding: "6px 0", fontSize: "11.5px", fontWeight: 600, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                onClick={(e) => { e.stopPropagation(); alert(`Downloading PDF for ${report.label}...`); }}>
                PDF
              </button>
              <button style={{ flex: 1, padding: "6px 0", fontSize: "11.5px", fontWeight: 600, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                onClick={(e) => { e.stopPropagation(); alert(`Downloading Excel file for ${report.label}...`); }}>
                Excel
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, gap: 12, color: "var(--text-muted)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span>Compiling dynamic financial reports...</span>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <AlertCircle size={24} color="#ef4444" />
          <p style={{ color: "#ef4444", fontSize: "13.5px" }}>{error}</p>
        </div>
      ) : (
        <>
          {/* Annual Overview Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
            style={{ padding: 24 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Annual P&L Overview — FY 2026-27</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>Monthly revenue, expenses, and profit from live transactions</p>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: "12px" }}>
                {[{ color: "#10B981", label: "Revenue" }, { color: "#ef4444", label: "Expenses" }, { color: "#22c55e", label: "Profit" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </div>
            
            {!hasData ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12, color: "var(--text-muted)", fontSize: "13px" }}>
                No transactional records yet to construct cash trends. Add invoices and site expenses to populate charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Project Profitability */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: 24 }}
          >
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 20 }}>
              Project-wise Profitability
            </h3>
            
            {projectProfitability.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
                No active projects found. Create projects under the Projects menu to monitor site profitability.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th style={{ textAlign: "right" }}>Revenue</th>
                    <th style={{ textAlign: "right" }}>Cost (Expenses)</th>
                    <th style={{ textAlign: "right" }}>Net Profit</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {projectProfitability.map((p, i) => (
                    <motion.tr key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.04 }}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</td>
                      <td style={{ textAlign: "right", color: "#10B981", fontWeight: 600 }}>{formatCurrency(p.revenue)}</td>
                      <td style={{ textAlign: "right", color: "#ef4444" }}>{formatCurrency(p.cost)}</td>
                      <td style={{ textAlign: "right", color: "#22c55e", fontWeight: 700 }}>{formatCurrency(p.profit)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <motion.div
                              className="progress-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(0, p.margin))}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              style={{ background: p.margin > 20 ? "#22c55e" : p.margin > 10 ? "#eab308" : "#ef4444" }}
                            />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{p.margin}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
