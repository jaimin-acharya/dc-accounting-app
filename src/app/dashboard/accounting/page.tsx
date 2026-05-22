"use client";

import { useState, useEffect } from "react";
import { motion as motionFramer, AnimatePresence as AnimatePresenceFramer } from "framer-motion";
import { Plus, BookOpen, ArrowRightLeft, TrendingUp, FileBarChart, Receipt, Search, Loader2, X, AlertCircle } from "lucide-react";

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  subType?: string;
  description?: string;
  openingBalance: number;
}

interface JournalLine {
  id: string;
  debitAccount?: LedgerAccount;
  creditAccount?: LedgerAccount;
  amount: number;
  description?: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  type: "PAYMENT" | "RECEIPT" | "JOURNAL" | "CONTRA";
  narration: string;
  reference?: string;
  totalAmount: number;
  lines: JournalLine[];
}

const typeConfig: Record<string, { color: string; bg: string }> = {
  PAYMENT: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  RECEIPT: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  JOURNAL: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  CONTRA: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

const accountTypeColors: Record<string, string> = {
  ASSET: "#22c55e",
  LIABILITY: "#ef4444",
  EQUITY: "#8b5cf6",
  REVENUE: "#10B981",
  EXPENSE: "#f97316",
};

const formatCurrency = (v: number) => {
  const isNegative = v < 0;
  const absVal = Math.abs(v);
  const formatted = absVal >= 10000000 ? `₹${(absVal / 10000000).toFixed(2)}Cr` : absVal >= 100000 ? `₹${(absVal / 100000).toFixed(1)}L` : `₹${absVal.toLocaleString("en-IN")}`;
  return isNegative ? `-${formatted}` : formatted;
};

const initialJournalForm = {
  type: "JOURNAL" as const,
  date: new Date().toISOString().split("T")[0],
  narration: "",
  reference: "",
  debitAccountId: "",
  creditAccountId: "",
  amount: "",
};

const initialAccountForm = {
  code: "",
  name: "",
  type: "EXPENSE" as const,
  subType: "",
  description: "",
  openingBalance: "0",
};

export default function AccountingPage() {
  const [tab, setTab] = useState("ledger");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  const [journalForm, setJournalForm] = useState(initialJournalForm);
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [accRes, jrnRes] = await Promise.all([
        fetch("/api/accounting/accounts"),
        fetch("/api/accounting/journal"),
      ]);

      if (accRes.ok) {
        const accs = await accRes.json();
        setAccounts(Array.isArray(accs) ? accs : []);
      }
      if (jrnRes.ok) {
        const jrns = await jrnRes.json();
        setJournals(Array.isArray(jrns) ? jrns : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.code || !accountForm.name) {
      setError("Account Code and Name are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/accounting/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });

      if (!res.ok) {
        throw new Error("Failed to create ledger account");
      }

      setShowAccountModal(false);
      setAccountForm(initialAccountForm);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.debitAccountId || !journalForm.creditAccountId) {
      setError("Please select both debit and credit accounts");
      return;
    }
    if (journalForm.debitAccountId === journalForm.creditAccountId) {
      setError("Debit and Credit accounts must be different");
      return;
    }
    const amt = parseFloat(journalForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than zero");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        date: journalForm.date,
        type: journalForm.type,
        narration: journalForm.narration || `Journal entry from ${journalForm.type}`,
        reference: journalForm.reference,
        totalAmount: amt,
        lines: [
          {
            debitAccountId: journalForm.debitAccountId,
            creditAccountId: journalForm.creditAccountId,
            amount: amt,
            description: journalForm.narration,
          },
        ],
      };

      const res = await fetch("/api/accounting/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save journal entry");
      }

      setShowJournalModal(false);
      setJournalForm(initialJournalForm);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate live balances
  // We sum up the transactions that affect each ledger, plus their opening balances.
  const getAccountBalances = () => {
    return accounts.map((acc) => {
      let balance = acc.openingBalance;
      journals.forEach((entry) => {
        entry.lines.forEach((line) => {
          if (line.debitAccount?.id === acc.id) {
            // Debit increases Assets & Expenses, decreases Liabilities, Equity, Revenue
            if (acc.type === "ASSET" || acc.type === "EXPENSE") {
              balance += line.amount;
            } else {
              balance -= line.amount;
            }
          }
          if (line.creditAccount?.id === acc.id) {
            // Credit increases Liabilities, Equity, Revenue, decreases Assets & Expenses
            if (acc.type === "LIABILITY" || acc.type === "EQUITY" || acc.type === "REVENUE") {
              balance += line.amount;
            } else {
              balance -= line.amount;
            }
          }
        });
      });

      const nature = acc.type === "ASSET" || acc.type === "EXPENSE" ? "Dr" : "Cr";

      return {
        ...acc,
        balance,
        nature,
      };
    });
  };

  const activeAccounts = getAccountBalances();

  const totalAssets = activeAccounts.filter((a) => a.type === "ASSET").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = activeAccounts.filter((a) => a.type === "LIABILITY").reduce((s, a) => s + a.balance, 0);
  const totalRevenue = activeAccounts.filter((a) => a.type === "REVENUE").reduce((s, a) => s + a.balance, 0);
  const totalExpenses = activeAccounts.filter((a) => a.type === "EXPENSE").reduce((s, a) => s + a.balance, 0);

  const filteredAccounts = activeAccounts.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
    const matchType = typeFilter === "ALL" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="section-title">Accounting Ledger</h1>
          <p className="section-subtitle">GST compliant general ledger and double-entry books</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-outline"
            onClick={() => setShowAccountModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
          >
            <Plus size={14} />New Account
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowJournalModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
          >
            <Plus size={14} />Journal Entry
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="responsive-grid-4">
        {[
          { label: "Total Assets", value: totalAssets, color: "#22c55e", icon: TrendingUp },
          { label: "Total Liabilities", value: totalLiabilities, color: "#ef4444", icon: ArrowRightLeft },
          { label: "Total Revenue", value: totalRevenue, color: "#10B981", icon: Receipt },
          { label: "Total Expenses", value: totalExpenses, color: "#f97316", icon: FileBarChart },
        ].map((stat, i) => (
          <motionFramer.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: stat.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {stat.label.split(" ")[1]}
              </span>
            </div>
            <div style={{ fontSize: "1.4rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: stat.color }}>
              {formatCurrency(stat.value)}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: 3 }}>{stat.label}</div>
          </motionFramer.div>
        ))}
      </div>

      {/* Quick P&L banner */}
      <div
        className="glass-card"
        style={{ padding: "16px 24px" }}
      >
        <div className="responsive-grid-3" style={{ width: "100%" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gross Profit</div>
            <div style={{ fontSize: "1.5rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: "#22c55e" }}>
              {formatCurrency(totalRevenue - totalExpenses)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Worth</div>
            <div style={{ fontSize: "1.5rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: "var(--text-emerald)" }}>
              {formatCurrency(totalAssets - totalLiabilities)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Estimated GST Liability</div>
            <div style={{ fontSize: "1.5rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: "#3b82f6" }}>
              {formatCurrency(totalRevenue * 0.18)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs">
        {[
          { key: "ledger", label: "Chart of Accounts", icon: BookOpen },
          { key: "journal", label: "Journal Entries", icon: ArrowRightLeft },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`pill-tab ${tab === t.key ? "active" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)", gap: 12 }}>
          <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading general ledger books...</span>
        </div>
      ) : (
        <>
          {/* Ledger Tab */}
          {tab === "ledger" && (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
                  <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." className="input-field" style={{ paddingLeft: 36 }} />
                </div>
                <div className="pill-tabs">
                  {["ALL", "ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"].map((t) => (
                    <button key={t} onClick={() => setTypeFilter(t)} className={`pill-tab ${typeFilter === t ? "active" : ""}`}>
                      {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAccounts.length === 0 ? (
                <div className="empty-state" style={{ padding: 48, textAlign: "center", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 16 }}>
                  <BookOpen size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>No accounts matching search</h3>
                  <button className="btn-primary" onClick={() => setShowAccountModal(true)} style={{ fontSize: "12.5px", marginTop: 8 }}>
                    Create Ledger Account
                  </button>
                </div>
              ) : (
                <div className="glass-card" style={{ overflow: "hidden" }}>
                  <div className="table-container">
                    <table className="data-table">
                    <thead>
                      <tr>
                        <th>Account Code</th>
                        <th>Account Name</th>
                        <th>Type</th>
                        <th>Nature</th>
                        <th style={{ textAlign: "right" }}>Current Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((account, i) => (
                        <motionFramer.tr key={account.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                          <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>{account.code}</td>
                          <td style={{ fontWeight: 600, fontSize: "13.5px" }}>{account.name}</td>
                          <td>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: accountTypeColors[account.type], background: `${accountTypeColors[account.type]}18` }}>
                              {account.type}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "11px", fontWeight: 700, color: account.nature === "Dr" ? "#22c55e" : "#ef4444", background: account.nature === "Dr" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }}>
                              {account.nature}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, fontSize: "13.5px", color: "var(--text-emerald)" }}>
                            {formatCurrency(account.balance)}
                          </td>
                        </motionFramer.tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Journal Entries Tab */}
          {tab === "journal" && (
            journals.length === 0 ? (
              <div className="empty-state" style={{ padding: 48, textAlign: "center", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 16 }}>
                <ArrowRightLeft size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>No journal entries yet</h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: 16 }}>
                  Create double-entry payments, receipts, contra transfers, and general adjustment entries.
                </p>
                <button className="btn-primary" onClick={() => setShowJournalModal(true)} style={{ fontSize: "12.5px" }}>
                  Record First Entry
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Double-Entry Journal Logs</span>
                </div>
                <div className="table-container">
                  <table className="data-table">
                  <thead>
                    <tr>
                      <th>Entry #</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Narration</th>
                      <th>Debit Ledger</th>
                      <th>Credit Ledger</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journals.map((entry, i) => {
                      const cfg = typeConfig[entry.type] || { color: "#fff", bg: "#333" };
                      // Find first line's debit/credit accounts
                      const firstLine = entry.lines?.[0];
                      const drName = firstLine?.debitAccount?.name || "Dr Account";
                      const crName = firstLine?.creditAccount?.name || "Cr Account";

                      return (
                        <motionFramer.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                          <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-emerald)", fontWeight: 700 }}>{entry.entryNumber}</td>
                          <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                          <td>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: cfg.color, background: cfg.bg }}>{entry.type}</span>
                          </td>
                          <td style={{ fontSize: "13px", color: "var(--text-primary)", maxWidth: 220 }}>{entry.narration}</td>
                          <td style={{ fontSize: "12.5px", color: "#22c55e" }}>Dr: {drName}</td>
                          <td style={{ fontSize: "12.5px", color: "#ef4444" }}>Cr: {crName}</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(entry.totalAmount)}</td>
                          <td style={{ fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "monospace" }}>{entry.reference || "—"}</td>
                        </motionFramer.tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            )
          )}
        </>
      )}

      {/* New Journal Entry Modal */}
      <AnimatePresenceFramer>
        {showJournalModal && (
          <div className="modal-overlay" onClick={() => setShowJournalModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <motionFramer.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="modal-content"
              style={{ width: "100%", maxWidth: 540, background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow-lg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                  New Double-Entry Journal Entry
                </h2>
                <button onClick={() => setShowJournalModal(false)} style={{ border: "1px solid var(--border-subtle)", background: "transparent", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#ef4444", fontSize: "13px" }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateJournal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Entry Type</label>
                    <select
                      value={journalForm.type}
                      onChange={(e) => setJournalForm({ ...journalForm, type: e.target.value as any })}
                      className="input-field"
                      style={{ height: 38 }}
                    >
                      <option value="JOURNAL">JOURNAL (Adjustment)</option>
                      <option value="PAYMENT">PAYMENT (Cash/Bank Out)</option>
                      <option value="RECEIPT">RECEIPT (Cash/Bank In)</option>
                      <option value="CONTRA">CONTRA (Inter-account Transfer)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={journalForm.date}
                      onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Debit Account (Dr) *</label>
                    <select
                      required
                      value={journalForm.debitAccountId}
                      onChange={(e) => setJournalForm({ ...journalForm, debitAccountId: e.target.value })}
                      className="input-field"
                      style={{ height: 38 }}
                    >
                      <option value="">Select Account...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} style={{ background: "var(--bg-surface)" }}>{acc.code} — {acc.name} ({acc.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Credit Account (Cr) *</label>
                    <select
                      required
                      value={journalForm.creditAccountId}
                      onChange={(e) => setJournalForm({ ...journalForm, creditAccountId: e.target.value })}
                      className="input-field"
                      style={{ height: 38 }}
                    >
                      <option value="">Select Account...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} style={{ background: "var(--bg-surface)" }}>{acc.code} — {acc.name} ({acc.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      value={journalForm.amount}
                      onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Reference / Voucher #</label>
                    <input
                      value={journalForm.reference}
                      onChange={(e) => setJournalForm({ ...journalForm, reference: e.target.value })}
                      placeholder="e.g. PO-2024-001, CHQ-998822"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Narration *</label>
                  <textarea
                    required
                    value={journalForm.narration}
                    onChange={(e) => setJournalForm({ ...journalForm, narration: e.target.value })}
                    placeholder="Enter journal description, narration or memo detail..."
                    className="input-field"
                    style={{ minHeight: 60, resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" className="btn-outline" onClick={() => setShowJournalModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={saving}>
                    {saving && <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />}
                    Save Journal Entry
                  </button>
                </div>
              </form>
            </motionFramer.div>
          </div>
        )}
      </AnimatePresenceFramer>

      {/* New Account Modal */}
      <AnimatePresenceFramer>
        {showAccountModal && (
          <div className="modal-overlay" onClick={() => setShowAccountModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <motionFramer.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="modal-content"
              style={{ width: "100%", maxWidth: 480, background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow-lg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                  Create Chart of Accounts Ledger
                </h2>
                <button onClick={() => setShowAccountModal(false)} style={{ border: "1px solid var(--border-subtle)", background: "transparent", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#ef4444", fontSize: "13px" }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Account Code *</label>
                    <input
                      required
                      value={accountForm.code}
                      onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                      placeholder="e.g. 5007"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Account Title *</label>
                    <input
                      required
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      placeholder="e.g. Site Supervisor Salary"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Account Type</label>
                    <select
                      value={accountForm.type}
                      onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as any })}
                      className="input-field"
                      style={{ height: 38 }}
                    >
                      <option value="ASSET">ASSET</option>
                      <option value="LIABILITY">LIABILITY</option>
                      <option value="EQUITY">EQUITY</option>
                      <option value="REVENUE">REVENUE</option>
                      <option value="EXPENSE">EXPENSE</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Opening Balance (INR)</label>
                    <input
                      type="number"
                      required
                      value={accountForm.openingBalance}
                      onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Group Category / Subtype</label>
                    <input
                      value={accountForm.subType}
                      onChange={(e) => setAccountForm({ ...accountForm, subType: e.target.value })}
                      placeholder="e.g. Indirect Expenses, Current Assets"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Description</label>
                  <textarea
                    value={accountForm.description}
                    onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                    placeholder="Enter short purpose of this general ledger..."
                    className="input-field"
                    style={{ minHeight: 60, resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" className="btn-outline" onClick={() => setShowAccountModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={saving}>
                    {saving && <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />}
                    Create Ledger
                  </button>
                </div>
              </form>
            </motionFramer.div>
          </div>
        )}
      </AnimatePresenceFramer>
    </div>
  );
}
