# Làng Hậu Chiến, Đợt 4: tuổi già và ký ức xuyên kiếp, 11 mẩu truyện (2026-11-13)

Pack `backend/src/content/packs/pack_lang_hau_chien_4.json` (`pack_lang_hau_chien_4`). Mọi mẩu có era `lang_hau_chien`, id tiền tố `lhc4_`, mỗi mẩu 3 lựa chọn. Giọng và cỡ hiệu ứng theo lô 1. 🔒 = lựa chọn không quay đầu; [ấm] = mẩu nhẹ.

## Bảy mẩu tuổi 50-85
| Tên | Tuổi | Điều kiện | Ghi chú |
|---|---|---|---|
| Đò Sang Nhà Anh | 50-70 | NPC `family`, `{family}` | hoà giải sau hai mươi năm |
| Đưa Tiễn Người Bạn Cũ | 55-80 | NPC `friend`, `{friend}` | tang lễ |
| Vụ Gặt Cuối Cùng [ấm] 🔒 | 62-80 | - | lựa chọn C bán ruộng: đóng cửa `l4_thua_ruong_cha_ong` (di truyền); `completion_flag: legacy:thua_ruong_cha_ong` |
| Người Cũ Nằm Giường Bệnh | 55-80 | NPC `rival`, `{rival}` | lựa chọn C từ chối: đóng `l4_oan_cu_chua_gia` (di truyền) + ký ức `grudge` |
| Cháu Đòi Học Chữ Ông Bà [ấm] | 60-85 | NPC `family`, `{family}` | cháu chắt |
| Lời Chưa Nói | 55-85 | NPC `love`, `{love}` | lời giữ bốn mươi năm |
| Truyền Nghề Hay Truyền Nợ | 52-72 | `family_state: [no_nan]`, `{creditor_or_benefactor}` | truyền nghề, bí mật hoặc nợ |

## Bốn mẩu xuyên kiếp (đời sau)
| Tên | Tuổi | Cờ cần | Cửa |
|---|---|---|---|
| Tờ Giấy Gấp Trong Gia Phả | 16-40 | `inherited:di_chuc_gia_toc` | - |
| Lời Dặn Còn Vang Trong Đầu [ấm] | 17-40 | `inherited:loi_day_tien_nhan`, NPC `mentor` | - |
| Cuốn Hồi Ký Ghi Một Mối Oán | 18-45 | `inherited:hoi_ky_tien_nhan`, NPC `rival` | `doors_closed: [l4_oan_cu_chua_gia]`; lựa chọn A mở lại cửa |
| Thửa Ruộng Đã Bán 🔒 | 22-50 | `inherited:thua_ruong_cha_ong` | `doors_closed: [l4_thua_ruong_cha_ong]`; lựa chọn A chuộc ruộng: mở lại cửa, đóng `l4_tu_do_khong_no` |

Hai ngã rẽ không quay đầu mới: bán thửa ruộng (mẩu 3C) và vay nợ chuộc lại (mẩu 11A).

## Danh sách tag `inherited:` cần engine/phía cha mẹ phát ra
- Có sẵn qua `worldMemory.collectInheritedKnowledge`: `di_chuc_gia_toc` (cờ `early_will_established`), `loi_day_tien_nhan` (`mentored_heir`), `hoi_ky_tien_nhan` (`written_memoir`). Ba cờ này do `routes/game.js` ghi khi người chơi dùng hành động di chúc / dìu người nối nghiệp / hồi ký.
- Mới, theo quy ước `legacy:<tag>`: `thua_ruong_cha_ong`. Mẩu "Vụ Gặt Cuối Cùng" gắn `completion_flag: "legacy:thua_ruong_cha_ong"` (engine đã ghi `completion_flag` vào `hidden_flags` khi giải xong), nên `collectInheritedKnowledge` trả về tag này mà không sửa gì. Hạn chế: cờ được ghi với MỌI lựa chọn của mẩu đó, nên mẩu 11 còn lọc thêm bằng `doors_closed: [l4_thua_ruong_cha_ong]` (chỉ đóng khi chọn bán). Nếu engine hỗ trợ cờ theo từng lựa chọn thì chuyển sang lựa chọn C.

## Ghi chú hợp đồng engine (đang làm song song)
- Cần: `{mentor}` `{rival}` `{love}` `{creditor_or_benefactor}` `{friend}` `{family}` thay trong mô tả, hotspot, lời kể (dùng ở hầu hết các mẩu, tối thiểu 7); `family_state`, `doors_closed`, `doors_open` trong `prerequisites` (mẩu này dùng `family_state: [no_nan]` ở "Truyền Nghề", `doors_closed` ở mẩu 10 và 11, chưa dùng `doors_open`). Giả định `family_state` khớp khi giá trị là một trong danh sách.
- Cửa định nghĩa ở pack này: `l4_thua_ruong_cha_ong` (di truyền), `l4_oan_cu_chua_gia` (di truyền), `l4_tu_do_khong_no`.
- Đường đi của cửa di truyền: đóng ở đời cha mẹ -> `persist_doors` -> đời con còn `open:false, inherited:true` -> `doors_closed` khớp.
- Khi cửa di truyền được mở lại (mẩu 10A, 11A) thì `applyDoors` ghi đè `open:true`.
