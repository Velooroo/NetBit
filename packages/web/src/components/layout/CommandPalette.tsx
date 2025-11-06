import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export interface CommandItem {
  label: string;
  description?: string;
  shortcut?: string;
  href: string;
}

interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  commands: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  query,
  onQueryChange,
  onClose,
  commands,
}) => {
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return commands;
    return commands.filter((command) => {
      const field = `${command.label} ${command.description ?? ""}`.toLowerCase();
      return field.includes(value);
    });
  }, [commands, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-32"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-500">No results found</p>
          )}
          {filtered.map((command) => (
            <button
              key={command.href}
              onClick={() => {
                onClose();
                navigate(command.href);
              }}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5"
            >
              <span className="flex flex-col">
                <span className="font-medium text-white">{command.label}</span>
                {command.description && (
                  <span className="text-xs text-slate-500">{command.description}</span>
                )}
              </span>
              {command.shortcut && (
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                  {command.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
