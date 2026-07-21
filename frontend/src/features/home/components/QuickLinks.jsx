import React from 'react';
import { useAbout } from '../../../hooks/usePortfolioData';
import { toSafeUrl } from '../../../shared/utils/urlSafety';

export default function QuickLinks() {
  const { data: about } = useAbout();

  const quickLinks = [
    { label: "PDF 1", href: "/assets/MBBS_College_Options_2026.pdf", download: true },
    { label: "PDF 2", href: "/assets/prer.pdf", download: true },
    { label: "Resume", href: "/resume", download: false },
    { label: "GitHub", href: toSafeUrl(about?.socials?.github, { fallback: "https://github.com/" }) },
    { label: "LinkedIn", href: toSafeUrl(about?.socials?.linkedin, { fallback: "https://www.linkedin.com/" }) },
  ];

  return (
    <div className="flex flex-col items-start gap-2 mt-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-primary/45">
            Quick Links
          </span>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {quickLinks.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3">
                <a
                  href={item.href}
                  {...(item.download ? { download: true } : {})}
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="max-[500px]:text-[13px] font-medium tracking-[0.08em] text-primary/72 transition hover:text-primary"
                >
                  {item.label}
                </a>
                {index !== quickLinks.length - 1 && (
                  <span className="text-primary/25">/</span>
                )}
              </div>
            ))}

          </div>
        </div>
  )
}
