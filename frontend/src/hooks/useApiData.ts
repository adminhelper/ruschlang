import { useCallback, useEffect, useState } from 'react';

interface UseApiDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  deps: unknown[] = [],
): UseApiDataReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
