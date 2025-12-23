/**
 * Get a nested value from an object using a dot-notation path string.
 *
 * @param obj - The object to traverse
 * @param path - Dot-notation path like "response_data.futures.data"
 * @returns The value at that path, or undefined if not found
 */
export function getByPath<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string | null | undefined
): T | undefined {
  if (!path || !obj) return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current as T | undefined;
}
