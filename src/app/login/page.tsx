"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Lock, Eye, EyeOff, User, ChevronDown } from "lucide-react";

type Role = "ADMIN" | "ACCOUNTANT" | "SITE_MANAGER";

const roles: { value: Role; label: string; description: string }[] = [
  { value: "ADMIN", label: "Administrator", description: "Full system access" },
  { value: "ACCOUNTANT", label: "Accountant", description: "Accounting & reports" },
  { value: "SITE_MANAGER", label: "Site Manager", description: "Projects & inventory" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = roles.find((r) => r.value === role)!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate auth (will connect to API route later)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      // Store session
      localStorage.setItem("dc_session", JSON.stringify({ email, role, name: "Admin User" }));
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden animated-bg">
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div className="login-flex-container">
        {/* Left — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ maxWidth: 380 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #10B981, #34D399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}
            >
              <Building2 size={28} color="#1A1A1A" strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Urbanist', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                }}
              >
                Dhruvanshi
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-emerald)",
                }}
              >
                Construction ERP
              </div>
            </div>
          </div>

          <h1>
            Enterprise{" "}
            <span className="emerald-gradient-text">Construction</span>
            <br />
            Accounting
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Complete financial management, project accounting, GST billing, and real-time analytics — all in one premium desktop application.
          </p>

          <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
            {[
              { label: "Projects", value: "∞" },
              { label: "GST Ready", value: "✓" },
              { label: "Offline First", value: "✓" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontFamily: "'Urbanist', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "var(--text-emerald)",
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="glass-card"
          style={{ width: 420, padding: "40px 36px" }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              Sign In
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Access your construction management dashboard
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Role
            </label>
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "13.5px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <User size={15} color="var(--text-emerald)" />
                <span style={{ fontWeight: 500 }}>{selectedRole.label}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  — {selectedRole.description}
                </span>
              </div>
              <ChevronDown
                size={14}
                color="var(--text-muted)"
                style={{
                  transform: showRoleMenu ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {showRoleMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 12,
                  overflow: "hidden",
                  zIndex: 50,
                  boxShadow: "var(--shadow-lg)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value);
                      setShowRoleMenu(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      background: role === r.value ? "rgba(16,185,129,0.1)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: role === r.value ? "var(--text-emerald)" : "var(--text-primary)",
                      fontSize: "13px",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {r.description}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dhruvanshi.com"
                  required
                  autoComplete="off"
                  className="input-field"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="input-field"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10,
                    color: "#ef4444",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(26,26,26,0.3)",
                        borderTop: "2px solid #1A1A1A",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Sign In Securely
                  </>
                )}
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Default credentials: admin@dhruvanshi.com / admin123
          </div>
        </motion.div>
      </div>

      <style>{`
        .login-flex-container {
          display: flex;
          gap: 80px;
          align-items: center;
          z-index: 1;
          flex-direction: row;
        }
        @media (max-width: 1023px) {
          .login-flex-container {
            flex-direction: column;
            gap: 40px;
            padding: 24px;
            text-align: center;
            max-width: 480px;
            margin: 40px auto;
          }
          .login-flex-container > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
