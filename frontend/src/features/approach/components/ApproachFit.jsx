import { FaLightbulb, FaCubes, FaFlask, FaPencilRuler } from 'react-icons/fa';
import SlidingText from '../../../shared/components/SlidingText';
import SectionFooter from '../../../shared/components/SectionFooter';
import { useAbout } from '../../../hooks/usePortfolioData';
import { toSafeEmailText, toSafeMailtoHref } from '../../../shared/utils/urlSafety';
import { CLOSING } from '../approachData';
import ApproachCanvas from './ApproachCanvas';

const FONT = 'var(--font-approach)';

const RAIL = [
  { text: 'FIGURE IT OUT', icon: <FaLightbulb />, alt: 'Understand' },
  { text: 'BUILD', icon: <FaCubes />, alt: 'Build' },
  { text: 'TEST', icon: <FaFlask />, alt: 'Test' },
  { text: 'REFINE', icon: <FaPencilRuler />, alt: 'Refine' },
];

export default function ApproachFit() {
  const { data: about } = useAbout();
  const emailHref = toSafeMailtoHref(about?.email, 'iamvivek.verma@icloud.com');
  const email = toSafeEmailText(about?.email, 'iamvivek.verma@icloud.com');

  return (
    <section className="flex h-[calc(100vh-5rem)] flex-col gap-[1.6vh] overflow-hidden py-4" style={{ fontFamily: FONT }}>
      <div className="order-1 w-full overflow-hidden [&_.icon]:!h-[clamp(44px,7.5vw,56px)] [&_.icon]:!w-[clamp(44px,7.5vw,56px)] [&_.stroke-text-slide]:text-[clamp(4rem,8vw,5.5rem)]!">
        <SlidingText items={RAIL} speed={18} height="clamp(65px, 8.5vh, 95px)" />
      </div>

      <div className="order-2 flex min-h-0 flex-1 flex-col  px-5">
        <ApproachCanvas />
      </div>

      <div className="order-3 flex w-full items-end gap-8 px-5">
        <SectionFooter
          className="flex min-w-0 flex-1 items-end"
          font={FONT}
          title="Approach"
          tagline={CLOSING.lines.join(' ')}
          description={CLOSING.body.join(' ')}
        />
        <div className="flex shrink-0 items-center gap-4 pb-1">
          <p className="max-w-[10rem] text-sm font-medium leading-tight text-primary">{CLOSING.invite}</p>
          <a
            href={emailHref}
            title={email}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-colors duration-200 hover:bg-[var(--color-fill)] hover:text-primary"
          >
            {CLOSING.action}
            <svg viewBox="0 0 28 10" className="w-5 fill-none stroke-current transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M0 5h26M22 1l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
