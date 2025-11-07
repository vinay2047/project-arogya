'use client';

import {
  Filter,
  Info,
  Moon,
  RefreshCw,
  Search,
  Sun,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ThemeContext } from '../layout';
import type { GraphData, GraphNode } from '../useMedicalAnalysis';
import NodeDetailsModal from './NodeDetailsModal';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

export default function GraphPanel({
  graphData,
  rawGraphData,
  query,
  setQuery,
  showEdgeLabels,
  setShowEdgeLabels,
  filters,
  setFilters,
  fileLabel,
}: {
  graphData: GraphData;
  rawGraphData: GraphData;
  query: string;
  setQuery: (q: string) => void;
  showEdgeLabels: boolean;
  setShowEdgeLabels: (v: boolean) => void;
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  fileLabel: string;
}) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [modalNode, setModalNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  useEffect(() => setMounted(true), []);

  // Colors and styling
  const colors: Record<string, string> = useMemo(
    () => ({
      patient: '#2563eb',
      diagnosis: '#7c3aed',
      medication: '#16a34a',
      lab_result: '#d97706',
      vital_sign: '#6d28d9',
      allergy: '#ef4444',
      vaccination: '#0d9488',
      provider: '#0284c7',
      facility: '#4338ca',
      insurance: '#0891b2',
      procedure: '#db2777',
      other: '#4b5563',
    }),
    []
  );
  const colorFor = (t?: string) => colors[t!] ?? colors.other;

  // Physics parameters
  const linkDistance = 22;
  const repulsionStrength = -260;
  const baseRadius = 22;

  const mkRadius = (node: GraphNode) => {
    const degree =
      graphData.links.filter(
        (l) =>
          (l.source as any).id === node.id || (l.target as any).id === node.id
      ).length || 1;
    return baseRadius + degree * 7;
  };

  const updateHighlights = (node: GraphNode | null) => {
    const nodeSet = new Set<string>();
    const linkSet = new Set<any>();
    if (node) {
      nodeSet.add(node.id);
      graphData.links.forEach((l) => {
        const sid = typeof l.source === 'string' ? l.source : l.source.id;
        const tid = typeof l.target === 'string' ? l.target : l.target.id;
        if (sid === node.id || tid === node.id) {
          linkSet.add(l);
          nodeSet.add(sid);
          nodeSet.add(tid);
        }
      });
    }
    setHighlightNodes(nodeSet);
    setHighlightLinks(linkSet);
  };

  useEffect(
    () => updateHighlights(hoverNode || selectedNode),
    [hoverNode, selectedNode, graphData.links]
  );

  const handleNodeClick = useCallback((n: GraphNode) => {
    setSelectedNode(n);
    setModalNode(n);
    fgRef.current?.centerAt(n.x!, n.y!, 600);
    fgRef.current?.zoom(1.45, 600);
  }, []);

  // Enhanced search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery) setQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setQuery]);

  useEffect(() => {
    if (!query || !fgRef.current) return;
    const match = graphData.nodes.find((n) =>
      n.label.toLowerCase().includes(query.toLowerCase())
    );
    if (!match) return;
    setSelectedNode(match);
    fgRef.current.centerAt(match.x!, match.y!, 600);
    fgRef.current.zoom(1.45, 600);
  }, [query, graphData.nodes]);

  // Curved edges
  const curvedLink = (link: any, ctx: CanvasRenderingContext2D) => {
    const s = link.source;
    const t = link.target;
    if (!s?.x || !t?.x) return;

    const mx = (s.x + t.x) / 2;
    const my = (s.y + t.y) / 2;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const curve = 0.25;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.quadraticCurveTo(mx - dy * curve, my + dx * curve, t.x, t.y);
    ctx.stroke();
  };

  const renderLink = (l: any, ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = highlightLinks.has(l) ? 2.4 : 1.2;
    ctx.strokeStyle = highlightLinks.has(l)
      ? '#0ea5e9'
      : isDark
      ? 'rgba(255,255,255,0.25)'
      : 'rgba(0,0,0,0.35)';
    curvedLink(l, ctx);
  };

  const renderNode = (
    raw: any,
    ctx: CanvasRenderingContext2D,
    scale: number
  ) => {
    const n = raw as GraphNode;
    const r = mkRadius(n);
    const isHovered = hoverNode?.id === n.id;
    const grow = isHovered ? 1.15 : 1;
    const focused = highlightNodes.has(n.id);

    ctx.globalAlpha = focused ? 1 : 0.25;

    // Add glow effect for hovered node
    if (isHovered) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = colorFor(n.type);
    }

    ctx.beginPath();
    ctx.arc(n.x!, n.y!, r * grow, 0, Math.PI * 2);
    ctx.fillStyle = colorFor(n.type);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Label
    const fs = Math.max(16, r / 1.4);
    ctx.font = `600 ${fs}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.lineWidth = 6 / scale;
    ctx.strokeStyle = isDark ? 'black' : 'white';
    ctx.strokeText(n.label, n.x!, n.y!);

    ctx.fillStyle = isDark ? '#F1F5F9' : '#0f172a';
    ctx.fillText(n.label, n.x!, n.y!);

    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    fg.d3Force('center', null);
    fg.d3Force('gravity', (node: any) => {
      const dist = Math.hypot(node.x ?? 0, node.y ?? 0);
      return -0.22 * dist;
    });
  }, [graphData]);

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.3, 8);
    setZoomLevel(newZoom);
    fgRef.current?.zoom(newZoom, 300);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.3, 0.2);
    setZoomLevel(newZoom);
    fgRef.current?.zoom(newZoom, 300);
  };

  // Get unique node types for filters
  const nodeTypes = useMemo(() => {
    return Array.from(new Set(graphData.nodes.map((n) => n.type)));
  }, [graphData.nodes]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-full">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Info className="h-4 w-4 flex-shrink-0 text-slate-600 dark:text-slate-400" />
          <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
            {fileLabel}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
            {graphData.nodes.length} nodes · {graphData.links.length} edges
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`rounded-lg border px-3 py-2 shadow-sm transition-all hover:scale-105 ${
              showSearch
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Search nodes"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-3 py-2 shadow-sm transition-all hover:scale-105 ${
              showFilters
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Filter nodes"
          >
            <Filter className="h-4 w-4" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
            <button
              onClick={handleZoomOut}
              className="px-2 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="px-2 py-2 bg-slate-50 dark:bg-slate-700 text-xs font-mono min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={handleZoomIn}
              className="px-2 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={() => {
              fgRef.current?.zoomToFit(600, 50);
              setZoomLevel(1);
              setSelectedNode(null);
            }}
            className="rounded-lg border px-3 py-2 shadow-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
            title="Reset view"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border px-3 py-2 shadow-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search nodes by name..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  setQuery('');
                  setSelectedNode(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 self-center">
              Node Types:
            </span>
            {nodeTypes.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, [type]: !prev[type] }))
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filters[type] === false
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 line-through'
                    : 'text-white shadow-sm hover:scale-105'
                }`}
                style={{
                  backgroundColor:
                    filters[type] === false ? undefined : colorFor(type),
                }}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {mounted && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={renderNode}
            linkCanvasObject={renderLink}
            linkDirectionalParticles={highlightLinks.size ? 3 : 0}
            linkDirectionalParticleWidth={highlightLinks.size ? 3 : 0}
            linkDirectionalParticleSpeed={0.009}
            d3AlphaDecay={0.012}
            d3VelocityDecay={0.22}
            enableZoomInteraction
            enablePanInteraction
            enableNodeDrag
            onNodeHover={(n: any) => {
              setHoverNode(n as GraphNode | null);
              document.body.style.cursor = n ? 'pointer' : 'default';
            }}
            onNodeClick={(n: any) => handleNodeClick(n as GraphNode)}
            onZoom={(zoom) => setZoomLevel(zoom.k)}
            nodePointerAreaPaint={(
              node: any,
              color: string,
              ctx: CanvasRenderingContext2D
            ) => {
              const n = node as GraphNode;
              const r = mkRadius(n);
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
              ctx.fill();
            }}
          />
        )}

        {/* Hover/Selected Node Tooltip */}
        {(hoverNode || selectedNode) && (
          <div className="absolute bottom-6 left-6 rounded-lg bg-white/95 dark:bg-slate-800/95 px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{
                  backgroundColor: colorFor((hoverNode || selectedNode)!.type),
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 break-words">
                  {(hoverNode || selectedNode)!.label}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 capitalize">
                  {(hoverNode || selectedNode)!.type?.replace('_', ' ')}
                </p>
                {selectedNode && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Click for details →
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-6 right-6 rounded-lg bg-white/95 dark:bg-slate-800/95 p-4 shadow-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm max-w-[200px]">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Legend
          </h3>
          <div className="space-y-2">
            {Object.entries(colors)
              .slice(0, 6)
              .map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Controls Hint */}
        {!hoverNode && !selectedNode && (
          <div className="absolute bottom-6 left-6 rounded-lg bg-white/80 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 backdrop-blur-sm">
            💡 Drag to pan · Scroll to zoom · Click nodes for details
          </div>
        )}
      </div>

      <NodeDetailsModal
        node={modalNode}
        graph={rawGraphData}
        onClose={() => setModalNode(null)}
      />
    </div>
  );
}
