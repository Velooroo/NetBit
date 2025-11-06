import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "completed" | "archived";
  lastUpdated: string;
  progress: number;
  tags: string[];
}

const mockProjects: Project[] = [
  {
    id: "biotronica",
    title: "Biotronica",
    description: "Биосовместимые интерфейсы с ML-прогнозами адаптации имплантов",
    category: "Биомедицина",
    status: "active",
    lastUpdated: "15 минут назад",
    progress: 65,
    tags: ["ML", "Биоматериалы", "Нейросети"],
  },
  {
    id: "photon-ridge",
    title: "Photon Ridge",
    description: "Оптический квантовый эксперимент с лазерным управлением",
    category: "Фотоника",
    status: "active",
    lastUpdated: "3 часа назад",
    progress: 82,
    tags: ["Квантовая физика", "Оптика"],
  },
  {
    id: "aurora-patterns",
    title: "Aurora Patterns",
    description: "Визуализация климатических моделей и прогнозирование",
    category: "Климатология",
    status: "active",
    lastUpdated: "вчера",
    progress: 45,
    tags: ["Климат", "Визуализация", "Data Science"],
  },
  {
    id: "neural-nets-lab",
    title: "Neural Nets Lab",
    description: "Deep learning эксперименты и обучение моделей",
    category: "Machine Learning",
    status: "active",
    lastUpdated: "2 дня назад",
    progress: 30,
    tags: ["Deep Learning", "PyTorch"],
  },
  {
    id: "genome-seq",
    title: "Genome Sequencing",
    description: "Анализ генетических последовательностей с CRISPR",
    category: "Биоинформатика",
    status: "completed",
    lastUpdated: "неделю назад",
    progress: 100,
    tags: ["Биоинформатика", "CRISPR"],
  },
];

const categories = ["Все", "Биомедицина", "Фотоника", "Климатология", "Machine Learning", "Биоинформатика"];
const statuses = [
  { value: "all", label: "Все проекты" },
  { value: "active", label: "В работе" },
  { value: "completed", label: "Завершено" },
  { value: "archived", label: "Архив" },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("Биомедицина");

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "Все" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    
    const slug = newProjectTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, "")
      .replace(/\s+/g, "-");
    
    navigate(`/workspace/${slug}`, {
      state: {
        name: newProjectTitle,
        description: `Новый проект в категории ${newProjectCategory}`,
      },
    });
    
    setShowCreateModal(false);
    setNewProjectTitle("");
  };

  const getStatusBadge = (status: Project["status"]) => {
    const styles = {
      active: "bg-green-500/20 text-green-100 border-green-500/30",
      completed: "bg-blue-500/20 text-blue-100 border-blue-500/30",
      archived: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    };
    
    const labels = {
      active: "В работе",
      completed: "Завершено",
      archived: "Архив",
    };
    
    return (
      <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Ваши проекты</h1>
            <p className="mt-2 text-sm text-slate-400">
              Управляйте исследованиями, экспериментами и научными работами
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-400 hover:to-blue-500 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <span className="text-lg">+</span>
            Создать проект
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, описанию или тегам..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
              />
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Category & Status Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Категория:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        selectedCategory === cat
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-6 w-px bg-white/10" />
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Статус:</span>
                <div className="flex gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        selectedStatus === status.value
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-1">
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-sm text-slate-400">
              Найдено проектов: <span className="font-semibold text-white">{filteredProjects.length}</span>
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white">Проекты не найдены</h3>
              <p className="mt-2 text-sm text-slate-400">
                Попробуйте изменить фильтры или создайте новый проект
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, idx) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/workspace/${project.id}`)}
                  className="group flex w-full items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:scale-[1.01] animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Icon */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-3xl backdrop-blur-xl transition-transform duration-300 group-hover:scale-110">
                    {project.category === "Биомедицина" && "🧬"}
                    {project.category === "Фотоника" && "💡"}
                    {project.category === "Климатология" && "🌍"}
                    {project.category === "Machine Learning" && "🧠"}
                    {project.category === "Биоинформатика" && "🔬"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-100 transition-colors">
                        {project.title}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-1">{project.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <span className="text-xs text-slate-500">{project.lastUpdated}</span>
                    
                    {/* Progress */}
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Прогресс</span>
                        <span className="text-[10px] font-semibold text-white">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl animate-scale-in">
            <h2 className="text-xl font-semibold text-white mb-4">Создать новый проект</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Название проекта</label>
                <input
                  autoFocus
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject();
                    if (e.key === "Escape") setShowCreateModal(false);
                  }}
                  placeholder="Название вашего исследования..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Категория</label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                >
                  {categories.filter(c => c !== "Все").map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default DashboardPage;
