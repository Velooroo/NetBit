import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface CanvasNode {
  id: string;
  type: "note" | "code" | "link";
  title: string;
  body: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const initialNodes: CanvasNode[] = [
  {
    id: "n1",
    type: "note",
    title: "Операционный протокол",
    body: "Этапы имплантации и параметры датчиков фиксируются в режиме Live.",
    x: 160,
    y: 120,
  },
  {
    id: "n2",
    type: "code",
    title: "ml/analyse.py",
    body: "run_experiment('bio-sim', epochs=15, dataset='simlog-v3')",
    x: 420,
    y: 220,
  },
  {
    id: "n3",
    type: "link",
    title: "SimLog v3",
    body: "Поток сигналов и сердечного ритма пациента #52.",
    x: 320,
    y: 380,
  },
];

const initialConnections: Connection[] = [
  { id: "c1", from: "n1", to: "n2" },
  { id: "c2", from: "n2", to: "n3" },
];

const CanvasSurface: React.FC = () => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<SVGSVGElement | null>(null);
  
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Camera state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  // Zoom to mouse position
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    // Detect pinch gesture on trackpad
    if (event.ctrlKey) {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const delta = -event.deltaY * 0.01;
      const newZoom = Math.min(Math.max(0.1, zoom * (1 + delta)), 3);
      
      // Adjust pan to zoom towards mouse
      const zoomRatio = newZoom / zoom;
      const adjustedPanX = mouseX - (mouseX - panX) * zoomRatio;
      const adjustedPanY = mouseY - (mouseY - panY) * zoomRatio;
      
      setZoom(newZoom);
      setPanX(adjustedPanX);
      setPanY(adjustedPanY);
    } else {
      // Two-finger scroll = pan
      setPanX(prev => prev - event.deltaX);
      setPanY(prev => prev - event.deltaY);
    }
  }, [zoom, panX, panY]);

  // Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !editingId) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (e.key === "Escape") {
        setIsFullScreen(false);
        setEditingId(null);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [editingId]);

  // Wheel event listener
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    
    board.addEventListener("wheel", handleWheel, { passive: false });
    return () => board.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Node dragging
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (isPanning && boardRef.current) {
        const dx = event.clientX - panStart.current.x;
        const dy = event.clientY - panStart.current.y;
        setPanX(panStart.current.startPanX + dx);
        setPanY(panStart.current.startPanY + dy);
        return;
      }
      
      if (!dragId) return;
      
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setNodes((prev) =>
        prev.map((node) =>
          node.id === dragId
            ? {
                ...node,
                x: (event.clientX - rect.left - panX) / zoom - dragOffset.current.x,
                y: (event.clientY - rect.top - panY) / zoom - dragOffset.current.y,
              }
            : node
        )
      );
    };

    const handlePointerUp = () => {
      setDragId(null);
      setIsPanning(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragId, zoom, panX, panY, isPanning]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if (isPanning || isSpacePressed) return;
    
    event.stopPropagation();
    const nodeElement = (event.target as HTMLElement).closest("[data-node]") as HTMLDivElement | null;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!nodeElement || !rect) return;
    
    const nodeRect = nodeElement.getBoundingClientRect();
    dragOffset.current = {
      x: (event.clientX - nodeRect.left) / zoom,
      y: (event.clientY - nodeRect.top) / zoom,
    };
    setDragId(id);
  };

  const handleBoardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button === 1 || isSpacePressed) {
      event.preventDefault();
      setIsPanning(true);
      panStart.current = {
        x: event.clientX,
        y: event.clientY,
        startPanX: panX,
        startPanY: panY,
      };
    }
  };

  const addNode = (type: CanvasNode["type"]) => {
    const centerX = (boardRef.current?.clientWidth || 800) / 2;
    const centerY = (boardRef.current?.clientHeight || 600) / 2;
    
    const x = (centerX - panX) / zoom;
    const y = (centerY - panY) / zoom;

    setNodes((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        type,
        title:
          type === "note"
            ? "Новая заметка"
            : type === "code"
            ? "код.py"
            : "Ссылка",
        body:
          type === "note"
            ? "Опишите идею..."
            : type === "code"
            ? "# Your code here"
            : "https://",
        x: x - 110,
        y: y - 80,
      },
    ]);
  };

  const handleTitleDoubleClick = (id: string) => {
    setEditingId(id);
  };

  const updateTitle = (id: string, value: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, title: value } : node))
    );
  };

  const updateBody = (id: string, value: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, body: value } : node))
    );
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Draw bezier connections
  const renderConnections = () => {
    return connections.map((conn) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return null;
      
      const x1 = fromNode.x + 110;
      const y1 = fromNode.y + 90;
      const x2 = toNode.x + 110;
      const y2 = toNode.y + 90;
      
      const dx = x2 - x1;
      const curvature = Math.abs(dx) * 0.3;
      
      const path = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
      
      return (
        <g key={conn.id}>
          <path
            d={path}
            fill="none"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <path
            d={path}
            fill="none"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-dash"
          />
        </g>
      );
    });
  };

  const containerClass = isFullScreen
    ? "fixed inset-0 z-40 bg-slate-950"
    : "relative flex flex-1";

  const cursorClass = isPanning || isSpacePressed ? "cursor-grab" : "cursor-default";

  return (
    <div className={containerClass}>
      <div
        className={`relative flex-1 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 ${cursorClass}`}
        ref={boardRef}
        onPointerDown={handleBoardPointerDown}
      >
        {/* Toolbar */}
        <div className="absolute left-6 top-6 z-30 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => addNode("note")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:scale-105 active:scale-95"
            title="Добавить заметку"
          >
            📝 Заметка
          </button>
          <button
            onClick={() => addNode("code")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:scale-105 active:scale-95"
            title="Добавить код"
          >
            💻 Код
          </button>
          <button
            onClick={() => addNode("link")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:scale-105 active:scale-95"
            title="Добавить ресурс"
          >
            🔗 Ресурс
          </button>
          
          <div className="mx-1 h-5 w-px bg-white/10" />
          
          <span className="px-2 text-[11px] text-slate-400">{Math.round(zoom * 100)}%</span>
          
          <button
            onClick={handleResetView}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10"
            title="Сбросить вид"
          >
            ⟲
          </button>
          
          <div className="mx-1 h-5 w-px bg-white/10" />
          
          <button
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="rounded-lg border border-white/10 bg-blue-500/20 px-2.5 py-1.5 text-white transition-all duration-200 hover:bg-blue-500/30"
            title={isFullScreen ? "Выйти из полноэкранного режима (Esc)" : "Полноэкранный режим"}
          >
            {isFullScreen ? "⛶" : "⛶"}
          </button>
        </div>

        {/* Hint */}
        <div className="absolute bottom-6 right-6 z-30 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2 text-[11px] text-slate-400 backdrop-blur-xl">
          <span className="opacity-70">Прокрутка: зум • Space + drag: pan • Двойной клик: переименовать</span>
        </div>

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0,transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Canvas area */}
        <div className="relative z-10 h-full w-full overflow-hidden">
          {/* SVG for connections */}
          <svg
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {renderConnections()}
          </svg>
          
          {/* Nodes */}
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: dragId ? "none" : "transform 0.1s ease-out",
            }}
            className="absolute inset-0"
          >
            {nodes.map((node) => (
              <div
                key={node.id}
                data-node
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  transition: dragId === node.id ? "none" : "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className={`absolute w-[220px] select-none rounded-xl border bg-white/10 p-3 text-sm shadow-xl backdrop-blur-xl transition-all duration-200 ${
                  dragId === node.id
                    ? "cursor-grabbing border-blue-400/60 shadow-blue-500/25"
                    : "cursor-grab border-white/10 hover:border-white/20 hover:shadow-2xl"
                }`}
                onPointerDown={(event) => handleDragStart(event, node.id)}
              >
                {/* Type indicator */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-blue-200/60">
                    {node.type === "note" ? "📝 Note" : node.type === "code" ? "💻 Code" : "🔗 Link"}
                  </span>
                  
                  {editingId === node.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={node.title}
                      onChange={(e) => updateTitle(node.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingId(null);
                      }}
                      className="w-full rounded bg-white/10 px-2 py-1 text-[11px] text-white outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => handleTitleDoubleClick(node.id)}
                      className="cursor-text rounded px-2 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/10"
                    >
                      {node.title}
                    </span>
                  )}
                </div>
                
                {/* Body */}
                <textarea
                  value={node.body}
                  onChange={(e) => updateBody(node.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/10"
                  placeholder="Введите текст..."
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasSurface;
