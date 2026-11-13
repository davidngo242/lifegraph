# Hoàn thiện Cây Sinh Mệnh (tree polish) — 2026-11-13

Branch `claude/tree-polish`. Không đổi luật/giới hạn "Nếu như…" (3 lượt/kiếp, rate limit).

- **Quả đúng cành**: `MapFruit.branchId` (null = thân). Ký ức NPC -> cành NPC đó; cột mốc `history_log` -> cành trọng tâm theo từ khoá, không có thì theo trọng tâm đang dùng ở tuổi đó; cờ mốc -> cành trọng tâm (`FLAG_FOCUS`); không khớp -> cành định mệnh, rồi thân. `LifeTreeMapLayer` vẽ quả trên cành của nó (hết round-robin).
- **Cửa đóng không nhãn**: `humanizeLabel` (gạch dưới -> cách, viết hoa chữ đầu bằng locale `vi`, an toàn ký tự đa byte). `cuoi_som` có nhãn dấu "Cưới sớm". Tooltip: "Bạn đã chọn …".
- **Nhánh "Nếu như…"**: backend `POST /whatif` ghi thêm `character.whatif_log = [{age, label}]` (tối đa 10, cùng lần ghi `whatif_uses`). Frontend `map.ghosts`: nét đứt tím nhạt gần thân (SVG, có viền tối, >= 3:1; tooltip + `aria-label` + `tabIndex`), và dòng "Nhánh nếu như: … (N tuổi)" trong thẻ Mạch truyện. Vắng `whatif_log` thì rỗng.
- **Hit-area mobile**: 9 nút (huyệt kỹ năng, avatar NPC) nay là nút trong suốt >= 44x44 (`min-w/h-[44px]`, từ `md` trở lên giữ cỡ cũ) bọc quả cầu hiển thị; hiển thị không đổi.

Kiểm thử: tsc, `next build`, `tools/test_life_tree_map.mjs` (11 test), `test_life_tree_nodes`, `test_unlocks`, backend test (136/138 pass, 1 skip; 1 fail `api.test.js` "post-scenario journey" có sẵn trên origin/main). UI audit `--scenario tree30` (daylight, obsidian; 390/1280/1440): overflow 0, font<12 0, contrast<AA 0, hit<44 0 (trước 9), console 0.
