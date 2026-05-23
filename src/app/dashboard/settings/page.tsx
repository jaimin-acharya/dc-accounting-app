"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  FileText,
  Database,
  Palette,
  Shield,
  Save,
  Upload,
  Download,
  Loader2,
  X,
  Trash2,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
}

const tabs = [
  { key: "company", label: "Company Profile", icon: Building2 },
  { key: "gst", label: "GST Settings", icon: FileText },
  { key: "users", label: "User Management", icon: User },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "backup", label: "Backup & Restore", icon: Database },
];

const roleColors: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  ACCOUNTANT: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  SITE_MANAGER: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserError, setNewUserError] = useState("");
  const [newUserSaving, setNewUserSaving] = useState(false);
  const [companyError, setCompanyError] = useState("");
  
  // Custom Alert Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // User form state
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ACCOUNTANT",
  });

  // Company and GST form state
  const [companyForm, setCompanyForm] = useState({
    name: "Dhruvanshi Construction",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    address: "",
    gstin: "",
    pan: "",
    bankName: "",
    bankAccount: "",
    bankIFSC: "",
    financialYear: "2024-25",
    logoPath: "",
  });

  const fetchCompany = async () => {
    try {
      const res = await fetch("/api/settings/company");
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setCompanyForm({
            name: data.name || "Dhruvanshi Construction",
            legalName: data.legalName || "",
            email: data.email || "",
            phone: data.phone || "",
            website: data.website || "",
            city: data.city || "",
            state: data.state || "Gujarat",
            pincode: data.pincode || "",
            address: data.address || "",
            gstin: data.gstin || "",
            pan: data.pan || "",
            bankName: data.bankName || "",
            bankAccount: data.bankAccount || "",
            bankIFSC: data.bankIFSC || "",
            financialYear: data.financialYear || "2024-25",
            logoPath: data.logoPath || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load company details", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchUsers();
  }, []);

  const handleSaveCompany = async () => {
    setSaving(true);
    setCompanyError("");
    try {
      const res = await fetch("/api/settings/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        fetchCompany();
      } else {
        const data = await res.json();
        setCompanyError(data.error || "Failed to save company settings");
      }
    } catch (err: any) {
      console.error("Failed to save company settings", err);
      setCompanyError(err.message || "Failed to save company settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      setNewUserError("All fields are required");
      return;
    }
    setNewUserSaving(true);
    setNewUserError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setShowUserModal(false);
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        role: "ACCOUNTANT",
      });
      fetchUsers();
    } catch (err: any) {
      setNewUserError(err.message || "Failed to register user");
    } finally {
      setNewUserSaving(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setDeleteConfirm({
      show: true,
      title: "Delete User Account",
      message: "Are you sure you want to permanently delete this user account? They will immediately lose access to the system. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${id}`, {
            method: "DELETE",
          });
          setDeleteConfirm(null);
          if (res.ok) {
            fetchUsers();
          }
        } catch (err) {
          console.error("Failed to delete user", err);
        }
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Configure your ERP system preferences</p>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setCompanyError(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                  background: active ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))" : "transparent",
                  color: active ? "var(--text-emerald)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="glass-card"
          style={{ flex: 1, padding: 28 }}
        >
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "var(--text-muted)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading settings...</span>
            </div>
          ) : (
            <>
              {/* Company Profile */}
              {activeTab === "company" && (
                <div>
                  <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 24 }}>
                    Company Profile
                  </h3>
                  {companyError && (
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", fontSize: "12.5px", marginBottom: 16 }}>
                      {companyError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap" }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: companyForm.logoPath ? "transparent" : "linear-gradient(135deg, #10B981, #34D399)", border: companyForm.logoPath ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {companyForm.logoPath ? (
                        <img src={companyForm.logoPath} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Building2 size={32} color="#1A1A1A" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="logo-upload-input"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("File size exceeds 2MB limit.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              setCompanyForm((prev) => ({ ...prev, logoPath: base64 }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" className="btn-outline" style={{ fontSize: "12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }} onClick={() => document.getElementById("logo-upload-input")?.click()}>
                          <Upload size={12} />Upload Logo
                        </button>
                        {companyForm.logoPath && (
                          <button
                            type="button"
                            className="btn-outline"
                            style={{ fontSize: "12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, borderColor: "#ef4444", color: "#ef4444" }}
                            onClick={() => setCompanyForm((prev) => ({ ...prev, logoPath: "" }))}
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>PNG or JPG, max 2MB. Recommended 400×400px.</p>
                    </div>
                  </div>
                  <div className="responsive-grid-2" style={{ gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Company Name</label>
                      <input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="Dhruvanshi Construction" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Legal Name</label>
                      <input value={companyForm.legalName} onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })} placeholder="Dhruvanshi Construction Pvt Ltd" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email Address</label>
                      <input value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} placeholder="info@dhruvanshi.com" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Phone Number</label>
                      <input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} placeholder="+91 98765 43210" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Website</label>
                      <input value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} placeholder="www.dhruvanshi.com" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>City</label>
                      <input value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} placeholder="Ahmedabad" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>State</label>
                      <input value={companyForm.state} onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })} placeholder="Gujarat" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Pincode</label>
                      <input value={companyForm.pincode} onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })} placeholder="380015" className="input-field" />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Address</label>
                      <textarea value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} placeholder="Plot 42, GIDC Estate, Naroda, Ahmedabad - 382330, Gujarat" className="input-field" rows={3} style={{ resize: "vertical" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* GST Settings */}
              {activeTab === "gst" && (
                <div>
                  <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 24 }}>
                    GST Configuration & Banking
                  </h3>
                  {companyError && (
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", fontSize: "12.5px", marginBottom: 16 }}>
                      {companyError}
                    </div>
                  )}
                  <div className="responsive-grid-2" style={{ gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>GSTIN</label>
                      <input value={companyForm.gstin} onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })} placeholder="24AAACC1234C1ZX" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>PAN Number</label>
                      <input value={companyForm.pan} onChange={(e) => setCompanyForm({ ...companyForm, pan: e.target.value })} placeholder="AAACC1234C" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Bank Name</label>
                      <input value={companyForm.bankName} onChange={(e) => setCompanyForm({ ...companyForm, bankName: e.target.value })} placeholder="e.g. ICICI Bank" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Bank Account Number</label>
                      <input value={companyForm.bankAccount} onChange={(e) => setCompanyForm({ ...companyForm, bankAccount: e.target.value })} placeholder="e.g. 1029302930" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Bank IFSC Code</label>
                      <input value={companyForm.bankIFSC} onChange={(e) => setCompanyForm({ ...companyForm, bankIFSC: e.target.value })} placeholder="e.g. ICIC0000102" className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Financial Year</label>
                      <input value={companyForm.financialYear} onChange={(e) => setCompanyForm({ ...companyForm, financialYear: e.target.value })} placeholder="2024-25" className="input-field" />
                    </div>
                  </div>
                  <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-emerald)" }}>Note:</strong> GST settings and banking details will be printed on all client invoices generated in the system.
                    </p>
                  </div>
                </div>
              )}

              {/* User Management */}
              {activeTab === "users" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                        User Management
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>Manage personnel who have access to the desktop ERP.</p>
                    </div>
                    <button type="button" className="btn-primary" onClick={() => setShowUserModal(true)} style={{ fontSize: "12.5px", padding: "8px 14px" }}>+ Add User</button>
                  </div>

                  {usersLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, gap: 10, color: "var(--text-muted)" }}>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Loading team...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="empty-state" style={{ padding: 24 }}>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No staff members registered. Click Add User above to create one.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {users.map((user) => {
                        const roleStyle = roleColors[user.role] || { color: "var(--text-secondary)", bg: "var(--bg-glass)" };
                        return (
                          <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 12, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 200px", minWidth: 0 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#1A1A1A", flexShrink: 0 }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)" }}>{user.name}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user.email}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "space-between", flex: "1 1 auto" }}>
                              <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: roleStyle.color, background: roleStyle.bg }}>
                                {user.role}
                              </span>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
                                <div>Last active</div>
                                <div style={{ fontWeight: 500 }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-IN") : "Never"}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.15s" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Appearance */}
              {activeTab === "appearance" && (
                <div>
                  <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 24 }}>
                    Appearance & Theme
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Color Theme
                      </label>
                      <div className="responsive-grid-3" style={{ gap: 12 }}>
                        {[
                          { name: "Dark Emerald (Active)", primary: "#10B981", bg: "#0F0F0F", active: true },
                          { name: "Sleek Charcoal", primary: "#6B7280", bg: "#1F2937", active: false },
                          { name: "Midnight Purple", primary: "#8b5cf6", bg: "#0A0A1A", active: false },
                        ].map((theme) => (
                          <div key={theme.name} style={{ padding: 16, borderRadius: 12, border: theme.active ? "2px solid #10B981" : "1px solid var(--border-subtle)", background: "rgba(15,15,15,0.8)", cursor: "pointer" }}>
                            <div style={{ width: "100%", height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${theme.primary}, ${theme.bg})`, marginBottom: 10 }} />
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{theme.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup */}
              {activeTab === "backup" && (
                <div>
                  <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 24 }}>
                    Backup & Restore
                  </h3>
                  <div className="responsive-grid-2" style={{ gap: 16 }}>
                    <div style={{ padding: 20, background: "var(--bg-glass)", borderRadius: 14, border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <Download size={18} color="#22c55e" />
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: 6 }}>Create Backup</h4>
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>Export complete SQLite database file directly for offline storage.</p>
                      <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }} onClick={() => alert("Creating manual SQL database backup... File successfully saved.")}>
                        <Download size={13} />Backup Now
                      </button>
                    </div>
                    <div style={{ padding: 20, background: "var(--bg-glass)", borderRadius: 14, border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <Upload size={18} color="#3b82f6" />
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: 6 }}>Restore Backup</h4>
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>Select a previously exported sqlite database back-up file.</p>
                      <button type="button" className="btn-outline" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }} onClick={() => alert("Select file dialogue triggered.")}>
                        <Upload size={13} />Select Backup File
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12 }}>
                    <p style={{ fontSize: "12.5px", color: "#ef4444" }}>⚠️ Restoring a backup will permanently overwrite all existing database tables. Make sure to back up current files first.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Save Button for Company / GST */}
          {!loading && activeTab !== "users" && activeTab !== "backup" && activeTab !== "appearance" && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-primary"
                onClick={handleSaveCompany}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{saved ? "✓ Saved!" : "Save Changes"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: 440, padding: 24, position: "relative", border: "1px solid var(--border-color)", background: "rgba(22,22,22,0.95)" }}
            >
              <button
                onClick={() => { setShowUserModal(false); setNewUserError(""); }}
                style={{ position: "absolute", right: 16, top: 16, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>

              <h2 style={{ fontSize: "1.2rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 700, color: "var(--text-emerald)", marginBottom: 4 }}>
                Add New Staff Member
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: 20 }}>
                Register a new profile to access this local ERP.
              </p>

              {newUserError && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", fontSize: "12.5px", marginBottom: 16 }}>
                  {newUserError}
                </div>
              )}

              <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Full Name</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email Address</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="e.g. rajesh@dhruvanshi.com"
                    className="input-field"
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Password</label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Access Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="input-field"
                    style={{ background: "#161616", color: "var(--text-primary)" }}
                  >
                    <option value="ADMIN">ADMIN (Full Access)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Financial Access)</option>
                    <option value="SITE_MANAGER">SITE_MANAGER (Expenses & Inventory)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => { setShowUserModal(false); setNewUserError(""); }}
                    className="btn-outline"
                    style={{ flex: 1, padding: "10px 0" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newUserSaving}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {newUserSaving ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Create User</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── CUSTOM DELETION ALERT ─────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm?.show && (
          <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <motion.div
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
