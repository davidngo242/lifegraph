# Tài Khoản Người Chơi (Backend) — 2026-11-12

Endpoint: `/api/game/account-auth` (router `backend/src/routes/auth.js`, gắn trước `/api/game`).

| Route | Việc |
|---|---|
| `POST /register {username,password}` | Tên 3-32 ký tự (chữ, số, `_ . -`, lưu chữ thường), mật khẩu 8-128. Tạo `session_id` ổn định. |
| `POST /login` | 10 lần/phút/(IP+tên). Lỗi chung "Sai tên đăng nhập hoặc mật khẩu" cho cả tên không tồn tại. |
| `POST /logout` | Tăng `token_epoch`, thu hồi mọi account token. |
| `POST /link-guest` | Gắn phiên khách hiện tại (header `x-session-token`) vào tài khoản (header `x-account-token`). 409 nếu phiên đã thuộc tài khoản khác hoặc tài khoản đã có nhân vật (trừ `replace:true`). |
| `GET /me` | Thông tin tài khoản. |

Đăng ký/đăng nhập/link trả `account_token` (lưu phía client, gửi qua `x-account-token` hoặc `Authorization: Bearer`) và `session_token` (cũng đặt vào header `x-session-token`). Đăng nhập từ máy khác nhận lại đúng `session_id` nên khôi phục đúng game.

Bảo mật: mật khẩu băm `crypto.scrypt` (muối 16 byte riêng từng người), so sánh `timingSafeEqual`, không bao giờ trả/ghi hash; luôn chạy scrypt kể cả tên không tồn tại. Account token ký HMAC miền riêng (`account|`), hạn 30 ngày.

Lưu trữ: Postgres bảng `accounts` (tạo trong `initDb`); chế độ bộ nhớ lưu `accounts.json` (0600) trong `LIFEGRAPH_DATA_DIR`, tách khỏi `sessions_cache.json`.

Nhận lại phiên cũ trên Postgres: cột mới `player_accounts.claimed` (mặc định FALSE cho hàng có sẵn). Lần đầu một id thô trùng hàng chưa claim, `UPDATE ... WHERE claimed = FALSE` nguyên tử cho nhận đúng một lần; id `g_...` do server cấp và hàng mới luôn `claimed = TRUE`.

Kiểm thử: `backend/test/accounts.test.js` (ca Postgres chạy khi có `TEST_DATABASE_URL`).
