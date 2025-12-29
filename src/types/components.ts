/**
 * Component Props Types
 */

import type { Dispatch, SetStateAction } from 'react';
import type { ApiResponse, RequestParams, DataSource } from './api';
import type {
  GridConfig,
  SectionConfig,
  ApiConfig,
  FormatType,
  TextColorMode,
  TextColorToken,
  ColumnDefinition,
} from './config';

/** Totals row data */
export type TotalsRecord = Record<string, number | string | null>;

/** Data row type */
export type DataRow = Record<string, unknown>;

export interface GridTableProps {
  data: DataRow[] | null | undefined;
  columns: ColumnDefinition[];
  totals?: TotalsRecord | null;
  label?: string;
}

export interface GridCardProps {
  value: number | null | undefined;
  label: string;
  format?: FormatType;
  background?: string | null;
  textColor?: TextColorMode;
  textColorValue?: TextColorToken;
}

export interface CellProps {
  value: unknown;
  format?: FormatType;
  textColor?: TextColorMode;
  textColorValue?: TextColorToken;
  isHeader?: boolean;
}

export interface DataDisplayProps {
  gridConfig: GridConfig;
  apiData: ApiResponse;
}

export interface MetadataProps {
  apiData: ApiResponse | null;
  currentSection: string;
}

export interface SidebarProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  sectionConfigs: Record<string, SectionConfig>;
}

export interface ParamsFormProps {
  params: RequestParams;
  onParamsChange: (params: RequestParams) => void;
  onSubmit: () => void;
  isLoading: boolean;
  apiConfig: ApiConfig;
  selectedEnv: string;
  onEnvChange: (env: string) => void;
  customUrl: string;
  onCustomUrlChange: (url: string) => void;
}

export interface UseDataReturn {
  data: ApiResponse;
  isLoading: boolean;
  error: string | null;
  params: RequestParams;
  setParams: Dispatch<SetStateAction<RequestParams>>;
  dataSource: DataSource;
  apiConfig: ApiConfig;
  selectedEnv: string;
  setSelectedEnv: Dispatch<SetStateAction<string>>;
  customUrl: string;
  setCustomUrl: Dispatch<SetStateAction<string>>;
  effectiveBaseUrl: string;
  refresh: () => Promise<ApiResponse>;
}
