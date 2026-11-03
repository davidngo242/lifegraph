// section_features_g4.js
export const sectionFeaturesG4 = `
    <!-- 12. NHÓM 4: GIA TỘC, HÔN NHÂN & CHUYỂN GIAO DI SẢN -->
    <section id="g4">
      <h2>12. Nhóm 4: Gia tộc, Hôn nhân & Chuyển giao Di sản</h2>

      <!-- LG-F12 -->
      <article class="feature" id="LG-F12">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F12</span>
            <h3>Mối quan hệ gia đình, Tình yêu & Hôn nhân (Family Sanctum)</h3>
          </div>
          <p class="caption">Hệ thống gia đình và tình duyên cho phép người chơi tìm kiếm bạn đời, kết hôn, sinh con và chăm sóc con cái. Điểm gắn kết tình cảm (Affection Level) tác động trực tiếp đến hạnh phúc gia đình, sự phát triển trí tuệ của con cái và chi phí sinh hoạt gia đình.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Tổ Ấm Gia Đình & Con Cái (Family Sanctum)</b></div>
              <div class="ui-page">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <div>
                    <div style="font-size:15px;font-weight:700;">Hồ Sơ Hôn Nhân & Thành Viên Gia Đình</div>
                    <div style="font-size:12px;color:#64748b;">Tình trạng: Đã kết hôn (6 năm) · 1 Con gái</div>
                  </div>
                  <button class="ui-btn p">+ Sinh thêm con</button>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
                  <div style="border:1px solid #cbd5e1;border-radius:6px;padding:12px;background:#fff;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:40px;height:40px;border-radius:50%;background:#ec4899;color:#fff;display:grid;place-items:center;font-size:18px;">👰</div>
                      <div>
                        <div style="font-weight:700;font-size:13.5px;">Lê Mai Phương (Vợ)</div>
                        <div style="font-size:11.5px;color:#64748b;">Nghề: Giảng viên đại học · 32 tuổi</div>
                      </div>
                    </div>
                    <div style="margin-top:10px;font-size:12px;">
                      <div style="display:flex;justify-content:space-between;"><span>Mức độ hạnh phúc:</span><b style="color:#059669;">85/100</b></div>
                      <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:85%;background:#ec4899;"></div></div>
                    </div>
                  </div>

                  <div style="border:1px solid #cbd5e1;border-radius:6px;padding:12px;background:#fff;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:40px;height:40px;border-radius:50%;background:#3b82f6;color:#fff;display:grid;place-items:center;font-size:18px;">👧</div>
                      <div>
                        <div style="font-weight:700;font-size:13.5px;">Nguyễn Bảo Châu (Con gái)</div>
                        <div style="font-size:11.5px;color:#64748b;">Học sinh lớp 1 · 6 tuổi · Thừa kế gen thông minh</div>
                      </div>
                    </div>
                    <div style="margin-top:10px;font-size:12px;">
                      <div style="display:flex;justify-content:space-between;"><span>Điểm tình phụ tử:</span><b style="color:#3b82f6;">92/100</b></div>
                      <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:92%;background:#3b82f6;"></div></div>
                    </div>
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
              <thead><tr><th>Trường hiển thị</th><th>Quan hệ</th><th>Mapping CSDL</th><th>Hành vi nghiệp vụ</th></tr></thead>
              <tbody>
                <tr><td class="f">Người phối ngẫu</td><td>Vợ / Chồng</td><td class="map"><code>relationships.type = 'spouse'</code></td><td>Cùng đóng góp thu nhập và hồi phục tinh thần cho nhân vật</td></tr>
                <tr><td class="f">Con cái</td><td>Con trai / Con gái</td><td class="map"><code>relationships.type = 'child'</code></td><td>Kế thừa các tư chất bẩm sinh, là ứng viên thừa kế cho thế hệ sau</td></tr>
                <tr><td class="f">Mức độ hạnh phúc</td><td>0 đến 100</td><td class="map"><code>relationships.affection_level</code></td><td>Nếu &lt; 20 có nguy cơ ly hôn, phân chia 50% tài sản ròng</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Khởi tạo quan hệ sinh con mới và kế thừa tư chất</summary>
<pre>INSERT INTO relationships (character_id, type, name, affection_level, inherited_traits)
VALUES (
    :character_id,
    'child',
    :child_name,
    90,
    jsonb_build_array('Gen thông minh', 'Ý chí kiên định')
);</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Family Modal
  participant BE as Engine (/action/family)
  participant DB as CSDL
  U->>FE: Bấm nút "Chào đón thành viên mới (Sinh con)"
  FE->>BE: POST /api/game/action/family { action: 'have_child', partner_id }
  BE->>DB: Đọc tư chất cha mẹ từ characters & relationships
  Note over BE: Kết hợp gen di truyền (50% cha, 50% mẹ)<br/>Đặt tên ngẫu nhiên theo gia phả dòng họ
  BE->>DB: Tạo bản ghi mới trong bảng relationships (type: 'child')
  DB-->>BE: Tạo thành công
  BE-->>FE: Trả thông tin em bé { name, traits, affection: 90 }
  FE-->>U: Hiển thị hoạt họa chào đón thiên thần nhỏ
</pre></div>
        </div>
      </article>

      <!-- LG-F13 -->
      <article class="feature" id="LG-F13">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F13</span>
            <h3>Kế thừa Thế hệ & Di chúc gia tộc (Heir Succession)</h3>
          </div>
          <p class="caption">Cơ chế chuyển giao quyền lực khi nhân vật lớn tuổi hoặc cận kề tử kỳ. Người chơi chỉ định một người con làm <b>Người Thừa Kế Chính (Primary Heir)</b>: Toàn bộ danh mục bất động sản, tiền mặt và cổ phần công ty được chuyển giao cho kiếp sống tiếp theo, tiếp nối đời thứ 2, thứ 3 của gia tộc mà không bị reset từ đầu.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Lập Di Chúc & Chỉ Định Người Thừa Kế (Heir Succession)</b></div>
              <div class="ui-page">
                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:16px;display:grid;gap:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-size:16px;font-weight:700;color:#1e293b;">📜 Di Chúc Gia Tộc Họ Nguyễn (Đời 1)</div>
                      <div style="font-size:12px;color:#64748b;">Nhân vật hiện tại: Nguyễn An (76 tuổi · Sinh lực: 28)</div>
                    </div>
                    <span class="ui-tag gold">Tài sản chuyển giao: 12.8 Tỷ ₫</span>
                  </div>

                  <p style="font-size:13px;color:#475569;">
                    Khi bạn qua đời hoặc chọn an dưỡng tuổi già, quyền điều khiển trò chơi sẽ được chuyển giao sang người thừa kế được chỉ định. Bạn sẽ bắt đầu kiếp sống mới dưới thân phận của người con này ở độ tuổi thanh xuân.
                  </p>

                  <div style="border:2px solid #4f46e5;border-radius:6px;padding:12px;background:#eef2ff;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="font-weight:700;font-size:14px;color:#3730a3;">👧 Nguyễn Bảo Châu (Con gái · 24 tuổi)</div>
                      <div style="font-size:12px;color:#4338ca;">Tốt nghiệp Thạc sĩ Tài chính · Thừa hưởng 100% cổ phần & Bất động sản</div>
                    </div>
                    <button class="ui-btn p">Chỉ định làm Người Kế Tự</button>
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
              <thead><tr><th>Trường thông tin</th><th>Mô tả</th><th>Mapping CSDL</th><th>Quy tắc nghiệp vụ</th></tr></thead>
              <tbody>
                <tr><td class="f">Người kế tự</td><td>Con được chọn làm chủ thể mới</td><td class="map"><code>relationships.id</code></td><td>Chuyển đổi thành nhân vật chính trong bảng <code>characters</code></td></tr>
                <tr><td class="f">Thế hệ (Generation)</td><td>Đời thứ mấy</td><td class="map"><code>characters.generation = generation + 1</code></td><td>Tăng chỉ số đời để tiếp nối cây phả hệ</td></tr>
                <tr><td class="f">Di sản tài sản</td><td>Bất động sản & Cổ phiếu</td><td class="map"><code>assets.character_id = new_character_id</code></td><td>Giữ nguyên quyền sở hữu, không bị thanh lý mất phí</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Khởi tạo kiếp sống người thừa kế và chuyển giao tài sản</summary>
<pre>BEGIN;
  -- 1. Đánh dấu cha/mẹ đã hoàn thành sứ mệnh
  UPDATE characters SET is_deceased = TRUE, death_cause = 'Kế thừa thế hệ' WHERE id = :old_character_id;

  -- 2. Tạo nhân vật mới đại diện cho con nối nghiệp
  INSERT INTO characters (
      player_account_id, name, age, generation, parent_name,
      vitality, max_vitality, burnout, cash, innate_traits
  ) VALUES (
      'primary_player', :heir_name, :heir_age, :next_generation, :parent_name,
      100, 100, 0, :transferred_cash, :inherited_traits
  ) RETURNING id INTO :new_character_id;

  -- 3. Chuyển giao toàn bộ tài sản sang ID nhân vật mới
  UPDATE assets SET character_id = :new_character_id WHERE character_id = :old_character_id;
COMMIT;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Succession UI
  participant BE as Engine (/rebirth/heir)
  participant DB as CSDL
  U->>FE: Bấm chọn "Kế thừa thế hệ cho Nguyễn Bảo Châu"
  FE->>BE: POST /api/game/rebirth/heir { child_id }
  BE->>DB: Thực thi chuyển giao Transaction (tạo character đời mới, chuyển giao tài sản)
  DB-->>BE: Hoàn tất chuyển giao thế hệ
  BE-->>FE: Trả về trạng thái nhân vật đời 2 (Tuổi: 24, Tài sản thừa kế: 12.8 Tỷ)
  FE-->>U: Hiển thị hoạt họa chuyển giao di sản gia tộc hào nhoáng
</pre></div>
        </div>
      </article>

      <!-- LG-F14 -->
      <article class="feature" id="LG-F14">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F14</span>
            <h3>Ban thờ Tổ tiên & Thắp nhang hồi hướng (Ancestral Memorial)</h3>
          </div>
          <p class="caption">Nét văn hóa Á Đông độc bản trong LifeGraph: Ban thờ tổ tiên lưu giữ bài vị của tất cả các đời nhân vật đã qua đời. Người chơi ở các kiếp sau có thể dâng hương thắp nhang, khấn nguyện công đức để nhận điểm phúc lành (Ancestral Blessing) giúp tăng tỷ lệ may mắn khi gieo xúc xắc D20.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Từ Đường Gia Tộc & Ban Thờ Tổ Tiên (Ancestral Altar)</b></div>
              <div class="ui-page" style="background:#18110c;color:#fef3c7;padding:20px;">
                <div style="text-align:center;display:grid;gap:12px;">
                  <div style="font-size:24px;">🪔 🕯️ 🏮</div>
                  <div style="font-size:18px;font-weight:700;color:#fde68a;">TỪ ĐƯỜNG GIA TỘC HỌ NGUYỄN</div>
                  <div style="font-size:12.5px;color:#d4af37;">"Cây có cội mới trổ cành xanh lá · Nước có nguồn mới bủa khắp rạch sông"</div>

                  <div style="display:flex;justify-content:center;gap:14px;margin-top:8px;">
                    <div style="background:#2c1d11;border:1px solid #78350f;padding:10px 16px;border-radius:6px;">
                      <div style="font-size:11px;color:#fef3c7;opacity:0.8;">CÔNG ĐỨC TỔ TIÊN</div>
                      <div style="font-size:18px;font-weight:700;color:#fbbf24;">480 Điểm</div>
                    </div>
                    <div style="background:#2c1d11;border:1px solid #78350f;padding:10px 16px;border-radius:6px;">
                      <div style="font-size:11px;color:#fef3c7;opacity:0.8;">BÀI VỊ TIỀN NHÂN</div>
                      <div style="font-size:18px;font-weight:700;color:#fde68a;">3 Đời</div>
                    </div>
                  </div>

                  <button class="ui-btn p" style="background:#b45309;border-color:#b45309;color:#fff;justify-self:center;margin-top:10px;">
                    🪔 Dâng Nén Nhang Thành Kính (Cầu Phúc May Mắn)
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
              <thead><tr><th>Trường thông tin</th><th>Ý nghĩa</th><th>Mapping CSDL</th><th>Hiệu ứng nghiệp vụ</th></tr></thead>
              <tbody>
                <tr><td class="f">Bài vị tổ tiên</td><td>Danh sách các bậc tiền nhân</td><td class="map"><code>ancestral_memorials</code></td><td>Lưu trữ tên tuổi, thành tựu cuộc đời và công đức của tiền bối</td></tr>
                <tr><td class="f">Nhang dâng cúng</td><td>Hành động thắp nhang</td><td class="map"><code>POST /lineage/incense</code></td><td>Cộng thêm buff 'Phù hộ độ trì' (+2 điểm vào lần gieo xúc xắc D20 kế tiếp)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Ghi nhận bài vị tiền nhân vào ban thờ tổ tiên</summary>
<pre>INSERT INTO ancestral_memorials (player_account_id, character_name, generation, death_age, greatest_achievement, karma_contributed)
VALUES ('primary_player', 'Nguyễn An', 1, 82, 'Sáng lập tập đoàn AI công nghệ', 150);</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Ancestral Memorial
  participant BE as Engine (/lineage/incense)
  participant DB as CSDL
  U->>FE: Bấm "Dâng Nén Nhang Thành Kính"
  FE->>BE: POST /api/game/lineage/incense
  BE->>DB: Đọc tổng số bài vị tổ tiên
  Note over BE: Khởi tạo hiệu ứng tâm linh<br/>Cấp phát bùa chúc phúc: +2 điểm xúc xắc D20
  BE-->>FE: Trả về trạng thái hồi hướng công đức
  FE-->>U: Hiển thị khói nhang trầm lắng và âm thanh chuông tĩnh tâm
</pre></div>
        </div>
      </article>
    </section>
`;
