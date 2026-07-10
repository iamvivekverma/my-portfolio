import { useEffect, useState, useMemo } from 'react';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaComment, FaTrophy } from 'react-icons/fa';
import SectionFooter from '../../../shared/components/SectionFooter';
import FeedbackForm from '../../../shared/components/FeedbackForm';
import { toSafeEmailText, toSafeMailtoHref, toSafeUrl } from '../../../shared/utils/urlSafety';
import AchievementsSection from '../../achievements/components/AchievementsSection';
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
  const [showAchievements, setShowAchievements] = useState(false);

  // Prevent body scroll when achievements modal is open
  useEffect(() => {
    document.body.style.overflow = showAchievements ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAchievements]);

  // Optimized variables and memoized array to prevent unnecessary re-renders
  const fallbackEmail = 'iamvivek.verma@icloud.com';
  const email = toSafeEmailText(about?.email, fallbackEmail);
  const emailHref = toSafeMailtoHref(about?.email, fallbackEmail);
  const bio = about?.bio || "Turning complex user problems into seamless digital products. With a focus on the MERN stack and clean UX, I build applications that scale with your users. I don't just write code; I build solutions that matter.";
  
  const socials = useMemo(() => [
    { icon: FaLinkedin, link: toSafeUrl(about?.socials?.linkedin, { fallback: 'https://www.linkedin.com/' }), label: "LinkedIn" },
    { icon: FaGithub, link: toSafeUrl(about?.socials?.github, { fallback: 'https://github.com/' }), label: "GitHub" },
    { icon: FaInstagram, link: toSafeUrl(about?.socials?.instagram, { fallback: 'https://instagram.com/' }), label: "Instagram" },
    { icon: FaYoutube, link: toSafeUrl(about?.socials?.youtube, { fallback: 'https://www.youtube.com/' }), label: "YouTube" },
  ], [about?.socials]);

  return (
    <section className="flex flex-col py-8 gap-8 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
      
      <div className="order-2 px-5 flex-1 lg:min-h-0">
        <div className="grid lg:grid-cols-12 gap-5 lg:h-full">
          
          <div className="lg:col-span-8 overflow-hidden rounded-2xl lg:h-full">
            <img
              src="/assets/images/vivek.svg"
              alt="Vivek"
              className="w-full h-full object-cover object-[50%_20%]"
            />
          </div>
          
          <div className="lg:col-span-4 border bg-[var(--color-accent)] border-primary/20 text-primary p-5 rounded-2xl flex flex-col lg:justify-between lg:h-full lg:overflow-hidden">
            
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Vivek</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm text-primary/55 font-medium">Full-Stack Web Developer</p>
                <button
                  onClick={() => setShowAchievements(true)}
                  className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary hover:shadow-lg transition-all duration-300 group shadow-md cursor-pointer"
                  title="View Achievements"
                >
                  <FaTrophy className="text-xl text-primary group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-700">Open to work</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-primary/80">{bio}</p>
            </div>

            <div className="mt-4 lg:mt-0">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/40 mb-2">Key Expertise</h3>
              <p className="text-sm leading-relaxed text-primary/70">
                Full-stack Development, UX-Focused Engineering, Rapid Prototyping.
              </p>
              
              <div className="mt-4 inline-flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1.5 self-start w-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-xs text-primary/60">Building for <span className="font-semibold text-primary"><LiveCounter /></span></span>
              </div>
            </div>

            <div className="mt-4 lg:mt-0">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/40 mb-2">Core values</h3>
              <p className="text-sm leading-relaxed text-primary/70">
                Clean code, continuous learning, and collaborative problem-solving.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className='flex px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end'>
        <SectionFooter
          className="lg:flex w-full lg:items-end"
          title="Information"
        />
        <div className='lg:flex hidden items-center gap-5'>
          <img src='/assets/images/bot.png' className='w-30' alt='Bot' />
          <div className='flex flex-col w-[400px]'>
            <h1 className="text-lg bg-fill font-semibold text-primary/90">Catching ideas is impossible—unless we're a team</h1>

            <a href={emailHref} className="mt-3 text-xs text-primary/50 hover:text-primary transition font-medium">
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
                title="Share Feedback"
                className="w-9 h-9 rounded-full border border-primary/25 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group cursor-pointer"
              >
                <FaComment className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg)] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-primary/10">
              <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                My Achievements
              </h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
              >
                <span className="text-2xl text-primary group-hover:text-white">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AchievementsSection />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}