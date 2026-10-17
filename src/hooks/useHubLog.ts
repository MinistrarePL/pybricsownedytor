import { useCallback, useRef, useState } from 'react';

export type HubLogKind = 'info' | 'success' | 'error' | 'hub';

export interface HubLogLine {
  id: number;
  at: number;
  kind: HubLogKind;
  text: string;
}

const MAX_LINES = 400;

export function useHubLog() {
  const [lines, setLines] = useState<HubLogLine[]>([]);
  const [open, setOpen] = useState(false);
  const nextId = useRef(1);
  const stdoutBuf = useRef('');

  const append = useCallback((kind: HubLogKind, text: string) => {
    const trimmed = text.replace(/\s+$/u, '');
    if (!trimmed) {
      return;
    }
    setLines((current) => {
      const line: HubLogLine = { id: nextId.current++, at: Date.now(), kind, text: trimmed };
      const next = [...current, line];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
    if (kind === 'error') {
      setOpen(true);
    }
  }, []);

  const pushStdout = useCallback(
    (chunk: string) => {
      stdoutBuf.current += chunk.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const parts = stdoutBuf.current.split('\n');
      stdoutBuf.current = parts.pop() ?? '';
      for (const part of parts) {
        const text = part.trimEnd();
        if (!text) {
          continue;
        }
        const error = /traceback|error|exception|oserror|runtimeerror/i.test(text);
        append(error ? 'error' : 'hub', text);
      }
    },
    [append],
  );

  const flushStdout = useCallback(() => {
    const leftover = stdoutBuf.current.trim();
    stdoutBuf.current = '';
    if (leftover) {
      append(/traceback|error|exception/i.test(leftover) ? 'error' : 'hub', leftover);
    }
  }, [append]);

  const clear = useCallback(() => {
    stdoutBuf.current = '';
    setLines([]);
  }, []);

  const copyText = useCallback(() => {
    return lines
      .map((line) => `${new Date(line.at).toLocaleTimeString()} [${line.kind}] ${line.text}`)
      .join('\n');
  }, [lines]);

  return { lines, open, setOpen, append, pushStdout, flushStdout, clear, copyText };
}

export type HubLog = ReturnType<typeof useHubLog>;
