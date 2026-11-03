// section_features_g5.js
export const sectionFeaturesG5 = `
    <!-- 13. NHÓM 5: LUÂN HỒI NGHIỆP QUẢ, GACHA LINH HỒN & AN TOÀN HỆ THỐNG -->
    <section id="g5">
      <h2>13. Nhóm 5: Luân hồi Nghiệp quả, Gacha Linh hồn & An toàn Hệ thống</h2>

      <!-- LG-F15 -->
      <article class="feature" id="LG-F15">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F15</span>
            <h3>Vòng luân hồi Nghiệp báo & Gacha Linh hồn (Rebirth & Soul Gacha)</h3>
          </div>
          <p class="caption">Hệ thống chuyển kiếp siêu hình học: Khi một kiếp sống khép lại, toàn bộ công đức và tội lỗi được chuyển hóa thành Điểm Nghiệp Quả (Karma Points) nạp vào bảng vĩnh cửu <code>player_accounts</code>. Người chơi sử dụng Karma để rút thẻ bài Tarot và quay Gacha định mệnh chọn lựa tư chất bẩm sinh cho kiếp sống tiếp theo.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Đài Luân Hồi & Gacha Linh Hồn (Soul Rebirth Gacha)</b></div>
              <div class="ui-page" style="background:#090d16;color:#f8fafc;padding:24px;">
                <div style="text-align:center;display:grid;gap:14px;">
                  <div style="font-size:12px;color:#a5b4fc;text-transform:uppercase;letter-spacing:0.1em;">Cõi Vô Thường · Chuyển Kiếp Tái Sinh</div>
                  <div style="font-size:20px;font-weight:700;color:#c7d2fe;">BỐC QUẺ ĐỊNH MỆNH KIẾP SAU</div>
                  <div style="display:inline-flex;justify-content:center;gap:10px;">
                    <span class="ui-tag gold" style="font-size:13px;padding:4px 12px;">🌟 Điểm Karma vĩnh cửu: 280</span>
                    <span class="ui-tag" style="background:#312e81;color:#e0e7ff;border-color:#4338ca;">Kiếp thứ: 3</span>
                  </div>

                  <!-- 3 LÁ BÀI TAROT GACHA -->
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px;">
                    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border:2px solid #818cf8;border-radius:8px;padding:16px;box-shadow:0 0 15px rgba(129,140,248,0.3);">
                      <div style="font-size:28px;">🧠</div>
                      <div style="font-weight:700;font-size:14px;color:#e0e7ff;margin:8px 0;">Gen Trí Tuệ Thiên Tài</div>
                      <div style="font-size:11.5px;color:#c7d2fe;">Độ hiếm: <b style="color:#fbbf24;">LEGENDARY</b></div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:6px;">+4 vào tất cả thử thách học thuật và công nghệ</div>
                      <button class="ui-btn p sm" style="width:100%;margin-top:10px;background:#4f46e5;">Đã Mở Khóa</button>
                    </div>

                    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid #4338ca;border-radius:8px;padding:16px;">
                      <div style="font-size:28px;">👑</div>
                      <div style="font-weight:700;font-size:14px;color:#e0e7ff;margin:8px 0;">Xuất Thân Trâm Anh Thế Phiệt</div>
                      <div style="font-size:11.5px;color:#c7d2fe;">Độ hiếm: <b style="color:#f43f5e;">MYTHIC</b></div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:6px;">Khởi đầu với gia sản 5 Tỷ VND và quan hệ tầng lớp thượng lưu</div>
                      <button class="ui-btn sm pl" style="width:100%;margin-top:10px;">Mua với 150 Karma</button>
                    </div>

                    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid #4338ca;border-radius:8px;padding:16px;">
                      <div style="font-size:28px;">❤️</div>
                      <div style="font-weight:700;font-size:14px;color:#e0e7ff;margin:8px 0;">Duyên Lành Quý Nhân</div>
                      <div style="font-size:11.5px;color:#c7d2fe;">Độ hiếm: <b style="color:#38bdf8;">RARE</b></div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:6px;">Luôn gặp người tốt nâng đỡ trong những giai đoạn ngặt nghèo</div>
                      <button class="ui-btn sm pl" style="width:100%;margin-top:10px;">Mua với 60 Karma</button>
                    </div>
                  </div>

                  <button class="ui-btn p" style="justify-self:center;background:#059669;padding:0 32px;font-size:14px;height:38px;margin-top:12px;">
                    ✨ Bắt Đầu Kiếp Sống Mới (Nhập Thể)
                  </button>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Trường thông tin</th><th>Kiểu</th><th>Mapping CSDL</th><th>Quy tắc luân hồi</th></tr></thead>
              <tbody>
                <tr><td class="f">Karma vĩnh cửu</td><td>INT</td><td class="map"><code>player_accounts.total_karma</code></td><td>Tích lũy từ điểm số cuộc đời cũ, không bao giờ bị xóa</td></tr>
                <tr><td class="f">Tư chất đã mở khóa</td><td>JSONB Array</td><td class="map"><code>player_accounts.unlocked_perks</code></td><td>Lưu trữ các perk vĩnh viễn đã mua để áp dụng vào nhân vật mới</td></tr>
                <tr><td class="f">Số lần luân hồi</td><td>INT</td><td class="map"><code>player_accounts.reincarnation_count</code></td><td>Tự động tăng <code>reincarnation_count = count + 1</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Khởi tạo nhân vật kiếp mới kế thừa tư chất từ Soul Gacha</summary>
<pre>BEGIN;
  -- 1. Tăng số kiếp luân hồi trong tài khoản vĩnh cửu
  UPDATE player_accounts
  SET 
      reincarnation_count = reincarnation_count + 1,
      total_karma = total_karma - :spent_karma + :earned_karma,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 'primary_player';

  -- 2. Tạo nhân vật sơ sinh kiếp mới
  INSERT INTO characters (
      player_account_id, name, age, generation, nationality,
      vitality, max_vitality, burnout, cash, innate_traits
  ) VALUES (
      'primary_player', :new_name, 0, 1, :chosen_country,
      100, 100, 0, 0, :selected_gacha_perks
  ) RETURNING id;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Rebirth Gacha UI
  participant BE as Engine (/rebirth)
  participant DB as CSDL
  U->>FE: Chọn mua tư chất "Gen Trí Tuệ" & bấm "Bắt Đầu Kiếp Sống Mới"
  FE->>BE: POST /api/game/rebirth { selected_perks: ['genius_mind'], country: 'T2_Vietnam' }
  BE->>DB: Trừ điểm Karma trong player_accounts & khởi tạo nhân vật kiếp mới
  DB-->>BE: Hoàn tất khởi tạo (character_id mới)
  BE-->>FE: Trả về dữ liệu em bé sơ sinh kiếp mới
  FE-->>U: Hiển thị hoạt họa chuyển sinh ánh sáng và mở màn kiếp mới
</pre>
          </div>
        </div>
      </article>

      <!-- LG-F16 -->
      <article class="feature" id="LG-F16">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F16</span>
            <h3>Tử kỳ & Video Death Recap 15s (End of Life Chronicle)</h3>
          </div>
          <p class="caption">Hồi kết trang trọng cho một kiếp người. Khi nhân vật cạn kiệt sinh lực hoặc qua đời vì tuổi già, hệ thống tự động tổng hợp toàn bộ các dấu mốc chói lọi, biến động đồ thị tài sản và mối lương duyên thành <b>Cuộn phim Hồi ký 15 giây (Death Recap)</b> kèm nguyên nhân lâm chung và đánh giá độ viên mãn cuộc đời.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Hồi Ký Tổng Kết Cuộc Đời (Death Recap Chronicle)</b></div>
              <div class="ui-page" style="background:#0f172a;color:#f8fafc;padding:24px;">
                <div style="border:1px solid #334155;border-radius:8px;padding:20px;display:grid;gap:14px;background:#1e293b;">
                  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:12px;">
                    <div>
                      <div style="font-size:20px;font-weight:700;color:#f8fafc;">🕯️ CỐ NHÂN: NGUYỄN AN</div>
                      <div style="font-size:12px;color:#94a3b8;">Hưởng thọ: <b>82 tuổi</b> · Nguyên nhân: Tuổi cao an nghỉ thanh thản</div>
                    </div>
                    <span class="ui-tag gold" style="font-size:13px;padding:4px 12px;">Đánh giá: BẬC ĐẠI PHÚ ĐẠI QUÝ</span>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
                    <div style="background:#0f172a;padding:10px;border-radius:6px;border:1px solid #334155;">
                      <div style="font-size:11px;color:#94a3b8;">ĐỈNH CAO TÀI SẢN</div>
                      <div style="font-size:16px;font-weight:700;color:#34d399;">36.5 Tỷ ₫</div>
                    </div>
                    <div style="background:#0f172a;padding:10px;border-radius:6px;border:1px solid #334155;">
                      <div style="font-size:11px;color:#94a3b8;">HẬU DUỆ NỐI DÕI</div>
                      <div style="font-size:16px;font-weight:700;color:#818cf8;">2 Con · 5 Cháu</div>
                    </div>
                    <div style="background:#0f172a;padding:10px;border-radius:6px;border:1px solid #334155;">
                      <div style="font-size:11px;color:#94a3b8;">CÔNG ĐỨC KARMA TÍCH LŨY</div>
                      <div style="font-size:16px;font-weight:700;color:#fbbf24;">+125 Điểm</div>
                    </div>
                  </div>

                  <div style="font-size:13px;color:#cbd5e1;line-height:1.6;background:#0f172a;padding:12px;border-radius:6px;">
                    <i>"Một đời thanh liêm, khởi nghiệp từ hai bàn tay trắng, tạo dựng cơ nghiệp công nghệ vang danh và để lại di sản mẫu mực cho muôn đời con cháu..."</i>
                  </div>

                  <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button class="ui-btn" style="background:#334155;color:#fff;border-color:#475569;">▶ Xem Lại Video Recap 15s</button>
                    <button class="ui-btn p" style="background:#4f46e5;">Bước Vào Đài Luân Hồi</button>
                  </div>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Trường tổng kết</th><th>Nguồn dữ liệu</th><th>Mapping CSDL</th></tr></thead>
              <tbody>
                <tr><td class="f">Tuổi thọ lâm chung</td><td>Tuổi tại thời điểm sinh lực = 0</td><td class="map"><code>characters.death_age</code></td></tr>
                <tr><td class="f">Nguyên nhân tử vong</td><td>Lý do kết thúc cuộc đời</td><td class="map"><code>characters.death_cause</code> ('Tuổi già', 'Lao lực đột quỵ', 'Tai nạn')</td></tr>
                <tr><td class="f">Dòng thời gian (Timeline)</td><td>Các mốc son cuộc đời phục vụ video recap</td><td class="map"><code>characters.timeline_snapshots</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Đóng băng nhân vật và tính toán điểm Karma hồi kết</summary>
<pre>UPDATE characters
SET 
    is_deceased = TRUE,
    death_age = age,
    death_cause = :cause_of_death,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Death Recap Modal
  participant BE as Engine (/death-recap)
  participant DB as CSDL
  BE->>DB: Kiểm tra characters.vitality <= 0
  Note over BE: Đóng băng kiếp sống (is_deceased = true)<br/>Tổng hợp toàn bộ snapshot tài sản, danh hiệu, con cái<br/>Tính toán điểm công đức Karma thưởng thêm
  BE-->>FE: Trả về gói dữ liệu tổng kết cuộc đời
  FE-->>U: Trình chiếu chuỗi hồi ký 15 giây trang trọng
</pre></div>
        </div>
      </article>

      <!-- LG-F17 -->
      <article class="feature" id="LG-F17">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F17</span>
            <h3>Bảo mật Phiên & Chống gian lận mật mã (HMAC-SHA256 Handshake)</h3>
          </div>
          <p class="caption">Hệ thống bảo vệ tính toàn vẹn của trò chơi. Mọi phiên đăng nhập bắt buộc phải thực hiện bắt tay mã hóa (Cryptographic Handshake) để cấp phát Session Token có chữ ký số HMAC-SHA256. Mọi hành động nhạy cảm (mua tài sản, cộng tiền, tung xúc xắc) đều được xác minh chữ ký và ghi nhận nhật ký an ninh tự động.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Bảng Giám Sát An Ninh & Kiểm Soát Gian Lận</b></div>
              <div class="ui-page">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <div>
                    <div style="font-size:15px;font-weight:700;">Hệ Thống Khiên Bảo Mật (Cryptographic Shield)</div>
                    <div style="font-size:12px;color:#64748b;">Trạng thái: <b style="color:#059669;">Hoạt động bình thường · Chữ ký HMAC-SHA256</b></div>
                  </div>
                  <span class="ui-tag s">Không phát hiện can thiệp</span>
                </div>

                <div class="ui-tw">
                  <table class="ui-t">
                    <thead><tr><th>Thời gian</th><th>Sự kiện</th><th>Mã phiên</th><th>Địa chỉ IP</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>14:32:01</td>
                        <td class="f">Handshake Cấp Token</td>
                        <td><code>sess_9f81a7b...</code></td>
                        <td>118.70.12.4</td>
                        <td><span class="ui-tag s">Hợp lệ</span></td>
                      </tr>
                      <tr>
                        <td>14:32:15</td>
                        <td class="f">Xác minh chữ ký /action/buy-asset</td>
                        <td><code>sess_9f81a7b...</code></td>
                        <td>118.70.12.4</td>
                        <td><span class="ui-tag s">Đã ký HMAC</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Cơ chế</th><th>Thuật toán</th><th>Mục đích</th><th>Hành động khi phát hiện lỗi</th></tr></thead>
              <tbody>
                <tr><td class="f">Bắt tay mã hóa</td><td>HMAC-SHA256</td><td>Cấp phát chữ ký số cho từng phiên người chơi</td><td>Từ chối kết nối nếu Token hết hạn</td></tr>
                <tr><td class="f">Kiểm tra chữ ký hành động</td><td>Payload Signature Verification</td><td>Ngăn chặn việc sửa đổi số dư cash hay sinh lực từ client</td><td>Khóa tài khoản và ghi nhận Security Incident</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Ghi nhận nhật ký an ninh và phát hiện can thiệp</summary>
<pre>INSERT INTO security_audit_logs (session_id, action_name, is_tampered, ip_address, incident_details)
VALUES (:session_id, 'VERIFY_DICE_INTEGRITY', FALSE, :client_ip, 'Chữ ký hợp lệ, dữ liệu toàn vẹn');</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Trình duyệt Client
  participant BE as Backend Security Filter
  participant DB as CSDL
  U->>BE: POST /api/game/auth/handshake { client_id }
  Note over BE: Tạo Session ID & Ký mật mã HMAC-SHA256 bằng Server Secret Key
  BE-->>U: Trả về { session_id, session_token }
  U->>BE: Gửi yêu cầu mua tài sản kèm Header (x-session-token)
  BE->>BE: Kiểm tra tính toàn vẹn của chữ ký số
  BE->>DB: Thực thi nếu chữ ký hợp lệ (chặn đứng 100% gian lận can thiệp)
</pre></div>
        </div>
      </article>

      <!-- LG-F18 -->
      <article class="feature" id="LG-F18">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F18</span>
            <h3>Khát vọng trọn đời & Tiến trình Siêu việt (Transhumanism & Nirvana)</h3>
          </div>
          <p class="caption">Hành trình tối hậu của kiếp người: Vượt qua các biến cố phàm trần để chinh phục Khát Vọng Trọn Đời (Lifelong Aspiration). Mở khóa công nghệ cấy ghép công nghệ sinh học (Transhumanism - Khóa vĩnh viễn sinh lực không bị lão hóa) hoặc giác ngộ cảnh giới Niết Bàn (Nirvana) giải thoát khỏi vòng luân hồi sinh tử.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Tiến Trình Siêu Việt & Khát Vọng Trọn Đời</b></div>
              <div class="ui-page">
                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:16px;display:grid;gap:14px;">
                  <div>
                    <span class="ui-tag gold">Cảnh Giới Tối Hậu</span>
                    <h3 style="font-size:16px;margin-top:6px;">Khát Vọng: Đại Hiền Triết & Bất Tử Thể (Transhumanism)</h3>
                    <p style="font-size:12.5px;color:#64748b;margin-top:4px;">Bạn đã tích lũy đủ thành tựu khoa học và nguồn tài chính để thực hiện đại phẫu thuật cấy ghép Nano sinh học.</p>
                  </div>

                  <div style="background:#eef2ff;border:1px solid #c7d2fe;padding:12px;border-radius:6px;font-size:13px;color:#3730a3;">
                    <b>✨ Hiệu ứng Siêu Việt Hóa:</b>
                    <ul style="margin-top:6px;">
                      <li>Khóa vĩnh viễn mức trần Sinh lực ở <b>100/100</b>, triệt tiêu hoàn toàn quá trình già hóa sinh học.</li>
                      <li>Kháng 100% các bệnh nan y tuổi già.</li>
                      <li>Nhận thêm danh hiệu <i>Thực Thể Siêu Việt</i> tại ban thờ tổ tiên.</li>
                    </ul>
                  </div>

                  <button class="ui-btn p" style="background:#4338ca;justify-self:start;">
                    ⚡ Kích Hoạt Dự Án Bất Tử Thể (Tiêu hao 5 Tỷ ₫ + 50 Karma)
                  </button>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Trường trạng thái</th><th>Kiểu</th><th>Mapping CSDL</th><th>Đặc quyền kích hoạt</th></tr></thead>
              <tbody>
                <tr><td class="f">Cờ Bất tử thể</td><td>BOOLEAN</td><td class="map"><code>characters.is_transhuman</code></td><td>Đặt = true, bỏ qua toàn bộ công thức trừ Max Vitality của TickEngine</td></tr>
                <tr><td class="f">Khóa suy giảm tuổi</td><td>INT</td><td class="map"><code>characters.transhuman_frozen_until_age</code></td><td>Cố định sinh lực tối đa 100 đến tuổi 150+</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Kích hoạt trạng thái Siêu Việt Hóa Transhumanism</summary>
<pre>UPDATE characters
SET 
    is_transhuman = TRUE,
    vitality = 100,
    max_vitality = 100,
    cash = cash - 5000000000,
    hidden_flags = hidden_flags || '["transhuman_ascension"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id AND cash >= 5000000000;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Aspiration Modal
  participant BE as Engine (/transhumanism)
  participant DB as CSDL
  U->>FE: Bấm chọn "Kích Hoạt Dự Án Bất Tử Thể"
  FE->>BE: POST /api/game/transhumanism
  BE->>DB: Kiểm tra điều kiện (tài chính >= 5 Tỷ, chỉ số trí tuệ cao)
  Note over BE: Kích hoạt cờ is_transhuman = true<br/>Khóa Max Vitality = 100 không suy giảm theo tuổi
  BE->>DB: Cập nhật characters
  DB-->>BE: Xác nhận thành công
  BE-->>FE: Trả kết quả siêu việt hóa
  FE-->>U: Hiển thị giao diện hào quang cơ khí sinh học tối tân
</pre></div>
        </div>
      </article>
    </section>
`;
