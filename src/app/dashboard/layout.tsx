"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("dc_session");
    if (!session) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Electron Titlebar */}
      <div className="titlebar" style={{ background: "var(--bg-secondary)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #10B981, #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#1A1A1A" }}>DC</span>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            Dhruvanshi Construction ERP
          </span>
        </div>
        <div className="titlebar-controls">
          <button
            className="titlebar-btn"
            onClick={() => (window as any).electronAPI?.window.minimize()}
            title="Minimize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1" y="5.5" width="10" height="1" fill="currentColor" rx="0.5" />
            </svg>
          </button>
          <button
            className="titlebar-btn"
            onClick={() => (window as any).electronAPI?.window.maximize()}
            title="Maximize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" rx="1" />
            </svg>
          </button>
          <button
            className="titlebar-btn close"
            onClick={() => (window as any).electronAPI?.window.close()}
            title="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="mobile-backdrop show-mobile"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container (Responsive) */}
        <div
          className={mobileSidebarOpen ? "mobile-sidebar-drawer" : "hidden-mobile"}
          style={{ height: "100%", display: "flex", flexShrink: 0 }}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((p) => !p)}
            currentPath={pathname}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <Header
            onCommandOpen={() => setCommandOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onMobileSidebarToggle={() => setMobileSidebarOpen((prev) => !prev)}
          />

          <main
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px",
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ height: "100%" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
