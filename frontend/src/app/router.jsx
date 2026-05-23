import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import ErrorPage from "./error/ErrorPage";

import NotFound from "../pages/NotFound";
import ResumePortfolio from "../features/resume/ResumePortfolio";

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
      { index: true, element: <ResumePortfolio /> },
      { path: "skills", element: <ResumePortfolio /> },
      { path: "projects", element: <ResumePortfolio /> },
      { path: "about", element: <ResumePortfolio /> },
      { path: "experience", element: <ResumePortfolio /> },
      { path: "whytiti", element: withSuspense(<Admin />) },
      { path: "locked-project", element: withSuspense(<LockedProject />) },
      { path: "project/:id", element: withSuspense(<ProjectDetail />) },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
