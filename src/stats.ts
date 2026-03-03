interface BangStat {
  count: number;
  lastUsed: number;
  firstUsed: number;
}

interface StatsData {
  [bang: string]: BangStat;
}

const STORAGE_KEY = 'bang-stats';
const MAX_STATS = 100; // Keep only top 100 bangs to prevent storage bloat

export function recordBangUsage(bang: string): void {
  try {
    const stats = getStats();
    const now = Date.now();
    
    if (stats[bang]) {
      stats[bang].count++;
      stats[bang].lastUsed = now;
    } else {
      stats[bang] = {
        count: 1,
        lastUsed: now,
        firstUsed: now
      };
    }
    
    // Trim to top MAX_STATS by count if getting too large
    const entries = Object.entries(stats);
    if (entries.length > MAX_STATS) {
      const sorted = entries.sort((a, b) => b[1].count - a[1].count);
      const trimmed = sorted.slice(0, MAX_STATS);
      const newStats: StatsData = {};
      trimmed.forEach(([key, value]) => {
        newStats[key] = value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  } catch {
    // Silently fail if localStorage is unavailable or full
  }
}

export function getStats(): StatsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getSortedStats(): Array<[string, BangStat]> {
  const stats = getStats();
  return Object.entries(stats).sort((a, b) => b[1].count - a[1].count);
}

export function getTotalSearches(): number {
  const stats = getStats();
  return Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
}

export function getMostUsedBang(): { bang: string; count: number } | null {
  const sorted = getSortedStats();
  if (sorted.length === 0) return null;
  return { bang: sorted[0][0], count: sorted[0][1].count };
}

export function getRecentlyUsedBangs(limit: number = 10): Array<[string, BangStat]> {
  const stats = getStats();
  return Object.entries(stats)
    .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
    .slice(0, limit);
}

export function clearStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

export function exportStats(): string {
  return JSON.stringify(getStats(), null, 2);
}
