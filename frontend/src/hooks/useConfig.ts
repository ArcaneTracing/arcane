import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@/api/config';

const CONFIG_QUERY_KEY = ['config'];

export function useConfig() {
  const query = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: ({ signal }) => getConfig(signal),
    staleTime: 5 * 60 * 1000
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}