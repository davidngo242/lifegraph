# LifeGraph 2.0 — Đánh Giá Trải Nghiệm Thực Tế & Đề Xuất Nâng Cấp Đột Phá

> Ngày: 2026-11-11 · Phạm vi: bản public (Vercel + Render) và mã nguồn nhánh `claude/ecstatic-heisenberg-v43ggn`.
> Trạng thái: **đề xuất, chưa triển khai**.

## 0. Cơ sở đánh giá và giới hạn

- **Đã làm:** mở link public, khởi tạo 4 nhân vật khách, chơi 0→1 tuổi (3 hành động + 1 lần sang năm), chụp ảnh 4 theme (desktop) và mobile, đo tương phản/cỡ chữ, đọc code backend (engine, content pack, AI Game Master).
- **Chưa làm:** chưa chơi hết một vòng đời, chưa thử tuổi trưởng thành/già, tái sinh nhiều kiếp, minigame, thú cưng, Skill Tree.
- Vì vậy phần "trải nghiệm" bên dưới chủ yếu đúng cho **5–10 phút đầu**. Phần giữa và cuối vòng đời được suy ra từ code, cần playtest để xác nhận.

## 1. Game thực tế đang là gì

Mô phỏng cuộc đời RPG: tạo nhân vật ngẫu nhiên (quốc gia, giới tính, gen) → mỗi năm có Action Point (AP) để chọn hành động → qua ngã rẽ/sự kiện → chết hoặc đắc đạo → nhận Karma → tái sinh kiếp mới trong gia phả.

**Dữ liệu nội dung đo được**
- Kịch bản viết tay: ~77 mục trong 6 content pack JSON + ~124 mục trong `scenarioBank.js`, cộng bộ sinh kịch bản thủ tục.
- AI Game Master gọi Gemini **chỉ khi có `GEMINI_API_KEY`**; không có thì dùng engine thủ tục có sẵn. Chưa xác nhận bản production đang dùng chế độ nào.
- Có chống lặp (cosine similarity trên vector trạng thái) nên ý đồ tránh lặp nội dung là có.

## 2. Đánh giá trải nghiệm (chấm trên thang 10, dựa trên 5–10 phút đầu)

| Mảng | Điểm | Nhận xét thực tế |
|---|---|---|
| Ấn tượng thị giác lần đầu | 8 | Trang chủ, hộp thoại tái sinh, Cây Đời desktop đẹp, có cá tính. |
| Dễ hiểu 30 giây đầu | 4 | Quá nhiều khái niệm cùng lúc: AP, SP, TC, TS, Karma, Cành Hoàng Kim, Nhân Mạch, Gốc Rễ, Gieo Mầm, Lên Lớp… Không có onboarding dẫn dắt. |
| Quyền chủ động ban đầu | 3 | Bắt đầu 0 tuổi: các lựa chọn là "bú mẹ, tắm nắng, đồ chơi" với số liệu +/-. Người chơi chưa có câu chuyện nào để quan tâm. |
| Vòng lặp cốt lõi | 6 | Chọn hành động → chỉ số đổi → sang năm là rõ ràng, nhưng hiện thiên về "bấm nút để tăng số" hơn là "đối mặt lựa chọn khó". |
| Cảm xúc/kể chuyện | 6 | Văn phong có hồn ("Ký ức đầu đời…"), nhưng khoảnh khắc cảm xúc nằm trong cột nhật ký nhỏ 12px, không phải trọng tâm màn hình. |
| Phản hồi và nhịp độ | 5 | Hành động ~1,7 s, sang năm ~7 s, lần tải đầu ~26 s (backend ngủ). Chờ lâu không có màn hình chờ thú vị. |
| Mobile | 2 | Cây Đời vỡ layout, chữ xếp dọc từng ký tự (xem báo cáo giao diện). |
| Tính giữ chân dài hạn | 5 | Có tái sinh/gia phả/Karma — khung tốt, nhưng phiên khách gắn với trình duyệt (`x-session-id`), không tài khoản, không lý do quay lại hằng ngày. |
| Chia sẻ/lan truyền | 3 | Có màn hồi tưởng khi chết (`DeathRecapVideoModal`) nhưng chưa thấy cơ chế chia sẻ ra ngoài. |

**Vấn đề trải nghiệm xếp theo mức nghiêm trọng**
1. **Cổng vào quá dài và thụ động:** người chơi mới phải đi qua tuổi 0–5 với lựa chọn ít ý nghĩa trước khi gặp quyết định thật.
2. **Quá tải khái niệm và HUD:** hơn chục loại tài nguyên/nhãn; ~80% chữ ≤ 12px trên desktop.
3. **Trang chủ hiển thị sẵn một tiền nhân đã "Niết Bàn" cùng 46 tỷ gia sản** cho khách vừa vào. Người chơi chưa hề chơi kiếp đó, dễ bối rối (cần xác nhận đây là dữ liệu mẫu hay lỗi).
4. **Mobile hỏng** trong khi đây là kênh chính của game mô phỏng đời.
5. **Không có lý do trở lại ngày mai.**

## 3. Điểm mạnh nên giữ làm "xương sống"

- Hệ thống **gia phả/tái sinh/Karma** — hiếm game mô phỏng đời nào có chiều sâu liên thế hệ.
- **Cây Đời** như một trung tâm trực quan duy nhất (đã khá độc đáo).
- Cảnh quan văn hoá 14 quốc gia, văn phong tiếng Việt có hồn.
- Bộ test mô phỏng quy mô lớn (10k/100k khách) — nền tốt để cân bằng kinh tế.

## 4. Ý tưởng đột phá (xếp theo tỉ lệ tác động/công sức)

### Ý tưởng 1 — "Khoảnh Khắc Định Mệnh" mở đầu (Impact cao · Công sức thấp)
- **Vấn đề:** mở đầu thụ động.
- **Giải pháp:** 90 giây đầu đặt người chơi vào **một quyết định khó ở tuổi 17–25** (nghề, tình, tiền, gia đình), rồi mới "hồi tưởng" tuổi thơ như phần mở rộng tuỳ chọn. Tuổi thơ trở thành "Prologue" có thể bỏ qua.
- **Đo:** tỉ lệ hoàn thành 5 phút đầu, tỉ lệ chọn lần đầu trong 60 giây.

### Ý tưởng 2 — Nhánh Thời Gian "Nếu Như…" (Impact cao · Công sức vừa)
- **Giải pháp:** tốn Karma để **tua lại một ngã rẽ** và xem hai dòng đời song song trên chính Cây Đời (nhánh chính + nhánh "nếu như"), so sánh cuối đời.
- **Vì sao đột phá:** biến câu hỏi cốt lõi của thể loại ("nếu tôi chọn khác?") thành cơ chế chơi, tận dụng ngay Cây Đời và Karma đang có. Cũng là sink Karma có ý nghĩa.
- **Rủi ro:** cân bằng Karma, cần lưu trạng thái nhánh.

### Ý tưởng 3 — Gia Phả Liên Người Chơi, Bất Đồng Bộ (Impact rất cao · Công sức lớn)
- **Giải pháp:** hậu duệ của bạn **gặp tiền nhân của người chơi khác** như NPC (ẩn danh, có di sản, lời nhắn, nghề). Có "thư xuyên kiếp", thừa kế một vật phẩm/ký ức từ người lạ.
- **Vì sao đột phá:** không cần chơi cùng lúc, nhưng tạo cảm giác một thế giới sống chung; sinh nội dung do người chơi tạo ra miễn phí.
- **Điều kiện:** cần tài khoản + kiểm duyệt nội dung + lọc dữ liệu cá nhân.

### Ý tưởng 4 — "Thư Từ Cuộc Đời" mỗi ngày (Impact cao · Công sức vừa)
- **Giải pháp:** NPC có **trí nhớ dài hạn** (nhớ bạn đã giúp/phản họ) và gửi một "lá thư" hằng ngày/khi bạn vắng mặt; bạn trả lời bằng 1 lựa chọn để quyết định hướng một sự kiện ngoài đời game. Không phạt nếu không vào.
- **Vì sao:** tạo lý do quay lại mỗi ngày bằng cảm xúc, không bằng chuỗi điểm danh. Dùng được cả engine thủ tục lẫn Gemini.
- **Đo:** D1/D7 retention, tỉ lệ mở thư.

### Ý tưởng 5 — "Hồ Sơ Đời" chia sẻ được (Impact cao · Công sức thấp–vừa)
- **Giải pháp:** khi kết thúc kiếp, xuất **thẻ/video 15 giây dạng "Wrapped cho cuộc đời"**: bức tranh Cây Đời cuối cùng, 3 khoảnh khắc đổi đời, câu bia mộ, link vào chơi. Tái dùng `DeathRecapVideoModal` và `EpitaphModal`.
- **Vì sao:** là kênh tăng trưởng rẻ nhất; game đã có sẵn tài sản hình ảnh.

### Ý tưởng 6 — Sự Kiện Thế Giới Chung theo mùa (Impact vừa · Công sức vừa)
- **Giải pháp:** mỗi tuần một "cú sốc" áp lên mọi người chơi (suy thoái, đại dịch, bùng nổ AI…) — `mmoMacroService` và `realWorldSyncService` đã có nền. Bảng xếp hạng "gia tộc vượt bão tốt nhất tuần".
- **Rủi ro:** cần backend không ngủ và nhiều người chơi cùng lúc mới có ý nghĩa.

### Ý tưởng 7 — Chế độ "Đơn Giản" cho người mới (Impact vừa · Công sức thấp)
- Chỉ hiện 3 tài nguyên (Sinh lực, Tiền, Hạnh phúc) và 1 nút hành động chính; mở dần các hệ thống (Kỹ Năng, Nhân Mạch, Pet) theo tuổi/cột mốc. Giảm quá tải khái niệm mà không bỏ tính năng.

## 5. Lộ trình đề xuất

| Giai đoạn | Nội dung | Mục tiêu đo được |
|---|---|---|
| **P0 – Sửa nền (1–2 tuần)** | Layout mobile, tương phản Ban Ngày, đồng bộ theme tối, cỡ chữ ≥ 12–13px, màn chờ tải, kiểm tra dữ liệu mẫu ở trang chủ | Mobile dùng được; 0 lỗi tương phản AA |
| **P1 – Hook (2–3 tuần)** | Ý tưởng 1 (mở đầu định mệnh), 7 (chế độ đơn giản), 5 (chia sẻ) | Hoàn thành 5 phút đầu ≥ 70%; có lượt chia sẻ |
| **P2 – Giữ chân (3–5 tuần)** | Ý tưởng 4 (thư hằng ngày), 2 (nhánh "nếu như"), tài khoản + lưu đa thiết bị | D1/D7 retention |
| **P3 – Mạng lưới (sau P2)** | Ý tưởng 3 và 6 | Tỉ lệ gặp tiền nhân người khác; DAU |

## 6. Cần Sếp quyết định

1. Ưu tiên kênh chính: **mobile web** hay desktop? (ảnh hưởng thứ tự P0.)
2. Có đồng ý chuyển sang **tài khoản người dùng** (cần cho ý tưởng 3, 4 và lưu đa thiết bị)?
3. Production có bật Gemini không (chi phí/độ trễ), hay giữ engine thủ tục?
4. Đồng ý **ghi ngân sách playtest thật** (10–20 người, quay màn hình) để xác nhận các điểm số ở mục 2 trước khi đầu tư P2–P3.

## 7. Quy trình kiểm định khi triển khai

Mỗi hạng mục qua đủ BA → UI/UX → Coder → Reviewer → Tester → Doc Writer theo `AGENTS.md`. Ghi chú: các chốt Reviewer/Tester nên chạy song song bằng subagent độc lập và có script Playwright (desktop + mobile × 4 theme) làm bằng chứng đính kèm PR.
