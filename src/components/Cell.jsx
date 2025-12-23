/**
 * Cell Component - Renders a single formatted, colored value
 *
 * Features:
 * - Number formatting with thousand separators
 * - Sign-based coloring (red for negative)
 * - Column background colors (pnl=green, risk=blue)
 * - Hover highlighting support
 */

import { formatValue } from '../lib/formatters'
import { getBackgroundColor, getTextColor } from '../lib/colors'

/**
 * Cell component - renders a single value with formatting and colors
 *
 * Props:
 * - value: The raw data value
 * - format: Format type from formats.json (e.g., "integer", "decimal_2")
 * - background: Background color token (e.g., "pnl", "risk") or null
 * - customBackground: Override background (used for hover highlighting)
 * - columnBackground: The column's configured background (for tinting on hover)
 * - textColor: "fixed" or "sign-based"
 * - textColorValue: Token for fixed color (e.g., "positive", "muted")
 * - align: Text alignment ("left", "center", "right")
 * - width: Column width in pixels (optional)
 * - isHeader: Whether this is a header cell
 * - isHovered: Whether this specific cell is hovered (row + col intersection)
 * - onMouseEnter: Callback when mouse enters cell
 */
function Cell({
  value,
  format = 'text',
  background = null,
  customBackground = null,
  columnBackground = null,
  textColor = 'fixed',
  textColorValue = 'positive',
  align,
  width,
  isHeader = false,
  isHovered = false,
  onMouseEnter,
}) {
  // Format the value (e.g., 12345 → "12,345")
  const formattedValue = formatValue(value, format)

  // Resolve text color from theme
  const color = isHeader
    ? '#374151'  // Header text is always dark gray
    : getTextColor(value, textColor, textColorValue)

  // Determine alignment: numbers right, text left
  const textAlign = align || (format === 'text' ? 'left' : 'right')

  // Compute background color:
  // 1. If hovered and column has a color, blend hover with column color
  // 2. If customBackground provided (hover state), use it
  // 3. Otherwise use column background token
  let backgroundColor
  if (customBackground) {
    // Check if we should tint with column color
    if (isHovered && columnBackground) {
      // Blend column color with hover - make it more saturated
      const colBg = getBackgroundColor(columnBackground)
      if (colBg) {
        backgroundColor = blendColors(customBackground, colBg, 0.5)
      } else {
        backgroundColor = customBackground
      }
    } else if (columnBackground && !isHovered) {
      // Show column background but slightly faded on row hover
      const colBg = getBackgroundColor(columnBackground)
      backgroundColor = colBg || customBackground
    } else {
      backgroundColor = customBackground
    }
  } else {
    backgroundColor = getBackgroundColor(background) || 'transparent'
  }

  // Build the style object
  const style = {
    padding: '8px 12px',
    textAlign,
    backgroundColor,
    color,
    fontWeight: isHeader ? 600 : 400,
    fontSize: isHeader ? '12px' : '13px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.1s ease',
    cursor: 'default',
  }

  // Add width if specified
  if (width) {
    style.width = `${width}px`
    style.minWidth = `${width}px`
  }

  // Add extra emphasis for hovered cell
  if (isHovered) {
    style.boxShadow = 'inset 0 0 0 2px #3b82f6'
  }

  return (
    <td
      style={style}
      onMouseEnter={onMouseEnter}
    >
      {formattedValue}
    </td>
  )
}

/**
 * Blend two hex colors together
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} ratio - Blend ratio (0 = all color1, 1 = all color2)
 */
function blendColors(color1, color2, ratio) {
  const hex = (c) => parseInt(c, 16)
  const r1 = hex(color1.slice(1, 3))
  const g1 = hex(color1.slice(3, 5))
  const b1 = hex(color1.slice(5, 7))
  const r2 = hex(color2.slice(1, 3))
  const g2 = hex(color2.slice(3, 5))
  const b2 = hex(color2.slice(5, 7))

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio)
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio)
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default Cell
