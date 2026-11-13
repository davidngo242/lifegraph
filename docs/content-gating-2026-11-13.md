# Content gating (2026-11-13)

## Thay đổi
- Era: `era.json` đánh dấu `any` là `drawable:false`; `drawLifeSeed` bỏ qua giá trị này. Đời mới luôn `lang_hau_chien`; nhân vật legacy (không có life_seed) vẫn là `any`. Birth RNG đổi tổng trọng số => `UPDATE_GOLDEN=1` đã chạy, golden_lives.json không đổi byte nào.
- 26 mẩu gần-phổ-quát trong pack lhc1-4 được thêm `prerequisites.family_state` (mảng, 37-62% đời) hoặc `fate_thread` (20-40%). Không sửa lời văn, không thêm mẩu. `temperament` chưa là điều kiện của engine nên không dùng. Không có biến thể mới; cặp loại trừ sẵn có (tết đi/ở, cầu hôn, bữa cơm khách) giữ nguyên. Mẩu `artisan_trial` giữ nguyên (test legacy cần).
- Test: `api.test.js` journey dùng nhân vật legacy (`life_seed:null`); `emergent_life.test.js` kỳ vọng không còn era `any`.
- `tools/life_diversity.mjs`: thêm số mẩu/thập niên (min/mean), % mẩu >=90% / <40%, `--ages`.

## Số đo (300 đời, --policy random)
| | Trước | Sau |
|---|---|---|
| Jaccard (tất cả) | 53.6% | 43.1% |
| Jaccard (lhc) | 73.7% | 43.1% |
| Cùng mẩu cùng tuổi | 46.0% | 57.4% |
| Mẩu top | 3.2% | 3.9% |
| Mẩu gặp >=90% đời | 10% (6/61) | 12% (7/60) |
| Mẩu gặp <40% đời | 39% (24/61) | 50% (30/60) |
| Mẩu/đời | 40 (lhc) / 7 (any) | 25.8 |
| Min mẩu/thập niên 0s..80s | 0,1,1,1,0,1,0,0,0 | 5,2,2,1,0,2,1,0,0 |

## Hạn chế
- Jaccard còn 43% (mục tiêu <40%); cùng-tuổi TĂNG (57%) vì mỗi tuổi còn ít ứng viên nên cùng một mẩu thắng, cộng 5 milestone cố định tuổi. Mức <=30% cần thêm mẩu (xem diversity-tuning).
- Thập niên 40s (mean 0.4), 70s, 80s trống: mẩu một-lần bị rút sớm trong cửa sổ, cửa sổ kết thúc <=45 / pack không có mẩu >=64 tuổi. Vốn đã trống ở 70s/80s trước đây; cần nội dung mới.
- Dưới 15% đời: lhc3_cau_hon_hoa_giai 9%, ngay_het_han 8%, con_doi_di_hoc_xa 7%, bai_thi_duoc_giup 3%, khoan_no 13%, that_vong 12% (phụ thuộc cờ/memory/cửa, vốn thấp; con_doi_di_hoc_xa giảm do chuyen_xe_ra_tinh gate).
