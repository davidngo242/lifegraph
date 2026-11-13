# Spec: Đời Sinh Từ Hạt Giống & Cây Sinh Mệnh Sống (2026-11-13)

Trạng thái: **DỰ THẢO, chờ Sếp duyệt.** Chưa có dòng code nào. Thay thế hướng "7 chương cố định + 4 trụ hạnh phúc" đã bị Sếp đánh giá là vẫn dập khuôn.

## 1. Vấn đề (đã đối chiếu code)

| # | Triệu chứng Sếp thấy | Nguyên nhân trong code |
|---|---|---|
| P1 | Chơi 1–2 đời đã thấy giống nhau, các giai đoạn nhàm | `scenarioEngine.getCurrentScenarioForCharacter` lọc mẩu truyện theo `min_age/max_age/flags`, rồi **sắp theo `priority` cố định, lấy phần tử đầu**. Cùng tuổi và cờ thì ra cùng mẩu. Không có nhân vật nào "sống" giữa các mẩu |
| P2 | Space qua tuổi nhàm chán | `useGameHotkeys` gắn Space với `handleSmartYearAdvance`: sang năm không cần chọn, không có hậu quả, nên thành thói quen bấm liên tục |
| P3 | Cây Sinh Mệnh chỉ là bảng nút | `DynamicLifeTree.getNodesForStage` trả **cùng 5–6 nút theo 3 mốc tuổi** (≤5, ≤17, ≥18). Cây đổi hình theo tuổi, mùa theo `age % 4`, nhưng **không phản ánh câu chuyện** của riêng người chơi |
| P4 | Chỉ còn tập trung cày tiền | Nút hành động là hành động tiền (`work_ot`, `stock_trading`); các nút kia không tạo cốt truyện |

## 2. Nguyên tắc thiết kế

1. **Đời sinh ra từ nhân vật, không từ khuôn tuổi.** Cái gì xảy ra do ai đang quanh bạn và bạn đã làm gì.
2. **Mỗi năm là một nhịp quyết định ngắn**, không phải một nút "qua năm".
3. **Cây Sinh Mệnh là bản đồ câu chuyện của đời này**: nhìn vào cây biết đời này khác đời trước chỗ nào.
4. **Mọi tính năng cũ giữ lại**, chỉ đổi cách chúng xuất hiện (khi câu chuyện cần). Không viết lại lõi (hướng strangler đã chọn).
5. **Đo được**: có chỉ số "đời này khác đời trước bao nhiêu" để kiểm tra (xem mục 9).

## 3. Mô hình dữ liệu mới

### 3.1 Hạt giống đời (`life_seed`), rút khi sinh

Lưu trong `character.life_seed`, sinh từ RNG có seed sẵn có (`engine/rng.js`) nên tái lập được trong test.

| Trục | Ví dụ giá trị | Tác dụng |
|---|---|---|
| `era` (thời đại) | làng_hậu_chiến, đô_thị_bùng_nổ, cyberpunk | Đổi bảng nghề, mức sống, nguyên nhân tử vong, kho truyện được phép |
| `family_state` | nợ_nần, danh_gia, con_nuôi, cha_mẹ_ly_tán | Tiền/Karma khởi điểm, NPC gia đình gốc |
| `fate_thread` (sợi định mệnh) | "cha giấu món nợ máu", "tài năng yểu mệnh" | Một cốt truyện dài xuyên đời, có thể giải quyết hoặc bỏ lỡ |
| `temperament` | nóng, trầm, tò mò | Đổi trọng số lựa chọn và lời thoại |

Từ điển giá trị nằm ở `backend/src/content/seeds/*.json`, kiểm bằng validator mới (mở rộng `content/validator.js`).

### 3.2 Nhân vật có ký ức (`cast`)

- Mỗi đời sinh **5–8 NPC** từ hạt giống: 1 người thầy/dìu dắt, 1 địch thủ, 1 người thương, 1 chủ nợ/ân nhân, 1–2 bạn, cộng gia đình.
- Mỗi NPC có `{role, trait, goal, secret, memory[]}`. `memory` là danh sách sự kiện đã xảy ra với người chơi (đã giúp, đã phản bội, đã bỏ rơi), tối đa 12 mục, mục cũ nén thành một dòng.
- Tận dụng `engine/npcEngine.js` và social links đã có. Chỉ thêm `goal/secret/memory`.

### 3.3 Mẩu truyện có điều kiện (storylet)

Mở rộng định dạng content pack hiện có (`prerequisites` đã có `min_age/max_age/required_flags/excluded_flags`). Thêm các trường **tùy chọn**, nên pack cũ vẫn chạy:

```
prerequisites.era            : ["làng_hậu_chiến"]
prerequisites.requires_npc   : {role: "địch_thủ", memory_has: "bị_phản_bội"}
prerequisites.fate_thread    : "cha_giấu_nợ"
prerequisites.min_quality    : {debt: 1}          // ví dụ đang có nợ
weight                       : số dương, mặc định 1
cooldown_years               : số năm không lặp lại cùng loại
locks / unlocks              : danh sách "cánh cửa" (mục 3.4)
```

### 3.4 Ngã rẽ khoá đường (`doors`)

- `character.doors` là tập các cánh cửa mở/đóng, ví dụ `rời_làng`, `nhận_nuôi_đứa_trẻ`, `phản_bội_bạn`.
- Một lựa chọn đánh dấu `irreversible: true` sẽ **đóng** vài cánh và **mở** cánh khác. Giao diện báo trước bằng nhãn "Không quay đầu".

## 4. Thay đổi bộ chọn sự kiện (xử lý P1)

Sửa duy nhất `getCurrentScenarioForCharacter`:

1. Lọc điều kiện như cũ cộng điều kiện mới ở 3.3.
2. **Bỏ "lấy phần tử đầu".** Chấm điểm mỗi ứng viên:
   `score = weight × (1 + ưu_tiên_ngữ_cảnh) × giảm_lặp`
   - `ưu_tiên_ngữ_cảnh` cao khi mẩu truyện gắn với NPC/sợi định mệnh đang "nóng" (vừa có biến cố).
   - `giảm_lặp` phạt mẩu cùng nhóm đã gặp trong `cooldown_years`.
3. **Rút theo xác suất** bằng `getRandom()` (RNG có seed), nên test vàng và mô phỏng vẫn tái lập được.
4. Mẩu truyện "ghim" (`active_scenario:` flag) và `priority` rất cao (tín hiệu bắt buộc như cột mốc cuộc đời) vẫn được ưu tiên.

Tương thích: pack cũ không có trường mới thì `weight=1`, mọi điều kiện mới coi như thoả, hành vi gần như cũ nhưng không còn cố định hoàn toàn.

## 5. Nhịp mỗi năm thay Space vô tri (xử lý P2)

Mỗi năm có tối đa 3 bước, tổng khoảng 20–40 giây:

| Bước | Nội dung | Phím |
|---|---|---|
| 1. **Chọn trọng tâm năm** | Một trong: Sự nghiệp, Gia đình, Sức khỏe, Học hỏi, Trải nghiệm. Quyết định kho truyện và hành động năm đó | `1–5` |
| 2. **Gặp chuyện** | 0–2 mẩu truyện (mục 4); lựa chọn có hậu quả | `1–3` |
| 3. **Khép năm** | Một dòng nhật ký do máy chủ ghép từ điều vừa xảy ra, rồi sang năm | `Space` |

Quy tắc cho Space:
- **Space chỉ còn nghĩa "khép năm"** sau khi đã chọn trọng tâm. Chưa chọn trọng tâm thì Space không sang năm mà gợi ý chọn.
- Có **chế độ "Trôi năm"** (tuỳ chọn, mặc định tắt): cho người quen chơi sang năm nhanh, nhưng mỗi 5 năm game **dừng lại** nếu có biến cố nóng. Cảnh báo rõ rằng trôi năm làm nhân vật tự chọn theo `temperament`.
- Hành động trong năm giới hạn bằng AP như hiện tại, nên chọn việc này là bỏ việc kia.

Nút "sang năm không chọn" cũ được giữ làm đường tắt của "Trôi năm", không xoá hẳn để không phá người chơi cũ.

## 6. Cây Sinh Mệnh sống (xử lý P3, liên kết với Sếp yêu cầu)

Cây hiện tại (`DynamicLifeTree.tsx`) giữ nguyên vai trò **màn hình trung tâm duy nhất**. Thay đổi là dữ liệu mà cây hiển thị, không phải bộ khung SVG.

### 6.1 Nguồn nút

`getNodesForStage` hiện hard-code nút theo 3 mốc tuổi. Đổi thành `getNodesForState(character)`, nút lấy từ 3 nguồn:

| Nguồn | Nút |
|---|---|
| **Trọng tâm năm đã chọn** | Hành động của trọng tâm đó (ví dụ trọng tâm Gia đình thì ra nút nói chuyện với người thương, đi thăm cha mẹ) |
| **Câu chuyện đang nóng** | Nút gắn với NPC/sợi định mệnh đang có biến cố (ví dụ "Đối chất với chủ nợ") |
| **Nền tảng** | Giữ vài nút lõi cũ (dưỡng sinh, học, làm việc) để người chơi luôn có việc làm |

Nút nghề giữ logic `workNode` đang có nhưng chỉ hiện khi trọng tâm là Sự nghiệp, nên "cày tiền" không còn là lựa chọn luôn nằm đó.

### 6.2 Cây là bản đồ câu chuyện

| Phần của cây | Thể hiện |
|---|---|
| **Cành** | Mỗi cành chính ứng với một mạch truyện lớn (sợi định mệnh, người thương, nghề). Cành mọc khi mạch bắt đầu, héo khi bị bỏ rơi |
| **Quả/hoa** | Mốc đã đạt, ví dụ nhận nuôi con, trả xong nợ |
| **Cánh cửa khoá** | Cành bị cắt vì ngã rẽ không quay đầu, hiện vết cắt kèm tooltip "Bạn đã chọn rời làng" |
| **Vòng vân gỗ** | Mỗi năm một vòng, màu theo trọng tâm năm đó. Đời nhiều năm sự nghiệp ra vòng khác đời nhiều năm gia đình |
| **Rễ** | Nơi gắn hạt giống: thời đại, gia cảnh. Rễ khác nhau thì thấy ngay đời này khác |
| **Nhánh "Nếu như…"** | Vẽ nhánh mờ cho các lần mô phỏng (đã nằm trong backlog C2) |

Nhờ vậy hai đời cho hai cái cây khác hình, đó là điều Sếp cần.

### 6.3 Mùa và nền
- Mùa đang tính `age % 4` nên **mỗi bốn tuổi một chu kỳ cố định**. Đổi thành mùa **theo biến cố của năm** (năm có tang thì đông, năm mừng con thì xuân). Mùa là tín hiệu cảm xúc, không còn là đồng hồ.
- `CulturalLandscapeBackdrop` đổi theo `era` của hạt giống, không chỉ quốc gia.

### 6.4 Ràng buộc kỹ thuật cho cây
- `DynamicLifeTree.tsx` dài khoảng 3.6k dòng: **không sửa tại chỗ**. Tách trước phần sinh nút (`getNodesForStage`) thành `lib/lifeTreeNodes.ts` (hàm thuần, có test), rồi thêm nguồn mới vào đó.
- Mobile giữ cách danh sách thẻ dọc đã có (`docs/ui-foundation-fix-2026-11-11.md` mục 6); cành/quả hiện thành nhóm có tiêu đề.
- Tuân `docs/ui-standards.md` (tương phản, theme sáng/tối) và `unlocks.ts` (tính năng mở dần): trọng tâm "Học hỏi/Trải nghiệm" không lộ nút tài sản khi chưa đủ tuổi.

## 7. Nối với các hệ hiện có

| Hệ hiện có | Cách nối |
|---|---|
| Content packs (`content/packs/*.json`) | Giữ nguyên; thêm trường tuỳ chọn. Gắn thẻ `era` cho các pack hiện có (mặc định `any`) |
| Tái sinh (`rebirthEngine.js`) | Kiếp sau nhận **hậu quả** đời trước: NPC nhớ, cửa đóng/mở còn hiệu lực qua `world_memory`, chia theo dòng họ. Phần thưởng chủ yếu là **kiến thức/bí ẩn**, không thêm chỉ số |
| Bia Tưởng Niệm | Văn bia tự dựng từ các cửa đã đóng, mốc đạt và `fate_thread`; vẫn chỉ tài khoản mới đăng được |
| "Nếu như…" | Mô phỏng nay phải tính cả mẩu truyện có điều kiện; vẽ nhánh lên cây (cùng mục 6.2) |
| Cân bằng kinh tế | Giữ `income.js`; trọng tâm chỉ đổi cách phân bổ AP, không thêm nguồn tiền mới |

## 8. Lộ trình (strangler, mỗi đợt kiểm chứng riêng)

| Đợt | Nội dung | Cỡ | Kiểm chứng |
|---|---|---|---|
| 0 | Chọn **một thời đại** làm bản thử (đề xuất: làng hậu chiến) và viết ngân sách nội dung | S | Sếp duyệt |
| 1 | `life_seed` + `cast` + bộ chọn có trọng số (mục 3.1–3.3, 4). Chưa đổi giao diện | M | Test vàng mới; đo "độ khác biệt" |
| 2 | Tách `lifeTreeNodes.ts` + nguồn nút theo trọng tâm/câu chuyện (6.1) + nhịp 3 bước và Space mới (5) | L | Build, test, `ui_audit` |
| 3 | Cây là bản đồ câu chuyện: cành/quả/cửa khoá/vòng vân (6.2–6.3) | L | Xem bằng mắt desktop+mobile, 4 theme |
| 4 | Ngã rẽ không quay đầu + ký ức NPC xuyên kiếp + văn bia (3.4, 7) | M | Test kịch bản nhiều kiếp |
| 5 | Nội dung: ~60 mẩu truyện, 6 NPC mẫu, 3 ngã rẽ cho thời đại thử | L (nội dung) | Sếp duyệt giọng văn |
| 6 | Playtest 3–5 người, 3 đời liên tiếp, rồi quyết mở rộng thời đại | — | Mục 9 |

Mỗi đợt theo đúng 3 chốt của AGENTS.md (Reviewer, build+test+ui_audit, tài liệu), PR nhỏ, tự merge khi đủ cổng như Sếp đã cho phép.

## 9. Tiêu chí nghiệm thu ("hết dập khuôn" đo bằng số)

Dùng `tools/balance_policies.mjs` mở rộng, mô phỏng 300 đời mỗi kiểu chơi:

1. **Khác biệt giữa hai đời**: lấy 2 đời bất kỳ cùng chính sách, tỷ lệ mẩu truyện trùng nhau **< 40%** (hiện gần như trùng hoàn toàn theo tuổi).
2. **Không mẩu nào chiếm > 8%** tổng số lần xuất hiện.
3. **Cùng tuổi, hai đời khác hạt giống** gặp mẩu truyện khác nhau ≥ 70% số lần.
4. **Cây khác hình**: hai đời khác hạt giống có tập cành khác nhau (kiểm bằng test hàm sinh nút).
5. **Không lùi kinh tế**: các chỉ số `docs/balance-report-2026-11-12.md` không xấu đi quá 10%.
6. **Không hỏng cũ**: 104 test hiện có và test vàng vẫn pass (golden lives sẽ phải tái sinh có chủ đích, ghi rõ trong PR).
7. **Playtest**: ít nhất 3/5 người nói đời thứ ba "khác rõ" hai đời trước.

## 10. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| **Nội dung là nút thắt**: 60 mẩu vẫn ít, người chơi nhận ra lặp | Mẩu truyện ghép từ khối (cảnh mở + vai NPC + hậu quả) để tăng tổ hợp; đo mục 9.1 trước khi viết thêm |
| Giọng văn AI không hợp | Sếp duyệt mẫu ở Đợt 0 trước khi sinh hàng loạt |
| Test vàng vỡ | Tái sinh có chủ đích, so sánh trước/sau, ghi trong PR |
| Cây quá tải thị giác | Giới hạn tối đa 6 cành chính hiện cùng lúc; luật "tối đa 3 nút hành động" ở màn hình chính |
| Người chơi quen Space nhanh thấy phiền | Chế độ "Trôi năm" tuỳ chọn |
| Phạm vi quá lớn | Chỉ làm một thời đại; chưa đạt mục 9 thì không mở rộng |

## 11. Việc cần Sếp quyết

1. Duyệt hướng và lộ trình ở mục 8.
2. Thời đại thử nghiệm đầu tiên: làng hậu chiến (đề xuất) hay thời đại khác?
3. "Trôi năm": giữ làm tuỳ chọn mặc định tắt (đề xuất) hay bỏ hẳn?
4. Cho phép em viết mẫu 5 mẩu truyện ở Đợt 0 để Sếp chấm giọng văn trước khi làm tiếp?
