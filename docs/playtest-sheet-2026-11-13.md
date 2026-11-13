# Phiếu Playtest LifeGraph (Đợt 6, 2026-11-13)

Mục tiêu: kiểm tra đời thứ ba có **khác rõ** hai đời trước không, và Space/Cây Sinh Mệnh còn nhàm không. Cần 3–5 người chưa từng thấy bản mới. Mỗi người chơi **3 đời liên tiếp**, khoảng 30–40 phút. Không hướng dẫn trước; chỉ nói "chơi tự nhiên".

## Người điều phối ghi lại
- Tên (hoặc mã), từng chơi game mô phỏng cuộc đời chưa: có / không.
- Với mỗi đời: tuổi chết, trọng tâm hay chọn nhất, có đóng cửa nào không (cây có vết cắt), câu truyện nhớ nhất.
- Có bấm Space liên tục mà không đọc không (quan sát).
- Có chỗ nào không biết bấm gì tiếp theo không (ghi tuổi và màn hình).

## Hỏi sau khi chơi (chấm 1–5)
1. Đời thứ ba khác hai đời trước ở mức nào? (1 = y hệt, 5 = rất khác)
2. Mỗi năm em có biết mình đang làm gì và vì sao không?
3. Chọn "trọng tâm năm" có thấy mình đánh đổi thật không?
4. Cây Sinh Mệnh có cho thấy câu chuyện riêng của đời này không?
5. Có đoạn nào nhàm không? Ở tuổi nào?
6. Truyện nào em nhớ nhất? Có chỗ nào thấy quá buồn / quá văn vẻ không?
7. Em muốn chơi tiếp đời thứ tư không? Vì sao?

## Ngưỡng đạt (spec mục 9)
- ≥ 3/5 người chấm câu 1 từ 4 trở lên.
- Câu 7: ít nhất một nửa muốn chơi tiếp.
- Không ai bị kẹt không qua được năm (câu "không biết bấm gì").

## Đo tự động song song (Lead chạy)
`node tools/life_diversity.mjs` (300 đời): độ trùng mẩu giữa hai đời < 40%, không mẩu nào > 8%. So sánh cân bằng với `docs/balance-report-2026-11-12.md` (không xấu quá 10%).
