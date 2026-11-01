import { useRef } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import Avatar from "./Avatar";

import { NAV_GAP, DOT_GAP } from "../burst";
import {
  CIRCLES_START,
  SIDE_LAND,
  makeSideEntry,
  sideMotion,
  useStageFrame,
} from "./Entrance";

import {
  NAV_CIRCLES,
  BASE_SIZE,
  MOBILE_NAV,
  MOBILE_DOTS,
  MOBILE_AVATAR_WIDTH,
  POP_ORDER,
} from "../circlesData";

// Only below SM: increase circle and dot sizes by 8%.
const SMALL_SCREEN_SCALE = 1.08;

/**
 * Increase the circle's size while keeping its center in place.
 *
 * left and size are percentages of the stage width.
 * top is a percentage of the stage height.
 *
 * The stage ratio is 100:140, so vertical compensation differs
 * from horizontal compensation.
 */
function scaleMobileCircle(left, top, size) {
  const scaledSize = size * SMALL_SCREEN_SCALE;
  const growth = scaledSize - size;

  return {
    left: left - growth / 2,
    top: top - growth / 2.8,
    size: scaledSize,
  };
}

/**
 * Responsive home stage for screens below 640px.
 *
 * Preserves entrance animation on fresh load, and skips it once
 * already settled so screen resize never replays entrance animations.
 */
export default function MobileStage({ wow, setWow, isSettled }) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef(null);
  const frame = useStageFrame(stageRef, null, reduceMotion);

  const ready = reduceMotion || isSettled || frame !== null;

  // Cache motions so re-renders don't recreate keyframe arrays
  const motionCacheRef = useRef(new Map());

  const motionFor = (
    key,
    left,
    top,
    size,
    delay,
    options = {},
  ) => {
    if (reduceMotion || isSettled || !frame) return {};

    if (motionCacheRef.current.has(key)) {
      return motionCacheRef.current.get(key);
    }

    const sizePx = (frame.w * size) / 100;

    const entry = makeSideEntry(
      {
        cx: (frame.w * (left + size / 2)) / 100,
        cy: (frame.h * top) / 100 + sizePx / 2,
        size: sizePx,
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
      ref={stageRef}
      className="relative aspect-[100/140]"
      style={{
        height:
          "max(14rem, min(calc(100svh - 9rem), calc(1.4 * min(calc(100vw - 2rem), 52rem))))",
        containerType: "inline-size",
      }}
    >
      {/* Centered avatar */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${MOBILE_AVATAR_WIDTH}%`,
        }}
      >
        <Avatar
          wow={wow}
          onHover={setWow}
          isSettled={isSettled}
          className="aspect-square w-full"
        />
      </div>

      {/* Decorative floating dots */}
      {ready &&
        MOBILE_DOTS.map((dot, index) => {
          const scaled = scaleMobileCircle(
            dot.left,
            dot.top,
            dot.size,
          );
          const entranceProps = motionFor(
            `mob-dot-${index}`,
            scaled.left,
            scaled.top,
            scaled.size,
            CIRCLES_START + 0.2 + index * DOT_GAP,
            { roll: false },
          );

          return (
            <Motion.div
              key={`dot-${index}`}
              className="absolute z-10 aspect-square"
              style={{
                width: `${scaled.size}%`,
                top: `${scaled.top}%`,
                left: `${scaled.left}%`,
              }}
              initial={isSettled ? false : entranceProps.initial}
              animate={isSettled ? undefined : entranceProps.animate}
              transition={isSettled ? undefined : entranceProps.transition}
            >
              <Motion.div
                className={`h-full w-full rounded-full ${
                  dot.special
                    ? "bg-[#ffa102]"
                    : "bg-[#fdcb6e]"
                }`}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        y: [0, -8 - index * 2, 0],
                        x: [
                          0,
                          index % 2 === 0 ? 6 : -6,
                          0,
                        ],
                      }
                }
                transition={{
                  duration: 2 + index * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Motion.div>
          );
        })}

      {/* Four navigation circles */}
      {ready &&
        NAV_CIRCLES.map((circle, index) => {
          const place = MOBILE_NAV[circle.path];

          const scaled = scaleMobileCircle(
            place.left,
            place.top,
            place.size,
          );

          const popDelay =
            CIRCLES_START +
            POP_ORDER.indexOf(circle.path) * NAV_GAP;

          const entranceProps = motionFor(
            `mob-nav-${circle.path}`,
            scaled.left,
            scaled.top,
            scaled.size,
            popDelay,
            { roll: false },
          );

          return (
            <Motion.div
              key={circle.path}
              className="absolute z-20 aspect-square"
              style={{
                width: `${scaled.size}%`,
                top: `${scaled.top}%`,
                left: `${scaled.left}%`,
              }}
              initial={isSettled ? false : entranceProps.initial}
              animate={isSettled ? undefined : entranceProps.animate}
              transition={isSettled ? undefined : entranceProps.transition}
            >
              {/* Landing ripple */}
              {!reduceMotion && !isSettled && (
                <Motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#93e190]"
                  initial={{
                    scale: 1,
                    opacity: 0.8,
                  }}
                  animate={{
                    scale: 1.8,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: popDelay + SIDE_LAND,
                    ease: "easeOut",
                  }}
                />
              )}

              <Link
                to={circle.path}
                className="block h-full w-full"
                aria-label={circle.name}
              >
                <Motion.div
                  className="relative h-full w-full rounded-full bg-[#93e190] transition-transform duration-150 active:scale-95"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          y: [
                            0,
                            -7 - index * 2,
                            0,
                          ],
                          x: [
                            0,
                            index % 2 === 0 ? 5 : -5,
                            0,
                          ],
                        }
                  }
                  transition={{
                    duration: 2.5 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                >
                  {/* Circle illustration */}
                  <img
                    src={circle.image.src}
                    alt=""
                    className="absolute block"
                    style={{
                      width: `${(130 / BASE_SIZE) * 100}%`,
                      height: `${(130 / BASE_SIZE) * 100}%`,
                      left: `${(circle.image.left / BASE_SIZE) * 100}%`,
                      top: `${(circle.image.top / BASE_SIZE) * 100}%`,
                    }}
                  />

                  {/* Navigation label */}
                  <span
                    className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${50 + place.label.x * 100}%`,
                      top: `${50 + place.label.y * 100}%`,
                    }}
                  >
                    <Motion.span
                      className="block whitespace-nowrap font-bold leading-none text-primary select-none"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "7.4cqw",
                        WebkitTextStroke: "0.29em #fff7e7",
                        paintOrder: "stroke fill",
                      }}
                      initial={
                        reduceMotion || isSettled
                          ? false
                          : {
                              opacity: 0,
                              scale: 0.2,
                              y: -16,
                            }
                      }
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      transition={
                        isSettled
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 220,
                              damping: 13,
                              delay:
                                popDelay + SIDE_LAND + 0.05,
                            }
                      }
                    >
                      {circle.name}
                    </Motion.span>
                  </span>
                </Motion.div>
              </Link>
            </Motion.div>
          );
        })}
    </div>
  );
}
