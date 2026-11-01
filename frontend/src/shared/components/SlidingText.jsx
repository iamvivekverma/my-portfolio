const defaultItems = [
  { text: "TRAVEL THE WORLD",  icon: "assets/images/skills.svg",   alt: "Skills" },
  { text: "INSPIRE MINDS",     icon: "assets/images/projects.svg", alt: "Projects" },
  { text: "THINK DIFFERENT",   icon: "assets/images/bot.svg",      alt: "Bot" },
  { text: "INNOVATE DAILY",    icon: "assets/images/about.svg",    alt: "About" },
];

// A half of the rail has to be wider than the screen or a gap shows up when it loops.
const MIN_ITEMS = 4;

export default function SlidingText({ items = defaultItems, speed = 20, className = "", height = "clamp(65px, 8.5vh, 95px)" }) {
  const source = items.length ? items : defaultItems;

  // Short lists get repeated so the loop never shows a gap. The duration is scaled by the
  // same factor, so the scroll speed (px per second) doesn't change.
  const repeat = Math.max(1, Math.ceil(MIN_ITEMS / source.length));
  const half = Array.from({ length: source.length * repeat }, (_, i) => source[i % source.length]);
  const duplicatedItems = [...half, ...half];

  return (
    // Purely decorative, so it's hidden from assistive tech.
    <div
      aria-hidden="true"
      className={`overflow-hidden w-full  ${className}`}
      style={{ height }}
    >
      <div
        className="slide-rail flex whitespace-nowrap items-center gap-5 h-full"
        style={{ animation: `slide ${speed * repeat}s linear infinite` }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={index} className="flex items-center gap-6 shrink-0">
            <span className="stroke-text-slide leading-[1.15]" style={{ fontSize: "clamp(4rem, 8vw, 5.5rem)" }}>{item.text}</span>
            {typeof item.icon === "string" ? (
              <img src={item.icon} className="icon" alt="" style={{ width: "clamp(44px, 7.5vw, 56px)", height: "clamp(44px, 7.5vw, 56px)" }} />
            ) : (
              <div className="icon flex items-center justify-center text-primary" style={{ width: "clamp(44px, 7.5vw, 56px)", height: "clamp(44px, 7.5vw, 56px)", fontSize: "clamp(2.25rem, 4.5vw, 2.75rem)" }}>
                {item.icon}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
