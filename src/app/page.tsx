'use client';

import {
  ChevronDown,
  FilePlus2,
  FileType,
  Search,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnalysisEntry {
  id: number;
  fileName: string;
  date: string;
  summary?: string;
}

export default function HomePage() {
  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('medicalAnalyses') || '[]');
    setAnalyses(saved);
  }, []);

  const deleteEntry = (id: number) => {
    const updated = analyses.filter((a) => a.id !== id);
    localStorage.setItem('medicalAnalyses', JSON.stringify(updated));
    setAnalyses(updated);
  };

  const getIconForFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileType className="w-5 h-5 text-red-600" />;
    return <FileType className="w-5 h-5 text-blue-600" />;
  };

  const filteredAnalyses = analyses
    .filter(
      (a) =>
        a.fileName.toLowerCase().includes(query.toLowerCase()) ||
        a.summary?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => (sortBy === 'newest' ? b.id - a.id : a.id - b.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Medical Records History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access and review your previously analyzed documents.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records…"
              className="w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <div className="relative text-sm">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md bg-white border border-slate-300 px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Analyze New */}
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <FilePlus2 className="w-4 h-4" /> New Analysis
          </Link>
        </div>

        {/* Records */}
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Stethoscope className="w-14 h-14 mx-auto text-blue-600 mb-4" />
            <h2 className="text-lg font-medium text-slate-800">
              No matching records
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Try using different search keywords
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAnalyses.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIconForFile(entry.fileName)}
                    <p className="font-medium text-sm text-slate-900 line-clamp-1">
                      {entry.fileName}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-3">{entry.date}</p>

                <p className="text-xs text-slate-700 line-clamp-3 mb-4">
                  {(entry.summary?.replace(/[#*_`>]/g, '').slice(0, 200) ||
                    'No summary available') + '…'}
                </p>

                <Link
                  href={{
                    pathname: '/analyzer',
                    query: { id: entry.id.toString() },
                  }}
                  className="block text-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  View Full Report
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
