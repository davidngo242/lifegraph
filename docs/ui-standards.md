# LifeGraph — quy chuẩn giao diện v1

Áp dụng cho game cuộc đời LifeGraph RPG. Đây là quy chuẩn sản phẩm của dự án, không phải chứng nhận hay một tiêu chuẩn bắt buộc chung cho mọi game.

## Typography
- Inter là font giao diện chính, có bộ ký tự tiếng Việt; system sans là dự phòng khi CDN không tải được. Chỉ nạp một họ font, weights 400–800, display=swap; không import cùng stylesheet hai lần.
- Nội dung 14–16px, nhãn phụ tối thiểu 12px, tiêu đề khu vực 20–24px, tiêu đề trang 28–40px. Không dùng 8–11px cho chữ người chơi cần đọc.
- Line-height nội dung 1.6–1.7, tiêu đề 1.35. Chừa chỗ cho dấu tiếng Việt; không cắt dòng bằng height cố định.
- Số liệu dùng tabular-nums. Không dùng monospace cho câu kể hoặc nhãn. Không viết hoa toàn bộ câu dài; bỏ italic ở hướng dẫn chính.

## Bố cục và tương tác
- Thang khoảng cách: 4, 8, 12, 16, 24, 32px; card 16–24px; khoảng cách vùng 16–24px.
- Menu và tiện ích được xuống dòng; khát vọng ở hàng riêng, không chiếm phần chiều rộng còn thừa giữa hai nhóm không co được.
- Nhóm theo thứ tự: điều hướng → tình trạng → nhân vật → chế độ → mục tiêu/cảnh → hành động.
- Nút chính dành cho thao tác tiếp theo; nút chuyển chế độ và công cụ dùng nền trung tính. Không làm mọi vùng đồng thời phát sáng hoặc nhấp nháy.
- Mobile: nội dung một cột khi cần, mục tiêu chạm ít nhất 44px, input 16px để tránh auto zoom. Không vô hiệu hóa zoom.
- Focus bàn phím rõ ràng. Tôn trọng prefers-reduced-motion. Không dùng màu làm tín hiệu duy nhất.
- Mục tiêu tương phản: WCAG AA 4.5:1 cho chữ thường, 3:1 cho chữ lớn. Cần đo từng cặp màu; bản sửa này không tuyên bố mọi màn đã đạt chứng nhận.

## Câu chữ
- Dùng tiếng Việt ngắn, nêu hành động và giá phải trả. Ví dụ: “Chọn hành động”, “Manh mối”, “Bắt đầu kiếp sống mới”.
- Không đưa thuật ngữ nội bộ như Cockpit, Reality Starter Pack, prototype vào nhãn người chơi; dùng “Quản lý cuộc sống”, “Xuất phát điểm”, “Bản thử”.
- Lỗi phải nêu việc người chơi có thể làm tiếp theo; không hiển thị stack trace hay raw object.

## Kiểm tra trước phát hành
Build/type check; quét cỡ chữ dưới 12px và font override; xem desktop/mobile; kiểm tra menu/khát vọng, popup, focus, câu dài, dấu tiếng Việt, chế độ reduced motion. Không đổi ID, khóa dữ liệu hoặc thuật toán khi sửa câu chữ. Văn bản sinh từ backend/AI cần được rà riêng, không thể bảo đảm chỉ bằng sửa JSX.
