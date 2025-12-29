/**
 * Color utilities - resolve color tokens from theme.json
 */

import { themeConfig } from '../config/registry';
import type { TextColorMode, TextColorToken, BorderToken, BackgroundToken, UiColorToken } from '../types';

const theme = themeConfig;

/**
 * Get a background color from the theme
 */
export function getBackgroundColor(token: string | null | undefined): string | undefined {
  if (!token) return undefined;
  return theme.colors.backgrounds[token];
}

/**
 * Get a background color with a fallback
 */
export function bg(token: BackgroundToken, fallback?: string): string {
  return theme.colors.backgrounds[token] ?? fallback ?? '#ffffff';
}

/**
 * Get text color based on value and color mode
 */
export function getTextColor(
  value: unknown,
  colorMode: TextColorMode,
  fixedColorToken: TextColorToken = 'positive'
): string {
  const defaultColor = theme.colors.text.default ?? '#374151';
  if (colorMode === 'sign-based') {
    const numValue = typeof value === 'number' ? value : 0;
    return numValue < 0
      ? (theme.colors.text.negative ?? defaultColor)
      : (theme.colors.text.positive ?? defaultColor);
  }

  return theme.colors.text[fixedColorToken] ?? theme.colors.text.positive ?? defaultColor;
}

/**
 * Get a text color token
 */
export function text(token: TextColorToken): string {
  return theme.colors.text[token] ?? theme.colors.text.default ?? '#374151';
}

/**
 * Get a border color from the theme
 */
export function getBorderColor(type: BorderToken = 'default'): string {
  return theme.colors.border[type] ?? '#e5e7eb';
}

/**
 * Get a UI color from the theme
 */
export function ui(token: UiColorToken): string {
  return theme.colors.ui[token] ?? '#ffffff';
}

/**
 * Get row background color (alternating)
 */
export function getRowBackground(index: number, isHovered: boolean = false): string {
  if (isHovered) {
    return theme.colors.backgrounds['row-hover'] ?? '#f5f5f5';
  }
  return index % 2 === 0
    ? (theme.colors.backgrounds['row-even'] ?? '#ffffff')
    : (theme.colors.backgrounds['row-odd'] ?? '#fafafa');
}

/**
 * Get cell background based on hover state
 */
export function getCellHoverBackground(
  rowIndex: number | 'totals' | null,
  colIndex: number,
  hoveredRow: number | 'totals' | null,
  hoveredCol: number | null,
  isHeader: boolean = false,
  isTotals: boolean = false
): string {
  const isRowHovered = hoveredRow === rowIndex;
  const isColHovered = hoveredCol === colIndex;

  // Both row and column hovered - strongest highlight
  if (isRowHovered && isColHovered && !isHeader) {
    return bg('cell-hover');
  }
  // Row hovered only
  if (isRowHovered && !isHeader) {
    return bg('row-hover');
  }
  // Column hovered
  if (isColHovered) {
    return isHeader ? bg('header-hover') : bg('col-hover');
  }
  // Totals row
  if (isTotals) {
    return bg('total');
  }
  // Header row
  if (isHeader) {
    return bg('header');
  }
  // Alternating row colors
  return typeof rowIndex === 'number' && rowIndex % 2 === 0
    ? bg('row-even')
    : bg('row-odd');
}
