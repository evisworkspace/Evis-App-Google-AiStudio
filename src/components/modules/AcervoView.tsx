import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import type { MemoryEvent, ImportRun, DateConfidence, AnalysisStatus } from "../../types";
import {
  getMemoryEvents,
  getImportRuns,
  getExistingHashes,
  batchCreateMemoryEvents,
  createImportRun,
} from "../../services/acervoService";
import { processMarkdownFile } from "../../lib/importProcessor";
import type { ProcessedFile } from "../../lib/importProcessor";
import {
  Upload,
  Clock,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  BookOpen,
  Archive,
  History,
  Loader2,
  Hash,
  Tag,
  Info,
  ChevronRight,
  Inbox,
  X,
  FileCheck,
  HelpCircle,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

function confidenceBadge(c: DateConfidence) {
  if (c === "exact")
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
        <Calendar className="h-2.5 w-2.5" />
        data exata
      </span>
    );
  if (c === "estimated")
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
        <Clock className="h-2.5 w-2.5" />
        estimada
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200 uppercase">
      <HelpCircle className="h-2.5 w-2.5" />
      sem data
    </span>
  );
}

function analysisBadge(s: AnalysisStatus) {
  if (s === "analyzed")
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">
        <CheckCircle2 className="h-2.5 w-2.5" />
        analisado
      </span>
    );
  if (s === "error")
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 uppercase">
        <XCircle className="h-2.5 w-2.5" />
        erro
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 border border-zinc-200 uppercase">
      não analisado
    </span>
  );
}

function formatDate(iso: string, confidence: DateConfidence): string {
  if (!iso) return "—";
  try {
    const [year, month, day] = iso.split("-");
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const m = months[parseInt(month, 10) - 1] || month;
    if (confidence === "estimated" && day === "01") return `${m}/${year}`;
    return `${day}/${m}/${year}`;
  } catch {
    return iso;
  }
}

function groupByYearMonth(events: MemoryEvent[]) {
  const map = new Map<string, Map<string, MemoryEvent[]>>();
  for (const e of events) {
    const year = e.eventDate?.substring(0, 4) || "Sem data";
    const month = e.eventDate?.substring(5, 7) || "00";
    if (!map.has(year)) map.set(year, new Map());
    const yearMap = map.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(e);
  }
  return map;
}

const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── sub-components ────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <Icon className="h-10 w-10 opacity-30" />
      <p className="text-xs font-sans">{text}</p>
    </div>
  );
}

// ── Import Report Modal ───────────────────────────────────────────────────────

function ImportReportModal({ run, onClose }: { run: ImportRun; onClose: () => void }) {
  const elapsed = (() => {
    try {
      const ms = new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();
      return `${(ms / 1000).toFixed(1)}s`;
    } catch {
      return "—";
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
              Relatório de Importação
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Recebidos", value: run.fileCount, color: "text-zinc-700" },
              { label: "Criados", value: run.successCount, color: "text-emerald-600" },
              { label: "Erros", value: run.errorCount, color: "text-red-500" },
              { label: "Sem data", value: run.unknownDateCount, color: "text-amber-600" },
              { label: "Duplicados", value: run.duplicateCandidates, color: "text-orange-500" },
              { label: "Tempo", value: elapsed, color: "text-zinc-500" },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
                <span className={`block text-lg font-bold font-mono ${s.color}`}>{s.value}</span>
                <span className="block text-[9px] font-mono text-zinc-400 uppercase mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Errors */}
          {run.errors.length > 0 && (
            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Erros</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {run.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] bg-red-50 border border-red-100 rounded px-2 py-1">
                    <XCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-700 font-mono break-all">
                      <span className="font-bold">{e.filename}</span>: {e.error}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Origin */}
          <div className="text-[10px] text-zinc-400 font-mono border-t border-zinc-100 pt-3 flex items-center justify-between">
            <span>Origem: <span className="text-zinc-600">{run.sourceType}</span></span>
            <span>ID: <span className="text-zinc-600 font-bold">{run.id.substring(0, 8)}</span></span>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => downloadJson(run, `importacao_${run.id.substring(0, 8)}.json`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-mono text-[10px] font-bold rounded cursor-pointer uppercase transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar Relatório JSON
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-[hsl(var(--color-primary))] text-white font-mono text-[10px] font-bold rounded cursor-pointer uppercase hover:opacity-90 transition-opacity"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview Row ───────────────────────────────────────────────────────────────

interface PreviewRow {
  file: File;
  processed: ProcessedFile | null;
  error: string | null;
  isDuplicate: boolean;
  selected: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AcervoView() {
  const { currentUser, showToast } = useApp();
  const uid = currentUser?.uid || "";

  const [activeTab, setActiveTab] = useState<"timeline" | "relatos" | "importar">("timeline");
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [importRuns, setImportRuns] = useState<ImportRun[]>([]);
  const [loading, setLoading] = useState(true);

  // Import state
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [reportRun, setReportRun] = useState<ImportRun | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Relatos filter
  const [filterConfidence, setFilterConfidence] = useState<"all" | DateConfidence>("all");

  const loadData = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [ev, runs] = await Promise.all([getMemoryEvents(uid), getImportRuns(uid)]);
      setEvents(ev);
      setImportRuns(runs);
      if (ev.length === 0) setActiveTab("importar");
    } catch (err) {
      console.error("Erro ao carregar acervo:", err);
      showToast("Erro ao carregar acervo.", "error");
    } finally {
      setLoading(false);
    }
  }, [uid, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── File processing ────────────────────────────────────────────────────────

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const mdFiles = Array.from(files).filter((f) =>
        f.name.endsWith(".md") || f.name.endsWith(".txt")
      );
      if (mdFiles.length === 0) {
        showToast("Nenhum arquivo .md ou .txt selecionado.", "error");
        return;
      }

      setProcessingFiles(true);
      setActiveTab("importar");

      try {
        const existingHashes = await getExistingHashes(uid);
        const now = new Date().toISOString();
        const rows: PreviewRow[] = await Promise.all(
          mdFiles.map(async (file) => {
            try {
              const processed = await processMarkdownFile(file, now);
              const isDuplicate = existingHashes.has(processed.contentHash);
              return { file, processed, error: null, isDuplicate, selected: !isDuplicate };
            } catch (err) {
              return {
                file,
                processed: null,
                error: String(err),
                isDuplicate: false,
                selected: false,
              };
            }
          })
        );
        setPreviewRows(rows);
      } catch (err) {
        showToast("Erro ao processar arquivos.", "error");
        console.error(err);
      } finally {
        setProcessingFiles(false);
      }
    },
    [uid, showToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const toggleRow = (idx: number) => {
    setPreviewRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  // ── Import execution ───────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!uid) return;
    const toImport = previewRows.filter((r) => r.selected && r.processed);
    if (toImport.length === 0) {
      showToast("Nenhum arquivo selecionado para importar.", "info");
      return;
    }

    setIsImporting(true);
    const startedAt = new Date().toISOString();
    const errors: { filename: string; error: string }[] = [];

    try {
      const eventsToCreate = toImport.map((r) => {
        const p = r.processed!;
        return {
          title: p.title,
          content: p.content,
          contentHash: p.contentHash,
          eventDate: p.eventDate,
          dateConfidence: p.dateConfidence,
          dateSource: p.dateSource,
          importedAt: startedAt,
          importRunId: "", // filled after run creation
          sourceFile: p.sourceFile,
          origin: "markdown_import" as const,
          analysisStatus: "unanalyzed" as const,
          isDuplicate: false,
          tags: p.tags,
        };
      });

      // Collect error rows
      previewRows
        .filter((r) => r.error)
        .forEach((r) => errors.push({ filename: r.file.name, error: r.error! }));

      const unknownDateCount = eventsToCreate.filter(
        (e) => e.dateConfidence === "unknown"
      ).length;
      const duplicateCandidates = previewRows.filter((r) => r.isDuplicate).length;

      const finishedAt = new Date().toISOString();

      // Create the run record first to get an ID
      const run = await createImportRun(uid, {
        startedAt,
        finishedAt,
        sourceType: "markdown_files",
        fileCount: previewRows.length,
        successCount: toImport.length,
        errorCount: errors.length,
        unknownDateCount,
        duplicateCandidates,
        errors,
        createdEventIds: [],
      });

      // Attach runId to each event
      const eventsWithRunId = eventsToCreate.map((e) => ({
        ...e,
        importRunId: run.id,
      }));

      const createdIds = await batchCreateMemoryEvents(uid, eventsWithRunId);

      // Update run with created IDs (best-effort, no blocking)
      // We skip this update to avoid another Firestore write complexity;
      // the run record is still valid without it.

      setReportRun({ ...run, createdEventIds: createdIds });
      setPreviewRows([]);
      showToast(`${toImport.length} relato(s) importado(s).`, "success");
      await loadData();
      setActiveTab("timeline");
    } catch (err) {
      console.error("Erro ao importar:", err);
      showToast("Erro durante a importação.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredEvents =
    filterConfidence === "all"
      ? events
      : events.filter((e) => e.dateConfidence === filterConfidence);

  const unknownEvents = events.filter((e) => e.dateConfidence === "unknown");
  const timelineGroups = groupByYearMonth(
    events.filter((e) => e.dateConfidence !== "unknown")
  );
  const sortedYears = Array.from(timelineGroups.keys()).sort((a, b) => b.localeCompare(a));

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-900">
            Acervo Pessoal
          </h2>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
            {events.length} relato{events.length !== 1 ? "s" : ""} arquivado{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
          {(
            [
              { key: "timeline", label: "Linha do Tempo", icon: Clock },
              { key: "relatos", label: "Relatos", icon: FileText },
              { key: "importar", label: "Importar", icon: Upload },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                activeTab === key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: Linha do Tempo ── */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg">
              <EmptyState icon={BookOpen} text="Nenhum relato importado" />
            </div>
          ) : (
            <>
              {/* Events with detected date */}
              {sortedYears.map((year) => {
                const monthMap = timelineGroups.get(year)!;
                const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));
                return (
                  <div key={year}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold font-mono text-zinc-900">{year}</span>
                      <div className="flex-1 h-px bg-zinc-200" />
                    </div>
                    {sortedMonths.map((month) => {
                      const monthEvents = monthMap.get(month)!;
                      const monthName = MONTH_NAMES[parseInt(month, 10)] || month;
                      return (
                        <div key={month} className="ml-4 mb-4">
                          <p className="text-[10px] font-mono text-zinc-400 uppercase mb-2">
                            {monthName}
                          </p>
                          <div className="space-y-2">
                            {monthEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-3 flex items-start gap-3"
                              >
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                  <FileText className="h-2.5 w-2.5 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-zinc-800 truncate">{ev.title}</p>
                                    <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                                      {formatDate(ev.eventDate, ev.dateConfidence)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {confidenceBadge(ev.dateConfidence)}
                                    {ev.isDuplicate && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 uppercase">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        duplicado
                                      </span>
                                    )}
                                    {analysisBadge(ev.analysisStatus)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Sem data confirmada */}
              {unknownEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold font-mono text-zinc-400">
                      Sem data confirmada
                    </span>
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[9px] font-mono text-zinc-400">
                      {unknownEvents.length} relato{unknownEvents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {unknownEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-white border border-zinc-100 rounded-lg p-3 flex items-start gap-3 opacity-70"
                      >
                        <div className="mt-0.5 h-5 w-5 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                          <HelpCircle className="h-2.5 w-2.5 text-zinc-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-600 truncate">{ev.title}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {confidenceBadge("unknown")}
                            {analysisBadge(ev.analysisStatus)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: Relatos ── */}
      {activeTab === "relatos" && (
        <div className="space-y-3">
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Filtrar por data:</span>
            {(
              [
                { key: "all", label: "Todos" },
                { key: "exact", label: "Exata" },
                { key: "estimated", label: "Estimada" },
                { key: "unknown", label: "Sem data" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterConfidence(key)}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded uppercase cursor-pointer transition-colors ${
                  filterConfidence === key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg">
              <EmptyState icon={Inbox} text="Nenhum relato importado" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-800 truncate">{ev.title}</p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-0.5 truncate">
                        {ev.sourceFile}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 shrink-0 text-right">
                      {formatDate(ev.eventDate, ev.dateConfidence)}
                    </span>
                  </div>

                  {/* Indicators row */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {confidenceBadge(ev.dateConfidence)}
                    {analysisBadge(ev.analysisStatus)}
                    {ev.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 uppercase">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        duplicado
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-400 border border-zinc-200 uppercase">
                      <Hash className="h-2.5 w-2.5" />
                      {ev.contentHash}
                    </span>
                    {ev.importRunId && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-400 border border-zinc-200">
                        run:{ev.importRunId.substring(0, 6)}
                      </span>
                    )}
                    {ev.origin === "markdown_import" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-400 border border-zinc-200 uppercase">
                        <FileText className="h-2.5 w-2.5" />
                        md import
                      </span>
                    )}
                    {ev.tags && ev.tags.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-200">
                        <Tag className="h-2.5 w-2.5" />
                        {ev.tags.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Importar ── */}
      {activeTab === "importar" && (
        <div className="space-y-4">
          {/* Drop zone */}
          {previewRows.length === 0 && !processingFiles && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[hsl(var(--color-primary))] bg-blue-50"
                  : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              <Upload className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-xs font-semibold text-zinc-600">
                Arraste arquivos .md ou .txt aqui
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                ou clique para selecionar arquivos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          )}

          {/* Processing spinner */}
          {processingFiles && (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-400">Processando arquivos...</span>
            </div>
          )}

          {/* Preview table */}
          {previewRows.length > 0 && !processingFiles && (
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-700">
                  Preview — {previewRows.filter((r) => r.selected).length} de {previewRows.length} selecionados
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewRows([])}
                    className="text-[9px] font-mono text-zinc-400 hover:text-zinc-700 uppercase cursor-pointer"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] font-mono text-[hsl(var(--color-primary))] hover:underline uppercase cursor-pointer"
                  >
                    + Adicionar
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.txt"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </div>
              </div>

              <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
                {previewRows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-4 py-2.5 ${
                      !row.selected ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleRow(idx)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      {row.error ? (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                          <span className="text-[10px] font-mono text-red-600 truncate">
                            {row.file.name}: {row.error}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-zinc-800 truncate text-[11px]">
                              {row.processed!.title}
                            </p>
                            <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                              {formatDate(row.processed!.eventDate, row.processed!.dateConfidence)}
                            </span>
                          </div>
                          <p className="text-[9px] text-zinc-400 font-mono mt-0.5 truncate">
                            {row.file.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {confidenceBadge(row.processed!.dateConfidence)}
                            {row.isDuplicate && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 uppercase">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                possível duplicado
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border-t border-zinc-100 bg-zinc-50">
                <div className="flex-1 text-[10px] text-zinc-400 font-mono">
                  {previewRows.filter((r) => r.isDuplicate).length > 0 && (
                    <span className="text-orange-500">
                      {previewRows.filter((r) => r.isDuplicate).length} possível(eis) duplicado(s) detectado(s)
                    </span>
                  )}
                </div>
                <button
                  onClick={handleImport}
                  disabled={isImporting || previewRows.filter((r) => r.selected).length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white font-mono text-[10px] font-bold rounded cursor-pointer uppercase hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {isImporting
                    ? "Importando..."
                    : `Importar ${previewRows.filter((r) => r.selected).length} arquivo(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Import history */}
          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
              <History className="h-3.5 w-3.5 text-zinc-400" />
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-700">
                Histórico de Importações
              </h4>
            </div>
            {importRuns.length === 0 ? (
              <EmptyState icon={Archive} text="Nenhuma importação registrada" />
            ) : (
              <div className="divide-y divide-zinc-50">
                {importRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-700">
                        <span className="font-bold text-emerald-600">{run.successCount}</span> criados
                        {run.errorCount > 0 && (
                          <span className="text-red-500 ml-2 font-bold">{run.errorCount} erros</span>
                        )}
                        {run.duplicateCandidates > 0 && (
                          <span className="text-orange-500 ml-2">{run.duplicateCandidates} dup.</span>
                        )}
                      </p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                        {new Date(run.startedAt).toLocaleString("pt-BR")} · ID {run.id.substring(0, 8)}
                      </p>
                    </div>
                    <button
                      onClick={() => setReportRun(run)}
                      className="text-[9px] font-mono text-[hsl(var(--color-primary))] hover:underline cursor-pointer uppercase flex items-center gap-1"
                    >
                      <Info className="h-3 w-3" />
                      Ver relatório
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Report Modal */}
      {reportRun && (
        <ImportReportModal run={reportRun} onClose={() => setReportRun(null)} />
      )}
    </div>
  );
}
