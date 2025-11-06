import AppShell from "../components/layout/AppShell";

const teamMembers = [
  { email: "polina@aurora.netbit", role: "Owner" },
  { email: "maxwell@aurora.netbit", role: "Editor" },
  { email: "you@netbit.dev", role: "Viewer" },
];

const SettingsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>

        <div className="space-y-8">
          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                  defaultValue="Researcher"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                  defaultValue="lab@netbit.dev"
                />
              </div>
              <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition">
                Save Changes
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Team</h2>
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition">
                Invite Member
              </button>
            </div>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white">{member.email}</span>
                  <span className="text-xs text-slate-500">{member.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
