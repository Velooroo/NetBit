import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import CanvasSurface from "../components/workspace/CanvasSurface";

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams();
  const location = useLocation() as { state?: { name?: string; description?: string } };

  const projectName = useMemo(() => {
    if (location.state?.name) return location.state.name;
    if (!projectId || projectId === "new") return "New Project";
    return projectId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [location.state?.name, projectId]);

  return (
    <AppShell>
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold text-white">{projectName}</h1>
            <p className="text-xs text-slate-500">
              {location.state?.description || "Canvas workspace"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition">
              Share
            </button>
            <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition">
              Export
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CanvasSurface />
        </div>
      </div>
    </AppShell>
  );
};

export default WorkspacePage;
