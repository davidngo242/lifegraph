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

## 🏛️ Tính Năng & Kiến Trúc Nổi Bật (Version 7.0)

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

### 5. Cây Kỹ Năng Tam Phân & Hệ Thống Liên Kết Xã Hội (RPG Progression)
* Thăng cấp bậc đời (*Life Level Progression*).
* Cây 3 nhánh kỹ năng: *Trí Tuệ & Chuyên Môn*, *Giao Tiếp & Uy Thế*, *Sức Khỏe & Thể Lực*.
* Hệ thống Social Links gắn kết với bạn bè, đồng nghiệp, người yêu và gia tộc.

### 6. Hệ Thống Mini-Game Đa Trục (Skill - Age - Geo)
* 📈 **Lướt Sóng Chứng Khoán (Stock Trader):** Bắt nến 12s, đồng bộ theo sàn giao dịch địa phương.
* 🤝 **Bàn Tròn Thương Lượng (Negotiation Duel):** Cân bằng Uy Thế và Kiên Nhẫn đối tác để giảm giá tài sản.
* 🚨 **Sinh Tồn Khủng Hoảng (Crisis Survival):** Đếm ngược 15s qua 4 trạm hiểm nguy cứu gia đình và nhu yếu phẩm.
* 🧩 **Rèn Luyện Tuổi Thơ & Hoàng Hôn:** Ươm mầm kiên nhẫn, Mạch logic robot, Nhịp tim ECG, Mảnh ghép ký ức chống Alzheimer.

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
