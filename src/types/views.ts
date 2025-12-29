/**
 * View Types - Display configuration & React props
 *
 * SECTIONS:
 * - Formatting
 * - Column & Component Display
 * - Layout & Navigation
 * - React Component Props
 */

import type { Dispatch, SetStateAction } from 'react';
import type { ApiResponse, RequestParams, DataSource, ApiConfig } from './models';

// ============================================
// FORMATTING
// ============================================

/** Available format types from formats.json */
export type FormatType =
  | 'text'
  | 'integer'
  | 'decimal'
  | 'date'
  | 'datetime';

/** Format configuration from formats.json */
export interface FormatConfig {
  is_numeric: boolean;
  decimals?: number;
  thousands_separator?: boolean;
  pattern?: string;
}

/** Complete formats configuration */
export type FormatsConfig = Record<string, FormatConfig>;

/** Text color tokens */
export type TextColorToken = 'default' | 'negative' | 'positive' | 'muted' | 'active';

/** Text color mode for values */
export type TextColorMode = 'fixed' | 'sign-based';

/** Theme configuration from theme.json */
export interface ThemeConfig {
  colors: {
    backgrounds: Record<string, string>;
    text: Record<string, string>;
    border: Record<string, string>;
    ui: Record<string, string>;
  };
}

// ============================================
// COLUMN & COMPONENT DISPLAY
// ============================================

/** Column definition for tables */
export interface ColumnDefinition {
  field: string;
  label: string;
  format: FormatType;
  background: string | null;
  text_color: TextColorMode;
  text_color_value?: TextColorToken;
}

/** Display types for components */
export type DisplayType = 'table' | 'card' | 'row' | 'kv';

/** Base component configuration */
interface BaseComponentConfig {
  id: string;
  label: string;
  data_path: string;
}

/** Table configuration */
export interface TableConfig extends BaseComponentConfig {
  display_type: 'table';
  totals_path?: string;
  columns: ColumnDefinition[];
}

/** Card configuration */
export interface CardConfig extends BaseComponentConfig {
  display_type: 'card';
  format: FormatType;
  background?: string | null;
  text_color?: TextColorMode;
  text_color_value?: TextColorToken;
}

/** Row configuration (future) */
export interface RowConfig extends BaseComponentConfig {
  display_type: 'row';
}

/** Key-value configuration (future) */
export interface KvConfig extends BaseComponentConfig {
  display_type: 'kv';
}

/** Union of all component config types */
export type ComponentConfig =
  | TableConfig
  | CardConfig
  | RowConfig
  | KvConfig;

// ============================================
// LAYOUT & NAVIGATION
// ============================================

/** Layout item definition (matrix format) */
export interface LayoutItem {
  component: string;  // e.g., "cards/futures-pnl"
  row: number;
  col: number;
}

/** Section configuration (within a group) */
export interface SectionConfig {
  id: string;
  label: string;
  layout: LayoutItem[];
}

/** Navigation group with nested sections */
export interface NavGroup {
  label: string;
  defaultExpanded?: boolean;
  sections: SectionConfig[];
}

/** Navbar configuration */
export interface NavbarConfig {
  groups: NavGroup[];
}

// ============================================
// REACT COMPONENT PROPS
// ============================================

/** Totals row data */
export type TotalsRecord = Record<string, number | string | null>;

/** Data row type */
export type DataRow = Record<string, unknown>;

/** Table component props */
export interface TableProps {
  data: DataRow[] | null | undefined;
  columns: ColumnDefinition[];
  totals?: TotalsRecord | null;
  label?: string;
}

/** Card component props */
export interface CardProps {
  value: number | null | undefined;
  label: string;
  format?: FormatType;
  background?: string | null;
  textColor?: TextColorMode;
  textColorValue?: TextColorToken;
}

/** DataDisplay component props */
export interface DataDisplayProps {
  componentConfig: ComponentConfig;
  apiData: ApiResponse;
}

/** Metadata component props */
export interface MetadataProps {
  apiData: ApiResponse | null;
  currentSection: string;
}

/** Sidebar component props */
export interface SidebarProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** ParamsForm component props */
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

/** useData hook return type */
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
