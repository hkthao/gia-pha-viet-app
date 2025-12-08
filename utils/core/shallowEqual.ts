// apps/mobile/family_tree_rn/utils/shallowEqual.ts
/**
 * Performs a shallow comparison between two objects.
 * Returns true if the objects are strictly equal, or if they are both objects
 * with the same keys and all corresponding values are strictly equal.
 *
 * @param objA The first object to compare.
 * @param objB The second object to compare.
 * @returns True if the objects are shallowly equal, false otherwise.
 */
export const shallowEqual = (objA: any, objB: any): boolean => {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
};
