import { useRef, useState } from 'react';
import { PiGearSixBold, PiGraduationCapBold, PiCodeBold, PiBrainBold, PiStackBold, PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import SlidingText from '../../../shared/components/SlidingText';
import SectionFooter from '../../../shared/components/SectionFooter';
import { useExperience } from '../../../hooks/usePortfolioData';
import art1 from '../assets/1.webp';
import art2 from '../assets/2.webp';
import art3 from '../assets/3.webp';
import art4 from '../assets/4.webp';
import art5 from '../assets/5.gif';

const ART = [art1, art2, art3, art4, art5];
// One icon per chapter, all from the same Phosphor set: gear, degree, code, brain, stack.
const ICONS = [PiGearSixBold, PiGraduationCapBold, PiCodeBold, PiBrainBold, PiStackBold];

// Shown until the API answers, and whenever it has nothing yet.
const FALLBACK = [
  { era: '2020 – 2023', title: 'The Workshop', subtitle: 'Diploma in Mechanical Engineering',
    body: 'Before getting into coding, I spent three years studying mechanical engineering. I learned how machines work, how things are designed, and why even small details matter. Those years gave me a different way of looking at problems, something that still helps me today as a developer.' },
  { era: '2024 →', title: 'The Shift', subtitle: 'B.Tech in Computer Science & Engineering',
    body: "In 2024, I went through a difficult phase in my personal life that changed the way I looked at things. I decided to channel that pain into something meaningful and took a leap from Mechanical Engineering to Computer Science. Starting over wasn't easy, but as I began learning to code and building things of my own, I found something that genuinely excited me. What started as a way to move forward slowly became the career I wanted to pursue." },
  { era: '2025', title: 'The Craft', subtitle: 'Full-Stack Web Development',
    body: 'I fell in love with the immediacy of the web—the rare space where rigorous backend architecture meets intuitive, tactile interface design. I dedicated myself to building end-to-end applications from scratch: structuring modular APIs, designing resilient schemas, and obsessing over interaction details so that complex workflows feel effortless to the user.' },
  { era: '2026', title: 'Intelligent Systems', subtitle: 'LLM Workflows & Systems Integration',
    body: 'After exploring AI tools and intelligent systems, I began integrating AI into my development workflow to solve problems more efficiently. I use LLMs, smart prompting, and AI-powered automation to streamline repetitive tasks, improve productivity, and build reliable software. My focus is on combining intelligent systems with solid engineering principles to create solutions that are fast, accurate, and scalable.' },
  { era: 'Now', title: 'The Builder', subtitle: 'Full-Stack Product Engineering',
    body: 'Today, I build production-grade web applications and digital tools designed to last. From architecting scalable platforms with role-based access and secure payment rails to crafting responsive, high-performance user interfaces, my focus is singular: delivering real value through resilient code and thoughtful product design.' },
];

const normalize = (item, i) => ({
  era: item.era || item.year || '',
  title: item.title || '',
  subtitle: item.subtitle || '',
  body: item.body || item.description || '',
  art: item.art || item.image || ART[i] || null,
});

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const eraText = (era) => era.replace(/\s*→/, ' – now'); // "2024 →" -> "2024 – now"
const isGif = (src) => typeof src === 'string' && /\.gif(\?|$)|^data:image\/gif/.test(src);

export default function ExperienceSection() {
  const { data } = useExperience();
  const chapters = (data?.length ? data : FALLBACK).map(normalize);
  const last = chapters.length - 1;
  const [index, setIndex] = useState(0);
  const track = useRef(null);

  const active = Math.min(index, last);
  const cur = chapters[active];

  // Chapters sit side by side in a hidden horizontal track that snaps one at a time.
  // Swipe, trackpad-scroll, press the arrow keys or use the two buttons.
  const go = (i) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: clamp(i, 0, last) * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  const onScroll = (e) => {
    const el = e.currentTarget;
    setIndex(clamp(Math.round(el.scrollLeft / el.clientWidth), 0, last));
  };
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    go(active + (e.key === 'ArrowRight' ? 1 : -1));
  };

  const railItems = chapters.map((ch, i) => {
    const Icon = ICONS[i % ICONS.length];
    return { text: ch.title.toUpperCase(), icon: <Icon />, alt: ch.title };
  });

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col py-8 gap-8 tall:gap-6 tall:h-[calc(100vh-5rem)] tall:overflow-hidden">
      <div className="w-full overflow-hidden order-3 lg:order-1">
        <SlidingText items={railItems} speed={18} />
      </div>

      <div className="order-2 px-5 flex-1 flex flex-col tall:min-h-0">
        <article
          aria-roledescription="carousel"
          aria-label="Experience"
          onKeyDown={onKeyDown}
          className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-primary text-bg tall:min-h-0"
        >
          <p className="sr-only" aria-live="polite">{cur.title}, {eraText(cur.era)}</p>

          <div
            ref={track}
            onScroll={onScroll}
            className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide"
          >
            {chapters.map((ch, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${chapters.length}`}
                aria-hidden={i !== active}
                className="grid w-full shrink-0 snap-center snap-always gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-[clamp(1.5rem,2vw,2rem)] lg:px-[clamp(6rem,8vw,7rem)] lg:py-[clamp(1.1rem,3.4vh,2.4rem)]"
              >
                <div className="order-2 lg:order-1">
                  <span className="inline-block rounded-full bg-accent px-3.5 py-1 text-xs font-semibold tabular-nums text-primary">
                    {eraText(ch.era)}
                  </span>
                  <h2 className="mt-[clamp(0.4rem,1.4vh,0.75rem)] text-[clamp(1.8rem,min(3.6vw,5.6vh),3.6rem)] font-semibold leading-[1.02] tracking-tight">
                    {ch.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-accent sm:text-base">{ch.subtitle}</p>
                  <p className="mt-[clamp(0.5rem,1.8vh,1rem)] max-w-[70ch] text-[clamp(0.8125rem,min(1.05vw,1.9vh),1.0625rem)] leading-[1.6] text-bg/85">{ch.body}</p>
                </div>

                {/* Line art is tinted yellow through a mask; the animated GIF is full colour, so it fills the tile as is. */}
                <div className="order-1 lg:order-2 relative h-[25rem] overflow-hidden rounded-2xl">
                  {ch.art && (isGif(ch.art) ? (
                    <img src={ch.art} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <span
                      role="presentation"
                      className="absolute inset-4 bg-accent"
                      style={{ WebkitMask: `url(${ch.art}) center / contain no-repeat`, mask: `url(${ch.art}) center / contain no-repeat` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Left and right toggles: Kept in exact original position with modern glassmorphism, micro-interactions, and visual feedback */}
          {[-1, 1].map((dir) => {
            const to = active + dir;
            const off = to < 0 || to > last;
            const Icon = dir < 0 ? PiCaretLeftBold : PiCaretRightBold;
            const word = dir < 0 ? 'Previous' : 'Next';
            return (
              <button
                key={dir}
                type="button"
                disabled={off}
                onClick={() => go(to)}
                aria-label={off ? `${word} chapter` : `${word}: ${chapters[to].title}`}
                className={`absolute z-10 top-[calc(1.25rem+10rem)] grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-bg/15 backdrop-blur-md border border-bg/20 text-bg text-xl shadow-lg transition-all duration-200 hover:bg-accent hover:text-primary hover:border-accent hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:top-[calc(1.75rem+10rem)] lg:top-1/2 lg:h-12 lg:w-12 lg:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${dir < 0 ? 'left-3 sm:left-4 lg:left-5' : 'right-3 sm:right-4 lg:right-5'}`}
              >
                <Icon />
              </button>
            );
          })}
        </article>
      </div>

      <SectionFooter
        className="flex flex-col px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end"
        title="The Journey"
        tagline="The future belongs to those who believe in the beauty of their dreams."
        description="— Eleanor Roosevelt"
      />
    </section>
  );
}