/**
 * Cell Component - Renders a single formatted, colored value
 */

import { formatValue } from '../lib/formatters';
import { getBackgroundColor, getTextColor, text, getBorderColor } from '../lib/colors';
import type { CellProps } from '../types';

function Cell({
  value,
  format = 'text',
  background = null,
  columnBackground = null,
  textColor = 'fixed',
  textColorValue = 'positive',
  align,
  width,
  isHeader = false,
  onMouseEnter,
}: CellProps): JSX.Element {
  const formattedValue = formatValue(value, format);
  const color = isHeader ? text('default') : getTextColor(value, textColor, textColorValue);
  const textAlign = align ?? (format === 'text' ? 'left' : 'right');
  const colBg = columnBackground ? getBackgroundColor(columnBackground) : null;
  const backgroundColor = colBg ?? getBackgroundColor(background) ?? 'transparent';

  const style: React.CSSProperties = {
    padding: '8px 12px',
    textAlign,
    backgroundColor,
    color,
    fontWeight: isHeader ? 600 : 400,
    fontSize: isHeader ? '12px' : '13px',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${getBorderColor('default')}`,
  };

  if (width) {
    style.width = `${width}px`;
    style.minWidth = `${width}px`;
  }

  return (
    <td style={style} onMouseEnter={onMouseEnter}>
      {formattedValue}
    </td>
  );
}

export default Cell;
