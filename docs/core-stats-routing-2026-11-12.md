# Đưa ghi chỉ số lõi về `engine/core/stats.js` (2026-11-12)

Phạm vi: `backend/src/routes/game.js`. Mục tiêu: mọi thay đổi `cash / vitality / karma / burnout` đi qua một chỗ có giới hạn chung (spec kiến trúc mục 5.1, ý 1).

## Kết quả
- Ghi trực tiếp trong routes (đếm bằng `node tools/check_stat_writes.mjs`): **185 -> 0** (chỉ `game.js` có; `auth.js` không đụng).
- API của `core/stats.js`: `applyDelta` (cộng/trừ), `clampStat`, thêm `setStat` (đặt giá trị tuyệt đối: reset, starter pack, tử vong) và `spendCapped` (trả tối đa phần tiền đang có, không tạo nợ mới).
- Golden fixtures không đổi. Test mới: `backend/test/stat_bounds.test.js` (fuzz 160 lần qua API + test hàm lõi).
- `tools/check_stat_writes.mjs --strict` thoát mã 1 nếu còn ghi trực tiếp (dùng làm chốt chặn CI nếu Sếp muốn).

## Thay đổi hành vi có chủ đích (theo giới hạn của stats.js)
1. Trần vitality luôn là `max_vitality` (mặc định 100). Trước đây vài nhánh minigame/blessing kẹp ở 100 cố định dù `max_vitality` thấp hơn.
2. Karma/burnout/vitality bị chặn dưới 0 ở mọi nhánh (trước đây hiệu ứng âm trong một số nhánh `tick`, `choice.effects` chỉ chặn trên, có thể xuống âm).
3. Trừ tiền: sàn nợ `CASH_FLOOR` (-250000) áp mọi nhánh; nhánh trả phí cố định/ thua lỗ vẫn giữ nguyên "không tạo nợ mới" qua `spendCapped`.
4. Mặc định khi chỉ số thiếu: trước là `|| 80`/`|| 100` (làm vitality 0 bị coi là 80); nay dùng giá trị thực (0 là 0).
5. Delta không phải số hữu hạn (NaN/undefined) nay thành 0 thay vì làm hỏng chỉ số.
6. Mỗi lần tiền chạm sàn sẽ ghi cờ `bankruptcy_floor` (hành vi sẵn có của `applyDelta`), nay áp cho cả các nhánh trước đây không đi qua nó.

## Ghi nhận, chưa sửa (ngoài phạm vi)
- `tickEngine` cộng +120 karma cho nhân vật trẻ chết (`karmaReimbursed`) nên bản ghi đã chết có thể karma > 100; test fuzz miễn trừ trần karma cho `is_deceased`.
- Fuzz là lưới hồi quy: nhiều lời gọi trả 4xx (thiếu AP/tiền) nên không chứng minh mọi nhánh, và chưa bắt được lỗi cũ khi chạy trên mã trước thay đổi.
