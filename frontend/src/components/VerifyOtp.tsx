"use client";
import axios from "axios";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  // ── ALL STATE AND LOGIC BELOW IS 100% UNTOUCHED ────────────────────────────
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchChats,
    fetchUsers,
  } = useAppData();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    // auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    // only allow digits
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const patedData = e.clipboardData.getData("text");
    const digits = patedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/verify`, {
        email,
        otp: otpString,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setError(error.response.data.message);
      // shake the inputs on error
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });
      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (userLoading) return <Loading />;
  if (isAuth) redirect("/chat");
  // ── END OF UNTOUCHED LOGIC ─────────────────────────────────────────────────

  // SVG arc geometry for the countdown ring
  const R = 11; // radius
  const C = 2 * Math.PI * R; // circumference ≈ 69.1
  const timerPct = timer / 60;
  const arcOffset = C * (1 - timerPct); // shrinks as timer counts down

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
      {/* Ambient glow — matches login page exactly */}
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

        {/* ── Back link ───────────────────────────────── */}
        <button
          onClick={() => router.push("/login")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--cs-text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            marginBottom: 28,
            fontFamily: "inherit",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--cs-text-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--cs-text-secondary)")
          }
        >
          <ArrowLeft size={15} />
          Back to login
        </button>

        {/* ── Brand header (outside card) ─────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {/* Shield icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--cs-accent-light)",
              border: "1px solid rgba(88,101,242,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(88,101,242,0.15)",
            }}
          >
            <ShieldCheck size={26} color="var(--cs-accent)" strokeWidth={2} />
          </div>

          {/* Title + email */}
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
              Check your email
            </h1>
            <p
              style={{
                marginTop: 6,
                fontSize: 14,
                color: "var(--cs-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              We sent a 6-digit code to
            </p>
            <p
              style={{
                marginTop: 2,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--cs-accent)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {email}
            </p>
          </div>
        </div>

        {/* ── Card ────────────────────────────────────── */}
        <div
          style={{
            background: "var(--cs-bg-surface)",
            border: "1px solid var(--cs-border)",
            borderRadius: 16,
            /* 32px top/bottom gives the card room to breathe without feeling bloated */
            padding: "28px 28px 24px",
          }}
        >
          <form onSubmit={handleSubmit}>

            {/* OTP inputs label */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--cs-text-secondary)",
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              Enter verification code
            </p>

            {/* OTP boxes
                gap-3 = 12px between boxes.
                Previously gap-2.5 (10px) — the extra 2px per gap removes the cramped
                feeling while keeping all 6 boxes comfortably within a 400px card. */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="otp-input"
                  aria-label={`Digit ${index + 1} of 6`}
                  style={{
                    width: 46,
                    height: 54,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    borderRadius: 10,
                    background: digit
                      ? "var(--cs-accent-light)"
                      : "var(--cs-bg-elevated)",
                    border: `2px solid ${digit ? "var(--cs-accent)" : "var(--cs-border)"}`,
                    color: "var(--cs-text-primary)",
                    outline: "none",
                    transition: "background 0.12s, border-color 0.12s",
                    /* Prevent mobile zoom on focus (font-size ≥ 16px triggers zoom,
                       but we intentionally keep 20px for visual weight — iOS only
                       zooms if the input font-size is < 16px, so this is fine) */
                  }}
                />
              ))}
            </div>

            {/* Error pill — slides in when error is set */}
            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "var(--cs-red-light)",
                  border: "1px solid rgba(237,66,69,0.25)",
                  color: "var(--cs-red)",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--cs-red)",
                    flexShrink: 0,
                  }}
                />
                {error}
              </div>
            )}

            {/* Verify button */}
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
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--cs-accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--cs-accent)";
              }}
              onMouseDown={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify code
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>

          {/* ── Resend section ─────────────────────────
              Sits outside the <form> so it cannot accidentally submit.
              A top border visually separates it from the verify button
              without needing extra margin.                              */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid var(--cs-border)",
            }}
          >
            {timer > 0 ? (
              /* Countdown state — ring + label on one line */
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {/* SVG countdown ring — 26×26 px, r=11 */}
                <svg
                  width={26}
                  height={26}
                  viewBox="0 0 26 26"
                  style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
                  aria-hidden="true"
                >
                  {/* Track */}
                  <circle
                    cx={13}
                    cy={13}
                    r={R}
                    fill="none"
                    stroke="var(--cs-border)"
                    strokeWidth={2.5}
                  />
                  {/* Progress arc */}
                  <circle
                    cx={13}
                    cy={13}
                    r={R}
                    fill="none"
                    stroke="var(--cs-accent)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={arcOffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--cs-text-muted)",
                  }}
                >
                  Resend available in{" "}
                  <span
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--cs-text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {timer}s
                  </span>
                </p>
              </div>
            ) : (
              /* Resend available state */
              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--cs-text-secondary)",
                }}
              >
                Didn't receive it?{" "}
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: resendLoading ? "var(--cs-text-muted)" : "var(--cs-accent)",
                    cursor: resendLoading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "opacity 0.15s",
                    textDecoration: "underline",
                    textDecorationColor: "transparent",
                    textUnderlineOffset: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!resendLoading)
                      (e.currentTarget as HTMLElement).style.textDecorationColor =
                        "var(--cs-accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.textDecorationColor =
                      "transparent";
                  }}
                >
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ── Footer note — mirrors login page ────────── */}
        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: "var(--cs-text-muted)",
            lineHeight: 1.6,
          }}
        >
          Code expires after 10 minutes. Check your spam folder if you
          don't see it.
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
