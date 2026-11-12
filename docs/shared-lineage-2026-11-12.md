# Gia Phả Liên Người Chơi (MVP "Bia Tưởng Niệm chung") — 2026-11-12

Hiện thực hoá phần an toàn, bất đồng bộ của "Ý tưởng 3" trong `game-experience-spec.md`: người chơi có TÀI KHOẢN chủ động đăng bia tiền nhân đã mất lên bảng chung; người khác thắp hương, nhận làm tiền nhân (ân huệ nhỏ, có trần) hoặc báo cáo. Chưa có chuyện "gặp tiền nhân người lạ như NPC" trong cốt truyện (xem Chưa làm).

## API (`backend/src/routes/shared_lineage.js`, gắn tại `/api/game/shared-lineage`, trước `gameRoutes`)
Mọi route cần `x-account-token` (khách/token hỏng/đã đăng xuất: 401). Lỗi trả `{error}`.

| Route | Việc |
|---|---|
| `GET /?sort=new\|incense&limit&offset` | Danh sách bia đang hiển thị. `limit` kẹp 1-50 (mặc định 20), `offset` kẹp 0-10000, giá trị lạ -> mặc định, `sort` lạ -> `new`. Mỗi bia có cờ `mine`, `incensed_today`, `adopted` của người xem. |
| `POST /publish {memorial_id, consent:true, epitaph?}` | Đăng bia của CHÍNH tài khoản (tra trong gia phả server-side theo `session_id` của tài khoản; không tin dữ liệu client trừ lời bia). Cần `consent === true` (boolean). 201 / 400 / 404 / 409 (một lần mỗi kiếp, kể cả đã gỡ) / 422 (từ cấm) / 429 (5 lần/giờ/tài khoản, chỉ tính khi hợp lệ). Bia mẫu `is_demo`/`founder_gen_1` không đăng được. |
| `POST /:id/incense` | Thắp hương: 1 lần/bia/tài khoản/ngày (giờ VN, UTC+7); race an toàn. Chỉ tăng bộ đếm, không thưởng gì. |
| `POST /:id/adopt` | Nhận làm tiền nhân: không nhận bia của mình (403), một lần/bia (409), tối đa 3 lần/ngày (429). |
| `POST /:id/report {reason?}` | Báo cáo: không báo bia của mình (403), một báo cáo/tài khoản/bia (409), 10 báo cáo/giờ/tài khoản (429). Đủ 3 người báo -> tự ẩn (`hidden`). |
| `DELETE /:id` | Chủ gỡ bia. Người khác (hoặc bia không tồn tại) đều nhận 404 (chống IDOR/dò id). |
| `GET /mine` | Bia của tôi (kèm `status`: active/hidden, `source_memorial_id`). |
| `GET /adopted` | Tiền nhân tôi đã nhận (bản chụp tại lúc nhận) + `karma_start_bonus` + `karma_start_bonus_cap`. |

Ân huệ nhận nuôi: +1 "Karma khởi đầu" mỗi tiền nhân, tổng tối đa **+3** (`BLESSING_CAP`). Tuyệt đối không có chuyển tiền, tài sản, nhân vật. Tài khoản chỉ lưu danh sách + con số; **chưa nối vào lúc bắt đầu kiếp mới** (xem Chưa làm).

## Dữ liệu công khai (lọc)
Chỉ: `id` công khai (`sm_` + 16 hex), tên tiền nhân, quốc tịch, tuổi, nguyên nhân (nhãn), khát vọng, lời bia, `display_name` (= tên đăng nhập của chủ), số hương/nhận nuôi, ngày đăng. KHÔNG bao giờ: account id, session id, token, số báo cáo, tiền/gia sản. Lưu ý: tên đăng nhập là tên hiển thị công khai (đã nêu trong hộp thoại đăng).

## Làm sạch & kiểm duyệt (`backend/src/security/contentFilter.js`)
`cleanPublicText`: bỏ ký tự điều khiển/zero-width/bidi, thẻ HTML (kể cả thẻ dở dang), URL `http(s)/ftp`, `www.`, tên miền trần (`evil.io/x`), rồi `sanitizeString` (bỏ `< > ' " \` ; \`), gộp khoảng trắng, cắt độ dài (lời bia 200). Lời bia sai kiểu (object/số) bị 400. `containsProfanity`: bỏ dấu + đ->d + hạ chữ thường, khớp theo TỪ nguyên vẹn với `backend/src/data/profanity_vi.txt` (mỗi dòng một cụm; `#` chú thích; tiền tố `!` = cụm mạnh còn bị bắt khi chèn dấu chấm kiểu `đ.ụ m.á`). Danh sách chỉ là mức cơ bản, cần Sếp/biên tập bổ sung. Phía React luôn render bằng text node (không `dangerouslySetInnerHTML`).

## Lưu trữ
Postgres (tạo trong `initDb`, SQL ở `backend/src/db/sharedLineageSchema.js`): `shared_memorials` (UNIQUE `(account_id, source_id)`), `shared_memorial_incense` (PK `(memorial, account, day)`), `shared_memorial_adoptions` (PK `(memorial, account)`), `shared_memorial_reports` (PK `(memorial, account)`). Tính nguyên tử bằng ràng buộc duy nhất + `ON CONFLICT DO NOTHING` + giao dịch (`FOR UPDATE` trên bia, khoá tư vấn theo tài khoản cho trần nhận nuôi). Chế độ bộ nhớ: `shared_lineage.json` (0600) trong `LIFEGRAPH_DATA_DIR`, kiểm tra+ghi đồng bộ nên không race. Mã: `backend/src/db/sharedLineageStore.js`. Sửa nhỏ ngoài file mới: `db.js` (import schema, chạy trong `initDb`, export `getStorageHandle`), `auth.js` (export `requireAccount`), `index.js` (mount). `game.js` không đổi.

## Frontend
`SharedLineageModal.tsx` (+ `hooks/useSharedLineage.ts`): bảng bia (Mới nhất/Nhiều hương nhất, phân trang 10), nút Thắp hương / Nhận làm tiền nhân / Báo cáo (báo cáo hai bước xác nhận), mục tiêu bấm >= 44px, màu theo biến theme + cặp `dark:`, chữ chính/phụ dùng `--text-primary/--text-secondary`. Khách thấy "Đăng nhập để tham gia" (phát sự kiện `lifegraph:open-account`, `AppHeader` lắng nghe và mở `AccountModal` sẵn có). Hai điểm gắn trong `LifeGraphHomePortal.tsx`: `<SharedLineageHallButton />` cạnh tiêu đề gia phả và `<SharedLineagePublish memorialId defaultEpitaph />` cuối mỗi thẻ tiền nhân thật (hộp thoại đồng ý + sửa lời bia; chỉ đăng khi tick đồng ý). `AncestralMemorialModal.tsx` hiện không được mount ở đâu nên không dùng làm điểm gắn.

## Kiểm thử
`backend/test/shared_lineage.test.js` (17 ca): 401 cho khách, consent/own/demo, IDOR publish & unpublish, XSS/URL/HTML, độ dài, từ cấm có/không dấu, rate limit đăng/báo cáo, không lộ id/token, biên phân trang, race thắp hương (12 song song -> 1) và nhận nuôi (8 -> 1), trần nhận nuôi (3/ngày, +3), tự ẩn ở 3 báo cáo, một lần mỗi kiếp sau khi gỡ, đăng xuất thu hồi, bền vững qua tải lại đĩa. Postgres: `TEST_DATABASE_URL=... node --test --test-concurrency=1 test/*.test.js`.

## Chưa làm / rủi ro còn lại
- Chưa áp ân huệ +Karma khởi đầu vào `startNewRebirthGame`/`/start` (cần chạm `game.js`); hiện chỉ lưu và hiển thị con số.
- Chưa có cảnh "hậu duệ gặp tiền nhân người lạ như NPC", thư xuyên kiếp, thừa kế vật phẩm.
- Chưa có giao diện quản trị để xem/khôi phục bia bị ẩn; chưa có kháng nghị. Danh sách từ cấm mới ở mức cơ bản.
- Tài khoản mới có thể báo cáo hàng loạt từ nhiều tài khoản (Sybil): ngưỡng 3 là mức MVP, nên cân nhắc trọng số theo tuổi tài khoản.
- Rate limit trong bộ nhớ theo tiến trình (không chia sẻ giữa nhiều instance); ràng buộc DB vẫn chặn trùng lặp.
