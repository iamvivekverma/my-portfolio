const defaultItems = [
  { text: "TRAVEL THE WORLD",  icon: "assets/images/skills.svg",   alt: "Skills" },
  { text: "INSPIRE MINDS",     icon: "assets/images/projects.svg", alt: "Projects" },
  { text: "THINK DIFFERENT",   icon: "assets/images/bot.svg",      alt: "Bot" },
  { text: "INNOVATE DAILY",    icon: "assets/images/about.svg",    alt: "About" },
];

export default function SlidingText({ items = defaultItems, speed = 20, className = "" }) {
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`overflow-hidden w-full  ${className}`} style={{ height: "clamp(60px, 8vw, 90px)" }}>
      <div
        className="flex whitespace-nowrap items-center gap-5 h-full"
        style={{ animation: `slide ${speed}s linear infinite` }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={index} className="flex items-center gap-6 shrink-0">
            <h1 className="stroke-text-slide">{item.text}</h1>
            {typeof item.icon === "string" ? (
              <img src={item.icon} className="icon" alt={item.alt || ""} />
            ) : (
              <div className="icon flex items-center justify-center text-primary text-5xl">
                {item.icon}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
