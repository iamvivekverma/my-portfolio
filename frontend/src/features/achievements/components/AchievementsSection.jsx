import React, { useState, useMemo, memo } from "react";
import { useAchievements } from "../../../hooks/usePortfolioData";


const SCROLL_STYLES = `
  .custom-scrollbar::-webkit-scrollbar { height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #fdcb6e; border-radius: 10px; }
  .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #fdcb6e transparent; }
  
  .wavy-underline {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0 5 Q25 0 50 5 T100 5' fill='none' stroke='%23fdcb6e' stroke-width='3'/%3E%3C/svg%3E") repeat-x center;
    background-size: auto 100%;
  }

  @keyframes achFadeIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

// Memoized Card Component for performance
const CertCard = memo(({ cert, index }) => {
  const isWinner = cert.isWinner;

  // Pre-generate WhatsApp link to keep render method clean
  const shareLink = useMemo(() => {
    const msg = `Hey Vivek, I'd like to verify your certificate: ${cert.title} from ${cert.issuer}.`;
    return `https://wa.me/917209640726?text=${encodeURIComponent(msg)}`;
  }, [cert.title, cert.issuer]);

  return (
    <div 
      className="flex-shrink-0 w-[320px] md:w-[400px] snap-start group relative"
      style={{ 
        animation: `achFadeIn 0.5s ease-out ${index * 0.05}s both`,
        willChange: 'transform, opacity'
      }}
    >
      {isWinner && (
        <div className="absolute inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-500" />
      )}
      
      <div className="relative h-full flex flex-col bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-slate-100 hover:border-amber-400/50 hover:-translate-y-2 transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="relative pb-2 font-bold text-lg text-slate-800">
            {cert.issuerLogo || "CERT"}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 wavy-underline" />
          </div>
          
          {isWinner && (
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-amber-200">
              🏆 Winner
            </span>
          )}
        </div>

        {/* Info */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
            {cert.issuer}
          </p>
          <h3 className="font-syne text-xl font-extrabold text-slate-900 leading-tight line-clamp-2">
            {cert.title}
          </h3>
        </div>

        <p 
          className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-4"
          dangerouslySetInnerHTML={{ __html: cert.description }}
        />

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {cert.skills?.slice(0, 4).map((skill, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm"
                title={skill}
              >
                {skill.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>

          <a 
            href={shareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-4 py-2 bg-[#2D0A0E] text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/link"
          >
            <span className="flex items-center gap-2">
              VERIFY
              <svg className="w-3 h-3 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
});

export default function AchievementsSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: achievements = [], loading } = useAchievements();

  // 1. Logic: Standardized filter keys
  const filterKeys = ["all", "winner", "hackathon", "wscube"];

  // 2. Performance: Memoized Filtering
  const filteredData = useMemo(() => {
    if (activeFilter === "all") return achievements;
    return achievements.filter(item => 
      item.category?.includes(activeFilter) || 
      (activeFilter === "winner" && item.isWinner)
    );
  }, [achievements, activeFilter]);

  return (
    <>
      <style>{SCROLL_STYLES}</style>
      
      <section className="relative px-4 lg:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-8 mb-4 lg:mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2 lg:mb-4">
                <span className="w-8 lg:w-10 h-[2px] bg-amber-400 rounded-full" />
                <span className="text-amber-600 font-bold text-[10px] lg:text-xs uppercase tracking-widest">
                  Verified Milestones
                </span>
              </div>
              <h2 className="font-syne text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[0.95]">
                My Digital <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Credentials.
                </span>
              </h2>
            </div>

            {/* Filter UI */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 self-start">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-200
                    ${activeFilter === key 
                      ? "bg-slate-900 text-amber-400 shadow-md scale-105" 
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="custom-scrollbar flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 lg:pb-8 snap-x snap-mandatory">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[320px] md:w-[400px] h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
              ))
            ) : (
              <>
                {filteredData.map((cert, i) => (
                  <CertCard key={cert._id || i} cert={cert} index={i} />
                ))}
                {/* Scroll-end spacer */}
                <div className="flex-shrink-0 w-8" />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}