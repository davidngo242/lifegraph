# Làng Hậu Chiến, Đợt 5 lô 1: 25 mẩu truyện (2026-11-13)

Pack `backend/src/content/packs/pack_lang_hau_chien_1.json`. Tất cả gắn era `lang_hau_chien`, mỗi mẩu 3 lựa chọn. Ký hiệu: 🔒 = có lựa chọn không quay đầu; [nhẹ/ấm] = mẩu nhẹ nhàng; điều kiện ghi sau dấu mũi tên.

| # | Tên | Tuổi | Điều kiện | Một dòng |
|---|---|---|---|---|
| 1 | Chiếc Cặp Sách Rách 🔒 | 7-10 | - | Sáng đầu tuần, quai cặp bạn đứt hẳn. |
| 2 | Cuốn Sách Mất Tích | 8-12 | sau choice:LH01_B | Cuốn Địa lý mượn của thư viện trường biến mất khỏi ngăn bàn. |
| 3 | Người Lớn Quá Sớm | 9-13 | sau choice:LH01_C | Từ buổi mò cua ấy, bạn biết bờ sông sinh ra tiền. |
| 4 | Con Trâu Đi Lạc [nhẹ] | 6-9 | - | Cha giao bạn dắt con trâu ra đồng, dặn đừng đi xa. |
| 5 | Quả Ổi Trên Cây Nhà Ông Bảy [nhẹ] | 6-10 | - | Cây ổi nhà ông Bảy trĩu quả sát bờ rào. |
| 6 | Đêm Chiếu Phim Ngoài Sân Đình [ấm] | 10-15 | - | Có đoàn chiếu phim lưu động về xã. |
| 7 | Bức Thư Từ Bên Kia Sông 🔒 | 13-16 | sợi cha_giau_no | Bác đưa thư viết vội bằng chữ xiêu vẹo: "Cha cháu còn nợ ông Tám một mạng người hồi trước. |
| 8 | Chuyến Đò Đêm Mùa Lũ | 12-17 | - | Nước sông lên nửa đêm. |
| 9 | Chiếc Xe Đạp Cũ Của Cha 🔒 | 14-18 | - | Chiếc xe đạp Thống Nhất của cha đã theo ông qua hai cuộc hành quân, ba lần ngập nước. |
| 10 | Giấy Báo Trúng Tuyển 🔒 | 17-21 | mentor | Giấy báo trúng tuyển trường nghề trên tỉnh đến vào một sáng sương. |
| 11 | Hội Làng Mùa Xuân [nhẹ] | 15-25 | love | Hội làng mở trước sân đình, trống chầu rộn lên. |
| 12 | Mùa Gặt Không Đủ Người 🔒 | 16-25 | love | Trời đổ mưa sớm, lúa chín ngả rạp. |
| 13 | Bữa Cơm Có Khách | 20-40 | rival nhớ bị_khinh | Kẻ đối đầu ngày xưa giờ là người có tiếng ở xã. |
| 14 | Bữa Cơm Có Khách | 20-40 | rival nhớ bị_phản_bội | Có một người trong xã chưa quên lần bạn quay lưng với ông ta hồi nhỏ. |
| 15 | Người Đến Trả Ơn [ấm] | 20-45 | rival nhớ được_giúp_đỡ | Một buổi chiều, có người đứng trước cổng, tay xách giỏ trứng và bó rau. |
| 16 | Cái Giếng Đầu Xóm Cạn | 25-45 | - | Mùa nắng kéo dài, giếng đầu xóm đáy đã nhìn thấy sỏi. |
| 17 | Mối Duyên Muộn Lời | 28-45 | love nhớ bị_bỏ_lại | Người thương năm xưa trở về làng giỗ cha, tóc búi gọn, tay dắt đứa nhỏ chừng sáu tuổi. |
| 18 | Đứa Con Ốm Giữa Mùa Gặt | 26-40 | - | Đứa nhỏ sốt từ đêm, má đỏ rực, môi nứt. |
| 19 | Khoản Nợ Ông Tám 🔒 | 28-34 | sau choice:LH02_C | Mười lăm năm sau, ông Tám gõ cửa đúng chiều. |
| 20 | Đứa Trẻ Bên Bờ Đê 🔒 [ấm/nặng] | 30-45 | - | Sau trận lũ, có đứa bé chừng bốn tuổi ngồi dưới chân đê, tay ôm con cá khô, không rõ của ai. |
| 21 | Người Thầy Cũ Ốm Nặng | 35-60 | mentor nhớ tin_cậy | Tin thầy cũ ốm nặng tới tai bạn giữa mùa bận. |
| 22 | Ngôi Nhà Mới Lợp Ngói [nhẹ] | 35-55 | - | Mười năm tích cóp, nhà bạn cuối cùng cũng thay mái rạ bằng ngói đỏ. |
| 23 | Cây Đa Đầu Làng Bị Chặt | 45-65 | - | Có người trên huyện về đo đạc, nói cây đa đầu làng nằm trên đất sẽ làm đường. |
| 24 | Đôi Mắt Mờ Đọc Thư Cháu [ấm] | 62-80 | family | Thư cháu từ thành phố gửi về, nét chữ nhỏ và đều. |
| 25 | Ngày Giỗ Cuối 🔒 | 55-80 | family | Mâm giỗ năm nay thiếu một chiếc ghế. |

## Ghi chú kỹ thuật
- Tên NPC: engine chưa hỗ trợ thay `{tên}`, nên văn bản dùng từ chỉ vai ("người thầy", "kẻ đối đầu").
- `irreversible` ghi theo từng lựa chọn (dữ liệu); engine hiện chỉ đóng/mở cửa ở cấp mẩu (`locks/unlocks`), nên cửa theo từng lựa chọn là việc Đợt 4.
- `family_state` chưa là điều kiện được hỗ trợ (mẩu 1 không lọc theo nợ nần); mẩu 25 chưa lọc theo "có cửa đã đóng".
- Cặp "Bữa Cơm Có Khách" (khinh / phản bội) và "Người Đến Trả Ơn" cùng nhóm `bua_com_khach`: cùng một hạt nhân, hiện khác nhau theo ký ức NPC. Mẩu 2, 3 hiện sau lựa chọn B, C của mẩu 1; mẩu 19 hiện sau khi đốt thư (mẩu 7, lựa chọn C).
