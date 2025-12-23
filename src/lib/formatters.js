/**
 * Format a value according to format rules from formats.json
 *
 * Python equivalent:
 *   def format_value(value, format_config):
 *       if format_config.get('decimals') is not None:
 *           return f"{value:,.{decimals}f}"
 *       return str(value)
 */

import formatsConfig from '../../config/formats.json'

/**
 * Format a value using a format type from formats.json
 *
 * @param {any} value - The raw value to format
 * @param {string} formatType - The format type (e.g., "integer", "decimal_2")
 * @returns {string} - The formatted string
 */
export function formatValue(value, formatType) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '-'
  }

  // Get the format config (e.g., { decimals: 0, thousands_separator: true })
  const config = formatsConfig[formatType] || {}

  // Text format - just return as string
  if (formatType === 'text' || Object.keys(config).length === 0) {
    return String(value)
  }

  // Number formatting
  if (typeof value === 'number') {
    let formatted = value

    // Apply decimal places
    if (config.decimals !== undefined) {
      formatted = value.toFixed(config.decimals)
    }

    // Apply thousands separator
    if (config.thousands_separator) {
      // Split by decimal point, add commas to integer part
      const parts = formatted.toString().split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      formatted = parts.join('.')
    }

    // Add suffix (e.g., " bps" or "%")
    if (config.suffix) {
      formatted = formatted + config.suffix
    }

    return formatted
  }

  // Date formatting (simplified - you could use a library like date-fns)
  if (config.pattern && typeof value === 'string') {
    // For now, just return the value as-is
    // In production, you'd parse and format the date
    return value
  }

  // Fallback
  return String(value)
}
