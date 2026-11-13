# QA đo giao diện Nhịp năm + Bản đồ Cây Sinh Mệnh — 2026-11-13

Branch `claude/qa-ui-audit`. Đo bằng `tools/ui_audit.mjs` (Playwright headless, deviceScaleFactor 1) trên bản `origin/main`.

## Vì sao lần trước treo
Không phải lỗi trong game: frontend chỉ proxy `/api/game/**` tới `BACKEND_URL` (mặc định `http://localhost:3001`, `next.config.mjs`); không có backend thì "Bắt Đầu Kiếp Mới" không bao giờ ra màn chơi và harness chờ hết `--entry-timeout` (120s) cho từng viewport. Có backend (`PORT=3001 npm start`) thì vào game xong 4-40s (phần lớn là biên dịch `next dev` lần đầu). Handshake phiên do `layout.tsx` tự làm, không cần cấu hình. Sửa harness: preflight `GET /api/game/state`, thoát mã 3 kèm hướng dẫn nếu backend không trả lời.

## Harness mới
`--scenario tree30|picker12` vá `character` trong phản hồi API ở trình duyệt (seed: life_seed, cast có ký ức, focus_history 10 năm, `doors.cuoi_som=false`, 2 cột mốc, cờ `written_memoir`; hoặc tuổi 12 chưa chọn trọng tâm). Thêm `measureMapLayer`: cỡ chữ nhãn SVG theo pixel màn hình, nhãn tràn khung, nhãn chồng nút hành động, chiều cao nút bộ chọn, thẻ Mạch truyện. Ảnh `*_tree.png`, `*_picker.png`, `*_cards.png`. Audit chung không đo được chữ SVG (màu là `fill`), nên phải đo riêng.

## Kết quả đo (tree30, daylight)
| Viewport | Trước | Sau |
|---|---|---|
| 390 | nhãn SVG 5.5px (10 nhãn), 1 nhãn chồng nút | nhãn SVG ẩn, thẻ Mạch truyện (22 thẻ, cao >= 44) |
| 768 | nhãn 11px, 7 nhãn chồng nút | như 390 |
| 1024 | nhãn 8.3px, 12 chồng nút | như 390 |
| 1280 | 6 chồng nút | 0 |
| 1440 | 4 chồng nút | 0 |

Audit chung 4 theme x (390, 1280, 1440), cả hai kịch bản và kịch bản mặc định: overflow 0, font<12 0, tương phản<AA 0, chữ dọc/cắt 0, console 0. Hit<44 trên mobile: 9 (xem "còn lại").

## Sửa (chỉ `LifeTreeMapLayer.tsx`)
- Nhãn SVG (rễ, cành) `max-xl:hidden`: dưới 1280px cây thu nhỏ (0.46-0.9) khiến chữ 5-11px và đè các thẻ nút; thẻ "Mạch truyện" đổi `md:hidden` thành `xl:hidden` để thay thế ở mọi cỡ dưới 1280.
- Nhãn rễ dời vào trong (x 190/530 thành 250/470) để khỏi đè nút "Bữa Cơm" / "Lời Khuyên".
- Hai cành ở slot phía trên (-118, -62) không vẽ nhãn chữ: nằm sát thẻ "Đột phá" (1440) và "Đèn Sách"/"Mở Rộng" (1280); tên đầy đủ ở tooltip `<title>`, `aria-label` và thẻ Mạch truyện.

## Còn lại
- 9 nút 28x44px trên mobile (lá kỹ năng và avatar NPC của `DynamicLifeTree`, có từ trước, không thuộc thành phần mới).
- Ở >= 1280px hai cành trên không có nhãn chữ trên cây (chỉ tooltip); muốn có thì cần đổi bố cục slot.
- Nhãn cửa đóng hiển thị khoá thô (`cuoi som`) nếu backend không gửi `label`.
- Tương phản chữ SVG không đo tự động (chỉ kiểm bằng mắt: chữ sáng viền tối trên cả 4 theme).
