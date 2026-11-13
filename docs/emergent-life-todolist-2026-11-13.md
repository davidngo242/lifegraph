# Todolist: Đời Sinh Từ Hạt Giống & Cây Sinh Mệnh Sống (2026-11-13)

Spec: `docs/emergent-life-spec-2026-11-13.md`. Truyện mẫu: `docs/emergent-life-samples-2026-11-13.md`.
Cỡ: S/M/L theo AGENTS.md 2b. Kiểm thử giai đoạn này: cơ bản (build, test hiện có, test mới cho phần mới).
Trạng thái: ☐ chưa làm.

## Đợt 0 — Chốt hướng
- [x] Spec + quyết định của Sếp (làng hậu chiến, bỏ Trôi năm)
- [x] 5 mẩu truyện mẫu
- ☐ Sếp chấm giọng văn (S, Sếp)

## Đợt 1 — Backend: hạt giống, nhân vật, bộ chọn truyện (M)
- ☐ 1.1 Từ điển hạt giống `backend/src/content/seeds/*.json` + validator (era, family_state, fate_thread, temperament)
- ☐ 1.2 Sinh `life_seed` lúc `/start` và tái sinh, dùng RNG có seed; lưu trong character (memory + Postgres)
- ☐ 1.3 `cast`: sinh 5–8 NPC từ hạt giống, thêm `goal/secret/memory[]` trên `npcEngine`
- ☐ 1.4 Mở rộng schema/validator content pack: `era`, `requires_npc`, `fate_thread`, `weight`, `cooldown_years`, `locks/unlocks` (trường tuỳ chọn, pack cũ vẫn chạy)
- ☐ 1.5 Bộ chọn có trọng số thay "lấy mẩu đầu" trong `getCurrentScenarioForCharacter`
- ☐ 1.6 Test: tái lập theo seed, pack cũ không vỡ, hai hạt giống khác cho mẩu khác; tái sinh golden có chủ đích
- ☐ 1.7 Công cụ đo "độ khác biệt" giữa hai đời (mở rộng `tools/balance_policies.mjs`)

## Đợt 2 — Nhịp năm mới + nút theo trọng tâm (L)
- ☐ 2.1 Tách `getNodesForStage` ra `frontend/app/lib/lifeTreeNodes.ts` (hàm thuần) + test
- ☐ 2.2 Trạng thái trọng tâm năm (5 trọng tâm) ở backend + API chọn trọng tâm
- ☐ 2.3 Nguồn nút: trọng tâm năm + câu chuyện đang nóng + nền tảng (mục 6.1)
- ☐ 2.4 Nhịp 3 bước (chọn trọng tâm, gặp chuyện, khép năm) trong `useGameState`
- ☐ 2.5 Hotkeys: `1–5` chọn trọng tâm, `Space` chỉ khép năm; gỡ đường sang năm không chọn
- ☐ 2.6 Dòng nhật ký cuối năm do máy chủ ghép từ biến cố
- ☐ 2.7 Cập nhật `docs/keyboard-controls.md`; build + `ui:audit`

## Đợt 3 — Cây Sinh Mệnh là bản đồ câu chuyện (L)
- ☐ 3.1 Mô hình dữ liệu cành/quả/vết cắt/vòng vân từ trạng thái nhân vật
- ☐ 3.2 Vẽ cành theo mạch truyện; héo khi bị bỏ rơi
- ☐ 3.3 Quả/hoa cho mốc đạt; vết cắt cho cửa đã đóng (tooltip)
- ☐ 3.4 Vòng vân gỗ màu theo trọng tâm từng năm
- ☐ 3.5 Rễ thể hiện hạt giống (thời đại, gia cảnh)
- ☐ 3.6 Mùa theo biến cố của năm thay `age % 4`; nền đổi theo `era`
- ☐ 3.7 Mobile: danh sách thẻ nhóm theo cành; tối đa 6 cành chính
- ☐ 3.8 Nhánh "Nếu như…" vẽ mờ trên cây
- ☐ 3.9 Kiểm tương phản 4 theme, `ui:audit`, xem bằng mắt desktop+mobile

## Đợt 4 — Cửa khoá, ký ức xuyên kiếp, văn bia (M)
- ☐ 4.1 `character.doors` + lựa chọn `irreversible` (đóng/mở cửa), nhãn "Không quay đầu" ở UI
- ☐ 4.2 `world_memory` theo dòng họ: NPC nhớ và cửa còn hiệu lực qua tái sinh (`rebirthEngine.js`)
- ☐ 4.3 Di sản kiến thức/bí mật mở mẩu truyện mới ở kiếp sau
- ☐ 4.4 Văn bia tự dựng từ cửa đóng, mốc đạt, `fate_thread` (nối Bia Tưởng Niệm)
- ☐ 4.5 "Nếu như…" tính cả mẩu truyện có điều kiện
- ☐ 4.6 Test kịch bản nhiều kiếp

## Đợt 5 — Nội dung thời đại làng hậu chiến (L, nội dung)
- ☐ 5.1 Chuyển 5 mẩu mẫu thành JSON pack hợp lệ
- ☐ 5.2 Viết ~55 mẩu còn lại, ghép từ khối (cảnh mở + vai NPC + hậu quả)
- ☐ 5.3 6 NPC mẫu và 3 ngã rẽ không quay đầu
- ☐ 5.4 Gắn `era` cho pack cũ (mặc định `any`)
- ☐ 5.5 Sếp duyệt giọng văn theo từng lô

## Đợt 6 — Nghiệm thu
- ☐ 6.1 Mô phỏng 300 đời: trùng mẩu giữa hai đời < 40%, không mẩu nào > 8%, cùng tuổi khác hạt giống khác mẩu ≥ 70%
- ☐ 6.2 Chỉ số cân bằng không xấu đi quá 10% so với `balance-report-2026-11-12.md`
- ☐ 6.3 Playtest 3–5 người, 3 đời liên tiếp: ≥ 3/5 thấy đời thứ ba "khác rõ"
- ☐ 6.4 Quyết mở rộng thêm thời đại hay chỉnh tiếp

## Việc nền song song (không chặn các đợt trên)
- ☐ Sếp đặt `DATABASE_URL`, `SESSION_SECRET` trên Render; deploy lại (`deploy-checklist-2026-11-12.md`)
- ☐ Backlog cũ: `docs/backlog-2026-11-12.md`
