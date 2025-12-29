/**
 * useData Hook - Manages data fetching
 *
 * To switch to live API: comment out MOCK section, uncomment API section
 */

import { useState, useCallback } from 'react';
import type { ApiResponse, RequestParams, DataSource, UseDataReturn } from '../types';
import { apiConfig } from '../config/registry';
import mockApiData from '../../mocks/sampleResponse.json'; // MOCK: comment out for live API

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              SHARED UTILS                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getPreviousWorkingDay = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() - 1);
  }
  return result;
};

// Join base URL with endpoint, preserving the base path
const joinUrl = (base: string, path: string): string => {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

const today = new Date();
const DEFAULT_PARAMS: RequestParams = {
  env_date: formatDate(today),
  pos_date: formatDate(getPreviousWorkingDay(today)),
  books: ['OfficialCUPSBook', 'RATES_EUR', 'RATES_USD', 'RATES_GBP'],
  time_of_day: 'Live',
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              MAIN HOOK                                     ║
// ╚════════════════════════════════════════════════════════════════════════════╝

export function useData(): UseDataReturn {
  const [params, setParams] = useState<RequestParams>(DEFAULT_PARAMS);
  const [selectedEnv, setSelectedEnv] = useState<string>(apiConfig.default_environment);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveBaseUrl: string =
    customUrl || (apiConfig.environments[selectedEnv]?.base_url ?? '');

  // Build the full request URL for display (useful for debugging)
  const buildRequestUrl = useCallback((): string => {
    try {
      const url = new URL(joinUrl(effectiveBaseUrl, apiConfig.endpoints.pos_env));
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(','));
        } else if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
      return url.toString();
    } catch {
      return `${effectiveBaseUrl}${apiConfig.endpoints.pos_env}?...`;
    }
  }, [effectiveBaseUrl, params]);

  const requestUrl = buildRequestUrl();

  // ════════════════════════════════════════════════════════════════════════════
  // MOCK - comment out this section to use live API
  // ════════════════════════════════════════════════════════════════════════════

  const mockData = mockApiData as unknown as ApiResponse;

  const [data, setData] = useState<ApiResponse | null>(mockData);

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
  }, [mockData]);

  // // ════════════════════════════════════════════════════════════════════════════
  // // API - uncomment this section to use live API
  // // ════════════════════════════════════════════════════════════════════════════

  // const [data, setData] = useState<ApiResponse | null>(null);

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

  //   // Build URL outside try block so it's accessible in catch
  //   const url = new URL(joinUrl(effectiveBaseUrl, apiConfig.endpoints.pos_env));
  //   Object.entries(params).forEach(([key, value]) => {
  //     if (Array.isArray(value)) {
  //       url.searchParams.set(key, value.join(','));
  //     } else if (value !== undefined && value !== null) {
  //       url.searchParams.set(key, String(value));
  //     }
  //   });

  //   try {
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
  //     console.error('API fetch failed:', err);

  //     // Build detailed error message with stack
  //     let message: string;
  //     if (err instanceof Error) {
  //       message = err.stack || err.message;
  //     } else {
  //       message = String(err);
  //     }

  //     // Add request context
  //     const context = `\n\n=== Request Context ===\nURL: ${url.toString()}\nParams: ${JSON.stringify(params, null, 2)}`;
  //     setError(message + context);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [effectiveBaseUrl, params]);

  // ════════════════════════════════════════════════════════════════════════════

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
    requestUrl,
    refresh,
  };
}
