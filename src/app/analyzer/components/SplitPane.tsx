'use client';

import { Maximize2, Minimize2 } from 'lucide-react';

type Props = {
  children: [React.ReactNode, React.ReactNode];
  panelPct: number;
  setPanelPct: (v: number) => void;
  fullscreenView: 'graph' | 'summary' | null;
  setFullscreenView: (v: 'graph' | 'summary' | null) => void;
};

export default function SplitPane({
  children,
  panelPct,
  setPanelPct,
  fullscreenView,
  setFullscreenView,
}: Props) {
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPct = panelPct;

    const drag = (ev: MouseEvent) => {
      const diff = ev.clientX - startX;
      const pctDiff = (diff / window.innerWidth) * 100;
      const next = Math.min(85, Math.max(30, startPct + pctDiff));
      setPanelPct(next);
    };

    const stop = () => {
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('mouseup', stop);
    };

    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stop);
  };

  const leftHidden = fullscreenView === 'summary';
  const rightHidden = fullscreenView === 'graph';

  return (
    <div className="relative h-[700px] w-full overflow-hidden">
      {!leftHidden && (
        <div
          className="absolute inset-y-0 left-0 z-0"
          style={{ width: `${fullscreenView ? 100 : panelPct}%` }}
        >
          {children[0]}
        </div>
      )}

      {!rightHidden && !fullscreenView && (
        <div
          className="absolute inset-y-0 z-10"
          style={{
            left: `${panelPct}%`,
            width: `${100 - panelPct}%`,
          }}
        >
          {children[1]}
        </div>
      )}

      {fullscreenView === 'summary' && (
        <div className="absolute inset-0 z-20">{children[1]}</div>
      )}

      {!fullscreenView && (
        <div
          className="absolute inset-y-0 z-20"
          style={{ left: `${panelPct}%` }}
        >
          <div
            onMouseDown={startDrag}
            className="h-full w-1 cursor-col-resize bg-slate-200 hover:bg-blue-400"
          />
        </div>
      )}

      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex gap-2">
        <button
          onClick={() =>
            setFullscreenView(fullscreenView === 'graph' ? null : 'graph')
          }
          className="pointer-events-auto inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
        >
          {fullscreenView === 'graph' ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          Graph
        </button>

        <button
          onClick={() =>
            setFullscreenView(fullscreenView === 'summary' ? null : 'summary')
          }
          className="pointer-events-auto inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
        >
          {fullscreenView === 'summary' ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          Summary
        </button>
      </div>
    </div>
  );
}
