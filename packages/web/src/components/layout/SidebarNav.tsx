import { NavLink } from "react-router-dom";

const primaryLinks = [
  { to: "/", label: "Лаборатория", glyph: "⚗", caption: "Проекты и команды" },
  { to: "/workspace/new", label: "Canvas", glyph: "🪟", caption: "Пространственные холсты" },
  { to: "/archive", label: "Архив", glyph: "🗂", caption: "Исследовательские досье" },
  { to: "/community", label: "Сообщество", glyph: "🌐", caption: "Сети наставников" },
];

const quickLinks = [
  { to: "/settings", label: "Настройки", glyph: "⚙" },
  { to: "/stories", label: "Истории", glyph: "✦" },
];

const SidebarNav: React.FC = () => {
  return (
    <aside className="hidden w-[19rem] shrink-0 border-r border-white/5 bg-slate-950/75 backdrop-blur-3xl lg:flex lg:flex-col">
      <div className="px-7 pt-9 pb-8">
        <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent p-5 shadow-2xl transition-all duration-500 hover:shadow-blue-500/25 hover:border-blue-400/30">
          {/* macOS-style subtle shine effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.45em] text-blue-100/80 transition-colors duration-300 group-hover:text-blue-100">
              Netbit
            </p>
            <h1 className="mt-4 text-2xl font-semibold text-white transition-transform duration-300 group-hover:translate-x-0.5">
              Creative Core
            </h1>
            <p className="mt-3 text-xs text-blue-100/80 leading-relaxed">
              Управляйте исследованиями, кодом и холстами как единым продуктом.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-5 overflow-y-auto">
        {primaryLinks.map(({ to, label, glyph, caption }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "group relative block overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-300",
                isActive
                  ? "border-blue-400/60 bg-blue-500/20 text-blue-50 shadow-xl shadow-blue-500/25 scale-[1.02]"
                  : "border-white/5 bg-white/5 text-slate-200/90 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white hover:scale-[1.01]",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
                )}
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide transition-all duration-200">
                      {label}
                    </div>
                    <p className="mt-1 text-[11px] transition-all duration-200">
                      {caption}
                    </p>
                  </div>
                  <span className="text-lg transition-transform duration-300 group-hover:scale-110" aria-hidden>
                    {glyph}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-2 px-5 pb-10">
        <p className="px-2 text-[10px] uppercase tracking-[0.4em] text-slate-500">Quick Deck</p>
        {quickLinks.map(({ to, label, glyph }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-300 transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white hover:scale-[1.02]"
          >
            <span>{label}</span>
            <span aria-hidden className="transition-transform duration-300 hover:rotate-12">{glyph}</span>
          </NavLink>
        ))}
        <div className="group relative rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-4 py-5 text-xs text-slate-200 overflow-hidden transition-all duration-500 hover:border-white/10">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative z-10">
            <p className="uppercase tracking-[0.35em] text-blue-200/80">Student mode</p>
            <p className="mt-3 text-[11px] leading-relaxed">
              Зарегистрируй портфолио — Netbit выделит вычислительные кредиты и наставника.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
