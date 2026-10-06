/** Keep this allowlist aligned with next.config.ts remotePatterns. */
export function shouldBypassImageOptimization(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return false;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return true;
    return !(
      url.hostname.endsWith(".supabase.co") ||
      url.hostname.endsWith(".googleusercontent.com")
    );
  } catch {
    return true;
  }
}
