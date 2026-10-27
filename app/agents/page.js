import Link from "next/link";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/apiConfig";

const BASE_URL = API_BASE_URL;

/**
 * /agents — index page for the Agents suite.
 *
 * Mirrors the sibling /agents/* pages: an async server component that reads
 * the muapi_key cookie and fetches server-side with `cache: "no-store"` +
 * an `x-api-key` header (same pattern as ../[agent_id]/page.js). The page
 * renders full-screen inside the shared app/agents/layout.js shell — no
 * StandaloneShell/studio chrome, matching the rest of the route group.
 */
export const metadata = {
  title: "Agents — Sceneviz",
  alternates: {
    canonical: "/agents",
    languages: {
      en: "/agents",
      zh: "/zh/agents",
    },
  },
};

// GET {API_BASE_URL}/agents/<path> → array, or {agents|items: []} envelope.
// Missing key or any failure degrades to an empty section, never a 500.
async function fetchAgentList(apiKey, path) {
  try {
    const res = await fetch(`${BASE_URL}/agents/${path}`, {
      cache: "no-store",
      headers: apiKey ? { "x-api-key": apiKey } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data?.agents || data?.items || [];
  } catch (error) {
    console.warn(`[AgentsIndex] Failed to fetch /agents/${path}:`, error.message);
    return [];
  }
}

function RobotIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v3" />
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M9 12h.01M15 12h.01" />
      <path d="M9 16h6" />
      <path d="M2 12v3M22 12v3" />
    </svg>
  );
}

function AgentCard({ agent }) {
  const slug = agent.agent_id || agent.id;
  const owner = agent.owner_username || agent.owner_email?.split("@")[0];
  return (
    <Link
      href={`/agents/${slug}`}
      className="group relative flex flex-col aspect-[4/5] rounded-xl overflow-hidden border border-white/5 bg-panel-bg transition-all hover:border-primary/30 hover:scale-[1.02] shadow-2xl"
    >
      {agent.icon_url ? (
        <img
          src={agent.icon_url}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-violet-500/10">
          <RobotIcon className="w-10 h-10 text-primary/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 opacity-90">
          {agent.category || "AI Agent"}
        </div>
        <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
          {agent.name || "Untitled Agent"}
        </h3>
        {owner && (
          <p className="text-[9px] text-white/40 mt-1 uppercase tracking-tight">
            by {owner}
          </p>
        )}
      </div>
    </Link>
  );
}

function Section({ title, count, emptyText, children }) {
  if (!count) {
    return (
      <section className="mb-12">
        <SectionHeading title={title} count={0} />
        <p className="py-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          {emptyText}
        </p>
      </section>
    );
  }
  return (
    <section className="mb-12 animate-fade-in-up">
      <SectionHeading title={title} count={count} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({ title, count }) {
  return (
    <div className="flex items-center gap-3 mb-6 border-l-2 border-primary/40 pl-3">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/85">
        {title}
      </h2>
      <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
        {count}
      </span>
    </div>
  );
}

export default async function AgentsIndexPage() {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get("muapi_key")?.value;

  // Same three lists the Studio Agents tab and the reference library page use.
  const [myAgents, templates, featured] = await Promise.all([
    fetchAgentList(apiKey, "user/agents"),
    fetchAgentList(apiKey, "templates/agents"),
    fetchAgentList(apiKey, "featured/agents"),
  ]);

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-black">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                <RobotIcon className="w-6 h-6 text-primary" />
              </span>
              Agents
            </h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              Your AI workforce — create, manage and chat in one place
            </p>
          </div>
          <Link
            href="/agents/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary-hover transition-all shrink-0 shadow-glow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Agent
          </Link>
        </header>

        {/* Signed-out notice */}
        {!apiKey && (
          <div className="mb-10 rounded-2xl border border-primary/30 bg-panel-bg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Sign in to load your agents
              </h2>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                Open the Studio once to connect your Sceneviz API key — your agents,
                templates and chats will show up here.
              </p>
            </div>
            <Link
              href="/studio"
              className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:border-primary/50 hover:text-primary transition-all shrink-0 text-center"
            >
              Open Studio
            </Link>
          </div>
        )}

        {/* Lists */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Section
            title="My Agents"
            count={myAgents.length}
            emptyText="No agents yet — create your first one"
          >
            {myAgents.map((agent) => (
              <AgentCard key={agent.agent_id || agent.id} agent={agent} />
            ))}
          </Section>

          <Section
            title="Templates"
            count={templates.length}
            emptyText="No templates available right now"
          >
            {templates.map((agent) => (
              <AgentCard key={agent.agent_id || agent.id} agent={agent} />
            ))}
          </Section>

          <Section
            title="Featured"
            count={featured.length}
            emptyText="No featured agents right now"
          >
            {featured.map((agent) => (
              <AgentCard key={agent.agent_id || agent.id} agent={agent} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}
