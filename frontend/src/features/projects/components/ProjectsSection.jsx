import ProjectCard from './ProjectCard';
import SlidingText from '../../../shared/components/SlidingText';
import SectionFooter from '../../../shared/components/SectionFooter';

export default function ProjectsSection() {


  return (
    <section className="min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] lg:min-h-0 lg:overflow-hidden flex flex-col py-8 gap-8 lg:gap-6 justify-between">

      <div className="w-full overflow-hidden order-3 lg:order-1">
        <SlidingText speed={10} />
      </div>

      <div className="order-2">

        <ProjectCard />
      </div>

      <SectionFooter
        className="flex flex-col px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end"
        title="Web Projects"
        tagline="Code that speaks."
        description="Travel to discover. Inspire to create. Think to solve. Innovate to build better web experiences."
      />
    </section>
  );
}
