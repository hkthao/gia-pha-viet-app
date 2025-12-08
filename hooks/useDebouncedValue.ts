// apps/mobile/family_tree_rn/hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 * The debounced value will only update after the specified delay has passed
 * since the last update of the input value.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value or delay changes, or if the component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}
