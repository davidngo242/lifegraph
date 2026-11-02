# 🧠 LifeGraph — Driven Life Simulation RPG

> Game sinh tồn quản lý rủi ro và nguồn lực đa mô-đun với AI Game Master theo thời gian thực.

---

## 🚀 Khởi Chạy Nhanh (Local Links)

### Bước 1: Khởi động Backend
Mở Terminal 1:
```bash
cd backend
npm start
```
- 👉 **Backend API:** [http://localhost:3001](http://localhost:3001)
- 👉 **Kiểm tra kết nối (Diagnostics):** [http://localhost:3001/api/game/diagnostic](http://localhost:3001/api/game/diagnostic)

### Bước 2: Khởi động Frontend
Mở Terminal 2:
```bash
cd frontend
npm run dev
```
- 👉 **Giao diện trò chơi (Frontend):** [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Cấu Hình Môi Trường (Environment Variables)

### Backend (`backend/.env`)
```ini
PORT=3001
CORS_ORIGIN=*

# PostgreSQL (Tùy chọn: Nếu để trống, hệ thống tự động kích hoạt In-Memory Simulation DB)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/lifegraph

# Gemini API (Tùy chọn: Nếu để trống, hệ thống sử dụng Built-in Procedural AI Engine)
# GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### Frontend (`frontend/.env.local`)
```ini
# Proxy trực tiếp qua Next.js Rewrite đến cổng 3001 (không lo lỗi CORS)
NEXT_PUBLIC_API_URL=/api/game
```

---

## 🏛️ Kiến Trúc Hệ Thống

1. **Passive Phase (Engine):** Trừ phí duy trì tài sản, phụ thuộc gia đình, tính dao động thị trường vĩ mô (-4% đến +6%). Tự động tăng `burnout` khi `cash < 0`.
2. **Prompt Compiler:** Gom toàn bộ State (Tuổi, Chỉ số, Cờ ẩn, Lịch sử) thành một System Prompt chuẩn mực.
3. **AI Game Master:** Kết nối trực tiếp Gemini API (hoặc procedural engine) tạo Dilemma có tính nhân quả từ quá khứ, xuất JSON chuẩn (title, narrative, options kèm risk %).
4. **Shadow DB:** Lưu cache kết quả vào `tick_events`.
5. **UI/UX Dark Mode:** Nền `bg-slate-950`, 2 cột (Thẻ bài sự kiện & Nhật ký cuộc đời). Hiệu ứng rung lắc toàn màn hình khi `burnout > 80`.
6. **BigData Tài Sản & Nơi Cư Trú Địa Phương:** Phân tầng 5 cấp vốn, bản địa hóa theo quốc tịch và thành phố sinh sống (Warsaw, Tokyo, Hà Nội, Damascus...). Lộ trình nâng cấp nhà ở 5 cấp.
7. **Hệ Thống Mini-Game 3 Trục (Skill - Age - Geo):**
   - *Lướt Sóng Sàn Chứng Khoán (Stock Trader):* Bắt nến 12s, đồng bộ theo sàn giao dịch địa phương.
   - *Bàn Tròn Thương Lượng (Negotiation Duel):* Cân bằng Uy Thế và Kiên Nhẫn đối tác để giảm giá nhà đất và nhận hoa hồng.
   - *Sinh Tồn Vượt Khủng Hoảng (Survival Crisis):* Đếm ngược 15s qua 4 trạm hiểm nguy cứu gia đình và nhu yếu phẩm.
   - *Rèn Luyện Tuổi Thơ & Hoàng Hôn:* Ươm mầm kiên nhẫn, Mạch logic robot, Nhịp tim ECG, Mảnh ghép ký ức chống Alzheimer.
