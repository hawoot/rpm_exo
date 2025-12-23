/**
 * Get a nested value from an object using a dot-notation path string.
 *
 * Similar to Python's:
 *   def get_path(obj, path):
 *       for key in path.split('.'):
 *           obj = obj.get(key, {})
 *       return obj
 *
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path like "response_data.futures.data"
 * @returns {any} - The value at that path, or undefined if not found
 */
export function getByPath(obj, path) {
  // If no path or no object, return undefined
  if (!path || !obj) return undefined

  // Split path into parts and traverse
  // "response_data.futures.data" => ["response_data", "futures", "data"]
  const parts = path.split('.')

  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[part]
  }

  return current
}
