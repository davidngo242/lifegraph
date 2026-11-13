# Emergent Life, Đợt 4: Ngã rẽ không quay đầu, ký ức xuyên kiếp, văn bia (2026-11-13)

Branch `claude/doors-memory`. Spec: `emergent-life-spec-2026-11-13.md` mục 3.4, 7. Mã mới: `backend/src/engine/worldMemory.js`.

## Cửa (`character.doors`)
Dạng mới: `{door_id: {open, label, age, persists?, inherited?}}`. Dạng cũ `{door_id: boolean}` vẫn đọc được (`normalizeDoors`; tuổi cũ chưa biết -> `age: null`) và được đổi sang dạng mới ở lần ghi kế tiếp. `lifeTreeMap.ts` đọc cả hai dạng, không đổi.
Trường content mới, tuỳ chọn, hợp lệ ở cả mẩu truyện và từng lựa chọn: `locks[]`, `unlocks[]`, `persist_doors[]`, `door_labels{id: nhãn<=60}`; riêng lựa chọn có `irreversible: true`. Khi chọn xong, `applyDoors` áp locks/unlocks của mẩu truyện (như Đợt 1) cộng của lựa chọn đã chọn, ghi nhãn (mặc định = tên cửa) và tuổi hiện tại.
Giao diện: `InteractiveScene2D.tsx` hiện nhãn "Không quay đầu" (chữ `text-xs` = 12px, `rose-100` trên `rose-950`, thẻ nền tối nên tương phản > 10:1) cạnh tên lựa chọn có `irreversible`.

## `world_memory` (theo dòng họ)
`{bloodline_id, generation, npc_memories[], doors{}, inherited_knowledge[]}` nằm trong JSON character (bộ nhớ và Postgres). Áp bởi `applyWorldMemory` ở `/rebirth/heir` (và `/continue-child`) và trong `startNewRebirthGame` khi có `lineageParent` (tức `/start`, `/rebirth` với `lineage_parent_id`). Không có cha mẹ -> dòng họ mới, không mang gì.
- NPC: ký ức có tag `grudge`, `debt`, `benefactor` hoặc `persist: true` (đặt trong `outcome.npc_memory`) được gắn lại vào vai trùng trong cast mới, kèm một dòng "Từ đời trước (tên, đời N): ...", đánh dấu `lineage: true`. Tối đa 24 mục cho cả dòng họ.
- Cửa có `persists: true` được chép sang đời sau (`inherited: true`), vẫn đóng/mở như cũ.
- `inherited_knowledge`: cờ `legacy:<tag>` của cha mẹ, cờ di chúc/hồi ký (`early_will_established` -> `di_chuc_gia_toc`, `written_memoir` -> `hoi_ky_tien_nhan`, `mentored_heir` -> `loi_day_tien_nhan`), cộng phần cha mẹ đã thừa kế. Mỗi mục thành cờ `inherited:<tag>` ở đời sau, nên `prerequisites.required_flags: ["inherited:<tag>"]` hoạt động mà không sửa bộ chọn.

## Văn bia
`buildEpitaphSummary(character)`: tối đa 3 câu tiếng Việt, <= 200 ký tự (bằng `EPITAPH_MAX` của gia phả chung, không nới). Dùng cửa đã đóng, mốc thành công gần nhất, trọng tâm nhiều năm nhất (`focus_history`), `fate_thread`. Nhân vật cũ/thiếu trường không lỗi. Làm gợi ý mặc định: `epitaph_quote` của bia tưởng niệm khi chuyển giao (`parent.epitaph` vẫn ưu tiên), và `inheritance_summary.epitaph_summary` trong phản hồi heir. Quy tắc làm sạch/kiểm duyệt của `/shared-lineage/publish` không đổi.

## Kiểm
`backend/test/doors_memory.test.js` (6 test); `emergent_life.test.js` sửa một assert về dạng cửa mới (thay đổi có chủ đích). Golden KHÔNG tái sinh (không tiêu thụ RNG). `npm test`: 119 test, 118 pass, 0 fail, 1 skip. `tsc --noEmit` sạch, `npm run build` OK, `check_stat_writes --strict`: 0.

## Quyết định mở
1. `/rebirth` chỉ mang ký ức khi có `lineage_parent_id` (cùng dòng họ); tái sinh "lạ" bắt đầu dòng họ mới.
2. Cửa cũ dạng boolean có `age: null` (không biết tuổi), cây sẽ đặt vết cắt không tuổi.
3. Bia Niết Bàn vẫn dùng câu cố định, chưa dùng bản tóm tắt.
