import { useEffect, useMemo, useState } from "react";

import SidebarNav from "./SidebarNav";
import TopBar from "./TopBar";
import CommandPalette, { CommandItem } from "./CommandPalette";

const navigationCommands: CommandItem[] = [
  { label: "Лаборатория", description: "Проекты и команды", href: "/", shortcut: "⌘1" },
  { label: "Canvas", description: "Создать новый холст", href: "/workspace/new", shortcut: "⌘2" },
  { label: "Архив", description: "Заметки и артефакты", href: "/archive", shortcut: "⌘3" },
  { label: "Сообщество", description: "Команды и наставники", href: "/community", shortcut: "⌘4" },
  { label: "Настройки", description: "Профиль и команды", href: "/settings", shortcut: "⌘5" },
  { label: "Истории", description: "Кейсы и исследования", href: "/stories" },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const commands = useMemo(() => navigationCommands, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery("");
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* macOS-style animated background */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_65%)]" />
      <div className="fixed inset-0 -z-10 opacity-60 [background:linear-gradient(120deg,rgba(59,130,246,0.18)_0%,rgba(14,116,144,0.08)_35%,transparent_70%)] animate-gradient" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:120px_120px]" />
      
      <div className="flex">
        <SidebarNav />
        <div className="flex-1 min-h-screen flex flex-col">
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        query={paletteQuery}
        onQueryChange={setPaletteQuery}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
};

export default AppShell;
