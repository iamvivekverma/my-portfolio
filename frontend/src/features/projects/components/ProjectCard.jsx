import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  MotionConfig,
  motion as Motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaLock, FaTimes } from 'react-icons/fa';

import { useProjects } from '../../../hooks/usePortfolioData';
import { buildApiUrl } from '../../../services/api';

/*
  PROJECT SHOWCASE
  A fan of cards that opens into a detail dialog. Built from the same ideas as the work showcase,
  wired to your own data (useProjects), your router and your Tailwind tokens.

  The rule this file is built around: no scrolling. ProjectsSection gives this component whatever
  height is left between the sliding text and the footer. We measure that box and size the whole
  fan to fit inside it (see computeFan), so the cards get bigger on tall screens and smaller on
  short ones, and nothing is ever cut off.
  (Below `lg` the section only has a minimum height, so a very short phone can still scroll a
  little. That is on purpose: tiny cards would be worse.)
*/

/* ------------------------------------------------------------------ */
/* Look                                                                */
/* ------------------------------------------------------------------ */

/*
  Each project gets a card colour. Give a project a `tint` (a 6-digit hex like "#1f7a3d") in your
  admin and that wins. Without one, colours are handed out in this order, so neighbours never match.
  Text on the card turns white or dark by itself, depending on how bright the colour is.
*/
const PALETTE = [
  '#ff2d2d',
  '#1f7a3d',
  '#f59e0b',
  '#2563eb',
  '#e04a15',
  '#6be83c',
  '#7c3aed',
  '#0f766e',
];

// Same badge colours you already used on the old cards.
const BADGE = {
  'NDA – Confidential': 'bg-primary/10 text-primary',
  'Case-study': 'bg-violet-100 text-violet-700',
  'Open source': 'bg-emerald-100 text-emerald-700',
};

/*
  Locked (PIN protected) projects only show what the old cards showed: title, badge and image.
  The description and technologies stay hidden until the visitor unlocks the case study.
  Set this to true if you want them visible in the dialog for locked projects too.
*/
const REVEAL_LOCKED_DETAILS = false;
const LOCKED_BLURB = 'A protected case study. Open it and enter the PIN to read the full story.';

const FOCUSABLE = 'a[href], button:not([tabindex="-1"]):not([disabled])';
const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const EMPTY = [];
const HEX = /^#[0-9a-f]{6}$/i;

// Cache-buster for images that have no updatedAt. Created once, so it never changes between renders.
const STAMP = Date.now();

function toList(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const names = list
    .filter((entry) => entry !== null && entry !== undefined)
    .map((entry) => String(entry?.name ?? entry).trim())
    .filter(Boolean);
  return [...new Set(names)];
}

// true when dark text reads better on this colour
function wantsDarkText(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
}

function toProject(item, index) {
  const locked = Boolean(item.isLocked);
  const hide = locked && !REVEAL_LOCKED_DETAILS;
  const tint = HEX.test(item.tint || '') ? item.tint : PALETTE[index % PALETTE.length];
  const stamp = item.updatedAt || item.lastModified || STAMP;

  return {
    id: String(item._id ?? index),
    title: item.title || 'Untitled project',
    kind: item.badge || 'Web project',
    blurb: hide ? LOCKED_BLURB : item.description || '',
    tech: hide ? EMPTY : toList(item.technologies),
    locked,
    tint,
    darkText: wantsDarkText(tint),
    image: item._id
      ? `${buildApiUrl(`/projects/${item._id}/image`)}?v=${encodeURIComponent(stamp)}`
      : null,
  };
}

/*
  Font size of a project name, in cqw (1% of the card width). Long names and long words shrink a
  little so they stay inside the card.
*/
function nameSize(title) {
  const longest = Math.max(1, ...title.split(/\s+/).map((word) => word.length));
  const byWord = 160 / longest;
  const byLength = title.length > 28 ? 9.5 : title.length > 18 ? 12 : 14;
  return Math.max(7.5, Math.min(byWord, byLength));
}

/* ------------------------------------------------------------------ */
/* Fan geometry                                                        */
/* ------------------------------------------------------------------ */

const ASPECT = 1.55; // card height / card width, same portrait ratio as the showcase
const TILT_STEP = 7.5; // degrees between neighbouring cards
const MAX_TILT = 19; // the outer card never tilts more than this, however many projects there are
const SAG_STEP = 0.048; // how far cards drop per step squared, in card widths
const MAX_SAG = 0.3; // the outer card never drops more than this
const MAX_SPREAD = 0.7; // sideways distance between neighbours, in card widths (at most)
const MIN_SPREAD = 0.24; // ... and at least, when many cards share a narrow screen
const CARD_MAX = 280; // px
const CARD_MIN = 100; // px
const EDGE = 12; // px of breathing room

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/*
  Works out how big the cards can be so the whole fan fits a box of boxW x boxH pixels, and where
  every card goes. Positions are offsets of the card CENTRE from the centre of the box.

  Everything scales with the card width, so we first measure the fan in "card widths" (tilt makes
  the outer cards taller and wider than the middle ones), then divide the box by that.
  With many projects the tilt and drop are capped and the cards overlap more, so the fan gets
  denser instead of wider.
*/
function computeFan(count, boxW, boxH) {
  const half = (count - 1) / 2;
  const tilt = half ? Math.min(TILT_STEP, MAX_TILT / half) : 0;
  const sag = half ? Math.min(SAG_STEP, MAX_SAG / (half * half)) : 0;

  const slots = Array.from({ length: count }, (_, index) => {
    const t = index - half;
    return { t, rot: t * tilt, drop: t * t * sag };
  });

  let top = Infinity;
  let bottom = -Infinity;
  let widest = 0;
  slots.forEach(({ rot, drop }) => {
    const r = (Math.abs(rot) * Math.PI) / 180;
    const halfH = (ASPECT * Math.cos(r) + Math.sin(r)) / 2;
    top = Math.min(top, drop - halfH);
    bottom = Math.max(bottom, drop + halfH);
    widest = Math.max(widest, Math.cos(r) + ASPECT * Math.sin(r));
  });

  const byHeight = (boxH - EDGE) / (bottom - top);
  const byWidth = (boxW - EDGE) / (widest + (count - 1) * MIN_SPREAD);
  const w = clamp(Math.min(byHeight, byWidth, CARD_MAX), CARD_MIN, CARD_MAX);

  const room = count > 1 ? (boxW - EDGE - widest * w) / (count - 1) : 0;
  const spread = count > 1 ? clamp(room, MIN_SPREAD * w, MAX_SPREAD * w) : 0;
  const shift = -((top + bottom) / 2) * w; // centres the fan vertically in the box

  return {
    w,
    h: w * ASPECT,
    shift,
    stackY: shift + w * 0.12, // where the cards wait before they fan out
    cards: slots.map(({ t, rot, drop }) => ({
      t,
      rot,
      x: t * spread,
      y: drop * w + shift,
      delay: Math.round(Math.abs(t) * 70),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Card shadows                                                        */
/* ------------------------------------------------------------------ */

/*
  One soft shadow is never enough, so each card gets a stack of layers: a hairline edge, a faint
  top highlight, four black layers that grow in offset and blur (so there is no hard edge anywhere),
  and a wide glow in the card's own colour.

  A box-shadow rotates together with its card, which makes tilted cards cast shadows sideways.
  buildShadow() counter-rotates every offset so all shadows fall straight down, as if one light
  hung above the whole fan.

  soft: [offsetY, blur, spread, alpha]   glow: [offsetY, blur, spread, alpha]
  Rest and lift must keep the same number of layers so the hover can animate.
*/
const SHADOW_REST = {
  soft: [
    [2, 3, 0, 0.05],
    [6, 10, 0, 0.06],
    [14, 24, 0, 0.07],
    [30, 50, -8, 0.12],
  ],
  glow: [56, 90, -22, 0.36],
};

const SHADOW_LIFT = {
  soft: [
    [3, 4, 0, 0.05],
    [10, 16, 0, 0.07],
    [24, 40, 0, 0.08],
    [44, 70, -8, 0.14],
  ],
  glow: [72, 110, -24, 0.55],
};

const alphaHex = (a) =>
  Math.round(a * 255)
    .toString(16)
    .padStart(2, '0');

function buildShadow(deg, { soft, glow }, tint) {
  const rad = (deg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const layer = (y, blur, spread, color) =>
    `${(y * sin).toFixed(1)}px ${(y * cos).toFixed(1)}px ${blur}px ${spread}px ${color}`;
  const glowColor = HEX.test(tint) ? `${tint}${alphaHex(glow[3])}` : 'rgba(0,0,0,.2)';

  return [
    '0 0 0 1px rgba(0,0,0,.06)',
    'inset 0 1px 0 rgba(255,255,255,.28)',
    ...soft.map(([y, blur, spread, a]) => layer(y, blur, spread, `rgba(0,0,0,${a})`)),
    layer(glow[0], glow[1], glow[2], glowColor),
  ].join(', ');
}

/* ------------------------------------------------------------------ */
/* Dialog transitions                                                  */
/* ------------------------------------------------------------------ */

/*
  `d` is the direction: 1 = going forward (content moves in from the right), -1 = going back.
  AnimatePresence `custom` keeps the exit direction correct.
*/
const headerFade = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const textSlide = {
  enter: (d = 1) => ({ opacity: 0, x: d * 28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE, delay: 0.05 } },
  exit: (d = 1) => ({ opacity: 0, x: d * -28, transition: { duration: 0.2 } }),
};

const bodySlide = {
  enter: (d = 1) => ({ opacity: 0, x: d * 32 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.06, delayChildren: 0.08 },
  },
  exit: (d = 1) => ({ opacity: 0, x: d * -32, transition: { duration: 0.2 } }),
};

const rise = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const chipList = {
  enter: {},
  center: { transition: { staggerChildren: 0.05 } },
  exit: {},
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/**
  Art: the coloured face of a project, used on the fan cards and inside the dialog.
  @param {Object} props.p - Project (see toProject)
  @param {string|null} props.image - Image URL, or null when there is none (or it failed to load)
  @param {boolean} props.isModal - True inside the open dialog, false on a fan card
  @param {number} props.dir - Direction of the last navigation (1 or -1), for the text slide

  Layout:
  - Fan card: fills its card. Type on top, the image in a window below it that runs off the bottom edge.
  - Dialog, below `md`: a compact coloured header in normal flow (type only, no image, so the whole
    dialog fits a phone screen). To change its height edit `min-h-[7.75rem]` below.
  - Dialog, `md` and up: fills the left panel, type on top and a bigger image window below.

  All type is sized in cqw (a share of the card's own width), so one design works at every card size.
  --k is the small label, --n the project name.
*/
function Art({ p, image, onImageError, isModal = false, dir = 1 }) {
  const tone = p.darkText ? 'text-neutral-900' : 'text-white';

  const s = isModal
    ? {
        root: 'relative md:absolute md:inset-0 md:flex md:flex-col',
        text: 'relative flex min-h-[7.75rem] flex-col justify-between gap-3 px-6 py-5 sm:px-10 sm:py-6 md:block md:min-h-0 md:shrink-0 md:gap-0 md:p-[9cqw] md:pb-[5cqw]',
        kind: 'pr-12 text-sm sm:text-base md:pr-0 md:text-[length:var(--k)]',
        name: 'line-clamp-3 text-[2rem] sm:text-[2.5rem] md:mt-[2cqw] md:text-[length:var(--n)]',
        image: 'hidden md:block',
      }
    : {
        root: 'absolute inset-0 flex flex-col',
        text: 'shrink-0 p-[9cqw] pb-[5cqw]',
        kind: 'text-[length:var(--k)]',
        name: 'mt-[2cqw] line-clamp-3 text-[length:var(--n)]',
        image: 'block',
      };

  return (
    <div
      className={`${s.root} text-left [container-type:inline-size]`}
      style={{
        background: p.tint,
        '--k': 'max(6cqw, 10px)',
        '--n': `${nameSize(p.title)}cqw`,
      }}
    >
      {isModal ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(255,255,255,.22),transparent_55%)] md:hidden"
        />
      ) : null}

      <Motion.div
        className={`${s.text} ${tone}`}
        variants={isModal ? textSlide : undefined}
        custom={isModal ? dir : undefined}
      >
        <p className={`${s.kind} font-medium opacity-70`}>
          {p.locked ? (
            <FaLock
              aria-hidden="true"
              size="0.85em"
              style={{ display: 'inline', marginRight: '0.45em', verticalAlign: '-0.1em' }}
            />
          ) : null}
          {p.kind}
        </p>
        <p
          className={`${s.name} pb-[.1em] font-semibold leading-[.95] tracking-[-.05em] [overflow-wrap:anywhere]`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {p.title}
        </p>
      </Motion.div>

      {image ? (
        <div className={`${s.image} min-h-0 flex-1 px-[9cqw]`}>
          {/*
            The window crops any picture to the same shape. object-top keeps the top of a page
            screenshot in view; switch to object-contain if your pictures are device mockups.
            drop-shadow follows transparent pixels, so it also suits PNGs with a see-through background.
          */}
          <img
            src={image}
            alt={isModal ? p.title : ''}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={onImageError}
            className="block h-full w-full object-cover object-top"
            style={{
              borderRadius: '5cqw 5cqw 0 0',
              filter: 'drop-shadow(0 3cqw 6cqw rgba(0,0,0,.3))',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

/* Page indicator: the active dot stretches into a pill in the project's colour. */
function Dots({ items, active, onPick }) {
  // Too many dots stop being useful, so past nine we show a counter instead.
  if (items.length > 9) {
    return (
      <p className="min-w-[3.5rem] text-sm tabular-nums text-primary/60">
        {active + 1} / {items.length}
      </p>
    );
  }

  return (
    <div className="flex items-center" role="group" aria-label="Choose a project">
      {items.map((item, index) => {
        const on = index === active;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={`Show ${item.title}`}
            aria-current={on ? 'true' : undefined}
            onClick={() => onPick(index)}
            className="grid h-6 place-items-center rounded-full px-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Motion.span
              initial={false}
              animate={{
                width: on ? 20 : 6,
                backgroundColor: on ? item.tint : 'rgba(128,128,128,.32)',
              }}
              transition={{ duration: 0.4, ease: EASE }}
              className="block h-1.5 rounded-full"
            />
          </button>
        );
      })}
    </div>
  );
}

/* Shown while projects load: a small pulsing deck, which then fans out into the real cards. */
function LoadingDeck({ fan }) {
  return (
    <div aria-hidden="true">
      {[-1, 0, 1].map((k) => (
        <div
          key={k}
          className="absolute left-1/2 top-1/2 animate-pulse rounded-[1.5rem] bg-primary/10 motion-reduce:animate-none"
          style={{
            width: fan.w,
            height: fan.h,
            marginLeft: -fan.w / 2,
            marginTop: -fan.h / 2,
            zIndex: 3 - Math.abs(k),
            transform: `translate(${k * fan.w * 0.14}px, ${fan.shift}px) rotate(${k * 5}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase                                                            */
/* ------------------------------------------------------------------ */

export default function ProjectCard() {
  const { data, loading } = useProjects();
  const raw = Array.isArray(data) ? data : EMPTY;
  const projects = useMemo(() => raw.map(toProject), [raw]);
  const count = projects.length;

  const [open, setOpen] = useState(null);
  const [dir, setDir] = useState(1);
  const [from, setFrom] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [fanned, setFanned] = useState(false);
  const [failed, setFailed] = useState(() => new Set());

  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  const inView = useInView(stageRef, { once: true, amount: 0.3 });
  const reduceMotion = Boolean(useReducedMotion());

  const current = open === null ? null : (projects[open] ?? null);
  const isOpen = current !== null;

  /* ---- Fit: measure the stage and size the fan to it ---- */

  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) =>
        Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
          ? prev
          : { w: width, h: height }
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // While loading we size the fan for five cards, so the layout is settled before data arrives.
  const slots = loading ? 5 : count;
  const fan = useMemo(
    () => (box.w > 0 && slots > 0 ? computeFan(slots, box.w, box.h) : null),
    [slots, box.w, box.h]
  );

  const shadows = useMemo(
    () =>
      fan && !loading
        ? projects.map((p, index) => ({
            rest: buildShadow(fan.cards[index].rot, SHADOW_REST, p.tint),
            lift: buildShadow(fan.cards[index].rot, SHADOW_LIFT, p.tint),
          }))
        : EMPTY,
    [fan, loading, projects]
  );

  /*
    The fan opens once, the first time it is on screen with real cards in it. We wait two frames so
    the cards are painted in their stacked pose first; otherwise the browser has nothing to animate from.
  */
  const ready = inView && !loading && count > 0 && box.w > 0;
  useEffect(() => {
    if (!ready) return undefined;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setFanned(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [ready]);
  const spread = fanned || reduceMotion;

  /* ---- Dialog ---- */

  const step = useCallback(
    (d) => {
      setDir(d);
      setOpen((value) => (value === null ? value : (value + d + count) % count));
    },
    [count]
  );

  const jump = (index) => {
    if (open === null || index === open) return;
    setDir(index > open ? 1 : -1);
    setOpen(index);
  };

  const close = useCallback(() => {
    setOpen(null);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Lock page scroll without the layout jump when the scrollbar disappears.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const onKey = (event) => {
      if (event.key === 'Escape') close();

      // Alt / Ctrl / Cmd + arrow are the browser's own back and forward shortcuts, so leave those alone.
      const plain = !event.altKey && !event.ctrlKey && !event.metaKey;
      if (plain && event.key === 'ArrowRight') step(1);
      if (plain && event.key === 'ArrowLeft') step(-1);

      // Keep Tab inside the dialog, even if focus has somehow ended up outside it.
      if (event.key === 'Tab' && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll(FOCUSABLE);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (!dialogRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, step, close]);

  // The dialog grows out of the card that was picked.
  const pick = (event, index) => {
    triggerRef.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setFrom({
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
    });
    setDir(1);
    setOpen(index);
  };

  // Swipe left / right on touch devices to move between projects.
  const onPanEnd = (event, info) => {
    if (event.pointerType === 'mouse') return;
    const { x, y } = info.offset;
    if (Math.abs(x) < 60 || Math.abs(x) < Math.abs(y) * 1.5) return;
    step(x < 0 ? 1 : -1);
  };

  const markFailed = useCallback((id) => {
    setFailed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/*
        The stage. flex-1 makes it take all the height ProjectsSection has left over, and that is the
        box the fan is fitted to. overflow-x-clip (not overflow-hidden) stops sideways scrolling but never
        cuts off the shadows at the bottom. isolate keeps the cards' z-index inside this box.
      */}
      <div
        ref={stageRef}
        role="group"
        aria-label="Projects"
        aria-busy={loading}
        className="relative isolate min-h-[17rem] w-full flex-1 overflow-x-clip lg:min-h-[11rem]"
      >
        {loading && fan ? <LoadingDeck fan={fan} /> : null}

        {!loading && count === 0 ? (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-primary/60">
            No projects to show yet.
          </p>
        ) : null}

        {!loading && fan
          ? projects.map((p, index) => {
              const slot = fan.cards[index];
              /*
                will-change-transform gives every card its own layer, so the big stacked shadows are
                painted once instead of whenever something behind the dialog repaints. It also keeps
                the text on the tilted cards smooth.
              */
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Open ${p.title}${p.locked ? ' (locked case study)' : ''}`}
                  onClick={(event) => pick(event, index)}
                  className="absolute left-1/2 top-1/2 cursor-pointer select-none overflow-hidden rounded-[1.5rem] text-left will-change-transform [-webkit-tap-highlight-color:transparent] [box-shadow:var(--sh)] hover:[box-shadow:var(--sh-lift)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  style={{
                    width: fan.w,
                    height: fan.h,
                    marginLeft: -fan.w / 2,
                    marginTop: -fan.h / 2,
                    zIndex: count + 10 - Math.round(Math.abs(slot.t) * 2),
                    opacity: spread ? 1 : 0,
                    transform: spread
                      ? `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rot}deg)`
                      : `translate(0px, ${fan.stackY}px) rotate(0deg)`,
                    '--sh': shadows[index]?.rest,
                    '--sh-lift': shadows[index]?.lift,
                    transitionProperty: 'transform, opacity, box-shadow',
                    transitionDuration: reduceMotion ? '0ms' : '900ms, 700ms, 450ms',
                    transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
                    transitionDelay: reduceMotion ? '0ms' : `${slot.delay}ms, ${slot.delay}ms, 0ms`,
                  }}
                >
                  <Art
                    p={p}
                    image={failed.has(p.id) ? null : p.image}
                    onImageError={() => markFailed(p.id)}
                  />
                </button>
              );
            })
          : null}
      </div>

      {/*
        The dialog lives in document.body, so no parent (a page transition, a transform, an
        overflow-hidden section) can ever trap or clip it.
      */}
      {typeof document === 'undefined'
        ? null
        : createPortal(
            <AnimatePresence>
              {current ? (
                <Motion.div
                  key="dialog"
                  ref={dialogRef}
                  className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-8"
                  role="dialog"
                  aria-modal="true"
                  aria-label={current.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Close"
                    onClick={close}
                    className="absolute inset-0 cursor-default bg-black/[.55] backdrop-blur-xl"
                  />

                  <Motion.div
                    className="relative w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-[var(--color-bg)] text-primary shadow-2xl sm:rounded-[2rem]"
                    initial={{ opacity: 0, scale: 0.5, x: from.x, y: from.y }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    onPanEnd={onPanEnd}
                  >
                    {/* Scrolls on its own, so the close button below never scrolls away */}
                    <div className="grid max-h-[92svh] touch-pan-y grid-cols-1 overflow-y-auto overflow-x-hidden overscroll-contain md:grid-cols-[minmax(0,.9fr)_minmax(0,1fr)]">
                      {/* Top: compact header below md, art panel from md up */}
                      <div className="relative md:min-h-[34rem]">
                        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                          <Motion.div
                            key={current.id}
                            className="relative md:absolute md:inset-0"
                            variants={headerFade}
                            initial="enter"
                            animate="center"
                            exit="exit"
                          >
                            <Art
                              p={current}
                              image={failed.has(current.id) ? null : current.image}
                              onImageError={() => markFailed(current.id)}
                              isModal
                              dir={dir}
                            />
                          </Motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="relative flex flex-col justify-between gap-6 p-6 sm:gap-8 sm:p-10">
                        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                          <Motion.div
                            key={current.id}
                            variants={bodySlide}
                            custom={dir}
                            initial="enter"
                            animate="center"
                            exit="exit"
                          >
                            {/* Already shown in the coloured header below md, so hidden there */}
                            <Motion.div variants={rise} className="hidden md:block">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                  BADGE[current.kind] || 'bg-primary/10 text-primary'
                                }`}
                              >
                                {current.locked ? <FaLock aria-hidden="true" size={10} /> : null}
                                {current.kind}
                              </span>
                              <h3
                                className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-5xl"
                                style={{ fontFamily: 'var(--font-display)' }}
                              >
                                {current.title}
                              </h3>
                            </Motion.div>

                            {current.blurb ? (
                              <Motion.p
                                variants={rise}
                                className="line-clamp-4 max-w-md text-base leading-7 text-primary/60 sm:line-clamp-6 sm:text-lg sm:leading-8 md:mt-5"
                              >
                                {current.blurb}
                              </Motion.p>
                            ) : null}

                            {current.tech.length ? (
                              <Motion.ul
                                variants={chipList}
                                aria-label="Built with"
                                className="mt-5 flex max-w-md flex-wrap gap-2 text-sm text-primary/80 sm:mt-7"
                              >
                                {current.tech.slice(0, 8).map((item) => (
                                  <Motion.li
                                    key={item}
                                    variants={rise}
                                    className="rounded-full bg-primary/5 px-3.5 py-1.5"
                                  >
                                    {item}
                                  </Motion.li>
                                ))}
                                {current.tech.length > 8 ? (
                                  <Motion.li
                                    variants={rise}
                                    className="rounded-full bg-primary/5 px-3.5 py-1.5 text-primary/60"
                                  >
                                    +{current.tech.length - 8}
                                  </Motion.li>
                                ) : null}
                              </Motion.ul>
                            ) : null}
                          </Motion.div>
                        </AnimatePresence>

                        {/* Phones: controls row, then a full-width button. From sm up: button left, controls right. */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <Link
                            to={`/project/${current.id}`}
                            state={current.locked ? { isLocked: true } : null}
                            aria-label={
                              current.locked
                                ? `Unlock the case study for ${current.title}`
                                : `See more about ${current.title}`
                            }
                            className="order-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:order-none sm:w-auto"
                          >
                            {current.locked ? (
                              <>
                                <FaLock aria-hidden="true" size={13} /> Unlock case study
                              </>
                            ) : (
                              <>
                                See more <FaArrowRight aria-hidden="true" size={13} />
                              </>
                            )}
                          </Link>

                          {count > 1 ? (
                            <div className="order-1 flex items-center justify-between gap-3 sm:order-none sm:justify-end sm:gap-4">
                              <Dots items={projects} active={open} onPick={jump} />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  aria-label="Previous project"
                                  onClick={() => step(-1)}
                                  className="grid h-10 w-10 place-items-center rounded-full bg-primary/5 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-11 sm:w-11"
                                >
                                  <FaChevronLeft aria-hidden="true" size={14} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Next project"
                                  onClick={() => step(1)}
                                  className="grid h-10 w-10 place-items-center rounded-full bg-primary/5 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-11 sm:w-11"
                                >
                                  <FaChevronRight aria-hidden="true" size={14} />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Tells screen readers which project is showing after next / previous */}
                    <p className="sr-only" aria-live="polite">
                      {`Project ${open + 1} of ${count}: ${current.title}`}
                    </p>

                    <button
                      type="button"
                      autoFocus
                      aria-label="Close"
                      onClick={close}
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-neutral-900 backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-4 sm:top-4"
                    >
                      <FaTimes aria-hidden="true" size={16} />
                    </button>
                  </Motion.div>
                </Motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )}
    </MotionConfig>
  );
}
