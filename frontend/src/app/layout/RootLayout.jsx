import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileOverlay from "./MobileOverlay";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { warmProjectsRoute } from "../preloadRoutes";

export default function RootLayout() {
  const location = useLocation();
  const hideFooterRoutes = ["/", "/locked-project"];
  const showFooter = !hideFooterRoutes.includes(location.pathname) && !location.pathname.startsWith("/project/");
  const isResumeRoute = location.pathname === "/resume";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const warmProjects = () => {
      warmProjectsRoute();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmProjects, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(warmProjects, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (isResumeRoute) {
    return <Outlet />;
  }

  return (
    <div className="app">
      <MobileOverlay />
      <Navbar />
      <main>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
