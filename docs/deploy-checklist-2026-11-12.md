# Danh Sách Việc Sếp Cần Làm Khi Deploy (2026-11-12)

Những việc dưới đây cần tài khoản Render/Neon nên Lead không tự làm được.

## 1. Cơ sở dữ liệu (bắt buộc trước khi mở cho khách)
1. Tạo Postgres miễn phí trên **neon.tech**, chọn vùng gần Render (Singapore nếu có).
2. Copy chuỗi kết nối dạng `postgresql://...?sslmode=require`.
3. Render → service `lifegraph-backend` → **Environment** → thêm `DATABASE_URL` = chuỗi trên.
4. Bảng tự tạo khi server khởi động (`schema.sql` + cột `state`, `seq`); không cần chạy lệnh tay.
5. Thời gian chờ kết nối mặc định 10 giây (đủ cho Neon thức dậy). Đổi bằng `DB_CONNECT_TIMEOUT_MS` nếu cần.

## 2. Khoá phiên
- Render → **Environment** → đảm bảo có `SESSION_SECRET` (chuỗi ngẫu nhiên ≥ 32 ký tự). Nếu service không đọc `render.yaml`, bấm **Generate** thủ công.
- Không đặt `ALLOW_RAW_SESSION_ID` trên production (chỉ dùng cho mô phỏng cục bộ).

## 3. Deploy và kiểm tra
1. Merge PR vào `main`, rồi **Manual Deploy** trên Render (Vercel tự deploy frontend).
2. Mở `<backend>/health` → phải trả `status: ok`.
3. Mở game, tạo nhân vật, sang 2–3 năm, tải lại trang → nhân vật còn nguyên.
4. Deploy lại lần nữa rồi tải lại trang → nhân vật **vẫn còn** (chứng minh lưu bền).

## 4. Lưu ý
- Người chơi cũ được nhận lại theo file cache **chỉ khi file đó còn trên server**. Sau khi chuyển sang Postgres, phiên cũ trong cache không tự chuyển vào DB.
- Gói free của Render web và Neon đều ngủ khi vắng khách; khách đầu tiên sẽ chờ lâu. Bản thương mại nên trả phí cho web service.
- Kiểm thử đã chạy trên Postgres 16 cục bộ (xem `docs/review-2026-11-12.md`), chưa chạy trên Neon thật.
