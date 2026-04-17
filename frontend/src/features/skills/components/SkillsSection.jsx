import SkillCard from './SkillCard';
import SlidingText from '../../../shared/components/SlidingText';
import SectionFooter from '../../../shared/components/SectionFooter';
import { SiReact } from 'react-icons/si';
import { useSkills } from '../../../hooks/usePortfolioData';

export default function SkillsSection() {
  const { data: skills } = useSkills();
  const skillsItems = skills.slice(0, 4).map((skill) => ({
    text: skill.name.toUpperCase(),
    icon: <SiReact />,
    alt: skill.name,
  }));

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-between py-8 gap-8">
      <div className="w-full order-3 lg:order-1">
        <SlidingText items={skillsItems} speed={15} className=''/>
      </div>

      <div className="order-2 px-5">
        <SkillCard />
      </div>

      <SectionFooter
        className="flex flex-col px-5 w-full order-1 lg:order-3 lg:flex-row lg:items-end"
        title="Tech Stack"
        tagline="What I work with"
        description="Full-stack development using React, Node.js, MongoDB, and Git — with a bit of AI magic to speed things up."
      />
    </section>
  );
}
