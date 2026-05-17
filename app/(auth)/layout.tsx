export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 mesh-bg opacity-40 -z-10" />
      <div className="pointer-events-none fixed -left-20 top-10 h-64 w-64 rounded-full bg-violet-600/[0.12] blur-[80px] animate-float -z-10" />
      <div className="pointer-events-none fixed -right-20 bottom-10 h-72 w-72 rounded-full bg-indigo-500/[0.12] blur-[100px] animate-float-slow -z-10" />
      <div className="pointer-events-none fixed left-1/2 top-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-[60px] animate-glow-pulse -z-10" />
      {children}
    </div>
  );
}
