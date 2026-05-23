"use client";

import { useState, useEffect } from "react";
import { motion as motionFramer, AnimatePresence as AnimatePresenceFramer } from "framer-motion";
import { Plus, Search, Phone, Mail, HardHat, IndianRupee, Users, Calendar, Trash2, Loader2, X, AlertCircle, Pencil } from "lucide-react";

interface Contractor {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialty?: string;
  gstin?: string;
  pan?: string;
  bankAccount?: string;
  bankIFSC?: string;
  dailyRate?: number;
  isActive: boolean;
  notes?: string;
}

const initialForm = {
  name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  specialty: "",
  gstin: "",
  pan: "",
  bankAccount: "",
  bankIFSC: "",
  dailyRate: "",
  notes: "",
};

export default function ContractorsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("contractors");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null);
  
  // Custom Alert Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchContractors = async () => {
    try {
      const res = await fetch("/api/contractors");
      if (res.ok) {
        const data = await res.json();
        setContractors(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const handleEditContractor = (contractor: Contractor) => {
    setForm({
      name: contractor.name || "",
      company: contractor.company || "",
      phone: contractor.phone || "",
      email: contractor.email || "",
      address: contractor.address || "",
      specialty: contractor.specialty || "",
      gstin: contractor.gstin || "",
      pan: contractor.pan || "",
      bankAccount: contractor.bankAccount || "",
      bankIFSC: contractor.bankIFSC || "",
      dailyRate: contractor.dailyRate?.toString() || "",
      notes: contractor.notes || "",
    });
    setEditingContractorId(contractor.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingContractorId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Contractor Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingContractorId ? `/api/contractors/${editingContractorId}` : "/api/contractors";
      const method = editingContractorId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save contractor");
      }
      setShowModal(false);
      setForm(initialForm);
      setEditingContractorId(null);
      fetchContractors();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({
      show: true,
      title: "Remove Contractor",
      message: "Are you sure you want to remove this contractor? This will erase their active site association, daily rates, and profiles. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/contractors/${id}`, {
            method: "DELETE",
          });
          setDeleteConfirm(null);
          if (res.ok) {
            fetchContractors();
          } else {
            alert("Failed to delete contractor");
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const filtered = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.specialty || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = contractors.filter((c) => c.isActive).length;
  const totalPayrollEstimate = contractors.reduce((s, c) => s + ((c.dailyRate ?? 0) * 22), 0); // Estimated 22 days worked average

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="section-title">Contractors & Labor</h1>
          <p className="section-subtitle">{activeCount} active contractors this month</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
        >
          <Plus size={14} />Add Contractor
        </button>
      </div>

      {/* Stats */}
      <div className="responsive-grid-4">
        {[
          { label: "Total Contractors", value: contractors.length, color: "#10B981", icon: Users },
          { label: "Active This Month", value: activeCount, color: "#22c55e", icon: HardHat },
          { label: "Est. Payroll (22d)", value: `₹${totalPayrollEstimate.toLocaleString("en-IN")}`, color: "#3b82f6", icon: IndianRupee },
          { label: "Avg Daily Rate", value: contractors.length ? `₹${Math.round(contractors.reduce((s, c) => s + (c.dailyRate ?? 0), 0) / contractors.length)}` : "₹0", color: "#8b5cf6", icon: Calendar },
        ].map((stat, i) => (
          <motionFramer.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: "1.3rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            </div>
          </motionFramer.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="pill-tabs">
        {[
          { key: "contractors", label: "Contractors" },
          { key: "payroll", label: "Estimated Payroll Plan" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`pill-tab ${tab === t.key ? "active" : ""}`}>{t.label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 280 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contractors..." className="input-field" style={{ paddingLeft: 36 }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)", gap: 12 }}>
          <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading contractors...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 48, textAlign: "center", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 16 }}>
          <HardHat size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>No contractors found</h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: 16 }}>
            {search ? "Try adjusting your search query." : "Add a contractor to manage labor rates, payroll, and site assignments."}
          </p>
          {!search && (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: "12.5px" }}>
              Add Your First Contractor
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Contractors Cards */}
          {tab === "contractors" && (
            <div className="responsive-grid-2">
              {filtered.map((c, i) => (
                <motionFramer.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card hover-lift" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, var(--text-emerald), #34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#1A1A1A" }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{c.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.company || "Independent"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: c.isActive ? "#22c55e" : "#ef4444", background: c.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => handleEditContractor(c)}
                        style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-emerald)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        title="Edit Contractor"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        title="Delete Contractor"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.12)" }}>{c.specialty || "General Contractor"}</span>
                  </div>

                  <div className="responsive-grid-2" style={{ gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Daily Rate", value: c.dailyRate ? `₹${c.dailyRate}/day` : "Not Set" },
                      { label: "GSTIN", value: c.gstin || "N/A" },
                      { label: "PAN", value: c.pan || "N/A" },
                      { label: "Bank Account", value: c.bankAccount ? `...${c.bankAccount.slice(-4)}` : "N/A" },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: "8px 10px", background: "var(--bg-glass)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 10 }}>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>
                        <Phone size={12} />{c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", marginLeft: "auto" }}>
                        <Mail size={12} />{c.email}
                      </a>
                    )}
                  </div>
                </motionFramer.div>
              ))}
            </div>
          )}

          {/* Payroll Tab */}
          {tab === "payroll" && (
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Estimated Payroll Projections (22 Days Working)</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Contractor</th>
                    <th>Rate</th>
                    <th>Est. Working Days</th>
                    <th>Projected Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.specialty || "General Contractor"}</div>
                      </td>
                      <td>₹{c.dailyRate || 0}/day</td>
                      <td>22 days</td>
                      <td style={{ fontWeight: 700, color: "var(--text-emerald)" }}>₹{((c.dailyRate || 0) * 22).toLocaleString("en-IN")}</td>
                      <td><span className="badge badge-warning" style={{ background: "rgba(234,179,8,0.12)", color: "#eab308", fontSize: "11px", padding: "2px 8px", borderRadius: 12 }}>Pending</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Contractor Modal */}
      <AnimatePresenceFramer>
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <motionFramer.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="modal-content"
              style={{ width: "100%", maxWidth: 640, background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow-lg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                  {editingContractorId ? "Edit Contractor / Labor Details" : "Add New Contractor / Labor"}
                </h2>
                <button onClick={handleCloseModal} style={{ border: "1px solid var(--border-subtle)", background: "transparent", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#ef4444", fontSize: "13px" }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Company Name</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Patel Masonry Works"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Phone Number</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. ramesh@patel.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Specialty / Trade</label>
                    <input
                      value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      placeholder="e.g. Masonry, Electrical, Steel"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Daily Rate (INR)</label>
                    <input
                      type="number"
                      value={form.dailyRate}
                      onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                      placeholder="e.g. 850"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>GSTIN</label>
                    <input
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      placeholder="24AAAAA1111A1Z1"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>PAN Card Number</label>
                    <input
                      value={form.pan}
                      onChange={(e) => setForm({ ...form, pan: e.target.value })}
                      placeholder="ABCDE1234F"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Bank Account Number</label>
                    <input
                      value={form.bankAccount}
                      onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                      placeholder="123456789012"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Bank IFSC Code</label>
                    <input
                      value={form.bankIFSC}
                      onChange={(e) => setForm({ ...form, bankIFSC: e.target.value })}
                      placeholder="HDFC0001234"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Site Address / Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Provide site information or internal details here..."
                    className="input-field"
                    style={{ minHeight: 60, resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" className="btn-outline" onClick={handleCloseModal} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={saving}>
                    {saving ? <><Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />Saving...</> : editingContractorId ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add Contractor</>}
                  </button>
                </div>
              </form>
            </motionFramer.div>
          </div>
        )}
      </AnimatePresenceFramer>

      {/* ─────────────────────────────────── CUSTOM DELETION ALERT ─────────────────────────────────── */}
      <AnimatePresenceFramer>
        {deleteConfirm?.show && (
          <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <motionFramer.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="confirm-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-icon-container">
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: 8 }}>
                {deleteConfirm.title}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                {deleteConfirm.message}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button type="button" className="btn-outline" onClick={() => setDeleteConfirm(null)} style={{ padding: "8px 16px" }}>
                  Cancel
                </button>
                <button type="button" className="btn-danger" onClick={deleteConfirm.onConfirm}>
                  Delete
                </button>
              </div>
            </motionFramer.div>
          </div>
        )}
      </AnimatePresenceFramer>
    </div>
  );
}
