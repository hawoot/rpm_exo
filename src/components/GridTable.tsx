/**
 * GridTable Component - Feature-rich data table
 */

import { useState, useMemo, useRef } from 'react';
import Cell from './Cell';
import { formatsConfig } from '../config/registry';
import { bg, text, ui, getBorderColor, getCellHoverBackground } from '../lib/colors';
import type { GridTableProps } from '../types';

const formats = formatsConfig;

const isNumericFormat = (format: string): boolean => {
  return formats[format]?.is_numeric ?? false;
};

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

type HoveredRowType = number | 'totals' | null;

function GridTable({ data, columns: initialColumns, totals, label }: GridTableProps): JSX.Element {
  const [hoveredRow, setHoveredRow] = useState<HoveredRowType>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    initialColumns.forEach((col) => {
      widths[col.field] = col.width ?? 100;
    });
    return widths;
  });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const resizing = useRef<{ field: string; startX: number; startWidth: number } | null>(null);

  if (!data || !Array.isArray(data)) {
    return (
      <div style={{ padding: '16px', color: text('muted') }}>
        No data available
      </div>
    );
  }

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return data;

    return data.filter((row) => {
      return Object.entries(filters).every(([field, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true;

        const cellValue = row[field];
        const col = initialColumns.find((c) => c.field === field);

        if (col && isNumericFormat(col.format)) {
          const numValue = Number(cellValue);
          const filterStr = filterValue.trim();

          if (filterStr.startsWith('>=')) return numValue >= Number(filterStr.slice(2));
          if (filterStr.startsWith('<=')) return numValue <= Number(filterStr.slice(2));
          if (filterStr.startsWith('>')) return numValue > Number(filterStr.slice(1));
          if (filterStr.startsWith('<')) return numValue < Number(filterStr.slice(1));
          if (filterStr.startsWith('=')) return numValue === Number(filterStr.slice(1));
          return String(cellValue).includes(filterStr);
        }

        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters, initialColumns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const { field, direction } = sortConfig;
    const col = initialColumns.find((c) => c.field === field);
    const isNumeric = col ? isNumericFormat(col.format) : false;

    return [...filteredData].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? 1 : -1;
      if (bVal == null) return direction === 'asc' ? -1 : 1;

      let comparison = 0;
      if (isNumeric) {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, initialColumns]);

  const handleSort = (field: string): void => {
    setSortConfig((current) => {
      if (current?.field !== field) {
        return { field, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return null;
    });
  };

  const getSortIndicator = (field: string): string => {
    if (sortConfig?.field !== field) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const copyToClipboard = (): void => {
    const headers = initialColumns.map((c) => c.label).join('\t');
    const rows = sortedData
      .map((row) => initialColumns.map((c) => row[c.field] ?? '').join('\t'))
      .join('\n');

    let text = headers + '\n' + rows;
    if (totals) {
      const totalsRow = initialColumns
        .map((c, i) => (i === 0 ? 'Total' : (totals[c.field] ?? '')))
        .join('\t');
      text += '\n' + totalsRow;
    }

    void navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const handleFilterChange = (field: string, value: string): void => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = (): void => {
    setFilters({});
    setSortConfig(null);
  };

  const startResize = (e: React.MouseEvent, field: string): void => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = columnWidths[field] ?? 100;
    resizing.current = { field, startX: e.clientX, startWidth };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e: MouseEvent): void => {
    if (!resizing.current) return;
    const diff = e.clientX - resizing.current.startX;
    const newWidth = Math.max(50, resizing.current.startWidth + diff);
    const field = resizing.current.field;
    setColumnWidths((prev) => ({ ...prev, [field]: newWidth }));
  };

  const stopResize = (): void => {
    resizing.current = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  const getCellBackground = (
    rowIndex: HoveredRowType,
    colIndex: number,
    isHeader: boolean = false,
    isTotals: boolean = false
  ): string => {
    return getCellHoverBackground(rowIndex, colIndex, hoveredRow, hoveredCol, isHeader, isTotals);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v && v.trim() !== '');

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '12px',
        }}
      >
        {label && (
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: text('default'), margin: 0 }}>
            {label}
            {(hasActiveFilters || sortConfig) && (
              <span style={{ marginLeft: '8px', fontSize: '11px', color: text('muted') }}>
                ({sortedData.length} of {data.length})
              </span>
            )}
          </h3>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: `1px solid ${getBorderColor('strong')}`,
              borderRadius: '4px',
              backgroundColor: showFilters || hasActiveFilters ? ui('button-bg-active') : ui('button-bg'),
              color: hasActiveFilters ? text('active') : ui('button-text'),
              cursor: 'pointer',
            }}
          >
            {showFilters ? '▲ Filters' : '▼ Filters'}
          </button>

          {(hasActiveFilters || sortConfig) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                color: ui('danger-text'),
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}

          <button
            onClick={copyToClipboard}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: `1px solid ${getBorderColor('strong')}`,
              borderRadius: '4px',
              backgroundColor: copyFeedback ? ui('success-bg') : ui('button-bg'),
              color: copyFeedback ? ui('success-text') : ui('button-text'),
              cursor: 'pointer',
            }}
          >
            {copyFeedback ?? '📋 Copy'}
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: bg('row-even'),
            border: `1px solid ${getBorderColor('default')}`,
            borderRadius: '4px',
          }}
          onMouseLeave={() => {
            setHoveredRow(null);
            setHoveredCol(null);
          }}
        >
          <thead>
            <tr>
              {initialColumns.map((col, colIndex) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  style={{
                    padding: '8px 12px',
                    textAlign: col.format === 'text' ? 'left' : 'right',
                    backgroundColor: getCellBackground(-1, colIndex, true),
                    color: sortConfig?.field === col.field ? text('active') : text('default'),
                    fontWeight: 600,
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    borderBottom: `1px solid ${getBorderColor('default')}`,
                    width: `${columnWidths[col.field] ?? 100}px`,
                    minWidth: `${columnWidths[col.field] ?? 100}px`,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={() => setHoveredCol(colIndex)}
                >
                  {col.label}
                  <span
                    style={{
                      opacity: sortConfig?.field === col.field ? 1 : 0.3,
                      fontSize: '10px',
                    }}
                  >
                    {getSortIndicator(col.field)}
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      cursor: 'col-resize',
                    }}
                    onMouseDown={(e) => startResize(e, col.field)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>

            {showFilters && (
              <tr>
                {initialColumns.map((col) => (
                  <th
                    key={`filter-${col.field}`}
                    style={{
                      padding: '4px',
                      backgroundColor: bg('filter-row'),
                      borderBottom: `1px solid ${getBorderColor('default')}`,
                    }}
                  >
                    <input
                      type="text"
                      placeholder={isNumericFormat(col.format) ? '>0, <100...' : 'Filter...'}
                      value={filters[col.field] ?? ''}
                      onChange={(e) => handleFilterChange(col.field, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: `1px solid ${getBorderColor('strong')}`,
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                style={{ cursor: 'default' }}
              >
                {initialColumns.map((col, colIndex) => (
                  <Cell
                    key={col.field}
                    value={row[col.field]}
                    format={col.format}
                    customBackground={getCellBackground(rowIndex, colIndex)}
                    textColor={col.text_color}
                    textColorValue={col.text_color_value}
                    width={columnWidths[col.field]}
                    columnBackground={col.background}
                    isHovered={hoveredRow === rowIndex && hoveredCol === colIndex}
                    onMouseEnter={() => setHoveredCol(colIndex)}
                  />
                ))}
              </tr>
            ))}

            {sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={initialColumns.length}
                  style={{ padding: '24px', textAlign: 'center', color: text('muted') }}
                >
                  No matching records
                </td>
              </tr>
            )}

            {totals && sortedData.length > 0 && (
              <tr
                onMouseEnter={() => setHoveredRow('totals')}
                style={{ fontWeight: 600 }}
              >
                {initialColumns.map((col, colIndex) => (
                  <Cell
                    key={col.field}
                    value={colIndex === 0 ? 'Total' : totals[col.field]}
                    format={colIndex === 0 ? 'text' : col.format}
                    customBackground={getCellBackground('totals', colIndex, false, true)}
                    textColor={col.text_color}
                    textColorValue={col.text_color_value}
                    width={columnWidths[col.field]}
                    columnBackground={col.background}
                    isHovered={hoveredRow === 'totals' && hoveredCol === colIndex}
                    onMouseEnter={() => setHoveredCol(colIndex)}
                  />
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GridTable;
