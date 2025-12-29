/**
 * AG Grid Utilities - Convert column configs to AG Grid ColDef
 */

import type { ColDef, ValueFormatterParams, CellClassParams } from 'ag-grid-community';
import type { ColumnDefinition } from '../types';
import { themeConfig } from '../config/registry';

const theme = themeConfig.colors;

/**
 * Convert ColumnDefinition[] to AG Grid ColDef[]
 */
export function convertColumnsToColDefs(columns: ColumnDefinition[]): ColDef[] {
  return columns.map((col) => ({
    field: col.field,
    headerName: col.label,
    type: col.format === 'text' ? undefined : 'rightAligned',
    valueFormatter: getValueFormatter(col.format),
    cellStyle: getCellStyleFn(col),
  }));
}

/**
 * Get AG Grid valueFormatter based on format type
 */
function getValueFormatter(format: string) {
  return (params: ValueFormatterParams): string => {
    const value = params.value;
    if (value == null) return '-';

    if (format === 'integer') {
      return Math.round(Number(value)).toLocaleString('en-US');
    }
    if (format === 'decimal') {
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return String(value);
  };
}

/**
 * Get AG Grid cellStyle function for dynamic styling
 */
function getCellStyleFn(col: ColumnDefinition) {
  return (params: CellClassParams): Record<string, string> => {
    const style: Record<string, string> = {};

    // Background color from column config
    const bgColor = col.background ? theme.backgrounds[col.background] : undefined;
    if (bgColor) {
      style.backgroundColor = bgColor;
    }

    // Text color: sign-based or fixed
    if (col.text_color === 'sign-based') {
      const num = typeof params.value === 'number' ? params.value : 0;
      style.color = num < 0 ? (theme.text.negative ?? '#dc2626') : (theme.text.positive ?? '#1f2937');
    } else {
      style.color = theme.text[col.text_color_value ?? 'default'] ?? '#374151';
    }

    return style;
  };
}
