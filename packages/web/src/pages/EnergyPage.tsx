import AppShell from "../components/layout/AppShell";

const grants = [
  {
    name: "Netbit Energy • Tier 1",
    description: "50 GPU-часов и консультации наставника. Для студенческих групп на ранней стадии.",
    progress: 70,
  },
  {
    name: "Netbit Energy • Tier 2",
    description: "120 GPU-часов, доступ к лабораторным ресурсам и private Canvas.",
    progress: 45,
  },
  {
    name: "Industry Fellowship",
    description: "Enterprise-команда финансирует исследования. Netbit гранты направляются в студенческие лаборатории.",
    progress: 90,
  },
];

const EnergyPage: React.FC = () => {
  return (
    <AppShell>
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">Гранты и ресурсы</h1>
          <p className="text-sm text-slate-300/80">
            Netbit распределяет вычислительные мощности и наставников за счёт корпоративных подписок.
          </p>
        </header>

        <section className="space-y-4">
          {grants.map((grant) => (
            <article
              key={grant.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur-xl"
            >
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{grant.name}</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-blue-100/80">
                  {grant.progress}% заполнения
                </span>
              </header>
              <p className="mt-3 text-slate-300/85">{grant.description}</p>
              <div className="mt-5 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${grant.progress}%` }}
                />
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
};

export default EnergyPage;
