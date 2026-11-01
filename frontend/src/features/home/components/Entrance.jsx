import { useLayoutEffect, useState, useRef } from "react";

/**
 * Timing and helpers for the home-page entrance. Put this file next to burst.js and circlesData.js.
 *
 *   0.00s  the avatar starts falling from above the screen
 *   0.70s  first touchdown: squash, spring back, three shrinking hops (see Avatar.jsx).
 *          This is also the moment the circles get launched from the left and right edges.
 *   ~2.2s  everything has settled
 */

export const FALL_TIME = 0.7; // seconds the avatar spends falling
export const BOUNCE_TIME = 1.5; // seconds of squash + hops after it first touches down
export const AVATAR_SETTLED = FALL_TIME + BOUNCE_TIME;

export const CIRCLES_START = FALL_TIME; // circles are launched by the first impact

/* ── Circles sweeping in from the sides ───────────────────────────── */

export const SIDE_TIME = 1.05; // seconds a circle takes from launch to fully settled
const LAND = 0.62; // fraction of SIDE_TIME at which it first reaches its spot
export const SIDE_LAND = SIDE_TIME * LAND;

const SQUASH_TIMES = [0, 0.35, LAND, 0.82, 1];
const SWEEP_EASE = [[0.22, 0.61, 0.36, 1], "easeInOut"]; // glide in fast, overshoot a touch, ease back

/**
 * Measures the stage once (where it sits on screen and how big it is) and then never changes,
 * so a re-render or a window resize can never replay the entrance.
 * Returns null until it has measured.
 */
export function useStageFrame(stageRef, box = null, reduceMotion = false) {
  const [frame, setFrame] = useState(null);
  const hasMeasured = useRef(false);

  useLayoutEffect(() => {
    if (reduceMotion || hasMeasured.current || !stageRef.current) return;
    // Only measure when the element has actual dimensions (visible)
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    hasMeasured.current = true;
    setFrame({
      left: rect.left,
      w: box?.w || rect.width,
      h: box?.h || rect.height,
      viewportW: document.documentElement.clientWidth || window.innerWidth,
    });
  }, [reduceMotion, stageRef]);

  return frame;
}

/**
 * Works out where a circle should start so that it enters from the screen edge on its own side.
 *  - circles left of the stage's middle come from the left edge, the others from the right edge
 *  - circles high up start a little higher, low ones a little lower, so each one sweeps in on a gentle diagonal
 *  - big circles roll in: the further it travels, the more it turns
 *
 * `circle` is the circle's centre (cx, cy) and diameter (size), all in px inside the stage.
 */
export function makeSideEntry({ cx, cy, size }, frame, { roll = true } = {}) {
  const side = cx < frame.w / 2 ? -1 : 1;
  const margin = 40;

  const x =
    side < 0
      ? -(frame.left + cx + size / 2 + margin) // right edge of the circle just past the left of the screen
      : frame.viewportW - (frame.left + cx - size / 2) + margin; // left edge just past the right of the screen

  const y = ((cy - frame.h / 2) / frame.h) * 180;

  const degrees = Math.min(Math.max((Math.abs(x) / (size / 2)) * (180 / Math.PI), 200), 420);
  return { side, x, y, rotate: roll ? side * degrees : 0 };
}

/**
 * Props to spread on a motion.div: { initial, animate, transition }.
 *
 * The circle glides in, overshoots its spot slightly and settles back. While it travels it is stretched
 * along its path, and when it stops it squashes and wobbles back to a perfect circle, the same
 * elastic feel as the avatar.
 */
export function sideMotion(entry, delay) {
  const { side, x, y, rotate } = entry;
  const times = [0, LAND, 1];

  const initial = { x, y, opacity: 0, scaleX: 1.3, scaleY: 0.8 };
  const animate = {
    x: [x, -side * 18, 0],
    y: 0,
    opacity: 1,
    scaleX: [1.3, 1.12, 0.84, 1.08, 1],
    scaleY: [0.8, 0.92, 1.16, 0.96, 1],
  };
  const transition = {
    x: { duration: SIDE_TIME, delay, times, ease: SWEEP_EASE },
    y: { duration: SIDE_LAND, delay, ease: [0.4, 0, 0.2, 1] },
    opacity: { duration: 0.15, delay },
    scaleX: { duration: SIDE_TIME, delay, times: SQUASH_TIMES },
    scaleY: { duration: SIDE_TIME, delay, times: SQUASH_TIMES },
  };

  if (rotate !== 0) {
    initial.rotate = rotate;
    animate.rotate = [rotate, -side * 10, 0];
    transition.rotate = { duration: SIDE_TIME, delay, times, ease: SWEEP_EASE };
  }

  return { initial, animate, transition };
}