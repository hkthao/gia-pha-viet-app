import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useLoadingOverlay } from '@/hooks/ui/useLoadingOverlay';
import { Result } from '@/types/api'; // Assuming Result type is from here

interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  successMessageKey?: string;
  errorMessageKey?: string;
  showLoadingOverlay?: boolean;
}

/**
 * A custom hook that wraps `@tanstack/react-query`'s `useMutation` to provide
 * common functionalities like showing snackbar messages on success/error and
 * optionally displaying a loading overlay.
 *
 * @param mutationFn The mutation function that performs the asynchronous operation.
 * @param options Configuration options for `useMutation` and custom options.
 * @returns The result of `useMutation` hook.
 */
export const useApiMutation = <TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlay();


  const { successMessageKey, errorMessageKey, showLoadingOverlay = false, ...mutationOptions } = options || {};

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      if (showLoadingOverlay) {
        showLoading();
      }
      try {
        const result = await mutationFn(variables);
        // Assuming TData is Result<ActualData> or similar
        // If the mutationFn directly returns a Result, handle it.
        // Otherwise, assume it throws errors for failures.
        if (typeof (result as any).isSuccess === 'boolean') {
          const apiResult = result as Result<any>;
          if (!apiResult.isSuccess) {
            // Return a rejected promise instead of throwing synchronously
            return Promise.reject(new Error(apiResult.error?.message || t(errorMessageKey || 'common.error')));
          }
        }
        return result;
      } finally {
        if (showLoadingOverlay) {
          hideLoading();
        }
      }
    },
    onSuccess: (data: TData, variables: TVariables, onMutateResult: any, context: any) => {
      if (successMessageKey) {
        showSnackbar(t(successMessageKey), 'success');
      }
      // Example: Invalidate queries after successful mutation
      // queryClient.invalidateQueries(['someQueryKey']);
      // Call original onSuccess if provided
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error: TError, variables: TVariables, onMutateResult: any, context: any) => {
      if (errorMessageKey) { // Only show snackbar if errorMessageKey is provided
        const message = (error as any)?.message || t(errorMessageKey || 'common.error');
        showSnackbar(message, 'error');
      }
      // Call original onError if provided
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...mutationOptions,
  });

  return mutation;
};
