# Nhịp năm (Đợt 2, phần giao diện) — 2026-11-13

Phạm vi: chỉ frontend; nối hợp đồng backend `year_focus`, `POST /year/focus`, `annual_digest.journal_line`, `character.cast`.

- `frontend/app/lib/lifeTreeNodes.ts`: hàm thuần `getNodesForState({character, characterAge, breakthroughAction, unlocks})`, `LifeTreeNode` (re-export từ `DynamicLifeTree.tsx`). `getBaseNodes` là bản nút cũ nguyên văn; không có `year_focus` (hoặc dưới 6 tuổi) thì kết quả y hệt cũ.
- Có `year_focus` (từ 6 tuổi): chỉ hiện nút của trọng tâm + tối đa 2 nút nền + đột phá. Nút làm việc/lướt sóng chỉ ở trọng tâm Sự nghiệp (hoặc chưa chọn). Dùng lại id và handler cũ; `family_meal`, `health_checkup`, `npc_meet:<id>` định tuyến trong `handleNodeClick` tới `onFamilyMeal`, `onHealthCheckup`, `onNpcInteract(id, 'socialize')`.
- NPC nóng: `character.cast` có thành viên `memory` không rỗng thì thêm nút "Gặp {tên}" (0 AP, vì backend NPC-interact không trừ AP phía client).
- `YearFocusPicker.tsx` (5 nút, phím 1-5, cao tối thiểu 44px, chữ 12px+) hiện trên cây khi từ 6 tuổi, chưa chọn trọng tâm, không có biến cố chờ. State trong `useGameState` (`showYearFocusPicker`, `handleChooseYearFocus`, `requestYearAdvance`, `focusHint`).
- Space và các nút "Sang Tuổi/Gieo Mầm" đều đi qua `requestYearAdvance`: từ 6 tuổi chưa có trọng tâm thì chỉ nhắc và đưa tiêu điểm về bộ chọn. Đường "sang năm không chọn" bị gỡ.
- `annual_digest.journal_line` hiện trong `AnnualDigestBanner` khi có (đọc từ `passiveSummary.annual_digest` hoặc `annual_digest` cấp trên).
- Test: `node tools/test_life_tree_nodes.mjs`.
