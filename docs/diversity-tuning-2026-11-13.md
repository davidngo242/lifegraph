# Diversity tuning (2026-11-13)

## Chẩn đoán (300 đời, `tools/life_diversity.mjs`, số thật)
- Hạt giống: tool KHÔNG dùng lại seed; 94-98 life_seed khác nhau là do không gian chỉ có 2 era x 5 family x 4 fate x 3 temperament = 120 tổ hợp. Không phải lỗi. (Đã đổi seed đời sang băm trộn thay vì số nguyên liên tiếp.)
- Era: 74-77% đời `lang_hau_chien`, 23-26% đời `any`. Đời `any` chỉ gặp 7 mẩu cũ cố định => 78 đời giống hệt nhau (Jaccard 100%) và kéo số chung lên. Mỗi đời `lang_hau_chien` gặp ~40 mẩu/đời.
- Chính sách cũ luôn chọn choice[0] => không dựng ký ức NPC khác nhau (Jaccard lhc 84% vs 73.7% khi chọn ngẫu nhiên như người chơi).
- Chỉ lang_hau_chien (300 đời): 27/61 mẩu gặp ở >=90% đời (7 mẩu cũ + 20 mẩu lhc không điều kiện/cửa sổ tuổi rộng), 6 mẩu 70-90%, 7 mẩu 40-70%, 18 mẩu 10-40%, 3 mẩu <10%. Nguyên nhân gốc: bão hoà - 91 tuổi, ~75 ô tuổi, mẩu là "một lần" nên mọi mẩu không có điều kiện đều sớm muộn được rút.
- Đã thử trong engine (không giữ): (a) cooldown cứng theo group: 40.1 -> 38.8 mẩu/đời, Jaccard 73.5 -> 75.2 (vô hiệu, ít group chung); (b) năm im lặng 30/50/70%: Jaccard 68/63/57 nhưng đổi nhịp & cân bằng kinh tế, same-age tăng. Không phải đòn bẩy phù hợp.
- Milestone priority>=90 cũ không "bóp nghẹt" lượt rút (chỉ 6 mẩu, mỗi mẩu 1 lần), nhưng khoá cứng thời điểm tuổi: same-age cao.

## Thay đổi
- `tools/life_diversity.mjs`: chọn choice ngẫu nhiên (`--policy random|first`), seed băm, `--era <id>`, báo cáo từng era, histogram mức độ gặp, `--list`.
- Engine: không đổi. Pack cũ: `yields_to_group` cho 3 milestone (career_crossroads_28 -> `hôn_nhân`, midlife -> `tết_nhà`, legacy -> `hoa_giai`); chỉ dời thời điểm (still nằm trong cửa sổ), không mất mẩu. Cờ hoàn thành không ai khác phụ thuộc.

## Số mới
Tất cả era: Jaccard 53.6% (trước 60.8%), cùng-tuổi 46.0% (trước 55.8%), top share 3.2%.
Chỉ era lhc: Jaccard 73.7%, cùng-tuổi 43.7%. Era `any`: 100% (không có mẩu era).
Chưa đạt <40% / <=30%.

## Cần bao nhiêu mẩu
Mô hình độc lập xác suất xuất hiện p_i từ histogram thật: thêm mẩu có điều kiện (p~0.3) cần ~135 mẩu nữa (tổng ~195) nếu giữ 27 mẩu phổ quát. Rẻ hơn: biến ~20 mẩu phổ quát thành có điều kiện (npc/memory/fate/family hoặc biến thể loại trừ nhau) để p~0.5 => Jaccard ~0.31 với 61 mẩu hiện có. Đời `any` cần pack riêng (>=40 mẩu) hoặc bỏ era `any` khỏi từ điển.
