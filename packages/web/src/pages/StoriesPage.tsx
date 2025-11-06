import AppShell from "../components/layout/AppShell";

const stories = [
  {
    title: "Aurora Collective x MIT",
    summary: "Как команда использовала Netbit Canvas и Git для подготовки к MIT Media Lab.",
    highlight: "Наставники помогли оформить исследования в единый презентационный пакет.",
  },
  {
    title: "PhysAI: из лаборатории в стартап",
    summary: "Студенческая лаборатория получила финансирование, показав рабочий Canvas и отчёты.",
    highlight: "Netbit Energy выделил 200 GPU-часов и enterprise-наставника.",
  },
];

const StoriesPage: React.FC = () => {
  return (
    <AppShell>
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">Истории</h1>
          <p className="text-sm text-slate-300/80">
            Кейсы лабораторий, получивших поддержку Netbit и мировое признание.
          </p>
        </header>

        <section className="space-y-4">
          {stories.map((story, idx) => (
            <article
              key={story.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/10 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <h2 className="text-xl font-semibold text-white">{story.title}</h2>
              <p className="mt-2 text-sm text-slate-300/85">{story.summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.35em] text-blue-100/80">
                {story.highlight}
              </p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
};

export default StoriesPage;
