import { cookies } from "next/headers";
import AgentChatClient from "../../../../agents/[agent_id]/AgentChatClient";
import { AgentProfile } from "ai-agent";
import { API_BASE_URL } from "@/lib/apiConfig";

/**
 * /zh/agents/[agent_id]/[conversation_id] — zh locale mirror of
 * app/agents/[agent_id]/[conversation_id]/page.js. Same server component
 * logic and client components; the ai-agent package has no zh strings, so
 * this renders EN content under a zh URL (accepted interim).
 *
 * The reserved segment "profile" renders the agent profile view instead.
 *
 * There is no app/zh/agents/layout.js, so this page carries the identical
 * full-screen wrapper that app/agents/layout.js provides to the en tree.
 */
export async function generateMetadata({ params }) {
  const { agent_id, conversation_id } = await params;
  return {
    title: conversation_id === "profile" ? `智能体 — Sceneviz` : `智能体对话 — Sceneviz`,
    alternates: {
      canonical: false,
      languages: {
        en: `/agents/${agent_id}/${conversation_id}`,
        zh: `/zh/agents/${agent_id}/${conversation_id}`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

const BASE_URL = API_BASE_URL;

async function fetchAgentDetails(agentId, apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/agents/by-slug/${agentId}`,
      {
        cache: "no-store",
        headers: { "x-api-key": apiKey },
      }
    );
    if (res.ok) return await res.json();

    if (agentId.length > 20) {
      const resId = await fetch(
        `${BASE_URL}/agents/${agentId}`,
        {
          cache: "no-store",
          headers: { "x-api-key": apiKey },
        }
      );
      if (resId.ok) return await resId.json();
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchHistory(agentId, conversationId, apiKey) {
  if (!apiKey) return null;
  try {
    // Try by slug first
    const res = await fetch(
      `${BASE_URL}/agents/by-slug/${agentId}/${conversationId}`,
      {
        cache: "no-store",
        headers: { "x-api-key": apiKey },
      }
    );
    if (res.ok) return await res.json();

    // Fallback to direct agent ID if needed
    if (agentId.length > 20) {
      const resId = await fetch(
        `${BASE_URL}/agents/${agentId}/${conversationId}`,
        {
          cache: "no-store",
          headers: { "x-api-key": apiKey },
        }
      );
      if (resId.ok) return await resId.json();
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchUserData(apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/account/balance`, {
      cache: "no-store",
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ZhAgentConversationPage({ params }) {
  const { agent_id, conversation_id } = await params;

  // Same reserved-segment handling as the en page.
  if (conversation_id === "profile") {
    return (
      <div className="h-screen w-full overflow-hidden bg-black">
        <AgentProfile />
      </div>
    );
  }

  const cookieStore = await cookies();
  const apiKey = cookieStore.get("muapi_key")?.value;

  const [agentDetails, initialHistory, userData] = await Promise.all([
    fetchAgentDetails(agent_id, apiKey),
    fetchHistory(agent_id, conversation_id, apiKey),
    fetchUserData(apiKey)
  ]);

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <AgentChatClient
        agentDetails={agentDetails}
        initialHistory={initialHistory}
        userData={userData}
      />
    </div>
  );
}
