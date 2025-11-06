import { Link } from "react-router-dom";

interface ProjectMeta {
  id: number;
  title: string;
  description: string;
  discipline: string;
  lastUpdated: string;
  contributors: number;
}

const ProjectCard: React.FC<{ project: ProjectMeta }> = ({ project }) => {
  return (
    <Link
      to={`/workspace/${project.id}`}
      className="group flex h-full flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/70 to-slate-900/30 p-6 transition hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-900/20"
    >
      <div className="space-y-4">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-200">
          {project.discipline}
        </span>
        <h3 className="text-xl font-semibold text-white group-hover:text-blue-100">
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {project.description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
        <span>{project.lastUpdated}</span>
        <span>{project.contributors} участников</span>
      </div>
    </Link>
  );
};

export default ProjectCard;
