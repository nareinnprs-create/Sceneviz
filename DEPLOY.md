# Deploying Sceneviz to Cloudflare Workers

Production site: **https://sceneviz.opraiz.com**

The site runs as a Cloudflare **Worker** (not a Pages project). The Next.js
15.5.28 app is bundled with `@opennextjs/cloudflare` (pinned at `1.20.13` in
`package.json`) via `opennextjs-cloudflare build` and deployed with Wrangler to
the **opraiz.com** zone.

Two files control deployment:

- `wrangler.jsonc` — Worker name, entrypoint (`.open-next/worker.js`), assets
  binding, custom-domain route, `workers_dev` flag, observability
- `open-next.config.ts` — OpenNext runtime config (currently the default
  `defineCloudflowConfig({})`)

## 1. Prerequisites

- Node 22.14.0, npm 10.9.2
- Wrangler comes from `devDependencies` (`wrangler` 4.x) — **no global install
  needed**. `npx wrangler …` and the npm scripts resolve the local binary.
- A Cloudflare **API token** (see below)

### API token

Wrangler reads the token from the `CLOUDFLARE_API_TOKEN` env var. The token in
use for production is an **Account-level** token, scoped to the `opraiz.com`
zone, with these permissions:

- **Account**: Workers Scripts *Edit*
- **Zone `opraiz.com`**: Zone *Read*, DNS *Edit*, Workers Routes *Edit*
- Optional, only if R2 / Cloudflare Images are adopted later: R2 *Edit*,
  Cloudflare Images *Edit*

> **Gotcha — token verification endpoint.** The token is Account-level, so
> `GET /user/tokens/verify` **rejects it** (that endpoint only accepts
> *User*-level tokens). Do not read that error as "the token is broken".
> Validate with `npx wrangler whoami` or by running an actual deploy instead.

> **Do not commit tokens.** Never put `CLOUDFLARE_API_TOKEN`, the account ID,
> or any credential in `.env`, `wrangler.jsonc`, or this file. `.env` is
> already gitignored.

## 2. Authenticate

```powershell
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"
$env:CLOUDFLARE_API_TOKEN = "<token>"   # prefer env over `wrangler login`, especially in CI
npx wrangler whoami                    # confirm account + zone visibility
```

## 3. Build

```powershell
npm run setup      # fresh clone only: submodules + deps + workspace package builds
npm run build      # plain `next build` — sanity-check the web app compiles
npm run cf:build   # opennextjs-cloudflare build -> .open-next/ (worker.js + assets)
```

## 4. Preview locally (optional but recommended)

```powershell
npm run cf:preview   # runs the Worker in workerd against .open-next/
```

## 5. Deploy

`wrangler.jsonc` binds the production custom domain directly
(`routes: [{ "pattern": "sceneviz.opraiz.com", "custom_domain": true }]`) and
sets `workers_dev: false`. Two consequences:

- **Every deploy goes straight to production.** There is no workers.dev
  staging URL — the `*.workers.dev` hostname is disabled (returns `404`) to
  avoid duplicate indexing. Use `npm run cf:preview` for pre-deploy checks.
- Wrangler creates and manages the DNS record + TLS certificate for the custom
  domain. On first binding, wait for the certificate to become active.

```powershell
npm run cf:deploy        # opennextjs-cloudflare deploy (wrangler under the hood)
# direct equivalent — resolves wrangler from devDependencies, no global install:
npx wrangler deploy
```

### Bundle size / plan

The built Worker uploads at roughly **1.8 MB gzipped**, comfortably inside the
Workers **free** tier limit of 3 MB compressed — **no paid plan is required**.
If the bundle trends toward 3 MB, code-split or move to a paid Workers plan
*before* the next deploy starts failing with an upload-size error.

## 6. REQUIRED check after adding any proxied hostname — zone redirect rules

**This already cost Sceneviz real production downtime. Read it before binding
any new proxied hostname to the `opraiz.com` zone.**

The zone had a single **Redirect Rule** ("Redirect from WWW to root") whose
expression was literally `true`, so it matched **every** host in the zone. The
rule uses Cloudflare's `wildcard_replace`, which returns its input unchanged
when the host does not match the `www.*` pattern — so for any non-`www` host
the rule emitted a `301` redirecting the URL **to itself**, an infinite loop
(browser error `ERR_TOO_MANY_REDIRECTS`).

It had been invisible for so long because `opraiz.com` and `www.opraiz.com`
are DNS-only (unproxied) CNAMEs pointing at `opraiz.pages.dev`, and Redirect
Rules only run on **proxied** (orange-cloud) hostnames. `sceneviz.opraiz.com`
was the first proxied hostname in the zone — the first victim.

- **Fix applied:** the rule's expression was narrowed to
  `(http.host wildcard "www.*")`.
- **Required check going forward:** after adding any new proxied hostname to
  the zone, open Rules → Redirect Rules in the Cloudflare dashboard and
  confirm no rule matches it unintentionally. Signature of this failure: a
  `301` whose `Location` points at the same URL that was requested
  (`curl.exe -s -o NUL -w "%{http_code} %{redirect_url}"` shows the loop).

## 7. DNS gotcha — Workers-managed records are not visible via the API

For a Workers **custom domain**, Workers creates and owns the hostname's DNS
record. The record is **not** fully visible through the `dns_records` list API:
listing often shows only the AAAA `100::` placeholder, and creating the A record
by hand fails with error **81062** — "A DNS record managed by Workers already
exists".

This is normal. Public DNS resolution and the site work fine (verified:
`/`, `/zh`, `/studio/image`, `/icon.svg`, `/robots.txt`, `/sitemap.xml` all
return `200` and `*.workers.dev` returns `404`). The source of truth is the
Workers dashboard (custom domains) plus `wrangler.jsonc` — **do not try to
"fix" the missing A record.**

## 8. Local DNS caching gotcha

A freshly-created custom domain may take a few minutes to resolve on
local/ISP resolvers even though public DNS resolves immediately. If `curl` or
the browser fails with DNS errors right after binding while
`nslookup sceneviz.opraiz.com 1.1.1.1` succeeds, it is only the local cache:
run `ipconfig /flushdns` from an **elevated** prompt and retry.

## 9. Verify after deploy

```powershell
$base = "https://sceneviz.opraiz.com"
curl.exe -s -o NUL -w "/             %{http_code}`n" "$base/"
curl.exe -s -o NUL -w "/zh           %{http_code}`n" "$base/zh"
curl.exe -s -o NUL -w "/studio/image %{http_code}`n" "$base/studio/image"
curl.exe -s -o NUL -w "/agents       %{http_code}`n" "$base/agents"
curl.exe -s -o NUL -w "/icon.svg     %{http_code}`n" "$base/icon.svg"
curl.exe -s -o NUL -w "/robots.txt   %{http_code}`n" "$base/robots.txt"
curl.exe -s -o NUL -w "/sitemap.xml  %{http_code}`n" "$base/sitemap.xml"
```

Expect `200` everywhere (occasional `3xx` only where middleware redirects).
Then confirm:

- **Locale:** `/zh` renders `<html lang="zh-CN">` in the page HTML.
- **Security header:** `curl.exe -sD - -o NUL "$base/"` shows a
  `content-security-policy` header (set in `middleware.js`; it applies to HTML
  responses — static files like `/robots.txt` and `/icon.svg` are excluded by
  the middleware matcher, so don't expect it there).
- **No redirect loop:** the `/` request above returns `200`, not a `301`
  chain (see §6).
- **Brand safety:** page HTML on `/`, `/zh`, and `/studio/image` contains no
  upstream brand names or repository references — grep the served HTML for the
  known upstream identifiers.
- **workers.dev disabled:** `https://sceneviz.<subdomain>.workers.dev` returns
  `404` (intentional, to avoid duplicate indexing).

## 10. Image optimization

Currently `next.config.mjs` sets `images.unoptimized: true` so the build works
without Workers bindings. To enable real optimization later, add a Cloudflare
Images binding/loader (custom `loader` + `loaderFile`) and remove
`unoptimized`, then re-run `npm run cf:build`.
