export type AdminFormDraft<TForm> = {
  form: TForm;
  savedAt: string;
  meta?: Record<string, unknown>;
};

const STORAGE_PREFIX = "perfect-ceiling:draft";

export type AdminFormDraftScope = "project" | "service";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAdminFormDraftKey(
  scope: AdminFormDraftScope,
  mode: "create" | "edit",
  id?: string,
) {
  return `${STORAGE_PREFIX}:${scope}:${mode}${id ? `:${id}` : ""}`;
}

export function loadAdminFormDraft<TForm>(
  key: string,
): AdminFormDraft<TForm> | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AdminFormDraft<TForm>;

    if (!parsed?.form || !parsed.savedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveAdminFormDraft<TForm>(
  key: string,
  form: TForm,
  meta?: Record<string, unknown>,
) {
  if (!isBrowser()) {
    return;
  }

  try {
    const payload: AdminFormDraft<TForm> = {
      form,
      savedAt: new Date().toISOString(),
      meta,
    };

    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota or privacy mode errors.
  }
}

export function clearAdminFormDraft(key: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}

export function formatAdminFormDraftTime(savedAt: string) {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}