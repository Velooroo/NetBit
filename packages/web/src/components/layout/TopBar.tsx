import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopBarProps {
  onOpenPalette: () => void;
}

const modes = [
  { key: "lab", label: "Лаборатория", path: "/", hint: "команда / гипотезы" },
  { key: "canvas", label: "Canvas", path: "/workspace/new", hint: "пространство" },
  { key: "archive", label: "Архив", path: "/archive", hint: "заметки" },
  { key: "community", label: "Сообщество", path: "/community", hint: "наставники" },
  { key: "stories", label: "Истории", path: "/stories", hint: "кейсы" },
];

const TopBar: React.FC<TopBarProps> = ({ onOpenPalette }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(() => {
    const hit = modes.find((mode) =>
      mode.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(mode.path)
    );
    return hit?.key ?? "lab";
  }, [location.pathname]);

  const initials = useMemo(() => {
    if (!user) return "?";
    return user.username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <button
          onClick={onOpenPalette}
          className="hidden w-full max-w-lg items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-[10px] text-left text-sm text-slate-300 shadow-inner transition-all duration-200 hover:border-blue-400/40 hover:bg-white/10 md:flex"
        >
          <span className="text-slate-500 text-xs uppercase tracking-[0.35em]">⌘K</span>
          <span className="flex-1 text-sm text-slate-300">
            Поиск идей, людей и документов
          </span>
        </button>
        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            onClick={signOut}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Выйти
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-lg">
            {initials}
          </div>
        </div>
      </div>

      {/* App Store style slider */}
      <div className="px-4 pb-4 md:px-8">
        <div className="relative flex gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-2 backdrop-blur-xl shadow-inner">
          {modes.map((mode) => {
            const active = mode.key === activeKey;
            return (
              <button
                key={mode.key}
                onClick={() => navigate(mode.path)}
                className={`relative flex flex-1 flex-col items-center rounded-xl px-4 py-3 text-center transition-all duration-300 ${
                  active
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
                )}
                <span className="relative z-10 text-xs font-semibold uppercase tracking-wide">
                  {mode.label}
                </span>
                <span className="relative z-10 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                  {mode.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
