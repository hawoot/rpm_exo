# RPM Frontend Specification

## Overview

### Purpose
A React-based frontend for displaying risk position management data from a Python backend API. Replaces an Excel-based viewer (RPM_Lite.xlsb) with approximately 70 tabs covering rates, bonds, futures, FX, and other trading desk risk views.

### Core Principles

1. **Config-Driven**: All display logic defined in JSON configuration files. Adding a new section or grid requires only creating JSON files, not writing code.

2. **Pure Display Layer**: The frontend performs ZERO data transformation. Backend sends exactly what should be displayed. Frontend only handles visual formatting (decimals, separators, colors).

3. **Traceable**: Every piece of data on screen can be traced back to its source (API path, config file, formatting rule). Debug mode shows all this information.

4. **Generic Components**: One component renders any grid. One component renders any section. Configuration determines behavior, not code.

5. **Performance**: Configs loaded once at startup. Rendering is instant. The slow part is always the API, never the rendering.

---

## API Contract

### Base Request

```
GET /pos_env?env_date={YYYYMMDD}&pos_date={YYYYMMDD}&books={book1,book2,...}&time_of_day={Open|Close|Intraday}
```

### Request with Overrides

```
POST /pos_env
Content-Type: application/json

{
  "base_params": {
    "env_date": "20251219",
    "pos_date": "20251218",
    "books": ["OfficialCUPSBook", "EXOTICS", ...],
    "time_of_day": "Close"
  },
  "section_params": {
    "futures": {
      "future_price_overrides": {
        "YBAH6": 96,
        "FOATH6": 97
      }
    }
  }
}
```

### Response Structure

```json
{
  "request_id": "uuid",
  "timestamp_request": "ISO datetime",
  "timestamp_response": "ISO datetime",
  "timestamp_data_calculated": "ISO datetime",
  "timestamp_data_cached": "ISO datetime or null",
  "lag_s": 0,
  "duration_s": 5,
  "cache_hit": false,
  "error": false,
  "error_stack": "",
  "curl_command": "reproducible curl command",
  "base_params": {
    "env_date": "20251219",
    "pos_date": "20251218",
    "books": ["..."],
    "time_of_day": "Close"
  },
  "section_params": null,
  "response_data": {
    "futures": {
      "data": {
        "future_position": [
          { "instrument": "FOATH6", "position": -50, "dv01": 4500, "pnl": -23000 },
          { "instrument": "FGBLH6", "position": 100, "dv01": 8200, "pnl": 45000 }
        ]
      },
      "metadata": {
        "last_updated": "ISO datetime",
        "status": "ok",
        "refresh_duration_ms": 1368,
        "repro": "python code to reproduce"
      },
      "error_stack": ""
    },
    "bonds": {
      "data": { ... },
      "metadata": { ... },
      "error_stack": ""
    }
  }
}
```

---

## File Structure

```
rpm-frontend/
│
├── config/                              # CONFIGURATION (edit often)
│   │
│   ├── theme.json                       # All colors (tokens)
│   ├── formats.json                     # Number/date formatting rules
│   │
│   ├── sections/                        # Section definitions
│   │   ├── _index.json                  # List of all sections + nav order
│   │   ├── summary.json
│   │   ├── ir-delta.json
│   │   ├── futures.json
│   │   ├── bonds.json
│   │   └── ...
│   │
│   └── grids/                           # Grid definitions
│       ├── futures-position.json
│       ├── futures-summary.json
│       ├── bonds-position.json
│       └── ...
│
├── src/                                 # APPLICATION CODE (edit rarely)
│   │
│   ├── index.js                         # Entry point
│   ├── App.jsx                          # Main app component
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx             # Overall page layout
│   │   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   │   └── Header.jsx               # Top bar with params form
│   │   │
│   │   ├── DataDisplay.jsx              # Generic data renderer (all display types)
│   │   ├── GridTable.jsx                # Table display type
│   │   ├── GridRow.jsx                  # Single row display type
│   │   ├── GridKV.jsx                   # Key-value display type
│   │   ├── GridCard.jsx                 # Card display type
│   │   ├── Cell.jsx                     # Single cell (formatting + colors)
│   │   │
│   │   ├── Section.jsx                  # Generic section renderer
│   │   │
│   │   ├── forms/
│   │   │   ├── ParamsForm.jsx           # Base params form
│   │   │   └── OverridePanel.jsx        # Section override editing
│   │   │
│   │   └── debug/
│   │       └── DebugOverlay.jsx         # Debug view toggle
│   │
│   ├── hooks/
│   │   ├── useApi.js                    # API fetching logic
│   │   ├── useConfig.js                 # Config loading
│   │   └── useDebug.js                  # Debug mode state
│   │
│   ├── lib/
│   │   ├── formatters.js                # Number/date formatting functions
│   │   ├── colors.js                    # Color token resolution
│   │   └── pathAccess.js                # Get nested data by path string
│   │
│   └── styles/
│       └── main.css
│
├── public/
│   └── index.html
│
└── package.json
```

---

## Configuration Specifications

### config/theme.json

Defines all color tokens used throughout the application.

```json
{
  "colors": {
    "backgrounds": {
      "pnl": "#e6f4ea",
      "risk": "#e3f2fd",
      "rate": "#fff8e1",
      "header": "#f5f5f5",
      "total": "#eeeeee",
      "row-even": "#ffffff",
      "row-odd": "#fafafa",
      "row-hover": "#f0f0f0"
    },
    "text": {
      "negative": "#dc2626",
      "positive": "#1f2937",
      "muted": "#9ca3af"
    },
    "border": {
      "default": "#e5e7eb",
      "strong": "#d1d5db"
    }
  }
}
```

**Usage Rules:**
- Grid configs reference token names (e.g., `"background": "pnl"`)
- Theme maps token names to actual hex colors
- Changing a color in theme.json changes it everywhere

---

### config/formats.json

Defines how different data types are formatted for display.

```json
{
  "text": {
  },

  "integer": {
    "decimals": 0,
    "thousands_separator": true
  },

  "decimal_2": {
    "decimals": 2,
    "thousands_separator": true
  },

  "decimal_4": {
    "decimals": 4,
    "thousands_separator": true
  },

  "price": {
    "decimals": 4,
    "thousands_separator": true
  },

  "bps": {
    "decimals": 1,
    "thousands_separator": false,
    "suffix": " bps"
  },

  "percent": {
    "decimals": 2,
    "thousands_separator": false,
    "suffix": "%"
  },

  "date": {
    "pattern": "DD-MMM-YY"
  },

  "datetime": {
    "pattern": "DD-MMM-YY HH:mm:ss"
  }
}
```

**Rules:**
- NO `multiply_by` or any data transformation
- Backend sends display-ready values
- Formats only control visual representation

---

### config/sections/_index.json

Master list of all sections and navigation structure.

```json
{
  "nav_groups": [
    { "id": "overview", "label": "Overview", "order": 1 },
    { "id": "rates", "label": "Rates", "order": 2 },
    { "id": "bonds", "label": "Bonds", "order": 3 },
    { "id": "fx", "label": "FX", "order": 4 },
    { "id": "equity", "label": "Equity", "order": 5 }
  ],

  "sections": [
    "summary",
    "ir-delta",
    "basis",
    "futures",
    "bonds",
    "bond-par-eur",
    "bond-par-gbp",
    "fx-cash",
    "fx-vega"
  ]
}
```

---

### config/sections/{section-id}.json

Defines a section (page/tab) including which grids it contains and their layout.

```json
{
  "id": "futures",
  "label": "Futures",
  "nav_group": "rates",
  "order": 30,
  "icon": "trending-up",

  "layout": [
    {
      "row": 1,
      "grids": ["futures-pnl-card", "futures-dv01-card"]
    },
    {
      "row": 2,
      "grids": ["futures-position", "futures-greeks"]
    },
    {
      "row": 3,
      "grids": ["futures-summary"]
    }
  ]
}
```

**Layout Rules:**
- `layout` is an array of rows
- Each row contains an array of grid IDs
- Grids in the same row are displayed side-by-side with equal width
- One grid per row = full width

---

### config/grids/{grid-id}.json

Defines a single data display (table, row, card, or key-value).

#### Table Display (most common)

```json
{
  "id": "futures-position",
  "label": "Futures Position",

  "data_path": "response_data.futures.data.future_position",
  "display_type": "table",

  "columns": [
    {
      "field": "instrument",
      "label": "Instrument",
      "format": "text",
      "width": 120,
      "frozen": true,
      "background": null,
      "text_color": "fixed",
      "text_color_value": "positive"
    },
    {
      "field": "exchange",
      "label": "Exchange",
      "format": "text",
      "width": 80,
      "background": null,
      "text_color": "fixed",
      "text_color_value": "positive"
    },
    {
      "field": "position",
      "label": "Position",
      "format": "integer",
      "width": 100,
      "background": null,
      "text_color": "sign-based"
    },
    {
      "field": "dv01",
      "label": "DV01",
      "format": "integer",
      "width": 100,
      "background": "risk",
      "text_color": "sign-based"
    },
    {
      "field": "pnl",
      "label": "P&L",
      "format": "integer",
      "width": 120,
      "background": "pnl",
      "text_color": "sign-based"
    }
  ]
}
```

#### Row Display (single row of values)

```json
{
  "id": "futures-summary-row",
  "label": "Summary",

  "data_path": "response_data.futures.data.summary",

  "display_type": "row",

  "columns": [
    {
      "field": "total_pnl",
      "label": "Total P&L",
      "format": "integer",
      "background": "pnl",
      "text_color": "sign-based"
    },
    {
      "field": "total_dv01",
      "label": "Total DV01",
      "format": "integer",
      "background": "risk",
      "text_color": "sign-based"
    },
    {
      "field": "position_count",
      "label": "# Positions",
      "format": "integer",
      "background": null,
      "text_color": "fixed",
      "text_color_value": "positive"
    }
  ]
}
```

#### Key-Value Display (vertical pairs)

```json
{
  "id": "request-metadata",
  "label": "Request Info",

  "data_path": "response_data.futures.metadata",

  "display_type": "kv",

  "columns": [
    {
      "field": "status",
      "label": "Status",
      "format": "text"
    },
    {
      "field": "refresh_duration_ms",
      "label": "Duration (ms)",
      "format": "integer"
    },
    {
      "field": "last_updated",
      "label": "Last Updated",
      "format": "datetime"
    }
  ]
}
```

#### Card Display (single prominent value)

```json
{
  "id": "futures-pnl-card",
  "label": "Total P&L",

  "data_path": "response_data.futures.data.summary.total_pnl",

  "display_type": "card",

  "format": "integer",
  "background": "pnl",
  "text_color": "sign-based"
}
```

---

## Column Configuration Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Field name in API data to display |
| `label` | string | Column header text |
| `format` | string | Format type from formats.json |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | number | auto | Column width in pixels |
| `frozen` | boolean | false | Keep visible on horizontal scroll |
| `background` | string\|null | null | Background color token from theme |
| `text_color` | string | "fixed" | "fixed" or "sign-based" |
| `text_color_value` | string | "positive" | Token for fixed color |
| `align` | string | varies | "left", "center", "right" (defaults based on format) |

### Text Color Rules

```
text_color: "fixed"
  → Always use the color specified in text_color_value
  → text_color_value: "positive" → theme.colors.text.positive
  → text_color_value: "muted" → theme.colors.text.muted

text_color: "sign-based"
  → If value < 0: use theme.colors.text.negative (red)
  → If value >= 0: use theme.colors.text.positive (black)
```

### Background Rules

```
background: null
  → No special background, use row default (alternating)

background: "pnl"
  → Use theme.colors.backgrounds.pnl (green)

background: "risk"
  → Use theme.colors.backgrounds.risk (blue)

background: "rate"
  → Use theme.colors.backgrounds.rate (yellow)
```

---

## Display Type Reference

| Type | Data Shape | Renders As |
|------|------------|------------|
| `table` | `[{...}, {...}]` | Multi-row table with headers |
| `row` | `{...}` | Single row with headers above |
| `kv` | `{...}` | Vertical key-value list |
| `card` | scalar | Large prominent value |

---

## Application State

```javascript
{
  // Form state (user inputs)
  params: {
    env_date: "20251219",
    pos_date: "20251218",
    books: ["OfficialCUPSBook", "EXOTICS", ...],
    time_of_day: "Close"
  },

  // Pending overrides (not yet applied)
  pendingOverrides: {
    futures: {
      future_price_overrides: { "FOATH6": 96 }
    }
  },

  // Applied overrides (sent with last request)
  appliedOverrides: { ... },

  // Request state
  isLoading: false,
  error: null,

  // API response (the entire JSON)
  apiResponse: { ... },

  // UI state
  currentSection: "futures",
  debugMode: false
}
```

---

## Component Specifications

### AppShell

The main layout container.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header (ParamsForm)                                                        │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  Sidebar       │  Content Area (current Section)                           │
│  (Navigation)  │                                                            │
│                │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

### Sidebar

- Displays nav groups from `_index.json`
- Each group is collapsible
- Sections listed under their group
- Current section highlighted
- Click to navigate

### Header

Contains:
- ParamsForm (env_date, pos_date, books, time_of_day)
- Submit button (fetches data)
- Loading indicator
- Last refresh timestamp

### Section

Generic section renderer:
1. Loads section config by ID
2. Renders layout rows
3. For each row, renders grids side-by-side

### DataDisplay

Generic data display component:
1. Loads grid config by ID
2. Extracts data from API response using `data_path`
3. Based on `display_type`, delegates to appropriate renderer:
   - `table` → GridTable
   - `row` → GridRow
   - `kv` → GridKV
   - `card` → GridCard

### Cell

Renders a single cell:
1. Gets raw value
2. Applies format from formats.json
3. Resolves background color from theme
4. Resolves text color (fixed or sign-based)
5. Renders with appropriate styles

---

## Debug Mode

Toggle with keyboard shortcut: `Ctrl+Shift+D`

When enabled, each grid shows:
- Grid ID
- Config file path
- Data path
- Number of data rows
- Last refresh timestamp
- Refresh duration

Each cell shows (on hover or expanded view):
- Raw value from API
- Field name
- Format applied
- Resolved colors

---

## Override Flow

1. User edits override value in OverridePanel
2. Value stored in `pendingOverrides` state
3. UI shows "pending" indicator
4. User clicks "Apply Overrides"
5. POST request sent with base_params + section_params
6. Response replaces apiResponse
7. pendingOverrides cleared, appliedOverrides updated
8. UI shows "overrides active" indicator
9. User can "Clear Overrides" to revert to GET request

---

## Error Handling

### API Errors

If `error: true` in response:
- Show error banner at top of section
- Display `error_stack` in collapsible detail
- Keep previous data visible (grayed out)

### Section Errors

If a section's `error_stack` is non-empty:
- Show error indicator on that section's grids
- Display error message
- Other sections remain functional

### Config Errors

If grid config not found:
- Show placeholder with "Grid config not found: {id}"
- Log to console with details

If data_path returns undefined:
- Show placeholder with "No data at path: {path}"
- Debug mode shows the attempted path

---

## Styling Guidelines

### Colors

All colors come from theme.json. No hardcoded colors in components.

### Spacing

Use consistent spacing scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Typography

- Headers: 14px, semi-bold
- Data cells: 13px, regular
- Card values: 24px, bold
- Labels: 12px, regular, muted color

### Grid Styling

- Header row: gray background, bold text
- Data rows: alternating white/light gray
- Hover: highlight row
- Borders: light gray, 1px

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle debug mode |
| `Ctrl+Enter` | Submit params form |
| `Escape` | Close any open panel/modal |

---

## Performance Considerations

1. **Config Loading**: Load all configs once at app startup. Store in memory.

2. **Data Path Access**: Use efficient path traversal (split once, traverse once).

3. **Rendering**: React will only re-render what changes. Don't memoize prematurely.

4. **Large Tables**: If a table has >100 rows, consider virtualization (react-window). But don't implement until actually needed.

---

## Adding a New Section (Checklist)

1. Create `config/sections/{section-id}.json`
2. Create `config/grids/{grid-id}.json` for each grid
3. Add section ID to `config/sections/_index.json`
4. Done. No code changes.

## Adding a New Grid (Checklist)

1. Create `config/grids/{grid-id}.json`
2. Reference grid ID in section's layout
3. Done. No code changes.

## Changing Colors (Checklist)

1. Edit `config/theme.json`
2. Done. Affects all grids using that token.

## Changing Number Format (Checklist)

1. Edit `config/formats.json` for global change
2. Or add `format_override` in column config for specific column
3. Done.

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "vite": "^5.x"
  }
}
```

Minimal dependencies. No UI framework required initially. Add as needed.

---

## API Configuration

Create `config/api.json`:

```json
{
  "base_url": "http://localhost:8000",
  "endpoints": {
    "pos_env": "/pos_env"
  },
  "timeout_ms": 30000
}
```

---

## Initial Sections to Implement

Start with these for proof of concept:

1. **Summary** - Overview with cards and summary grids
2. **Futures** - Table with position data, demonstrates full table functionality
3. **Request Metadata** - Key-value display of API metadata

Once these work, remaining sections are just config files.