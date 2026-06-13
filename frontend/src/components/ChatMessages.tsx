"use client";
import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { Check, CheckCheck, MessageCircle, X, ZoomIn } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

/* ── Lightbox ──────────────────────────────────────── */
const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="cs-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        onClick={onClose}
        className="cs-focus"
        aria-label="Close preview"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
        }}
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt="Full-size preview"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>
  );
};

/* ── Main component ────────────────────────────────── */
const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* De-duplicate */
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);

  /* Grouping helpers */
  const isSameGroup = useCallback(
    (idx: number): boolean => {
      if (idx === 0) return false;
      const cur  = uniqueMessages[idx];
      const prev = uniqueMessages[idx - 1];
      return (
        cur.sender === prev.sender &&
        moment(cur.createdAt).diff(moment(prev.createdAt), "minutes") < 4
      );
    },
    [uniqueMessages]
  );

  const isGroupTail = useCallback(
    (idx: number): boolean => {
      if (idx === uniqueMessages.length - 1) return true;
      const cur  = uniqueMessages[idx];
      const next = uniqueMessages[idx + 1];
      return (
        cur.sender !== next.sender ||
        moment(next.createdAt).diff(moment(cur.createdAt), "minutes") >= 4
      );
    },
    [uniqueMessages]
  );

  /* ─────────────── No chat selected ─────────────── */
  if (!selectedUser) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden"
        style={{ background: "var(--cs-bg-base)" }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            background: "var(--cs-bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageCircle size={34} style={{ color: "var(--cs-text-muted)" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--cs-text-secondary)" }}>
            Your messages
          </p>
          <p style={{ fontSize: 13, color: "var(--cs-text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Select a conversation from the sidebar<br />or start a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      {/* Scroll container – fills available height exactly */}
      <div
        className="flex-1 overflow-y-auto custom-scroll"
        style={{
          background: "var(--cs-bg-base)",
          minHeight: 0,
        }}
      >
        {/* Centred column – Telegram-style */}
        <div
          style={{
            maxWidth: "var(--cs-msg-max)",
            margin: "0 auto",
            padding: "20px 16px 8px",
          }}
        >
          {uniqueMessages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "40vh",
                gap: 12,
                textAlign: "center",
              }}
            >
              <MessageCircle size={28} style={{ color: "var(--cs-text-muted)" }} />
              <p style={{ fontSize: 13, color: "var(--cs-text-muted)" }}>
                No messages yet — say hello!
              </p>
            </div>
          ) : (
            uniqueMessages.map((msg, i) => {
              const mine      = msg.sender === loggedInUser?._id;
              const key       = `${msg._id}-${i}`;
              const grouped   = isSameGroup(i);
              const tail      = isGroupTail(i);
              const showDate  = !grouped;

              /* Border-radius: tail = 4px on the "tail" corner */
              const r = 18;
              const t = 4;
              const bubbleRadius = mine
                ? tail ? `${r}px ${r}px ${t}px ${r}px` : `${r}px ${r}px ${r}px ${r}px`
                : tail ? `${r}px ${r}px ${r}px ${t}px` : `${r}px ${r}px ${r}px ${r}px`;

              return (
                <div key={key}>
                  {/* Date separator */}
                  {showDate && i !== 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "14px 0 10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--cs-text-muted)",
                          background: "var(--cs-bg-elevated)",
                          padding: "3px 10px",
                          borderRadius: 20,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {moment(msg.createdAt).calendar(null, {
                          sameDay:  "[Today]",
                          lastDay:  "[Yesterday]",
                          sameElse: "MMM D, YYYY",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Bubble row */}
                  <div
                    className="msg-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: mine ? "flex-end" : "flex-start",
                      marginTop: grouped ? 2 : 8,
                    }}
                  >
                    {/* Image bubble */}
                    {msg.messageType === "image" && msg.image && (
                      <div
                        style={{
                          maxWidth: "min(var(--cs-bubble-max), 78vw)",
                          borderRadius: bubbleRadius,
                          overflow: "hidden",
                          cursor: "zoom-in",
                          position: "relative",
                        }}
                        onClick={() => setLightboxSrc(msg.image!.url)}
                        role="button"
                        tabIndex={0}
                        aria-label="View full-size image"
                        onKeyDown={(e) => e.key === "Enter" && setLightboxSrc(msg.image!.url)}
                      >
                        <img
                          src={msg.image.url}
                          alt="Shared image"
                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: 320,
                            height: "auto",
                            maxHeight: 260,
                            objectFit: "cover",
                          }}
                          loading="lazy"
                        />
                        {/* Zoom hint overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "rgba(0,0,0,0.22)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "rgba(0,0,0,0)")
                          }
                        >
                          <ZoomIn
                            size={22}
                            style={{ color: "white", opacity: 0, transition: "opacity 0.15s" }}
                            className="img-zoom-icon"
                          />
                        </div>
                        {/* Caption */}
                        {msg.text && (
                          <div
                            style={{
                              padding: "6px 12px 8px",
                              background: mine
                                ? "var(--cs-bubble-out)"
                                : "var(--cs-bubble-in)",
                              color: mine ? "white" : "var(--cs-text-primary)",
                              fontSize: 13.5,
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.text}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text bubble */}
                    {msg.messageType !== "image" && msg.text && (
                      <div
                        style={{
                          maxWidth: "min(var(--cs-bubble-max), 78vw)",
                          background: mine ? "var(--cs-bubble-out)" : "var(--cs-bubble-in)",
                          color: mine ? "white" : "var(--cs-text-primary)",
                          padding: "8px 13px",
                          borderRadius: bubbleRadius,
                          fontSize: 14,
                          lineHeight: 1.55,
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Timestamp row – only on group tail */}
                    {tail && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          flexDirection: mine ? "row-reverse" : "row",
                          marginTop: 3,
                          marginBottom: 2,
                          paddingLeft: mine ? 0 : 2,
                          paddingRight: mine ? 2 : 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--cs-text-muted)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {moment(msg.createdAt).format("h:mm A")}
                        </span>
                        {mine && (
                          msg.seen ? (
                            <CheckCheck size={13} style={{ color: "var(--cs-accent)" }} />
                          ) : (
                            <Check size={13} style={{ color: "var(--cs-text-muted)" }} />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} style={{ height: 4 }} />
        </div>
      </div>
    </>
  );
};

export default ChatMessages;
