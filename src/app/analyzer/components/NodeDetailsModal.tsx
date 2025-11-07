'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';
import type { GraphData, GraphNode } from '../useMedicalAnalysis';

export default function NodeDetailsModal({
  node,
  graph,
  onClose,
}: {
  node: GraphNode | null;
  graph: GraphData;
  onClose: () => void;
}) {
  if (!node) return null;

  const neighbors = useMemo(() => {
    const id = node.id;
    const adj = new Set<string>();
    graph.links.forEach((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      if (s === id) adj.add(t);
      if (t === id) adj.add(s);
    });
    return graph.nodes.filter((n) => adj.has(n.id));
  }, [graph, node]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
      />

      {/* Modal */}
      <div className="relative max-h-[85vh] w-[560px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {node.label}
            </h3>
            <p className="text-xs opacity-70 capitalize">
              {node.type.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[75vh] grid-cols-1 gap-4 overflow-auto px-5 py-4 text-sm sm:grid-cols-2">
          <div className="space-y-2">
            {node.value !== undefined && (
              <div>
                <p className="text-[11px] uppercase tracking-wide opacity-60">
                  Value
                </p>
                <p className="mt-1 break-words">{String(node.value)}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wide opacity-60">
                Node ID
              </p>
              <p className="mt-1 break-all text-xs">{node.id}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide opacity-60">
              Neighbors
            </p>
            {neighbors.length === 0 ? (
              <p className="opacity-70">None</p>
            ) : (
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {neighbors.slice(0, 30).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="truncate">{n.label}</span>
                    <span className="ml-2 shrink-0 text-[11px] opacity-70 capitalize">
                      {n.type.replace('_', ' ')}
                    </span>
                  </li>
                ))}
                {neighbors.length > 30 && (
                  <li className="px-3 py-2 text-[12px] opacity-70">
                    +{neighbors.length - 30} more…
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
