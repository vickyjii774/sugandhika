import { useState, useEffect, useCallback } from 'react';

/**
 * Generic API hook
 * @param {Function} apiFunc - API service function to call
 * @param {any[]} deps - dependencies to re-fetch on change
 * @param {boolean} immediate - whether to fetch immediately (default true)
 */
export default function useApi(apiFunc, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunc(...args);
        if (result?.success) {
          setData(result.data);
          return result.data;
        } else {
          setData(result);
          return result;
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { data, loading, error, refetch: execute };
}
