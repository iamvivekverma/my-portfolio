import { useState } from "react";
import { motion as Motion } from "framer-motion";
import FloatingCircles from "./FloatingCircles";
import ChatBot from "./ChatBot";
import QuickLinks from "./QuickLinks";

export default function HeroSection() {
  const [wow, setWow] = useState(false);

  return (
    <>
      <Motion.section
        id="home"
        className="flex flex-col h-[calc(100vh-6rem)] w-full items-center justify-center px-8 overflow-hidden"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative w-[clamp(20rem,110vw,56rem)] aspect-square lg:h-full max-h-[80vh] flex flex-col -top-12">
          <div className="flex justify-center w-full h-full">
            <Motion.img
              src={wow ? "./assets/images/woww.svg" : "./assets/images/wow.svg"}
              className="float sm:w-80 sm:h-80 w-[clamp(12rem,50vw,20rem)] max-[500px]:h-50 h-80 lg:w-110 lg:h-110 md:w-95 md:h-95 absolute top-1/2 -translate-y-1/2 cursor-pointer duration-300"
              animate={{ y: [0, -25, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              onMouseEnter={() => setWow(true)}
              onMouseLeave={() => setWow(false)}
            />
            <FloatingCircles wow={wow} setWow={setWow} />
          </div>
        </div>

        <Motion.div
          className="fixed bottom-4 px-8 max-[500px]:px-5 z-20 text-primary flex justify-between w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <QuickLinks />
          <ChatBot />
        </Motion.div>
      </Motion.section>
    </>
  );
}
