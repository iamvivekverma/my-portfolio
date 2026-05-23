import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useProjects } from '../../../hooks/usePortfolioData';
import { buildApiUrl } from '../../../services/api';

function SkeletonCard() {
  return (
    <div className="w-full sm:w-[320px] lg:w-[350px] animate-pulse bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col gap-3 flex-shrink-0">
      <div className="h-[160px] bg-primary/10 rounded-xl flex-shrink-0" />
      <div className="h-4 w-3/4 bg-primary/10 rounded" />
      <div className="h-3 w-full bg-primary/5 rounded" />
      <div className="h-3 w-2/3 bg-primary/5 rounded" />
    </div>
  );
}

export default function ProjectCard() {
  const { data: rawProjects, loading } = useProjects();
  const [failedImages, setFailedImages] = useState(() => new Set());
  const projects = rawProjects.map((item) => ({
    _id: item._id,
    title: item.title,
    desc: item.description,
    technologies: item.technologies,
    badge: item.badge,
    githubLink: item.githubLink,
    liveLink: item.liveLink,
    isLocked: Boolean(item.isLocked),
    image: item._id && !failedImages.has(item._id) ? buildApiUrl(`/projects/${item._id}/image`) : null,
  }));

  const badgeStyle = {
    "NDA – Confidential": "bg-primary/10 text-primary",
    "Case-study":         "bg-violet-100 text-violet-700",
    "Open source":        "bg-emerald-100 text-emerald-700",
  };

  return (
    <section className="w-full">
      <div className="flex flex-col sm:flex-row gap-5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-hide">
        {loading
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : projects.map((project, index) => (
            <div
                key={project._id}
                className="w-full sm:w-[320px] lg:w-[350px] bg-[var(--color-accent)] rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0
                           transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Image placeholder */}
                <div className="relative rounded-xl overflow-hidden bg-primary/10 h-[300px] flex items-center justify-center flex-shrink-0">
                  {project.image
                    ? <img
                        src={project.image}
                        alt={project.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setFailedImages((current) => {
                            const next = new Set(current);
                            next.add(project._id);
                            return next;
                          })
                        }
                      />
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
                    to={`/project/${project._id}`}
                    state={project.isLocked ? { isLocked: true } : null}
                    className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-medium"
                  >
                    {'see more >>'}
                  </Link>
                </div>
              </div>
            ))
        }
      </div>
    </section>
  );
}
