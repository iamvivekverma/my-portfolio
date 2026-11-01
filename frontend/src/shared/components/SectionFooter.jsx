/**
 * Page footer used on every section page: big title on the left, a hairline,
 * then a short line of copy on the right.
 *
 * The title is the page's only <h1> (the sliding rail above it is decorative),
 * so each page has one clear heading for screen readers.
 */
export default function SectionFooter({ title, tagline, description, className = "" }) {
  const hasCopy = Boolean(tagline || description);

  return (
    <div className={className}>
      <div className="text-primary">
        <h1
          className="font-bold leading-[1.05] text-[clamp(2.5rem,4vw,3.75rem)] whitespace-nowrap"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
        >
          {title}
        </h1>
      </div>

      <div className="w-full bg-primary/20 h-px hidden lg:block lg:mx-5" />

      {hasCopy && (
        <div
          className="mt-3 lg:mt-0 flex flex-col gap-1.5 text-left lg:w-[min(30rem,36vw)] lg:shrink-0"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {tagline && <p className="text-sm font-medium text-primary italic">{tagline}</p>}
          {description && <p className="text-sm text-primary/70 leading-relaxed">{description}</p>}
        </div>
      )}
    </div>
  );
}
