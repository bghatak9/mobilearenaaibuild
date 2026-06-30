const LOCAL_HISTORY_KEY = "mobilearena:finder-search-history";
const MAX_HISTORY = 20;

export type SearchHistoryItem = {
  id: string;
  query: string;
  searchedAt: string;
};

function readLocalHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(items: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    /* ignore */
  }
}

export function getLocalSearchHistory(): SearchHistoryItem[] {
  return readLocalHistory();
}

export function addLocalSearchHistory(query: string): SearchHistoryItem[] {
  const trimmed = query.trim();
  if (!trimmed) return readLocalHistory();

  const existing = readLocalHistory().filter(
    (item) => item.query.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next: SearchHistoryItem[] = [
    {
      id: `local-${Date.now()}`,
      query: trimmed,
      searchedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_HISTORY);

  writeLocalHistory(next);
  return next;
}

export function removeLocalSearchHistory(id: string): SearchHistoryItem[] {
  const next = readLocalHistory().filter((item) => item.id !== id);
  writeLocalHistory(next);
  return next;
}

export function clearLocalSearchHistory(): SearchHistoryItem[] {
  writeLocalHistory([]);
  return [];
}

export function mergeSearchHistory(
  local: SearchHistoryItem[],
  remote: SearchHistoryItem[],
): SearchHistoryItem[] {
  const map = new Map<string, SearchHistoryItem>();
  for (const item of [...remote, ...local]) {
    const key = item.query.toLowerCase();
    const prev = map.get(key);
    if (!prev || new Date(item.searchedAt) > new Date(prev.searchedAt)) {
      map.set(key, item);
    }
  }
  return [...map.values()]
    .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime())
    .slice(0, MAX_HISTORY);
}
