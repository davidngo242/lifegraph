# Cây Sinh Mệnh là bản đồ câu chuyện (Đợt 3) — 2026-11-13

Branch `claude/life-tree-map`. Spec: `emergent-life-spec-2026-11-13.md` mục 6, todolist Đợt 3 (3.1-3.7). Chưa làm 3.8 (nhánh "Nếu như…"). Không phụ thuộc Đợt 4: `character.doors` có thì vẽ vết cắt, vắng thì bỏ qua.

## Backend
- `character.focus_history = [{age, focus}]`, tối đa 120. `/tick` gọi `recordFocusHistory` (`engine/yearJournal.js`) ngay trước khi đặt `year_focus = null`; năm không chọn trọng tâm thì không ghi. `age` là tuổi tại lúc khép năm (cùng số với "Năm N tuổi" của nhật ký).
- Golden không đổi. Test: `backend/test/emergent_life.test.js` (thêm 1).

## Frontend
- `app/lib/lifeTreeMap.ts` (hàm thuần): `buildLifeTreeMap(character)` -> `{roots, branches, fruits, cuts, rings}`; `seasonFromLatestEvent(character, journalLine)`.
  - Cành: cành định mệnh (từ `life_seed.fate_thread`, luôn có), cành theo trọng tâm (mỗi trọng tâm đã dùng), cành theo NPC trong `cast` có ký ức. Tối đa 6, định mệnh luôn giữ, còn lại theo sức mạnh.
  - Sức mạnh 0..1: trọng tâm `0.2 + 0.08 x số năm`; NPC `0.25 + 0.15 x số ký ức`; định mệnh `0.4 + 0.1 x ký ức của vai liên quan`.
  - Héo (`withered`) khi tuổi hiện tại - lần hoạt động cuối > 8 năm.
  - Quả: `history_log` có "Cột Mốc", cờ mốc đã biết (`written_memoir`, ...; không có tuổi), ký ức NPC. Giữ 12 quả mới nhất.
  - Vết cắt: `doors[tên] === false` hoặc `{open:false, age?, label?}`.
  - Mùa: theo từ khoá trong phần biến cố của `year_journal` / `annual_digest.journal_line` (tang, bệnh, nợ -> đông; chào đời, cưới, nhận nuôi -> xuân; thăng chức, thành công -> hè; nghỉ hưu, hồi ký -> thu). Không khớp thì `age % 4` như cũ. Từ khoá là heuristic, chỉnh trong `SEASON_WORDS`.
  - Nhân vật cũ (không seed/cast/lịch sử): mọi mảng rỗng.
- `app/components/rpg/LifeTreeMapLayer.tsx`: `LifeTreeMapLayer` (SVG, desktop, vẽ phía sau nút hành động) và `LifeTreeMapCards` (mobile, `md:hidden`, nhóm Rễ / Cành / Quả / Cửa đã đóng / Vòng vân, thẻ cao tối thiểu 44px, chữ >= 12px).
  - Cành vẽ ở 6 góc nằm giữa các góc nút hiện có; cành héo: nét đứt xám đá trên viền tối. Nhãn có viền tối (halo) nên đọc được trên mọi nền/theme.
  - Quả: chấm vàng + `<title>` tooltip. Vết cắt: dấu gạch đỏ trên thân, tooltip "Bạn đã chọn …". Vòng vân: elip chồng lên vòng vân sẵn có ở bệ gốc (cùng hình học, tối đa 45 vòng), màu theo trọng tâm. Rễ: nhãn "Rễ · …" cạnh hai rễ gia đình.
- `DynamicLifeTree.tsx` chỉ thêm khoảng 10 dòng: import, mùa theo biến cố, `lifeMap`, hai chỗ gắn component.
- Chưa làm: nền `CulturalLandscapeBackdrop` theo `era` (không tầm thường); nhánh "Nếu như…".

## Kiểm thử
`node tools/test_life_tree_map.mjs` (8 test): hai đời khác seed/cast/lịch sử cho tập cành khác; héo; sức mạnh; giới hạn 6; cửa đóng/quả; nhân vật cũ; mùa. Cùng với `tools/test_life_tree_nodes.mjs`, `tools/test_unlocks.mjs`, `cd backend && npm test`, `tsc --noEmit`, `npm run build`.
