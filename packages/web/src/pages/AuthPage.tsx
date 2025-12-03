import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const highlights = [
  "Гибрид Miro и Obsidian для исследовательских команд",
  "Онлайн-IDE с экспериментами прямо на холсте",
  "Студенческие гранты и вычислительные кредиты",
];

const AuthPage: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername("demo");
    setPassword("demo123");
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* macOS-style animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#3b82f633_0%,transparent_55%)] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#a855f733_0%,transparent_55%)] animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />

      {/* Left panel with glass effect */}
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden px-14 py-12 lg:flex">
        <div className="absolute inset-0 rounded-r-[3rem] border border-blue-400/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-blue-400/30" />
        <div className="relative z-10 flex flex-col gap-10">
          <div className="animate-fade-in">
            <p className="text-xs uppercase tracking-[0.55em] text-blue-100/70">
              Netbit
            </p>
            <h1 className="mt-6 text-[3rem] font-semibold leading-tight text-white">
              Творческая платформа для научных проектов и кода
            </h1>
            <p className="mt-5 max-w-sm text-sm text-slate-200/85 leading-relaxed">
              Canvas, кодовая IDE, заметки и Git — единое пространство, где
              студенты и команды превращают идеи в живые лаборатории.
            </p>
          </div>
          <div className="space-y-3">
            {highlights.map((item, idx) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100/90 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-xs uppercase tracking-[0.35em] text-blue-100/80 backdrop-blur-xl">
            Support students • Share labs • Inspire research
          </div>
        </div>
      </div>

      {/* Right panel with login form */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="relative w-full max-w-md">
          <div className="rounded-[2.25rem] border border-white/10 bg-slate-950/80 px-10 py-12 shadow-[0_35px_90px_rgba(15,23,42,0.45)] backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_40px_100px_rgba(15,23,42,0.55)]">
            <div className="mb-8 flex flex-col gap-3">
              <h2 className="text-3xl font-semibold text-white">
                Вход в Netbit
              </h2>
              <p className="text-sm text-slate-300/80">
                Продолжайте там, где остановились: проекты, канвасы и
                репозитории ждут.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Имя пользователя
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="researcher"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Пароль
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300 border border-red-500/20 animate-shake">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-400 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? "Входим..." : "Войти"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                Заполнить демо-данные
              </button>
              <span className="opacity-70">Для доступа к бете напишите в команду Netbit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
