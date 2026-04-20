import { useState, useEffect } from "react";
import SvgText from "./SvgText";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const BASE_SIZE = 200;
const NAV_CIRCLES = [
  {
    size: { base: 100, md: 140, lg: 160 },
    top: "22%",
    left: "3%",
    textPosition: {
      base: { x: 100, y: -40 },
      md: { x: 200, y: -40 },
      lg: { x: 180, y: -40 }
    },
    image: {
      src: "/assets/images/projects.svg",
      alt: "Projects",
      top: 55,
      left: 20,
    },
    name: "Projects",
    path: "/projects",
    scale: 1.25,
  },
  {
    size: { base: 100, md: 160, lg: 180 },
    top: "62%",
    left: "15%",
    textPosition: {
      base: { x: 85, y: 50 },
      md: { x: 110, y: 55 },
      lg: { x: 110, y: 55 }
    },
    image: {
      src: "/assets/images/about.svg",
      alt: "About",
      left: 18,
      top: 18,
    },
    name: "About",
    path: "/about",
    scale: 1.2,
  },
  {
    size: { base: 100, md: 180, lg: 200 },
    top: "46%",
    left: "80%",
    textPosition: {
      base: { x: -105, y: 50 },
      md: { x: -150, y: 60 },
      lg: { x: -150, y: 60 }
    },
    image: {
      src: "/assets/images/bot.svg",
      alt: "Experience",
      top: 12,
      left: 20,
    },
    name: "Experience",
    path: "/experience",
    scale: 1.05,
  },
  {
    size: { base: 100, md: 130, lg: 150 },
    top: "10%",
    left: "69%",
    textPosition: {
      base: { x: -90, y: 50 },
      md: { x: -115, y: 55 },
      lg: { x: -115, y: 55 }
    },
    image: {
      src: "/assets/images/skills.svg",
      alt: "Skills",
      top: 15,
      left: 50,
    },
    name: "Skills",
    path: "/skills",
    scale: 1.25,
  },
];

const FLOATING_CIRCLES = [
  { special: true, size: { base: 50, md: 70, lg: 90 }, top: "5%", left: "55%" },
  { special: true, size: { base: 15, md: 22, lg: 30 }, top: "16%", left: "30%" },
  { special: true, size: { base: 40, md: 55, lg: 70 }, top: "85%", left: "45%" },
  { special: true, size: { base: 15, md: 22, lg: 30 }, top: "80%", left: "70%" },
  { size: { base: 20, md: 30, lg: 40 }, top: "35%", left: "85%" },
  { size: { base: 30, md: 45, lg: 55 }, top: "58%", left: "8%" },
];

export default function FloatingCircles({ setWow }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenWidth(window.innerWidth);
      }, 50); 
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isMobile = screenWidth < 1024;
  const currentSizeKey = screenWidth < 500 ? "base" : isMobile ? "md" : "lg";

  return (
    <div className="absolute inset-0">
      {FLOATING_CIRCLES.map((circle, index) => {
        const dynamicSize = circle.size[currentSizeKey];
        return (
          <Motion.div
            key={`float-${index}`}
            className={`absolute rounded-full z-10 ${
              circle.special ? "bg-[#ffa102] lg:bg-[#ffc760]" : "bg-[#fdcb6e]"
            }`}
            style={{
              width: dynamicSize,
              height: dynamicSize,
              top: circle.top,
              left: circle.left,
            }}
            animate={{
              y: [0, -15 - index * 8, 0],
              x: [0, index % 2 === 0 ? 20 : -20, 0],
            }}
            transition={{
              duration: 2 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {NAV_CIRCLES.map((circle, index) => {
        const dynamicSize = circle.size[currentSizeKey];
        const scaleFactor = dynamicSize / BASE_SIZE;
        const textPos = circle.textPosition[currentSizeKey];

        return (
          <Link key={circle.path} to={circle.path}>
            <Motion.div
              className="absolute cursor-pointer z-20 bg-fill lg:bg-[#ffa102] lg:hover:bg-fill flex items-center justify-center rounded-full group will-change-transform"
              style={{
                width: dynamicSize,
                height: dynamicSize,
                top: circle.top,
                left: circle.left,
              }}
              animate={{
                y: [0, -12 - index * 3, 0],
                x: [0, index % 2 === 0 ? 10 : -10, 0],
              }}
              whileHover={!isMobile ? { scale: circle.scale } : undefined}
              transition={{
                duration: 2.5 + index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
                scale: { duration: 0.25, repeat: 0 },
              }}
              onMouseEnter={() => {
                setWow(true);
              }}
              onMouseLeave={() => {
                setWow(false);
              }}
            >
              <Motion.img
                src={circle.image.src}
                alt={circle.image.alt}
                className="absolute block lg:hidden lg:group-hover:block"
                style={{
                  width: 130 * scaleFactor,
                  height: 130 * scaleFactor,
                  left: circle.image.left * scaleFactor,
                  top: circle.image.top * scaleFactor,
                }}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
              />

              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${textPos.x * scaleFactor}px, ${textPos.y * scaleFactor}px)`,
                }}
              >
                <SvgText scale={scaleFactor}>{circle.name}</SvgText>
              </div>
            </Motion.div>
          </Link>
        );
      })}
    </div>
  );
}
