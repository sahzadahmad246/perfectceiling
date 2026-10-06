/** Only allow paths that stay on the current origin, including after URL parsing. */
export function getAuthRedirectPath(value: unknown, fallback = "/admin") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;

  const base = "https://auth.invalid";
  const target = new URL(value, base);
  if (target.origin !== base) return fallback;

  return `${target.pathname}${target.search}${target.hash}`;
}
