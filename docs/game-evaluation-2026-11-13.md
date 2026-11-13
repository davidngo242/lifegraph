# Đánh Giá Toàn Diện LifeGraph & Khuyến Nghị Đi Tiếp (2026-11-13)

Người lập: Lead. Căn cứ: mã nguồn `main` (PR #17–#29), 171 commit từ 2026-11-07, số đo mô phỏng 300 đời, `balance-report-2026-11-12.md`.

## 1. Kết luận một câu
**Tiếp tục, nhưng chỉ khi đại tu theo hướng thu nhỏ:** cắt khoảng 60% tính năng, giữ lõi "một đời người Việt kể bằng câu chuyện", làm một vòng lan truyền thật (thẻ văn bia chia sẻ + "Đời hôm nay" dùng chung hạt giống), rồi đo bằng người thật trong 3–4 tuần. Không đạt ngưỡng thì dừng phát triển game, chuyển phần nội dung thành sản phẩm khác.

## 2. Hành trình đến hôm nay
| Giai đoạn | Làm gì | Nhận xét |
|---|---|---|
| 07–11/11 | Dựng nhanh: 3D avatar, sao trời, thú cưng, gacha tái sinh, tarot, minigame, chứng khoán, "MMO", siêu nhân học | Nhiều hệ thống, ít gắn với nhau. Mỗi hệ thống là một màn hình riêng |
| 11–12/11 | Sửa giao diện, theme, tài khoản, cân bằng kinh tế, gia phả chung | Làm sạch bề mặt, chưa đụng vào câu hỏi "chơi để làm gì" |
| 13/11 | Đời sinh từ hạt giống, NPC có ký ức, cửa không quay đầu, cây sinh mệnh, 80 mẩu làng hậu chiến | **Lần đầu game có bản sắc.** Đây là phần đáng giữ nhất |

Mã hiện có: khoảng 48 nghìn dòng, 62 component, khoảng 55 API, `routes/game.js` 3.828 dòng. Có 2 bộ nội dung chồng nhau: 80 mẩu viết tay, và kho 11.640 tình huống ghép tự động (`scenarioBank.js`).

## 3. Chấm theo 5 tiêu chí của Sếp (thang 10, hiện trạng)

### 3.1 Độc lạ, có thể lan truyền: **4/10**
- **Điểm mạnh:**
  - Chưa có game mô phỏng đời người nào kể bằng **ký ức Việt**: làng hậu chiến, nợ nần, giỗ chạp, dòng họ, văn bia.
  - NPC nhớ chuyện cũ và cửa đóng vĩnh viễn tạo ra những khoảnh khắc đáng kể lại.
- **Điểm yếu:** không có cơ chế nào để người chơi kể lại cho người khác.
  - Không có ảnh để chia sẻ.
  - Không có hạt giống chung để so sánh với bạn bè.
  - Không có câu hỏi kiểu "bạn chọn gì?".
- **So với thị trường:**
  - BitLife lan truyền nhờ kết cục trớ trêu chụp màn hình được, và một đời chỉ mất 10–15 phút.
  - Wordle lan truyền nhờ mọi người cùng chơi một đề rồi khoe ô kết quả.
  - LifeGraph hiện chưa có điểm nào trong hai điểm đó.

### 3.2 Giao diện thân thiện, chức năng mạch lạc: **3/10**
- Người mới gặp khoảng 15 hệ thống cùng lúc: thú cưng, gacha, tarot, cửa hàng karma, kỹ năng, tài sản, chứng khoán, minigame, siêu nhân học, thời tiết "MMO"…
- Chính Sếp đã nhận xét: "chưa biết trình tự chơi thế nào".
- Phần làm đúng nằm ở nhịp chọn trọng tâm năm và cây sinh mệnh. Nhưng phần này bị chìm giữa các bảng khác.
- Một đời 80 năm, mỗi năm một lần chọn, mất rất lâu. Phần lớn các năm không có chuyện gì đáng nhớ.

### 3.3 Trải nghiệm hấp dẫn, nhiều người truy cập, tương tác với nhau: **3/10**
- **Chơi một mình:**
  - Mục tiêu dễ thấy nhất vẫn là tiền.
  - Chiến lược tham tiền giàu gấp khoảng 60 lần chiến lược thụ động.
  - Chênh lệch tích cực/thụ động khoảng 22 lần.
  - Người chơi sẽ tối ưu tiền, đúng điều Sếp chán.
- **Tương tác giữa người chơi:**
  - "MMO" hiện là **dữ liệu tĩnh giả** (`services/mmoMacroService.js` trả hằng số).
  - Tương tác thật duy nhất là gia phả chung: đăng, thắp hương, nhận con nuôi. Phần này bất đồng bộ, đúng hướng nhưng còn mỏng.
- **Chịu tải:**
  - Backend Render gói free sẽ ngủ khi vắng khách và khởi động chậm.
  - Chưa đặt Postgres thì dữ liệu mất mỗi lần deploy.
  - Kiến trúc mỗi lượt gọi một API là đủ cho vài nghìn người. Không cần làm thời gian thực.

### 3.4 Lộ trình linh hoạt, cần chất xám, khó bị sao chép: **5/10**
- **Đúng hướng:**
  - Động cơ storylet: điều kiện, trọng số, hạt giống, ký ức NPC, ký ức dòng họ.
  - Nội dung là JSON có kiểm tra, nên viết thêm không cần sửa code.
- **Sự thật cần nói thẳng:**
  - Phần code ai cũng làm lại được bằng AI trong vài tuần.
  - **Hào chắn thật là nội dung và độ sâu văn hoá:**
    - Văn viết tay có giọng.
    - Các mẩu truyện móc nối với nhau qua ký ức NPC.
    - Cảm giác đúng thời đại.
    - Dữ liệu gia phả cộng đồng tích luỹ theo thời gian.
  - Hiện mới có 80 mẩu viết tay, trong khi 11.640 tình huống ghép tự động pha loãng chất lượng.
- **Nợ kỹ thuật:**
  - `game.js` quá lớn.
  - Nhiều hệ thống chết hoặc trang trí.
  - Tốc độ commit cao, nhiều tài liệu, nhưng nhiều công sức rơi vào phần sẽ phải cắt.

### 3.5 Chi phí thấp, mở rộng dần theo doanh thu: **7/10**
- Next.js cộng Node cộng Postgres đều chạy được trên gói miễn phí.
- Lõi game không cần gọi AI. Gemini chỉ là tuỳ chọn, nên chi phí theo người chơi gần bằng 0.
- Chi phí lớn nhất về sau là **người viết nội dung**, và đó chính là phần tạo giá trị.
- Bậc mở rộng:
  1. Frontend tĩnh trên Vercel/Netlify miễn phí.
  2. Backend khoảng 7 USD/tháng khi có người chơi đều.
  3. Postgres có quản lý khi vượt gói miễn phí.

**Tổng: 22/50.** Một tiêu chí mạnh (chi phí), một tiêu chí trung bình (kiến trúc), ba tiêu chí quyết định sống còn đang yếu (lan truyền, mạch lạc, hấp dẫn).

## 4. Vì sao vẫn nên tiếp tục
1. **Có một khoảng trống thật trên thị trường:** chưa có game kể đời người Việt có chiều sâu. Giới trẻ chia sẻ mạnh nội dung hoài niệm, thế hệ và gia đình.
2. **Phần khó nhất về thiết kế đã có:** động cơ hạt giống, ký ức, cửa và dòng họ. Từ đây chỉ cần cắt bớt và đóng gói.
3. **Chi phí kiểm chứng rất thấp:** 3–4 tuần, hạ tầng miễn phí, ngưỡng dừng rõ ràng.

## 5. Vì sao không được đi tiếp theo đà cũ
- Mỗi tính năng mới đang làm game rối hơn, không cuốn hơn.
- Vòng chơi lõi vẫn là cày tiền qua từng năm.
- Không có số liệu thật nào về hành vi người chơi. Chưa đo tỷ lệ chơi hết đời, chơi đời thứ hai hay chia sẻ.

## 6. Phương án đại tu: "Một Đời" (đề xuất)

### 6.1 Định vị
"**Sống trọn một đời người Việt trong 15 phút. Mỗi lựa chọn khắc lên văn bia.**" Game kể chuyện có lựa chọn, không phải game quản lý tài chính.

### 6.2 Giữ / Cắt / Ẩn
| Giữ (lõi) | Ẩn sau cờ, xét lại sau | Cắt |
|---|---|---|
| Hạt giống đời, NPC có ký ức, cửa không quay đầu, 80 mẩu viết tay | Kỹ năng, tài sản, minigame | "MMO" giả, chứng khoán, siêu nhân học |
| Cây sinh mệnh (bản đồ câu chuyện), văn bia, gia phả chung | Thú cưng, avatar 3D | Gacha tái sinh, tarot, cửa hàng karma |
| Nhịp trọng tâm năm (rút gọn) | | Kho 11.640 tình huống ghép tự động (chỉ giữ làm nền nếu thiếu truyện) |

### 6.3 Vòng chơi mới (một đời khoảng 15 phút)
1. Sinh ra: thấy hạt giống, gồm quê, gia cảnh và sợi định mệnh.
2. **12–18 chương.** Mỗi chương là một mẩu truyện có NPC đặt tên, lựa chọn có giá.
   - Những năm không có chuyện thì trôi qua bằng một dòng nhật ký, không bắt bấm.
3. Tiền chỉ là một chỉ số phụ. Đích đến là **văn bia**: 3 câu kể đời bạn dựa trên các cửa đã đóng.
4. Chết thì có hai lựa chọn: tái sinh làm con cháu (mang ký ức dòng họ), hoặc chơi "Đời hôm nay".

### 6.4 Vòng lan truyền (phần còn thiếu nhất)
1. **Thẻ văn bia dạng ảnh:**
   - Ảnh dọc chia sẻ được lên Facebook, Zalo, TikTok.
   - Ảnh có câu văn bia, 3 ngã rẽ lớn và đường dẫn chơi.
2. **"Đời hôm nay":**
   - Mỗi ngày một hạt giống chung cho mọi người.
   - Cuối đời game hiện tỷ lệ: "62% người chơi đã ở lại gặt lúa, bạn thì không".
3. **Gia phả chung có thêm "nối dõi":**
   - Bạn bè nhận đời của nhau làm tổ tiên.
   - Ký ức dòng họ truyền qua nhiều người chơi thật.
   - Đây là tương tác bất đồng bộ, rẻ, không cần máy chủ thời gian thực.

### 6.5 Đo lường (bắt buộc trước khi làm thêm)
Ghi sự kiện nhẹ vào Postgres, không dùng dịch vụ ngoài:

| Chỉ số | Ngưỡng tiếp tục |
|---|---|
| Người mới chơi hết đời đầu | ≥ 50% |
| Chơi đời thứ hai trong cùng phiên | ≥ 35% |
| Chia sẻ thẻ văn bia | ≥ 10% số đời hoàn thành |
| Quay lại ngày hôm sau ("Đời hôm nay") | ≥ 20% |

**Ngưỡng dừng:** sau 2 vòng thử với 30 người trở lên mà dưới một nửa số ngưỡng đạt, thì dừng làm game. Khi đó, phần nội dung có thể chuyển thành truyện tương tác hoặc sách/podcast.

### 6.6 Lộ trình và chi phí
| Tuần | Việc | Chi phí |
|---|---|---|
| 1 | Cắt và ẩn hệ thống, gom nhịp chơi thành chương, tách `game.js` theo phần lõi | 0 USD (công làm) |
| 2 | Thẻ văn bia dạng ảnh, "Đời hôm nay", ghi sự kiện đo lường; đặt Postgres và deploy | 0 USD (gói free) |
| 3 | Thêm 30–40 mẩu viết tay cho tuổi 10–39 và tuổi 80; playtest 5 người | công viết |
| 4 | Thả cho 30–50 người, đo 4 chỉ số, quyết đi tiếp hay dừng | 0–7 USD |
| Sau đó, nếu đạt | Thời đại thứ 2 (đô thị Đổi Mới), chế độ viết truyện cho cộng đồng có kiểm duyệt | tăng theo doanh thu |

**Doanh thu**, chỉ làm sau khi đạt ngưỡng:
- Bán gói thời đại mới.
- Khung thẻ văn bia đẹp.
- Ủng hộ tự nguyện.
- Quảng cáo nhẹ có thưởng, không chặn lối chơi.

## 7. Cần Sếp chốt
1. Duyệt hướng "Một Đời": cắt và ẩn theo bảng 6.2.
2. **Gom năm thành chương.** Những năm không có chuyện sẽ tự trôi bằng một dòng nhật ký.
   - Việc này khác với chế độ "Trôi năm" Sếp đã bỏ: người chơi không trôi cả quãng đời, chỉ bỏ qua những năm trống.
   - Nhịp chọn trọng tâm năm đổi thành chọn theo chương.
3. Chấp nhận 4 chỉ số và ngưỡng dừng ở mục 6.5.
4. Ai viết nội dung lâu dài: Lead viết, Sếp duyệt giọng; hay thuê người viết khi có ngân sách.
