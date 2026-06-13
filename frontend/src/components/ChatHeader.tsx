import { User } from "@/context/AppContext";
import { Menu, UserCircle } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const AvatarPlaceholder = ({ name, size = 38 }: { name: string; size?: number }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},45%,28%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: Math.round(size * 0.36),
        fontWeight: 600,
        color: `hsl(${hue},65%,82%)`,
        letterSpacing: "0.02em",
      }}
    >
      {initials || <UserCircle size={size * 0.55} />}
    </div>
  );
};

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnline = user && onlineUsers.includes(user._id);

  return (
    <div
      className="flex items-center flex-shrink-0"
      style={{
        background: "var(--cs-bg-surface)",
        borderBottom: "1px solid var(--cs-border)",
        height: "60px",
        paddingLeft: "16px",
        paddingRight: "20px",
        gap: "12px",
      }}
    >
      {/* Mobile menu button */}
      <button
        className="sm:hidden cs-focus rounded-lg p-1.5 transition-colors"
        style={{ color: "var(--cs-text-secondary)", flexShrink: 0 }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-bg-elevated)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Menu className="w-5 h-5" />
      </button>

      {user ? (
        <>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <AvatarPlaceholder name={user.name} size={36} />
            {isOnline && (
              <span
                className="presence-dot-online absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--cs-green)",
                  border: "2px solid var(--cs-bg-surface)",
                  bottom: 0,
                  right: 0,
                }}
              />
            )}
          </div>

          {/* Name + status */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span
              className="font-semibold leading-tight truncate"
              style={{
                color: "var(--cs-text-primary)",
                fontSize: "14px",
                letterSpacing: "-0.01em",
              }}
            >
              {user.name}
            </span>

            <div className="flex items-center gap-1.5" style={{ marginTop: "1px" }}>
              {isTyping ? (
                <>
                  <div className="flex gap-0.5 items-end" style={{ height: "12px" }}>
                    <div className="typing-dot w-1 h-1 rounded-full" style={{ background: "var(--cs-accent)" }} />
                    <div className="typing-dot w-1 h-1 rounded-full" style={{ background: "var(--cs-accent)" }} />
                    <div className="typing-dot w-1 h-1 rounded-full" style={{ background: "var(--cs-accent)" }} />
                  </div>
                  <span style={{ color: "var(--cs-accent)", fontSize: "12px", fontWeight: 500 }}>
                    typing…
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    color: isOnline ? "var(--cs-green)" : "var(--cs-text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* No chat selected – ghost state */
        <>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--cs-bg-elevated)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserCircle size={18} style={{ color: "var(--cs-text-muted)" }} />
          </div>
          <div>
            <span
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--cs-text-secondary)",
              }}
            >
              Select a conversation
            </span>
            <span style={{ fontSize: "12px", color: "var(--cs-text-muted)" }}>
              Choose from the sidebar to start chatting
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHeader;
