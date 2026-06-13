"use client";
import { User } from "@/context/AppContext";
import {
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

/* ── Avatar ──────────────────────────────────────── */
const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
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
        color: `hsl(${hue},65%,82%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: Math.round(size * 0.36),
        fontWeight: 600,
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
    >
      {initials || <UserCircle size={size * 0.55} />}
    </div>
  );
};

/* ── Online dot ──────────────────────────────────── */
const OnlineDot = ({ borderColor = "var(--cs-bg-surface)" }: { borderColor?: string }) => (
  <span
    className="presence-dot-online"
    style={{
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--cs-green)",
      border: `2px solid ${borderColor}`,
      display: "block",
    }}
  />
);

/* ── Sidebar ─────────────────────────────────────── */
const ChatSidebar = ({
  sidebarOpen,
  setShowAllUsers,
  setSidebarOpen,
  showAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
  onlineUsers,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = (users || []).filter(
    (u) =>
      u._id !== loggedInUser?._id &&
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = (chats || []).filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 sm:hidden"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          width: 280,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--cs-bg-surface)",
          borderRight: "1px solid var(--cs-border)",
        }}
        className={`fixed top-0 left-0 z-20 sm:static transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-300`}
      >
        {/* ── Header ────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            height: "60px",
            borderBottom: "1px solid var(--cs-border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--cs-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircle size={16} color="white" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--cs-text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {showAllUsers ? "New chat" : "Messages"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {/* New chat / cancel toggle */}
            <button
              onClick={() => setShowAllUsers((p) => !p)}
              aria-label={showAllUsers ? "Cancel" : "New conversation"}
              className="cs-focus"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showAllUsers ? "var(--cs-red-light)" : "var(--cs-accent-light)",
                color: showAllUsers ? "var(--cs-red)" : "var(--cs-accent)",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {showAllUsers ? <X size={14} /> : <Plus size={14} />}
            </button>
            {/* Mobile close */}
            <button
              className="sm:hidden cs-focus"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "var(--cs-text-muted)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Search ────────────────────────────── */}
        <div style={{ padding: "10px 12px 4px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--cs-text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 30,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                background: "var(--cs-bg-elevated)",
                border: "1px solid var(--cs-border)",
                borderRadius: 8,
                color: "var(--cs-text-primary)",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--cs-border-accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--cs-border)")}
            />
          </div>
        </div>

        {/* ── Content ───────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto custom-scroll"
          style={{ padding: "4px 8px 4px" }}
        >
          {showAllUsers ? (
            /* All users */
            filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <UserRow
                  key={u._id}
                  name={u.name}
                  isOnline={onlineUsers.includes(u._id)}
                  onClick={() => createChat(u)}
                />
              ))
            ) : (
              <EmptyState icon={<UserCircle size={28} />} text="No users found" />
            )
          ) : filteredChats.length > 0 ? (
            /* Chat list */
            filteredChats.map((chat) => {
              const latest    = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isMine    = latest?.sender === loggedInUser?._id;
              const unseen    = chat.chat.unseenCount || 0;
              const isOnline  = onlineUsers.includes(chat.user._id);

              return (
                <ChatRow
                  key={chat.chat._id}
                  name={chat.user.name}
                  preview={
                    latest
                      ? isMine
                        ? `You: ${latest.text || "📷 Image"}`
                        : latest.text || "📷 Image"
                      : "No messages yet"
                  }
                  isSelected={isSelected}
                  isOnline={isOnline}
                  unseenCount={unseen}
                  onClick={() => {
                    setSelectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                />
              );
            })
          ) : chats && chats.length === 0 ? (
            <EmptyState
              icon={<MessageCircle size={28} />}
              text="No conversations yet"
              sub="Tap + to start a new chat"
            />
          ) : null}
        </div>

        {/* ── Footer / profile ──────────────────── */}
        <div
          style={{
            borderTop: "1px solid var(--cs-border)",
            padding: "8px",
            flexShrink: 0,
          }}
        >
          {/* Logged-in user pill */}
          {loggedInUser && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                background: "var(--cs-bg-elevated)",
                marginBottom: 4,
              }}
            >
              <div style={{ position: "relative" }}>
                <Avatar name={loggedInUser.name} size={30} />
                <OnlineDot borderColor="var(--cs-bg-elevated)" />
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--cs-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {loggedInUser.name}
              </span>
            </div>
          )}

          <FooterButton
            icon={<Settings size={14} />}
            label="Profile settings"
            href="/profile"
          />
          <FooterButton
            icon={<LogOut size={14} />}
            label="Sign out"
            onClick={handleLogout}
            danger
          />
        </div>
      </aside>
    </>
  );
};

/* ── Sub-components ──────────────────────────────── */

const ChatRow = ({
  name,
  preview,
  isSelected,
  isOnline,
  unseenCount,
  onClick,
}: {
  name: string;
  preview: string;
  isSelected: boolean;
  isOnline: boolean;
  unseenCount: number;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s",
        background: isSelected
          ? "var(--cs-accent-light)"
          : hovered
          ? "var(--cs-bg-elevated)"
          : "transparent",
        outline: isSelected ? "1px solid rgba(88,101,242,0.25)" : "none",
        marginBottom: 1,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={name} size={40} />
        {isOnline && <OnlineDot />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--cs-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {name}
          </span>
          {unseenCount > 0 && (
            <span
              style={{
                background: "var(--cs-accent)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
                flexShrink: 0,
                marginLeft: 6,
              }}
            >
              {unseenCount > 99 ? "99+" : unseenCount}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 12,
            color: unseenCount > 0 ? "var(--cs-text-secondary)" : "var(--cs-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: unseenCount > 0 ? 500 : 400,
          }}
        >
          {preview}
        </p>
      </div>
    </button>
  );
};

const UserRow = ({
  name,
  isOnline,
  onClick,
}: {
  name: string;
  isOnline: boolean;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s",
        background: hovered ? "var(--cs-bg-elevated)" : "transparent",
        marginBottom: 1,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={name} size={36} />
        {isOnline && <OnlineDot />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </p>
        <p style={{ fontSize: 11, color: isOnline ? "var(--cs-green)" : "var(--cs-text-muted)" }}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </button>
  );
};

const EmptyState = ({
  icon,
  text,
  sub,
}: {
  icon: React.ReactNode;
  text: string;
  sub?: string;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 16px",
      gap: 10,
      textAlign: "center",
    }}
  >
    <div style={{ color: "var(--cs-text-muted)", opacity: 0.5 }}>{icon}</div>
    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-text-secondary)" }}>{text}</p>
    {sub && <p style={{ fontSize: 12, color: "var(--cs-text-muted)" }}>{sub}</p>}
  </div>
);

const FooterButton = ({
  icon,
  label,
  href,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const style: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    background: danger && hovered ? "rgba(237,66,69,0.1)" : hovered ? "var(--cs-bg-elevated)" : "transparent",
    color: danger ? "var(--cs-red)" : "var(--cs-text-secondary)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    transition: "background 0.12s",
  };

  if (href) {
    return (
      <Link
        href={href}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
    </button>
  );
};

export default ChatSidebar;
