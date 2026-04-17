import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import { useProject } from '../hooks/usePortfolioData';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, loading } = useProject(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-black text-primary mb-4">Project not found</h1>
          <Link to="/projects" className="text-primary underline">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const badgeStyle = {
    "NDA – Confidential": "bg-primary/10 text-primary",
    "Case-study": "bg-violet-100 text-violet-700",
    "Open source": "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-5">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-6 font-medium"
        >
          <FaArrowLeft />
          Back to Projects
        </button>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {project.title}
            </h1>
            {project.badge && (
              <span className={`text-xs px-2 py-1 w-80 text-center md:w-55 rounded-full font-medium ${badgeStyle[project.badge] || 'bg-primary/10 text-primary'}`}>
                {project.badge}
              </span>
            )}
          </div>
          <p className="text-lg text-primary/70 leading-relaxed mb-6">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.technologies?.map(tech => (
              <span key={tech} className="text-sm bg-white/50 text-primary/70 px-3 py-1 rounded-full border border-primary/10">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Project Image/Preview */}
        {project.image ? (
          <div className="mb-8 rounded-2xl overflow-hidden bg-primary/10 h-[400px] flex items-center justify-center">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mb-8 rounded-2xl overflow-hidden bg-primary/10 h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-primary/30">
              <FaExternalLinkAlt className="text-5xl" />
              <span className="text-sm font-medium">Project Preview</span>
            </div>
          </div>
        )}

        {/* Full Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            About This Project
          </h2>
          <p className="text-base text-primary/70 leading-relaxed">
            {project.fullDescription || project.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {project.githubLink && project.githubLink !== '#' && (
            <a 
              href={project.githubLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-medium"
            >
              <FaGithub />
              View Code
            </a>
          )}
          {project.liveLink && project.liveLink !== '#' && (
            <a 
              href={project.liveLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/85 transition-all duration-200 font-medium"
            >
              <FaExternalLinkAlt />
              Live Demo
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
