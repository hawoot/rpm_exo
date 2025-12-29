/**
 * Data Models & API Types
 *
 * SECTIONS:
 * - Request / Response
 * - Futures Domain
 * - Bonds Domain
 * - API Configuration
 */

// ============================================
// REQUEST / RESPONSE
// ============================================

/** Time of day options for data fetching */
export type TimeOfDay = 'Open' | 'Close' | 'Live';

/** Request parameters sent to the API */
export interface RequestParams {
  env_date: string;
  pos_date: string;
  books: string[];
  time_of_day: TimeOfDay;
  bypass_cache?: boolean;
}

/** Metadata included with each section's data */
export interface SectionMetadata {
  last_updated: string;
  status: string;
  refresh_duration_ms: number;
  repro?: string;
}

/** Generic section data structure */
export interface SectionData<TData = Record<string, unknown>> {
  data: TData;
  metadata: SectionMetadata;
  error_stack: string;
}

/** Complete API response structure */
export interface ApiResponse {
  request_id: string;
  timestamp_request: string;
  timestamp_response: string;
  timestamp_data_calculated: string;
  timestamp_data_cached: string | null;
  lag_s: number;
  duration_s: number;
  cache_hit: boolean;
  error: boolean;
  error_stack: string;
  curl_command: string;
  base_params: RequestParams;
  section_params: Record<string, unknown> | null;
  response_data: Record<string, SectionData | undefined>;
}

/** Data source information */
export interface DataSource {
  type: 'mock' | 'api';
  file: string | null;
  url: string | null;
  environment: string;
  environmentLabel: string | undefined;
}

// ============================================
// FUTURES DOMAIN
// ============================================

/** Futures position row */
export interface FuturePosition {
  instrument: string;
  exchange: string;
  position: number;
  dv01: number;
  pnl: number;
}

/** Futures totals */
export interface FutureTotals {
  position: number;
  dv01: number;
  pnl: number;
}

/** Futures summary */
export interface FuturesSummary {
  total_pnl: number;
  total_dv01: number;
  position_count: number;
}

/** Futures section data */
export interface FuturesData {
  future_position: FuturePosition[];
  future_totals: FutureTotals;
  summary: FuturesSummary;
}

// ============================================
// BONDS DOMAIN
// ============================================

/** Bond position row */
export interface BondPosition {
  isin: string;
  description: string;
  position: number;
  dv01: number;
  pnl: number;
}

/** Bond totals */
export interface BondTotals {
  dv01: number;
  pnl: number;
}

/** Bonds section data */
export interface BondsData {
  bond_position: BondPosition[];
  bond_totals: BondTotals;
}

// ============================================
// API CONFIGURATION
// ============================================

/** Environment configuration */
export interface EnvironmentConfig {
  label: string;
  base_url: string;
}

/** API configuration from api.json */
export interface ApiConfig {
  environments: Record<string, EnvironmentConfig>;
  default_environment: string;
  endpoints: {
    pos_env: string;
    [key: string]: string;
  };
  timeout_ms: number;
}
