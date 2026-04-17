export default function SectionFooter({ title, tagline, description, className = "" }) {
  return (
    <div className={`${className}`}>
      <div className="text-primary">
        <p className="text-xs font-medium tracking-widest uppercase text-primary/40 mb-1">Vivek's</p>
        <h2 className="font-extrabold leading-[1.05] text-[clamp(2.5rem,4vw,3.75rem)] whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
          {title}
        </h2>
      </div>

      <div className="w-full bg-primary/20 h-px hidden lg:block" />

      <div className="flex flex-col gap-1.5 text-right">
        <p className="text-sm font-medium text-primary italic">{tagline}</p>
        <p className="text-sm text-primary/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
