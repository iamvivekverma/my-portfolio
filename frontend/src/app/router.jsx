import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import ErrorPage from "./error/ErrorPage";

import NotFound from "../pages/NotFound";

const HeroSection = lazy(() => import("../features/home/components/HeroSection"));
const SkillsSection = lazy(() => import("../features/skills/components/SkillsSection"));
const ProjectsSection = lazy(() => import("../features/projects/components/ProjectsSection"));
const AboutSection = lazy(() => import("../features/about/components/AboutSection"));
const ExperienceSection = lazy(() => import("../features/experience/components/ExperienceSection"));
const Admin = lazy(() => import("../pages/Admin"));
const LockedProject = lazy(() => import("../pages/LockedProject"));
const ProjectDetail = lazy(() => import("../pages/ProjectDetail"));

function withSuspense(element) {
  return <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)]" />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: withSuspense(<HeroSection />) },
      { path: "skills", element: withSuspense(<SkillsSection />) },
      { path: "projects", element: withSuspense(<ProjectsSection />) },
      { path: "about", element: withSuspense(<AboutSection />) },
      { path: "experience", element: withSuspense(<ExperienceSection />) },
      { path: "vivek-admin-portal-2024", element: withSuspense(<Admin />) },
      { path: "locked-project", element: withSuspense(<LockedProject />) },
      { path: "project/:id", element: withSuspense(<ProjectDetail />) },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
