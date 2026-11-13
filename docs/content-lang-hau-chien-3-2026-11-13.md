# Làng Hậu Chiến, Đợt 5 lô 3: 12 mẩu truyện tuổi 20-50 (2026-11-13)

Pack `backend/src/content/packs/pack_lang_hau_chien_3.json`, id `lhc3_*`, era `lang_hau_chien`, 3 lựa chọn mỗi mẩu. Ký hiệu: 🔒 = có lựa chọn không quay đầu; [ấm] = nhẹ/ấm. Tên NPC dùng `{mentor} {rival} {love} {creditor_or_benefactor} {friend} {family}` (11/12 mẩu).

| # | Tên | Tuổi | Điều kiện | Một dòng |
|---|---|---|---|---|
| 1 | Chuyến Xe Đò Cuối Ngày 🔒 | 20-26 | - | Đi hay ở: chuyến xe duy nhất mỗi ngày. Đóng `l3_o_lai_lang` hoặc `l3_roi_lang` |
| 2 | Mâm Cơm Tết Người Đi Xa | 27-45 | doors_open `l3_roi_lang` | Về quê như khách |
| 3 | Thư Bạn Gửi Từ Thành Phố | 27-45 | doors_open `l3_o_lai_lang` | Cặp với #2: người ở nhận thư người đi |
| 4 | Mâm Trầu Cau Đặt Trước Sân [ấm] | 22-34 | love nhớ đã_hoà_giải | Cưới: bán đàn lợn hay hoãn |
| 5 | Bà Mối Gõ Cửa 🔒 | 22-35 | love nhớ bị_bỏ_lại | Cặp với #4: lấy người khác hay chạy theo người cũ |
| 6 | Đứa Con Gói Sách Vào Bao Ni-lông [ấm] | 30-46 | doors_closed `l3_roi_lang`, family_state | Con trúng tuyển trường huyện |
| 7 | Chủ Nợ Ngồi Lì Ở Hiên 🔒 | 24-40 | family_state no_nan | Ký cầm nhà, làm công, hay lánh đi |
| 8 | Ngày Tờ Cầm Nhà Hết Hạn 🔒 | 30-50 | doors_open `l3_ky_cam_nha` | Mất nhà, ở thuê, hay cầm thêm ruộng |
| 9 | Lời Cuối Của Người Giữ Bí Mật (đã biết) 🔒 | 30-48 | fate_thread cha_giau_no, doors_open `biết_chuyện_nợ` | Nhận lỗi công khai, đền âm thầm, hay thả còi tàu xuống sông |
| 10 | Lời Cuối Của Người Giữ Bí Mật (chưa biết) | 30-48 | fate_thread cha_giau_no | Cặp với #9: lần đầu nghe sự thật |
| 11 | Chiếc Xe Cub Của Ông Trưởng Thôn Mới | 34-50 | doors_closed `l3_roi_lang`, rival, family_state danh_gia/binh_thuong | Địch thủ lên chức mời làm tổ trưởng |
| 12 | Người Bạn Đứng Ở Cổng Lúc Nửa Đêm | 30-50 | friend | Bạn thua trắng xin ngủ nhờ |

Cặp/biến thể cùng một khoảnh khắc: (2,3) theo cửa, (4,5) theo ký ức người thương, (9,10) theo ký ức/cửa. Cửa mới `l3_*`: `l3_roi_lang`, `l3_o_lai_lang`, `l3_duyen_cu`, `l3_nha_vo_giau`, `l3_nha_yen`, `l3_ky_cam_nha`, `l3_mat_nha`, `l3_giu_kin`, `l3_da_nhan_loi`; dùng thêm `biết_chuyện_nợ` của gói 1. `l3_roi_lang` có `persist_doors`. Hiệu ứng chỉ dùng cash/vitality/burnout/karma, cỡ như gói 1.

Kiểm thử: `backend/test/content_lang_hau_chien_3.test.js`. `scenario.test.js` đang fail duy nhất ở số ca cứng (11640, thực tế 15960) do thêm 12 mẩu; đợi engine agent đổi.
