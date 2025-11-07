'use client';

import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export type GraphNode = {
  id: string;
  label: string;
  type: string;
  value?: string | number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  radius?: number;
};

export type GraphLink = {
  source: string | { id: string; type?: string; label?: string };
  target: string | { id: string; type?: string; label?: string };
  label?: string;
  weight?: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const LEVEL: Record<string, number> = {
  patient: 0,
  diagnosis: 1,
  medication: 2,
  lab_result: 3,
  vital_sign: 3,
  provider: 4,
  facility: 4,
  insurance: 4,
  other: 5,
};

export function useMedicalAnalysis() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get('id');
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const [file, setFile] = useState<File | null>(null);
  const [fileNameFallback, setFileNameFallback] = useState('document');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!entryId) return;
    const saved = JSON.parse(localStorage.getItem('medicalAnalyses') || '[]');
    const found = saved.find((a: any) => a.id.toString() === entryId);
    if (found) {
      setGraphData(found.graphData);
      setSummary(found.summary);
      setFileNameFallback(found.fileName || 'document');
      const types = Array.from(
        new Set(found.graphData.nodes.map((n: GraphNode) => n.type))
      );
      setFilters(
        Object.fromEntries(types.map((t): [string, boolean] => [t, true]))
      );
    }
  }, [entryId]);

  useEffect(() => {
    if (!graphData) return;
    const types = Array.from(new Set(graphData.nodes.map((n) => n.type)));
    setFilters((prev) => {
      const next = { ...prev };
      types.forEach((t) => (next[t] = t in next ? next[t] : true));
      return next;
    });
  }, [graphData]);

  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
      reader.onerror = (e) => reject(e);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const okType =
      selected.type === 'application/pdf' || selected.type.startsWith('image/');
    const okSize = selected.size <= 10 * 1024 * 1024;
    if (!okType) return setError('Please upload a PDF or image.');
    if (!okSize) return setError('File must be 10MB or smaller.');
    setError('');
    setFile(selected);
    setGraphData(null);
    setSummary('');
  };

  const arrangeRings = (parsed: any) => {
    parsed.nodes = parsed.nodes.map((n: any) => ({
      ...n,
      type: (n.type || 'other').toLowerCase().replace(/\s+/g, '_'),
    }));

    const patient =
      parsed.nodes.find((n: any) =>
        ['patient', 'person', 'subject'].includes(n.type)
      ) || parsed.nodes[0];
    parsed.nodes = parsed.nodes.filter((n: any) => n.id !== patient.id);

    const diag = parsed.nodes.filter((n: any) => n.type.includes('diagnosis'));
    const meds = parsed.nodes.filter((n: any) => n.type.includes('medication'));
    const labs = parsed.nodes.filter((n: any) =>
      ['lab_result', 'vital_sign'].includes(n.type)
    );
    const infra = parsed.nodes.filter(
      (n: any) => !diag.includes(n) && !meds.includes(n) && !labs.includes(n)
    );

    const placeRing = (arr: any[], r: number) => {
      const step = (2 * Math.PI) / Math.max(arr.length, 1);
      const start = Math.random() * Math.PI * 2;
      arr.forEach((n, i) => {
        n.fx = r * Math.cos(start + step * i);
        n.fy = r * Math.sin(start + step * i);
      });
    };

    patient.fx = 0;
    patient.fy = 0;

    placeRing(diag, 250);
    placeRing(meds, 450);
    placeRing(labs, 650);
    placeRing(infra, 850);

    parsed.nodes.unshift(patient);

    // Fix edge direction by LEVEL (outward flow)
    parsed.edges = (parsed.edges || parsed.links || []).map((e: any) => {
      let s = typeof e.source === 'string' ? e.source : e.source.id;
      let t = typeof e.target === 'string' ? e.target : e.target.id;

      const S = parsed.nodes.find((n: any) => n.id === s);
      const T = parsed.nodes.find((n: any) => n.id === t);
      if (!S || !T) return e;

      const ls = LEVEL[S.type] ?? 99;
      const lt = LEVEL[T.type] ?? 99;

      if (ls > lt) [s, t] = [t, s];

      const weight =
        ls !== undefined && lt !== undefined ? 4 - Math.abs(lt - ls) : 1;

      return { ...e, source: s, target: t, weight };
    });

    return {
      nodes: parsed.nodes,
      links: parsed.edges || parsed.links || [],
    } as GraphData;
  };

  const analyzeWithGemini = async () => {
    if (!file) return setError('Please upload a file first.');
    if (!apiKey) return setError('Missing NEXT_PUBLIC_GEMINI_API_KEY.');

    setLoading(true);
    setError('');
    setGraphData(null);

    try {
      const base64 = await fileToBase64(file);
      const model = new ChatGoogleGenerativeAI({
        apiKey,
        model: 'models/gemini-2.5-pro',
        apiVersion: 'v1',
        temperature: 0.1,
        maxOutputTokens: 8192,
      });

      const prompt = `Analyze this medical document and return ONLY a JSON with keys: "nodes", "edges", "summary". Nodes need {id,label,type,value?}. Edges need {source,target,label?}.`;

      const message = new HumanMessage({
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: `data:${file.type};base64,${base64}`,
          },
        ],
      });

      const response = await model.invoke([message]);
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Model did not return JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      const arranged = arrangeRings(parsed);

      setGraphData(arranged);
      setSummary(parsed.summary || '');

      const newEntry = {
        id: Date.now(),
        fileName: file.name,
        summary: parsed.summary || '',
        graphData: arranged,
        date: new Date().toLocaleString(),
      };
      const existing = JSON.parse(
        localStorage.getItem('medicalAnalyses') || '[]'
      );
      localStorage.setItem(
        'medicalAnalyses',
        JSON.stringify([newEntry, ...existing])
      );
      setFileNameFallback(file.name);
    } catch (err: any) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(file?.name || fileNameFallback).split('.')[0]}-summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredGraph = useMemo(() => {
    if (!graphData) return null;
    const enabled = new Set(
      Object.entries(filters)
        .filter(([, v]) => v)
        .map(([k]) => k)
    );
    const nodes = graphData.nodes.filter((n) => enabled.has(n.type));
    const ids = new Set(nodes.map((n) => n.id));
    const links = graphData.links.filter((l) => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      return ids.has(s) && ids.has(t);
    });
    return { nodes, links };
  }, [graphData, filters]);

  return {
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
  } as const;
}
