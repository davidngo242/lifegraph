# Engine: tên NPC, điều kiện mới, milestone nhường (2026-11-13)

## 1. Placeholder tên
Token: `{mentor} {rival} {love} {creditor_or_benefactor} {friend} {family}`. Áp dụng cho mọi chuỗi của kịch bản (title, description, tên cảnh, label/lời thoại hotspot, whispers, title/mô tả lựa chọn, narration kết quả).
- Tên = `character.cast` NPC đầu tiên có role đó (`{friend}` = friend đầu tiên). Tên được làm sạch (bỏ ký tự điều khiển, `{ } < >`, tối đa 60 ký tự).
- Không có NPC / nhân vật legacy không có cast: dùng từ trung tính `người thầy`, `kẻ đối đầu`, `người thương`, `người chủ nợ`, `người bạn`, `người thân`.
- `{abc}` lạ hoặc sai cú pháp được giữ nguyên, không lỗi.
- Nơi thay: `personalizeScenario` (cảnh hiện tại) và `resolveMindStageChoice` (kịch bản tra theo id), nên `narration`, `choice_title`, `history_log.event` đều đã có tên. Hàm export: `fillNames(text, character)`.
- Validator: cảnh báo (warning, không phải error) với placeholder lạ.

## 2. Điều kiện mới (`prerequisites`, tuỳ chọn)
- `family_state: [id..]` khớp `life_seed.family_state`; nhân vật legacy (không có seed) không khớp, trừ khi mảng rỗng.
- `doors_closed: [door_id..]`: mọi cửa phải tồn tại và `open === false`.
- `doors_open: [door_id..]`: mọi cửa phải `open === true`; cửa chưa có coi như chưa mở.
- Id là chuỗi tuỳ ý. Dạng cửa legacy (boolean) được chuẩn hoá qua `normalizeDoors`.

## 3. Milestone nhường (`yields_to_group: string`)
Kịch bản `priority >= 90` thường luôn thắng. Nếu có `yields_to_group` và nhân vật đã gặp kịch bản thuộc nhóm đó trong vòng 12 năm (theo `scenario_seen`, hoặc `history_log` của kịch bản có `group` trùng; `tuổi hiện tại - tuổi đã gặp <= 12`) thì milestone không tự thắng mà tham gia bốc thăm có trọng số như các kịch bản khác. Kịch bản được ghim (`active_scenario:`) vẫn luôn thắng. Bốc thăm vẫn tất định theo seed.

## 4. Test
`scenario.test.js` đếm số ca động từ danh sách kịch bản đã nạp (không còn hardcode 11640). Test mới: `backend/test/engine_names_conditions.test.js`.
