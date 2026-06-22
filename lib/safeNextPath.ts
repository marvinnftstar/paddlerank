const LOCAL_URL = "https://paddlerank.local";

export function getSafeNextPath(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, LOCAL_URL);

    if (url.origin !== LOCAL_URL) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function isMatchConfirmationPath(path: string) {
  const url = new URL(path, LOCAL_URL);
  return /^\/confirm-match\/[0-9a-f-]+$/i.test(url.pathname);
}
