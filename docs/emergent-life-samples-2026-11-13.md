# 5 Mẩu Truyện Mẫu: Làng Hậu Chiến (Đợt 0, chờ Sếp chấm giọng văn)

Mục đích: Sếp chấm **giọng văn, độ nặng của lựa chọn và cách mẩu truyện bám vào nhân vật**. Chưa nạp vào game. Định dạng theo `docs/emergent-life-spec-2026-11-13.md` mục 3.3.
Ký hiệu: `{địch_thủ}`, `{người_thầy}`... là NPC của đời này (tên sinh theo hạt giống). 🔒 = không quay đầu.

---

## 1. Chiếc Cặp Sách Rách (tuổi 7–10)
**Điều kiện:** `era=làng_hậu_chiến`, `family_state ∈ {nợ_nần, cha_mẹ_ly_tán}`, chưa có cờ `đi_học_đều`.

> Sáng đầu tuần, quai cặp bạn đứt hẳn. Mẹ vá bằng sợi dây lạt, nhưng cả lớp đã thấy. {địch_thủ} hích vai bạn bè, cười khẽ. Ngoài cổng trường, {người_thầy} đứng im, nhìn chiếc cặp rồi nhìn bạn.

| Lựa chọn | Kết quả |
|---|---|
| **Đeo luôn chiếc cặp vá, ngẩng đầu vào lớp** | +Ý chí. {địch_thủ} ghi nhớ "thằng/đứa nghèo cứng đầu" (ký ức: `bị_khinh`). {người_thầy} mến: +Tin cậy |
| **Giấu cặp vào góc tường, mang sách trên tay** | Học được nhưng hay quên sách. −Tự tin. Mở mẩu "Cuốn Sách Mất Tích" |
| **Nghỉ buổi này, ra bờ sông mò cua đổi tiền mua quai mới** | +$ nhỏ, −Học vấn. 🔒 đóng cửa `đi_học_đều` năm nay; mở mẩu "Người Lớn Quá Sớm" |

---

## 2. Bức Thư Từ Bên Kia Sông (tuổi 13–16)
**Điều kiện:** `fate_thread=cha_giấu_nợ`, chưa có cờ `biết_sự_thật`.

> Bác đưa thư viết vội bằng chữ xiêu vẹo: "Cha cháu còn nợ ông Tám một mạng người hồi trước. Chuyện chưa xong." Mẹ thấy bạn cầm thư, lặng lẽ tắt đèn dầu. Cả đêm bạn nghe tiếng mẹ khóc nén sau vách.

| Lựa chọn | Kết quả |
|---|---|
| **Hỏi thẳng cha** | Cha im rất lâu rồi kể một nửa. Mở nhánh `đối_diện`; −Gia đạo ngắn hạn, +Chân thật |
| **Giấu thư, lên nhà ông Tám dò xem** | Gặp NPC {chủ_nợ}. 🔒 mở cửa `biết_một_mình`: bạn nắm bí mật nhưng không còn tin được cha |
| **Đốt thư, coi như chưa từng đọc** | Yên ổn thêm vài năm. Sợi định mệnh **nổ vào tuổi 30** đúng lúc bạn có nhiều thứ để mất |

---

## 3. Mùa Gặt Không Đủ Người (tuổi 16–25, mỗi năm xét lại)
**Điều kiện:** `era=làng_hậu_chiến`, đang ở làng, có `người_thương` hoặc đã lập gia đình.

> Trời đổ mưa sớm, lúa chín ngả rạp. Cả xóm chạy đua với cơn mưa. {người_thương} đứng cuối bờ ruộng, tay ôm bó lúa, nhìn bạn: lá thư gọi lên thành phố học nghề của bạn vẫn nằm trong túi áo, hạn nhận chỉ còn đến mai.

| Lựa chọn | Kết quả |
|---|---|
| **Ở lại gặt cho xong** | +Quan hệ {người_thương}, +Uy tín làng. Cánh cửa `lên_thành_phố` **đóng** 🔒 trừ khi có người đỡ đầu |
| **Đưa lúa cho xóm, lên đường ngay** | Mở thời đại mới (`era` chuyển dần sang `đô_thị_bùng_nổ`). {người_thương} hoặc đi cùng hoặc chờ, hoặc quên, tuỳ ký ức |
| **Hứa quay lại sau mùa, xin hoãn thư** | 50/50 theo Tin cậy với {người_thầy}: được hoãn một năm hoặc mất hẳn suất |

---

## 4. Bữa Cơm Có Khách (tuổi 20–40)
**Điều kiện:** có NPC {địch_thủ} với ký ức `bị_khinh` **hoặc** `bị_phản_bội`.

> {địch_thủ} bây giờ là người có tiếng ở xã. Nhà bạn đang túng, và đúng lúc đó ông ta gõ cửa mang theo chai rượu: "Chuyện cũ bỏ qua. Tôi có việc cần người như anh." Mẹ bạn liếc nhìn mâm cơm trống một nửa.

| Lựa chọn | Kết quả |
|---|---|
| **Nhận lời, bỏ qua chuyện cũ** | +$$ lớn, mở nghề mới. Karma giảm nếu việc đó hại người làng. Ký ức NPC: `được_mua_chuộc` |
| **Mời vào ăn cơm nhưng từ chối việc** | Thế giằng co kéo dài; {địch_thủ} đổi thái độ theo cách bạn đối xử |
| **Đóng cửa, không nói gì** | Giữ nguyên khí tiết. Mất cơ hội; {địch_thủ} chuyển thành đối thủ chủ động (mở chuỗi truyện cạnh tranh) |

*(Nếu ký ức là `được_giúp_đỡ` thì mẩu này **không** hiện; thay bằng mẩu "Người Đến Trả Ơn".)*

---

## 5. Ngày Giỗ Cuối (tuổi 55+)
**Điều kiện:** có NPC gia đình còn sống, tuổi ≥ 55, và ít nhất một cánh cửa đã đóng.

> Mâm giỗ năm nay thiếu một chiếc ghế. Con cháu về đông, ồn ã, nhưng {người_thân_xa} ngồi riêng ở hiên, không động đũa. Bạn biết lý do: chuyện bạn chọn năm {năm_cửa_đóng}. Bây giờ chỉ còn bạn có thể nói, và còn bao nhiêu năm để nói.

| Lựa chọn | Kết quả |
|---|---|
| **Ra hiên, kể ra điều chưa từng kể** | Gỡ ký ức xấu; ghi vào **văn bia**: "Người dám nói lời muộn". +Ý nghĩa, có thể mất niềm kiêu hãnh |
| **Gửi con cháu đến thay, giữ sĩ diện** | Mâm giỗ êm. Văn bia ghi: "Người giữ nguyên lời chưa nói" |
| **Chuyển điều đó thành lời dặn trong di chúc** | Truyền xuống kiếp sau như **di sản kiến thức** (bí mật dòng họ). Kiếp sau mở được một mẩu truyện mới |

---

## Tự đánh giá của em (để Sếp đối chiếu)
- Mẩu 1, 3, 5: kể bằng hình ảnh nhỏ, lựa chọn nặng ở **mất gì**, không phải được gì.
- Mẩu 2, 4: tận dụng NPC và sợi định mệnh, đúng ý "câu chuyện đi theo người quanh bạn".
- Mẩu 4 và 5 là hai ví dụ **cùng một mẩu hiện khác nhau theo ký ức** (xem ghi chú dưới mẩu 4), đây là cách đạt tiêu chí "hai đời khác nhau".
- Điều em chưa chắc: độ **buồn/nặng** có hợp tinh thần game không, và lời văn có quá Bắc Bộ không (cân nhắc thêm biến thể giọng Nam/Trung theo quê nhân vật).

## Sếp chấm giúp
1. Giọng văn: **giữ / nhẹ hơn / nặng hơn / bớt văn vẻ**?
2. Có giữ độ buồn như trên, hay thêm mẩu hài/ấm xen vào?
3. Duyệt hướng này để em chuyển sang Đợt 1 (code bộ chọn truyện) không?
