/**
 * M3 billing: credit packs, Dodo checkout creation, webhook signature
 * verification (Dodo = Svix scheme), and idempotent credit grants.
 *
 * Fail-closed rule: webhook verification refuses to look at anything until the
 * signing secret exists (env.DODO_WEBHOOK_SECRET) — callers 503 BEFORE any
 * JSON.parse of the body. Secrets are only ever referenced as env.<NAME>; no
 * secret literal appears in this file.
 */

export const PACKS = {
  starter: {
    credits: 10000,
    dodoProduct: "pdt_0Nr9G7vYVUFBNHCAY8gGM", // $50.00 USD one-time
    usd: 50,
  },
  growth: {
    credits: 30000,
    dodoProduct: "pdt_0Nr9G82BTXLYK8cV7ndxX", // $149.00 USD one-time
    usd: 149,
  },
  scale: {
    credits: 100000,
    dodoProduct: "pdt_0Nr9G89cJY2zB33DCWFLE", // $499.00 USD one-time
    usd: 499,
  },
};

// --- localized pricing display -------------------------------------------
// The charge always happens on Dodo's hosted checkout (adaptive currency);
// these rates only drive the *display* approximation per visitor country.
// Rates fetched from open.er-api.com (free, keyless), cached 24h in KV.

const COUNTRY_CURRENCY = {
  IN: "INR", GB: "GBP", JP: "JPY", AU: "AUD", CA: "CAD", CH: "CHF", SG: "SGD",
  AE: "AED", SA: "SAR", BR: "BRL", MX: "MXN", KR: "KRW", HK: "HKD", NZ: "NZD",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY", ZA: "ZAR", TH: "THB",
  ID: "IDR", MY: "MYR", PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT", NG: "NGN",
  EG: "EGP", IL: "ILS", CZ: "CZK", HU: "HUF", RO: "RON",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR",
  IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR",
  EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
};

// Round up to a tidy number per currency so prices read like real price tags.
function roundLocal(currency, amount) {
  const steps = { INR: 10, JPY: 100, IDR: 1000, VND: 1000, KRW: 100, HUF: 10 };
  const step = steps[currency];
  if (!step) return Math.round(amount * 100) / 100;
  return Math.ceil(amount / step) * step;
}

const SYMBOLS = { INR: "₹", EUR: "€", GBP: "£", JPY: "¥" };

async function getRates(env) {
  if (env.MEDIA_KV) {
    const cached = await env.MEDIA_KV.get("fx/usd");
    if (cached) {
      try {
        const c = JSON.parse(cached);
        if (Date.now() - c.at < 86400000) return c.rates;
      } catch {}
    }
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`FX ${res.status}`);
    const data = await res.json();
    if (!data?.rates) throw new Error("FX payload missing rates");
    if (env.MEDIA_KV) {
      await env.MEDIA_KV.put("fx/usd", JSON.stringify({ at: Date.now(), rates: data.rates }), {
        expirationTtl: 86400,
      });
    }
    return data.rates;
  } catch {
    return null; // graceful: caller falls back to USD display
  }
}

/** Localized tier list for a visitor country code (request.cf.country). */
export async function localizedTiers(env, country) {
  const currency = (country && COUNTRY_CURRENCY[country]) || "USD";
  const base = Object.entries(PACKS).map(([id, p]) => ({
    id,
    credits: p.credits,
    usd: p.usd,
    priceUSD: `$${p.usd}`,
    gateways: ["dodo"],
  }));
  if (currency === "USD") return { currency: "USD", tiers: base };

  const rates = await getRates(env);
  const rate = rates?.[currency];
  if (!rate) return { currency: "USD", tiers: base };

  const symbol = SYMBOLS[currency] || `${currency} `;
  const tiers = base.map((t) => {
    const local = roundLocal(currency, t.usd * rate);
    return { ...t, localPrice: `${symbol}${local.toLocaleString("en-US")}` };
  });
  return { currency, tiers };
}

const DODO_API_BASE = "https://live.dodopayments.com";
const BILLING_RETURN_URL = "https://sceneviz.opraiz.com/dashboard/billing?paid=1";
const WEBHOOK_MAX_AGE_SECONDS = 300; // Svix default: reject stale timestamps

/** Verify outcome: { ok: true } or { ok: false, status, error }. */
const verifyFail = (status, error) => ({ ok: false, status, error });

/** Length-safe constant-time string compare (signature equality only). */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacBase64(keyBytes, message) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/**
 * Svix signing secrets arrive as `whsec_<base64>` — strip the prefix and
 * base64-decode. A secret pasted without the prefix that isn't valid base64
 * falls back to raw bytes.
 */
function signingKey(secret) {
  const bare = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  try {
    return Uint8Array.from(atob(bare), (c) => c.charCodeAt(0));
  } catch {
    return new TextEncoder().encode(bare);
  }
}

/**
 * Create a Dodo hosted checkout for a credit pack. Field names verified
 * against docs.dodopayments.com (Checkout Sessions API): POST /checkouts with
 * product_cart / customer{email} / return_url / metadata → {checkout_url}.
 */
export async function createDodoCheckout(env, account, pack, email) {
  const res = await fetch(`${DODO_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.DODO_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: pack.dodoProduct, quantity: 1 }],
      customer: { email },
      metadata: { account_id: account.id, credits: pack.credits },
      return_url: BILLING_RETURN_URL,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 300);
    const err = new Error(`Dodo checkout failed (${res.status}): ${body}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  if (!data?.checkout_url) throw new Error("Dodo did not return a checkout_url");
  return data.checkout_url;
}

/** Dodo webhooks use the standard Svix signature scheme. */
export async function verifyDodoWebhook(request, env, rawBody) {
  // Fail-closed BEFORE anything is read from the body.
  if (!env.DODO_WEBHOOK_SECRET) return verifyFail(503, "Webhook not configured");
  const id = request.headers.get("webhook-id") || "";
  const timestamp = request.headers.get("webhook-timestamp") || "";
  const signatures = request.headers.get("webhook-signature") || "";
  if (!id || !timestamp || !signatures) {
    return verifyFail(400, "Missing webhook signature headers");
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > WEBHOOK_MAX_AGE_SECONDS) {
    return verifyFail(400, "Webhook timestamp outside the 5-minute window");
  }
  const expected = await hmacBase64(signingKey(env.DODO_WEBHOOK_SECRET), `${id}.${timestamp}.${rawBody}`);
  // header format: "v1,<sig>" (space-separated list allowed)
  const provided = signatures.split(/\s+/).map((s) => s.replace(/^v1,/, ""));
  if (!provided.some((sig) => sig && safeEqual(sig, expected))) {
    return verifyFail(400, "Invalid webhook signature");
  }
  return { ok: true };
}

/**
 * Idempotently grant credits: the payments INSERT is the atomic claim (UNIQUE
 * gateway_payment_id + DO NOTHING; meta.changes reports whether this webhook
 * was first). It runs BEFORE the batch because a batch containing a no-op
 * INSERT would still execute the credit increments — double-crediting retries.
 * shortcut: a crash between the claim and the batch leaves a processed payment
 * row without its grant — recover manually via credit_ledger; the alternative
 * (one big batch) risks double-credit, so fail poor over fail rich.
 */
export async function grantCredits(env, { accountId, credits, gateway, gatewayPaymentId, amountMinor = 0, currency = "" }) {
  credits = Math.max(1, Math.floor(Number(credits) || 0));
  const id = crypto.randomUUID();
  const claim = await env.DB.prepare(
    `INSERT INTO payments (id, gateway, gateway_payment_id, account_id, credits, amount_minor, currency, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'paid')
     ON CONFLICT (gateway_payment_id) DO NOTHING`
  )
    .bind(id, gateway, gatewayPaymentId, accountId, credits, Math.floor(Number(amountMinor) || 0), String(currency || ""))
    .run();
  if ((claim?.meta?.changes || 0) === 0) return { duplicate: true };

  await env.DB.batch([
    env.DB.prepare("INSERT INTO credit_ledger (id, account_id, delta, reason, payment_id) VALUES (?, ?, ?, ?, ?)").bind(
      crypto.randomUUID(),
      accountId,
      credits,
      `purchase:${gateway}`,
      id
    ),
    env.DB.prepare("UPDATE accounts SET credits = credits + ? WHERE id = ?").bind(credits, accountId),
    // Keys mirror the account balance at creation (handleCreateKey), so topping
    // up every active key keeps key balances in sync with what /me shows.
    env.DB.prepare("UPDATE keys SET credits = credits + ? WHERE account_id = ? AND status = 'active'").bind(
      credits,
      accountId
    ),
  ]);
  return { ok: true, credits };
}
