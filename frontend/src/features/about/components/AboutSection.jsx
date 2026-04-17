import { useEffect, useState } from 'react';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaComment } from 'react-icons/fa';
import SectionFooter from '../../../shared/components/SectionFooter';
import FeedbackForm from '../../../shared/components/FeedbackForm';
import { useAbout } from '../../../hooks/usePortfolioData';

function LiveCounter() {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const start = new Date('2025-04-01');
    const tick = () => {
      const diff = Date.now() - start;
      const years = Math.floor(diff / (365.25 * 86400000));
      const months = Math.floor((diff % (365.25 * 86400000)) / (30.44 * 86400000));
      const days = Math.floor((diff % (30.44 * 86400000)) / 86400000);
      setElapsed(`${years}y ${months}m ${days}d`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return <span>{elapsed}</span>;
}

export default function AboutSection() {
  const { data: about } = useAbout();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const email = about?.email || 'iamvivek.verma@icloud.com';
  const bio = about?.bio || 'Turning complex user problems into seamless digital products. With a focus on the MERN stack and clean UX, I build applications that scale with your users. I don\'t just write code; I build solutions that matter.';
  const socials = about?.socials
    ? [
      { icon: FaLinkedin, link: about.socials.linkedin || '#', label: "LinkedIn" },
      { icon: FaGithub, link: about.socials.github || '#', label: "GitHub" },
      { icon: FaInstagram, link: about.socials.instagram || '#', label: "Instagram" },
      { icon: FaYoutube, link: about.socials.youtube || '#', label: "YouTube" },
    ]
    : [
      { icon: FaLinkedin, link: "https://www.linkedin.com/", label: "LinkedIn" },
      { icon: FaGithub, link: "https://github.com/", label: "GitHub" },
      { icon: FaInstagram, link: "https://instagram.com/", label: "Instagram" },
      { icon: FaYoutube, link: "https://www.youtube.com/", label: "YouTube" },
    ];

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-between py-8 gap-8">
      <div className="order-2 px-5">
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 overflow-hidden rounded-2xl">
            <img
              src="/assets/images/vivu.svg"
              alt="Vivek"
              className="w-full h-full object-cover xl:object-top object-center"
            />
          </div>
          <div className="lg:col-span-4 border bg-[var(--color-accent)] border-primary/20 text-primary p-5 rounded-2xl flex flex-col">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Vivek</h2>
            <p className="text-sm text-primary/55 mt-0.5 font-medium">Full-Stack Web Developer</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-green-700">Open to work</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary/80">{bio}</p>
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/40 mb-2">Key Expertise</h3>
              <p className="text-sm leading-relaxed text-primary/70">
                Full-stack Development, UX-Focused Engineering, Rapid Prototyping.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-xs text-primary/60">Building for <span className="font-semibold text-primary"><LiveCounter /></span></span>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/40 mb-2">Core values</h3>
              <p className="text-sm leading-relaxed text-primary/70">
                Clean code, continuous learning, and collaborative problem-solving.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex  px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end'>
        <SectionFooter
          className="lg:flex w-full lg:items-end"
          title="Information"
        />
        <div className='lg:flex  hidden items-center gap-5'>
          <img src='/assets/images/bot.png' className='w-30' />
          <div className='flex flex-col w-[400px]'>
            <h1 className="text-lg bg-fill font-semibold text-primary/90">Catching ideas is impossible—unless we're a team</h1>

            <a href={`mailto:${email}`} className="mt-3 text-xs text-primary/50 hover:text-primary transition font-medium">
              {email}
            </a>
            <div className="mt-5 flex gap-2 items-center flex-wrap">
              {socials.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" title={item.label}
                    className="w-9 h-9 rounded-full border border-primary/25 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group">
                    <Icon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </a>
                );
              })}
              <button
                onClick={() => setIsFeedbackOpen(true)}
                title="Send Feedback"
                className="w-9 h-9 rounded-full border border-primary/25 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
              >
                <FaComment className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>


      </div>

      <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </section>
  );
}
