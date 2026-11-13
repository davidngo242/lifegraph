# Làng Hậu Chiến, Đợt 5 lô 2: 12 mẩu truyện tuổi 0-20 (2026-11-13)

Pack `backend/src/content/packs/pack_lang_hau_chien_2.json` (pack_id `pack_lang_hau_chien_2`, id mẩu `lhc2_`, id lựa chọn `LHC2_nnX`). Era `lang_hau_chien` ở cả 12 mẩu, mỗi mẩu 3 lựa chọn, giọng và cỡ hiệu ứng như lô 1. 🔒 = có lựa chọn không quay đầu.

| # | Tên | Tuổi | Điều kiện | Một dòng |
|---|---|---|---|---|
| 1 | Nồi Cơm Độn Khoai | 4-8 | family_state: no_nan | Người thân nhường bát đầy, bạn nhận hay trả. |
| 2 | Chiếc Áo Ngày Tết [nhẹ] | 5-9 | family_state: danh_gia, binh_thuong | Bạn có áo mới, đứa bạn đứng ngoài ngõ trong áo vá. |
| 3 | Tờ Giấy Họp Phụ Huynh | 6-10 | family_state: con_nuoi, cha_me_ly_tan | Tờ giấy mời, bạn có đưa người nuôi đi họp không. |
| 4 | Bài Kiểm Tra Lén Nhìn | 9-13 | rival nhớ bị_khinh | Kẻ từng bị bạn cười cố tình để lộ đáp án. |
| 5 | Bài Kiểm Tra Lén Nhìn | 9-13 | rival nhớ được_giúp_đỡ | Người từng được bạn giúp ném mẩu giấy đáp án. |
| 6 | Nửa Câu Chuyện Còn Lại 🔒 | 14-19 | cửa mở `biết_chuyện_nợ` (sau thư ông Tám, lô 1) | Chiếc hộp gỗ: nghe hết chuyện nợ máu hay cất đi. |
| 7 | Ngọn Đèn Học Muộn [ấm] | 8-12 | mentor | Chai dầu không tên đặt trên bàn học. |
| 8 | Gánh Hàng Đầu Tiên | 13-17 | mentor nhớ tin_cậy | Phiên chợ đầu, giữ cân đúng hay bớt cân. |
| 9 | Gánh Hàng Đầu Tiên | 13-17 | mentor nhớ bị_phản_bội | Cùng phiên chợ, nhưng người dìu dắt chỉ nhìn cái cân. |
| 10 | Mẩu Giấy Dưới Bậu Cửa [ấm] | 15-19 | love | Lời hẹn dưới gốc bàng, đi hay lánh. |
| 11 | Chuyến Đò Cuối Mùa 🔒 | 17-20 | love; cửa `l2_roi_lang`, `l2_o_lai_lang` còn chưa đóng | Đi cùng người thương lên thành phố hay ở lại với mẹ. |
| 12 | Chiếc Khăn Của Người Bạn 🔒 | 14-20 | friend; cửa `l2_loi_hua_ban` chưa mở | Bạn chết đuối, để lại tờ hẹn dang dở. |

## Cánh cửa
- Mẩu 11, lựa chọn A: đóng `l2_o_lai_lang`, mở `l2_roi_lang`. Lựa chọn B ngược lại. Hai cánh loại trừ nhau và chặn mẩu lặp lại.
- Mẩu 12, lựa chọn A: đóng `l2_vo_tu`, mở `l2_loi_hua_ban`.
- Mẩu 6, lựa chọn A: đóng `l2_ngay_thang_yen_binh`, mở `l2_mang_no_cha`.
- Ngoài ra chỉ dùng cửa `biết_chuyện_nợ` của lô 1.

## Ghi chú
- Cặp biến thể theo ký ức NPC: (4, 5) nhóm `bai_thi`, (8, 9) nhóm `viec_dau_tien`.
- Tên NPC dùng `{mentor} {rival} {love} {friend} {family}` ở 11/12 mẩu, chờ engine thay tên.
- `family_state`, `doors_open`, `doors_closed` là điều kiện mới do engine lô song song hỗ trợ.
- Test hard-code số ca trong `scenario.test.js` (11.640) sẽ lệch tới khi engine merge: đây là lỗi duy nhất của `npm test`.
