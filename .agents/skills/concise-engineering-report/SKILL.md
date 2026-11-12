---
name: concise-engineering-report
description: Chuẩn giao tiếp ngắn gọn cho agent kỹ thuật. Dùng khi làm việc nhiều bước (code, sửa lỗi, review, test, refactor, UI/UX, commit/push/deploy), khi giao việc cho subagent, hoặc khi chuẩn bị báo cáo cuối. AI làm nhiều, báo cáo ít; không che lỗi.
---

# Concise Engineering Report

**Nguyên tắc:** làm nhiều, báo cáo ít. Chỉ nói khi có thông tin mới, blocker, rủi ro hoặc cần người dùng quyết. Ngắn không có nghĩa là giấu lỗi.

## 1. Trong lúc làm việc
Không nói: đang chạy/đã chạy lệnh, lệnh nền xong, đang chờ Reviewer/Tester, đang kiểm tra lại, chưa commit vì đang chờ, giờ em sẽ làm bước X, lặp lại tiến độ cũ.
Chỉ nói khi: (a) blocker, (b) cần quyết định, (c) phát hiện rủi ro/lỗi quan trọng, (d) đổi hướng đáng kể. Tối đa 1 câu. Khi chờ agent/lệnh nền: im lặng, kết thúc lượt, đợi thông báo.

## 2. Nội bộ vs quản lý
- **Nội bộ (không đưa vào báo cáo):** lệnh đã chạy, các bước kiểm tra, trao đổi giữa agent, trạng thái chờ, sửa lỗi vặt.
- **Quản lý (bắt buộc giữ):** thay đổi, kết quả test (số thực), lỗi/cảnh báo còn tồn tại, việc chưa xong, commit/push/deploy, việc cần phê duyệt.

## 3. Hợp đồng đầu ra subagent (<= 10 dòng; chi tiết vào REPORT.md)
- **Developer:** hạng mục đã xử lý · file/module ảnh hưởng · kết quả · vấn đề còn lại.
- **Reviewer:** chỉ liệt kê phát hiện theo **Critical / Major / Minor** kèm `file:dòng`, mô tả 1 dòng, đề xuất. Không liệt kê mục đã kiểm tra mà không có vấn đề.
- **Tester:** tổng số · pass/fail/skip · danh sách lỗi thật · đánh dấu **mới** hay **có từ trước** (chỉ khi có bằng chứng, ví dụ chạy lại trên bản gốc).
- Không dán log/diff/JSON. Không được cắt thông tin lỗi cho đẹp.
Dòng chèn cuối brief: `BÁO CÁO: <=10 dòng theo vai trò (Dev/Reviewer/Tester), chi tiết vào REPORT.md, không cắt thông tin lỗi.`

## 4. Agent chính
Tổng hợp, không sao chép báo cáo của từng agent. Đọc REPORT.md chỉ khi cần. Gửi **một** báo cáo cuối.

## 5. Báo cáo cuối (mặc định)
```
Trạng thái: Hoàn thành / Chưa hoàn thành / Bị chặn
Đã thực hiện: (thay đổi quan trọng)
Kiểm thử: build · unit/integration/e2e · số thực
Vướng mắc / Cần Sếp chốt: (mỗi mục 1 dòng + đề xuất của Lead; "không có" nếu trống)
Git: commit / push / nhánh
Tiếp theo: (việc Lead sẽ làm ngay, hoặc hành động cần Sếp; luôn có)
```
Lỗi/rủi ro còn tồn tại luôn nằm trong "Vướng mắc"; không giấu để báo cáo đẹp. Sếp phải đọc xong là biết: đã xong gì, đang vướng gì, cần mình làm gì.
Độ dài: việc thường ~100–150 từ; phức tạp tối đa ~250 từ; không cố độn cho đủ. Sự cố nghiêm trọng: được dài hơn để đủ thông tin. Không bỏ mục "Vướng mắc" và "Tiếp theo".

## 6. Tiết kiệm context
Dùng `tail`/`grep` có giới hạn, không cat log lớn; ưu tiên số đo hơn ảnh; đọc file lớn bằng offset/limit; không đọc lại điều đã biết.

## 7. Không được làm
Bỏ review/test, che lỗi hay cảnh báo, báo "xong" khi chưa xong, hoặc tự commit/push khi quy trình chưa cho phép.
