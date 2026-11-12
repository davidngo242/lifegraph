# Đợt 2 — Modal, tooltip, hiệu ứng (2026-11-12)

## Đã làm
- `components/ModalShell.tsx`: lớp phủ dùng chung (`role="dialog"`, `aria-modal`, `aria-label`, bẫy Tab, trả focus, Escape tuỳ chọn). Áp cho 27 modal và popup lồng nhau. Chỉ modal trên cùng xử lý Tab/Escape (ngăn xếp). Escape bị bỏ qua khi đang gõ vào ô nhập.
- Modal buộc chọn (Epitaph, DeathRecap, RebirthGacha, YearEnd, IncomingNpc, Hub, minigame…) không truyền `onClose`, nên Escape không đóng.
- `BurnoutOverlay` cố ý không bọc: là banner `pointer-events-none`, không có phần tử tương tác.
- Thêm `aria-label` cho các nút đóng chỉ có icon trong các modal trên.
- `Tooltip.tsx`: chạm để mở (đóng khi chạm ra ngoài hoặc sau 4s), Escape đóng, `aria-describedby`; hover chuột giữ nguyên.
- `globals.css`: định nghĩa `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-*` (trước đó là class chết, 168 chỗ dùng). Dùng thuộc tính `scale`/`translate` nên không đè `transform` của Tailwind. Thời lượng cố định 0.2s.

## Quy tắc
- Modal mới: dùng `<ModalShell label=…>`; chỉ truyền `onClose` khi đóng bằng Escape là vô hại.
- Nút chỉ có icon phải có `aria-label`.

## Còn lại
- Escape ở `page.tsx` (~dòng 396) vẫn đóng Emergency/Cinema dù chúng không truyền `onClose`. Hành vi có từ trước, chưa đổi.
- Màu hex viết cứng (~860) và `!important` trong `globals.css`: chưa làm, nên làm dần theo từng component.
- `duration-*` không còn ảnh hưởng animation vào.
