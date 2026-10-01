"use client";

export interface ToastMessage {
  id: number;
  text: string;
  kind: "ok" | "error";
}

export function Toast({ toast }: { toast: ToastMessage | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] w-max max-w-[calc(100%-32px)] -translate-x-1/2"
    >
      {toast && (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 rounded-[14px] px-5 py-[14px] font-sans text-[15px] text-[#fff5fa] shadow-[0_12px_30px_-10px_rgba(0,0,0,.4)] ${
            toast.kind === "error" ? "bg-[#c41a52]" : "bg-[#131313]"
          }`}
        >
          <span aria-hidden className="text-[#b4fa64]">
            ✦
          </span>
          {toast.text}
        </div>
      )}
    </div>
  );
}
