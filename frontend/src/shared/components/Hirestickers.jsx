import { FaArrowRight } from 'react-icons/fa';

/**
 * Sticker-style CTA cluster for the empty right side of the About photo.
 *
 * Drop it inside the photo wrapper (the `relative overflow-hidden rounded-2xl` div)
 * right after the <img>. It positions itself absolutely and never blocks the photo.
 *
 * Props:
 *   emailHref - the safe mailto: link you already compute in AboutSection
 */

// Sampled from the torn red sticker in your photo. Swap for theme tokens if you prefer.
const RED = '#ff2d2d';
const CREAM = '#fff7e6';

// Text that wraps around the badge. Keep it ~40 characters so it fills the ring.
const RING_TEXT = "Got an idea? Let's talk ✦ Open to work ✦ ";

// Each chip opens an email draft with its own subject line, so the message
// you receive already tells you what the visitor wants.
const CHIPS = [
  { label: 'Got an idea? 💡', subject: "I've got an idea for you", tilt: '-rotate-3', filled: true },
  { label: 'Need a website? 🌐', subject: 'I need a website', tilt: 'rotate-2' },
  { label: 'Just saying hi 👋', subject: 'Hey Vivek!', tilt: '-rotate-2' },
];

const withSubject = (href, subject) =>
  `${href}${href.includes('?') ? '&' : '?'}subject=${encodeURIComponent(subject)}`;

export default function HireStickers({ emailHref }) {
  return (
    <div className="absolute inset-y-4 right-4 flex flex-col items-end justify-between gap-3 w-[30%] sm:w-[25%] lg:w-[22%] pointer-events-none">
      {/* Shared "torn paper" edge. Applied to backgrounds only, so text stays crisp. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="sticker-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* The one memorable thing: a spinning sticker badge that is also the main CTA - visible on all screens with responsive sizing */}
      <a
        href={withSubject(emailHref, "Let's build something")}
        aria-label="Email me"
        title="Say hello"
        className="pointer-events-auto relative block aspect-square w-[64px] transition-transform duration-300 ease-out hover:-rotate-6 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:w-[100px] md:w-[120px] lg:w-[136px]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{ background: RED, filter: 'url(#sticker-rough)' }}
        />

        <svg
          viewBox="0 0 120 120"
          aria-hidden="true"
          className="absolute inset-0 animate-[spin_18s_linear_infinite] motion-reduce:animate-none"
        >
          <defs>
            <path id="hire-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <text
            fill={CREAM}
            fontSize="11.5"
            fontWeight="600"
            style={{ fontFamily: 'var(--font-display, inherit)' }}
          >
            <textPath href="#hire-ring" textLength="272" lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>

        <span className="absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[#fff7e6]">
          <FaArrowRight className="-rotate-45 text-[10px] transition-transform duration-300 group-hover:rotate-0 lg:text-sm" />
        </span>
      </a>

      {/* Quiet secondary actions: what do you want from me? Always positioned as overlay on the photo */}
      <div className="flex flex-col items-end gap-2">
        {CHIPS.map(({ label, subject, tilt, filled }) => (
          <a
            key={label}
            href={withSubject(emailHref, subject)}
            title="Opens an email draft"
            className={`group pointer-events-auto relative inline-flex items-center whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition duration-200 ease-out hover:-translate-y-1 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${tilt} ${
              filled ? 'text-[#fff7e6]' : 'text-black hover:text-[#fff7e6]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full border-2 border-black transition-colors duration-200 ${
                filled ? 'bg-black group-hover:bg-[#ff2d2d]' : 'bg-transparent group-hover:bg-black'
              }`}
              style={{ filter: 'url(#sticker-rough)' }}
            />
            <span className="relative">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}