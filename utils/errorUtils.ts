// gia-pha-viet-app/utils/errorUtils.ts

/**
 * Parses an error object or message into a consistent error string.
 * @param err The error object or message.
 * @returns A string representation of the error.
 */
export const parseError = (err: any): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
};
