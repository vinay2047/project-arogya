'use client';

import { FileUp, Info, Loader2, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useMedicalAnalysis } from '../useMedicalAnalysis';
import GraphPanel from './GraphPanel';
import SplitPane from './SplitPane';
import SummaryPanel from './SummaryPanel';

export default function AnalyzerPage() {
  const {
    file,
    fileNameFallback,
    loading,
    graphData,
    filteredGraph,
    summary,
    error,
    query,
    showEdgeLabels,
    filters,
    setQuery,
    setShowEdgeLabels,
    setFilters,
    handleFileChange,
    analyzeWithGemini,
    downloadSummary,
  } = useMedicalAnalysis();

  const [fullscreenView, setFullscreenView] = useState<
    'graph' | 'summary' | null
  >(null);
  const [panelPct, setPanelPct] = useState<number>(70);

  const fileLabel = (file?.name || fileNameFallback).split('.')[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        <header className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-slate-900 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                Medical Document Analyzer
              </h1>
              <p className="text-sm text-slate-600">
                Upload a medical document for structured analysis and a
                navigable knowledge graph.
              </p>
            </div>
          </div>
        </header>

        <main className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-white"
              >
                <FileUp className="h-4 w-4 text-slate-600" />
                <span>{file ? file.name : 'Upload PDF or Image (≤10MB)'}</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              <button
                onClick={analyzeWithGemini}
                disabled={loading || !file}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition enabled:hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>Analyze</>
                )}
              </button>

              {error && (
                <div className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <Info className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {filteredGraph && (
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search node label…"
                    className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {(loading || (!graphData && !summary)) && (
            <div className="grid place-items-center p-12 text-center text-slate-600">
              <div className="flex flex-col items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
                    <p className="text-sm">Analyzing document…</p>
                  </>
                ) : (
                  <>
                    <Info className="h-10 w-10 text-slate-400" />
                    <p className="text-sm">
                      Upload a document to begin. Supported: PDF, PNG, JPG.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {filteredGraph && summary && (
            <SplitPane
              panelPct={panelPct}
              setPanelPct={setPanelPct}
              fullscreenView={fullscreenView}
              setFullscreenView={setFullscreenView}
            >
              <GraphPanel
                graphData={filteredGraph}
                rawGraphData={graphData!}
                query={query}
                setQuery={setQuery}
                showEdgeLabels={showEdgeLabels}
                setShowEdgeLabels={setShowEdgeLabels}
                filters={filters}
                setFilters={setFilters}
                fileLabel={fileLabel}
              />
              <SummaryPanel
                summary={summary}
                onDownload={downloadSummary}
                fileLabel={fileLabel}
              />
            </SplitPane>
          )}
        </main>

        <footer className="mt-6 text-xs text-slate-500">
          Powered by LangChain & Google Gemini 2.5 Pro
        </footer>
      </div>
    </div>
  );
}
