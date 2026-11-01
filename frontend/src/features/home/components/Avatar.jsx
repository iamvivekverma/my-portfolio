import { useEffect, useRef, useState } from "react";
import {
  motion as Motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { WOW_FEATURES_SVG } from "../wowFeatures";
import { FALL_TIME, BOUNCE_TIME, AVATAR_SETTLED } from "./Entrance";

/**
 * The hero character, drawn in code so it can act.
 *
 *  - It arrives like an elastic ball: it falls from above the screen, hits the ground and gets squashed flat,
 *    springs back (stretching as it launches), then hops three more times, each hop lower and each squash gentler.
 *  - Its eyes follow your cursor (and wander around by themselves when nothing is moving).
 *  - It blinks, and now and then lifts its eyebrows.
 *  - When it gets excited (you hover or tap it, hover a page circle, or when it first says hello)
 *    it swaps to your original "wow" drawing (woww.svg: googly eyes, a big grin with buck teeth,
 *    a sprout of hair) with a squash-and-stretch bounce and a little shake.
 *
 * It sizes itself to whatever box you give it through `className`.
 */

const INK = "#513229";
const FACE = "#fdcb6e";
const BLUSH = "#c85f17";
const WHITE = "#fdfdfd";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const random = (min, max) => min + Math.random() * (max - min);

const pop = { type: "spring", stiffness: 380, damping: 20 };

/* ── The elastic landing ───────────────────────────────────────────
 * Gravity as easing curves: these two cubic-beziers are exactly t² (falling) and its mirror (rising),
 * so the ball speeds up on the way down and slows to a stop at the top of each hop.
 */
const GRAVITY_IN = [1 / 3, 0, 2 / 3, 1 / 3];
const GRAVITY_OUT = [1 / 3, 2 / 3, 2 / 3, 1];

// How high it travels: [seconds after the first touchdown, height as % of the avatar's own height (negative = up)].
// To change the number of hops, add or remove a "touchdown / hold / top of hop" triple here and in Y_EASE.
const Y_PATH = [
  [0.0, 0],
  [0.15, 0],
  [0.34, -20],
  [0.59, 0],
  [0.65, 0],
  [0.84, -8],
  [1.02, 0],
  [1.06, 0],
  [1.19, -3],
  [1.32, 0],
  [1.42, 0],
];
// One easing per segment above (hold, up, down, hold, up, down, hold, up, down, hold)
const Y_EASE = [
  "linear",
  GRAVITY_OUT,
  GRAVITY_IN,
  "linear",
  GRAVITY_OUT,
  GRAVITY_IN,
  "linear",
  GRAVITY_OUT,
  GRAVITY_IN,
  "linear",
];

// The rubber: [seconds after first touchdown, scaleX, scaleY].
// Stretched tall while falling, flattened hard on impact (scaleY 0.5), stretched again as it springs up,
// then every touchdown squashes a little less.
const SQUASH_PATH = [
  [0.0, 0.96, 1.06],
  [0.15, 1.36, 0.58],
  [0.25, 0.86, 1.18],
  [0.34, 1.0, 1.0],
  [0.51, 0.98, 1.03],
  [0.59, 0.97, 1.05],
  [0.65, 1.16, 0.84],
  [0.71, 0.95, 1.08],
  [0.84, 1.0, 1.0],
  [0.96, 0.98, 1.03],
  [1.02, 0.98, 1.03],
  [1.06, 1.07, 0.93],
  [1.12, 0.98, 1.03],
  [1.19, 1.0, 1.0],
  [1.32, 1.03, 0.97],
  [1.42, 1.0, 1.0],
];

const yTimes = Y_PATH.map(([t]) => t / BOUNCE_TIME);
const squashTimes = SQUASH_PATH.map(([t]) => t / BOUNCE_TIME);

const BOUNCE_START = { y: "0%", scaleX: SQUASH_PATH[0][1], scaleY: SQUASH_PATH[0][2] };
const BOUNCE_ANIMATE = {
  y: Y_PATH.map(([, y]) => `${y}%`),
  scaleX: SQUASH_PATH.map(([, sx]) => sx),
  scaleY: SQUASH_PATH.map(([, , sy]) => sy),
};
const BOUNCE_REST = { y: "0%", scaleX: 1, scaleY: 1 };

const bounceTransition = (delay) => ({
  y: {
    duration: BOUNCE_TIME,
    delay,
    times: yTimes,
    ease: Y_EASE,
  },
  scaleX: {
    duration: BOUNCE_TIME,
    delay,
    times: squashTimes,
    ease: "easeInOut",
  },
  scaleY: {
    duration: BOUNCE_TIME,
    delay,
    times: squashTimes,
    ease: "easeInOut",
  },
});

export default function Avatar({ wow = false, onHover, className = "" }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const lastPointerMove = useRef(0);
  const tapTimer = useRef(null);

  // How far above its resting place it starts, so it's always fully off the top of the screen
  const [fallPx] = useState(() => (typeof window === "undefined" ? 900 : window.innerHeight * 1.2));

  const [greeting, setGreeting] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [blink, setBlink] = useState(!reduceMotion); // starts with eyes closed, then opens
  const [browLift, setBrowLift] = useState(false);
  const squash = useAnimationControls();

  const excited = wow || greeting || tapped;

  /* ── Where it's looking ─────────────────────────────────────── */
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const smoothX = useSpring(lookX, { stiffness: 110, damping: 15, mass: 0.7 });
  const smoothY = useSpring(lookY, { stiffness: 110, damping: 15, mass: 0.7 });
  const faceX = useTransform(smoothX, (v) => v * 8);
  const faceY = useTransform(smoothY, (v) => v * 6);
  const eyeX = useTransform(smoothX, (v) => v * 5);
  const eyeY = useTransform(smoothY, (v) => v * 5);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const onMove = (event) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = (event.clientX - (box.left + box.width / 2)) / (window.innerWidth * 0.5);
      const dy = (event.clientY - (box.top + box.height / 2)) / (window.innerHeight * 0.5);
      lookX.set(clamp(dx, -1, 1));
      lookY.set(clamp(dy, -1, 1));
      lastPointerMove.current = Date.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Nothing moving? Look around, like it's curious.
    const wander = window.setInterval(() => {
      if (Date.now() - lastPointerMove.current > 2500) {
        lookX.set(random(-0.9, 0.9));
        lookY.set(random(-0.5, 0.6));
      }
    }, 1700);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearInterval(wander);
    };
  }, [reduceMotion, lookX, lookY]);

  /* ── Blinking, eyebrows, saying hello ───────────────────────── */
  useEffect(() => {
    if (reduceMotion) return undefined;
    const timers = [];
    const later = (fn, seconds) => timers.push(window.setTimeout(fn, seconds * 1000));

    // Eyes pop open as it flies up from the first hit
    later(() => setBlink(false), FALL_TIME + 0.45);

    const blinkLoop = () => {
      later(() => {
        setBlink(true);
        later(() => {
          setBlink(false);
          blinkLoop();
        }, 0.13);
      }, random(2.2, 5.2));
    };
    later(blinkLoop, FALL_TIME + 1.4);

    const browLoop = () => {
      later(() => {
        setBrowLift(true);
        later(() => {
          setBrowLift(false);
          browLoop();
        }, 0.65);
      }, random(3.5, 7));
    };
    later(browLoop, AVATAR_SETTLED + 0.4);

    // Say hello once the last hop is done
    later(() => setGreeting(true), AVATAR_SETTLED + 0.1);
    later(() => setGreeting(false), AVATAR_SETTLED + 2);

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reduceMotion]);

  // Every time it gets excited, it bounces.
  useEffect(() => {
    if (excited && !reduceMotion) {
      squash.start({
        scaleX: [1, 1.1, 0.96, 1],
        scaleY: [1, 0.88, 1.07, 1],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
  }, [excited, reduceMotion, squash]);

  useEffect(() => () => window.clearTimeout(tapTimer.current), []);

  // A tap (touch screens have no hover) makes it happy for a moment.
  const handleTap = () => {
    setTapped(true);
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => setTapped(false), 1300);
  };

  const handleEnter = (event) => {
    if (event.pointerType === "mouse") onHover?.(true);
  };
  const handleLeave = (event) => {
    if (event.pointerType === "mouse") onHover?.(false);
  };

  return (
    <div ref={rootRef} className={`pointer-events-none relative ${className}`}>
      {/* 1. The fall: from above the screen, speeding up like a real falling ball */}
      <Motion.div
        className="h-full w-full"
        initial={reduceMotion ? false : { y: -fallPx }}
        animate={{ y: 0 }}
        transition={{ duration: FALL_TIME, ease: GRAVITY_IN }}
      >
        {/* 2. The landing: squash flat, spring back, then three shrinking hops. Squashes against its own bottom edge. */}
        <Motion.div
          className="h-full w-full"
          style={{ originY: 0.98 }}
          initial={reduceMotion ? false : BOUNCE_START}
          animate={reduceMotion ? BOUNCE_REST : BOUNCE_ANIMATE}
          transition={reduceMotion ? undefined : bounceTransition(FALL_TIME)}
        >
          {/* Float (starts once it has stopped bouncing) */}
          <Motion.div
            className="h-full w-full"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -8, 0],
                    rotate: [0, 0.8, -0.8, 0],
                  }
            }
            transition={{
              y: {
                duration: 3.8,
                repeat: Infinity,
                ease: [0.37, 0, 0.63, 1],
                delay: AVATAR_SETTLED,
              },
              rotate: {
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: AVATAR_SETTLED,
              },
            }}
          >
            {/* Squash and stretch (when it gets excited) */}
            <Motion.div className="h-full w-full" style={{ originY: 0.92 }} animate={squash}>
              <svg
                viewBox="0 0 300 300"
                className="block h-full w-full overflow-visible"
                style={{ pointerEvents: "none" }}
                role="img"
                aria-label="Vivek's illustrated avatar, a friendly yellow face that follows your cursor"
              >

                <g
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                  onPointerEnter={handleEnter}
                  onPointerLeave={handleLeave}
                  onPointerDown={handleTap}
                >
                  <circle cx="150" cy="150" r="143.7" fill={FACE} />

                  {/* Everything on the face drifts a little toward where it's looking */}
                  <Motion.g style={{ x: faceX, y: faceY }}>
                    {/* Blush */}
                    <Motion.ellipse
                      cx="66"
                      cy="203"
                      fill={BLUSH}
                      animate={{ rx: 14, ry: 8, opacity: excited ? 0 : 1 }}
                      transition={pop}
                    />
                    <Motion.ellipse
                      cx="234"
                      cy="203"
                      fill={BLUSH}
                      animate={{ rx: 14, ry: 8, opacity: excited ? 0 : 1 }}
                      transition={pop}
                    />

                    {/* Calm face */}
                    <Motion.g animate={{ opacity: excited ? 0 : 1, y: excited ? 8 : 0 }} transition={{ opacity: { duration: 0.12 }, y: pop }}>
                      <Motion.g
                        animate={{ y: browLift ? -8 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <path d="M42 121 Q70 86 108 95" stroke={INK} strokeWidth="13" strokeLinecap="round" fill="none" />
                        <path d="M192 95 Q230 86 258 121" stroke={INK} strokeWidth="13" strokeLinecap="round" fill="none" />
                      </Motion.g>

                      <Motion.g style={{ x: eyeX, y: eyeY }}>
                        <Motion.ellipse cx="86" cy="164" rx="18.5" fill={INK} animate={{ ry: blink ? 1.5 : 27 }} transition={{ duration: 0.09 }} />
                        <Motion.ellipse cx="214" cy="164" rx="18.5" fill={INK} animate={{ ry: blink ? 1.5 : 27 }} transition={{ duration: 0.09 }} />
                        <Motion.g animate={{ opacity: blink ? 0 : 1 }} transition={{ duration: 0.05 }}>
                          <circle cx="79" cy="151" r="5.5" fill={WHITE} />
                          <circle cx="207" cy="151" r="5.5" fill={WHITE} />
                        </Motion.g>
                      </Motion.g>

                      <circle cx="150" cy="203" r="11" fill={INK} />
                    </Motion.g>

                    {/* Excited face: your original drawing, taken straight from woww.svg. It pops in with a little shake. */}
                    <Motion.g
                      animate={{
                        opacity: excited ? 1 : 0,
                        y: excited ? 0 : -8,
                        x: excited && !reduceMotion ? [0, -3, 3, -2, 0] : 0,
                      }}
                      transition={{ opacity: { duration: 0.12 }, y: pop, x: { duration: 0.45 } }}
                      dangerouslySetInnerHTML={{ __html: WOW_FEATURES_SVG }}
                    />
                  </Motion.g>
                </g>
              </svg>
            </Motion.div>
          </Motion.div>
        </Motion.div>
      </Motion.div>
    </div>
  );
}