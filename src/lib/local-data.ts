export const PROFILE_STORAGE_KEY = 'showmethesaju.birth-profiles.v1';
export const COMPARISON_STORAGE_KEY = 'showmethesaju.comparison-history.v1';
export const ONBOARDING_STORAGE_KEY = 'showmethesaju.onboarding.v1';

export interface BirthProfileData {
  date: string;
  time: string;
  timeUnknown: boolean;
  calendar: 'solar' | 'lunar';
  leap: boolean;
  gender: 'f' | 'm';
  city: string;
  trueSolar: boolean;
}

export interface BirthProfile {
  id: string;
  name: string;
  data: BirthProfileData;
  updatedAt: number;
}

export interface ComparisonHistoryItem {
  id: string;
  fragment: string;
  createdAt: number;
  signature: string;
}

const safeArray = (raw: string | null): unknown[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isProfile = (value: unknown): value is BirthProfile => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<BirthProfile>;
  const data = item.data as Partial<BirthProfileData> | undefined;
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.updatedAt === 'number' && Boolean(data) &&
    typeof data?.date === 'string' && typeof data?.time === 'string' &&
    typeof data?.timeUnknown === 'boolean' && ['solar', 'lunar'].includes(data?.calendar ?? '') &&
    typeof data?.leap === 'boolean' && ['f', 'm'].includes(data?.gender ?? '') &&
    typeof data?.city === 'string' && typeof data?.trueSolar === 'boolean';
};

const isHistoryItem = (value: unknown): value is ComparisonHistoryItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ComparisonHistoryItem>;
  return typeof item.id === 'string' && typeof item.fragment === 'string' &&
    typeof item.createdAt === 'number' && typeof item.signature === 'string' &&
    item.fragment.length <= 1200;
};

export const parseProfiles = (raw: string | null): BirthProfile[] =>
  safeArray(raw).filter(isProfile).slice(0, 12);

export const parseComparisonHistory = (raw: string | null): ComparisonHistoryItem[] =>
  safeArray(raw).filter(isHistoryItem).slice(0, 8);

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; }
  catch { return null; }
}

export function loadProfiles(): BirthProfile[] {
  const target = storage();
  return target ? parseProfiles(target.getItem(PROFILE_STORAGE_KEY)) : [];
}

export function saveProfile(name: string, data: BirthProfileData): BirthProfile[] {
  const target = storage();
  if (!target) return [];
  const profiles = loadProfiles();
  const normalizedName = name.trim().slice(0, 40);
  const sameName = profiles.find((profile) => profile.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase());
  const next: BirthProfile = {
    id: sameName?.id ?? `profile-${Date.now().toString(36)}`,
    name: normalizedName,
    data,
    updatedAt: Date.now(),
  };
  const updated = [next, ...profiles.filter((profile) => profile.id !== next.id)].slice(0, 12);
  target.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteProfile(id: string): BirthProfile[] {
  const target = storage();
  if (!target) return [];
  const updated = loadProfiles().filter((profile) => profile.id !== id);
  target.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function loadComparisonHistory(): ComparisonHistoryItem[] {
  const target = storage();
  return target ? parseComparisonHistory(target.getItem(COMPARISON_STORAGE_KEY)) : [];
}

export function rememberComparison(fragment: string, signature: string): ComparisonHistoryItem[] {
  const target = storage();
  if (!target || !fragment || fragment.length > 1200) return [];
  const existing = loadComparisonHistory();
  const next: ComparisonHistoryItem = {
    id: `comparison-${Date.now().toString(36)}`,
    fragment,
    signature: signature.slice(0, 32),
    createdAt: Date.now(),
  };
  const updated = [next, ...existing.filter((item) => item.fragment !== fragment)].slice(0, 8);
  target.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearComparisonHistory(): void {
  storage()?.removeItem(COMPARISON_STORAGE_KEY);
}
