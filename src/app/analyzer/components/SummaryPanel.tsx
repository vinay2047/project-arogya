'use client';

import { Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SummaryPanel({
  summary,
  onDownload,
  fileLabel,
}: {
  summary: string;
  onDownload: () => void;
  fileLabel: string;
}) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Analysis Summary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {fileLabel}
          </p>
        </div>
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      <div className="max-h-[700px] overflow-auto border-t border-slate-200 p-4 dark:border-slate-800">
        <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:text-slate-900 prose-h3:text-slate-800 dark:prose-h2:text-slate-100 dark:prose-h3:text-slate-200">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <h2
                  className="mt-6 border-b border-slate-200 pb-2 text-base dark:border-slate-700"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="mt-4 text-sm" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="my-2 space-y-1 marker:text-slate-700"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol className="my-2 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="pl-1 text-[15px]" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="bg-slate-50 px-3 py-2 font-semibold dark:bg-slate-800"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="border-t border-slate-200 px-3 py-2 dark:border-slate-700"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-2 border-slate-300 bg-slate-50/60 px-3 py-2 italic dark:border-slate-600 dark:bg-slate-800/60"
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="rounded bg-slate-100 px-1 py-0.5 text-[12px] dark:bg-slate-800"
                  {...props}
                />
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
