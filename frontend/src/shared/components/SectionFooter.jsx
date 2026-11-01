export default function SectionFooter({ title, tagline, description, className = "" }) {
  return (
    <div className={`${className}`}>
      <div className="text-primary">
        <h2 className="font-bold leading-[1.05] text-[clamp(2.5rem,4vw,3.75rem)] whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}>
          {title}
        </h2>
      </div>

      <div className="w-full bg-primary/20 h-px hidden lg:block" />

      <div className="flex flex-col gap-1.5 text-right">
        <p className="text-sm font-medium text-primary italic" style={{ fontFamily: "var(--font-sans)" }}>{tagline}</p>
        <p className="text-sm text-primary/50 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{description}</p>
      </div>
    </div>
  );
}
