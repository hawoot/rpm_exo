/**
 * GridTable Component - Feature-rich data table
 *
 * Features:
 * - Column sorting (click header to sort)
 * - Row and column hover highlighting
 * - Column filtering (text contains, numeric comparison)
 * - Copy to clipboard
 * - Resizable columns
 */

import { useState, useMemo, useRef } from 'react'
import Cell from './Cell'

function GridTable({ data, columns: initialColumns, totals, label }) {
  // Hover state
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredCol, setHoveredCol] = useState(null)

  // Sort state: { field: string, direction: 'asc' | 'desc' } or null
  const [sortConfig, setSortConfig] = useState(null)

  // Filter state
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  // Column widths for resizing
  const [columnWidths, setColumnWidths] = useState(() => {
    const widths = {}
    initialColumns.forEach(col => {
      widths[col.field] = col.width || 100
    })
    return widths
  })

  // Copy feedback
  const [copyFeedback, setCopyFeedback] = useState(null)

  // Resize tracking
  const resizing = useRef(null)

  // Guard
  if (!data || !Array.isArray(data)) {
    return (
      <div style={{ padding: '16px', color: '#9ca3af' }}>
        No data available
      </div>
    )
  }

  // Filter data
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return data

    return data.filter(row => {
      return Object.entries(filters).every(([field, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true

        const cellValue = row[field]
        const col = initialColumns.find(c => c.field === field)

        // Numeric filtering with operators
        if (col?.format === 'integer' || col?.format === 'decimal_2' || col?.format === 'decimal_4') {
          const numValue = Number(cellValue)
          const filterStr = filterValue.trim()

          if (filterStr.startsWith('>=')) return numValue >= Number(filterStr.slice(2))
          if (filterStr.startsWith('<=')) return numValue <= Number(filterStr.slice(2))
          if (filterStr.startsWith('>')) return numValue > Number(filterStr.slice(1))
          if (filterStr.startsWith('<')) return numValue < Number(filterStr.slice(1))
          if (filterStr.startsWith('=')) return numValue === Number(filterStr.slice(1))
          return String(cellValue).includes(filterStr)
        }

        // Text: case-insensitive contains
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
      })
    })
  }, [data, filters, initialColumns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    const { field, direction } = sortConfig
    const col = initialColumns.find(c => c.field === field)
    const isNumeric = col?.format === 'integer' || col?.format === 'decimal_2' || col?.format === 'decimal_4'

    return [...filteredData].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      // Handle nulls
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return direction === 'asc' ? 1 : -1
      if (bVal == null) return direction === 'asc' ? -1 : 1

      // Compare
      let comparison = 0
      if (isNumeric) {
        comparison = Number(aVal) - Number(bVal)
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig, initialColumns])

  // Handle sort
  const handleSort = (field) => {
    setSortConfig(current => {
      if (current?.field !== field) {
        return { field, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { field, direction: 'desc' }
      }
      return null // Third click clears sort
    })
  }

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortConfig?.field !== field) return ' ↕'
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    const headers = initialColumns.map(c => c.label).join('\t')
    const rows = sortedData.map(row =>
      initialColumns.map(c => row[c.field] ?? '').join('\t')
    ).join('\n')

    let text = headers + '\n' + rows
    if (totals) {
      const totalsRow = initialColumns.map((c, i) =>
        i === 0 ? 'Total' : (totals[c.field] ?? '')
      ).join('\t')
      text += '\n' + totalsRow
    }

    navigator.clipboard.writeText(text)
    setCopyFeedback('Copied!')
    setTimeout(() => setCopyFeedback(null), 1500)
  }

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setSortConfig(null)
  }

  // Resize handlers
  const startResize = (e, field) => {
    e.preventDefault()
    e.stopPropagation()
    resizing.current = { field, startX: e.clientX, startWidth: columnWidths[field] }
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  const handleResize = (e) => {
    if (!resizing.current) return
    const diff = e.clientX - resizing.current.startX
    const newWidth = Math.max(50, resizing.current.startWidth + diff)
    setColumnWidths(prev => ({ ...prev, [resizing.current.field]: newWidth }))
  }

  const stopResize = () => {
    resizing.current = null
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  // Background helper
  const getCellBackground = (rowIndex, colIndex, isHeader = false, isTotals = false) => {
    const isRowHovered = hoveredRow === rowIndex
    const isColHovered = hoveredCol === colIndex

    if (isRowHovered && isColHovered && !isHeader) return '#dbeafe'
    if (isRowHovered && !isHeader) return '#f0f9ff'
    if (isColHovered) return isHeader ? '#e5e7eb' : '#f0f9ff'
    if (isTotals) return '#eeeeee'
    if (isHeader) return '#f5f5f5'
    return rowIndex % 2 === 0 ? '#ffffff' : '#fafafa'
  }

  const hasActiveFilters = Object.values(filters).some(v => v && v.trim() !== '')

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        {label && (
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>
            {label}
            {(hasActiveFilters || sortConfig) && (
              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#6b7280' }}>
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
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: showFilters || hasActiveFilters ? '#eff6ff' : '#ffffff',
              color: hasActiveFilters ? '#1d4ed8' : '#6b7280',
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
                color: '#dc2626',
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
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: copyFeedback ? '#dcfce7' : '#ffffff',
              color: copyFeedback ? '#166534' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {copyFeedback || '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
          }}
          onMouseLeave={() => {
            setHoveredRow(null)
            setHoveredCol(null)
          }}
        >
          <thead>
            {/* Header */}
            <tr>
              {initialColumns.map((col, colIndex) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  style={{
                    padding: '8px 12px',
                    textAlign: col.format === 'text' ? 'left' : 'right',
                    backgroundColor: getCellBackground(-1, colIndex, true),
                    color: sortConfig?.field === col.field ? '#1d4ed8' : '#374151',
                    fontWeight: 600,
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb',
                    width: `${columnWidths[col.field]}px`,
                    minWidth: `${columnWidths[col.field]}px`,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={() => setHoveredCol(colIndex)}
                >
                  {col.label}
                  <span style={{
                    opacity: sortConfig?.field === col.field ? 1 : 0.3,
                    fontSize: '10px',
                  }}>
                    {getSortIndicator(col.field)}
                  </span>
                  {/* Resize handle */}
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

            {/* Filter row */}
            {showFilters && (
              <tr>
                {initialColumns.map((col) => (
                  <th
                    key={`filter-${col.field}`}
                    style={{
                      padding: '4px',
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <input
                      type="text"
                      placeholder={col.format === 'integer' ? '>0, <100...' : 'Filter...'}
                      value={filters[col.field] || ''}
                      onChange={(e) => handleFilterChange(col.field, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: '1px solid #d1d5db',
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
                  style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}
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
  )
}

export default GridTable
