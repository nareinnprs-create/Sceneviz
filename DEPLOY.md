# Deploying Sceneviz to Cloudflare Workers

App is Next.js 15.5.15, bundled with `@opennextjs/cloudflare` and deployed with
Wrangler to the **opraiz.com** zone. Target domain: `sceneviz.opraiz.com`.

## 1. Prerequisites

- Node 22.14.0, npm 10.9.2
- `wrangler` 4.x (global or via devDependency)
- A Cloudflare API token with these scopes:
  - **Account**: Workers Scripts *Edit*, Workers KV *Edit* (if used), Account Settings *Read*
  - **Zone** (`opraiz.com`): Workers Routes *Edit*, DNS *Edit*, Zone *Read*
  - Optional for R2/Images later: R2 *Edit*, Cloudflare Images *Edit*

## 2. Authenticate

```powershell
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"
$env:CLOUDFLARE_API_TOKEN = "<token>"      # prefer env over `wrangler login` in CI
wrangler whoami                            # confirm account + zone visibility
```

> **Do not commit tokens.** Never put `CLOUDFLARE_API_TOKEN` in `.env`,
> `wrangler.jsonc`, or this file. `.env` is already gitignored.

## 3. Build

```powershell
npm install
npm run cf:build        # opennextjs-cloudflare build -> .open-next/
```

## 4. Preview locally (optional but recommended)

```powershell
npm run cf:preview      # runs the Worker in workerd against .open-next/
```

## 5. Deploy to workers.dev first

`wrangler.jsonc` sets `workers_dev: true`, so deploy before binding the domain:

```powershell
npm run cf:deploy
# Note the printed https://sceneviz.<subdomain>.workers.dev URL
```

## 6. Smoke test on workers.dev

```powershell
$base = "https://sceneviz.<subdomain>.workers.dev"
curl.exe -sI "$base/" | Select-String "HTTP/"
curl.exe -sI "$base/zh" | Select-String "HTTP/"
curl.exe -sI "$base/studio/image" | Select-String "HTTP/"
curl.exe -sI "$base/icon.svg" | Select-String "HTTP/"
```

Expect `200` (or `307` where middleware redirects). Check the `content-security-policy`
header is present and that no upstream brand names leak in HTML/headers.

## 7. Bind the custom domain

The route `sceneviz.opraiz.com` with `custom_domain: true` is already in
`wrangler.jsonc`. Re-deploy to apply it:

```powershell
npm run cf:deploy
```

Wrangler creates the DNS record and certificate. Wait for the certificate to
become active, then verify with the same checks against
`https://sceneviz.opraiz.com`.

## 8. Image optimization

Currently `next.config.mjs` sets `images.unoptimized: true` so the build works
without Workers bindings. To enable real optimization later, add a Cloudflare
Images binding/loader (custom `loader` + `loaderFile`) and remove
`unoptimized`, then re-run `npm run cf:build`.
