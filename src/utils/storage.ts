
/**
 * Safely parses generic JSON from localStorage.
 * Handles parsing errors gracefully to prevent application crashes.
 *
 * @param key - The localStorage key to retrieve.
 * @param defaultValue - The fallback value if key is missing or corrupted.
 * @returns The parsed value or the default value.
 */
export const safeJSONParse = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        // Optionally clear the corrupted key
        localStorage.removeItem(key);
        return defaultValue;
    }
};

/**
 * Safely serializes and writes a value to localStorage.
 * Catches quota exceeded errors or other storage exceptions.
 * 
 * @param key - The localStorage key to write to.
 * @param value - The value to serialize.
 */
export const safeJSONStringify = (key: string, value: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
    }
};
