import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PROBLEMS = [
  {
    icon: "😰",
    heading: "Winging high-stakes conversations",
    body: "Interviews, investor pitches, difficult performance chats — people go in underprepared because there was nowhere to safely practice.",
  },
  {
    icon: "🔁",
    heading: "The same mistakes, repeated",
    body: "Without structured feedback you repeat the same patterns — talking too fast, losing the thread, failing to handle objections.",
  },
  {
    icon: "👤",
    heading: "No realistic practice partner",
    body: "Friends give soft feedback. Mock interviews feel fake. You need a counterpart who actually pushes back like the real person.",
  },
  {
    icon: "📊",
    heading: "Coaches can't see what's happening",
    body: "Managers and coaches give advice in the abstract. They never see how their people actually perform under pressure.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    heading: "Build your target",
    body: "Describe or paste a LinkedIn profile. Rehearsal reconstructs that person's personality, objections, and communication style.",
  },
  {
    step: "02",
    heading: "Set the scenario",
    body: "Choose the conversation type — job interview, VC pitch, sales call, difficult feedback session — and define your goal.",
  },
  {
    step: "03",
    heading: "Rehearse with an AI avatar",
    body: "Have a live video conversation with a lifelike AI that responds the way your real counterpart would.",
  },
  {
    step: "04",
    heading: "Get scored and coached",
    body: "Receive a full transcript, dimension-by-dimension scores, and an actionable improvement plan after every session.",
  },
];

const FEATURES = [
  {
    icon: "🎥",
    heading: "Live AI avatar sessions",
    body: "Realistic video conversations — not chatbots — powered by next-generation avatar technology.",
  },
  {
    icon: "🧠",
    heading: "Personality reconstruction",
    body: "Paste a URL or upload a PDF and Rehearsal builds a model of your target's decision style, priorities, and likely objections.",
  },
  {
    icon: "📋",
    heading: "Smart scoring rubrics",
    body: "Every session is scored on dimensions that matter for your conversation type — not just generic presentation tips.",
  },
  {
    icon: "📝",
    heading: "Full transcript & coaching",
    body: "Read every word you said, see where you lost momentum, and get specific line-level suggestions.",
  },
  {
    icon: "📈",
    heading: "Progress tracking",
    body: "Watch your scores improve across sessions and see exactly which skills are moving.",
  },
  {
    icon: "👥",
    heading: "Team training",
    body: "Coaches assign scenarios, review sessions, approve reports, and share improvement plans across their whole team.",
  },
];

const FOR_WHO = [
  {
    audience: "Job seekers",
    description: "Practice interviews with AI versions of real hiring managers before the actual call.",
  },
  {
    audience: "Founders",
    description: "Rehearse your pitch with an AI investor who asks the hard questions VCs always ask.",
  },
  {
    audience: "Sales teams",
    description: "Reps practice discovery calls, objection handling, and closes before touching a real prospect.",
  },
  {
    audience: "Managers & coaches",
    description: "Assign scenarios, track your people's performance, and give structured feedback at scale.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              Rehearsal
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Private pilot
            </span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#for-who" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Who it&apos;s for
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 px-4 py-20 sm:py-32 sm:px-6">
        {/* Subtle background shapes — CSS only, no JS animation */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            AI avatar practice — now in private pilot
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            Practice the conversations
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              that actually matter.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Rehearsal gives you a lifelike AI avatar to practice high-stakes
            conversations — job interviews, investor pitches, sales calls, and
            more — and scores your performance so you improve every time.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="w-full rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors sm:w-auto"
            >
              Get started free →
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors sm:w-auto"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Free during private pilot. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              The problem
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              High-stakes conversations catch you unprepared
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              The moments that change your career — promotions, deals, new
              roles — happen in conversations. Most people go in having
              practiced almost nothing.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((p) => (
              <div
                key={p.heading}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 text-3xl">{p.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-900">{p.heading}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              From setup to scored in minutes
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-200">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.heading}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Features
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything you need to improve faster
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.heading}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.heading}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section id="for-who" className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Who it&apos;s for
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Built for anyone with something to win
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FOR_WHO.map((w) => (
              <div
                key={w.audience}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6"
              >
                <h3 className="mb-2 font-semibold text-indigo-900">{w.audience}</h3>
                <p className="text-sm leading-relaxed text-indigo-700/80">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Practice makes permanent
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { stat: "4×", label: "more practice reps in the same time vs. peer mock sessions" },
              { stat: "100%", label: "of sessions scored — no more subjective coach gut-feel" },
              { stat: "Every session", label: "produces a transcript, scores, and a coaching report" },
            ].map((item) => (
              <div key={item.stat}>
                <p className="font-display text-4xl font-extrabold text-indigo-600">{item.stat}</p>
                <p className="mt-2 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Stop winging it.
            <br />
            Start rehearsing.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-indigo-200">
            Join the private pilot — free. Set up your first practice session
            in under five minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="w-full rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors sm:w-auto"
            >
              Start rehearsing free →
            </Link>
            <Link
              href="/signin"
              className="w-full rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors sm:w-auto"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-indigo-300">
            No credit card. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-lg font-bold text-slate-900">Rehearsal</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <Link href="/signin" className="hover:text-slate-900 transition-colors">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Rehearsal. Private pilot.
          </p>
        </div>
      </footer>
    </div>
  );
}
