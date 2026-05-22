"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Package,
  HardHat,
  FileText,
  BarChart3,
  Settings,
  FolderOpen,
  ArrowRight,
  Plus,
} from "lucide-react";

const commands = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", group: "Navigation" },
  { label: "Projects", icon: FolderKanban, href: "/dashboard/projects", group: "Navigation" },
  { label: "Accounting", icon: Calculator, href: "/dashboard/accounting", group: "Navigation" },
  { label: "Contractors", icon: HardHat, href: "/dashboard/contractors", group: "Navigation" },
  { label: "Reports", icon: BarChart3, href: "/dashboard/reports", group: "Navigation" },
  { label: "Documents", icon: FolderOpen, href: "/dashboard/documents", group: "Navigation" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", group: "Navigation" },
  { label: "New Project", icon: Plus, href: "/dashboard/projects/new", group: "Quick Actions" },
  { label: "Add Expense", icon: Plus, href: "/dashboard/accounting/expenses/new", group: "Quick Actions" },
  { label: "Journal Entry", icon: Plus, href: "/dashboard/accounting/journal/new", group: "Quick Actions" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.group.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    },
    {} as Record<string, typeof commands>
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && filtered[selected]) {
        router.push(filtered[selected].href);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, selected, filtered, router, onClose]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 999,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 560,
              maxWidth: "calc(100vw - 40px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              zIndex: 1000,
              overflow: "hidden",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Search modules, actions, reports..."
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <kbd
                style={{
                  fontSize: "11px",
                  background: "var(--border-subtle)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0" }}>
              {Object.keys(grouped).length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No results for &quot;{query}&quot;
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div
                      style={{
                        padding: "6px 20px 4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                      }}
                    >
                      {group}
                    </div>
                    {items.map((cmd) => {
                      const isSelected = flatIndex === selected;
                      const Icon = cmd.icon;
                      const currentIndex = flatIndex++;
                      return (
                        <button
                          key={cmd.href}
                          onClick={() => {
                            router.push(cmd.href);
                            onClose();
                          }}
                          onMouseEnter={() => setSelected(currentIndex)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 20px",
                            width: "100%",
                            background: isSelected ? "rgba(16,185,129,0.1)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: isSelected ? "var(--text-emerald)" : "var(--text-primary)",
                            fontSize: "13.5px",
                            fontWeight: isSelected ? 600 : 400,
                            transition: "all 0.1s ease",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: isSelected
                                ? "rgba(16,185,129,0.15)"
                                : "var(--bg-glass)",
                              border: "1px solid var(--border-subtle)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={14} strokeWidth={2} />
                          </div>
                          {cmd.label}
                          {isSelected && (
                            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                padding: "10px 20px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                gap: 16,
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {[
                { key: "↑↓", label: "Navigate" },
                { key: "↵", label: "Select" },
                { key: "ESC", label: "Close" },
              ].map((hint) => (
                <div key={hint.key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <kbd
                    style={{
                      background: "var(--bg-glass)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 5,
                      padding: "1px 6px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {hint.key}
                  </kbd>
                  {hint.label}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
