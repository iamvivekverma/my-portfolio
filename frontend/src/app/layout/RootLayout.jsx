import { Outlet, useLocation } from "react-router-dom";
import MobileOverlay from "./MobileOverlay";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function RootLayout() {
  const location = useLocation();
  const hideFooterRoutes = ["/", "/locked-project"];
  const showFooter = !hideFooterRoutes.includes(location.pathname);

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
