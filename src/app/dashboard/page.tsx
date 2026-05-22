"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FolderKanban,
  Users,
  Package,
  AlertCircle,
  Activity,
  Download,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.floor(display).toLocaleString("en-IN");

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  prefix,
  suffix,
  decimals,
  change,
  changeLabel,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="kpi-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={color} strokeWidth={2} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: "12px",
            fontWeight: 600,
            color: isPositive ? "#22c55e" : "#ef4444",
            background: isPositive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            padding: "3px 8px",
            borderRadius: 20,
          }}
        >
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="counter-value" style={{ fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 }}>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 4 }}>{changeLabel}</div>
    </motion.div>
  );
}

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: "12px 16px",
          backdropFilter: "blur(20px)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          {label}
        </p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ fontSize: "12px", color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/reports/dashboard");
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12, color: "var(--text-muted)" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px dashed var(--text-emerald)", animation: "spin 1.5s linear infinite" }} />
        <span>Loading financial dashboard...</span>
      </div>
    );
  }

  const kpiData = [
    {
      title: "Total Revenue",
      value: data?.totalRevenue ?? 0,
      prefix: "₹",
      change: data?.totalRevenue > 0 ? 12.4 : 0,
      changeLabel: "total earnings",
      icon: DollarSign,
      color: "#10B981",
      delay: 0,
    },
    {
      title: "Total Expenses",
      value: data?.totalExpenses ?? 0,
      prefix: "₹",
      change: data?.totalExpenses > 0 ? -2.5 : 0,
      changeLabel: "operating costs",
      icon: TrendingDown,
      color: "#ef4444",
      delay: 0.05,
    },
    {
      title: "Net Profit",
      value: data?.netProfit ?? 0,
      prefix: "₹",
      change: data?.netProfit > 0 ? 15.8 : 0,
      changeLabel: "net balance",
      icon: TrendingUp,
      color: "#22c55e",
      delay: 0.1,
    },
    {
      title: "Pending Payments",
      value: data?.pendingPayments ?? 0,
      prefix: "₹",
      change: data?.pendingPayments > 0 ? -4.1 : 0,
      changeLabel: "awaiting clearance",
      icon: AlertCircle,
      color: "#eab308",
      delay: 0.15,
    },
    {
      title: "Active Projects",
      value: data?.activeProjects ?? 0,
      suffix: "",
      change: data?.activeProjects > 0 ? 8.5 : 0,
      changeLabel: `Out of ${data?.totalProjects ?? 0} total`,
      icon: FolderKanban,
      color: "#3b82f6",
      delay: 0.2,
    },
    {
      title: "Contractors",
      value: data?.contractorCount ?? 0,
      change: 0,
      changeLabel: "active on sites",
      icon: Users,
      color: "#8b5cf6",
      delay: 0.25,
    },
  ];

  // Dynamically pulled charts data
  const cashFlowData = data?.cashFlowData || [];
  const monthlyRevenue = data?.monthlyRevenue || [];
  const expenseBreakdown = data?.expenseBreakdown || [];

  const totalInFlow = cashFlowData.reduce((s: number, c: any) => s + c.income, 0);
  const totalOutFlow = cashFlowData.reduce((s: number, c: any) => s + c.expense, 0);
  const hasCashFlow = totalInFlow > 0 || totalOutFlow > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="section-title">Financial Dashboard</h1>
          <p className="section-subtitle">Real-time overview of Dhruvanshi Construction finances</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-outline"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
          >
            <Calendar size={14} />
            Q1 2026-27
          </button>
          <button
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
            onClick={() => alert("Exporting current dashboard status to PDF...")}
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="responsive-grid-4">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-grid">
        {/* Cash Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card"
          style={{ padding: 24 }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Cash Flow
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
              Income vs Expenses (6 months)
            </p>
          </div>
          
          {!hasCashFlow ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12.5px", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
              No cash flow records. Log revenue and expenses to populate.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Monthly Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="glass-card"
          style={{ padding: 24 }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Revenue vs Target
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
              Monthly performance tracking (₹20L target)
            </p>
          </div>
          
          {!hasCashFlow ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12.5px", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
              No billing entries. Add clients and projects to track targets.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Target Target" fill="var(--border-subtle)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Expense Breakdown Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card"
          style={{ padding: 24 }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Expense Breakdown
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>By category weight %</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {expenseBreakdown.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, ""]}
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, overflowY: "auto", maxHeight: 110 }}>
            {expenseBreakdown.map((item: any) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.name}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="glass-card"
        style={{ padding: 24 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Active Projects
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
              Current construction site progress
            </p>
          </div>
          <a
            href="/dashboard/projects"
            className="btn-outline"
            style={{ fontSize: "12px", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            View All
            <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="responsive-grid-2">
          {!data?.projects || data.projects.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No active projects found. Add your first project in the Projects page!
            </div>
          ) : (
            data.projects.map((project: any, i: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                style={{
                  padding: "16px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ y: -2, boxShadow: "var(--shadow-emerald)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)", marginBottom: 3 }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{project.client?.name ?? "Dhruvanshi Construction"}</div>
                  </div>
                  <span className={`badge badge-success`} style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: "11px", padding: "2px 8px", borderRadius: 12 }}>
                    {project.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Contract Value</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-emerald)" }}>
                    {formatCurrency(project.contractValue)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", minWidth: 32 }}>
                    {project.progress}%
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
