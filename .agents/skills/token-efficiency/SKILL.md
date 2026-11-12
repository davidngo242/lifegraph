---
name: token-efficiency
description: Quy tắc điều phối agent/subagent tiết kiệm token cho LifeGraph (và dự án tương tự). Dùng khi Lead chuẩn bị giao việc cho subagent, đọc ảnh/log lớn, hoặc lập kế hoạch một đợt sửa nhiều file. Mục tiêu: giữ kỷ luật 3 chốt nhưng không đốt token vô ích.
---

# Token Efficiency Playbook

Căn cứ: đợt sửa nền 2026-11-11 (xem `docs/ui-foundation-fix-2026-11-11.md`) dùng khoảng **1,9 triệu token chỉ ở subagent** (10 agent: 103k–411k mỗi agent), chưa tính phiên Lead.

## 1. Phân tầng kỷ luật theo cỡ thay đổi (đề xuất sửa AGENTS.md §2)
| Cỡ | Ví dụ | Bắt buộc |
|---|---|---|
| XS (1–3 dòng CSS/text) | đổi màu, sửa chữ | `tsc --noEmit` + `ui:audit` ô bị ảnh hưởng. Lead tự làm, KHÔNG gọi subagent |
| S (1–3 file) | sửa 1 component | build + test + 1 Reviewer subagent nhẹ (chỉ đọc diff) |
| M/L (nhiều file, kiến trúc) | đợt sửa nền | đủ chuỗi BA → UI/UX → Coder → Reviewer → Tester → Doc |
Giữ nguyên Gate 2 (build/test 100% pass) ở mọi cỡ; chỉ bỏ việc gọi subagent cho XS.

## 2. Giao việc cho subagent
- Một brief ngắn (<= 40 dòng) + đường dẫn tới file brief chung; đừng bắt mỗi agent đọc cả AGENTS.md và SKILL.md dài. Đưa 10 dòng quy tắc cốt lõi vào brief.
- Chia theo **tập file sở hữu rời nhau**; không để 2 agent sửa cùng file.
- Chuẩn bị môi trường MỘT LẦN ở Lead (forwarder backend, cổng, distDir) rồi truyền sẵn lệnh. Đợt vừa rồi 5 agent mỗi người tự dò lại lỗi `ENOTFOUND` của Node và tự viết forwarder.
- Chỉ định đầu ra theo mục 2b (<= 10 dòng + REPORT.md).
- Không spawn agent cho việc <= 3 bước hoặc đọc 1–2 file.
- Mỗi agent chỉ chạy audit phạm vi của mình; một lần audit đầy đủ do Tester chạy.

## 2b. Hợp đồng báo cáo subagent (BẮT BUỘC, Sếp chỉ đạo 2026-11-11)
Nguyên tắc: **Lead là người nắm kết quả rồi báo cáo Sếp**. Subagent không báo cáo dài, không viết log vào hội thoại.
- Báo cáo trả về tối đa **10 dòng**: (1) Trạng thái PASS / FAIL / BLOCKED, (2) 3–5 ý chính, (3) số liệu then chốt trước/sau, (4) việc cần Lead quyết, (5) đường dẫn file chi tiết.
- Chi tiết (bảng đo, danh sách file, ảnh, đề xuất cải tiến) ghi vào **một file** `scratchpad/agents/<ten>/REPORT.md`. Lead chỉ mở file khi cần, không dán lại vào hội thoại.
- Không dán log lệnh, diff, JSON; không báo cáo lại lần hai; không viết lời chào/kết luận dài.
- "Đánh giá cải tiến thêm": tối đa 3 mục ưu tiên cao, mỗi mục 1 dòng; phần còn lại vào REPORT.md.
- Lead tổng hợp thành **một** báo cáo ngắn cho Sếp: kết quả, rủi ro, quyết định cần Sếp.
Đoạn chèn vào cuối mọi brief:
> BÁO CÁO: trả về <=10 dòng (trạng thái, 3–5 ý chính, số liệu then chốt, việc cần Lead quyết, đường dẫn REPORT.md). Mọi chi tiết ghi vào REPORT.md, không dán log vào hội thoại.

## 3. Ảnh, log, file lớn
- Không `Read` ảnh full-page (ví dụ 780x4534) khi chỉ cần một vùng: crop bằng Playwright `clip` hoặc đo bằng script rồi chỉ xem ảnh khi số đo bất thường.
- Ưu tiên số đo (`ui:audit`, `getBoundingClientRect`) hơn ảnh. Mỗi ảnh = nhiều nghìn token.
- Log dài: `tail`/`grep` có giới hạn; không cat file lớn. Không đọc file output JSONL của subagent.
- File >1.000 dòng (DynamicLifeTree, page.tsx): dùng `Grep` + `Read` offset/limit, không đọc toàn bộ.

## 4. Vòng lặp và nhắc việc
- Hook "Stop: commit và push" gây thêm 1 lượt mỗi lần agent nền còn chạy. Cách giảm: commit từng phần việc đã xong ngay khi agent báo xong (đã làm), hoặc cấu hình hook bỏ qua khi còn tác vụ nền.
- Một subagent có thể báo cáo nhiều lần (agent A báo 3 lần, D1 2 lần). Khi nhận báo cáo lặp, chỉ cập nhật task, không đọc lại.
- Task list: tạo một lần, cập nhật theo lô, đừng nhắc lại.

## 5. Đo lường (làm mỗi đợt)
Ghi vào báo cáo cuối: số subagent, token mỗi agent, số ảnh đã đọc, số lượt Lead. Đặt ngân sách trước (ví dụ đợt L <= 1M token subagent) và dừng giao thêm khi vượt 80%.

## 6. Áp dụng cho dự án khác
Trong repo này, `.claude/skills/token-efficiency` và `.claude/skills/full-dev-workflow` là symlink tới `.agents/skills/` để Claude Code tự nạp (chỉ 2 skill này; các skill thiết kế dài dòng khác cố ý KHÔNG nạp tự động để tiết kiệm token). Sao chép thư mục này vào `.agents/skills/` (hoặc `~/.claude/skills/token-efficiency/` để dùng mọi dự án), bỏ phần số liệu LifeGraph ở đầu, giữ mục 1–5.
