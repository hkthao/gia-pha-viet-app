import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiMutation } from '@/hooks/common/useApiMutation';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useLoadingOverlay } from '@/hooks/ui/useLoadingOverlay';
import { Result } from '@/types/api';

// Define mock functions as constants outside of jest.mock calls
const mockShowSnackbar = jest.fn();
const mockShowLoading = jest.fn();
const mockHideLoading = jest.fn();

// Mock các hooks và service bên ngoài
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Đơn giản hóa hàm t
  }),
}));

jest.mock('@/hooks/ui/useGlobalSnackbar', () => ({
  useGlobalSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

jest.mock('@/hooks/ui/useLoadingOverlay', () => ({
  useLoadingOverlay: () => ({
    showLoading: mockShowLoading,
    hideLoading: mockHideLoading,
  }),
}));

describe('useApiMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Tắt retry trong test để tránh đợi lâu
        },
      },
    });

    // Xóa trạng thái của các mock trước mỗi test
    mockShowSnackbar.mockClear();
    mockShowLoading.mockClear();
    mockHideLoading.mockClear();

    jest.useFakeTimers(); // Bắt đầu sử dụng fake timers
  });

  afterEach(() => {
    jest.clearAllTimers(); // Dọn dẹp fake timers sau mỗi test
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );







  // Test case 4: Hiển thị và ẩn loading overlay khi showLoadingOverlay là true
  it('should show and hide loading overlay when showLoadingOverlay is true', async () => {
    const mockMutationFn = jest.fn().mockResolvedValue({ isSuccess: true } as Result<string>);

    const { result } = renderHook(
      () =>
        useApiMutation(mockMutationFn, {
          showLoadingOverlay: true,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync('test variables');
      await Promise.resolve(); // Allow event loop to tick for react-query updates
    });

    await waitFor(() => {
      expect(mockShowLoading).toHaveBeenCalledTimes(1);
      expect(mockHideLoading).toHaveBeenCalledTimes(1);
    });
  });

  // Test case 5: Không hiển thị loading overlay khi showLoadingOverlay là false
  it('should not show loading overlay when showLoadingOverlay is false', async () => {
    const mockMutationFn = jest.fn().mockResolvedValue({ isSuccess: true } as Result<string>);

    const { result } = renderHook(
      () =>
        useApiMutation(mockMutationFn, {
          showLoadingOverlay: false,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync('test variables');
    });

    await waitFor(() => {
      expect(mockShowLoading).not.toHaveBeenCalled();
      expect(mockHideLoading).not.toHaveBeenCalled();
    });
  });

  // Test case 6: Không hiển thị snackbar khi mutation thành công và không có successMessageKey
  it('should not show success snackbar if successMessageKey is not provided', async () => {
    const mockMutationFn = jest.fn().mockResolvedValue({ isSuccess: true, data: 'Success data' } as Result<string>);

    const { result } = renderHook(() => useApiMutation(mockMutationFn), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('test variables');
    });

    await waitFor(() => {
      expect(mockShowSnackbar).not.toHaveBeenCalled();
    });
  });




});
