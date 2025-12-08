# Gia Phả Việt - Ứng dụng Quản lý Gia Phả

## Mô tả Dự án

"Gia Phả Việt" là một ứng dụng di động hiện đại (React Native) được thiết kế để giúp người dùng dễ dàng tạo, quản lý và duyệt qua cây gia phả của họ. Ứng dụng tập trung vào trải nghiệm người dùng thân thiện, hiệu suất cao và kiến trúc bảo trì dễ dàng.

## Công nghệ sử dụng



### Mobile App (Frontend)
- **Framework:** React Native (TypeScript)
- **Công cụ xây dựng:** Expo
- **Navigation:** Expo Router
- **UI Toolkit:** React Native Paper
- **Quản lý trạng thái:** Zustand

### Môi trường Phát triển (Development Environment)
- **Framework phát triển:** Expo (Expo CLI)
- **Môi trường:** Node.js, npm/yarn
- **Công cụ:** Android Studio / Xcode (để chạy giả lập/thiết bị thật)

## Quy trình phát triển

### Khởi động dự án
Để khởi động ứng dụng di động, bạn cần đảm bảo đã cài đặt Node.js và Expo CLI.
Từ thư mục gốc của dự án (`/gia-pha-viet-app`), chạy lệnh sau:



### Mobile App (Frontend) (`/gia-pha-viet-app`)
- **Chạy ứng dụng:**
  ```bash
  npm start
  # hoặc npm run android / npm run ios / npm run web
  ```
- **Chạy kiểm thử đơn vị (Unit tests):**
  ```bash
  npm run test:unit
  ```
- **Kiểm tra và sửa lỗi lint:**
  ```bash
  npm run lint
  ```
- **Kiểm tra kiểu TypeScript:**
  ```bash
  npm run tsc
  ```

## Ghi chú về Phát triển

- **Ngôn ngữ ưu tiên:** Tiếng Việt được ưu tiên sử dụng trong giao tiếp, tài liệu và nhận xét mã (code comments).
- **Kiến trúc:** Dự án tuân thủ Clean Architecture để đảm bảo tính module hóa, dễ kiểm thử và dễ bảo trì.
- **Quy ước:** Luôn tuân thủ các quy ước mã hóa, đặt tên và cấu trúc tệp hiện có trong dự án.
- **Kiểm thử:** Đảm bảo viết các bài kiểm thử đơn vị (unit tests) và kiểm thử tích hợp (integration tests) để duy trì chất lượng mã.
- **Review mã:** Thực hiện review mã để đảm bảo tuân thủ các tiêu chuẩn và tìm ra các cải tiến.


