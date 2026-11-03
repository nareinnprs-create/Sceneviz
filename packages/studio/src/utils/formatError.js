/**
 * Format API and studio error messages into clean, honest, user-friendly
 * strings (Sceneviz beta copy). The raw error is always available for
 * debugging — callers log it to the console before formatting.
 */
export function formatErrorMessage(err, fallback = "Generation failed") {
  if (!err) return fallback;
  let message = typeof err === 'string' ? err : (err.message || fallback);

  // ── Honest branded map (raw message stays in console via callers) ──
  const lower = message.toLowerCase();
  const statusMatch = message.match(/API Request Failed:\s*(\d{3})/);
  const status = statusMatch ? Number(statusMatch[1]) : null;

  if (/failed to fetch|networkerror|network request failed|load failed/.test(lower)) {
    return "Network error — check your connection";
  }
  if (lower.includes('insufficient credits') || lower.includes('insufficient_credits')) {
    return "Out of credits — top up at sceneviz.opraiz.com";
  }
  if (status === 402) {
    return "Out of credits — top up at sceneviz.opraiz.com";
  }
  if (status === 429) {
    return "Too many requests — try again in a minute";
  }
  if (status === 503 && (lower.includes('gpu endpoint not provisioned') || lower.includes('not yet served'))) {
    return "This model is coming soon";
  }
  if (status === 501) {
    return "This model is coming soon";
  }
  if (status === 502 || status === 504) {
    return "Generation service busy — try again";
  }
  if (status === 401 || status === 403) {
    return "Authentication failed. Please check your account session or API key.";
  }

  // If message contains JSON payload (e.g. `API Request Failed: 500 Internal Server Error - {...}`)
  if (message.includes('{') && message.includes('}')) {
    try {
      const jsonStart = message.indexOf('{');
      const jsonStr = message.slice(jsonStart);
      const data = JSON.parse(jsonStr);
      if (data.detail && typeof data.detail === 'string') {
        return data.detail;
      }
      if (data.error?.message && typeof data.error.message === 'string') {
        return data.error.message;
      }
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // Strip technical prefix like "API Request Failed: 500 Internal Server Error -"
  message = message.replace(/^API Request Failed: \d+ [^-]+ - /, '');

  return message.length > 150 ? message.slice(0, 147) + '...' : message;
}
