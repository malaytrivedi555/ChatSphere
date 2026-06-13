import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--cs-bg-base)" }}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-xl animate-spin"
            style={{
              background: "conic-gradient(from 0deg, transparent 70%, var(--cs-accent))",
              borderRadius: "var(--radius-md)",
            }}
          />
          <div
            className="absolute inset-0.5 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--cs-bg-base)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 4a2 2 0 110 4 2 2 0 010-4zm0 10.5c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"
                fill="var(--cs-accent)"
              />
            </svg>
          </div>
        </div>
        <p style={{ color: "var(--cs-text-muted)", fontSize: "13px", letterSpacing: "0.04em" }}>
          Loading ChatSphere…
        </p>
      </div>
    </div>
  );
};

export default Loading;
