/**
 * Format a value according to format rules from formats.json
 */

import { formatsConfig } from '../config/registry';

const formats = formatsConfig;

/**
 * Format a value using a format type from formats.json
 *
 * @param value - The raw value to format
 * @param formatType - The format type (e.g., "integer")
 * @returns The formatted string
 */
export function formatValue(value: unknown, formatType: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  const config = formats[formatType];

  if (!config || formatType === 'text') {
    return String(value);
  }

  if (typeof value === 'number') {
    let formatted: string;

    if (config.decimals !== undefined) {
      formatted = value.toFixed(config.decimals);
    } else {
      formatted = String(value);
    }

    if (config.thousands_separator === true) {
      const parts = formatted.split('.');
      const integerPart = parts[0];
      if (integerPart !== undefined) {
        parts[0] = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      formatted = parts.join('.');
    }

    return formatted;
  }

  if (config.pattern !== undefined && typeof value === 'string') {
    return value;
  }

  return String(value);
}
