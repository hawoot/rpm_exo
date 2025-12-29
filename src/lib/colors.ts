/**
 * Color utilities - resolve color tokens from theme.json
 */

import { themeConfig } from '../config/registry';
import type { TextColorMode, TextColorToken } from '../types';

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
  const defaultColor = theme.colors.text.default ?? '#374151';

  if (colorMode === 'sign-based') {
    const num = typeof value === 'number' ? value : 0;
    return num < 0
      ? (theme.colors.text.negative ?? defaultColor)
      : (theme.colors.text.positive ?? defaultColor);
  }
  return theme.colors.text[fixedColorToken] ?? defaultColor;
}
