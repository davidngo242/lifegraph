# Emergent Life, Đợt 1 backend (2026-11-13)

Branch `claude/emergent-backend`. Backend only. Spec: `emergent-life-spec-2026-11-13.md` mục 3, 4, 5, 9.

## Đã làm
| Mục | Nơi |
|---|---|
| Từ điển hạt giống | `backend/src/content/seeds/{era,family_state,fate_thread,temperament,cast_roles}.json`; nạp bởi `content/seeds.js`; kiểm bởi `validateSeedDictionaries` (`content/validator.js`). `era` có `lang_hau_chien` và `any` |
| `character.life_seed` `{era,family_state,fate_thread,temperament}` | `engine/lifeSeed.js` (`drawLifeSeed`, `lifeSeedOf`). Rút bằng `getRandom()` ở cuối `executeProceduralRebirth` (mọi đường `/start`, `/rebirth`, `/reset`); đường `/rebirth/heir` giữ `era` của cha mẹ, rút các trục còn lại. Nằm trong JSON của character nên tự lưu cả bộ nhớ lẫn Postgres. Nhân vật cũ không có `life_seed` coi như `era: any` |
| `character.cast` 6-8 NPC | `engine/npcEngine.js` `generateCast`. `{id,role,name,trait,goal,secret,memory[]}` (+`stance` cho chủ nợ/ân nhân). `fate_thread` quyết định bí mật của một vai; `family_state: con_nuoi` đổi bí mật người thân. `addCastMemory` giữ tối đa 12 mục, mục cũ gộp thành một mục `tom_tat` vẫn tra được theo tag |
| Pack mở rộng (tuỳ chọn) | `prerequisites.era[]`, `.requires_npc{role,memory_has}`, `.fate_thread`, `.min_quality{}`; `weight`, `cooldown_years`, `group`, `locks[]`, `unlocks[]`. Cập nhật `content/schema.json`, `validator.js`. Pack cũ không đổi |
| Bộ chọn có trọng số | `scenarioEngine.js`. Ghim và `priority >= 90` thắng như cũ. Còn lại: `score = weight * (1 + context_boost) * repeat_decay` |
| Trọng tâm năm | `character.year_focus` (null\|career\|family\|health\|learning\|experience); `POST /api/game/year/focus {focus}` -> `{success, character}`, 400 nếu sai enum (`null` để xoá) |
| Nhật ký năm | `/tick` ghi `character.year_journal` và `passiveSummary.annual_digest.journal_line` (một câu tiếng Việt, ghép từ `history_log` từ lần khép năm trước, `engine/yearJournal.js`), rồi đặt `year_focus = null`. `/tick` không đòi trọng tâm |
| Test | `backend/test/emergent_life.test.js` (7 test) |
| Đo | `tools/life_diversity.mjs [--lives 300] [--demo-pack]` |

## Chi tiết cần biết
- `min_quality`: khoá `debt` = (cash < 0) + cờ `high_debt`; khoá khác đọc `character[khoá]` (cash, vitality, burnout, karma, age...).
- `requires_npc.role` nhận id vai (`rival`...) hoặc bí danh tiếng Việt trong mẫu (`địch_thủ`, `người_thầy`, `người_thương`, `chủ_nợ`). `memory_has` khớp `tag` của ký ức. Ký ức ghi vào cast qua `outcome.npc_memory: [{role, tag, text}]` khi chọn lựa chọn.
- `context_boost` = +1 nếu mẩu gắn `fate_thread`, +1 nếu gắn `requires_npc`, +0.5 nếu gắn `era`. `repeat_decay` = 0.1 nếu cùng `group` (mặc định = id) đã gặp trong `cooldown_years`. Lịch sử ở `character.scenario_seen[{id,group,age}]` (giữ 40).
- `locks`/`unlocks`: khi chọn xong mẩu, ghi `character.doors[tên] = false/true`. Chưa có điều kiện đọc `doors` (Đợt 4).
- Chưa áp dụng tác dụng kinh tế của `family_state` (tiền/Karma khởi điểm), để tránh đổi cân bằng; chỉ ảnh hưởng cast.

## Quyết định lệch khỏi đề bài, cần Sếp/Lead biết
1. Lượt rút của bộ chọn KHÔNG dùng `getRandom()` mà dùng `createRng(rng_seed ^ hash(tuổi, số mẩu đã giải))`. Lý do: `getCurrentScenarioForCharacter` được gọi nhiều lần mỗi lượt (GET `/scenario/current`, interact, resolve, `/tick`) và nhiều route không lưu lại character; dùng `getRandom()` sẽ làm kết quả đổi giữa hai lần đọc và làm lệch dòng RNG của phiên. Dòng riêng vẫn có seed, tái lập được. `getNextScenarioAge` chỉ kiểm tra tồn tại, không rút.
2. Golden `backend/test/fixtures/golden_lives.json` ĐÃ tái sinh có chủ đích (`UPDATE_GOLDEN=1`): `drawLifeSeed` + `generateCast` thêm các lượt `getRandom()` lúc sinh nên mọi dòng RNG phía sau dịch chuyển. Không có thay đổi cân bằng; cùng seed vẫn cho cùng đời (test determinism pass).

## Số đo (300 đời, seed 100000..100299)
| | Pack hiện có | + `--demo-pack` (370 mẩu giả lập) |
|---|---|---|
| Trùng tập mẩu giữa hai đời (Jaccard) | 100.0% | 20.2% |
| Cùng tuổi, cùng mẩu | 100.0% | 10.4% |
| Mẩu chiếm nhiều nhất | 14.3% (infancy_first_steps) | 1.2% |

Với nội dung thật hiện có, trùng vẫn 100%: cả 8 mẩu đều là cột mốc `priority >= 90` hoặc cố định theo tuổi. Bộ chọn chỉ phát huy khi Đợt 5 thêm mẩu `priority < 90` gắn era/fate/NPC. Demo pack chỉ chứng minh bộ chọn tạo được đa dạng khi có nội dung.

## Kiểm
`cd backend && npm test`: 112 test, 111 pass, 0 fail, 1 skip (trước đó 105/104/0/1; thêm 7). `node tools/check_stat_writes.mjs --strict`: 0.
