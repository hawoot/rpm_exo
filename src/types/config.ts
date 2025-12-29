/**
 * Configuration Types - Component, Section, Theme, and API configs
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

/** Column definition for tables */
export interface ColumnDefinition {
  field: string;
  label: string;
  format: FormatType;
  width?: number;
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
  sections: SectionConfig[];
}

/** Navbar configuration */
export interface NavbarConfig {
  groups: NavGroup[];
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
