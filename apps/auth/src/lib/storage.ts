/**
 * Storage abstraction layer for localStorage
 * Provides type-safe access to browser storage with error handling
 * Can be extended to support sessionStorage or other storage mechanisms
 */

/**
 * Safely get an item from localStorage
 * Returns null if the item doesn't exist or if there's an error
 */
export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // Handle cases where localStorage is not available (private browsing, etc.)
    console.error("Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * Returns true if successful, false otherwise
 */
export function setItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // Handle quota exceeded errors or localStorage not available
    console.error("Failed to write to localStorage:", error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * Returns true if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * Use with caution as this affects all stored data
 */
export function clear(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
    return false;
  }
}

/**
 * Get and parse a JSON value from localStorage
 * Returns null if the item doesn't exist or parsing fails
 */
export function getJSON<T = unknown>(key: string): T | null {
  try {
    const item = getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error("Failed to parse JSON from localStorage:", error);
    return null;
  }
}

/**
 * Stringify and store a JSON value in localStorage
 * Returns true if successful, false otherwise
 */
export function setJSON(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value);
    return setItem(key, serialized);
  } catch (error) {
    console.error("Failed to serialize JSON to localStorage:", error);
    return false;
  }
}
