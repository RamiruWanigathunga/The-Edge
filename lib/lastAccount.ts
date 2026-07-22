const KEY = "edge-last-account";

export type LastAccount = { email: string; name?: string };

export function getLastAccount(): LastAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function setLastAccount(account: LastAccount) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(account));
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}
