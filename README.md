# 🧠 LifeGraph — Driven Life Simulation RPG

> **Game nhập vai sinh tồn, mô phỏng cuộc đời và quản lý nguồn lực đa mô-đun với AI Game Master theo thời gian thực.**

[![Production Vercel](https://img.shields.io/badge/Frontend-Vercel%20Live-brightgreen?style=flat-square&logo=vercel)](https://lifegraph-test.vercel.app)
[![Backend Render](https://img.shields.io/badge/Backend-Render%2024%2F7-46E3B7?style=flat-square&logo=render)](https://lifegraph-backend-gfm0.onrender.com/health)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)

---

## 🌐 Trải Nghiệm Trực Tuyến (Production Public Links 24/7)

Game đã được triển khai trên Cloud hoạt động độc lập 24/7 (tắt máy vẫn chơi bình thường):

| Thành Phần | Địa Chỉ Public Cloud | Trạng Thái |
| :--- | :--- | :--- |
| 🎮 **Giao diện Web Game (Frontend)** | [https://lifegraph-test.vercel.app](https://lifegraph-test.vercel.app) | ![Status](https://img.shields.io/badge/Status-Online%20(HTTP%20200)-success) |
| ⚡ **Máy chủ API Game (Backend)** | [https://lifegraph-backend-gfm0.onrender.com](https://lifegraph-backend-gfm0.onrender.com) | ![Status](https://img.shields.io/badge/Status-Live%2024%2F7-success) |
| 🩺 **Kiểm Tra Trạng Thái (Health Check)** | [https://lifegraph-backend-gfm0.onrender.com/health](https://lifegraph-backend-gfm0.onrender.com/health) | `{"status": "ok"}` |
| 🔍 **Chẩn Đoán Hệ Thống (Diagnostic API)** | [https://lifegraph-backend-gfm0.onrender.com/api/game/diagnostic](https://lifegraph-backend-gfm0.onrender.com/api/game/diagnostic) | `v6.0-ultimate-narrative` |

> [!NOTE]
> * **Cơ chế cách ly phiên (Session Isolation):** Mỗi trình duyệt hoặc thiết bị di động truy cập sẽ tự động nhận diện một `x-session-id` riêng biệt, lưu trữ kiếp sống và chỉ số độc lập trên Cloud mà không bị ghi đè lẫn nhau.
> * **Render Free Tier Cold-Start:** Nếu máy chủ Backend không có lượt truy cập trong một thời gian dài, lượt tải đầu tiên có thể mất ~15-20s để khởi động lại.

---

## 🚀 Khởi Chạy Cục Bộ (Local Development)

### Cách 1: Khởi động 1-Click bằng Script (Windows)
Chỉ cần nhấp đúp file:
```cmd
start-game.bat
```
Script sẽ tự động khởi động Backend (port `3001`), Frontend (port `3000`) và tự mở trình duyệt tại `http://localhost:3000`.

---

### Cách 2: Khởi động thủ công qua Terminal

#### 1. Khởi động Backend (Express API)
```bash
cd backend
npm install
npm start
```
- 👉 **Backend API:** [http://localhost:3001](http://localhost:3001)
- 👉 **Diagnostics:** [http://localhost:3001/api/game/diagnostic](http://localhost:3001/api/game/diagnostic)

#### 2. Khởi động Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```
- 👉 **Giao diện trò chơi (Cockpit View):** [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Cấu Hình Môi Trường (Environment Variables)

### Backend (`backend/.env`)
```ini
PORT=3001
CORS_ORIGIN=*

# PostgreSQL (Tùy chọn: Để trống hệ thống sẽ tự dùng In-Memory Simulation DB)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/lifegraph

# Gemini AI (Tùy chọn: Để trống hệ thống dùng Built-in Procedural AI Engine)
# GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### Frontend (`frontend/.env.local`)
```ini
# Khi chạy cục bộ: Next.js Rewrite tự động chuyển tiếp tới cổng 3001
NEXT_PUBLIC_API_URL=/api/game

# Khi build lên Vercel:
# BACKEND_URL=https://lifegraph-backend-gfm0.onrender.com
```

---

## 🏛️ Tính Năng & Kiến Trúc Nổi Bật (Version 7.5)

### 1. Sân Khấu Nhập Vai & Bản Ngã Tâm Thức (Mind Stage & Ego Voices)
* **Bộ Ba Bản Ngã Tranh Luận:** Trong mỗi biến cố cuộc đời, ba giọng nói nội tâm sẽ thì thầm lời khuyên:
  * 🧠 **Bản Ngã Lý Trí (*Logic & Ambition*):** Đo lường dòng tiền, quyền lực, hiệu suất và cơ hội thăng tiến.
  * ❤️ **Bản Ngã Trái Tim (*Heart & Empathy*):** Kêu gọi sự thấu cảm, gia đình, đạo đức và an yên.
  * 🛡️ **Bản Năng Sinh Tồn (*Primal Instinct*):** Cảnh báo rủi ro kiệt sức, bảo vệ thể xác và đường lùi an toàn.
* **Định Hình Thái Độ Nhập Vai (Roleplay Stance):** Hành động gắn liền với bản sắc: `[Lý Trí & Quyết Đoán]`, `[Thấu Cảm & Tình Thân]`, `[Thận Trọng & Tự Vệ]`, `[Canh Bạc Đột Phá]`, `[Khôn Khéo & Tùy Cơ]`.

### 2. Gieo Xúc Xắc Số Phận (Interactive D20 Fate System)
* Cơ chế đổ xúc xắc D20 trực tiếp tính toán xác suất thành công/thất bại dựa trên chỉ số nhân vật (`D20 + Modifiers` vs `DC Threshold`).
* Phân định các mốc: *Đại Thành Công (Critical Success)*, *Thành Công Ngoạn Mục*, hoặc *Bài Học Gian Nan*.

### 3. Đối Thoại Trực Diện Cùng NPC (Live NPC Duel Stage)
* Đối đầu trực diện hiển thị chân dung NPC, chỉ số Thiện cảm (*Affinity*), lời thoại trích dẫn từ AI Game Master.
* Tự do nhập câu thoại trực tiếp để AI Game Master phân giải và phản hồi theo ngữ cảnh.

### 4. Sảnh Sống Động 3D & Phòng Quyết Định 21:9 Cinema (Living Room Viewport)
* Khung cảnh mô phỏng phòng khách sống động (Dynamic 3D Canvas) thay đổi theo độ tuổi (từ sơ sinh, thiếu nhi tới trưởng thành và về già).
* Tích hợp thanh HUD chỉ số sinh tồn và nhịp tim ECG theo thời gian thực.
* **Chế độ Điện Ảnh 21:9 (Phím tắt `[D]`):** Mở không gian màn ảnh rộng tập trung tối đa tâm trí vào các bước ngoặt cuộc đời.

### 5. Cây Kỹ Năng Tam Phân & Hệ Thống Liên Kết Xã Hội (RPG Progression)
* Thăng cấp bậc đời (*Life Level Progression*).
* Cây 3 nhánh kỹ năng: *Trí Tuệ & Chuyên Môn (Sage)*, *Giao Tiếp & Uy Thế (Social)*, *Thương Trường & Tài Phiệt (Wealth)*.
* Hệ thống Social Links gắn kết với bạn bè, đồng nghiệp, người yêu và gia tộc.

### 6. Hệ Thống Mini-Game Đa Trục (Skill - Age - Geo)
* 📈 **Lướt Sóng Chứng Khoán (Stock Trader):** Bắt nến 12s, đồng bộ theo sàn giao dịch địa phương.
* 🤝 **Bàn Tròn Thương Lượng (Negotiation Duel):** Cân bằng Uy Thế và Kiên Nhẫn đối tác để giảm giá tài sản.
* 🚨 **Sinh Tồn Khủng Hoảng (Crisis Survival):** Đếm ngược 15s qua 4 trạm hiểm nguy cứu gia đình và nhu yếu phẩm.
* 🧩 **Rèn Luyện Tuổi Thơ & Hoàng Hôn:** Ươm mầm kiên nhẫn, Mạch logic robot, Nhịp tim ECG, Mảnh ghép ký ức chống Alzheimer.

### 7. Cẩm Nang Trực Quan Siêu Dễ Hiểu (Dual-Mode Survival Guide UX)
* **Cơ chế Kép (Dual-Mode UX):** Chuyển đổi linh hoạt giữa giao diện trực quan và cẩm nang chuyên sâu chỉ bằng 1 nút bấm:
  * 🧸 **Bản Đồ Vui Nhộn (Bé 6 tuổi cũng hiểu - Mặc định):** Trực quan hóa toàn diện, không gánh nặng đọc hiểu:
    * ⚡ **Tia Sét Năng Lượng (AP - Amber):** Mỗi năm nhận 3-4 tia sét để làm việc, giải trí, khám bệnh. Điểm dư thừa cuối năm tự chuyển hóa thành sinh lực.
    * ❤️ **Trái Tim Khỏe Mạnh (HP - Rose):** Chỉ số sinh tồn cốt tử. Hết máu là Game Over, cần ăn ngon ngủ kỹ và dưỡng bệnh kịp thời.
    * 💥 **Ngọn Lửa Áp Lực (Burnout - Orange):** Mức độ căng thẳng tinh thần. Vượt ngưỡng 80% sẽ bùng cháy thiêu rụi máu trần.
    * 💰 **Túi Tiền Tiết Kiệm (Cash - Emerald):** Tích lũy mua nhà xịn, đồ chơi, chăm sóc bản thân và phụng dưỡng cha mẹ.
    * 🚀 **Vòng lặp "3 Bước Chơi Ngay Trong 10 Giây":** *Bước 1: Chọn 1 việc làm* ➔ *Bước 2: Bấm nút tím to bự "Bước Sang Tuổi Mới"* ➔ *Bước 3: Nhận quà sinh nhật, EXP và điểm may mắn*.
    * 💡 **4 Mẹo Vàng Dễ Nhớ:** Nâng cấp chỗ ở (giảm bệnh tật), Thư giãn đúng lúc (dập tắt lửa áp lực), Kết thân bạn bè (cứu nguy hoạn nạn), Sinh con nối dõi (truyền thừa cơ nghiệp).
  * 📖 **Cẩm Nang Tra Cứu RPG Nâng Cao:** Dành cho game thủ muốn làm chủ số phận:
    * **Cây Kỹ Năng 3 Nhánh:** *Wealth* (Thương Trường: Mắt Thần Định Giá ➔ Đàm Phán Khắc Nghiệt ➔ Cỗ Máy Dòng Tiền), *Social* (Nhân Mạch: Hào Quang Cuốn Hút ➔ Mượn Gió Bẻ Măng ➔ Đế Chế Nhân Mạch), *Sage* (Tâm Thức: Tâm Lý Thép ➔ Bách Khoa Toàn Thư ➔ Giác Ngộ Niết Bàn).
    * **4 Quý Nhân NPC Đồng Hành:** *Mentor* GS. Vũ Trọng Khang, *Ally* Trần Đình Khang, *Rival* Lâm Thế Cường, *Protégé* Nguyễn Thảo My cùng đặc quyền can thiệp sinh tử ở Hảo cảm Cấp 3.
    * **Chiến Lược Tích Sản & Quản Trị Dòng Tiền:** Cơ chế phạt âm tiền (lãi vay nợ 4.5%/năm & +25% Burnout), tối ưu hóa cổ tức BĐS/Cổ phiếu thụ động và cân đối chi phí sinh hoạt gia đình.
    * **5 Giai Đoạn Đời:** Ấu thơ (0-5t), Học đường (6-17t), Lập nghiệp (18-35t), Trụ cột gia tộc (36-55t), Hoàng hôn & Luân hồi (56+t).

### 8. Thanh Điều Khiển HUD & Hệ Thống Cứu Hộ Khẩn Cấp (CommandBarHUD & Emergency SOS)
* 🎛️ **Thanh Lệnh HUD Cố Định (Sticky Cockpit Command Bar):** Tọa lạc ngay dưới thanh điều hướng chính, tích hợp công cụ chuyển đổi nhanh 1-chạm giữa Buồng Lái Kiếp Sống (*RPG Simulation View*) và Cây Gia Phả Tiền Nhân (*Family Lineage Portal*).
* 🎬 **Lối Tắt Phòng Quyết Định 21:9 Cinema (`[D]`):** Mở không gian toàn cảnh Ultra-wide điện ảnh đối mặt ngã rẽ cuộc đời mà không bị che khuất bởi các thanh công cụ phụ.
* 🚨 **Trung Tâm Cấp Cứu Khẩn Cấp Sinh Mệnh (Emergency Rescue Engine):** Tự động giám sát hai ngưỡng sinh tồn cốt tử: **Sinh Lực (Vitality < 30%)** hoặc **Kiệt Sức (Burnout > 75%)**.
  * Khi chạm ngưỡng nguy kịch, nút cứu sinh phát xung nhịp tim đập (*pulsing alert*) màu đỏ-hổ phách kích hoạt modal can thiệp sinh mạng cấp tốc.
  * Hỗ trợ 2 phương án cứu sinh tức thời: **Dưỡng Sinh Phục Hồi Toàn Diện (1 AP)** giải tỏa kiệt sức hoặc **Thỉnh Phước Bảo Mạng (0 AP)** tại Đền Thờ Nghiệp Quả Karma khi đã cạn sạch điểm hành động.
* ⌨️ **Gợi Ý Phím Tắt Trực Quan (Interactive Key Badges):** Hiển thị trực tiếp các phím tắt cốt lõi (`[1] [2] [3]`, `[Space]`, `[?]`) kèm nút tra cứu nhanh cheat-sheet.

### 9. Khoang Quyết Định Hợp Nhất & Cơ Chế Synergistic AP
* 🎯 **Khoang Quyết Định & Hành Động Năm Hợp Nhất (Unified Annual Stage):** Thẻ biến cố ngã rẽ và khay hành động điều hành nguồn lực AP được bao bọc trong một container duy nhất (`rounded-3xl`), dẹp bỏ tình trạng phân mảnh thị giác và viền lồng viền (`isEmbedded={true}`).
* ⚡ **Cơ Chế Synergistic AP (`+1 AP Trợ Lực`):** Đầu tư điểm hành động trực tiếp vào phương án ngã rẽ để tăng +2 điểm gieo xúc xắc D20, tăng +25% Cash, +30% Karma và giảm 50% rủi ro trừ máu/tăng stress.
* ⚠️ **Hộp Thoại Cảnh Báo Thông Minh (Smart Unspent AP Warning):** Tự động phát hiện khi còn AP dư và đề xuất dùng nốt hoặc chuyển hóa an toàn (+2 HP & -5% Burnout per AP) khi bước sang năm mới.

### 10. Hệ Thống Multi-Theme & Công Thái Học Thị Giác (Visual Ergonomics)
* 🎨 **3 Phong Cách Thị Giác Chuyên Biệt Chống Mỏi Mắt:**
  * 🌙 **Obsidian Night (Than chì dịu mắt — Mặc định):** Nền than chì sâu thẳm `#0c0d12`, loại bỏ màu đen tuyệt đối và ánh sáng chói, giữ mắt thư giãn tối đa trong các phiên chơi đường dài.
  * 📜 **Sepia Warmth (Đêm ấm cúng):** Tông giấy ngà & nâu ấm `#161412`, cắt giảm tối đa ánh sáng xanh gây mỏi mắt, hoàn hảo cho những đêm tĩnh lặng trước khi ngủ.
  * ⚡ **Cyber Slate (Neon nguyên bản):** Nền xanh đen viễn tưởng `#020617` kết hợp đường viền cyan neon sắc sảo, gợi cảm giác buồng lái phi thuyền không gian.
* ⚡ **Công Nghệ Chuyển Đổi Tức Thì & Zero-FOUC:** Tích hợp `ThemeSwitcher` trên thanh Header buồng lái, lưu tự động vào `localStorage ('lifegraph_theme')`, ngăn chặn 100% hiện tượng chớp nháy (Anti-FOUC) với hiệu ứng chuyển màu mượt mà 250ms.

### 11. Hoạt Động Dưỡng Lão & Kiến Tạo Di Sản (Senior AP Sinks: 45+ Tuổi)
* 📜 **Viết Hồi Ký Cuộc Đời (`2 AP`):** Đúc kết chiêm nghiệm kiếp sống, nhận +25 Karma phúc đức và lưu danh sử sách cho các thế hệ hậu sinh.
* 👶 **Chỉ Dạy Con Cháu (`1 AP`):** Truyền thụ kinh nghiệm thương trường và bài học nhân sinh (+15 Hảo cảm gia đình, +10 Karma).
* ⚖️ **Lập Di Chúc Sớm (`2 AP + $1.000`):** Lập di chúc công chứng sớm để **giảm thuế thừa kế của thế hệ sau từ 30% xuống còn 10%**, bảo toàn 90% gia sản truyền thừa!

### 12. Cứu Trợ Thoát Bẫy Nợ & Đồng Hồ Cát Tử Thần (Reaper Suspense Hourglass HUD 70+)
* 🚨 **Tái Cấu Trúc Bẫy Nợ (Debt Restructuring):** Kích hoạt tự động khi âm tiền (`cash < 0`): Vay mềm thân tộc 0% lãi suất (+ $3.000 tiền mặt) hoặc Bán gấp đồ đạc cá nhân (+ $1.200 tiền mặt giải vây khẩn cấp).
* ⏳ **Đồng Hồ Cát Sinh Mệnh (Reaper Suspense Hourglass HUD 70+):** Trực quan hóa tỷ lệ sống thọ theo thời gian thực trên Hero Banner với biểu tượng đồng hồ cát xoay vô hạn và hiệu ứng nhịp tim đập cảnh báo sinh tử.

### 13. Phòng Quyết Định Điện Ảnh 21:9 & Kỹ Xảo 3D Đỉnh Cao
* 🎬 **Chuẩn Điện Ảnh Hollywood 21:9:** Tỷ lệ khung hình Ultra-wide 21:9 anamorphic, viền dải phim đục lỗ 35mm và hiệu ứng tối góc quang học.
* ☀️ **Tia Sáng Thể Tích (Volumetric Sunbeam / God Rays):** Luồng sáng xiên qua cửa sổ với nhịp thở khí quyển biến đổi theo Theme (Obsidian / Sepia / Cyber).
* ✨ **Hạt Bụi Ánh Sáng 3D (Floating Dust Motes):** 35 hạt bụi lơ lửng chuyển động Brownian Motion chân thực trong luồng sáng.
* 🌐 **Holographic Beacon & Hộp Thoại Persona:** Điểm đánh dấu Hotspot 3D phát quang kết hợp hộp thoại Visual Novel Persona Deck và Lăng kính tâm trí Tri-Prism (Lý Trí, Trái Tim, Sinh Tồn).

---

## ⌨️ Bảng Phím Tắt Toàn Cục (Global Hotkeys Cheat-Sheet)

Nhằm tối ưu hóa trải nghiệm điều khiển liên tục và nhập vai mượt mà không cần rê chuột liên tục, LifeGraph trang bị hệ thống phím tắt toàn cục thông minh trên toàn bộ buồng lái:

| Phím Tắt | Chức Năng Chính | Phân Loại | Ngữ Cảnh & Mô Tả Chi Tiết |
| :---: | :--- | :--- | :--- |
| <kbd>Space</kbd> | **Tiếp Tục / Bước Sang Năm Mới** | Điều Khiển Lượt | Tự động kích hoạt lượt thời gian tiếp theo; trong sự kiện Bỏ Qua Thời Gian (*Time Skip*), tự động chọn nhánh tích lũy mặc định. |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> | **Chọn Phương Án 1, 2, 3** | Quyết Định | Kích hoạt lựa chọn ngã rẽ tại Buồng Lái hoặc trong Sân Khấu Tâm Thức (Mind Stage) Phòng 21:9. |
| <kbd>D</kbd> | **Mở / Đóng Phòng Quyết Định 21:9** | Trải Nghiệm | Mở không gian điện ảnh toàn cảnh chuẩn Cinema 21:9 tập trung tuyệt đối vào bước ngoặt định mệnh. |
| <kbd>M</kbd> | **Bật/Tắt Nhạc / Mở Mind Stage 21:9** | Âm Thanh / Nhập Vai | Nhấn tại Buồng Lái = Mute toggle; Nhấn trong Phòng Điện Ảnh 21:9 = Mở Sân Khấu Tâm Thức 3 Bản Ngã. |
| <kbd>J</kbd> | **Mở Sổ Tay Manh Mối (Journal)** | Điều Tra | Bật / Tắt sổ tay manh mối và tri thức thu thập từ nhân vật trong Phòng Quyết Định 21:9. |
| <kbd>?</kbd> hoặc <kbd>/</kbd> | **Mở Cẩm Nang Hướng Dẫn Sinh Tồn** | Trợ Giúp | Truy cập nhanh Bản Đồ Vui Nhộn & Cẩm Nang Tra Cứu RPG (Game Guide Modal). |
| <kbd>K</kbd> | **Bật / Tắt Bảng Phím Tắt Toàn Cục** | Hệ Thống | Hiển thị bảng tra cứu nhanh toàn bộ hotkeys trên buồng lái (Shortcuts Cheatsheet). |
| <kbd>E</kbd> | **Trạm Cứu Hộ Khẩn Cấp (Emergency SOS)** | Sinh Tồn | Mở ngay Trạm Cứu Hộ Khẩn Cấp để hồi phục sinh lực và giải tỏa kiệt sức tức thời. |
| <kbd>Esc</kbd> | **Đóng Hộp Thoại / Thoát Về Buồng Lái** | Điều Hướng | Đóng tức thì modal đang mở; hoặc đóng Mind Stage/thoát Phòng Điện Ảnh 21:9 quay về Cockpit. |

> [!TIP]
> **Cơ chế An Toàn Chống Xung Đột Nhập Liệu (Safe Input & Modal Guarding):**
> * **Bảo Vệ Ô Nhập Liệu:** Khi con trỏ đang nằm trong các ô nhập văn bản (`<input>`, `<textarea>`, `<select>` hoặc phần tử `contenteditable`), toàn bộ phím tắt sẽ tự động tạm ngưng để đảm bảo việc gõ chữ trơn tru (như khi chat với NPC).
> * **Bảo Toàn Phím Tắt Hệ Thống:** Các tổ hợp phím hệ điều hành như `Ctrl + C`, `Alt + Tab`, `Cmd + R` được bảo lưu nguyên vẹn, không bao giờ bị can thiệp.
> * **Khóa An Toàn Khi Modal Mở / Tử Vong:** Các phím điều khiển thời gian và chọn nhánh sẽ tự động khóa an toàn khi nhân vật đã qua đời hoặc khi các hộp thoại modal lớn (Tái sinh, Di chúc, Cây kỹ năng, Minigame) đang hiển thị.
> * Bấm vào biểu tượng bàn phím trên `CommandBarHUD` hoặc gõ <kbd>?</kbd> để mở bảng tra cứu phím tắt bất kỳ lúc nào.

---

## 📂 Cấu Trúc Dự Án Monorepo

```text
Project - LG/
├── backend/                  # Express REST API, Game Loop, AI Master, DB Cache
│   ├── src/
│   │   ├── controllers/      # Điều hướng API Game
│   │   ├── engines/          # AI Game Master, Passive Simulation Loop
│   │   └── services/         # Mini-games, NPC, Skills, Economics
│   ├── server.js             # Entrypoint Backend
│   └── package.json
├── frontend/                 # Next.js 14 App Router, TailwindCSS, Three.js
│   ├── app/                  # UI Routes & Cockpit Layout
│   ├── components/           # 3D Avatar, Ego Cabinet, Fate Dice, Action Hub
│   └── package.json
├── docs/                     # Tài liệu kỹ thuật chi tiết & Hướng dẫn hệ thống
├── .agents/skills/           # Antigravity Sub-agent Skills (full-dev-workflow)
├── start-game.bat            # Script khởi chạy nhanh trên Windows
├── render.yaml               # Cấu hình tự động triển khai Backend Render Cloud
└── README.md                 # Tài liệu tổng quan dự án
```

---

## 📜 Giấy Phép & Bản Quyền
Dự án được bảo hộ và phát triển bởi **David Ngo** ([@davidngo242](https://github.com/davidngo242/lifegraph)).
Mọi quyền được bảo lưu.
