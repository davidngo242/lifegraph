# Pack lang_hau_chien_5 (2026-11-13)

## Nội dung
20 mẩu mới `lhc5_*`, era `lang_hau_chien`, cấu trúc/khóa chỉ số/placeholder giống pack 1-4. Mọi mẩu có điều kiện (family_state, fate_thread, requires_npc [+memory_has], doors). Cửa sổ tuổi 7-9 năm.

| Nhóm | Tuổi | Mẩu |
|---|---|---|
| 38-49 (7) | 38-49 | so_no_cuoi_nam (no_nan), sinh_le_con_gai / mam_co_con_gai (cặp), mai_nha_nguoi_khac (cửa l3_mat_nha), con_ho_dau_tien (tai_nang_yeu_menh), ve_dinh_lang_nguoi_di / nguoi_o_lai_don_nguoi_ve (cặp, cửa l2_roi_lang / l2_o_lai_lang) |
| 66-77 (7) | 66-77 | lang_doi_nguoi_o_lai / lang_doi_nguoi_tro_ve (cặp, cửa l3_o_lai_lang / l3_roi_lang), thua_ruong_cho_ai, ghe_trong_quan_nuoc (friend `giữ_liên_lạc`), chau_o_xa_goi_dien (family `được_ở_lại_cùng`), dong_ho_qua_bo (di_san_bi_mat), dieu_giu_kin (cửa l3_giu_kin) |
| 76-90 (6) | 76-90 | giuong_benh_dong_nguoi / giuong_benh_mot_minh (cặp, family_state rời nhau), loi_chua_noi_den_cuoi (love `bị_bỏ_chờ`), vu_gat_tri_nho (cha_giau_no), ten_tren_bang_nha_van_hoa (mentor `tin_cậy`), chum_chia_khoa_nha |

- 4 cặp biến thể loại trừ nhau (cùng `group`): family_state rời nhau hoặc doors_open rời nhau.
- 3 lựa chọn không đảo ngược: mua lại nhà cũ, giao cả ruộng cho một con, trả đồng hồ quả bồ. Cửa mới tiền tố `l5_` (dùng làm nhãn/ghi nhận, chưa mẩu nào đòi).
- Khoảng 1/4 nhẹ/ấm: cưới con gái (mâm cỗ), về đình, ghế quán nước, cháu gọi điện, giường bệnh đông người.

## Số đo (300 đời, `--policy random`)
| | Trước | Sau |
|---|---|---|
| Jaccard | 43.1% | 41.5% |
| Cùng mẩu cùng tuổi | 57.4% | 58.6% |
| Mẩu/đời | 25.8 | 31.2 |
| Mẩu/thập niên min/mean 40s | 0/0.4 | 1/1.6 |
| 60s | 1/1.5 | 1/2.9 |
| 70s | 0/0.0 | 1/2.3 |
| 80s | 0/0.0 | 0/0.4 |
| Mẩu gặp <40% đời | 50% (30/60) | 53% (41/77) |

Ghi chú: thập niên trống đã có mẩu (mean 70s 0 -> 2.3). Jaccard giảm nhẹ; cùng-tuổi không giảm vì mẩu mới thêm vào các tuổi đã có ứng viên chung, cần thêm biến thể ở 10s-30s để hạ.

## Test
`backend/test/content_lang_hau_chien_5.test.js`. Toàn bộ `npm test` 143 pass / 1 skip / 0 fail; `check_stat_writes --strict` = 0.
