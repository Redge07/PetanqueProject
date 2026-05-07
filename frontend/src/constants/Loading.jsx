import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin"></div>
    </div>
  );
};

export default Loading;
