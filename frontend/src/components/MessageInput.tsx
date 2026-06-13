"use client";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (message: string) => void;
  handleMessageSend: (e: any, imageFile?: File | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  /* Auto-grow textarea */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxH = 130; // ~5 lines
    const newH = Math.min(el.scrollHeight, maxH);
    el.style.height = `${newH}px`;
    el.classList.toggle("scrollable", el.scrollHeight > maxH);
  }, []);

  useEffect(() => {
    autoResize();
  }, [message, autoResize]);

  /* Focus textarea when a conversation is selected */
  useEffect(() => {
    if (selectedUser) {
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);

    // Re-focus after send
    setTimeout(() => textareaRef.current?.focus(), 30);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Shift+Enter → newline (default textarea behaviour, no action needed)
  };

  if (!selectedUser) return null;

  const canSend = (message.trim().length > 0 || imageFile !== null) && !isUploading;

  return (
    /* Outer container – same bg as surface, top border separates from messages */
    <div
      style={{
        background: "var(--cs-bg-surface)",
        borderTop: "1px solid var(--cs-border)",
        padding: "10px 16px 12px",
        flexShrink: 0,
      }}
    >
      {/* Centred column – mirrors the message column width */}
      <div style={{ maxWidth: "var(--cs-msg-max)", margin: "0 auto" }}>

        {/* Image attachment preview */}
        {imageFile && (
          <div style={{ marginBottom: "8px", display: "flex" }}>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Attachment preview"
                style={{
                  width: 72,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "2px solid var(--cs-accent)",
                  display: "block",
                }}
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                aria-label="Remove attachment"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--cs-bg-elevated)",
                  border: "1px solid var(--cs-border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--cs-text-secondary)",
                }}
              >
                <X size={11} />
              </button>
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  background: "rgba(0,0,0,0.62)",
                  color: "white",
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 4,
                }}
              >
                {(imageFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        )}

        {/* Composer row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            background: "var(--cs-bg-elevated)",
            borderRadius: "14px",
            border: "1px solid var(--cs-border)",
            padding: "6px 6px 6px 12px",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--cs-border-accent)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--cs-border)";
          }}
        >
          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach image"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: imageFile ? "var(--cs-accent-light)" : "transparent",
              color: imageFile ? "var(--cs-accent)" : "var(--cs-text-muted)",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
              marginBottom: "1px",
            }}
            onMouseEnter={(e) => {
              if (!imageFile) (e.currentTarget as HTMLElement).style.color = "var(--cs-text-secondary)";
            }}
            onMouseLeave={(e) => {
              if (!imageFile) (e.currentTarget as HTMLElement).style.color = "var(--cs-text-muted)";
            }}
          >
            <Paperclip size={17} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file?.type.startsWith("image/")) setImageFile(file);
              e.target.value = "";
            }}
          />

          {/* Auto-growing textarea */}
          <textarea
            ref={textareaRef}
            className="cs-textarea"
            rows={1}
            placeholder={imageFile ? "Add a caption…" : "Message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--cs-text-primary)",
              fontSize: "14px",
              fontFamily: "inherit",
              padding: "5px 0",
              lineHeight: "1.5",
            }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: canSend ? "var(--cs-accent)" : "transparent",
              color: canSend ? "white" : "var(--cs-text-muted)",
              border: "none",
              cursor: canSend ? "pointer" : "default",
              transition: "background 0.15s, transform 0.1s",
              transform: canSend ? "scale(1)" : "scale(0.92)",
              marginBottom: "1px",
            }}
            onMouseEnter={(e) => {
              if (canSend) (e.currentTarget as HTMLElement).style.background = "var(--cs-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (canSend) (e.currentTarget as HTMLElement).style.background = "var(--cs-accent)";
            }}
            onMouseDown={(e) => {
              if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(0.93)";
            }}
            onMouseUp={(e) => {
              if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} style={{ transform: "translate(1px, -1px)" }} />
            )}
          </button>
        </div>

        {/* Shift+Enter hint – only visible when textarea has content */}
        {message.length > 0 && (
          <p
            style={{
              fontSize: 11,
              color: "var(--cs-text-muted)",
              marginTop: 5,
              paddingLeft: 4,
              userSelect: "none",
            }}
          >
            <kbd style={{ fontFamily: "inherit" }}>Shift</kbd> + <kbd style={{ fontFamily: "inherit" }}>Enter</kbd> for new line
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
