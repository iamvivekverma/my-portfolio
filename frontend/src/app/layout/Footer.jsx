import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaComment } from "react-icons/fa";
import FeedbackForm from "../../shared/components/FeedbackForm";
import { useAbout } from "../../hooks/usePortfolioData";

export default function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { data: about } = useAbout();

  const socialLinks = about?.socials
    ? [
        { icon: FaLinkedin,  href: about.socials.linkedin || "https://www.linkedin.com/",  label: "LinkedIn" },
        { icon: FaGithub,    href: about.socials.github || "https://github.com/",       label: "GitHub" },
        { icon: FaInstagram, href: about.socials.instagram || "https://instagram.com/",    label: "Instagram" },
        { icon: FaYoutube,   href: about.socials.youtube || "https://www.youtube.com/",  label: "YouTube" },
      ]
    : [
        { icon: FaLinkedin,  href: "https://www.linkedin.com/", label: "LinkedIn" },
        { icon: FaGithub,    href: "https://github.com/",       label: "GitHub" },
        { icon: FaInstagram, href: "https://instagram.com/",    label: "Instagram" },
        { icon: FaYoutube,   href: "https://www.youtube.com/",  label: "YouTube" },
      ];

  return (
    <footer className="pt-8 pb-3 w-full lg:hidden">
      <div className="flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 shadow-lg flex items-center justify-center overflow-hidden">
            <img src="/assets/images/bot.png" alt="Bot illustration" className="w-full h-full" />
          </div>
          <h2 className="text-base font-bold text-primary leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            Ready to turn ideas into<br />scalable web solutions?
          </h2>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider">Contact me</p>
          <a href="mailto:iamvivek.verma@icloud.com" className="text-primary/60 text-sm hover:text-primary transition">
            iamvivek.verma@icloud.com
          </a>

          <nav className="px-5 w-full mt-4">
            <div className="flex gap-6 text-sm justify-center border-t border-b border-primary/15 py-4 mx-auto text-primary/60">
              <Link to="/projects" className="hover:text-primary transition">Projects</Link>
              <Link to="/experience" className="hover:text-primary transition">Experience</Link>
              <Link to="/skills" className="hover:text-primary transition">Skills</Link>
              <Link to="/about" className="hover:text-primary transition">About</Link>
            </div>
          </nav>
        </div>

        <div className="flex gap-3 -mt-4">
          {socialLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" title={item.label}
                 className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group">
                <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </a>
            );
          })}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            title="Send Feedback"
            className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
          >
            <FaComment className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
          </button>
        </div>

        <p className="text-xs text-primary/40 -mt-4">
          Designed, developed & maintained by Vivek
        </p>

        <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      </div>
    </footer>
  );
}
