/**
 * useData Hook - Manages data fetching
 *
 * Currently using mock data. To switch to live API,
 * comment out the mock section and uncomment the API section below.
 */

import { useState, useCallback } from 'react';
import type { ApiResponse, RequestParams, DataSource, UseDataReturn } from '../types';
import mockApiData from '../../mocks/sampleResponse.json';
import { apiConfig } from '../config/registry';

const mockData = mockApiData as ApiResponse;

const DEFAULT_PARAMS: RequestParams = {
  env_date: mockData.base_params?.env_date ?? '20251222',
  pos_date: mockData.base_params?.pos_date ?? '20251221',
  books: mockData.base_params?.books ?? ['OfficialCUPSBook', 'EXOTICS'],
  time_of_day: (mockData.base_params?.time_of_day ?? 'Close') as RequestParams['time_of_day'],
};

export function useData(): UseDataReturn {
  const [params, setParams] = useState<RequestParams>(DEFAULT_PARAMS);
  const [selectedEnv, setSelectedEnv] = useState<string>(apiConfig.default_environment);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [data, setData] = useState<ApiResponse>(mockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveBaseUrl: string =
    customUrl || (apiConfig.environments[selectedEnv]?.base_url ?? '');

  // ============================================================
  // MOCK DATA
  // ============================================================

  const dataSource: DataSource = {
    type: 'mock',
    file: 'mocks/sampleResponse.json',
    url: null,
    environment: selectedEnv,
    environmentLabel: apiConfig.environments[selectedEnv]?.label,
  };

  const refresh = useCallback(async (): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setData(mockData);
    setIsLoading(false);
    return mockData;
  }, []);

  // ============================================================
  // API (uncomment below, comment out mock section above)
  // ============================================================

  // const dataSource: DataSource = {
  //   type: 'api',
  //   file: null,
  //   url: effectiveBaseUrl,
  //   environment: selectedEnv,
  //   environmentLabel: apiConfig.environments[selectedEnv]?.label,
  // };

  // const refresh = useCallback(async (): Promise<ApiResponse> => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const url = new URL(apiConfig.endpoints.pos_env, effectiveBaseUrl);

  //     Object.entries(params).forEach(([key, value]) => {
  //       if (Array.isArray(value)) {
  //         url.searchParams.set(key, value.join(','));
  //       } else if (value !== undefined && value !== null) {
  //         url.searchParams.set(key, String(value));
  //       }
  //     });

  //     const response = await fetch(url.toString(), {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API error: ${response.status} ${response.statusText}`);
  //     }

  //     const result = (await response.json()) as ApiResponse;
  //     setData(result);
  //     return result;
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : 'Unknown error';
  //     setError(message);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [effectiveBaseUrl, params]);

  return {
    data,
    isLoading,
    error,
    params,
    setParams,
    dataSource,
    apiConfig,
    selectedEnv,
    setSelectedEnv,
    customUrl,
    setCustomUrl,
    effectiveBaseUrl,
    refresh,
  };
}
