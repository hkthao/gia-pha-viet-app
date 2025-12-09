// utils/resultUtils.ts
import { Result as IResult, ApiError } from '@/types'; // Import the Result interface as IResult to avoid name collision

/**
 * @class ResultHelper
 * @description Lớp tiện ích để tạo các đối tượng Result.
 */
export class ResultHelper {
  /**
   * @method success
   * @description Tạo một đối tượng Result thành công.
   * @param value - Giá trị được trả về khi thành công.
   * @returns IResult<T> - Một đối tượng Result thành công.
   */
  public static success<T>(value: T): IResult<T> {
    return { isSuccess: true, value };
  }

  /**
   * @method fail
   * @description Tạo một đối tượng Result thất bại.
   * @param error - Đối tượng ApiError hoặc chuỗi thông báo lỗi.
   * @returns IResult<T> - Một đối tượng Result thất bại.
   */
  public static fail<T>(error: ApiError | string): IResult<T> {
    const apiError: ApiError = typeof error === 'string' ? { message: error } : error;
    return { isSuccess: false, error: apiError };
  }

  /**
   * @method combine
   * @description Kết hợp nhiều đối tượng Result. Nếu bất kỳ Result nào thất bại, trả về lỗi đó.
   *              Nếu tất cả thành công, trả về Result thành công.
   * @param results - Mảng các đối tượng Result.
   * @returns IResult<void> - Result tổng hợp.
   */
  public static combine<T>(results: IResult<T>[]): IResult<void> {
    for (const result of results) {
      if (!result.isSuccess) {
        return ResultHelper.fail<void>(result.error || { message: "Unknown error during combine" });
      }
    }
    return ResultHelper.success<void>(undefined);
  }
}

// Export the ResultHelper as Result for convenient import as a value
export const Result = ResultHelper;