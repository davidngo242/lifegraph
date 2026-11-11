# ui_audit — cổng QA giao diện tự động

Playwright vào game (Bắt Đầu Kiếp Mới → Quay Bánh Xe Định Mệnh → BƯỚC VÀO CUỘC ĐỜI), đổi theme qua nút "Cài đặt hệ thống" (fallback: `localStorage.lifegraph_theme` + `data-theme`), đóng popover rồi đo từng tổ hợp theme × viewport.

```bash
cd frontend
npm run ui:audit -- --url http://localhost:3000 --strict
# hoặc: node tools/ui_audit.mjs --url https://lifegraph-test.vercel.app --themes daylight,obsidian --viewports 390x844,1440x900
```

| Cờ | Mặc định | Ý nghĩa |
|---|---|---|
| `--url` | `http://localhost:3000` | trang cần audit (prod: `https://lifegraph-test.vercel.app`) |
| `--out` | `tools/ui_audit_out` | thư mục kết quả (`report.json`, `report.md`, `shots/`) — **nên bỏ qua khỏi git** |
| `--themes` | 4 | `daylight,obsidian,sepia,cyberpunk` hoặc số N (N theme đầu) |
| `--viewports` | `360x800,390x844,768x1024,1440x900` | danh sách WxH |
| `--strict` | tắt | exit 1 nếu vượt ngưỡng |
| `--max-overflow`, `--max-contrast-daylight`, `--max-console` | 0 | ngưỡng chặn (mặc định của strict) |
| `--max-contrast-other`, `--max-small-font`, `--max-vertical`, `--max-hit-area` | không giới hạn | mặc định chỉ cảnh báo; đặt số để siết (vd `--max-vertical=0`) |
| `--entry-timeout` | 120000 | ms chờ vào game (backend cold-start) |
| `--headed` | tắt | hiện trình duyệt |

Đo: overflow ngang; text node font < 12px; tương phản WCAG AA (4.5, chữ lớn 3.0); chữ xếp dọc/bị cắt (phần tử cao > 6× rộng có text > 3 ký tự, hoặc từ bị bẻ giữa chữ); hit-area < 44×44 (chỉ viewport ≤ 767px); console error/pageerror; ảnh viewport + full-page.

Hạn chế: tương phản chỉ dùng `background-color` (blend alpha qua tổ tiên), bỏ qua gradient/ảnh/canvas 3D (`bgImageSeen` cho biết số text nằm dưới nền ảnh). Playwright được tìm tự động (`frontend/node_modules`, `/opt/node-tools`, global; hoặc đặt `PLAYWRIGHT_MODULE_DIR`).
