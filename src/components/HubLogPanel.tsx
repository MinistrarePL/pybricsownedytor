import { Check, ChevronDown, ChevronUp, Copy, ScrollText, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { HubLog, HubLogKind } from '../hooks/useHubLog.ts';

const KIND_CLASS: Record<HubLogKind, string> = {
  info: 'text-slate-600',
  success: 'text-emerald-700',
  error: 'text-rose-600',
  hub: 'text-sky-800',
};

interface Props {
  log: HubLog;
}

export function HubLogPanel({ log }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const errors = log.lines.filter((line) => line.kind === 'error').length;

  useEffect(() => {
    const el = scroller.current;
    if (el && log.open) {
      el.scrollTop = el.scrollHeight;
    }
  }, [log.lines, log.open]);

  const copy = async () => {
    const text = log.copyText();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="shrink-0 border-t border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => log.setOpen((open) => !open)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ScrollText className="size-4 shrink-0 text-slate-500" strokeWidth={2.3} />
          <span className="text-sm font-extrabold text-slate-700">Log huba</span>
          <span className="truncate text-xs font-semibold text-slate-400">
            {log.lines.length === 0 ? 'pusto' : `${log.lines.length} wpisów`}
            {errors > 0 ? ` · ${errors} błędów` : ''}
          </span>
          {log.open ? (
            <ChevronDown className="ml-auto size-4 text-slate-400" />
          ) : (
            <ChevronUp className="ml-auto size-4 text-slate-400" />
          )}
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          disabled={log.lines.length === 0}
          className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          title="Kopiuj log"
        >
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        </button>
        <button
          type="button"
          onClick={log.clear}
          disabled={log.lines.length === 0}
          className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          title="Wyczyść log"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {log.open && (
        <div
          ref={scroller}
          className="max-h-48 overflow-auto border-t border-slate-100 bg-slate-50 px-4 py-2 font-mono text-xs leading-relaxed"
        >
          {log.lines.length === 0 ? (
            <p className="font-sans text-sm font-semibold text-slate-400">Tu pojawią się komunikaty i błędy z huba.</p>
          ) : (
            log.lines.map((line) => (
              <div key={line.id} className={`whitespace-pre-wrap ${KIND_CLASS[line.kind]}`}>
                <span className="mr-2 select-none text-slate-400">{timeOf(line.at)}</span>
                {line.text}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function timeOf(at: number): string {
  return new Date(at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
