import { Link, useLocation } from "react-router-dom";
import { FaBars, FaBriefcase, FaGraduationCap, FaCode, FaUser } from "react-icons/fa";
import { GiCrossedBones } from "react-icons/gi";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navItems = [
    { name: "Projects",   path: "/projects",   icon: FaBriefcase },
    { name: "Experience", path: "/experience", icon: FaGraduationCap },
    { name: "Skills",     path: "/skills",     icon: FaCode },
    { name: "About",      path: "/about",      icon: FaUser },
  ];

  const subLabel = {
    "/projects":   "View my work",
    "/experience": "My journey",
    "/skills":     "What I know",
    "/about":      "Who I am",
  };

  return (
    <nav className="sticky top-0 left-0 right-0 py-5 lg:border-none border-b z-50 md:bg-none bg-bg">
      <div className="max-w-8xl mx-auto h-full flex items-center justify-between px-5">

        {/* Logo */}
        <div className="text-primary text-3xl font-bold" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
          <Link to="/">
            vivek<span className="text-primary/50 italic tracking-tight">.work</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center text-[18px]">
          {navItems.map((item, index) => (
            <div key={item.path} className="flex items-center">
              <Link to={item.path}>
                <span className={`px-10 font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-primary/65 hover:text-primary hover:bg-primary/5"
                }`}>
                  {item.name}
                </span>
              </Link>
              {index !== navItems.length - 1 && (
                <span className="mx-1 h-4 w-px bg-primary/25" />
              )}
            </div>
          ))}
        </div>
        {!open && (
          <div className="lg:hidden cursor-pointer text-primary border border-primary/30 p-2.5 rounded-full hover:bg-primary/5 transition-colors"
               onClick={() => setOpen(true)}>
            <FaBars className="text-lg" />
          </div>
        )}

        {/* Mobile Overlay */}
        <div className={`xl:hidden fixed top-0 left-0 z-50 h-screen w-full overflow-hidden transition-all duration-700 ease-in-out ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85 backdrop-blur-md transition-all duration-700 ${
            open ? "opacity-100" : "opacity-0"
          }`} onClick={() => setOpen(false)} />

          <div className={`relative z-10 h-full flex flex-col transition-all duration-700 transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="text-white">
                <p className="text-xs opacity-70 tracking-wider uppercase">Navigate to</p>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Menu</h3>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 cursor-pointer"
                   onClick={() => setOpen(false)}>
                <GiCrossedBones className="text-xl text-white" />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
              <div className="space-y-3 w-full max-w-sm">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:scale-105 block ${
                        location.pathname === item.path
                          ? "bg-white text-primary border-white shadow-xl"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50"
                      }`} style={{ transitionDelay: `${index * 60}ms` }}>
                      <div className={`flex items-center gap-4 p-4 transition-all duration-300 ${
                        open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                      }`} style={{ transitionDelay: `${index * 80 + 150}ms` }}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                          location.pathname === item.path ? "bg-primary/20" : "bg-white/20 group-hover:bg-white/30"
                        }`}>
                          <Icon className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{item.name}</h4>
                          <p className={`text-sm ${location.pathname === item.path ? "text-primary/70" : "text-white/65"}`}>
                            {subLabel[item.path]}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full transition-all duration-300 ${
                          location.pathname === item.path ? "bg-primary scale-100" : "bg-white/50 scale-0 group-hover:scale-100"
                        }`} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-white/20 text-center text-white/55 text-sm">
              <p style={{ fontFamily: "var(--font-display)" }}>vivek.work</p>
              <p className="text-xs mt-1">Crafted with passion</p>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}
