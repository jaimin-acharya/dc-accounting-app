"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Search,
  File,
  FileText,
  Image,
  Archive,
  Download,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  fileSize: number | null;
  category: string | null;
  project?: { name: string } | null;
  uploadedAt: string;
  tags: string | null;
  filePath: string;
}

const categoryColors: Record<string, string> = {
  Contracts: "#10B981",
  Drawings: "#3b82f6",
  Approvals: "#22c55e",
  Bills: "#f97316",
  Photos: "#8b5cf6",
  Compliance: "#ef4444",
  General: "#B79B6C",
};

const fileIcon = (type: string) => {
  const t = type.toUpperCase();
  if (["PDF", "DOC", "DOCX"].includes(t)) return { icon: FileText, color: "#ef4444" };
  if (["DWG", "PNG", "JPG", "JPEG"].includes(t)) return { icon: Image, color: "#3b82f6" };
  if (["ZIP", "RAR", "7Z"].includes(t)) return { icon: Archive, color: "#eab308" };
  return { icon: File, color: "var(--text-muted)" };
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return "0 KB";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    type: "PDF",
    fileSizeKb: "512",
    category: "Contracts",
    projectId: "",
    tags: "",
  });

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Document name is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const sizeBytes = parseInt(form.fileSizeKb) * 1024;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          fileSize: sizeBytes,
          category: form.category,
          projectId: form.projectId || null,
          tags: form.tags,
          filePath: `/documents/${form.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${form.type.toLowerCase()}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save document metadata");
      }

      setShowModal(false);
      setForm({
        name: "",
        type: "PDF",
        fileSizeKb: "512",
        category: "Contracts",
        projectId: "",
        tags: "",
      });
      fetchDocs();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (err) {
      console.error("Delete document error:", err);
    }
  };

  const categories = ["ALL", "Contracts", "Drawings", "Approvals", "Bills", "Photos", "Compliance", "General"];

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.project?.name || "General").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="section-title">Document Management</h1>
          <p className="section-subtitle">{documents.length} file{documents.length !== 1 ? "s" : ""} across all projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}>
          <Upload size={14} />Upload File
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div
        onClick={() => setShowModal(true)}
        style={{ border: "2px dashed var(--border-color)", borderRadius: 16, padding: "28px 24px", textAlign: "center", background: "rgba(16,185,129,0.04)", cursor: "pointer", transition: "all 0.2s ease" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.04)"; }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Upload size={20} color="#10B981" />
        </div>
        <p style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)", marginBottom: 4 }}>Drop files here or click to upload</p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF, DWG, Images, Archives — max 100MB per file</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="input-field" style={{ paddingLeft: 36 }} />
        </div>
        <div className="pill-tabs">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`pill-tab ${categoryFilter === c ? "active" : ""}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "var(--text-muted)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading documents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "48px 24px" }}>
          <div className="empty-state-icon"><FolderOpen size={28} /></div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 8 }}>
            {search || categoryFilter !== "ALL" ? "No matching documents" : "No documents yet"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 20 }}>
            {search || categoryFilter !== "ALL"
              ? "Try adjusting your filters or search keywords."
              : "Upload documents like contracts, structural drawings, invoices, or approvals."}
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} style={{ marginRight: 6 }} /> Add Document
          </button>
        </div>
      ) : (
        <div className="responsive-grid-3">
          {filtered.map((doc, i) => {
            const fi = fileIcon(doc.type);
            const FileIcon = fi.icon;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card hover-lift"
                style={{ padding: 18 }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${fi.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileIcon size={20} color={fi.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)", lineHeight: 1.3, wordBreak: "break-word" }}>{doc.name}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: 4 }}>
                      {formatSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "10.5px", fontWeight: 600, color: categoryColors[doc.category || "General"] || "#10B981", background: `${categoryColors[doc.category || "General"] || "#10B981"}18` }}>
                      {doc.category || "General"}
                    </span>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                      {doc.project?.name || "General"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid var(--border-subtle)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                      title="Download"
                      onClick={() => alert("Downloading file " + doc.name)}>
                      <Download size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid transparent", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s" }}
                      title="Delete"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Document Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: 480, padding: 24, position: "relative", border: "1px solid var(--border-color)", background: "rgba(22,22,22,0.95)" }}
            >
              <button
                onClick={() => { setShowModal(false); setError(""); }}
                style={{ position: "absolute", right: 16, top: 16, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>

              <h2 style={{ fontSize: "1.2rem", fontFamily: "'Urbanist', sans-serif", fontWeight: 700, color: "var(--text-emerald)", marginBottom: 4 }}>
                Upload New Document
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: 20 }}>
                Enter metadata to link files dynamically in Dhruvanshi database.
              </p>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", fontSize: "12.5px", marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Document Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Riviera Heights — Structural Layout RevA"
                    className="input-field"
                    required
                  />
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>File Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="input-field"
                      style={{ background: "#161616", color: "var(--text-primary)" }}
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="DWG">CAD (DWG)</option>
                      <option value="ZIP">ZIP Archive</option>
                      <option value="PNG">Image (PNG)</option>
                      <option value="JPG">Image (JPG)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>File Size (KB)</label>
                    <input
                      type="number"
                      value={form.fileSizeKb}
                      onChange={(e) => setForm({ ...form, fileSizeKb: e.target.value })}
                      placeholder="Size in KB"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-field"
                      style={{ background: "#161616", color: "var(--text-primary)" }}
                    >
                      <option value="Contracts">Contracts</option>
                      <option value="Drawings">Drawings</option>
                      <option value="Approvals">Approvals</option>
                      <option value="Bills">Bills</option>
                      <option value="Photos">Photos</option>
                      <option value="Compliance">Compliance</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Project Association</label>
                    <select
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      className="input-field"
                      style={{ background: "#161616", color: "var(--text-primary)" }}
                    >
                      <option value="">General (No project)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. structural, steel, drawing"
                    className="input-field"
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError(""); }}
                    className="btn-outline"
                    style={{ flex: 1, padding: "10px 0" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Document</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
