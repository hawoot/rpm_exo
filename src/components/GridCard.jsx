/**
 * GridCard Component - Displays a single prominent value with copy
 */

import { useState } from 'react'
import { formatValue } from '../lib/formatters'
import { getBackgroundColor, getTextColor } from '../lib/colors'

function GridCard({
  value,
  label,
  format = 'integer',
  background = null,
  textColor = 'sign-based',
  textColorValue = 'positive',
}) {
  const [copyFeedback, setCopyFeedback] = useState(false)

  const formattedValue = formatValue(value, format)
  const backgroundColor = getBackgroundColor(background) || '#ffffff'
  const color = getTextColor(value, textColor, textColorValue)

  const copyToClipboard = () => {
    // Copy both label and raw value (tab-separated for spreadsheet)
    navigator.clipboard.writeText(`${label}\t${value}`)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 1500)
  }

  return (
    <div
      style={{
        backgroundColor,
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px 24px',
        minWidth: '150px',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={copyToClipboard}
      title="Click to copy"
    >
      {/* Copy feedback */}
      {copyFeedback && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          fontSize: '10px',
          color: '#166534',
          backgroundColor: '#dcfce7',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          Copied!
        </div>
      )}

      {/* Label */}
      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color,
      }}>
        {formattedValue}
      </div>
    </div>
  )
}

export default GridCard
