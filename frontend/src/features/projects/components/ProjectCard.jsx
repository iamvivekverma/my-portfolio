import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useProjects } from '../../../hooks/usePortfolioData';
import { buildApiUrl } from '../../../services/api';

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-primary/5 border border-primary/10 rounded-2xl p-5 sm:min-w-[280px] sm:max-w-[320px] lg:min-w-[300px] lg:max-w-[350px] flex flex-col gap-3 flex-shrink-0">
      <div className="h-[160px] bg-primary/10 rounded-xl flex-shrink-0" />
      <div className="h-4 w-3/4 bg-primary/10 rounded" />
      <div className="h-3 w-full bg-primary/5 rounded" />
      <div className="h-3 w-2/3 bg-primary/5 rounded" />
    </div>
  );
}

export default function ProjectCard() {
  const { data: rawProjects, loading } = useProjects();
  const projects = rawProjects.map((item) => ({
    _id: item._id,
    title: item.title,
    desc: item.description,
    technologies: item.technologies,
    badge: item.badge,
    githubLink: item.githubLink,
    liveLink: item.liveLink,
    image: item.image || (item._id ? buildApiUrl(`/projects/${item._id}/image`) : null),
  }));

  const badgeStyle = {
    "NDA – Confidential": "bg-primary/10 text-primary",
    "Case-study":         "bg-violet-100 text-violet-700",
    "Open source":        "bg-emerald-100 text-emerald-700",
  };

  return (
    <section className="w-full">
      <div className="flex flex-col sm:flex-row gap-5 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {loading
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : projects.map((project, index) => (
              <div
                key={index}
                className="bg-[var(--color-accent)] rounded-2xl p-4 sm:max-w-[320px] flex flex-col gap-4 flex-shrink-0
                           transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Image placeholder */}
                <div className="relative rounded-xl overflow-hidden bg-primary/10 h-[300px] flex items-center justify-center flex-shrink-0">
                  {project.image
                    ? <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-2 text-primary/30">
                        <FaExternalLinkAlt className="text-3xl" />
                        <span className="text-xs font-medium">Project Preview</span>
                      </div>
                  }
                  {project.badge && (
                    <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium ${badgeStyle[project.badge] || 'bg-primary text-white'}`}>
                      {project.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <h3 className="text-base font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {project.title}
                  </h3>
                </div>

                {/* Button */}
                <div className="mt-auto flex items-center justify-end flex-shrink-0">
                  <Link 
                    to={`/locked-project?id=${project._id || index}`}
                    className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-medium"
                  >
                    see more &gt;&gt;
                  </Link>
                </div>
              </div>
            ))
        }
      </div>
    </section>
  );
}
