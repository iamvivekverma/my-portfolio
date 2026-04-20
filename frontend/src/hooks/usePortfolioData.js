import { useCallback } from "react";
import { portfolioApi } from "../services/api";
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
  const loader = useCallback(async () => {
    const res = await portfolioApi.getProjects();
    return res?.data || [];
  }, []);

  return useApiResource(loader, { initialData: [] });
}

export function useProject(id) {
  const loader = useCallback(async () => {
    const res = await portfolioApi.getProjectById(id);
    return res?.data || null;
  }, [id]);

  return useApiResource(loader, { initialData: null, enabled: Boolean(id) });
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
