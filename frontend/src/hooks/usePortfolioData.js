import { useCallback } from "react";
import { portfolioApi } from "../services/api";
import { getCachedProjects, primeProjectsCache } from "../services/projectsCache";
import { useApiResource } from "./useApiResource";

export function useAbout() {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getAbout();
    return res?.data || null;
  }, []);

  return useApiResource(loader, { initialData: null });
}

export function useSkills() {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getSkills();
    return res?.data || [];
  }, []);

  return useApiResource(loader, { initialData: [] });
}

export function useProjects() {
  const cachedProjects = getCachedProjects();
  const loader = useCallback(() => primeProjectsCache(), []);

  return useApiResource(loader, {
    initialData: cachedProjects || [],
    enabled: !cachedProjects,
  });
}

export function useProject(id, accessToken = "", { enabled = true } = {}) {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getProjectById(id, { accessToken });
    return res?.data || null;
  }, [accessToken, id]);

  return useApiResource(loader, { initialData: null, enabled: Boolean(id) && enabled });
}

export function useExperience() {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getExperience();
    return res?.data || [];
  }, []);

  return useApiResource(loader, { initialData: [] });
}

export function useAchievements() {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getAchievements();
    return res?.data || [];
  }, []);

  return useApiResource(loader, { initialData: [] });
}
