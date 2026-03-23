# Task Management UI

Frontend Angular cho assignment **Task Management System (Spring Boot + Angular)**.

## Chức năng

- Quản lý User: thêm, sửa, xóa, xem task theo user
- Quản lý Task: thêm, sửa, xóa
- Filter task theo `userId`, `status`, `priority`
- Xem chi tiết task

## Yêu cầu môi trường

- Node.js 20+
- npm 10+
- Angular CLI tương thích với Angular 21
- Backend Spring Boot chạy ở `http://localhost:8080`

## Cấu hình API

File API base URL:

```ts
src/environments/environment.ts
```

Mặc định:

```ts
apiBaseUrl: 'http://localhost:8080/api'
```

## Cách chạy

```bash
npm install
npm start
```

Mở trình duyệt tại:

```bash
http://localhost:4200
```

## Build production

```bash
npm run build
```

## Ghi chú

- Không copy `node_modules` từ máy khác sang.
- Nếu tải project từ zip, hãy chạy lại `npm install` trên chính máy của bạn.
- Nút **View Tasks** ở trang User sẽ đưa sang trang Task kèm `query param userId` để lọc đúng user.
