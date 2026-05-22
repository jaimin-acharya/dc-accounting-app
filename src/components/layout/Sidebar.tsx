"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Package,
  HardHat,
  FileText,
  BarChart3,
  Settings,
  FolderOpen,
  ChevronLeft,
  Building2,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    group: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
    ],
  },
  {
    group: "Finance",
    items: [
      { href: "/dashboard/accounting", icon: Calculator, label: "Accounting" },
      { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/dashboard/contractors", icon: HardHat, label: "Contractors" },
      { href: "/dashboard/documents", icon: FolderOpen, label: "Documents" },
    ],
  },
  {
    group: "System",
    items: [{ href: "/dashboard/settings", icon: Settings, label: "Settings" }],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}

export function Sidebar({ collapsed, onToggle, currentPath }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("dc_session");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: "100%",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: "16px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: 60,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10B981, #34D399)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}
        >
          <Building2 size={18} color="#1A1A1A" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", whiteSpace: "nowrap" }}
            >
              <div
                style={{
                  fontFamily: "'Urbanist', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                Dhruvanshi
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "var(--text-emerald)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Construction ERP
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}>
        {navItems.map((group) => (
          <div key={group.group} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div
                style={{
                  padding: "10px 20px 4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "10px 18px" : "9px 12px",
                    margin: "1px 8px",
                    borderRadius: 10,
                    border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                    background: active
                      ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))"
                      : "transparent",
                    color: active ? "var(--text-emerald)" : "var(--text-secondary)",
                    cursor: "pointer",
                    width: "calc(100% - 16px)",
                    transition: "all 0.2s ease",
                    fontSize: "13.5px",
                    fontWeight: active ? 600 : 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.5 : 2}
                    style={{ flexShrink: 0 }}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !collapsed && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--text-emerald)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom — collapse toggle + logout */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 18px" : "9px 12px",
            borderRadius: 10,
            border: "1px solid transparent",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            width: "100%",
            fontSize: "13px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="hidden-mobile">
          <button
            onClick={onToggle}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px",
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              width: "100%",
              fontSize: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <ChevronLeft
              size={14}
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
