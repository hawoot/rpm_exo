/**
 * Cell Component - Formats and colors a value
 */

import { formatValue } from '../lib/formatters';
import { getTextColor, text } from '../lib/colors';
import type { CellProps } from '../types';

function Cell({
  value,
  format = 'text',
  textColor = 'fixed',
  textColorValue = 'positive',
  isHeader = false,
}: CellProps): JSX.Element {
  const formattedValue = formatValue(value, format);
  const color = isHeader ? text('default') : getTextColor(value, textColor, textColorValue);

  return <span style={{ color }}>{formattedValue}</span>;
}

export default Cell;
