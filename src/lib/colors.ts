/**
 * Color utilities - resolve color tokens from theme.json
 */

import { themeConfig } from '../config/registry';
import type { TextColorMode, TextColorToken, BorderToken } from '../types';

const theme = themeConfig;

/**
 * Get a background color from the theme
 */
export function getBackgroundColor(token: string | null | undefined): string | undefined {
  if (!token) return undefined;
  return theme.colors.backgrounds[token];
}

/**
 * Get text color based on value and color mode
 */
export function getTextColor(
  value: unknown,
  colorMode: TextColorMode,
  fixedColorToken: TextColorToken = 'positive'
): string {
  const defaultColor = '#1f2937';
  if (colorMode === 'sign-based') {
    const numValue = typeof value === 'number' ? value : 0;
    return numValue < 0
      ? (theme.colors.text.negative ?? defaultColor)
      : (theme.colors.text.positive ?? defaultColor);
  }

  return theme.colors.text[fixedColorToken] ?? theme.colors.text.positive ?? defaultColor;
}

/**
 * Get a border color from the theme
 */
export function getBorderColor(type: BorderToken = 'default'): string {
  return theme.colors.border[type] ?? '#e5e7eb';
}

/**
 * Get row background color (alternating)
 */
export function getRowBackground(index: number, isHovered: boolean = false): string {
  if (isHovered) {
    return theme.colors.backgrounds['row-hover'] ?? '#f0f0f0';
  }
  return index % 2 === 0
    ? (theme.colors.backgrounds['row-even'] ?? '#ffffff')
    : (theme.colors.backgrounds['row-odd'] ?? '#fafafa');
}
