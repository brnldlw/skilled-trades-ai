export function escapeHtml(input: string) {
  return input
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#039;");
}

export function formatRawOutput(raw: string) {
  if (!raw) return "No results yet.";

  const trimmed = raw.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return trimmed;
  }
}