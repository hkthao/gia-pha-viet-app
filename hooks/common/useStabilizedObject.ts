// apps/mobile/family_tree_rn/hooks/useStabilizedObject.ts
import { useRef } from 'react';
import { shallowEqual } from '@/utils/core/shallowEqual';

/**
 * Custom hook that stabilizes an object reference.
 * The returned object reference will only update if its content (shallowly) changes.
 * This is useful for preventing unnecessary re-renders or re-calculations
 * when an object is passed as a dependency to other hooks, but its content
 * might not have actually changed.
 *
 * @param value The object value to stabilize.
 * @returns A stabilized reference to the object.
 */
export function useStabilizedObject<T extends object>(value: T): T {
  const ref = useRef<T>(value);

  // If the new value is not shallowly equal to the current ref value, update the ref.
  if (!shallowEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}
