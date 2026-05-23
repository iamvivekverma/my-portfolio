import { primeProjectsCache } from '../services/projectsCache';

export function loadProjectsRoute() {
  return import('../features/projects/components/ProjectsSection');
}

export function warmProjectsRoute() {
  loadProjectsRoute().catch(() => {
    // React.lazy will surface chunk loading failures when the route is opened.
  });
  primeProjectsCache().catch(() => {
    // Let the projects page surface any real loading error on demand.
  });
}
