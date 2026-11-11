# Đợt Sửa Nền Giao Diện — 2026-11-11

Nhánh `claude/ecstatic-heisenberg-v43ggn`, mốc trước đợt sửa `b6c01e6`. Thực hiện bởi Lead + 8 subagent (A–F, D1–D3) và kiểm định bởi Reviewer + Tester độc lập.

## 1. Kết quả đo (bộ `tools/ui_audit.mjs`, bản build local, 4 theme × 4 viewport)

| Chỉ số | Trước (production, 390px) | Sau |
|---|---|---|
| Tràn ngang | 0 (nhưng thẻ bị cắt bởi overflow-hidden) | 0 ở cả 16 ô |
| Chữ < 12px | 98–105 | 0 |
| Chữ xếp dọc / bị cắt | 6 (390px), 7 (360px) | 0 |
| Tương phản < AA, Daylight | 22–25 | 0 |
| Tương phản < AA, Sepia | — | 0 |
| Tương phản < AA, Obsidian / Cyberpunk | 51–53 | 3 mỗi theme (dương tính giả: chữ trên nền gradient, đã xác nhận bằng ảnh) |
| Nút < 44px trên mobile | 4 | 1 (nút "Cài đặt hệ thống" rộng 36px) |
| Lỗi console | 0 | 0 |

Kiểm thử: backend `npm test` 39/39; `test_e2e_full_simulation` 30/30; `test_gender_and_delayed_consequences` pass; `test_1000_users_simulation` 5/5; `test_daylight_mode_ui_integrity` 10/10 sau khi cập nhật 2 assertion; `npm run build` 0 lỗi; smoke gameplay (3 hành động + 2 lần sang năm, 390 và 1440) không có phản hồi ≥ 400. Cách ly theme: Daylight và Sepia vẫn sáng khi OS ở dark mode; Obsidian và Cyberpunk vẫn tối khi OS ở light mode.

## 2. Thay đổi kiến trúc cần nhớ (Single Source of Truth)

1. **`tailwind.config.js` `darkMode`** dùng dạng `variant` với `:where([data-theme="obsidian"], [data-theme="obsidian"] *, [data-theme="cyberpunk"], [data-theme="cyberpunk"] *, .dark, .dark *)`. Dạng `selector` cũ chỉ khớp thẻ `<html>`, khiến mọi biến thể `dark:` không chạy trong theme tối. Hệ quả: nhiều class `dark:` giờ mới có hiệu lực.
2. **Sepia là theme sáng ấm (giấy ngà)**: `color-scheme: light`, có khối adaptor riêng trong `globals.css`, KHÔNG kích hoạt `dark:`. Chỉ Obsidian, Cyberpunk và `.dark` là theme tối.
3. **Token `--bg-popover`** (nền đặc) cho mọi popover/tooltip; `--bg-card` ở Obsidian/Cyberpunk tăng độ đặc lên 0.92. Không dùng `bg-[var(--x)]/90` (Tailwind không áp opacity lên biến CSS, class vô hiệu).
4. **Cyberpunk** có bảng token tím riêng; `--text-muted` của Obsidian/Cyberpunk là `#8b95a7`.
5. **Chữ tối thiểu 12px**: mọi `text-[9..11px]` đã chuyển thành `text-xs`. Không thêm lại chữ nhỏ hơn 12px.
6. **Cây Đời mobile (< md)**: node hành động hiện dạng danh sách thẻ dọc (node "Đột phá" ghim đầu, badge "Thiếu AP · N" khi không đủ AP); canvas chỉ dành cho md trở lên.
7. **Modal**: overlay z-[60]; `CinemaDecisionRoomModal`, `YearEndReflectionModal`, `IncomingNpcEventModal` render qua `createPortal`; `<main>` không còn `z-10`; nút đóng 44px trên mobile. Header `sticky` hoạt động trở lại nhờ `overflow-x: clip` (thay `hidden`) ở `html`, `body` và div gốc `page.tsx`.
8. **Trang chủ**: tiền nhân `founder_gen_1` là dữ liệu mẫu (`is_demo: true` trong `backend/src/db/db.js`), được gắn nhãn "Gia phả mẫu · Ví dụ", không tính vào thống kê, không mở khoá Niết Bàn. Màn chờ cold-start dùng `LoadingStage.tsx`.
9. **Cổng QA mới**: `npm run ui:audit` (xem `tools/ui_audit.README.md`); thư mục `tools/ui_audit_out/` đã vào `.gitignore`.
10. `next.config.mjs` hỗ trợ `NEXT_DIST_DIR`; lưu ý `rewrites` (BACKEND_URL) được cố định lúc build.

## 3. Việc còn mở (xếp ưu tiên)

**Cần quyết định sản phẩm**
- Xác nhận việc ẩn gia phả mẫu khỏi `canEnterNirvana` (khách mới chưa chết không còn thấy nút Niết Bàn như trước).
- AGENTS.md ghi `git push origin main`, trong khi công việc đi qua nhánh riêng/PR.

**Chất lượng**
- Modal chưa có `role="dialog"`, `aria-modal`, focus-trap, Escape (30 modal); 24 nút đóng thiếu `aria-label`. Đề xuất component `<ModalShell>` dùng chung.
- Tooltip chỉ hoạt động khi hover, không dùng được trên cảm ứng; chip Gen di truyền cần cách mở khi chạm.
- Nút "Cài đặt hệ thống" rộng 36px trên mobile; nút đóng modal desktop 34–40px.
- Thẻ Nhân Mạch mobile: badge "Cấp 1" đè lên tên NPC. Nhãn "Vừa xong" ở Obsidian hơi mờ.
- Còn khoảng 80 chỗ `text-*-300/400/500` chưa có cặp `dark:` (xem báo cáo Reviewer); nên chuyển dần sang token ngữ nghĩa thay vì remap `!important` trong `globals.css`.
- Class chết: `animate-in/fade-in/zoom-in-95` (thiếu plugin), `py-0.2`, `shadow-xs`.
- Component không được render: `EventCard`, `NPCDialogCard`, `StatBar`, `CommandBarHUD`, `AncestralFamilyTree`, `AncestralMemorialModal`, `SkillTreeModal`, `SkillSelectorModal`, `AudioVolumeControl`, `EmergencyNotificationHub` — xoá hoặc nối lại.
- `backend/data/sessions_cache.json` đang được theo dõi bởi git và bị ghi lại khi chạy test.

**Công cụ**
- `ui_audit`: bỏ qua nền gradient để hết dương tính giả; mở thêm modal/tab; so sánh baseline; chạy CI với `--strict --max-vertical=0 --max-hit-area=0`.
- Warm-up ping cho backend Render (cold-start 20–30 giây) và nhãn "Điểm Tin 1t" cần viết rõ.
- Tách file lớn: `DynamicLifeTree.tsx` (~3.6k dòng), `page.tsx` (~2.1k dòng).
