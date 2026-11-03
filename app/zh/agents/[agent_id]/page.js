import { cookies } from "next/headers";
import AgentChatClient from "../../../../agents/[agent_id]/AgentChatClient";
import { API_BASE_URL } from "@/lib/apiConfig";

/**
 * /zh/agents/[agent_id] — zh locale mirror of /agents/[agent_id]
 * (app/agents/[agent_id]/page.js). Same server component logic and client
 * component; the ai-agent package has no zh strings, so this renders EN
 * content under a zh URL (accepted interim).
 *
 * There is no app/zh/agents/layout.js, so this page carries the identical
 * full-screen wrapper that app/agents/layout.js provides to the en tree.
 */
export async function generateMetadata({ params }) {
  const { agent_id } = await params;
  return {
    title: `智能体 — Sceneviz`,
    alternates: {
      canonical: false,
      languages: {
        en: `/agents/${agent_id}`,
        zh: `/zh/agents/${agent_id}`,
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

  // Try fetching by slug first
  try {
    console.log(`[AgentPage] Fetching agent by slug: ${agentId}`);
    const res = await fetch(
      `${BASE_URL}/agents/by-slug/${agentId}`,
      {
        cache: "no-store",
        headers: { "x-api-key": apiKey },
      }
    );
    if (res.ok) return await res.json();

    // If by-slug fails, try fetching by direct ID (if it looks like a UUID)
    if (agentId.length > 20) {
      console.log(`[AgentPage] Fetch by slug failed, trying by ID: ${agentId}`);
      const resId = await fetch(
        `${BASE_URL}/agents/${agentId}`,
        {
          cache: "no-store",
          headers: { "x-api-key": apiKey },
        }
      );
      if (resId.ok) return await resId.json();
    }

    console.warn(`[AgentPage] Failed to fetch agent details for: ${agentId}`);
    return null;
  } catch (error) {
    console.error("[AgentPage] Fetch error:", error);
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

export default async function ZhAgentPage({ params }) {
  const { agent_id } = await params;
  const cookieStore = await cookies();
  const apiKey = cookieStore.get("muapi_key")?.value;

  const [agentDetails, userData] = await Promise.all([
    fetchAgentDetails(agent_id, apiKey),
    fetchUserData(apiKey)
  ]);

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <AgentChatClient
        agentDetails={agentDetails}
        initialHistory={null}
        userData={userData}
      />
    </div>
  );
}
