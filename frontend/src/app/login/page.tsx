"use client";
import Loading from "@/components/Loading";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { isAuth, loading: userLoading } = useAppData();

  // ── ALL LOGIC BELOW IS UNTOUCHED ──────────────────
  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });

      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <Loading />;
  if (isAuth) return redirect("/chat");
  // ─────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cs-bg-base)",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      {/* Ambient glow — purely decorative */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(88,101,242,0.07) 0%, transparent 100%)",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* ── Brand mark ──────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--cs-accent)",
              boxShadow: "0 8px 24px rgba(88,101,242,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageCircle size={26} color="white" strokeWidth={2} />
          </div>

          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--cs-text-primary)",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              Welcome to ChatSphere
            </h1>
            <p
              style={{
                marginTop: 6,
                fontSize: 14,
                color: "var(--cs-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Enter your email to sign in or create an account
            </p>
          </div>
        </div>

        {/* ── Card ────────────────────────────────── */}
        <div
          style={{
            background: "var(--cs-bg-surface)",
            border: "1px solid var(--cs-border)",
            borderRadius: 16,
            padding: "28px 28px 24px",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="cs-email"
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--cs-text-secondary)",
                  marginBottom: 7,
                }}
              >
                Email address
              </label>

              <input
                id="cs-email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "var(--cs-text-primary)",
                  background: "var(--cs-bg-elevated)",
                  border: "1.5px solid var(--cs-border)",
                  borderRadius: 10,
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--cs-accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--cs-accent-glow)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--cs-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "11px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                background: loading ? "var(--cs-accent-hover)" : "var(--cs-accent)",
                border: "none",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
                transition: "background 0.15s, opacity 0.15s, transform 0.1s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--cs-accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--cs-accent)";
              }}
              onMouseDown={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending code…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider + helper */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--cs-border)" }} />
            <p style={{ fontSize: 12, color: "var(--cs-text-muted)", whiteSpace: "nowrap" }}>
              We'll email you a one-time code
            </p>
            <div style={{ flex: 1, height: 1, background: "var(--cs-border)" }} />
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: "var(--cs-text-muted)",
            lineHeight: 1.6,
          }}
        >
          By continuing you agree to ChatSphere's{" "}
          <span style={{ color: "var(--cs-text-secondary)" }}>Terms of Service</span>
          {" "}and{" "}
          <span style={{ color: "var(--cs-text-secondary)" }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
