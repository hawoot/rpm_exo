/**
 * Configuration Types - Grid, Section, Theme, and API configs
 */

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

/** Background color tokens */
export type BackgroundToken =
  | 'pnl'
  | 'risk'
  | 'rate'
  | 'header'
  | 'total'
  | 'row-even'
  | 'row-odd'
  | 'row-hover'
  | 'col-hover'
  | 'cell-hover'
  | 'header-hover'
  | 'filter-row';

/** Text color tokens */
export type TextColorToken = 'default' | 'negative' | 'positive' | 'muted' | 'active';

/** UI color tokens */
export type UiColorToken =
  | 'button-bg'
  | 'button-bg-active'
  | 'button-text'
  | 'button-text-active'
  | 'success-bg'
  | 'success-text'
  | 'danger-text'
  | 'focus-ring';

/** Border color tokens */
export type BorderToken = 'default' | 'strong';

/** Theme configuration from theme.json */
export interface ThemeConfig {
  colors: {
    backgrounds: Record<string, string>;
    text: Record<string, string>;
    border: Record<string, string>;
    ui: Record<string, string>;
  };
}

/** Text color mode for values */
export type TextColorMode = 'fixed' | 'sign-based';

/** Column definition for grid tables */
export interface ColumnDefinition {
  field: string;
  label: string;
  format: FormatType;
  width?: number;
  frozen?: boolean;
  background: string | null;
  text_color: TextColorMode;
  text_color_value?: TextColorToken;
}

/** Display types for grids */
export type DisplayType = 'table' | 'card' | 'row' | 'kv';

/** Base grid configuration */
interface BaseGridConfig {
  id: string;
  label: string;
  data_path: string;
}

/** Table grid configuration */
export interface TableGridConfig extends BaseGridConfig {
  display_type: 'table';
  totals_path?: string;
  columns: ColumnDefinition[];
}

/** Card grid configuration */
export interface CardGridConfig extends BaseGridConfig {
  display_type: 'card';
  format: FormatType;
  background?: string | null;
  text_color?: TextColorMode;
  text_color_value?: TextColorToken;
}

/** Row grid configuration (future) */
export interface RowGridConfig extends BaseGridConfig {
  display_type: 'row';
}

/** Key-value grid configuration (future) */
export interface KvGridConfig extends BaseGridConfig {
  display_type: 'kv';
}

/** Union of all grid config types */
export type GridConfig =
  | TableGridConfig
  | CardGridConfig
  | RowGridConfig
  | KvGridConfig;

/** Navigation group */
export interface NavGroup {
  id: string;
  label: string;
  order: number;
}

/** Layout item definition (matrix format) */
export interface LayoutItem {
  component: string;  // e.g., "cards/futures-pnl"
  row: number;
  col: number;
}

/** Section configuration */
export interface SectionConfig {
  id: string;
  label: string;
  nav_group: string;
  order: number;
  layout: LayoutItem[];
}

/** Sections index configuration */
export interface SectionsIndex {
  nav_groups: NavGroup[];
  sections: string[];
}

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
