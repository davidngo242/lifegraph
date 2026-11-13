# Lộ Trình Triển Khai "Một Đời" (Sếp duyệt spec 2026-11-13)

Nguyên tắc: **giữ nguyên game hiện tại**, thêm chế độ "Một Đời" chạy song song để người dùng thử trước. Cắt/ẩn tính năng cũ chỉ làm sau khi có số liệu thật. Căn cứ: `game-evaluation-2026-11-13.md`.

## Giai đoạn 0 — Chế độ thử (XONG, trong PR này)
- Trang `/mot-doi`, nút vào từ trang chủ, backend `/api/game/mot-doi/{start,state,choose}`.
- Chạy trong bộ nhớ (RNG riêng, không ghi DB, không đụng nhân vật chính). Chỉ dùng truyện viết riêng cho làng hậu chiến; năm trống gom thành nhật ký 1 dòng. Một đời khoảng 14–25 chương, kết bằng văn bia + nút chép để chia sẻ.
- Giới hạn đã biết: phiên mất khi server khởi động lại; chưa có đo lường; chưa có "Đời hôm nay".

## Giai đoạn 1 — Đo lường & hạ tầng (tuần 1, cỡ M)
| Việc | Nghiệm thu |
|---|---|
| Ghi sự kiện nhẹ (bắt đầu, chương N, kết thúc, chép văn bia, đời thứ hai) vào Postgres, ẩn danh theo session | Truy vấn ra 4 chỉ số ở mục "Ngưỡng" |
| Sếp đặt `DATABASE_URL`, `SESSION_SECRET` trên Render, deploy lại | `/health` ok, dữ liệu còn sau deploy |
| Lưu phiên Một Đời vào Postgres (thay Map bộ nhớ) | Khởi động lại server, đời đang chơi không mất |
| Trang `/mot-doi` thành điểm vào mặc định cho khách mới (trang chủ cũ vẫn truy cập được) | Khách mới thấy Một Đời trước |

## Giai đoạn 2 — Vòng lan truyền (tuần 2, cỡ M)
| Việc | Nghiệm thu |
|---|---|
| Thẻ văn bia dạng ảnh dọc (server sinh SVG/PNG): tên, văn bia, 3 cửa đã đóng, link | Chia sẻ được lên Zalo/Facebook, xem tốt trên điện thoại |
| "Đời hôm nay": 1 hạt giống chung mỗi ngày (seed theo ngày) | Hai người cùng ngày thấy cùng xuất thân và cùng NPC |
| Cuối đời hiện tỷ lệ người đã chọn giống/khác từng ngã rẽ (gom từ sự kiện) | Hiện đúng phần trăm khi đủ ≥20 lượt |
| Đời thứ hai: giữ ký ức dòng họ (dùng `world_memory` sẵn có) | Con cháu gặp lại NPC cũ có ký ức |

## Giai đoạn 3 — Nội dung (tuần 3, cỡ L, Lead viết, Sếp duyệt giọng)
- Thêm 30–40 mẩu cho tuổi 10–39 và tuổi 80+ (nơi hiện còn thưa), ưu tiên biến thể có điều kiện theo `family_state`/ký ức NPC.
- Mục tiêu đo: trùng mẩu giữa hai đời < 40% (hiện 41,5%), mẩu hiếm (< 15% đời gặp) còn ≤ 3.
- Playtest 5 người theo `docs/playtest-sheet-2026-11-13.md` (Sếp sắp xếp); chốt giọng văn.

## Giai đoạn 4 — Thả thử & quyết định (tuần 4)
- 30–50 người chơi thật, theo dõi 4 chỉ số. Kết thúc: Sếp quyết **đi tiếp / chỉnh / dừng**.

| Chỉ số | Ngưỡng tiếp tục |
|---|---|
| Chơi hết đời đầu | ≥ 50% |
| Chơi đời thứ hai trong phiên | ≥ 35% |
| Chép/chia sẻ văn bia | ≥ 10% số đời xong |
| Quay lại hôm sau ("Đời hôm nay") | ≥ 20% |

Dưới nửa số ngưỡng sau 2 vòng thử với ≥ 30 người: dừng làm game.

## Giai đoạn 5 — Nếu đạt ngưỡng (sau tuần 4)
1. Cắt/ẩn hệ thống cũ theo bảng 6.2 của tài liệu đánh giá (gacha, tarot, chứng khoán, "MMO" giả…), mỗi lần một nhóm, có test.
2. Tách `routes/game.js` (3.800 dòng) theo vùng; bỏ kho 11.640 tình huống ghép tự động nếu không còn dùng.
3. Thời đại thứ hai (đô thị Đổi Mới), tăng nội dung theo doanh thu: gói thời đại, khung thẻ văn bia, ủng hộ tự nguyện.

## Rủi ro chính
| Rủi ro | Giảm thiểu |
|---|---|
| Nội dung 80 mẩu chưa đủ đa dạng | Giai đoạn 3; đo bằng `tools/life_diversity.mjs` |
| Gói free Render ngủ → người mới chờ lâu | Màn chờ có sẵn; nâng gói ~7 USD khi có người chơi đều |
| Văn viết hơi nặng/Bắc Bộ | Playtest chấm giọng; thêm biến thể Nam/Trung sau |
| Phiên trong bộ nhớ mất khi deploy | Giai đoạn 1 lưu vào Postgres |

## Cần Sếp
1. Đặt `DATABASE_URL`, `SESSION_SECRET` trên Render (chặn giai đoạn 1).
2. Chọn 3–5 người playtest.
3. Duyệt giọng văn theo lô ở giai đoạn 3.
