import { renderHook, act } from '@testing-library/react-hooks';
import { useDebouncedValue } from '@/hooks/common/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Sử dụng fake timers để kiểm soát thời gian
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Chạy tất cả các timers đang chờ xử lý để dọn dẹp
    jest.useRealTimers(); // Chuyển về real timers
  });

  // Test case 1: Giá trị ban đầu nên giống với giá trị đầu vào
  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));

    expect(result.current).toBe('initial');
  });

  // Test case 2: Giá trị đã được debounce chỉ nên cập nhật sau độ trễ
  it('should update the debounced value after the specified delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    expect(result.current).toBe('initial'); // Giá trị chưa thay đổi ngay lập tức

    act(() => {
      jest.advanceTimersByTime(499); // Advance almost the full delay
    });

    expect(result.current).toBe('initial'); // Vẫn chưa thay đổi

    act(() => {
      jest.advanceTimersByTime(1); // Advance the remaining time
    });

    expect(result.current).toBe('updated'); // Giá trị đã thay đổi sau độ trễ
  });

  // Test case 3: Nhiều cập nhật nhanh chóng chỉ nên dẫn đến một lần cập nhật duy nhất sau lần thay đổi cuối cùng
  it('should only update once after multiple rapid updates', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'update 1', delay: 500 });
      jest.advanceTimersByTime(100);
      rerender({ value: 'update 2', delay: 500 });
      jest.advanceTimersByTime(100);
      rerender({ value: 'final update', delay: 500 });
    });

    expect(result.current).toBe('initial'); // Giá trị vẫn chưa thay đổi

    act(() => {
      jest.advanceTimersByTime(499); // Advance almost the full delay from the last update
    });

    expect(result.current).toBe('initial'); // Vẫn chưa thay đổi

    act(() => {
      jest.advanceTimersByTime(1); // Advance the remaining time
    });

    expect(result.current).toBe('final update'); // Chỉ cập nhật một lần với giá trị cuối cùng
  });

  // Test case 4: Độ trễ là 0 nên cập nhật ngay lập tức
  it('should update immediately if delay is 0', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 }); // First, rerender the hook

    act(() => {
      jest.runAllTimers(); // Then, run all timers within act
    });

    expect(result.current).toBe('updated'); // Cập nhật ngay lập tức
  });

  // Test case 5: Đảm bảo dọn dẹp hoạt động khi giá trị thay đổi sau độ trễ
  it('should handle value changes after the delay correctly', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'first update', delay: 100 });
    });

    act(() => {
      jest.advanceTimersByTime(100); // Trigger debounce
    });

    expect(result.current).toBe('first update');

    act(() => {
      rerender({ value: 'second update', delay: 100 });
    });

    expect(result.current).toBe('first update'); // Should be old value again

    act(() => {
      jest.advanceTimersByTime(100); // Trigger debounce again
    });

    expect(result.current).toBe('second update');
  });
});
