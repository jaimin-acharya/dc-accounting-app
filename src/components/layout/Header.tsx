"use client";

import { useState } from "react";
import { Search, Bell, Sun, Moon, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onCommandOpen: () => void;
  sidebarCollapsed: boolean;
  onMobileSidebarToggle?: () => void;
}

export function Header({ onCommandOpen, onMobileSidebarToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, type: "warning", message: "Cement stock below minimum level", time: "5m ago" },
    { id: 2, type: "success", message: "Invoice #INV-2024-001 marked as paid", time: "1h ago" },
    { id: 3, type: "info", message: "Payroll for March 2024 pending approval", time: "2h ago" },
  ];

  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("dc_session") || "{}")
      : {};

  return (
    <header
      style={{
        height: 60,
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Hamburger menu button for mobile */}
      <button
        onClick={onMobileSidebarToggle}
        className="show-mobile"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid var(--border-subtle)",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        <Menu size={18} />
      </button>

      {/* Search Bar */}
      <button
        onClick={onCommandOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          background: "var(--bg-glass)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: "13px",
          minWidth: 120,
          maxWidth: 240,
          flex: 1,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        }}
      >
        <Search size={14} />
        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>Search...</span>
        <span
          className="hidden-mobile"
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            background: "var(--border-subtle)",
            padding: "2px 6px",
            borderRadius: 6,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Ctrl+K
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
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
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "all 0.2s ease",
              position: "relative",
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
            <Bell size={15} />
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 7,
                width: 7,
                height: 7,
                background: "#ef4444",
                borderRadius: "50%",
                border: "1.5px solid var(--bg-secondary)",
              }}
            />
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 320,
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: 14,
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(20px)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    background: "rgba(16,185,129,0.15)",
                    color: "var(--text-emerald)",
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {notifications.length} new
                </span>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        marginTop: 5,
                        flexShrink: 0,
                        background:
                          n.type === "warning"
                            ? "#eab308"
                            : n.type === "success"
                            ? "#22c55e"
                            : "#3b82f6",
                      }}
                    />
                    <div>
                      <p style={{ fontSize: "12.5px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 3 }}>
                        {n.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{ width: 1, height: 24, background: "var(--border-subtle)", margin: "0 4px" }}
        />

        {/* User Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "linear-gradient(135deg, #10B981, #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              color: "#1A1A1A",
            }}
          >
            {(session?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="hidden-mobile">
            <div
              style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.1 }}
            >
              {session?.name || "Admin"}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-emerald)", fontWeight: 600 }}>
              {session?.role || "ADMIN"}
            </div>
          </div>
          <ChevronDown size={12} color="var(--text-muted)" className="hidden-mobile" />
        </div>
      </div>
    </header>
  );
}
