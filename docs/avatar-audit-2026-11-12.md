# Rà soát avatar 3D nhân vật — 2026-11-12

Ảnh: `docs/design-assets/avatar-audit-2026-11-12.png` (10 ca: tuổi 0–85, nam/nữ, 8 quốc tịch). Avatar dựng bằng code (three.js) trong `Dynamic3DAvatar.tsx`.

## Vấn đề (xếp theo mức ảnh hưởng)
1. **Mọi nhân vật cùng một khuôn.** Tuổi 4, 10, 16, 25, 40, 52 gần như cùng tỷ lệ và kiểu mặt. Tuổi chỉ đổi màu tóc; không có khác biệt thiếu nhi / người lớn / người già (chiều cao, tỷ lệ đầu, dáng).
2. **Nam và nữ khó phân biệt.** Cùng kiểu tóc bob và khuôn mặt; chỉ khác màu áo hoặc váy.
3. **Tóc như chiếc mũ khối cứng.** Chóp tóc đen bóng xanh, mất chi tiết; tai bị che; chỉ có một kiểu tóc.
4. **Hai tấm kính trong suốt (xanh, vàng) cạnh vai** cắt vào đầu và tay, nhìn như lỗi hiển thị.
5. **Mặt thiếu sức sống.** Lông mày dày tối tạo vẻ cau có, miệng nhỏ, không đổi biểu cảm theo tuổi hay trạng thái.
6. **Màu da xám nhợt** ở nhiều quốc tịch (Việt Nam, Ba Lan); ánh sáng phẳng, thiếu ấm áp.
7. **Em bé (tuổi 0)** là thân hình ống không tay; mũ trùm dễ nhầm với tóc.
8. **Trang phục đơn điệu**, không phản ánh nghề nghiệp, tài sản, level (trait kính ở tuổi 40 không thấy; net worth cao không đổi trang phục).
9. **Bệ dưới bục** bị khung cắt cụt ở đáy; khoảng trống phía trên khung lớn ở nhân vật nhỏ.

## Hướng nâng cấp
- A. Nâng cấp mô hình dựng bằng code: nhiều kiểu tóc theo giới và tuổi, tỷ lệ cơ thể theo tuổi, gỡ tấm kính, mặt biểu cảm, da ấm, ánh sáng 3 điểm, trang phục theo nghề và tài sản. Không thêm asset, nhẹ.
- B. Thay bằng mô hình GLB/VRM dựng sẵn: đẹp nhất nhưng cần asset có giấy phép, tải nặng hơn, làm lại phần tuỳ biến.
- C. Avatar minh hoạ 2D theo lớp (layered): nhẹ nhất, mất hiệu ứng 360°.
