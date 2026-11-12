# Mở khoá dần giao diện (progressive disclosure) — 2026-11-12

Mục tiêu: "thu gọn hệ thống" cho người mới, không xoá hệ thống nào (xem `architecture-overhaul-spec-2026-11-12.md` mục 4.3).

## Quy tắc (`frontend/app/lib/unlocks.ts`, hàm thuần `getUnlocks(character, account, lineage?)`)

| Nhóm | Điều kiện mở |
|---|---|
| Lõi: chỉ số, học tập, gia đình, tuổi thơ, chết/tái sinh/người kế thừa | luôn mở |
| Tài sản, nghề/tăng ca, nhân mạch, cá cược | tuổi >= 18 |
| Thú cưng, Nhánh Kỹ Năng, Khát vọng | `reincarnation_count` >= 1, hoặc gia phả có tiền nhân thật (không phải `is_demo`/`founder_gen_1`) |
| Đột phá, Siêu nhân hoá | tuổi >= 60 hoặc `reincarnation_count` >= 2 |

Mục bị khoá được ẩn (không disable). Chỗ có tab/nút thì hiện gợi ý nhỏ "🔒 Mở khoá ở 18 tuổi / Kiếp 2 / 60 tuổi/Kiếp 3" (chữ `--text-secondary`, không dùng `text-*-300/400` trên nền sáng).

## Nơi áp dụng
`GameCockpit` tính `unlocks` rồi truyền xuống: `MultiTabSidebar` (tab Tài Sản), `CharacterHeroBanner` (nút Nuôi Pet, thanh Khát vọng), `ActionPointHub` -> `DynamicLifeTree` (nút Cành Hoàng Kim, tab Nhánh Kỹ Năng, nút pet trên cây, các nút Đột Phá), `page.tsx` (TranshumanBanner). Prop `unlocks` mặc định `ALL_UNLOCKED` nên nơi khác dùng lại component không đổi.

## Kiểm thử
`node tools/test_unlocks.mjs` (Node >= 22.18, không cần tsx): 10 ca biên (17/18 tuổi, count 0/1/2, 59/60 tuổi, tiền nhân demo/thật, dữ liệu thiếu).
