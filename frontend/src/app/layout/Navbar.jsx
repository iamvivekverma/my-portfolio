import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaBriefcase,
  FaGraduationCap,
  FaUser,
  FaLightbulb,
} from "react-icons/fa";
import { GiCrossedBones } from "react-icons/gi";
import { warmProjectsRoute } from "../preloadRoutes";
import { useFeedback } from "../../shared/components/feedbackContext";
import StarBorder from "../../shared/components/StarBorder";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { openFeedback } = useFeedback();

  const handleClose = useCallback(() => setOpen(false), []);

  // Lock body scroll on mobile drawer open & handle Escape key
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  const navItems = [
    { name: "Projects", path: "/projects", icon: FaBriefcase },
    { name: "Experience", path: "/experience", icon: FaGraduationCap },
    { name: "Approach", path: "/skills", icon: FaLightbulb },
    { name: "About", path: "/about", icon: FaUser },
  ];

  const subLabel = {
    "/projects": "View my work",
    "/experience": "My journey",
    "/skills": "How I work",
    "/about": "Who I am",
  };

  const handleNavIntent = (path) => {
    if (path === "/projects") {
      warmProjectsRoute();
    }
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 py-5 bg-bg border-b border-primary/10 lg:border-none">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-5 h-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            onClick={handleClose}
            className="text-primary text-3xl font-bold"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
          >
            vivek<span className="text-primary/50 italic tracking-tight">.work</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center text-[18px]">
          {navItems.map((item, index) => (
            <div key={item.path} className="flex items-center">
              <Link
                to={item.path}
                onFocus={() => handleNavIntent(item.path)}
                onMouseEnter={() => handleNavIntent(item.path)}
                onTouchStart={() => handleNavIntent(item.path)}
              >
                <span
                  className={`px-8 font-medium transition-all duration-200 py-1 ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/10 scale-105"
                      : "text-primary/65 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
              {index !== navItems.length - 1 && (
                <span className="mx-1 h-4 w-px bg-primary/25" />
              )}
            </div>
          ))}

          {/* Desktop Feedback Button */}
          <StarBorder
            as="button"
            type="button"
            onClick={openFeedback}
            aria-label="Share feedback"
            title="Share feedback"
            color="#93e190"
            radius={9999}
            thickness={1.5}
            theme="light"
            duration={4}
            glow={0.6}
            sparkle={true}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/35 px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-[var(--color-fill)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:px-4 ml-4"
          >
            <span>Feedback</span>
          </StarBorder>
        </div>

        {/* Mobile Controls (Feedback + Hamburger Toggle) */}
        <div className="flex lg:hidden items-center gap-2">
          <StarBorder
            as="button"
            type="button"
            onClick={openFeedback}
            aria-label="Share feedback"
            title="Share feedback"
            color="#450e16"
            radius={9999}
            thickness={1.5}
            theme="light"
            duration={4}
            glow={0.6}
            sparkle={true}
            className="inline-flex cursor-pointer items-center justify-center p-2 rounded-full border border-primary/35 text-primary hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="text-xs font-semibold px-1">Feedback</span>
          </StarBorder>

          {!open && (
            <div
              className="cursor-pointer text-primary border border-primary/30 p-2.5 rounded-full hover:bg-primary/5 transition-colors"
              onClick={() => setOpen(true)}
            >
              <FaBars className="text-lg" />
            </div>
          )}
        </div>

        {/* Mobile Overlay Drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-50 h-screen w-full overflow-hidden transition-all duration-500 ease-in-out ${
            open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85 backdrop-blur-md transition-opacity duration-500 ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
          />

          {/* Drawer Content */}
          <div
            className={`relative z-10 h-full flex flex-col justify-between transition-transform duration-500 transform ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="text-white">
                <p className="text-xs opacity-70 tracking-wider uppercase">Navigate to</p>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Menu
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={handleClose}
                className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none"
              >
                <GiCrossedBones className="text-xl text-white" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
              <div className="space-y-3 w-full max-w-sm">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleClose}
                      onFocus={() => handleNavIntent(item.path)}
                      onMouseEnter={() => handleNavIntent(item.path)}
                      onTouchStart={() => handleNavIntent(item.path)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 block ${
                        isActive
                          ? "bg-white text-primary border-white shadow-xl"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50"
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-white/20 group-hover:bg-white/30 text-white"
                          }`}
                        >
                          <Icon className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4
                            className="text-lg font-bold"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {item.name}
                          </h4>
                          <p
                            className={`text-sm ${
                              isActive ? "text-primary/70" : "text-white/65"
                            }`}
                          >
                            {subLabel[item.path]}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full transition-all duration-300 ${
                            isActive
                              ? "bg-primary scale-100"
                              : "bg-white/50 scale-0 group-hover:scale-100"
                          }`}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 text-center text-white/55 text-sm">
              <p style={{ fontFamily: "var(--font-display)" }}>vivek.work</p>
              <p className="text-xs mt-1">Designed and built by Vivek</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
