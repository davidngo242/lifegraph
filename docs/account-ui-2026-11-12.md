# Giao Diện Tài Khoản — 2026-11-12

Nối UI với `/api/game/account-auth` (xem `accounts-backend-2026-11-12.md`).

- `frontend/app/components/AccountModal.tsx`: modal (portal, z-[130]) hai tab Đăng nhập / Đăng ký, `role=dialog` + `aria-modal`, focus trap, Esc, hiện/ẩn mật khẩu, mục tiêu chạm 44px, token theme + cặp `dark:`. Chặn lan phím tới hotkey game.
- `frontend/app/hooks/useAccount.ts`: luồng đăng ký/đăng nhập/đăng xuất/link-guest. `frontend/app/lib/api.ts`: `accountCall` + các hàm localStorage.
- Lối vào: mục "Tài khoản" trong `SystemSettingsPopover` (đã đăng nhập: tên + Đăng xuất). `AppHeader` giữ state modal.
- Khoá localStorage: `lifegraph_account_token`, `lifegraph_account_name` (chỉ để hiển thị), và cùng `lifegraph_session_token` / `lifegraph_session_id` với `layout.tsx` (layout.tsx không sửa). Sau đăng nhập/đăng ký trang được tải lại.
- Đăng ký khi khách đang có nhân vật: gọi `link-guest` với token khách chụp TRƯỚC khi gọi register (header phản hồi của register ghi đè phiên trong storage). Nếu 409: hỏi người dùng, "Giữ cuộc đời của tài khoản" / "Thay bằng cuộc đời khách" (`replace:true`, chỉ khi tài khoản đã có tiến trình) / "Hủy" (bỏ đăng nhập, về phiên khách). Không bao giờ thay thế âm thầm.
- Đăng xuất: gọi `/logout`, xoá cả token tài khoản và phiên; lần tải sau handshake khách mới.
- Đăng nhập (không đăng ký) chuyển sang game của tài khoản; không tự gắn game khách.

Kiểm định: `tsc --noEmit`, `npm run build` 0 lỗi; `ui_audit` 4 theme x 4 viewport: overflow 0, font<12 0, hit<44 0, tương phản như mốc cũ (3 dương tính giả Obsidian/Cyberpunk); script thật trên backend: đăng ký, trùng tên 409, sai mật khẩu 401, đăng nhập khôi phục đúng session, link-guest, logout thu hồi token; Playwright 390px: đăng ký, đăng xuất, đăng nhập sai/đúng, Esc.
Chưa kiểm tự động: nhánh 409 của link-guest trong UI.
