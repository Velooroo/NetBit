import AppShell from "../components/layout/AppShell";

const teams = [
  {
    id: 1,
    name: "Aurora Collective",
    focus: "Interfaces and data visualization",
    mentors: ["Polina Streltsova", "Maxwell Yang"],
    slots: 3,
  },
  {
    id: 2,
    name: "Photon Forge",
    focus: "Optics and quantum computing",
    mentors: ["Dr. Elise Tran"],
    slots: 1,
  },
  {
    id: 3,
    name: "BioMesh Lab",
    focus: "Biomechanics and neuroimplants",
    mentors: ["Nikita Lazarev", "Lena D."],
    slots: 4,
  },
];

const CommunityPage: React.FC = () => {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Community</h1>
          <p className="mt-2 text-sm text-slate-400">
            Teams and mentors collaborating on interdisciplinary projects
          </p>
        </div>

        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
            >
              <div>
                <h2 className="text-base font-medium text-white">{team.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{team.focus}</p>
                <div className="mt-2 flex gap-2 text-xs text-slate-500">
                  {team.mentors.map((mentor) => (
                    <span key={mentor}>{mentor}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                {team.slots} slots
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default CommunityPage;
