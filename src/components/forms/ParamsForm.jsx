/**
 * ParamsForm - Collapsible form for API request parameters
 *
 * Features:
 * - Collapsible (saves screen space when not needed)
 * - Environment selector with editable URL
 * - Date inputs, time of day, books multi-select
 * - Predefined book groups (Main, MGMT, etc.)
 * - Bypass cache option
 */

import { useState, useRef, useEffect } from 'react'

// Available books (in production, this might come from an API)
const AVAILABLE_BOOKS = [
  'OfficialCUPSBook',
  'EXOTICS',
  'RATES_EUR',
  'RATES_USD',
  'RATES_GBP',
  'FX_SPOT',
  'FX_OPTIONS',
]

// Predefined book groups - quick selection shortcuts
const BOOK_GROUPS = {
  'Main': ['OfficialCUPSBook', 'RATES_EUR', 'RATES_USD', 'RATES_GBP'],
  'MGMT': ['OfficialCUPSBook'],
  'Rates': ['RATES_EUR', 'RATES_USD', 'RATES_GBP'],
  'FX': ['FX_SPOT', 'FX_OPTIONS'],
  'All': AVAILABLE_BOOKS,
}

const TIME_OF_DAY_OPTIONS = ['Open', 'Close', 'Live']

function ParamsForm({
  params,
  onParamsChange,
  onSubmit,
  isLoading,
  // Environment fields
  apiConfig,
  selectedEnv,
  onEnvChange,
  customUrl,
  onCustomUrlChange,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const bookButtonRef = useRef(null)
  const dropdownRef = useRef(null)

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isBookDropdownOpen && bookButtonRef.current) {
      const rect = bookButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isBookDropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isBookDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bookButtonRef.current &&
        !bookButtonRef.current.contains(event.target)
      ) {
        setIsBookDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBookDropdownOpen])

  // Format date for input (YYYYMMDD -> YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return ''
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }

  // Parse date from input (YYYY-MM-DD -> YYYYMMDD)
  const parseDateFromInput = (dateStr) => {
    return dateStr.replace(/-/g, '')
  }

  const handleDateChange = (field, value) => {
    onParamsChange({
      ...params,
      [field]: parseDateFromInput(value),
    })
  }

  const handleTimeOfDayChange = (value) => {
    onParamsChange({
      ...params,
      time_of_day: value,
    })
  }

  const handleBypassCacheChange = (checked) => {
    onParamsChange({
      ...params,
      bypass_cache: checked,
    })
  }

  const handleBookToggle = (book) => {
    const currentBooks = params.books || []
    const newBooks = currentBooks.includes(book)
      ? currentBooks.filter(b => b !== book)
      : [...currentBooks, book]
    onParamsChange({
      ...params,
      books: newBooks,
    })
  }

  // Select all books in a predefined group
  const handleGroupSelect = (groupName) => {
    const groupBooks = BOOK_GROUPS[groupName] || []
    onParamsChange({
      ...params,
      books: [...groupBooks],
    })
  }

  // Clear all selected books
  const handleClearBooks = () => {
    onParamsChange({
      ...params,
      books: [],
    })
  }

  const effectiveUrl = customUrl || apiConfig.environments[selectedEnv]?.base_url

  // Collapsed view - just a summary bar
  if (isCollapsed) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#374151',
          }}
        >
          <span style={{ fontSize: '10px' }}>▶</span>
          <span style={{ color: '#6b7280' }}>Params:</span>
          <span>{params.env_date}</span>
          <span style={{ color: '#9ca3af' }}>|</span>
          <span>{params.time_of_day}</span>
          <span style={{ color: '#9ca3af' }}>|</span>
          <span>{params.books?.length || 0} books</span>
          {params.bypass_cache && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '4px',
            }}>
              No Cache
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onSubmit()
            setIsCollapsed(true)
          }}
          disabled={isLoading}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </div>
    )
  }

  // Expanded view - full form
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Collapse button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
          REQUEST PARAMETERS
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            padding: '4px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          ▲ Collapse
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Environment row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '70px' }}>
            Environment
          </label>
          <select
            value={selectedEnv}
            onChange={(e) => onEnvChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            {Object.entries(apiConfig.environments).map(([key, env]) => (
              <option key={key} value={key}>{env.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={customUrl || effectiveUrl}
            onChange={(e) => onCustomUrlChange(e.target.value)}
            placeholder="API Base URL"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          />
        </div>

        {/* Params row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}>
          {/* Env Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Env Date</label>
            <input
              type="date"
              value={formatDateForInput(params.env_date)}
              onChange={(e) => handleDateChange('env_date', e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Pos Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Pos Date</label>
            <input
              type="date"
              value={formatDateForInput(params.pos_date)}
              onChange={(e) => handleDateChange('pos_date', e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Time of Day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Time of Day</label>
            <select
              value={params.time_of_day}
              onChange={(e) => handleTimeOfDayChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                minWidth: '90px',
              }}
            >
              {TIME_OF_DAY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Books multi-select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Books</label>
            <button
              ref={bookButtonRef}
              type="button"
              onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                minWidth: '160px',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{params.books?.length ? `${params.books.length} selected` : 'Select...'}</span>
              <span>▾</span>
            </button>

            {/* Fixed-position dropdown that can escape container */}
            {isBookDropdownOpen && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: Math.max(dropdownPosition.width, 220),
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '320px',
                  overflowY: 'auto',
                }}
              >
                {/* Book group quick-select buttons */}
                <div style={{
                  padding: '8px',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Quick Select
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.keys(BOOK_GROUPS).map(groupName => (
                      <button
                        key={groupName}
                        type="button"
                        onClick={() => handleGroupSelect(groupName)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          color: '#374151',
                        }}
                      >
                        {groupName}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleClearBooks}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        border: '1px solid #fecaca',
                        borderRadius: '3px',
                        backgroundColor: '#fef2f2',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Individual book checkboxes */}
                {AVAILABLE_BOOKS.map(book => (
                  <label
                    key={book}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      backgroundColor: params.books?.includes(book) ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={params.books?.includes(book) || false}
                      onChange={() => handleBookToggle(book)}
                    />
                    {book}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Bypass Cache */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '6px 0',
          }}>
            <input
              type="checkbox"
              checked={params.bypass_cache || false}
              onChange={(e) => handleBypassCacheChange(e.target.checked)}
            />
            <span style={{ color: '#6b7280' }}>Bypass Cache</span>
          </label>

          {/* Submit button */}
          <button
            type="button"
            onClick={() => {
              onSubmit()
              setIsCollapsed(true)
            }}
            disabled={isLoading}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginLeft: 'auto',
            }}
          >
            {isLoading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>

        {/* Selected books pills */}
        {params.books?.length > 0 && (
          <div style={{
            marginTop: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {params.books.map(book => (
              <span
                key={book}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {book}
                <button
                  type="button"
                  onClick={() => handleBookToggle(book)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '0 2px',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParamsForm
