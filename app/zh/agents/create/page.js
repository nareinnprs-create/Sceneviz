import { cookies } from "next/headers";
import AgentCreateClient from "../../../agents/create/AgentCreateClient";
import { API_BASE_URL } from '@/lib/apiConfig';

/**
 * /zh/agents/create — zh locale mirror of /agents/create
 * (app/agents/create/page.js). Same server component logic and client
 * component; the ai-agent package has no zh strings, so this renders EN
 * content under a zh URL (accepted interim).
 *
 * There is no app/zh/agents/layout.js, so this page carries the identical
 * full-screen wrapper that app/agents/layout.js provides to the en tree.
 */
export const metadata = {
  alternates: {
    canonical: "/zh/agents/create",
    languages: {
      en: "/agents/create",
      zh: "/zh/agents/create",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const BASE_URL = API_BASE_URL;

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

export default async function ZhCreateAgentPage() {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get("muapi_key")?.value;

  const userData = await fetchUserData(apiKey);

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <AgentCreateClient userData={userData} />
    </div>
  );
}
