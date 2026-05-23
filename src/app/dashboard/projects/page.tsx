"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Building2,
  X,
  Loader2,
  FolderOpen,
  Mail,
  Phone,
  Briefcase,
  FileSpreadsheet,
  Trash2,
  Pencil,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  pan?: string;
  notes?: string;
}

interface Project {
  id: string;
  projectCode: string;
  name: string;
  client?: Client;
  siteAddress?: string;
  city?: string;
  status: string;
  progress: number;
  estimatedBudget: number;
  contractValue: number;
  startDate?: string;
  endDate?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  PLANNING: { label: "Planning", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  ON_HOLD: { label: "On Hold", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  COMPLETED: { label: "Completed", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  CANCELLED: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const formatCurrency = (val: number) => {
  if (!val) return "₹0";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
};

const initialForm = {
  name: "",
  clientId: "",
  siteAddress: "",
  city: "",
  state: "Gujarat",
  status: "PLANNING",
  startDate: "",
  endDate: "",
  estimatedBudget: "",
  contractValue: "",
  progress: "0",
  notes: "",
};

const initialClientForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "Gujarat",
  gstin: "",
  pan: "",
  notes: "",
};

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "clients">("projects");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  
  // Forms & Editing States
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  
  const [form, setForm] = useState(initialForm);
  const [clientForm, setClientForm] = useState(initialClientForm);
  const [saving, setSaving] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);
  const [error, setError] = useState("");
  const [clientError, setClientError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const handleEditProject = (project: any) => {
    setForm({
      name: project.name || "",
      clientId: project.clientId || "",
      siteAddress: project.siteAddress || "",
      city: project.city || "",
      state: project.state || "Gujarat",
      status: project.status || "PLANNING",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
      estimatedBudget: project.estimatedBudget?.toString() || "",
      contractValue: project.contractValue?.toString() || "",
      progress: project.progress?.toString() || "0",
      notes: project.notes || "",
    });
    setEditingProjectId(project.id);
    setShowModal(true);
  };

  const handleEditClient = (client: any) => {
    setClientForm({
      name: client.name || "",
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "Gujarat",
      gstin: client.gstin || "",
      pan: client.pan || "",
      notes: client.notes || "",
    });
    setEditingClientId(client.id);
    setShowClientModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingProjectId(null);
    setError("");
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
    setClientForm(initialClientForm);
    setEditingClientId(null);
    setClientError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects";
      const method = editingProjectId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setShowModal(false);
      setForm(initialForm);
      setEditingProjectId(null);
      fetchProjects();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent, isQuickAdd = false) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      setClientError("Client name is required");
      return;
    }
    setClientSaving(true);
    setClientError("");
    try {
      const url = editingClientId ? `/api/clients/${editingClientId}` : "/api/clients";
      const method = editingClientId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save client");
      }
      const newClient = await res.json();
      setClientForm(initialClientForm);
      setEditingClientId(null);
      await fetchClients();
      
      if (isQuickAdd) {
        setForm((prev) => ({ ...prev, clientId: newClient.id }));
        setShowQuickClientModal(false);
      } else {
        setShowClientModal(false);
      }
    } catch (e: any) {
      setClientError(e.message);
    } finally {
      setClientSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const handleClientDelete = async (id: string) => {
    if (!confirm("Delete this client? Any associated projects will be unlinked but kept intact.")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete client");
      }
      await fetchClients();
      await fetchProjects();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Top Page Bar: Tabs + Header button triggers */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Projects & Clients</h1>
          <p className="section-subtitle">
            {activeTab === "projects" 
              ? `${projects.length} construction projects listed` 
              : `${clients.length} corporate clients registered`
            }
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => setActiveTab("projects")}
            className="pill-tab"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background: activeTab === "projects" ? "var(--bg-card)" : "transparent",
              color: activeTab === "projects" ? "var(--text-emerald)" : "var(--text-muted)",
              transition: "all 0.15s ease",
            }}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className="pill-tab"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background: activeTab === "clients" ? "var(--bg-card)" : "transparent",
              color: activeTab === "clients" ? "var(--text-emerald)" : "var(--text-muted)",
              transition: "all 0.15s ease",
            }}
          >
            Clients
          </button>
        </div>

        {/* Action Button relative to Active Tab */}
        <div>
          {activeTab === "projects" ? (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
              <Plus size={14} />New Project
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setShowClientModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
              <Plus size={14} />New Client
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────── PROJECTS TAB VIEW ─────────────────────────────────── */}
      {activeTab === "projects" && (
        <>
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="input-field" style={{ paddingLeft: 36 }} />
            </div>
            <div className="pill-tabs">
              {["ALL", "ACTIVE", "PLANNING", "ON_HOLD", "COMPLETED"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`pill-tab ${statusFilter === s ? "active" : ""}`}>
                  {s === "ALL" ? "All" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: 4 }}>
              {(["grid", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: view === v ? "var(--bg-card)" : "transparent", color: view === v ? "var(--text-emerald)" : "var(--text-muted)", transition: "all 0.15s ease" }}>
                  {v === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Widget */}
          {projects.length > 0 && (
            <div className="responsive-grid-4">
              {[
                { label: "Total Value", value: formatCurrency(projects.reduce((s, p) => s + p.contractValue, 0)), color: "#10B981" },
                { label: "Active Projects", value: projects.filter((p) => p.status === "ACTIVE").length.toString(), color: "#22c55e" },
                { label: "Avg Progress", value: projects.length ? `${Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)}%` : "0%", color: "#3b82f6" },
                { label: "Completed Projects", value: projects.filter((p) => p.status === "COMPLETED").length.toString(), color: "#8b5cf6" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card" style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: "1.4rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Grid/List Rendering */}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, gap: 12, color: "var(--text-muted)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading projects...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FolderOpen size={28} /></div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 8 }}>
                {search || statusFilter !== "ALL" ? "No matching projects" : "No projects yet"}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 20 }}>
                {search || statusFilter !== "ALL" ? "Try adjusting your filters" : "Create your first project to get started"}
              </p>
              {!search && statusFilter === "ALL" && (
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
                  <Plus size={14} />Create First Project
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="responsive-grid-3">
              {filtered.map((project, i) => {
                const status = statusConfig[project.status] || statusConfig.PLANNING;
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card hover-lift" style={{ padding: 20, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={18} color="#10B981" />
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: status.color, background: status.bg }}>{status.label}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleEditProject(project); }} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }} title="Edit">
                          <Pencil size={11} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }} title="Delete">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>{project.projectCode}</div>
                    <div style={{ fontWeight: 700, fontSize: "14.5px", color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.3 }}>{project.name}</div>
                    {project.client && <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={11} color="var(--text-muted)" />{project.client.name}</div>}
                    {(project.city || project.siteAddress) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11.5px", color: "var(--text-muted)", marginTop: 6, marginBottom: 14 }}>
                        <MapPin size={11} />{project.city || project.siteAddress}
                        {project.endDate && <><Calendar size={11} style={{ marginLeft: 8 }} />{new Date(project.endDate).toLocaleDateString("en-IN")}</>}
                      </div>
                    )}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 6 }}>
                        <span style={{ color: "var(--text-muted)" }}>Progress</span>
                        <span style={{ fontWeight: 700 }}>{project.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Contract Value</div>
                        <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text-emerald)" }}>{formatCurrency(project.contractValue)}</div>
                      </div>
                      {project.estimatedBudget > 0 && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Budget</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{formatCurrency(project.estimatedBudget)}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <div className="table-container">
                <table className="data-table">
                <thead>
                  <tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Contract Value</th><th>End Date</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map((project, i) => {
                    const status = statusConfig[project.status] || statusConfig.PLANNING;
                    return (
                      <motion.tr key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td><div style={{ fontWeight: 600 }}>{project.name}</div><div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{project.projectCode}</div></td>
                        <td style={{ color: "var(--text-secondary)" }}>{project.client?.name || "—"}</td>
                        <td><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: status.color, background: status.bg }}>{status.label}</span></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div>
                            <span style={{ fontSize: "12px", fontWeight: 600 }}>{project.progress}%</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--text-emerald)" }}>{formatCurrency(project.contractValue)}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}>{project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                          <button onClick={() => handleEditProject(project)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", color: "var(--text-emerald)", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Pencil size={11} /> Edit
                          </button>
                          <button onClick={() => handleDelete(project.id)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", cursor: "pointer", color: "#ef4444", fontSize: "12px" }}>
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────── CLIENTS TAB VIEW ──────────────────────────────────── */}
      {activeTab === "clients" && (
        <>
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Search clients..." className="input-field" style={{ paddingLeft: 36 }} />
            </div>
          </div>

          {/* Clients Glass Table */}
          {clientsLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "var(--text-muted)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading clients directory...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase size={28} /></div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 8 }}>
                {clientSearch ? "No matching clients found" : "No clients registered"}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 20 }}>
                {clientSearch ? "Try adjusting your search queries" : "Register a corporate client to get started"}
              </p>
              {!clientSearch && (
                <button className="btn-primary" onClick={() => setShowClientModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
                  <Plus size={14} />Add First Client
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <div className="table-container">
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Client / Company</th>
                    <th>Contact details</th>
                    <th>Location</th>
                    <th>Tax Registration</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, i) => (
                    <motion.tr key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
                        {client.company && <div style={{ fontSize: "11px", color: "var(--text-emerald)", fontWeight: 500 }}>{client.company}</div>}
                      </td>
                      <td>
                        {client.email && <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}><Mail size={11} color="var(--text-muted)" />{client.email}</div>}
                        {client.phone && <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}><Phone size={11} color="var(--text-muted)" />{client.phone}</div>}
                        {!client.email && !client.phone && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>}
                      </td>
                      <td>
                        <div style={{ fontSize: "12.5px" }}>{client.city ? `${client.city}, ${client.state || ""}` : client.state || "—"}</div>
                        {client.address && <div style={{ fontSize: "10.5px", color: "var(--text-muted)", textOverflow: "ellipsis", maxWidth: 200, overflow: "hidden", whiteSpace: "nowrap" }}>{client.address}</div>}
                      </td>
                      <td>
                        {client.gstin && <div style={{ fontSize: "11.5px" }}><span style={{ color: "var(--text-muted)" }}>GSTIN:</span> <code style={{ color: "#3b82f6" }}>{client.gstin}</code></div>}
                        {client.pan && <div style={{ fontSize: "11.5px" }}><span style={{ color: "var(--text-muted)" }}>PAN:</span> <code style={{ color: "#8b5cf6" }}>{client.pan}</code></div>}
                        {!client.gstin && !client.pan && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEditClient(client)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--border-subtle)",
                              background: "transparent",
                              cursor: "pointer",
                              color: "var(--text-emerald)",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleClientDelete(client.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid rgba(239,68,68,0.2)",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#ef4444",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────── MODAL: NEW PROJECT ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseProjectModal}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content" style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>{editingProjectId ? "Edit Project" : "New Project"}</h2>
                <button onClick={handleCloseProjectModal} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="responsive-grid-2" style={{ gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Project Name *</label>
                    <input type="text" placeholder="e.g. Riviera Heights Apartment" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Site Address</label>
                    <input type="text" placeholder="Plot No. 42, Sector 12..." value={form.siteAddress} onChange={(prev) => setForm((p) => ({ ...p, siteAddress: prev.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>City</label>
                    <input type="text" placeholder="Ahmedabad" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>State</label>
                    <input type="text" placeholder="Gujarat" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Estimated Budget (₹)</label>
                    <input type="number" placeholder="0" value={form.estimatedBudget} onChange={(e) => setForm((prev) => ({ ...prev, estimatedBudget: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Contract Value (₹)</label>
                    <input type="number" placeholder="0" value={form.contractValue} onChange={(e) => setForm((prev) => ({ ...prev, contractValue: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Progress (%)</label>
                    <input type="number" placeholder="0" min="0" max="100" value={form.progress} onChange={(e) => setForm((prev) => ({ ...prev, progress: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</label>
                    <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="input-field">
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  
                  {/* Select Client Dropdown with Inline Quick Add Button */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Client</label>
                      <button
                        type="button"
                        onClick={() => { setClientForm(initialClientForm); setClientError(""); setShowQuickClientModal(true); }}
                        style={{
                          fontSize: "11px",
                          color: "var(--text-emerald)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          padding: 0,
                        }}
                      >
                        <Plus size={12} /> Add Client On-The-Fly
                      </button>
                    </div>
                    <select value={form.clientId} onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))} className="input-field">
                      <option value="">No pre-assigned Client (Independent Project)</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Additional project specifications..." className="input-field" rows={3} style={{ resize: "vertical" }} />
                  </div>
                </div>
                {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: "13px", color: "#ef4444" }}>{error}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
                  <button type="button" className="btn-outline" onClick={handleCloseProjectModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Saving...</> : editingProjectId ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Create Project</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── MODAL: NEW CLIENT (STANDALONE) ─────────────────────────────────── */}
      <AnimatePresence>
        {showClientModal && (
          <div className="modal-overlay" onClick={handleCloseClientModal}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content" style={{ maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>{editingClientId ? "Edit Corporate Client" : "New Corporate Client"}</h2>
                <button onClick={handleCloseClientModal} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
              </div>

              <form onSubmit={(e) => handleClientSubmit(e, false)}>
                <div className="responsive-grid-2" style={{ gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Client Name *</label>
                    <input type="text" placeholder="e.g. Patel Builders Pvt Ltd" value={clientForm.name} onChange={(e) => setClientForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Company Name</label>
                    <input type="text" placeholder="Corporate name" value={clientForm.company} onChange={(e) => setClientForm((prev) => ({ ...prev, company: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Contact Phone</label>
                    <input type="text" placeholder="e.g. +91 98765 43210" value={clientForm.phone} onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))} className="input-field" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Contact Email</label>
                    <input type="email" placeholder="client@company.com" value={clientForm.email} onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))} className="input-field" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Billing Address</label>
                    <input type="text" placeholder="Corporate Office Address..." value={clientForm.address} onChange={(e) => setClientForm((prev) => ({ ...prev, address: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>City</label>
                    <input type="text" placeholder="Ahmedabad" value={clientForm.city} onChange={(e) => setClientForm((prev) => ({ ...prev, city: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>State</label>
                    <input type="text" placeholder="Gujarat" value={clientForm.state} onChange={(e) => setClientForm((prev) => ({ ...prev, state: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>GSTIN</label>
                    <input type="text" placeholder="24AAAAA1111A1Z1" value={clientForm.gstin} onChange={(e) => setClientForm((prev) => ({ ...prev, gstin: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>PAN</label>
                    <input type="text" placeholder="ABCDE1234F" value={clientForm.pan} onChange={(e) => setClientForm((prev) => ({ ...prev, pan: e.target.value }))} className="input-field" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Private Notes</label>
                    <textarea placeholder="Any specific requirements or comments..." value={clientForm.notes} onChange={(e) => setClientForm((prev) => ({ ...prev, notes: e.target.value }))} className="input-field" rows={3} style={{ resize: "vertical" }} />
                  </div>
                </div>
                {clientError && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: "13px", color: "#ef4444" }}>{clientError}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
                  <button type="button" className="btn-outline" onClick={handleCloseClientModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={clientSaving}>
                    {clientSaving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Saving...</> : editingClientId ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add Client</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── SUB-MODAL: QUICK ADD CLIENT (INLINE) ─────────────────────────────────── */}
      <AnimatePresence>
        {showQuickClientModal && (
          <div className="modal-overlay" style={{ zIndex: 120 }} onClick={() => setShowQuickClientModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" style={{ maxWidth: 500, border: "1px solid var(--border-emerald)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-emerald)", display: "flex", alignItems: "center", gap: 6 }}><Building2 size={16} /> Quick Add Client</h3>
                <button type="button" onClick={() => setShowQuickClientModal(false)} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><X size={12} /></button>
              </div>

              <form onSubmit={(e) => handleClientSubmit(e, true)}>
                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Client Name *</label>
                    <input type="text" placeholder="Patel Builders" value={clientForm.name} onChange={(e) => setClientForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Company Name</label>
                    <input type="text" placeholder="Corporate office" value={clientForm.company} onChange={(e) => setClientForm((prev) => ({ ...prev, company: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Phone</label>
                    <input type="text" placeholder="e.g. +91 9999" value={clientForm.phone} onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))} className="input-field" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Email Address</label>
                    <input type="email" placeholder="corp@patel.com" value={clientForm.email} onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))} className="input-field" />
                  </div>
                </div>
                {clientError && <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: "12px", color: "#ef4444" }}>{clientError}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
                  <button type="button" className="btn-outline" onClick={() => setShowQuickClientModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={clientSaving}>
                    {clientSaving ? "Adding..." : "Add & Select"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
