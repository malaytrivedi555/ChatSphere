"use client";
import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import {
  ArrowLeft,
  Check,
  Mail,
  Pencil,
  Save,
  User,
  X,
} from "lucide-react";

/* ── Avatar initials ──────────────────────────────── */
const Avatar = ({ name, size = 72 }: { name: string; size?: number }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},45%,26%)`,
        color: `hsl(${hue},65%,82%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
        letterSpacing: "0.02em",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

/* ── Section card ─────────────────────────────────── */
const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: "var(--cs-bg-surface)",
      border: "1px solid var(--cs-border)",
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Section label ────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--cs-text-muted)",
      padding: "0 0 8px 2px",
    }}
  >
    {children}
  </p>
);

/* ── Read-only info row ───────────────────────────── */
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 20px",
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "var(--cs-bg-elevated)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "var(--cs-text-muted)",
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, color: "var(--cs-text-muted)", marginBottom: 2 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--cs-text-primary)",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

const Divider = () => (
  <div
    style={{
      height: 1,
      background: "var(--cs-border)",
      marginLeft: 68,
      marginRight: 0,
    }}
  />
);

/* ══════════════════════════════════════════════════ */

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // ── ALL LOGIC BELOW IS UNTOUCHED ───────────────────
  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async (e: any) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/update/user`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);
  // ──────────────────────────────────────────────────

  // Focus the name input when edit mode opens
  useEffect(() => {
    if (isEdit) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isEdit]);

  if (loading) return <Loading />;

  const memberSince = user?._id
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      )
    : null;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--cs-bg-base)",
        padding: "0 0 60px",
      }}
    >
      {/* ── Top bar ───────────────────────────────── */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 20px",
          background: "var(--cs-bg-surface)",
          borderBottom: "1px solid var(--cs-border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push("/chat")}
          aria-label="Back to chat"
          className="cs-focus"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: "var(--cs-text-secondary)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "var(--cs-bg-elevated)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--cs-text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Profile Settings
          </h1>
          <p style={{ fontSize: 12, color: "var(--cs-text-muted)", marginTop: 1 }}>
            Manage your account
          </p>
        </div>
      </div>

      {/* ── Page body ─────────────────────────────── */}
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          padding: "32px 20px 0",
        }}
      >
        {/* ── Profile hero card ─────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <div
            style={{
              padding: "28px 24px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              background:
                "linear-gradient(135deg, rgba(88,101,242,0.08) 0%, transparent 60%)",
            }}
          >
            <div style={{ position: "relative" }}>
              <Avatar name={user?.name || "?"} size={72} />
              {/* Online indicator */}
              <span
                className="presence-dot-online"
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--cs-green)",
                  border: "2.5px solid var(--cs-bg-surface)",
                  display: "block",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--cs-text-primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "—"}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--cs-text-secondary)",
                  marginTop: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || "—"}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 8,
                  background: "var(--cs-green-light)",
                  padding: "3px 9px",
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--cs-green)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--cs-green)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Online
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Display Name section ──────────────── */}
        <SectionLabel>Display name</SectionLabel>
        <Card style={{ marginBottom: 24 }}>
          {isEdit ? (
            /* Edit mode */
            <form onSubmit={submitHandler} style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="cs-name-input"
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
                  New display name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="cs-name-input"
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 40px 10px 14px",
                      fontSize: 14,
                      color: "var(--cs-text-primary)",
                      background: "var(--cs-bg-elevated)",
                      border: "1.5px solid var(--cs-accent)",
                      borderRadius: 9,
                      outline: "none",
                      boxShadow: "0 0 0 3px var(--cs-accent-glow)",
                      fontFamily: "inherit",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--cs-border-accent)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--cs-accent)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px var(--cs-accent-glow)";
                    }}
                  />
                  <User
                    size={15}
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--cs-text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    background: "var(--cs-accent)",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "var(--cs-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "var(--cs-accent)")
                  }
                >
                  <Save size={14} />
                  Save changes
                </button>

                <button
                  type="button"
                  onClick={editHandler}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--cs-text-secondary)",
                    background: "var(--cs-bg-elevated)",
                    border: "1px solid var(--cs-border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "var(--cs-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "var(--cs-bg-elevated)")
                  }
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View mode */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "var(--cs-bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "var(--cs-text-muted)",
                }}
              >
                <User size={15} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: "var(--cs-text-muted)", marginBottom: 2 }}>
                  Display name
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--cs-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "—"}
                </p>
              </div>

              <button
                onClick={editHandler}
                className="cs-focus"
                aria-label="Edit display name"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--cs-accent)",
                  background: "var(--cs-accent-light)",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(88,101,242,0.22)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "var(--cs-accent-light)")
                }
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          )}
        </Card>

        {/* ── Account info section ──────────────── */}
        <SectionLabel>Account information</SectionLabel>
        <Card style={{ marginBottom: 24 }}>
          <InfoRow
            icon={<Mail size={15} />}
            label="Email address"
            value={user?.email || "—"}
          />
          {memberSince && (
            <>
              <Divider />
              <InfoRow
                icon={<Check size={15} />}
                label="Member since"
                value={memberSince}
              />
            </>
          )}
        </Card>

        {/* ── Danger zone ───────────────────────── */}
        <SectionLabel>Session</SectionLabel>
        <Card>
          <div style={{ padding: "14px 20px" }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--cs-text-secondary)",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              You are currently signed in as{" "}
              <strong style={{ color: "var(--cs-text-primary)" }}>
                {user?.email}
              </strong>
              .
            </p>
            <button
              onClick={() => router.push("/chat")}
              className="cs-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--cs-text-secondary)",
                background: "var(--cs-bg-elevated)",
                border: "1px solid var(--cs-border)",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--cs-bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--cs-bg-elevated)")
              }
            >
              <ArrowLeft size={14} />
              Back to chat
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
