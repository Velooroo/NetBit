import { useState } from "react";

import AppShell from "../components/layout/AppShell";

const notes = [
  {
    id: 1,
    title: "Biotronica • Lab Journal",
    excerpt: "Surgical notes and signal analysis",
    updated: "12 minutes ago",
    tags: ["biomed", "canvas"],
    body: `# Day 42\nPatient #51: stable, no signal drift.\n\n## Telemetry\n- bpm_mean: 76\n- oxygen: 98\n- latency: 42ms\n\n## TODO\n- [ ] Update adaptation model\n- [ ] Add temperature sensor`,
  },
  {
    id: 2,
    title: "Photon Ridge • Laser Setup",
    excerpt: "Experiment scans and control codes",
    updated: "Yesterday",
    tags: ["photonics"],
    body: `# Alignment\nInterferometer check: deviation 0.0023 rad.\n\nUpdated stabilization script: src/optics/stabilize.ts`,
  },
  {
    id: 3,
    title: "UrbanSense • City Sensors",
    excerpt: "Gas analysis and IoT network flows",
    updated: "3 days ago",
    tags: ["iot", "ml"],
    body: `# Pipeline\nCollected 18k events per day.\n\nAdded pollution maps by district to Canvas.`,
  },
];

const ArchivePage: React.FC = () => {
  const [selected, setSelected] = useState(notes[0]);

  return (
    <AppShell>
      <div className="flex h-full max-w-7xl mx-auto">
        <div className="w-80 border-r border-white/10 p-4">
          <h1 className="text-lg font-semibold text-white mb-4">Archive</h1>
          <div className="space-y-2">
            {notes.map((note) => {
              const active = note.id === selected.id;
              return (
                <button
                  key={note.id}
                  onClick={() => setSelected(note)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                    active
                      ? "border-blue-500/50 bg-blue-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <h2 className="font-medium text-white">{note.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{note.excerpt}</p>
                  <div className="mt-2 flex gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{selected.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{selected.updated}</p>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition">
              Open in Canvas
            </button>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 font-mono text-sm text-slate-300 whitespace-pre-wrap">
            {selected.body}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ArchivePage;
