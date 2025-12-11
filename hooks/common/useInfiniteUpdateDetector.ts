import { useRef, useEffect } from 'react';
import { Platform } from 'react-native';

interface UseInfiniteUpdateDetectorOptions {
  /**
   * The maximum number of renders allowed within the `timeFrame` before a warning is logged.
   * Defaults to 10.
   */
  maxRenders?: number;
  /**
   * The time frame in milliseconds to check for excessive renders.
   * Defaults to 500ms.
   */
  timeFrame?: number;
  /**
   * Whether the detector is enabled. Defaults to true in development, false in production.
   */
  enabled?: boolean;
  /**
   * A unique identifier for the component or hook being monitored.
   * Helps in identifying the source of infinite updates.
   */
  name?: string;
  /**
   * An array of values to monitor for changes, along with their names.
   * If any of these values change between renders, it can be identified by name.
   */
  dependencies?: { name: string; value: any }[];
}

/**
 * Custom hook to detect potential infinite update loops (re-renders) in React components.
 * It logs a warning to the console if a component re-renders too many times within a short period.
 * This hook is intended for development-time debugging only and is automatically disabled in production.
 *
 * @param options - Configuration options for the detector.
 */
export const useInfiniteUpdateDetector = (options?: UseInfiniteUpdateDetectorOptions) => {
  const {
    maxRenders = 10,
    timeFrame = 500, // milliseconds
    enabled = __DEV__ && Platform.OS !== 'web', // Enabled by default in development, but not for web
    name = 'Unnamed Component/Hook',
    dependencies = [], // Initialize to empty array if not provided
  } = options || {};

  const renderData = useRef({
    count: 0,
    lastWindowStartTime: Date.now(),
    timeoutId: null as ReturnType<typeof setTimeout> | null,
  });

  const prevDependencies = useRef(dependencies);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const now = Date.now();
    const currentRenderData = renderData.current;

    // If current render is within the active time window
    if (now - currentRenderData.lastWindowStartTime < timeFrame) {
      currentRenderData.count += 1;
      if (currentRenderData.count > maxRenders) {
        let changedDependenciesMessage = '';
        const prevDeps = prevDependencies.current;

        if (dependencies.length > 0 && prevDeps.length === dependencies.length) {
          const changed = dependencies.filter(
            (dep, index) => dep.value !== prevDeps[index].value
          );
          if (changed.length > 0) {
            changedDependenciesMessage = ` Các dependencies đã thay đổi: [${changed.map(d => `${d.name}: ${JSON.stringify(d.value)}`).join(', ')}].`;
          }
        }

        console.warn(
          `CẢNH BÁO: Phát hiện vòng lặp cập nhật vô hạn tiềm năng trong '${name}'. ` +
          `Đã có ${currentRenderData.count} lần render trong ${timeFrame}ms. ` +
          `Điều này có thể gây ra vấn đề hiệu suất hoặc treo ứng dụng. ` +
          `Hãy kiểm tra các dependencies của useEffect, useCallback, useMemo hoặc setState calls.` +
          changedDependenciesMessage
        );
      }
    } else {
      // If outside the active time window, start a new window
      currentRenderData.count = 1;
      currentRenderData.lastWindowStartTime = now;
    }

    // Clear any existing timeout for the previous window
    if (currentRenderData.timeoutId) {
      clearTimeout(currentRenderData.timeoutId);
    }

    // Set a new timeout to clear the count after the timeFrame,
    // ensuring the window eventually closes if no more renders occur.
    currentRenderData.timeoutId = setTimeout(() => {
      currentRenderData.count = 0;
      currentRenderData.lastWindowStartTime = Date.now();
      currentRenderData.timeoutId = null;
    }, timeFrame);

    prevDependencies.current = dependencies;

    return () => {
      if (currentRenderData.timeoutId) {
        clearTimeout(currentRenderData.timeoutId);
      }
    };
  });
};
