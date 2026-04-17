import { useState } from 'react';
import { useSkills } from '../../../hooks/usePortfolioData';

const LEVEL_MAP = [
  { max: 60,  label: 'LEARNING' },
  { max: 75,  label: 'INTERMEDIATE' },
  { max: 88,  label: 'ADVANCED' },
  { max: 100, label: 'EXPERT' },
];

const CATS = ['All', 'Frontend', 'Backend', 'Database', 'Tools'];

function getLevelLabel(level) {
  return (LEVEL_MAP.find(l => level <= l.max) || LEVEL_MAP[3]).label;
}

export default function SkillCard() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSkillName, setActiveSkillName] = useState('');
  const { data: rawSkills, loading } = useSkills();
  const skills = rawSkills.map((item) => ({
    name: item.name,
    level: item.level,
    desc: item.desc || '',
    cat: item.category || 'Frontend',
  }));

  const filtered = activeFilter === 'All'
    ? skills
    : skills.filter(s => s.cat === activeFilter);

  const activeSkill = filtered.find((skill) => skill.name === activeSkillName)
    || skills.find((skill) => skill.name === activeSkillName)
    || filtered[0]
    || skills[0]
    || null;

  const handleFilter = (cat) => {
    setActiveFilter(cat);
    const list = cat === 'All' ? skills : skills.filter(s => s.cat === cat);
    setActiveSkillName(list[0]?.name || '');
  };

  const pillSize = (i) => {
    if (i < 2) return 'text-[clamp(1.4rem,4vw,2.2rem)] px-7 py-3';
    if (i < 4) return 'text-[clamp(1rem,2.5vw,1.4rem)] px-6 py-2.5';
    return 'text-[clamp(0.85rem,2vw,1.05rem)] px-5 py-2';
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-5 select-none">
      {/* Category filters */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {CATS.map(cat => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`text-[0.65rem] font-bold uppercase tracking-[0.18em] border-b-[1.5px] pb-0.5 transition-all duration-150 bg-transparent ${
              activeFilter === cat
                ? 'text-primary border-primary'
                : 'text-primary/30 border-transparent hover:text-primary/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Typographic pill scatter */}
      <div className="flex flex-wrap gap-[10px] items-start mb-8">
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-primary/50">No skills found.</p>
        )}
        {filtered.map((skill, i) => (
          <div
            key={skill.name}
            onClick={() => setActiveSkillName(skill.name)}
            className={`cursor-pointer border-[1.5px] rounded-full font-black uppercase tracking-[0.04em] leading-none transition-all duration-200 font-[var(--font-display)] ${pillSize(i)} ${
              activeSkill?.name === skill.name
                ? 'bg-primary text-[var(--color-accent)] border-primary'
                : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-[var(--color-bg)] scale-100 hover:scale-[1.04]'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {skill.name}
            <span
              className={`inline-block w-[7px] h-[7px] rounded-full ml-2 align-middle transition-opacity duration-200 ${
                activeSkill?.name === skill.name ? 'opacity-100 bg-[var(--color-accent)]' : 'opacity-40 bg-primary'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Exploded detail panel */}
      {activeSkill && (
        <div
          className="relative border-2 border-primary rounded-[20px] p-5 sm:p-6 md:p-8 overflow-hidden"
          style={{ backgroundColor: 'var(--color-accent)', minHeight: 'auto' }}
        >
          {/* Ghost background text */}
          <div
            className="absolute bottom-1 sm:-bottom-1 right-4 font-black uppercase leading-none pointer-events-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(69,14,22,0.1)',
              letterSpacing: '-0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            {activeSkill.name}
          </div>

          <div className="relative z-10 flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-4 sm:gap-5 items-start">
            {/* Left */}
            <div className="flex-1">
              <p className="text-[0.65rem] sm:text-[0.7rem] font-bold tracking-[0.2em] uppercase text-primary/40 mb-1">
                {activeSkill.cat}
              </p>
              <h2
                className="font-black uppercase leading-none tracking-[-0.04em] mb-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
              >
                {activeSkill.name}
              </h2>
              <p className="text-[0.75rem] sm:text-[0.85rem] font-semibold uppercase tracking-[0.05em] text-primary/60">
                {activeSkill.desc}
              </p>
              {/* Bar */}
              <div className="mt-4 sm:mt-6 w-full h-[2px] bg-primary/15 rounded-full relative">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${activeSkill.level}%` }}
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-row sm:flex-col items-end gap-3 sm:gap-3 pt-0 sm:pt-1">
              <div
                className="font-black leading-none tracking-[-0.05em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
              >
                {activeSkill.level}
                <span className="text-[1rem] sm:text-[1.2rem] opacity-40">%</span>
              </div>
              <span className="text-[0.6rem] sm:text-[0.65rem] font-black tracking-[0.15em] uppercase rounded-full px-2.5 sm:px-3 py-1 bg-primary text-[var(--color-accent)] whitespace-nowrap">
                {getLevelLabel(activeSkill.level)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
