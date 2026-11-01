import { useRef } from 'react';
import { motion as Motion, useInView, useReducedMotion } from 'framer-motion';
import Thread from './Thread';
import { OPENING, CHAPTERS, CLOSING } from '../approachData';
import { useAbout } from '../../../hooks/usePortfolioData';
import { toSafeEmailText, toSafeMailtoHref } from '../../../shared/utils/urlSafety';

// How "finished" each stage's note looks: a dashed draft that firms up into a solid, filled note.
const FINISH = [
  'border-2 border-dashed border-primary/35',
  'border-2 border-dashed border-primary/60 bg-accent/25',
  'border border-primary/25 bg-accent/60',
  'border border-primary/10 bg-accent',
];

// Outlined until it's filled in. Used for the numerals and the first closing line.
const OUTLINE = '[-webkit-text-stroke:1.5px_var(--color-primary)] text-transparent';

function Opening() {
  const reduceMotion = useReducedMotion();
  const words = OPENING.title.split(' ');

  return (
    <header className="pb-20 pt-2 lg:pb-32">
      <p
        aria-hidden="true"
        className="stroke-text mb-6 lg:mb-10"
        style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}
      >
        {OPENING.label}
      </p>

      <h1
        className="text-[clamp(2.75rem,9.2vw,8.5rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-primary"
        style={{ fontFamily: 'var(--font-approach)' }}
      >
        {words.map((word, i) => (
          <span key={i} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <Motion.span
              className="inline-block"
              initial={reduceMotion ? false : { y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </Motion.span>
          </span>
        ))}
      </h1>

      <div className="mt-10 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="max-w-[46ch] space-y-5 lg:col-span-6 lg:col-start-6">
          <p className="text-xl font-medium leading-snug text-primary lg:text-2xl">{OPENING.lead}</p>
          <p className="text-base leading-relaxed text-primary/70 lg:text-lg">{OPENING.aside}</p>
        </div>
      </div>
    </header>
  );
}

function Chapter({ chapter }) {
  const ref = useRef(null);
  // Once the top of a stage passes the middle of the screen its numeral fills in, and stays filled.
  const reached = useInView(ref, { once: true, margin: '0px 0px -45% 0px' });

  return (
    <article ref={ref} className="grid gap-8 py-14 lg:grid-cols-12 lg:gap-x-8 lg:py-24">
      <div className={`lg:row-start-1 ${chapter.text}`}>
        <div className="flex items-baseline gap-4 lg:gap-6">
          <span
            aria-hidden="true"
            data-reached={reached}
            className={`${OUTLINE} text-[clamp(3.5rem,8vw,7rem)] font-extrabold leading-[0.85] tabular-nums transition-colors duration-700 data-[reached=true]:text-primary motion-reduce:transition-none`}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            {chapter.n}
          </span>
          <p className="text-sm font-medium italic text-primary/70 sm:text-base">{chapter.name}</p>
        </div>

        <h2
          className="mt-6 max-w-[16ch] text-[clamp(1.95rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-primary sm:max-w-[20ch] lg:mt-8"
          style={{ fontFamily: 'var(--font-approach)' }}
        >
          <span className="sr-only">{`${chapter.name}. `}</span>
          {chapter.statement}
        </h2>

        <div className="mt-6 max-w-[52ch] space-y-4 text-base leading-relaxed text-primary/80 lg:mt-8 lg:text-lg">
          {chapter.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <aside
        aria-label={`What this looks like: ${chapter.name}`}
        className={`rounded-2xl p-6 lg:row-start-1 lg:self-start lg:p-7 ${FINISH[chapter.finish]} ${chapter.note}`}
      >
        <h3 className="text-base font-bold italic text-primary" style={{ fontFamily: 'var(--font-approach)' }}>
          What this looks like
        </h3>
        <ul className="mt-4 space-y-4">
          {chapter.items.map((item) => (
            <li key={item} className="flex gap-3 text-[0.95rem] leading-snug text-primary/85">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}

function Closing() {
  const { data: about } = useAbout();
  const emailHref = toSafeMailtoHref(about?.email, 'iamvivek.verma@icloud.com');
  const email = toSafeEmailText(about?.email, 'iamvivek.verma@icloud.com');

  return (
    <div className="pt-10 lg:pt-20">
      <h2
        className="text-[clamp(2.6rem,8.4vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
        style={{ fontFamily: 'Open Sans, sans-serif' }}
      >
        {/* Still learning = still an outline. Always building = filled in. */}
        <span className={`block ${OUTLINE}`}>{CLOSING.lines[0]}</span>
        <span className="block text-primary">{CLOSING.lines[1]}</span>
      </h2>

      <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="max-w-[46ch] space-y-4 text-base leading-relaxed text-primary/80 lg:col-span-5 lg:col-start-1 lg:text-lg">
          {CLOSING.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:col-start-8 lg:justify-end">
          <p className="text-2xl font-bold leading-tight text-primary lg:text-3xl" style={{ fontFamily: 'var(--font-approach)' }}>
            {CLOSING.invite}
          </p>
          <a
            href={emailHref}
            title={email}
            className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-base font-semibold text-bg transition-colors duration-200 hover:bg-[var(--color-fill)] hover:text-primary"
          >
            {CLOSING.action}
            <svg viewBox="0 0 28 10" className="w-6 fill-none stroke-current transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M0 5h26M22 1l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ApproachScroll() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="px-5 pb-14 pt-6 lg:pt-10" style={{ '--rail': 'clamp(1.75rem, 7vw, 5.5rem)', fontFamily: 'var(--font-approach)' }}>
      <div className="relative mx-auto max-w-[88rem]">
        <Thread target={sectionRef} />
        <div className="pl-[calc(var(--rail)+1rem)] lg:pl-[calc(var(--rail)+2.5rem)]">
          <Opening />
          {CHAPTERS.map((chapter) => (
            <Chapter key={chapter.n} chapter={chapter} />
          ))}
          <Closing />
        </div>
      </div>
    </section>
  );
}
