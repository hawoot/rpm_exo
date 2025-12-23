/**
 * Color utilities - resolve color tokens from theme.json
 *
 * Python equivalent:
 *   theme = json.load(open('config/theme.json'))
 *
 *   def get_background_color(token):
 *       return theme['colors']['backgrounds'].get(token)
 *
 *   def get_text_color(value, color_mode, fixed_color):
 *       if color_mode == 'sign-based':
 *           return theme['colors']['text']['negative' if value < 0 else 'positive']
 *       return theme['colors']['text'].get(fixed_color, '#1f2937')
 */

import themeConfig from '../../config/theme.json'

/**
 * Get a background color from the theme
 * @param {string|null} token - Color token (e.g., "pnl", "risk")
 * @returns {string|undefined} - Hex color or undefined
 */
export function getBackgroundColor(token) {
  if (!token) return undefined
  return themeConfig.colors.backgrounds[token]
}

/**
 * Get text color based on value and color mode
 * @param {number} value - The numeric value (for sign-based coloring)
 * @param {string} colorMode - "fixed" or "sign-based"
 * @param {string} fixedColorToken - Token for fixed mode (e.g., "positive", "muted")
 * @returns {string} - Hex color
 */
export function getTextColor(value, colorMode, fixedColorToken = 'positive') {
  if (colorMode === 'sign-based') {
    // Red for negative, default for positive/zero
    return value < 0
      ? themeConfig.colors.text.negative
      : themeConfig.colors.text.positive
  }

  // Fixed color mode - use the specified token
  return themeConfig.colors.text[fixedColorToken] || themeConfig.colors.text.positive
}

/**
 * Get a border color from the theme
 * @param {string} type - "default" or "strong"
 * @returns {string} - Hex color
 */
export function getBorderColor(type = 'default') {
  return themeConfig.colors.border[type]
}

/**
 * Get row background color (alternating)
 * @param {number} index - Row index
 * @param {boolean} isHovered - Whether row is hovered
 * @returns {string} - Hex color
 */
export function getRowBackground(index, isHovered = false) {
  if (isHovered) {
    return themeConfig.colors.backgrounds['row-hover']
  }
  return index % 2 === 0
    ? themeConfig.colors.backgrounds['row-even']
    : themeConfig.colors.backgrounds['row-odd']
}
