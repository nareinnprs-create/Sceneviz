import Link from 'next/link';

export const metadata = {
  title: 'API Reference — Sceneviz',
  description:
    'Sceneviz API reference — base URL, authentication, generation endpoints, error shapes, rate limits and credit packs for https://api.opraiz.com.',
  alternates: {
    canonical: '/docs',
  },
};

// Reusable primitives, styled with the site's semantic tokens so the page
// follows the active theme (dark by default outside the landing shell).
function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="border-l-2 border-primary/40 pl-3 font-display text-xl font-bold tracking-tight text-primary-text">
        {title}
      </h2>
      <div className="mt-4 space-y-4 pl-3 text-sm leading-relaxed text-secondary-text">{children}</div>
    </section>
  );
}

function Code({ children }) {
  return (
    <pre className="max-w-full overflow-x-auto rounded-lg border border-divider bg-bg-page/60 px-4 py-3 scrollbar-none">
      <code className="block whitespace-pre font-mono text-[13px] leading-relaxed text-primary-text">{children}</code>
    </pre>
  );
}

function Table({ head, rows }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-divider">
            {head.map((cell) => (
              <th key={cell} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary-text">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-divider/60 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-2 align-top ${cellIndex === 0 ? 'whitespace-nowrap font-mono text-primary-text' : 'text-secondary-text'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const NAV_SECTIONS = [
  { id: 'authentication', label: 'Authentication' },
  { id: 'conventions', label: 'Conventions' },
  { id: 'rate-limits', label: 'Rate limits' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'credits', label: 'Credits & packs' },
  { id: 'mcp', label: 'MCP' },
];

const IMAGE_FIELDS = [
  ['prompt', 'string', '—', 'required'],
  ['negative_prompt', 'string', '""', 'sdxl only'],
  ['width / height', 'int', '1024', 'BFL clamps to 256–1440, multiples of 32'],
  ['aspect_ratio', 'string', '1:1', 'kontext / video models (e.g. 16:9, 9:16)'],
  ['image_url', 'string', '—', 'start frame — required for i2v, optional i2i edit for kontext'],
  ['resolution', 'string', '480p', 'Seedance only: 480p / 720p / 1080p'],
  ['duration', 'int', '5', 'seconds; Kling 5/10, Seedance 2–12, Runway 2–10'],
  ['num_images', 'int', '1', 'clamped to 1–2, images only (each charges separately)'],
  ['seed', 'int', 'random', 'reproducibility'],
];

const GENERATION_ERRORS = [
  ['400', '{ "detail": { "error": "Field \'prompt\' is required" } }', 'malformed request'],
  ['403', '{ "detail": { "error": "Insufficient credits" } }', 'balance below cost'],
  ['429', '{ "detail": { "error": "Rate limit exceeded" } }', '>60 submits / 60 s'],
  ['501', '{ "detail": { "error": "Model \'…\' is not yet served" } }', 'unknown model id'],
  ['502', '{ "detail": { "error": "Provider submit failed: …" } }', 'upstream provider error'],
  ['503', '{ "detail": { "error": "GPU endpoint not provisioned yet" } }', 'model temporarily unavailable'],
];

const MODEL_COSTS = [
  ['flux-schnell-image', '2', 'image'],
  ['sdxl-image', '2', 'image'],
  ['flux-kontext-pro-t2i', '4', 'image (+ optional input-image edit)'],
  ['flux-dev-image', '5', 'image'],
  ['flux-kontext-max-t2i', '8', 'image'],
  ['seedance-*-t2v / seedance-pro-i2v', '60', 'video'],
  ['kling-v2.1-master-t2v / -i2v', '80', 'video'],
  ['kling-v2.5-turbo-pro-t2v', '100', 'video'],
  ['runway-text-to-video / -image-to-video', '90', 'video'],
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen w-full bg-bg-page">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="border-b border-divider pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded text-sm font-semibold text-secondary-text transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span aria-hidden="true">←</span> Sceneviz
          </Link>
          <h1 className="mt-6 font-display text-3xl font-black tracking-tight text-primary-text sm:text-4xl">
            API Reference
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-secondary-text">
            Submit a generation job, poll for the result, and manage your account — all with a single API key issued
            from your Sceneviz dashboard.
          </p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
            {NAV_SECTIONS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-divider px-3 py-1 text-xs font-semibold text-secondary-text transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <Section id="base-url" title="Base URL">
          <p>
            All requests go to <code className="font-mono text-primary">https://api.opraiz.com</code>. Every request
            and response is JSON (<code className="font-mono text-primary">content-type: application/json</code>),
            except multipart uploads.
          </p>
          <Code>https://api.opraiz.com</Code>
        </Section>

        <Section id="authentication" title="Authentication">
          <p>
            Every request (except <code className="font-mono text-primary">GET /healthz</code>) requires your API key.
            Send it with the <code className="font-mono text-primary">x-api-key</code> header (recommended — this is
            what the Sceneviz apps send). Two aliases are accepted:{' '}
            <code className="font-mono text-primary">Authorization: Bearer sk_live_YOUR_KEY</code> or an{' '}
            <code className="font-mono text-primary">?api_key=</code> query parameter.
          </p>
          <Code>{`curl https://api.opraiz.com/api/v1/account/balance -H "x-api-key: sk_live_YOUR_KEY"`}</Code>
          <Table
            head={['Status', 'Body', 'Meaning']}
            rows={[
              ['401', '{ "detail": "Not authenticated" }', 'Key missing or unknown'],
              ['403', '{ "detail": { "error": "Key is disabled" } }', 'Key revoked / disabled'],
            ]}
          />
          <p>
            Keys are issued from your{' '}
            <Link href="/dashboard" className="text-primary transition-colors hover:underline">
              Sceneviz dashboard
            </Link>
            . Treat them like passwords — only the hash is stored server-side, so a lost key cannot be recovered and
            must be reissued.
          </p>
        </Section>

        <Section id="conventions" title="Conventions & errors">
          <p>
            Errors follow FastAPI-style <code className="font-mono text-primary">detail</code> shapes: a string form
            for auth/not-found (<code className="font-mono text-primary">{`{ "detail": "Not found" }`}</code>) and an
            object form for validation/limits (
            <code className="font-mono text-primary">{`{ "detail": { "error": "…message…" } }`}</code>). Unknown paths
            return <code className="font-mono text-primary">404</code>. Authentication is checked first — an invalid
            key always answers <code className="font-mono text-primary">401</code> regardless of path.
          </p>
          <p>
            CORS is permissive (<code className="font-mono text-primary">Access-Control-Allow-Origin: *</code>, headers{' '}
            <code className="font-mono text-primary">x-api-key, authorization, content-type</code>), so browser and
            desktop apps may call the API directly.
          </p>
        </Section>

        <Section id="rate-limits" title="Rate limits">
          <p>
            <strong className="font-semibold text-primary-text">60 generation submits per key per 60-second window</strong>{' '}
            (fixed window, applies only to <code className="font-mono text-primary">POST /api/v1/&#123;model&#125;</code>).
            Result polling is not rate-limited — poll every ~2 s.
          </p>
          <Code>{`429 { "detail": { "error": "Rate limit exceeded" } }`}</Code>
        </Section>

        <Section id="endpoints" title="Endpoints">
          <h3 className="pt-2 font-display text-base font-bold text-primary-text">GET /healthz</h3>
          <p>Liveness probe. No auth.</p>
          <Code>{`{ "ok": true, "service": "sceneviz-api" }`}</Code>

          <h3 className="pt-4 font-display text-base font-bold text-primary-text">GET /api/v1/account/balance</h3>
          <p>Current credit balance for the key.</p>
          <Code>{`{ "balance": 500, "email": "you@example.com" }`}</Code>

          <h3 className="pt-4 font-display text-base font-bold text-primary-text">GET /api/v1/models</h3>
          <p>
            Model catalog — the live list of served models with provider, credit cost and accepted parameters per
            model. Always use this list for available <code className="font-mono text-primary">model</code> ids.
          </p>
          <Code>{`{
  "models": [
    { "id": "sdxl-image", "modality": "image", "provider": "runpod",
      "cost_credits": 2, "params": [ { "name": "prompt", "type": "string", "required": true }, … ] }
  ]
}`}</Code>

          <h3 className="pt-4 font-display text-base font-bold text-primary-text">
            POST /api/v1/&#123;model&#125; — submit a generation
          </h3>
          <p>
            Replace <code className="font-mono text-primary">&#123;model&#125;</code> with a live model id (images:{' '}
            <code className="font-mono text-primary">flux-dev-image</code>,{' '}
            <code className="font-mono text-primary">flux-schnell-image</code>,{' '}
            <code className="font-mono text-primary">flux-kontext-pro-t2i</code>,{' '}
            <code className="font-mono text-primary">flux-kontext-max-t2i</code>,{' '}
            <code className="font-mono text-primary">sdxl-image</code>; videos: Kling, Seedance and Runway ids from the
            catalog). Unknown ids return <code className="font-mono text-primary">501</code>. The job is asynchronous —
            poll with the returned <code className="font-mono text-primary">request_id</code>.
          </p>
          <Code>{`{
  "prompt": "a cinematic shot of fog over pine ridges at dawn",
  "negative_prompt": "blurry, watermark",
  "width": 1024,
  "height": 1024,
  "num_images": 1,
  "seed": -1
}`}</Code>
          <Table head={['Field', 'Type', 'Default', 'Notes']} rows={IMAGE_FIELDS} />
          <p>Response:</p>
          <Code>{`{ "status": "submitted", "request_id": "c0a80101-7ab2-4c1e-9f3a-1b2c3d4e5f60" }`}</Code>
          <p>Errors:</p>
          <Table head={['Status', 'Body', 'When']} rows={GENERATION_ERRORS} />

          <h3 className="pt-4 font-display text-base font-bold text-primary-text">
            GET /api/v1/predictions/&#123;request_id&#125;/result
          </h3>
          <p>Poll every ~2 s until a terminal status arrives.</p>
          <Code>{`{
  "status": "completed",
  "request_id": "c0a80101-…",
  "output": "https://…/image.png",
  "outputs": ["https://…/image.png"]
}`}</Code>
          <Table
            head={['Field', 'Meaning']}
            rows={[
              ['status', 'completed / succeeded / success → done; failed / error / cancelled → failed; anything else → keep polling'],
              ['output', 'first output URL, or null while running'],
              ['outputs', 'all output URLs'],
              ['error', 'present on failure, human-readable message'],
            ]}
          />
          <p>
            Unknown request ids return <code className="font-mono text-primary">404</code>. HTTP ≥500 is transient —
            retry; 4xx should abort the poll loop.
          </p>
          <p>Full example:</p>
          <Code>{`curl -X POST https://api.opraiz.com/api/v1/sdxl-image \\
  -H "x-api-key: sk_live_YOUR_KEY" -H "content-type: application/json" \\
  -d '{"prompt":"neon koi swimming through fog","num_images":1}'`}</Code>
        </Section>

        <Section id="credits" title="Credits & packs">
          <p>
            Each generation debits credits from your key&apos;s balance at submit time. Images charge per output
            (cost × <code className="font-mono text-primary">num_images</code>); videos are one output per job.
            Credits are debited on successful submit; automatic refunds for failed jobs are not yet available. Check
            your balance any time via <code className="font-mono text-primary">GET /api/v1/account/balance</code>.
          </p>
          <Table head={['Model', 'Cost (credits)', 'Modality']} rows={MODEL_COSTS} />
          <p>
            Credits come in three one-time packs — no subscription. Buying is a dashboard action (
            <code className="font-mono text-primary">POST /billing/checkout</code> requires dashboard session auth; API
            keys get <code className="font-mono text-primary">401</code>). Prices shown in your local currency
            (approximate) at checkout.
          </p>
          <Table
            head={['Pack', 'Credits', 'Price (USD)']}
            rows={[
              ['starter', '10,000', '$50'],
              ['growth', '30,000', '$149'],
              ['scale', '100,000', '$499'],
            ]}
          />
          <p>
            The public pack list is served by <code className="font-mono text-primary">GET /billing/packs</code> (no
            auth) — it returns the live tiers with localized prices:
          </p>
          <Code>{`{
  "currency": "MYR",
  "tiers": [
    { "id": "starter", "credits": 10000, "usd": 50, "priceUSD": "$50", "localPrice": "MYR 203.51" },
    { "id": "growth",  "credits": 30000, "usd": 149, "priceUSD": "$149", "localPrice": "MYR 606.45" },
    { "id": "scale",   "credits": 100000, "usd": 499, "priceUSD": "$499", "localPrice": "MYR 2,030.99" }
  ]
}`}</Code>
        </Section>

        <Section id="mcp" title="MCP (Model Context Protocol)">
          <p>
            An MCP server is exposed at{' '}
            <code className="font-mono text-primary">https://api.opraiz.com/mcp</code> for CLI and agent integrations,
            authenticated with <code className="font-mono text-primary">Authorization: Bearer sk_live_YOUR_KEY</code>{' '}
            (streamable HTTP transport). MCP-compatible tools can register it directly once available.
          </p>
        </Section>

        <footer className="mt-16 flex flex-col gap-3 border-t border-divider pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-secondary-text">Ready to generate? Grab a key and send your first request.</p>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-[#101319] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Get an API key
          </Link>
        </footer>
      </div>
    </div>
  );
}
