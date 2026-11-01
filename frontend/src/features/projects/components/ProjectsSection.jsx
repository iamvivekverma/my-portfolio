import ProjectCard from './ProjectCard';
import SlidingText from '../../../shared/components/SlidingText';
import SectionFooter from '../../../shared/components/SectionFooter';

export default function ProjectsSection() {
  return (
    <section className="min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] lg:min-h-0 lg:overflow-hidden flex flex-col py-8 gap-8 lg:gap-6 justify-between lg:[@media(max-height:760px)]:py-4 lg:[@media(max-height:760px)]:gap-3">

      {/* relative z-10 keeps the text above the card shadows, which fall over the neighbouring blocks */}
      <div className="relative z-10 w-full overflow-hidden order-3 lg:order-1">
        <SlidingText speed={7} />
      </div>

      {/*
        flex-1: the cards get all the height the other two blocks leave over.
        ProjectCard measures this box and fits the whole fan inside it, which is what keeps the desktop layout scroll-free.
      */}
      <div className="order-2 flex flex-1 flex-col lg:min-h-0">
        <ProjectCard />
      </div>

      <SectionFooter
        className="relative z-10 flex flex-col px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end"
        title="Web Projects"
        tagline="Code that speaks."
        description="Each of these started with a real problem. I build the interface and the API behind it, and I care as much about how it feels to use as how it runs."
      />
    </section>
  );
}
