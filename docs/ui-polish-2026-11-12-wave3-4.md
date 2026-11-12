# Đợt 3–4 — Dọn nợ và công cụ (2026-11-12)

## Đã làm
- Backend test: `npm test` nạp `test/_env.cjs` đặt `NODE_ENV=test`. Test `v7_mechanics` hết chập chờn (0/40 lỗi; trước là ~3/40). Chạy test không còn làm bẩn git.
- Ngừng theo dõi `backend/data/sessions_cache.json` và `frontend/tsconfig.tsbuildinfo` (thêm vào `.gitignore`). Backend tự tạo lại cache khi thiếu file (đã thử).
- `tools/ui_audit.mjs`: chữ nằm ngay trên nền gradient (không có lớp màu đặc ≥ 0.5 chen giữa) được tách khỏi bộ đếm `contrast`, ghi ở cột ghi chú để xem ảnh. Lỗi trên nền phẳng và thẻ bán trong suốt vẫn được đếm và chặn bởi `--strict`.
- Xoá 5 component không bao giờ được render: `StatBar`, `CommandBarHUD`, `AncestralFamilyTree`, `AncestralMemorialModal`, `AudioVolumeControl`. Tài liệu nhắc đến chúng đã ghi chú "đã gỡ". `test_1000_users_simulation` cập nhật còn 18 modal.
- Modal Cứu Hộ và Cinema nhận Escape (đã có nút X cùng hành vi).

## Quyết định không làm
- ~860 mã hex viết cứng: phần lớn là màu nghệ thuật trong SVG/3D/hậu cảnh (`DynamicLifeTree` 320, `Dynamic3DAvatar` 111, `CulturalLandscapeBackdrop` 80, `InteractiveScene2D` 67), không phụ thuộc theme. Chuyển sang biến chung không đem lại lợi ích tương xứng và dễ vỡ hình.
- `!important` trong `globals.css` (62): là lớp adaptor theme đã được kiểm định; gỡ cần hồi quy thị giác từng màn, để dành cho đợt có công cụ so ảnh.

## Còn lại
- Tách `DynamicLifeTree.tsx` (~3,6k dòng) và `page.tsx` (~2,1k dòng).
- Hook Stop nằm ngoài repo.

## Bổ sung
- Tách dữ liệu node Cây Đời ra `components/rpg/lifeTreeNodes.ts` (`buildLifeTreeNodes`, chuyển nguyên văn; `DynamicLifeTree.tsx` 3,6k → 3,15k dòng). Hai test đọc chuỗi nguồn nay đọc cả file mới.
- Ba chữ trên nền gradient ở Obsidian/Cyberpunk ("LG", "Lên Lớp 1", "Vòng Đời & Hành Động") là chữ tối #020617 trên nút gradient vàng/xanh; ảnh chụp xác nhận đọc rõ. Cảnh báo nhầm.
- Mẫu báo cáo cuối nay luôn có "Vướng mắc / Cần Sếp chốt" và "Tiếp theo" (xem `AGENTS.md` mục 2c).
- Không tách `page.tsx`: toàn state và handler đan xen, tách thủ công dễ gây lỗi; nên làm cùng một đợt refactor có kiểm thử riêng.
