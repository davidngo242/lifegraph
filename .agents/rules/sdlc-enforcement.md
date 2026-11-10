# SDLC Enforcement & Mandatory Subagent Quality Gate

> **Scope:** Always-On Project Rule for all development, refactoring, and UI tasks.

## Quy Tắc Bất Di Bất Dịch:
1. **Không Bao Giờ Trả Lời Sếp Khi Chưa Kiểm Định:**
   - Dù là hotfix nhỏ nhất, Lead Agent phải trigger hoặc chạy tự động:
     - Reviewer verification (diff, contrast ratio WCAG AA/AAA, no regression).
     - QA test suite (`npm run build`, backend test suite, UI integrity tests).
2. **Kỷ Luật Subagent Pipeline:**
   - BA -> UI/UX -> Coder -> Reviewer -> Tester -> Doc Writer.
   - Các sub-agent hoạt động độc lập và có quyền reject nếu chất lượng không đạt.
3. **Dual-Theme Isolation:**
   - Daylight mode là mặc định cao cấp; không được để CSS dark mode đè lên khi ở chế độ ban ngày.
   - Text contrast tối thiểu 4.5:1 (chuẩn AA) trên mọi node, card, modal, và tree item.
