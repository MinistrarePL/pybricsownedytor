import { useCallback, useEffect, useState } from 'react';
import { compilePython } from '../compile.ts';
import { PybricksHub } from '../hub.ts';
import type { HubLog } from './useHubLog.ts';
import type { Notify } from './useToasts.ts';

const hub = new PybricksHub();

export const bluetoothAvailable = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useHub(notify: Notify, log?: HubLog) {
  const [connected, setConnected] = useState(hub.connected);
  const [running, setRunning] = useState(hub.running);
  const [name, setName] = useState(hub.name);
  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    hub.onStatus = (status) => {
      setConnected(status.connected);
      setRunning(status.running);
      setName(status.name);
    };
    hub.onStdout = (chunk) => {
      log?.pushStdout(chunk);
    };
    return () => {
      hub.onStatus = null;
      hub.onStdout = null;
    };
  }, [log, notify]);

  const connect = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    try {
      await hub.connect();
      const extra = hub.firmwareVersion ? ` (firmware ${hub.firmwareVersion})` : '';
      notify(`Połączono z ${hub.name}!`, 'success');
      log?.append('success', `Połączono z ${hub.name}${extra}`);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        notify('Nie wybrano huba.');
        log?.append('info', 'Nie wybrano huba.');
      } else {
        const text = errorText(error);
        notify(text, 'error');
        log?.append('error', text);
      }
      return false;
    } finally {
      setConnecting(false);
    }
  }, [log, notify]);

  const disconnect = useCallback(async () => {
    await hub.disconnect();
    notify('Rozłączono hub.');
    log?.append('info', 'Rozłączono hub.');
  }, [log, notify]);

  const run = useCallback(
    async (source: string): Promise<boolean> => {
      setUploading(true);
      try {
        log?.append('info', 'Kompiluję i wgrywam program…');
        const packed = await compilePython(source);
        await hub.downloadAndRun(packed);
        log?.append('success', 'Program wystartował na hubie.');
        return true;
      } catch (error) {
        const text = errorText(error);
        notify(text, 'error');
        log?.append('error', text);
        return false;
      } finally {
        setUploading(false);
      }
    },
    [log, notify],
  );

  const stop = useCallback(async () => {
    try {
      await hub.stop();
      log?.flushStdout();
      log?.append('info', 'Zatrzymano program.');
    } catch (error) {
      const text = errorText(error);
      notify(text, 'error');
      log?.append('error', text);
    }
  }, [log, notify]);

  return { connected, running, name, connecting, uploading, connect, disconnect, run, stop };
}

export type HubControls = ReturnType<typeof useHub>;
