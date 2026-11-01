import { useEffect, useRef, useState } from 'react';
import { animate, motion as Motion, useReducedMotion } from 'framer-motion';
import useElementSize from '../../../hooks/useElementSize';
import { OPENING, CHAPTERS } from '../approachData';

// The page is one large, quiet canvas. All sizes below are canvas units, not screen pixels:
// a "camera" scales the canvas to fit the screen, then moves in on one card.
const W = 3620;
const H = 1340;
const FW = 1180;
const FH = 480;
const POS = [
  { x: 1050, y: 110 },
  { x: 2380, y: 190 },
  { x: 2380, y: 770 },
  { x: 1050, y: 690 },
];
const SHORT = ['Understand', 'Build', 'Test', 'Refine'];
const FONT = 'var(--font-approach)';
const EASE = [0.65, 0, 0.35, 1];

// The cards warm up from cream to yellow as the work gets more finished.
const TONE = ['bg-[#fffdf8]', 'bg-[#fdf3de]', 'bg-[#fde7b4]', 'bg-accent'];
const MARK = ['#fdcb6e', '#fdcb6e', '#fdcb6e', '#fff7e7'];
const SHADOW = 'shadow-[0_2px_4px_rgba(69,14,22,0.05),0_24px_60px_-20px_rgba(69,14,22,0.22)]';

// Highlighter underline for one strong phrase.
function Marked({ text, mark, color = '#fdcb6e' }) {
  const at = text.indexOf(mark);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="px-[0.06em] [box-decoration-break:clone]" style={{ backgroundImage: `linear-gradient(transparent 60%, ${color} 60%)` }}>{mark}</span>
      {text.slice(at + mark.length)}
    </>
  );
}

// Where the camera points: the whole canvas, or one card.
function cameraFor(cw, ch, active) {
  const box = active === null
    ? { x: 0, y: 0, w: W, h: H, pad: 26 }
    : { x: POS[active].x, y: POS[active].y, w: FW, h: FH, pad: 26 };
  const scale = Math.min(cw / (box.w + box.pad * 2), ch / (box.h + box.pad * 2));
  return { scale, x: cw / 2 - (box.x + box.w / 2) * scale, y: ch / 2 - (box.y + box.h / 2) * scale };
}

// Quiet connectors from the edge of one card to the next, with a dot at each end.
const mid = (i) => ({ l: POS[i].x, r: POS[i].x + FW, t: POS[i].y, b: POS[i].y + FH, mx: POS[i].x + FW / 2, my: POS[i].y + FH / 2 });
const sCurve = (x0, y0, x1, y1) => { const k = Math.abs(x1 - x0) / 2; const d = x1 > x0 ? 1 : -1; return `M${x0} ${y0}C${x0 + d * k} ${y0} ${x1 - d * k} ${y1} ${x1} ${y1}`; };
const LINKS = (() => {
  const [a, b, c, d] = [mid(0), mid(1), mid(2), mid(3)];
  return [
    { d: sCurve(a.r, a.my, b.l, b.my), dots: [[a.r, a.my], [b.l, b.my]] },
    { d: `M${b.mx} ${b.b}V${c.t}`, dots: [[b.mx, b.b], [c.mx, c.t]] },
    { d: sCurve(c.l, c.my, d.r, d.my), dots: [[c.l, c.my], [d.r, d.my]] },
  ];
})();

function useAnimatedPercent(target, reduceMotion) {
  const [value, setValue] = useState(Math.round(target));
  const from = useRef(target);
  useEffect(() => {
    const controls = animate(from.current, target, {
      duration: reduceMotion ? 0 : 1,
      ease: EASE,
      onUpdate: (v) => { from.current = v; setValue(Math.round(v)); },
    });
    return () => controls.stop();
  }, [target, reduceMotion]);
  return value;
}

function Card({ chapter, i, active, onOpen, btnRef }) {
  const on = active === i;
  const overview = active === null;
  const fade = 'transition-[opacity,visibility] duration-500';

  return (
    <article
      className={`absolute rounded-[56px] transition-[transform,opacity,box-shadow] duration-300 motion-reduce:transition-none ${TONE[chapter.finish]} ${SHADOW} ${overview ? 'hover:-translate-y-3' : ''} ${!overview && !on ? 'opacity-50' : ''}`}
      style={{ left: POS[i].x, top: POS[i].y, width: FW, height: FH }}
    >
      {/* From far away: a number, a name, one strong line */}
      <div className={`absolute inset-[64px] flex flex-col ${fade} ${on ? 'invisible opacity-0' : 'visible opacity-100 delay-200'}`}>
        <h3 className="mt-auto max-w-[960px] text-[80px] font-semibold leading-[1.04] tracking-[-0.035em] text-primary" style={{ fontFamily: FONT }}>
          <Marked text={chapter.statement} mark={chapter.mark} color={MARK[i]} />
        </h3>
      </div>

      {/* Up close: the full story */}
      <div className={`absolute inset-[56px] flex flex-col ${fade} ${on ? 'visible opacity-100 delay-300' : 'invisible opacity-0'}`}>
        <div className="mt-6 grid grid-cols-[380px_1fr] gap-20">
          <h3 className="text-[48px] font-semibold leading-[1.08] tracking-[-0.03em] text-primary" style={{ fontFamily: FONT }}>
            <Marked text={chapter.statement} mark={chapter.mark} color={MARK[i]} />
          </h3>
          <div className="max-w-[720px] space-y-4 text-[19px] font-light leading-[1.6] text-primary/90">
            {chapter.body.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-[20px] font-semibold text-primary">What this looks like</p>
          <ul className="mt-5 grid grid-cols-3 gap-12">
            {chapter.items.map((item) => (
              <li key={item} className="border-t-[2px] border-primary/25 pt-5 text-[17px] font-light leading-[1.5] text-primary/90">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={() => onOpen(i)}
        aria-label={overview ? `Open ${chapter.n}, ${chapter.name}: ${chapter.statement}` : `Go to ${chapter.n}, ${chapter.name}`}
        className={`absolute inset-0 z-10 rounded-[56px] focus-visible:outline focus-visible:outline-[8px] focus-visible:outline-offset-[8px] focus-visible:outline-primary ${on ? 'pointer-events-none invisible' : 'cursor-pointer'}`}
      />
    </article>
  );
}

const ROUND = 'flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-bg text-primary transition-colors duration-200 hover:bg-primary hover:text-bg disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none';
const Chevron = ({ dir }) => (
  <svg viewBox="0 0 10 16" className="h-3.5 w-2.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M8 2L2 8l6 6' : 'M2 2l6 6-6 6'} />
  </svg>
);

export default function ApproachCanvas() {
  const boxRef = useRef(null);
  const { w: cw, h: ch } = useElementSize(boxRef);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const openRefs = useRef([]);
  const backRef = useRef(null);
  const prev = useRef(null);
  const lastSeen = useRef(0);
  const last = CHAPTERS.length - 1;

  const cam = cw && ch ? cameraFor(cw, ch, active) : null;
  const percent = useAnimatedPercent(cam ? cam.scale * 100 : 0, reduceMotion);

  // Keyboard users land on "Overview" when they zoom in, and back on the card when they zoom out.
  useEffect(() => {
    const focusLost = !boxRef.current?.parentElement?.contains(document.activeElement);
    if (active !== null && (prev.current === null || focusLost)) backRef.current?.focus({ preventScroll: true });
    if (active === null && prev.current !== null) openRefs.current[prev.current]?.focus({ preventScroll: true });
    if (active !== null) lastSeen.current = active;
    prev.current = active;
  }, [active]);

  // Esc and the arrow keys work from anywhere on the page while zoomed in.
  useEffect(() => {
    if (active === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      else if (e.key === 'ArrowRight') { e.preventDefault(); setActive((a) => Math.min(last, a + 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, last]);

  const go = (i) => setActive(Math.max(0, Math.min(last, i)));

  return (
    <div className="flex min-h-0 border flex-1 flex-col overflow-clip rounded-[28px] ">
      <p className="sr-only" aria-live="polite">
        {active === null ? 'Overview of the four stages.' : `Zoomed in to ${CHAPTERS[active].n}, ${CHAPTERS[active].name}.`}
      </p>

      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-clip">
        {cam && (
          <Motion.div
            className="absolute left-0 top-0"
            style={{ width: W, height: H, originX: 0, originY: 0 }}
            initial={false}
            animate={cam}
            transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE }}
          >
            {/* The opening, set quietly on the canvas */}
            <div className="absolute" style={{ left: 70, top: 90, width: 910 }}>
              <h2 className="text-[136px] font-semibold leading-[1] tracking-[-0.045em] text-primary" style={{ fontFamily: FONT }}>
                <Marked text={OPENING.title} mark={OPENING.titleMark} />
              </h2>
              <p className="mt-16 text-[38px] font-light leading-[1.5] text-primary">{OPENING.lead}</p>
              <p className="mt-10 text-[38px] font-light leading-[1.5] text-primary/55">{OPENING.aside}</p>
            </div>

            <svg className="pointer-events-none absolute left-0 top-0 text-primary" width={W} height={H} fill="none" aria-hidden="true">
              {LINKS.map((l) => (
                <g key={l.d}>
                  <path d={l.d} stroke="currentColor" strokeOpacity="0.28" strokeWidth="4" strokeLinecap="round" />
                  {l.dots.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="11" fill="currentColor" fillOpacity="0.55" />)}
                </g>
              ))}
            </svg>

            {CHAPTERS.map((chapter, i) => (
              <Card key={chapter.n} chapter={chapter} i={i} active={active} onOpen={setActive} btnRef={(el) => { openRefs.current[i] = el; }} />
            ))}
          </Motion.div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        {active === null ? (
          <p className="text-sm text-primary/60">Select a card to take a closer look.</p>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" className={ROUND} disabled={active === 0} onClick={() => go(active - 1)} aria-label={`Previous: ${CHAPTERS[Math.max(0, active - 1)].name}`}><Chevron dir="left" /></button>
            <button type="button" className={ROUND} disabled={active === last} onClick={() => go(active + 1)} aria-label={`Next: ${CHAPTERS[Math.min(last, active + 1)].name}`}><Chevron dir="right" /></button>
            <p className="text-sm text-primary/60">{CHAPTERS[active].n} of 04<span className="mx-2 text-primary/30">·</span>{SHORT[active]}</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            ref={backRef}
            type="button"
            onClick={() => setActive(null)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-primary transition-[opacity,background-color] duration-300 hover:bg-primary/10 motion-reduce:transition-none ${active === null ? 'invisible opacity-0' : 'visible opacity-100'}`}
          >
            <Chevron dir="left" /> Overview
          </button>
          <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-bg px-1.5 py-1 text-sm font-medium text-primary" role="group" aria-label="Zoom">
            <button type="button" aria-label="Zoom out to overview" disabled={active === null} onClick={() => setActive(null)} className="h-7 w-7 rounded-full text-lg leading-none transition-colors hover:bg-primary hover:text-bg disabled:pointer-events-none disabled:opacity-30">−</button>
            <output className="min-w-[3rem] text-center tabular-nums" aria-label="Zoom level">{percent}%</output>
            <button type="button" aria-label="Zoom in to a card" disabled={active !== null} onClick={() => setActive(lastSeen.current)} className="h-7 w-7 rounded-full text-lg leading-none transition-colors hover:bg-primary hover:text-bg disabled:pointer-events-none disabled:opacity-30">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
