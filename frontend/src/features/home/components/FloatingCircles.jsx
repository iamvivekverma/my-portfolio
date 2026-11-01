import { useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import SvgText from "./SvgText";
import useMediaQuery from "../../../hooks/useMediaQuery";

import { NAV_GAP, DOT_GAP } from "../burst";
import {
  CIRCLES_START,
  makeSideEntry,
  sideMotion,
  useStageFrame,
} from "./Entrance";

import {
  NAV_CIRCLES,
  FLOATING_CIRCLES,
  BASE_SIZE,
  POP_ORDER,
} from "../circlesData";

// Organic criss-cross / pseudo-random order so text doesn't appear in a rigid circle
const TEXT_SEQUENCE = ["/skills", "/about", "/experience", "/projects"];

/**
 * Truly responsive navigation circles layout for all screen sizes (mobile to desktop).
 *
 * - Entrance animation runs once and never replays on window resize.
 * - Buttery smooth transition for circle sizes across all breakpoints.
 * - Nav text position preserved exactly as original.
 * - No text scaling transitions.
 * - Below LG: organic, relaxed sequential fade-in (one by one).
 * - Back to LG: simultaneous unified fade-out.
 * - On LG: normal hover visibility.
 */
export default function FloatingCircles({ setWow, isSettled }) {
  const reduceMotion = useReducedMotion();
  const boxRef = useRef(null);
  const frame = useStageFrame(boxRef, null, reduceMotion);

  // Breakpoints: phone (< 500px), sm tablet (500-767px), md tablet (768-1023px), lg desktop (1024px+)
  const isSm = useMediaQuery("(min-width: 500px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  // Hover state for LG screens
  const [hoveredCircle, setHoveredCircle] = useState(null);

  const getSize = (sizeObj) => {
    if (isLg) return sizeObj.lg;
    if (isMd) return sizeObj.md;
    if (isSm) return sizeObj.sm;
    return sizeObj.base;
  };

  const getTextPosition = (textPosObj) => {
    if (isLg) return textPosObj.lg;
    if (isMd) return textPosObj.md;
    if (isSm) return textPosObj.sm;
    return textPosObj.base;
  };

  const ready = reduceMotion || isSettled || frame !== null;

  // Cache entrance animation props so re-renders / resizes NEVER recreate keyframes
  const motionCacheRef = useRef(new Map());

  const motionFor = (key, circle, size, delay, options = {}) => {
    if (reduceMotion || isSettled || !frame) return {};

    if (motionCacheRef.current.has(key)) {
      return motionCacheRef.current.get(key);
    }

    const entry = makeSideEntry(
      {
        cx: (frame.w * parseFloat(circle.left)) / 100 + size / 2,
        cy: (frame.h * parseFloat(circle.top)) / 100 + size / 2,
        size,
      },
      frame,
      options,
    );

    const m = sideMotion(entry, delay);
    motionCacheRef.current.set(key, m);
    return m;
  };

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute inset-0"
    >
      {/* Decorative floating dots */}
      {ready &&
        FLOATING_CIRCLES.map((circle, index) => {
          const size = getSize(circle.size);
          const entranceProps = motionFor(
            `float-${index}`,
            circle,
            size,
            CIRCLES_START + 0.2 + index * DOT_GAP,
            { roll: false },
          );

          return (
            <Motion.div
              key={`float-${index}`}
              className="absolute z-10 transition-[width,height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: size,
                height: size,
                top: circle.top,
                left: circle.left,
              }}
              initial={isSettled ? false : entranceProps.initial}
              animate={isSettled ? undefined : entranceProps.animate}
              transition={isSettled ? undefined : entranceProps.transition}
            >
              <Motion.div
                className={`h-full w-full rounded-full transition-colors duration-300 ${
                  circle.special
                    ? "bg-[#ffa102] lg:bg-[#fdcb6e]"
                    : "bg-[#fdcb6e]"
                }`}
                style={{ borderRadius: "50%" }}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        y: [0, -2, 0],
                        scaleX: [1, 1.04, 0.98, 1],
                        scaleY: [1, 0.96, 1.03, 1],
                      }
                }
                transition={{
                  duration: 2.8 + index * 0.18,
                  repeat: Infinity,
                  ease: [0.37, 0, 0.63, 1],
                  delay: index * 0.12,
                }}
              />
            </Motion.div>
          );
        })}

      {/* Navigation circles */}
      {ready &&
        NAV_CIRCLES.map((circle, index) => {
          const size = getSize(circle.size);
          const scaleFactor = size / BASE_SIZE;
          const textPos = getTextPosition(circle.textPosition);

          const popDelay =
            CIRCLES_START +
            POP_ORDER.indexOf(circle.path) * NAV_GAP;

          const entranceProps = motionFor(
            circle.path,
            circle,
            size,
            popDelay,
            { roll: false },
          );

          // Sequence index for fade-in below LG (organic criss-cross order)
          const seqIndex = TEXT_SEQUENCE.indexOf(circle.path);

          // Visibility:
          // On LG: visible ONLY when hovered.
          // Below LG: visible.
          const isTextVisible = isLg
            ? hoveredCircle === circle.path
            : true;

          // Intelligent delay & duration:
          // 1. Initial entrance (!isSettled): wait 2.1s for avatar & circles to land and settle.
          // 2. Resized from LG to below LG (isSettled): wait 0.55s for circle size transition to settle.
          // 3. Stagger each item by 0.34s with 0.55s smooth fade duration.
          const baseDelay = isSettled ? 0.55 : 2.1;
          const textDelay = baseDelay + seqIndex * 0.34;

          return (
            <Link
              key={circle.path}
              to={circle.path}
              aria-label={circle.name}
            >
              <Motion.div
                className="pointer-events-auto absolute z-20 lg:z-30 transition-[width,height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: size,
                  height: size,
                  top: circle.top,
                  left: circle.left,
                }}
                initial={isSettled ? false : entranceProps.initial}
                animate={isSettled ? undefined : entranceProps.animate}
                transition={isSettled ? undefined : entranceProps.transition}
              >
                <Motion.div
                  className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-full lg:bg-[#ffa102] bg-fill transition-colors duration-300 lg:hover:bg-fill"
                  style={{ borderRadius: "50%" }}
                  whileHover={{ scale: circle.scale }}
                  transition={{
                    scale: {
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                    },
                  }}
                  onMouseEnter={() => {
                    setHoveredCircle(circle.path);
                    setWow(true);
                  }}
                  onMouseLeave={() => {
                    setHoveredCircle(null);
                    setWow(false);
                  }}
                >
                  {/* Circle breathing animation */}
                  <Motion.div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{ borderRadius: "50%" }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.08, 1],
                          }
                    }
                    transition={{
                      duration: 3 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.15,
                    }}
                  />

                  {/* Hover illustration */}
                  <Motion.img
                    src={circle.image.src}
                    alt={circle.image.alt}
                    className="pointer-events-none absolute transition-[width,height,left,top] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      width: 130 * scaleFactor,
                      height: 130 * scaleFactor,
                      left: circle.image.left * scaleFactor,
                      top: circle.image.top * scaleFactor,
                    }}
                    initial={false}
                    animate={
                      isLg
                        ? hoveredCircle === circle.path
                          ? { opacity: 1, scale: 1, y: 0 }
                          : { opacity: 0, scale: 0.85, y: 25 }
                        : { opacity: 1, scale: 1, y: 0 }
                    }
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  />

                  {/* Nav text: Exact original position preserved without transform interference */}
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translate(
                        ${textPos.x * scaleFactor}px,
                        ${textPos.y * scaleFactor}px
                      )`,
                    }}
                  >
                    <Motion.div
                      className="z-50"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isTextVisible ? 1 : 0,
                      }}
                      transition={
                        isTextVisible
                          ? isLg
                            ? { duration: 0.25, delay: 0, ease: "easeOut" }
                            : {
                                duration: 0.55,
                                delay: textDelay,
                                ease: "easeOut",
                              }
                          : {
                              duration: 0.22,
                              delay: 0, // all fade out together when returning to LG!
                              ease: "easeOut",
                            }
                      }
                    >
                      <SvgText
                        scale={scaleFactor}
                        isLg={isLg}
                        isMd={isMd}
                        isSm={isSm}
                      >
                        {circle.name}
                      </SvgText>
                    </Motion.div>
                  </div>
                </Motion.div>
              </Motion.div>
            </Link>
          );
        })}
    </div>
  );
}
