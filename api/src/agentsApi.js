/**
 * M7 — Agents studio API (D1-backed).
 *
 * Serves the /agents/* surface the studios call through the /api/agents proxy
 * and directly: template/user galleries, agent CRUD, conversations and chat.
 * Chat is a TEMPLATE-BASED responder for v1 (no LLM key yet): the reply is
 * built from the agent's system prompt + the user message, persisted to D1,
 * and exposed through the standard submit+poll contract — POST chat returns
 * {request_id}, GET /api/v1/predictions/{request_id}/result returns the chat
 * envelope (see agentJobPollResponse). `stream:false` is accepted and ignored
 * (no SSE in v1).
 *
 * Template agents are a small static catalog in code (no seed migration): the
 * three branded starters are always available and never stored in D1.
 */

const JSON_HDR = { "content-type": "application/json; charset=utf-8" };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  "access-control-allow-headers": "x-api-key,authorization,content-type",
  "access-control-max-age": "86400",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HDR, ...CORS, ...extra } });
}
const noContent = () => new Response(null, { status: 204, headers: CORS });
const err400 = (m) => json({ detail: { error: m } }, 400);
const err403 = (m = "Not authorized") => json({ detail: { error: m } }, 403);
const err404 = (m = "Not found") => json({ detail: m }, 404);

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

/** Stable per-caller identity (account when known, else the raw key row). */
function ownerId(auth) {
  return auth.account?.id || auth.key?.account_id || auth.key?.id || null;
}

/* ------------------------------------------------------- static catalogs */

// shortcut: skills are a static catalog with no runtime effect in v1 — the
// responder ignores them; wire real skill execution when the LLM backend lands.
export function listAgentSkills() {
  return [
    { id: "image-generation", name: "Image Generation" },
    { id: "video-generation", name: "Video Generation" },
    { id: "web-search", name: "Web Search" },
  ];
}

const SKILL_IDS = new Set(listAgentSkills().map((s) => s.id));

/** Three branded starter agents — returned live from code, never in D1. */
const TEMPLATE_AGENTS = [
  {
    slug: "scene-director",
    name: "Scene Director",
    category: "Film",
    theme: "ocean",
    description: "Turns a loose idea into a shot-by-shot scene plan with model suggestions.",
    system_prompt:
      "You are Scene Director, a filmmaking assistant inside the Sceneviz studio. " +
      "You break story ideas into ordered shots, suggest image or video models for each shot, " +
      "and call out pacing, continuity and aspect-ratio choices. Be concrete and terse.",
    welcome_message: "Pitch me a scene — I'll break it into shots and suggest the models to render each one.",
    initial_suggestions: [
      { label: "Plan a 15s product teaser", prompt: "Plan a 15-second teaser for a matte black smartwatch." },
      { label: "Storyboard a chase", prompt: "Storyboard a rooftop chase in the rain, 4 shots." },
      { label: "Pick models for a scene", prompt: "Which models should I use for a neon city flyover?" },
    ],
  },
  {
    slug: "storyboard-artist",
    name: "Storyboard Artist",
    category: "Design",
    theme: "sunset",
    description: "Writes image prompts for storyboard frames and keeps a consistent visual style.",
    system_prompt:
      "You are Storyboard Artist, a visual assistant inside the Sceneviz studio. " +
      "You turn beat descriptions into precise image-generation prompts (subject, lens, light, palette) " +
      "and keep characters and locations visually consistent across frames.",
    welcome_message: "Describe a beat and I'll write the frame prompts for it.",
    initial_suggestions: [
      { label: "Frame a first meeting", prompt: "Storyboard frames for two strangers meeting at a train station." },
      { label: "Style a cyber alley", prompt: "Image prompts for a cyberpunk alley, dawn light, 3 frames." },
      { label: "Keep a character consistent", prompt: "How do I keep the same detective across 6 frames?" },
    ],
  },
  {
    slug: "brand-voice",
    name: "Brand Voice",
    category: "Marketing",
    theme: "forest",
    description: "Copy assistant for launch announcements, captions and ad variants.",
    system_prompt:
      "You are Brand Voice, a marketing copy assistant inside the Sceneviz studio. " +
      "You draft launch announcements, social captions and short ad scripts, then offer two tone variants. " +
      "Default to active voice and concrete nouns.",
    welcome_message: "Tell me what you're launching and where it will run — I'll draft the copy.",
    initial_suggestions: [
      { label: "Launch announcement", prompt: "Draft a launch post for our new workflow builder." },
      { label: "Three ad hooks", prompt: "Give me three ad hooks for an AI video studio." },
      { label: "Shorten a caption", prompt: "Shorten this caption to under 20 words: …" },
    ],
  },
];

function templateBySlug(slug) {
  return TEMPLATE_AGENTS.find((t) => t.slug === String(slug || "").toLowerCase()) || null;
}

/* --------------------------------------------------------- serialization */

/** The exact fields the studio clients destructure (contract §8 #11). */
function serializeAgent(a, auth) {
  const isOwner = !a.is_template && auth && ownerId(auth) === a.owner_id;
  const skills = (a.skill_ids || [])
    .filter((id) => SKILL_IDS.has(id))
    .map((id) => listAgentSkills().find((s) => s.id === id));
  const email = isOwner ? (auth.account?.email || null) : a.owner_email || null;
  return {
    agent_id: a.slug,
    id: a.slug,
    name: a.name,
    description: a.description || "",
    system_prompt: a.system_prompt || "",
    icon_url: a.icon_url || null,
    category: a.category || "General",
    owner_username: a.is_template ? "opraiz" : email ? email.split("@")[0] : "you",
    owner_email: email,
    skills,
    skill_ids: a.skill_ids || [],
    theme: a.theme || "cosmic",
    welcome_message: a.welcome_message || "",
    initial_suggestions: a.initial_suggestions || [],
    is_published: !!a.is_published,
    is_template: !!a.is_template,
    is_owner: isOwner,
    has_liked: false, // shortcut: likes are not per-user deduped in v1 — add a likes table when needed
    like_count: a.like_count || 0,
    created_at: a.created_at || null,
  };
}

function rowToAgent(row) {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category || "Custom",
    theme: row.theme,
    description: row.description,
    system_prompt: row.system_prompt,
    icon_url: row.icon_url,
    welcome_message: row.welcome_message,
    initial_suggestions: JSON.parse(row.initial_suggestions_json || "[]"),
    skill_ids: JSON.parse(row.skills_json || "[]"),
    is_published: !!row.is_published,
    is_template: !!row.is_template,
    like_count: row.like_count || 0,
    owner_id: row.owner_id,
    owner_email: row.owner_email || null,
    created_at: row.created_at,
  };
}

function slugify(name) {
  const base = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${base || "agent"}-${[...crypto.getRandomValues(new Uint8Array(2))].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/* ---------------------------------------------------- template responder */

const DEFAULT_SUGGESTIONS = ["What can you do?", "Give me an example", "How do I start over?"];

/** v1 "brain": deterministic echo-style turn built from the agent charter. */
function agentReply(agent, message) {
  const text = String(message || "").trim();
  const quoted = text.length > 280 ? `${text.slice(0, 280)}…` : text;
  const charter = String(agent.system_prompt || "").split(/(?<=[.!?])\s+/)[0] || `I'm ${agent.name}.`;
  return [
    `**${agent.name}** here.`,
    "",
    `You said: “${quoted}”`,
    "",
    `My brief: ${charter}`,
    "",
    "_Template mode: replies are scripted locally for now and your messages are saved to this " +
      "conversation — model-backed responses land with the next release._",
  ].join("\n");
}

function suggestionsFor(agent) {
  const labels = (agent.initial_suggestions || [])
    .map((s) => (typeof s === "string" ? s : s?.label))
    .filter(Boolean);
  return labels.length ? labels.slice(0, 3) : DEFAULT_SUGGESTIONS;
}

/* ------------------------------------------------------------- galleries */

export async function listTemplateAgents() {
  return TEMPLATE_AGENTS.map((t) =>
    serializeAgent({ ...t, is_template: true, is_published: true, initial_suggestions: t.initial_suggestions }, null)
  );
}

export async function listFeaturedAgents() {
  const all = await listTemplateAgents();
  return all.slice(0, 2);
}

export async function getUserAgents(env, auth) {
  const rows =
    (
      await env.DB.prepare("SELECT * FROM agents WHERE owner_id = ? ORDER BY created_at DESC").bind(ownerId(auth)).all()
    ).results || [];
  return rows.map(rowToAgent).map((a) => serializeAgent(a, auth));
}

export async function getUserConversations(env, auth) {
  const rows =
    (
      await env.DB.prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM agent_messages m WHERE m.conversation_id = c.id) AS message_count
         FROM agent_conversations c WHERE c.owner_id = ? ORDER BY c.updated_at DESC LIMIT 100`
      )
        .bind(ownerId(auth))
        .all()
    ).results || [];
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    agent_id: c.agent_slug,
    agent_slug: c.agent_slug,
    agent_name: c.agent_name,
    agent_icon_url: c.agent_icon_url || null,
    updated_at: c.updated_at,
    created_at: c.created_at,
    message_count: c.message_count,
  }));
}

/* ------------------------------------------------------------------ CRUD */

export async function suggestAgent(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) return err400("Field 'prompt' is required");
  const name =
    prompt
      .split(/\s+/)
      .slice(0, 4)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .trim() || "Custom Assistant";
  const description = `AI assistant focused on: ${prompt.slice(0, 120)}`;
  return json({
    name: `${name} Assistant`,
    description,
    system_prompt: `You are ${name} Assistant. ${description} Be concise, concrete and helpful.`,
    recommended_skill_ids: [],
    welcome_message: `Hi! I'm the ${name} Assistant. What would you like to work on?`,
    initial_suggestions: [
      { label: "What can you do?", prompt: "What can you do?" },
      { label: "Get started", prompt: prompt.slice(0, 200) },
    ],
  });
}

export async function createAgent(request, env, auth) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const name = String(body?.name || "").trim();
  const systemPrompt = String(body?.system_prompt || "").trim();
  if (!name || !systemPrompt) return err400("Fields 'name' and 'system_prompt' are required");
  const rawSuggestions = Array.isArray(body?.initial_suggestions) ? body.initial_suggestions : [];
  const suggestions = rawSuggestions
    .map((s) => (typeof s === "string" ? { label: s, prompt: s } : s))
    .filter((s) => s && s.label && s.prompt)
    .slice(0, 6);
  const slug = slugify(name);
  const id = uuid();
  await env.DB.prepare(
    `INSERT INTO agents (id, slug, owner_id, owner_email, name, description, system_prompt, icon_url, category,
      skills_json, theme, welcome_message, initial_suggestions_json, is_published, is_template, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      slug,
      ownerId(auth),
      auth.account?.email || null,
      name,
      String(body?.description || ""),
      systemPrompt,
      String(body?.icon_url || "") || null,
      "Custom",
      JSON.stringify(Array.isArray(body?.skill_ids) ? body.skill_ids : []),
      String(body?.theme || "cosmic"),
      String(body?.welcome_message || ""),
      JSON.stringify(suggestions),
      body?.is_published ? 1 : 0,
      body?.is_template ? 1 : 0,
      nowIso(),
      nowIso()
    )
    .run();
  return json({ agent_id: slug, id: slug, name }, 201);
}

/** Resolve a slug-or-id to {agent, row}: templates first, then D1 (slug, then id). */
async function resolveAgent(env, slugOrId) {
  const t = templateBySlug(slugOrId);
  if (t) return { agent: { ...t, is_template: true, is_published: true }, row: null };
  const db = env.DB;
  let row = await db.prepare("SELECT * FROM agents WHERE slug = ?").bind(slugOrId).first();
  if (!row) row = await db.prepare("SELECT * FROM agents WHERE id = ?").bind(slugOrId).first();
  if (!row) return null;
  return { agent: rowToAgent(row), row };
}

export async function getBySlug(env, auth, slug) {
  const found = await resolveAgent(env, slug);
  if (!found) return err404("Agent not found");
  return json(serializeAgent(found.agent, auth));
}

export async function updateAgent(request, env, auth, slug) {
  const found = await resolveAgent(env, slug);
  if (!found || found.row == null) return err404("Agent not found");
  if (found.row.owner_id !== ownerId(auth)) return err403("Only the owner can edit this agent");
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const sets = [];
  const binds = [];
  const put = (col, val) => {
    sets.push(`${col} = ?`);
    binds.push(val);
  };
  if (body?.name !== undefined) put("name", String(body.name));
  if (body?.description !== undefined) put("description", String(body.description));
  if (body?.system_prompt !== undefined) put("system_prompt", String(body.system_prompt));
  if (body?.icon_url !== undefined) put("icon_url", String(body.icon_url) || null);
  if (body?.theme !== undefined) put("theme", typeof body.theme === "string" ? body.theme : JSON.stringify(body.theme));
  if (body?.welcome_message !== undefined) put("welcome_message", String(body.welcome_message));
  if (Array.isArray(body?.skill_ids)) put("skills_json", JSON.stringify(body.skill_ids));
  if (Array.isArray(body?.initial_suggestions)) put("initial_suggestions_json", JSON.stringify(body.initial_suggestions));
  if (body?.is_published !== undefined) put("is_published", body.is_published ? 1 : 0);
  if (body?.is_template !== undefined) put("is_template", body.is_template ? 1 : 0);
  if (sets.length) {
    put("updated_at", nowIso());
    await env.DB.prepare(`UPDATE agents SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, found.row.id).run();
  }
  const fresh = await env.DB.prepare("SELECT * FROM agents WHERE id = ?").bind(found.row.id).first();
  return json(serializeAgent(rowToAgent(fresh), auth));
}

export async function deleteAgent(env, auth, slug) {
  const found = await resolveAgent(env, slug);
  if (!found || found.row == null) return err404("Agent not found");
  if (found.row.owner_id !== ownerId(auth)) return err403("Only the owner can delete this agent");
  await env.DB.prepare("DELETE FROM agents WHERE id = ?").bind(found.row.id).run();
  return noContent();
}

export async function likeAgent(env, auth, slug, isLike) {
  const found = await resolveAgent(env, slug);
  if (!found) return err404("Agent not found");
  if (found.row) {
    await env.DB.prepare("UPDATE agents SET like_count = MAX(0, like_count + ?) WHERE id = ?")
      .bind(isLike ? 1 : -1, found.row.id)
      .run();
  }
  // Templates have no row — report the optimistic count the client already shows.
  return json({ has_liked: !!isLike, like_count: (found.agent.like_count || 0) + (isLike ? 1 : 0) });
}

export async function previewRealign(request, env, auth, slug) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  // shortcut: no LLM to realign against in v1 — echo the current prompt back
  const current = String(body?.current_prompt || "");
  return json({ proposed_prompt: current });
}

/* ---------------------------------------------------------- conversations */

async function ownedConversation(env, auth, convId) {
  const row = await env.DB.prepare("SELECT * FROM agent_conversations WHERE id = ?").bind(convId).first();
  if (!row) return { error: err404("Conversation not found") };
  if (row.owner_id !== ownerId(auth)) return { error: err403("Not your conversation") };
  return { conv: row };
}

export async function getConversation(env, auth, slug, convId) {
  const { conv, error } = await ownedConversation(env, auth, convId);
  if (error) return error;
  const msgs =
    (
      await env.DB.prepare("SELECT * FROM agent_messages WHERE conversation_id = ? ORDER BY created_at ASC")
        .bind(convId)
        .all()
    ).results || [];
  return json({
    id: conv.id,
    agent_id: conv.agent_slug,
    title: conv.title,
    created_at: conv.created_at,
    history: msgs.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.thoughts ? { thoughts: m.thoughts } : {}),
      ...(m.attachments_json && m.attachments_json !== "[]" ? { attachments: JSON.parse(m.attachments_json) } : {}),
      timestamp: m.created_at,
    })),
  });
}

/**
 * Chat submit: persists the user turn + template reply, records a completed
 * agent job, and returns {request_id} — the client polls the standard
 * /api/v1/predictions/{id}/result route for the envelope.
 */
export async function chat(request, env, auth, slug) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const message = String(body?.message || "").trim();
  if (!message) return err400("Field 'message' is required");

  const found = await resolveAgent(env, slug);
  if (!found) return err404("Agent not found");

  const db = env.DB;
  const owner = ownerId(auth);
  let convId = body?.conversation_id ? String(body.conversation_id) : null;
  if (convId) {
    const existing = await db.prepare("SELECT * FROM agent_conversations WHERE id = ?").bind(convId).first();
    if (existing && existing.owner_id !== owner) return err403("Not your conversation");
  }
  const now = nowIso();
  convId = convId || uuid(); // the client often mints the conversation id itself (crypto.randomUUID)
  const convRow = await db.prepare("SELECT id FROM agent_conversations WHERE id = ?").bind(convId).first();
  if (!convRow) {
    await db
      .prepare(
        `INSERT INTO agent_conversations (id, agent_slug, agent_name, agent_icon_url, owner_id, title, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(convId, found.agent.slug, found.agent.name, found.agent.icon_url || null, owner, message.slice(0, 60), now, now)
      .run();
  }

  const reply = agentReply(found.agent, message);
  const suggestions = suggestionsFor(found.agent);
  const jobId = uuid();

  const userStmt = db
    .prepare("INSERT INTO agent_messages (id, conversation_id, role, content, attachments_json, created_at) VALUES (?, ?, 'user', ?, ?, ?)")
    .bind(uuid(), convId, message, JSON.stringify(Array.isArray(body?.attachments) ? body.attachments : []), now);
  const asstStmt = db
    .prepare("INSERT INTO agent_messages (id, conversation_id, role, content, attachments_json, created_at) VALUES (?, ?, 'assistant', ?, '[]', ?)")
    .bind(uuid(), convId, reply, now);
  const jobStmt = db
    .prepare(
      `INSERT INTO agent_jobs (id, kind, owner_id, agent_id, conversation_id, status, response_json, created_at, updated_at)
       VALUES (?, 'agent', ?, ?, ?, 'completed', ?, ?, ?)`
    )
    .bind(
      jobId,
      owner,
      found.agent.slug,
      convId,
      JSON.stringify({
        conversation_id: convId,
        messages: [{ role: "assistant", content: reply }],
        is_complete: true,
        suggestions,
      }),
      now,
      now
    );
  const touchStmt = db.prepare("UPDATE agent_conversations SET updated_at = ? WHERE id = ?").bind(now, convId);
  await db.batch([userStmt, asstStmt, jobStmt, touchStmt]);

  // Contract §8 #18: the POST returns the task handle; the envelope arrives via poll.
  return json({ request_id: jobId, id: jobId, conversation_id: convId, status: "completed" });
}

/** predictions/{id}/result fallback for agent-chat jobs (null = not an agent job). */
export async function agentJobPollResponse(env, jobId) {
  const row = await env.DB.prepare("SELECT * FROM agent_jobs WHERE id = ?").bind(jobId).first();
  if (!row || row.kind !== "agent") return null;
  if (row.status === "failed") {
    return json({
      status: "failed",
      is_complete: false,
      conversation_id: row.conversation_id,
      messages: [],
      suggestions: [],
      error: row.error || "Agent failed to respond",
    });
  }
  const envelope = JSON.parse(row.response_json || "{}");
  return json({ ...envelope, status: "completed" });
}

/* ------------------------------------------------- conversation endpoints */

export async function listAgentConversations(env, auth, slug) {
  const rows =
    (
      await env.DB.prepare(
        "SELECT * FROM agent_conversations WHERE owner_id = ? AND agent_slug = ? ORDER BY updated_at DESC LIMIT 100"
      )
        .bind(ownerId(auth), slug)
        .all()
    ).results || [];
  return json(rows.map((c) => ({ id: c.id, title: c.title, updated_at: c.updated_at, created_at: c.created_at })));
}

export async function getConversationMessages(env, auth, convId) {
  const { conv, error } = await ownedConversation(env, auth, convId);
  if (error) return error;
  const msgs =
    (
      await env.DB.prepare("SELECT role, content, created_at FROM agent_messages WHERE conversation_id = ? ORDER BY created_at ASC")
        .bind(conv.id)
        .all()
    ).results || [];
  return json(msgs.map((m) => ({ role: m.role, content: m.content, timestamp: m.created_at })));
}

/** POST /agents/conversations/{id}/messages — same responder as by-slug chat. */
export async function postConversationMessage(request, env, auth, convId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const message = String(body?.message || "").trim();
  if (!message) return err400("Field 'message' is required");
  const { conv, error } = await ownedConversation(env, auth, convId);
  if (error) return error;
  const found = await resolveAgent(env, conv.agent_slug);
  if (!found) return err404("Agent not found");

  const now = nowIso();
  const jobId = uuid();
  const reply = agentReply(found.agent, message);
  await env.DB.batch([
    env.DB
      .prepare("INSERT INTO agent_messages (id, conversation_id, role, content, attachments_json, created_at) VALUES (?, ?, 'user', ?, '[]', ?)")
      .bind(uuid(), convId, message, now),
    env.DB
      .prepare("INSERT INTO agent_messages (id, conversation_id, role, content, attachments_json, created_at) VALUES (?, ?, 'assistant', ?, '[]', ?)")
      .bind(uuid(), convId, reply, now),
    env.DB
      .prepare(
        `INSERT INTO agent_jobs (id, kind, owner_id, agent_id, conversation_id, status, response_json, created_at, updated_at)
         VALUES (?, 'agent', ?, ?, ?, 'completed', ?, ?, ?)`
      )
      .bind(
        jobId,
        ownerId(auth),
        conv.agent_slug,
        convId,
        JSON.stringify({
          conversation_id: convId,
          messages: [{ role: "assistant", content: reply }],
          is_complete: true,
          suggestions: suggestionsFor(found.agent),
        }),
        now,
        now
      ),
    env.DB.prepare("UPDATE agent_conversations SET updated_at = ? WHERE id = ?").bind(now, convId),
  ]);
  return json({ request_id: jobId, id: jobId, conversation_id: convId, status: "completed" });
}

export async function likeConversation(env, auth, convId) {
  const { conv, error } = await ownedConversation(env, auth, convId);
  if (error) return error;
  return json({ ok: true, id: conv.id });
}

/* --------------------------------------------------------------- routing */

/**
 * Authed /agents dispatcher. `path` is url.pathname with trailing slashes
 * stripped; auth = key or session (all agents routes accept both).
 */
export async function dispatch(request, env, auth, path) {
  const method = request.method;
  const url = new URL(request.url);

  if (method === "POST" && path === "/agents") return createAgent(request, env, auth);
  if (method === "POST" && path === "/agents/suggest") return suggestAgent(request);
  if (method === "GET" && path === "/agents/user/agents") return json(await getUserAgents(env, auth));
  if (method === "GET" && path === "/agents/user/conversations") return json(await getUserConversations(env, auth));

  let m = path.match(/^\/agents\/by-slug\/([^/]+)$/);
  if (m) {
    if (method === "GET") return getBySlug(env, auth, m[1]);
    if (method === "PUT" || method === "PATCH") return updateAgent(request, env, auth, m[1]);
    if (method === "DELETE") return deleteAgent(env, auth, m[1]);
  }
  m = path.match(/^\/agents\/by-slug\/([^/]+)\/chat$/);
  if (method === "POST" && m) return chat(request, env, auth, m[1]);
  m = path.match(/^\/agents\/by-slug\/([^/]+)\/like$/);
  if (method === "POST" && m) return likeAgent(env, auth, m[1], url.searchParams.get("is_like") !== "false");
  m = path.match(/^\/agents\/by-slug\/([^/]+)\/preview-realign$/);
  if (method === "POST" && m) return previewRealign(request, env, auth, m[1]);
  m = path.match(/^\/agents\/by-slug\/([^/]+)\/([^/]+)$/);
  if (method === "GET" && m && m[1] !== "by-slug") return getConversation(env, auth, m[1], m[2]);

  // Alternate (non-by-slug) conversation routes.
  m = path.match(/^\/agents\/([^/]+)\/conversations$/);
  if (method === "GET" && m) return listAgentConversations(env, auth, m[1]);
  m = path.match(/^\/agents\/conversations\/([^/]+)\/messages$/);
  if (method === "GET" && m) return getConversationMessages(env, auth, m[1]);
  if (method === "POST" && m) return postConversationMessage(request, env, auth, m[1]);
  m = path.match(/^\/agents\/conversations\/([^/]+)\/like$/);
  if (method === "POST" && m) return likeConversation(env, auth, m[1]);
  m = path.match(/^\/agents\/([^/]+)$/);
  if (method === "GET" && m && !["templates", "featured", "user", "skills", "suggest", "conversations"].includes(m[1])) {
    return getBySlug(env, auth, m[1]);
  }

  return err404();
}
