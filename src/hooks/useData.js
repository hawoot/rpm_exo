/**
 * useData Hook - Manages data fetching with clear source indication
 *
 * To switch from mock to live API:
 * 1. Set USE_MOCK_DATA to false below
 * 2. Ensure your backend is running at the configured URL
 */

import { useState, useCallback } from 'react'

// ============================================================
// DATA SOURCE CONFIGURATION
// ============================================================
// Change this to false when you want to use the real API
const USE_MOCK_DATA = true
// ============================================================

import mockApiData from '../mocks/sampleResponse.json'
import apiConfig from '../../config/api.json'

// Default params from mock data
const DEFAULT_PARAMS = {
  env_date: mockApiData.base_params?.env_date || '20251222',
  pos_date: mockApiData.base_params?.pos_date || '20251221',
  books: mockApiData.base_params?.books || ['OfficialCUPSBook', 'EXOTICS'],
  time_of_day: mockApiData.base_params?.time_of_day || 'Close',
}

export function useData() {
  // Request params state
  const [params, setParams] = useState(DEFAULT_PARAMS)

  // Environment selection state
  const [selectedEnv, setSelectedEnv] = useState(apiConfig.default_environment)
  const [customUrl, setCustomUrl] = useState('')

  // Data fetching state
  const [data, setData] = useState(mockApiData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Compute the effective base URL
  const effectiveBaseUrl = customUrl || apiConfig.environments[selectedEnv]?.base_url

  // Data source info
  const dataSource = {
    type: USE_MOCK_DATA ? 'mock' : 'api',
    file: USE_MOCK_DATA ? 'src/mocks/sampleResponse.json' : null,
    url: USE_MOCK_DATA ? null : effectiveBaseUrl,
    environment: selectedEnv,
    environmentLabel: apiConfig.environments[selectedEnv]?.label,
  }

  // Fetch data function
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (USE_MOCK_DATA) {
      // Simulate a small delay for realism
      await new Promise(resolve => setTimeout(resolve, 300))
      setData(mockApiData)
      setIsLoading(false)
      return mockApiData
    }

    // Real API fetch
    try {
      const url = new URL(apiConfig.endpoints.pos_env, effectiveBaseUrl)

      // Add query params
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(','))
        } else if (value !== undefined && value !== null) {
          url.searchParams.set(key, value)
        }
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [effectiveBaseUrl, params])

  return {
    // Data
    data,
    isLoading,
    error,

    // Request params
    params,
    setParams,

    // Source info (for display)
    dataSource,
    useMockData: USE_MOCK_DATA,

    // Environment config
    apiConfig,
    selectedEnv,
    setSelectedEnv,
    customUrl,
    setCustomUrl,
    effectiveBaseUrl,

    // Actions
    refresh,
  }
}
