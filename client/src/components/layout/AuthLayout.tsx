import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function ConstellationPattern() {
  return (
    <svg
      className="pointer-events-none absolute -right-24 -bottom-24 h-[420px] w-[420px] opacity-20"
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="60" cy="80" r="3" fill="#FF5B37" />
      <circle cx="180" cy="40" r="2" fill="#F3F5F1" />
      <circle cx="260" cy="140" r="3" fill="#F3F5F1" />
      <circle cx="340" cy="60" r="2" fill="#FF5B37" />
      <circle cx="120" cy="220" r="2" fill="#F3F5F1" />
      <circle cx="300" cy="260" r="3" fill="#F3F5F1" />
      <circle cx="200" cy="320" r="2" fill="#FF5B37" />
      <circle cx="60" cy="340" r="3" fill="#F3F5F1" />
      <line x1="60" y1="80" x2="180" y2="40" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="180" y1="40" x2="260" y2="140" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="260" y1="140" x2="340" y2="60" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="120" y1="220" x2="260" y2="140" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="120" y1="220" x2="300" y2="260" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="300" y1="260" x2="200" y2="320" stroke="#F3F5F1" strokeWidth="0.5" />
      <line x1="200" y1="320" x2="60" y2="340" stroke="#F3F5F1" strokeWidth="0.5" />
    </svg>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-mist lg:flex-row">
      <div className="relative overflow-hidden bg-ink px-8 py-12 text-mist lg:flex lg:w-[44%] lg:flex-col lg:justify-center lg:px-16 lg:py-0">
        <ConstellationPattern />
        <div className="relative z-10 max-w-sm">
          <span className="flex items-center gap-2 font-sans text-sm font-semibold text-mist/70">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            Vòng Tròn
          </span>
          <div className="mb-5 flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-coral text-xs font-semibold text-white">
              A
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-moss text-xs font-semibold text-white">
              B
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-mist text-xs font-semibold text-ink">
              C
            </div>
          </div>
          <h1 className="animate-auth-reveal mt-6 font-display text-4xl leading-[1.15] text-white lg:text-[2.75rem]">
            Nơi những người bạn thật sự quan tâm, xuất hiện thật sự.
          </h1>
          <p className="mt-5 font-sans text-sm leading-relaxed text-mist/60">
            Không thuật toán ồn ào. Chỉ là những gì bạn bè bạn đang chia sẻ, theo đúng thứ tự thời
            gian.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
