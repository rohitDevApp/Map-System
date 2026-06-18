import { useCallback, useState } from 'react';
import { downloadOfflineStateMap } from '../services/offlineMapService';
import { OfflineMapStatus, StateMapAccess } from '../types/mapTypes';

export const useOfflineMapDownload = (mapAccess: StateMapAccess) => {
  const [status, setStatus] = useState<OfflineMapStatus>('NOT_DOWNLOADED');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const downloadMap = useCallback(async () => {
    try {
      setStatus('DOWNLOADING');
      setError(null);
      setProgress(0);

      await downloadOfflineStateMap(mapAccess, value => {
        setProgress(value);
      });

      setProgress(100);
      setStatus('DOWNLOADED');
    } catch (err: any) {
      setStatus('FAILED');
      setError(err?.message ?? 'Map download failed');
    }
  }, [mapAccess]);

  return {
    status,
    progress,
    error,
    downloadMap,
  };
};
