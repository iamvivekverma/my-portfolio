import { useState, useEffect } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import FloatingCircles from "./FloatingCircles";
import Avatar from "./Avatar";
import ChatBot from "./ChatBot";
import QuickLinks from "./QuickLinks";

export default function HeroSection() {
  const [wow, setWow] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Entrance timeline: avatar drops (0.7s) + bounce (1.5s), circles enter (0.7s-1.8s).
    // By 2.2s, everything has settled. Mark settled so resizing or switching views
    // never replays entrance animations.
    const timer = setTimeout(() => {
      setIsSettled(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Motion.section
      id="home"
      className="flex h-[calc(100svh-6rem)] w-full flex-col items-center justify-center overflow-hidden px-3 sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Truly Responsive Unified Hero Stage for all screen sizes */}
      <div className="relative flex aspect-square w-[min(94vw,45rem)] lg:w-[55rem] max-h-[76vh] max-w-[94vw] flex-col -top-4 sm:-top-12 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="flex h-full w-full justify-center items-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Avatar
              wow={wow}
              onHover={setWow}
              isSettled={isSettled}
              className="w-[clamp(11rem,44vw,19rem)] h-[clamp(11rem,44vw,19rem)] sm:w-80 sm:h-80 md:w-95 md:h-95 lg:w-110 lg:h-110 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            />
          </div>

          <FloatingCircles setWow={setWow} isSettled={isSettled} />
        </div>
      </div>

      <Motion.div
        className="fixed bottom-4 z-[200] flex w-full justify-between px-8 text-primary max-[500px]:px-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: reduceMotion || isSettled ? 0 : 1.6,
          ease: "easeOut",
        }}
      >
        <QuickLinks />
        <ChatBot />
      </Motion.div>
    </Motion.section>
  );
}
