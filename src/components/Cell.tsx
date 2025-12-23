/**
 * Cell Component - Renders a single formatted, colored value
 */

import { formatValue } from '../lib/formatters';
import { getBackgroundColor, getTextColor } from '../lib/colors';
import type { CellProps } from '../types';

/**
 * Blend two hex colors together
 */
function blendColors(color1: string, color2: string, ratio: number): string {
  const hex = (c: string): number => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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
}: CellProps): JSX.Element {
  const formattedValue = formatValue(value, format);

  const color = isHeader
    ? '#374151'
    : getTextColor(value, textColor, textColorValue);

  const textAlign = align ?? (format === 'text' ? 'left' : 'right');

  let backgroundColor: string;
  if (customBackground) {
    if (isHovered && columnBackground) {
      const colBg = getBackgroundColor(columnBackground);
      if (colBg) {
        backgroundColor = blendColors(customBackground, colBg, 0.5);
      } else {
        backgroundColor = customBackground;
      }
    } else if (columnBackground && !isHovered) {
      const colBg = getBackgroundColor(columnBackground);
      backgroundColor = colBg ?? customBackground;
    } else {
      backgroundColor = customBackground;
    }
  } else {
    backgroundColor = getBackgroundColor(background) ?? 'transparent';
  }

  const style: React.CSSProperties = {
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
  };

  if (width) {
    style.width = `${width}px`;
    style.minWidth = `${width}px`;
  }

  if (isHovered) {
    style.boxShadow = 'inset 0 0 0 2px #3b82f6';
  }

  return (
    <td style={style} onMouseEnter={onMouseEnter}>
      {formattedValue}
    </td>
  );
}

export default Cell;
