import { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useExperience } from '../../../hooks/usePortfolioData';

const CHAPTERS = [
  {
    id: 'ch1',
    number: '01',
    era: '2020 – 2023',
    category: 'EDUCATION',
    title: 'The Engineer',
    subtitle: 'Diploma in Mechanical Engineering',
    body: 'Started my academic journey in mechanical engineering — learning how systems work, how forces interact, and how precision matters. Built analytical thinking that still shapes every line of code I write today.',
    tags: ['Problem Solving', 'Systems Thinking', 'Engineering Principles'],
    accent: 'var(--color-accent)',
    stat: { value: '3', label: 'Years of engineering foundation' },
  },
  {
    id: 'ch2',
    number: '02',
    era: '2024 →',
    category: 'EDUCATION',
    title: 'The Pivot',
    subtitle: 'B.Tech CSE — Arya College, RTU',
    body: 'Made the bold switch from mechanical to computer science via lateral entry. Diving deep into CS fundamentals, data structures, algorithms — and discovering a genuine love for building software.',
    tags: ['CS Fundamentals', 'Algorithms', 'Data Structures', 'Lateral Entry'],
    accent: 'var(--color-accent)',
    stat: { value: '7th', label: 'Semester — Final year' },
  },
  {
    id: 'ch3',
    number: '03',
    era: '2025',
    category: 'TRANSITION',
    title: 'The Spark',
    subtitle: 'Discovered Web Development',
    body: 'Wrote my first React component and something clicked. The ability to build real things that real people use — instantly. Fell deep into the MERN stack, Tailwind, Framer Motion. Clean code became my obsession.',
    tags: ['React', 'Node.js', 'MongoDB', 'TailwindCSS', 'REST APIs'],
    accent: 'var(--color-accent)',
    stat: { value: 'MERN', label: 'Full-stack from day one' },
  },
  {
    id: 'ch4',
    number: '04',
    era: '2025',
    category: 'SKILL',
    title: 'The AI Edge',
    subtitle: 'AI Tools & Prompt Engineering',
    body: 'Embraced AI not as a shortcut but as a development superpower. Mastered prompt engineering, integrated Claude and other AI APIs into real projects. Now every project I build has AI thinking baked in.',
    tags: ['Prompt Engineering', 'Claude API', 'AI Integration', 'LLM Workflows'],
    accent: 'var(--color-accent)',
    stat: { value: 'AI+', label: 'Every project is AI-powered' },
  },
  {
    id: 'ch5',
    number: '05',
    era: 'Present',
    category: 'NOW',
    title: 'The Builder',
    subtitle: 'Full-Stack Developer — Open to Work',
    body: 'Building scalable web applications that solve real problems. Actively seeking internship & freelance opportunities. Every day is a new commit, a new feature, a new thing learned.',
    tags: ['Open to Freelance', 'Internship Ready', 'Full-Stack', 'Rajasthan, India'],
    accent: 'var(--color-accent)',
    stat: { value: '∞', label: 'Commits and counting' },
    isPulse: true,
  },
];

function LiveCounter() {
  const [text, setText] = useState('');
  useEffect(() => {
    const start = new Date('2025-04-01');
    const tick = () => {
      const ms   = Date.now() - start;
      const days = Math.floor(ms / 86400000);
      const hrs  = Math.floor((ms % 86400000) / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      setText(`${days}d ${hrs}h ${mins}m`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return <span>{text}</span>;
}

// ── CHAPTER CARD ─────────────────────────────────────────────────────
function ChapterCard({ chapter, isActive, onClick }) {
  const accent = chapter?.accent;
  
  return (
    <Motion.div
      layout
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{ width: isActive ? 480 : 200 }}
      animate={{ width: isActive ? 480 : 200 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="relative h-full rounded-2xl overflow-hidden border transition-all duration-500"
        style={{
          borderColor: isActive ? accent : 'rgba(69,14,22,0.1)',
          background: isActive
            ? `linear-gradient(135deg, var(--color-bg) 0%, ${accent}18 100%)`
            : 'var(--color-light)',
        }}
      >
        <div
          className="absolute top-4 right-4 font-bold leading-none select-none pointer-events-none transition-all duration-500"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isActive ? '7rem' : '4rem',
            color: accent,
            opacity: isActive ? 0.12 : 0.18,
            lineHeight: 1,
          }}
        >
          {chapter?.number || ''}
        </div>

        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-500"
          style={{ background: accent, opacity: isActive ? 1 : 0.4 }}
        />

        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: `${accent}25`, color: accent }}
            >
              {chapter?.category || 'EXPERIENCE'}
            </span>
            <span className="text-xs text-primary/30 font-medium tabular-nums">
              {chapter?.era || ''}
            </span>
          </div>

          <h2
            className="font-bold text-primary leading-tight mb-1 transition-all duration-300"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isActive ? '1.75rem' : '1.1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {chapter?.title || ''}
          </h2>

          <p className="text-xs text-primary/45 font-medium mb-4">{chapter?.subtitle || ''}</p>

          {/* Expanded content */}
          <AnimatePresence>
            {isActive && (
              <Motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex flex-col gap-4 flex-1"
              >
                <p className="text-sm text-primary/65 leading-relaxed">{chapter?.body || ''}</p>

                <div className="flex flex-wrap gap-1.5">
                  {chapter?.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                      style={{
                        borderColor: `${accent}50`,
                        color: accent,
                        background: `${accent}12`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {chapter?.stat && (
                  <div
                    className="mt-auto flex items-end gap-3 pt-4 border-t"
                    style={{ borderColor: `${accent}25` }}
                  >
                    <span
                      className="font-bold leading-none"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2.5rem',
                        color: accent,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {chapter.stat.value}
                    </span>
                    <span className="text-xs text-primary/40 leading-tight pb-1">
                      {chapter.stat.label}
                    </span>
                    {chapter.isPulse && (
                      <div className="ml-auto flex items-center gap-1.5 pb-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="text-xs font-medium text-green-600">Live</span>
                      </div>
                    )}
                  </div>
                )}
              </Motion.div>
            )}
          </AnimatePresence>

          {!isActive && (
            <div className="mt-auto">
              <div className="text-[10px] text-primary/25 uppercase tracking-wider">Tap to expand</div>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
}

export default function ExperienceSection() {
  const [active, setActive] = useState('ch3');
  const { data: experienceItems } = useExperience();
  const scrollRef = useRef(null);

  const chapters = experienceItems.length
    ? experienceItems.map((item, i) => ({
        id: `api-${item._id || i}`,
        number: item.number || String(i + 1).padStart(2, '0'),
        era: item.era || item.year || CHAPTERS[i % CHAPTERS.length].era,
        category: (item.category || 'EXPERIENCE').toUpperCase(),
        title: item.title,
        subtitle: item.subtitle || '',
        body: item.body || item.description || '',
        tags: item.tags || [],
        accent: item.accent,
        stat: item.stat || null,
        isPulse: item.isPulse || false,
      }))
    : CHAPTERS;

  const activeChapterId = chapters.some((chapter) => chapter.id === active) ? active : chapters[0]?.id;

  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-id="${activeChapterId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeChapterId]);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col px-5 justify-between py-8 gap-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-primary/35 mb-2">
            My story
          </p>
          <h1
            className="text-primary leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 5vw, 5rem)',
              letterSpacing: '-0.035em',
              fontWeight: 800,
            }}
          >
            The Journey
          </h1>
        </div>

        <div className="flex items-center gap-6 lg:gap-8 pb-1">
          {[
            { val: '1+',   label: 'Years building' },
            { val: 'MERN', label: 'Core stack' },
            { val: '5+',   label: 'Projects shipped' },
          ].map(s => (
            <div key={s.label} className="text-center lg:text-right">
              <p
                className="text-2xl font-bold text-primary leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.val}
              </p>
              <p className="text-[10px] text-primary/35 uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
          <div className="hidden lg:flex flex-col items-end border-l border-primary/10 pl-6">
            <p className="text-xs text-primary/35 uppercase tracking-wide">Coding for</p>
            <p
              className="text-base font-bold text-primary tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <LiveCounter />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {chapters.map((ch) => {
          const accent = ch?.accent;
          return (
            <button
              key={ch.id}
              onClick={() => setActive(ch.id)}
              className="flex items-center gap-2 group"
              title={ch?.title}
            >
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: active === ch.id ? 48 : 20,
                  background: active === ch.id ? accent : 'rgba(69,14,22,0.12)',
                }}
              />
              <span
                className="text-[10px] font-bold hidden lg:block transition-all duration-300"
                style={{ color: active === ch.id ? accent : 'rgba(69,14,22,0.25)' }}
              >
                {ch?.number}
              </span>
            </button>
          );
        })}
        <span className="ml-2 text-xs text-primary/30 tabular-nums">
          {chapters.findIndex(c => c.id === active) + 1} / {chapters.length}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto xl:mx-auto scrollbar-hide pb-2"
        style={{ height: 'clamp(340px, 45vh, 480px)' }}
      >
        {chapters.map((ch) => (
          <div key={ch.id} data-id={ch.id} className="h-full">
            <ChapterCard
              chapter={ch}
              isActive={active === ch.id}
              onClick={() => setActive(ch.id)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4 border-t border-primary/8">
        {activeChapter && (
          <div className="flex items-start gap-4">
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0"
              style={{ background: activeChapter.accent }}
            />
            <blockquote className="text-sm text-primary/50 italic leading-relaxed max-w-md">
              "From engineering mechanics to web development — every step builds the foundation
              for creating exceptional digital experiences."
            </blockquote>
          </div>
        )}

        <div className="flex items-center gap-3 flex-shrink-0 justify-end w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-700">Open to work</span>
          </div>
          <span className="text-primary/20">·</span>
          <span className="text-sm text-primary/45">Rajasthan, India</span>
        </div>
      </div>
    </section>
  );
}
