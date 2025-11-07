'use client';

import { X } from 'lucide-react';
import type { GraphData, GraphNode } from '../useMedicalAnalysis';

export default function NodeDetailsDrawer({
  node,
  graph,
  onClose,
}: {
  node: GraphNode | null;
  graph: GraphData;
  onClose: () => void;
}) {
  if (!node) return null;

  const neighbors = (() => {
    const id = node.id;
    const adj = new Set<string>();
    graph.links.forEach((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      if (s === id) adj.add(t);
      if (t === id) adj.add(s);
    });
    return graph.nodes.filter((n) => adj.has(n.id));
  })();

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex">
      <div className="pointer-events-auto w-[360px] max-w-[90vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold">{node.label}</h3>
            <p className="text-xs opacity-70 capitalize">
              {node.type.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          {node.value !== undefined && (
            <div>
              <p className="text-xs uppercase tracking-wide opacity-60">
                Value
              </p>
              <p className="mt-1">{String(node.value)}</p>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">
              Node ID
            </p>
            <p className="mt-1 break-all">{node.id}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">
              Neighbors
            </p>
            {neighbors.length === 0 ? (
              <p className="mt-1 opacity-70">None</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {neighbors.slice(0, 24).map((n) => (
                  <li key={n.id} className="flex items-center justify-between">
                    <span className="truncate">{n.label}</span>
                    <span className="ml-2 text-[11px] opacity-70 capitalize">
                      {n.type.replace('_', ' ')}
                    </span>
                  </li>
                ))}
                {neighbors.length > 24 && (
                  <li className="text-xs opacity-70">
                    +{neighbors.length - 24} more…
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-auto flex-1 bg-black/10 dark:bg-black/30"
        onClick={onClose}
        role="button"
        aria-label="Close details"
      />
    </div>
  );
}
