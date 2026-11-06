# LifeGraph — Quy Chuẩn Thiết Kế Giao Diện & Trải Nghiệm Người Dùng (UI/UX Standards v2.0)

> **Tài liệu quy chuẩn sản phẩm áp dụng cho trò chơi mô phỏng cuộc đời LifeGraph RPG.**  
> Mục tiêu cốt lõi: Đảm bảo tính nhất quán thẩm mỹ, khả năng tiếp cận toàn diện (Accessibility), phản hồi trực giác tức thời và khả năng thân thiện tối đa với mọi đối tượng người chơi — từ trẻ nhỏ 6 tuổi đến game thủ hardcore RPG.

---

## 1. Triết Lý Thiết Kế Trực Quan Hóa (Visual-First & Kid-Friendly Standard)

Giao diện của LifeGraph được xây dựng trên tôn chỉ **"Giảm tối đa gánh nặng đọc hiểu (Zero-Reading Friction)"**. Người chơi mới hoặc trẻ em có thể nắm bắt trạng thái cuộc sống chỉ trong 3 giây thông qua màu sắc, biểu tượng cảm xúc (Emoji/Icons) và đồ họa trực giác.

### 1.1. Chuẩn Hóa 4 Trụ Cột Sinh Mệnh (The 4 Life Pillars)

Mọi biến số trong game được quy về **4 Đồ chơi Sinh mệnh cốt lõi**. Mỗi trụ cột bắt buộc tuân theo bảng chuẩn màu sắc, biểu tượng và ngữ nghĩa sau:

| Trụ Cột Sinh Mệnh | Biểu Tượng | Thang Màu Chủ Đạo | Giới Hạn & Ngưỡng An Toàn | Ý Nghĩa Trực Quan (Ngôn ngữ Trẻ Em) | Hành Động Điều Chỉnh Tương Ứng |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Tia Sét Năng Lượng (AP)** | ⚡ | **Amber (Vàng hổ phách)**<br>`from-amber-950/30`<br>`border-amber-500/40` | 3 – 5 AP/năm.<br>Hết điểm = Hết lượt hành động | *Tia sét sức lực*: Dùng để làm việc, đi chơi, khám bệnh. Thừa sét cuối năm tự biến thành máu! | Đi làm, học tập, dưỡng sinh, giao lưu bạn bè |
| **Trái Tim Khỏe Mạnh (HP)** | ❤️ | **Rose (Hồng ngọc / Đỏ)**<br>`from-rose-950/30`<br>`border-rose-500/40` | 0 – 100%.<br>**Báo động khi < 30%**.<br>Về 0% = Tử vong ngay | *Trái tim đập thình thịch*: Hết tim là ngủm! Nhớ ăn ngon ngủ kỹ và đi bác sĩ kịp thời. | Khám bệnh, nâng cấp nhà ở, nghỉ dưỡng, thể thao |
| **Ngọn Lửa Áp Lực (Burnout)** | 💥 / 🔥 | **Orange (Cam rực lửa)**<br>`from-orange-950/30`<br>`border-orange-500/40` | 0 – 100%.<br>**Báo động khi > 75%**.<br>> 80% = Bắt đầu trừ máu trần | *Ngọn lửa mệt mỏi*: Lửa bốc cao quá là kiệt sức xỉu liền! Cần uống cà phê, thư giãn để dập lửa. | Nghỉ ngơi, du lịch, giảm bớt việc làm thêm |
| **Túi Tiền Tiết Kiệm (Cash)** | 💰 | **Emerald (Xanh lục bảo)**<br>`from-emerald-950/30`<br>`border-emerald-500/40` | $ USD.<br>Âm tiền = Phạt lãi nợ 4.5%/năm & +25% Stress | *Túi tiền đồ chơi*: Đi làm gom tiền mua nhà to, mua đồ chơi và chăm sóc ba mẹ. | Cày việc, đầu tư BĐS/cổ phiếu, tối ưu chi phí |

> [!IMPORTANT]
> **Quy Tắc Nhất Quán Trụ Cột (Pillar Consistency Rule):**
> * Tuyệt đối không hoán đổi màu sắc giữa 4 trụ cột (ví dụ: không dùng màu đỏ cho Năng Lượng hay màu vàng cho Máu).
> * Khi chỉ số ở trạng thái nguy hiểm (Máu < 30% hoặc Lửa > 75%), luôn kích hoạt hiệu ứng đập nhịp tim (`animate-pulse` hoặc `animate-bounce`) để thu hút sự chú ý của người chơi.

---

### 1.2. Chuẩn Hóa Vòng Lặp "3 Bước Chơi Ngay Trong 10 Giây" (3-Step Micro-Loop)

Mọi hướng dẫn người mới đều phải quy về vòng lặp hành vi đơn giản nhất:

```mermaid
flowchart LR
    Step1["⚡ Bước 1: Bấm Chọn 1 Việc Làm<br>(Đi làm kiếm tiền hoặc Tập thể thao)"] --> Step2["⏩ Bước 2: Bấm 'Bước Sang Tuổi Mới'<br>(Nút tím to bự góc phải để lớn lên)"]
    Step2 --> Step3["🌟 Bước 3: Nhận Quà & Điểm May Mắn<br>(Quà sinh nhật, tăng cấp EXP, sống thọ)"]
    Step3 -.->|"Lặp lại mỗi năm"| Step1
```

* **Thiết kế Micro-card 3 bước:**
  * Mỗi bước đặt trong khung thẻ bo góc `rounded-2xl` với biểu tượng kích thước lớn (40x40px).
  * Sử dụng nhãn định danh ngắn: `BƯỚC 1`, `BƯỚC 2`, `BƯỚC 3` bằng font monospace in đậm kèm màu sắc phân biệt (Amber ➔ Purple ➔ Emerald).
  * Lời giải thích dưới 15 chữ, tập trung vào nút bấm cụ thể người chơi cần nhấn.

---

### 1.3. Bộ Flashcard Mẹo Vàng Sinh Tồn (Pro-Tip Visual Flashcards)

Các bài học kinh nghiệm sinh tồn được trình bày theo dạng thẻ bỏ túi (Flashcard) trực quan với 4 biểu tượng cuộc sống:
1. 🏡 **Nâng Cấp Chỗ Ở:** Đổi phòng trọ lên chung cư/biệt thự để ngủ ngon và ít ốm vặt.
2. ☕ **Thư Giãn Đúng Lúc:** Thấy ngọn lửa đỏ > 80% là phải dừng cày cuốc, đi dưỡng sinh ngay.
3. 🤝 **Kết Thân Bạn Bè:** Tương tác với người thân và quý nhân để được cứu nguy khi hoạn nạn.
4. 👶 **Sinh Con Nối Dõi:** Sinh con và lập quỹ tín thác để con cháu tiếp tục cơ nghiệp kiếp sau.

---

## 2. Kiến Trúc Trải Nghiệm Kép (Dual-Mode UX Architecture)

Để phục vụ hài hòa cả người chơi đại chúng/trẻ em lẫn những người chơi RPG chuyên sâu muốn tính toán chi li chỉ số (min-maxers), LifeGraph áp dụng **Kiến Trúc Trải Nghiệm Kép (Dual-Mode UX)** trong hệ thống hướng dẫn và giao diện quản lý.

```mermaid
stateDiagram-v2
    [*] --> GameGuideModal
    state GameGuideModal {
        [*] --> FunMode: Mặc định (Bé 6 tuổi cũng hiểu)
        FunMode --> AdvancedMode: Bấm "📖 RPG Nâng Cao"
        AdvancedMode --> FunMode: Bấm "🧸 Bản Đồ Vui Nhộn"
        
        state FunMode {
            Pillars: 4 Trụ Cột Sinh Mệnh (AP, HP, Burnout, Cash)
            Loop: 3 Bước Chơi Ngay Trong 10 Giây
            Tips: 4 Bí Quyết Dễ Ẹc
        }
        
        state AdvancedMode {
            SkillTree: 🌳 Cây Kỹ Năng 3 Nhánh (Wealth, Social, Sage)
            NPCs: 👥 Nhân Mạch 4 Quý Nhân Đồng Hành
            Economy: 📈 Đầu Tư, Dòng Tiền & Lãi Nợ Âm
            Stages: ⏳ 5 Giai Đoạn Đời Người
        }
    }
```

### 2.1. Phân Tách Hai Chế Độ Trải Nghiệm

| Tiêu Chí | Chế Độ 1: 🧸 Bản Đồ Vui Nhộn (Fun Mode) | Chế Độ 2: 📖 Cẩm Nang Tra Cứu RPG (Advanced Mode) |
| :--- | :--- | :--- |
| **Đối Tượng Mục Tiêu** | Trẻ em (6+), người mới chơi lần đầu, người chơi giải trí casual | Game thủ RPG, người thích tính toán tối ưu tài chính, cày cấp |
| **Khối Lượng Chữ** | Cực ngắn (micro-copy < 2 dòng/thẻ), ưu tiên hình vẽ và emoji | Đầy đủ thông số kỹ thuật, tỷ lệ %, chi phí SP, công thức tính |
| **Bố Cục Trình Bày** | Grid thẻ card lớn `rounded-3xl`, viền màu nổi bật, nút bấm to bự | Tab điều hướng đa tầng, danh sách chỉ số, bảng phân cấp Tier |
| **Thuật Ngữ Sử Dụng** | Đời thường: "Tia sét", "Trái tim", "Lửa mệt mỏi", "Túi tiền" | Thuật ngữ RPG: "Action Points", "Affinity Cấp 3", "Lãi phạt", "Karma" |

### 2.2. Quy Chuẩn Nút Chuyển Đổi Chế Độ (Mode Switcher Toggle)
* **Vị trí:** Luôn nằm tại vị trí trang trọng ở Header bên cạnh tiêu đề modal.
* **Hình thức:** Container dạng viên thuốc viền kép (`bg-slate-950/80 p-1 rounded-2xl border border-slate-800`).
* **Trạng thái Active:** Áp dụng hiệu ứng Gradient rực rỡ (`amber-to-rose` cho Fun Mode, `purple-to-indigo` cho Advanced Mode) kèm đổ bóng màu đặc trưng (`shadow-md shadow-rose-500/30`).
* **Hiệu ứng chuyển cảnh:** Nội dung body chuyển đổi mượt mà với lớp animation `animate-in fade-in duration-200`.

---

## 3. Hệ Thống Thanh Lệnh HUD & Trạng Thái Nguy Cấp (CommandBarHUD & Emergency SOS)

Thanh công cụ `CommandBarHUD` đóng vai trò là bảng điều khiển gắn cố định (Sticky Cockpit Bar) trên buồng lái, giúp người chơi phản xạ nhanh mà không che khuất màn hình chơi.

### 3.1. Bố Cục Phân Vùng Lệnh (Command Bar Layout)

```text
+----------------------------------------------------------------------------------------------------+
| [👁️ Xem Nhanh] [🎬 Cinema D]  |  [⌨️ Phím Tắt: 1 2 3 | Space | ?]  |  [🚨 CẤP CỨU KHẨN CẤP (HP 20%)] |
|        (Trái: Góc Nhìn)        |        (Giữa: Hotkey Badges)       |       (Phải: Cảnh Báo Sinh Tử)     |
+----------------------------------------------------------------------------------------------------+
```

* **Vị trí:** Cố định bên dưới thanh Navigation chính: `sticky top-[53px] z-40`.
* **Hiệu ứng nền:** Thủy tinh mờ `bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80`.
* **Chiều cao:** Tối ưu mỏng nhẹ (40–44px) để bảo toàn diện tích hiển thị sân khấu 3D.

---

### 3.2. Quy Chuẩn Cảnh Báo Sinh Mệnh & Cấp Cứu Khẩn Cấp (Emergency SOS)

Hệ thống liên tục giám sát hai ngưỡng sinh tử của nhân vật:

$$\text{Trạng thái Nguy Cấp} \iff (\text{Vitality} < 30\%) \lor (\text{Burnout} > 75\%)$$

Khi thỏa mãn điều kiện nguy cấp:
1. **Nút SOS Cấp Cứu Khẩn Cấp tự động xuất hiện** ở góc phải thanh HUD:
   * Nền Gradient cảnh báo: `bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600`.
   * Hiệu ứng đập nhịp tim: `animate-pulse` toàn nút và `animate-bounce` trên biểu tượng `<HeartPulse />`.
   * Badge hiển thị chỉ số nguy kịch: `[HP 24%]` hoặc `[Burnout 82%]`.
2. **Nguyên tắc "Cảnh báo đi kèm Hành động (Actionable Alarm)":**
   * Tuyệt đối không chỉ hiển thị chữ cảnh báo tĩnh gây hoang mang.
   * Khi bấm vào nút SOS, lập tức mở hộp thoại cứu trợ sinh mạng với 2 đường thoát cụ thể:
     * **Phương án 1 (Khi còn AP):** Dưỡng Sinh Phục Hồi Toàn Diện (Tốn 1 AP, giảm ngay 40% Stress & hồi 25 HP).
     * **Phương án 2 (Khi cạn sạch 0 AP):** Thỉnh Phước Bảo Mạng tại Đền Thờ Nghiệp Quả Karma (Đổi điểm tích đức tiền kiếp để bảo toàn tính mạng).

---

## 4. Chuẩn Mực Phím Tắt Toàn Cục & Tiếp Cận Bàn Phím (Global Hotkeys & Accessibility)

Nhằm mang lại trải nghiệm điều khiển liên tục (Flow State) như các tựa game RPG kinh điển, LifeGraph thiết lập chuẩn phím tắt toàn cục 1 chạm:

### 4.1. Bảng Quy Chuẩn Phím Tắt Cốt Lõi

| Phím Tắt | Phân Loại | Màu Sắc Badge `<kbd>` | Hành Động Kích Hoạt |
| :---: | :--- | :--- | :--- |
| <kbd>Space</kbd> | Điều Khiển Lượt | `border-emerald-500/40 text-emerald-300 bg-emerald-500/10` | Bước sang năm tiếp theo / Xác nhận tiến trình nhanh |
| <kbd>1</kbd> | Quyết Định Lựa Chọn | `border-amber-500/40 text-amber-300 bg-amber-500/10` | Chọn nhanh Lựa chọn 1 trong Ngã rẽ / Đối thoại / Nghỉ ngơi |
| <kbd>2</kbd> | Quyết Định Lựa Chọn | `border-amber-500/40 text-amber-300 bg-amber-500/10` | Chọn nhanh Lựa chọn 2 trong Ngã rẽ / Đối thoại / Nghỉ ngơi |
| <kbd>3</kbd> | Quyết Định Lựa Chọn | `border-amber-500/40 text-amber-300 bg-amber-500/10` | Chọn nhanh Lựa chọn 3 trong Tam giác nghịch lý Trilemma |
| <kbd>D</kbd> | Trải Nghiệm Không Gian | `border-purple-500/40 text-purple-300 bg-purple-500/10` | Mở/Đóng Phòng Quyết Định Điện Ảnh tỉ lệ 21:9 Cinema |
| <kbd>M</kbd> | Âm Thanh Không Gian | `border-cyan-500/40 text-cyan-300 bg-cyan-500/10` | Bật / Tắt nhanh âm thanh nền (Mute Toggle) |
| <kbd>?</kbd> / <kbd>/</kbd> | Cẩm Nang Trợ Giúp | `border-indigo-500/40 text-indigo-300 bg-indigo-500/10` | Bật nhanh Sổ tay hướng dẫn Dual-Mode Guide |

---

### 4.2. Cơ Chế Cách Ly Nhập Liệu An Toàn (Safe Context-Guarding)

Để tránh hiện tượng kích hoạt phím ngoài ý muốn, hệ thống tuân thủ nghiêm ngặt 3 lớp bảo vệ (Guarding Layers):

1. **Lớp 1 — Input Isolation:** Tự động bỏ qua mọi Hotkey khi con trỏ đang nằm trong `<input>`, `<textarea>`, `<select>` hoặc phần tử mang thuộc tính `contenteditable` (ví dụ: khi người chơi gõ văn bản trò chuyện trực tiếp với AI NPC).
2. **Lớp 2 — Modal & Death Guarding:** Khóa toàn bộ các phím điều khiển thời gian (<kbd>Space</kbd>) và phím chọn nhánh (<kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>) khi nhân vật đã qua đời (`character.is_deceased === true`) hoặc khi một trong các hộp thoại lớn đang mở (Tái sinh, Kỹ năng, Gia phả, Minigame, Cấp cứu...).
3. **Lớp 3 — OS System Keys Preservation:** Không bao giờ can thiệp (`e.preventDefault()`) vào các tổ hợp phím hệ thống như <kbd>Ctrl</kbd> + <kbd>C</kbd>, <kbd>Alt</kbd> + <kbd>Tab</kbd>, <kbd>Cmd</kbd> + <kbd>R</kbd>, <kbd>F11</kbd>, <kbd>F12</kbd>.

---

### 4.3. Hiển Thị Nhãn Gợi Ý Phím Tắt Trực Quan (Interactive Key Hints)

* Trên các nút bấm có hỗ trợ phím tắt (nút Năm Mới, các nút lựa chọn phương án A/B/C, nút Phòng Điện Ảnh), bắt buộc đính kèm thẻ `<kbd>` nhỏ ở góc phải nút:
  * Ví dụ: `[1]`, `[2]`, `[3]`, `[Space]`, `[D]`.
  * Thẻ `<kbd>` sử dụng font `font-mono text-[10px] font-bold`, có viền nổi nhẹ và màu đồng điệu với nhóm chức năng.
  * Việc này giúp người chơi tự nhiên ghi nhớ phím tắt trong quá trình trải nghiệm mà không cần phải chủ động mở sổ tay tra cứu.

---

## 5. Quy Chuẩn Typography & Kiểu Chữ

* **Phông chữ chủ đạo:** Sử dụng họ phông **Inter** hỗ trợ đầy đủ bộ ký tự tiếng Việt Unicode dựng sẵn; phông `system-ui, sans-serif` làm dự phòng. Chỉ nạp 1 họ phông với trọng số (font-weight) 400, 600, 700, 800 và thuộc tính `font-display: swap`.
* **Thang cỡ chữ (Type Scale):**
  * **Văn bản nội dung chính:** 14px – 16px (tuyệt đối không dùng cỡ dưới 12px cho văn bản người chơi cần đọc).
  * **Nhãn phụ & Chú thích (Captions / Badges):** 11px – 12px font medium/bold.
  * **Tiêu đề phân khu (Section Titles):** 18px – 22px font bold/extrabold.
  * **Tiêu đề màn hình (Hero Headings):** 24px – 32px font black.
* **Chiều cao dòng (Line-height):** Đặt từ `1.5` đến `1.7` cho đoạn văn bản để đảm bảo không bị dính dấu tiếng Việt (huyền, sắc, hỏi, ngã, nặng) vào hàng trên.
* **Định dạng số liệu:** Toàn bộ số liệu tiền tệ ($ USD), chỉ số sinh mệnh (HP, AP, Stress), năm tuổi và tỷ lệ % bắt buộc dùng phông có thuộc tính `tabular-nums` để số không bị nhảy giật khi tăng giảm.

---

## 6. Bố Cục, Khoảng Cách & Thang Màu (Layout & Color System)

* **Hệ thống khoảng cách (Spacing System):** Tuân thủ bội số 4px của Tailwind CSS: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`.
* **Bo góc (Border Radius):**
  * Thẻ Card và Hộp thoại lớn: `rounded-3xl` (24px) tạo cảm giác hiện đại, thân thiện.
  * Nút bấm và Thẻ phụ: `rounded-2xl` (16px) hoặc `rounded-xl` (12px).
  * Badge và Kbd tags: `rounded-lg` hoặc `rounded-full`.
* **Độ tương phản màu sắc (WCAG AA Accessibility):**
  * Độ tương phản giữa chữ và nền đạt tối thiểu **4.5:1** cho cỡ chữ thông thường và **3:1** cho chữ lớn.
  * Nền tối chủ đạo: `bg-slate-950` (#020617) kết hợp các lớp panel `bg-slate-900/80` và viền `border-slate-800/80`.
* **Thiết kế thích ứng Di động (Mobile Optimization):**
  * Tự động chuyển đổi layout từ nhiều cột sang cột đơn trên màn hình nhỏ (`< 640px`).
  * Vùng chạm cảm ứng (Touch Target) của mọi nút bấm tối thiểu **44x44px** để tránh bấm nhầm trên màn hình cảm ứng.
  * Ô nhập liệu luôn duy trì `font-size: 16px` trên mobile để ngăn trình duyệt tự động zoom màn hình ngoài ý muốn.

---

## 7. Văn Phong & Ngôn Ngữ Trải Nghiệm (Tone of Voice & Copywriting)

* **Văn phong gần gũi, giàu cảm xúc và hành động:** Sử dụng tiếng Việt chuẩn mực, súc tích. Mỗi lựa chọn đều nêu rõ cái giá phải trả và cơ hội mở ra (Ví dụ: *"Dưỡng sinh phục hồi (-1 AP, +25 Máu)"* thay vì chỉ ghi *"Nghỉ ngơi"*).
* **Tuyệt đối tránh thuật ngữ nội bộ:** Không đưa các từ ngữ dev/engineering vào giao diện người chơi (ví dụ: không dùng *"Cockpit View"*, *"State Machine"*, *"Backend API"*; thay bằng *"Buồng Lái Kiếp Sống"*, *"Quy Luật Sinh Mệnh"*, *"Máy Chủ Trò Chơi"*).
* **Thông báo lỗi mang tính hướng dẫn:** Khi xảy ra lỗi hoặc thiếu tài nguyên, câu thông báo phải chỉ ra giải pháp (Ví dụ: *"Bạn đã cạn sạch Tia Sét Năng Lượng! Hãy bấm Sang Tuổi Mới hoặc dùng Trợ Giúp để hồi sức."*).

---

## 8. Danh Mục Kiểm Tra Trước Phát Hành (Pre-Release UI/UX Checklist)

Mọi cập nhật giao diện trước khi xuất bản lên môi trường Production bắt buộc phải vượt qua danh mục kiểm tra:

- [ ] **Type check & Build:** Lệnh `npm run build` trên thư mục `frontend/` hoàn thành 100% không cảnh báo lỗi type.
- [ ] **Kiểm tra cỡ chữ tối thiểu:** Không có đoạn văn bản đọc hiểu nào dưới 12px.
- [ ] **Kiểm tra Responsive:** Kiểm tra hiển thị chuẩn trên 3 kích thước: Mobile (375px), Tablet (768px), Desktop (1440px+).
- [ ] **Kiểm tra Dual-Mode UX:** Chuyển đổi qua lại giữa *Bản Đồ Vui Nhộn* và *Cẩm Nang RPG* mượt mà, không bị tràn khung hay mất dữ liệu.
- [ ] **Kiểm tra Ngưỡng Cấp Cứu SOS:** Đổi chỉ số Máu xuống < 30% hoặc Kiệt Sức lên > 75%, nút SOS nhấp nháy xuất hiện chính xác trên thanh HUD.
- [ ] **Kiểm tra Cách Ly Phím Tắt (Context Guarding):** Nhấp chuột vào ô chat NPC hoặc ô nhập văn bản và gõ các phím `1`, `2`, `3`, `Space`, `D` — đảm bảo chỉ gõ chữ vào ô nhập mà không làm nhảy năm hay kích hoạt ngã rẽ.
- [ ] **Kiểm tra Giảm Chuyển Động (Reduced Motion):** Khi hệ điều hành bật `prefers-reduced-motion`, các hiệu ứng rung lắc/nhấp nháy tự động chuyển sang trạng thái tĩnh.