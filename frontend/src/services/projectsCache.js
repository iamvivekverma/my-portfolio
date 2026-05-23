import { buildApiUrl, portfolioApi } from './api';

const PROJECTS_CACHE_KEY = 'portfolio_projects_cache_v1';
const PROJECTS_CACHE_TTL_MS = 1000 * 60 * 5;

let inMemoryCache = null;
let inFlightRequest = null;
const preloadedProjectImages = new Set();

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function isFreshCacheEntry(entry) {
  return Array.isArray(entry?.data) && Number(entry?.expiresAt) > Date.now();
}

function clearStoredCache() {
  inMemoryCache = null;

  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(PROJECTS_CACHE_KEY);
  }
}

function persistCache(data) {
  const entry = {
    data,
    expiresAt: Date.now() + PROJECTS_CACHE_TTL_MS,
  };

  inMemoryCache = entry;

  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(entry));
  }

  return entry.data;
}

export function preloadProjectImages(projects, { limit = 3 } = {}) {
  if (typeof window === 'undefined' || !Array.isArray(projects)) {
    return;
  }

  projects.slice(0, limit).forEach((project) => {
    if (!project?._id || preloadedProjectImages.has(project._id)) {
      return;
    }

    preloadedProjectImages.add(project._id);
    const image = new Image();
    image.decoding = 'async';
    image.src = buildApiUrl(`/projects/${project._id}/image`);
  });
}

function readStoredCache() {
  if (isFreshCacheEntry(inMemoryCache)) {
    return inMemoryCache.data;
  }

  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PROJECTS_CACHE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!isFreshCacheEntry(parsed)) {
      clearStoredCache();
      return null;
    }

    inMemoryCache = parsed;
    return parsed.data;
  } catch {
    clearStoredCache();
    return null;
  }
}

export function getCachedProjects() {
  return readStoredCache();
}

export function invalidateProjectsCache() {
  clearStoredCache();
}

export async function primeProjectsCache({ force = false } = {}) {
  if (!force) {
    const cached = readStoredCache();

    if (cached) {
      return cached;
    }
  } else {
    clearStoredCache();
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = portfolioApi
    .getProjects()
    .then((response) => {
      const data = persistCache(response?.data || []);
      preloadProjectImages(data);
      return data;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}
