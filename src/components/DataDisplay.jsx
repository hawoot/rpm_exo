/**
 * DataDisplay Component - Generic data renderer based on grid config
 *
 * This is the "smart" component that:
 * 1. Loads grid config by ID
 * 2. Extracts data from API response using data_path
 * 3. Delegates to the appropriate renderer (GridTable, GridCard, etc.)
 *
 * Python mental model:
 *   class DataDisplay:
 *       def __init__(self, grid_id, api_data):
 *           self.config = load_grid_config(grid_id)
 *           self.data = get_by_path(api_data, self.config['data_path'])
 *
 *       def render(self):
 *           if self.config['display_type'] == 'table':
 *               return GridTable(self.data, self.config['columns'])
 *           elif self.config['display_type'] == 'card':
 *               return GridCard(self.data, ...)
 */

import { getByPath } from '../lib/pathAccess'
import GridTable from './GridTable'
import GridCard from './GridCard'

function DataDisplay({ gridConfig, apiData }) {
  // Extract data from API response using the path in config
  // e.g., "response_data.futures.data.future_position" → the array of positions
  const data = getByPath(apiData, gridConfig.data_path)

  // For tables, also get the totals if specified
  const totals = gridConfig.totals_path
    ? getByPath(apiData, gridConfig.totals_path)
    : null

  // Choose the right renderer based on display_type
  switch (gridConfig.display_type) {
    case 'table':
      return (
        <GridTable
          data={data}
          columns={gridConfig.columns}
          totals={totals}
          label={gridConfig.label}
        />
      )

    case 'card':
      return (
        <GridCard
          value={data}
          label={gridConfig.label}
          format={gridConfig.format}
          background={gridConfig.background}
          textColor={gridConfig.text_color}
          textColorValue={gridConfig.text_color_value}
        />
      )

    // TODO: Add GridRow and GridKV when needed
    case 'row':
    case 'kv':
      return (
        <div style={{ padding: '16px', color: '#9ca3af' }}>
          Display type "{gridConfig.display_type}" not yet implemented
        </div>
      )

    default:
      return (
        <div style={{ padding: '16px', color: '#dc2626' }}>
          Unknown display type: {gridConfig.display_type}
        </div>
      )
  }
}

export default DataDisplay
