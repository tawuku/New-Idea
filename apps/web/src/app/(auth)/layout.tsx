export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <NexusLogo />
        </div>
        {children}
      </div>
    </div>
  );
}

function NexusLogo() {
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="size-8 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center"
        aria-hidden
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 9L9 3L15 9L9 15L3 9Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 3L9 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Nexus
      </span>
    </div>
  );
}
