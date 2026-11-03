// section_features_g2.js
export const sectionFeaturesG2 = `
    <!-- 10. NHÓM 2: HỆ THỐNG NHẬP VAI RPG TÂM TRÍ & SỐ PHẬN -->
    <section id="g2">
      <h2>10. Nhóm 2: Hệ thống Nhập vai RPG Tâm Trí & Số Phận</h2>

      <!-- LG-F05 -->
      <article class="feature" id="LG-F05">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F05</span>
            <h3>Mind Stage & Tiếng thì thầm nội tâm (3 Bản ngã Ego Whispers)</h3>
          </div>
          <p class="caption">Thay thế hoàn toàn cơ chế chọn thẻ bài thụ động. Khi đối mặt với ngã rẽ cuộc đời, màn hình kích hoạt <b>Sân khấu Tâm trí (Mind Stage)</b>: Ba giọng nói nội tâm đại diện cho <code>🧠 Lý Trí</code>, <code>❤️ Trái Tim</code> và <code>⚡ Bản Năng</code> đồng loạt đưa ra phân tích và thôi thúc nhân vật. Người chơi chọn lập trường (Stance) để bước vào thử thách số phận.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Sân Khấu Tâm Trí (Mind Stage)</b> · Tình huống: Cơ hội khởi nghiệp mạo hiểm</div>
              <div class="ui-page">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:grid;gap:14px;">
                  <div>
                    <span class="ui-tag w">⚡ Tình thế phân nhánh cuộc đời</span>
                    <h3 style="margin-top:6px;font-size:16px;">Lời mời hợp tác từ người bạn cũ: Bỏ việc mở công ty AI?</h3>
                    <p style="font-size:13px;color:#475569;margin-top:4px;">Bạn thân thời đại học rủ bạn góp vốn 200 triệu và nghỉ việc tại tập đoàn để cùng xây dựng startup công nghệ. Bạn đang giằng xé nội tâm dữ dội...</p>
                  </div>

                  <!-- 3 TIẾNG THÌ THẦM -->
                  <div class="ui-whispers">
                    <div class="ui-whisper-card">
                      <div style="font-weight:700;color:#4f46e5;display:flex;align-items:center;gap:4px;">
                        <svg class="ic" width="14" height="14"><use href="#i-brain"/></svg> 🧠 Lý Trí mách bảo
                      </div>
                      <p style="font-size:12px;color:#334155;margin-top:4px;">"Tỷ lệ thất bại của startup AI là 92%. Bạn cần giữ nguồn thu ổn định để trả góp căn hộ. Đừng liều lĩnh!"</p>
                    </div>

                    <div class="ui-whisper-card heart">
                      <div style="font-weight:700;color:#ef4444;display:flex;align-items:center;gap:4px;">
                        <svg class="ic" width="14" height="14"><use href="#i-heart"/></svg> ❤️ Trái Tim thôi thúc
                      </div>
                      <p style="font-size:12px;color:#334155;margin-top:4px;">"Tình bạn mười năm quý hơn tiền bạc. Nếu bạn từ chối, cậu ấy sẽ một mình gánh chịu và mối quan hệ sẽ rạn nứt."</p>
                    </div>

                    <div class="ui-whisper-card instinct">
                      <div style="font-weight:700;color:#d97706;display:flex;align-items:center;gap:4px;">
                        <svg class="ic" width="14" height="14"><use href="#i-bolt"/></svg> ⚡ Bản Năng gầm gừ
                      </div>
                      <p style="font-size:12px;color:#334155;margin-top:4px;">"Cả đời làm thuê sẽ không bao giờ bứt phá được. Đây là thời cơ ngàn năm có một để làm chủ vận mệnh!"</p>
                    </div>
                  </div>

                  <!-- DANH SÁCH LẬP TRƯỜNG -->
                  <div style="display:grid;gap:8px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Chọn Lập Trường Đối Diện Thử Thách (Stance)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <button class="ui-btn p" style="background:#4338ca;">[Lý Trí & Thận Trọng] Từ chối & Khuyên bạn cẩn trọng (DC 10)</button>
                      <button class="ui-btn" style="border-color:#ef4444;color:#ef4444;">[Thấu Cảm & Tình Thân] Góp vốn hỗ trợ nhưng không nghỉ việc (DC 13)</button>
                      <button class="ui-btn" style="border-color:#d97706;color:#d97706;font-weight:700;">[Canh Bạc Đột Phá] Tất tay nghỉ việc, dẫn đầu dự án! (DC 16)</button>
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
              <thead><tr><th>Thành phần</th><th>Mục đích</th><th>Mapping CSDL</th><th>Quy tắc nghiệp vụ</th></tr></thead>
              <tbody>
                <tr><td class="f">🧠 Lý Trí (Rational)</td><td>Phân tích logic, bảo toàn nguồn lực</td><td class="map"><code>dilemmas.whispers-&gt;'rational'</code></td><td>Cộng thưởng nếu nhân vật có tư chất 'Tư duy logic'</td></tr>
                <tr><td class="f">❤️ Trái Tim (Empathy)</td><td>Ưu tiên gắn kết, tình cảm gia đình/bạn bè</td><td class="map"><code>dilemmas.whispers-&gt;'empathy'</code></td><td>Cộng thưởng nếu chỉ số EQ cao hoặc có NPC thân thiết</td></tr>
                <tr><td class="f">⚡ Bản Năng (Instinct)</td><td>Thúc đẩy mạo hiểm, bứt phá giới hạn</td><td class="map"><code>dilemmas.whispers-&gt;'instinct'</code></td><td>Phù hợp với các tình huống cần dũng khí hoặc đột phá tài chính</td></tr>
                <tr><td class="f">Lập trường (Stance)</td><td>Đại diện cho hướng xử lý của người chơi</td><td class="map"><code>tick_events.event_data-&gt;'stance'</code></td><td>Quyết định độ khó DC và công thức tính xúc xắc D20</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Lưu vết lựa chọn lập trường Mind Stage vào nhật ký</summary>
<pre>INSERT INTO tick_events (character_id, tick_number, event_data)
VALUES (
    :character_id,
    :current_age,
    jsonb_build_object(
        'type', 'mind_stage_resolution',
        'dilemma_id', :dilemma_id,
        'stance', 'CALCULATED_RISK',
        'whisper_chosen', 'instinct',
        'target_dc', 16,
        'timestamp', CURRENT_TIMESTAMP
    )
);</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as MindStage UI
  participant BE as AI Dilemma Engine
  participant DB as CSDL
  BE->>FE: Gửi gói tình huống kèm 3 tiếng thì thầm { rational, empathy, instinct, stances }
  FE-->>U: Hiển thị 3 bản ngã nội tâm & các nút Stance
  U->>FE: Bấm chọn "[Canh Bạc Đột Phá] Tất tay nghỉ việc" (Stance: RISK)
  FE->>FE: Kích hoạt màn hình Tung Xúc xắc Định mệnh D20 (DC = 16)
</pre></div>
        </div>
      </article>

      <!-- LG-F06 -->
      <article class="feature" id="LG-F06">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F06</span>
            <h3>Xúc xắc Định mệnh D20 & Thử thách DC (Fate Dice Check)</h3>
          </div>
          <p class="caption">Hệ thống tung xúc xắc D20 tương tác trực tiếp tạo nên cảm xúc hồi hộp đỉnh cao của game nhập vai thực thụ. Kết quả được tính toán minh bạch: Giá trị gieo được (1–20) cộng với Điểm bổ trợ tư chất bẩm sinh, Chỉ số thể lực và Điểm hành động đầu tư (AP Boost) để đối đầu cùng Ngưỡng độ khó (DC).</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Vũ Đài Tung Xúc Xắc Định Mệnh (Fate Dice Stage)</b></div>
              <div class="ui-page" style="background:#090d16;color:#f8fafc;padding:24px;">
                <div class="ui-dice-stage">
                  <div style="font-size:13px;text-transform:uppercase;color:#818cf8;letter-spacing:0.1em;font-weight:700;">Thử Thách Định Mệnh: Khởi nghiệp công nghệ AI</div>
                  <div style="font-size:15px;color:#cbd5e1;">Ngưỡng độ khó yêu cầu: <b style="color:#fbbf24;font-size:18px;">DC 16</b></div>

                  <!-- XÚC XẮC D20 -->
                  <div class="ui-dice-box">
                    <span>17</span>
                  </div>

                  <div style="display:flex;justify-content:center;gap:10px;font-size:13px;flex-wrap:wrap;">
                    <span class="ui-tag" style="background:#1e1b4b;color:#a5b4fc;border-color:#4338ca;">🎲 Gieo được: 17</span>
                    <span class="ui-tag s">🧠 Tư chất 'Gen thiên tài': +2</span>
                    <span class="ui-tag gold">⚡ Đầu tư 1 AP: +2</span>
                    <span class="ui-tag" style="background:#064e3b;color:#6ee7b7;border-color:#059669;font-weight:700;">Tổng điểm: 21</span>
                  </div>

                  <div style="background:#064e3b;border:1px solid #059669;border-radius:6px;padding:12px;margin-top:6px;">
                    <div style="font-weight:700;color:#6ee7b7;font-size:15px;">🎉 THÀNH TỰU XUẤT CHÚNG (CRITICAL SUCCESS)!</div>
                    <div style="font-size:12.5px;color:#d1fae5;margin-top:4px;">Bạn không chỉ huy động được vốn đầu tư mà công ty còn ký được hợp đồng độc quyền với đối tác nước ngoài. Tài sản tăng vọt +500.000.000 ₫!</div>
                  </div>

                  <button class="ui-btn p" style="justify-self:center;background:#4f46e5;padding:0 24px;">Nhận Kết Quả & Tiếp Tục Vận Mệnh</button>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Chỉ số tham gia</th><th>Giá trị</th><th>Công thức ảnh hưởng</th><th>Phân loại kết quả</th></tr></thead>
              <tbody>
                <tr><td class="f">Xúc xắc cơ bản</td><td>1 đến 20</td><td>Ngẫu nhiên phân phối đều (D20 Random)</td><td>Nếu gieo 20 tự nhiên: Auto Critical Success</td></tr>
                <tr><td class="f">Bổ trợ Tư chất</td><td>+1 đến +3</td><td>Đọc từ <code>characters.innate_traits</code></td><td>Tư chất phù hợp với tính chất sự kiện</td></tr>
                <tr><td class="f">Đầu tư Action Point</td><td>+2 / 1 AP</td><td>Đọc từ <code>ap_spent</code> do người chơi phân bổ</td><td>Tối đa có thể đầu tư 2 AP (+4 điểm)</td></tr>
                <tr><td class="f">Ngưỡng DC</td><td>10 đến 20</td><td>Xác định từ độ mạo hiểm của tình huống</td><td>
                  <code>Total &gt;= DC + 5</code>: Critical Success<br/>
                  <code>Total &gt;= DC</code>: Normal Success<br/>
                  <code>Total &lt; DC</code>: Hard Lesson (Thất bại nhận kinh nghiệm)
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Cập nhật chỉ số sau khi vượt qua thử thách DC</summary>
<pre>UPDATE characters
SET 
    cash = cash + :reward_cash,
    vitality = LEAST(max_vitality, vitality + :reward_vitality),
    burnout = GREATEST(0, LEAST(100, burnout + :cost_burnout)),
    action_points = action_points - :ap_spent,
    history_log = history_log || jsonb_build_object(
        'age', age,
        'event', 'Thử thách khởi nghiệp',
        'result', 'CRITICAL_SUCCESS',
        'roll', 21,
        'dc', 16
    ),
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
  participant FE as FateDiceCheck Component
  participant BE as Game Engine (/tick)
  participant DB as CSDL
  U->>FE: Bấm nút "Gieo Xúc Xắc D20" (kèm đầu tư 1 AP)
  FE->>FE: Chạy hoạt họa vật lý tung xúc xắc 3D
  FE->>BE: Gửi kết quả gieo { choice_id, stance, dice_roll: 17, ap_spent: 1 }
  BE->>DB: Đọc tư chất & cờ của character để xác minh tính hợp lệ
  Note over BE: Tính tổng = 17 + 2 (Trait) + 2 (AP) = 21 >= DC 16<br/>Xác định kết quả: CRITICAL_SUCCESS
  BE->>DB: Ghi nhận tiền thưởng (+500M) & trừ 1 AP
  DB-->>BE: Cập nhật thành công
  BE-->>FE: Trả về kết cục thành công mỹ mãn & dữ liệu âm thanh reo hò
  FE-->>U: Hiển thị hiệu ứng pháo hoa và cập nhật dòng tiền
</pre></div>
        </div>
      </article>

      <!-- LG-F07 -->
      <article class="feature" id="LG-F07">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F07</span>
            <h3>AI Game Master & Tình huống phân nhánh triệu tổ hợp (Scenario Bank)</h3>
          </div>
          <p class="caption">Hạt nhân tạo sinh cốt truyện của LifeGraph. Kết hợp giữa Ngân hàng tình huống triệu tổ hợp (Scenario Bank) được phân loại theo giai đoạn lứa tuổi và Prompt Compiler tích hợp Gemini 2.0 Flash để tạo nên những ngã rẽ cuộc đời chân thực, độc bản và hoàn toàn phù hợp với bối cảnh văn hóa của từng quốc gia.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>AI Game Master Narrative Engine</b></div>
              <div class="ui-page">
                <div style="border-left:4px solid #4f46e5;padding:12px 16px;background:#f8fafc;border-radius:0 6px 6px 0;">
                  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#4f46e5;font-weight:700;">
                    <span>✨ AI Dungeon Master phân tích hoàn cảnh:</span>
                  </div>
                  <p style="font-size:13.5px;color:#1e293b;margin-top:6px;line-height:1.6;">
                    "Bạn vừa bước sang tuổi 35 tại Hà Nội. Nền kinh tế thế giới đang đối mặt với lạm phát cao (Chỉ số MMO Kinh tế: 48 điểm). Sau 10 năm cống hiến, tập đoàn bất ngờ tái cơ cấu và đề xuất bạn chuyển sang chi nhánh vùng xa hoặc nhận bồi thường thôi việc 6 tháng lương..."
                  </p>
                  <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                    <span class="ui-tag i">Nhóm tuổi: 35-45 (Trung niên)</span>
                    <span class="ui-tag w">Khủng hoảng kinh tế vĩ mô</span>
                    <span class="ui-tag s">Cơ hội rẽ hướng</span>
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
              <thead><tr><th>Tham số đầu vào AI</th><th>Nguồn dữ liệu</th><th>Mapping CSDL</th><th>Mục đích</th></tr></thead>
              <tbody>
                <tr><td class="f">Độ tuổi & Giới tính</td><td>Hồ sơ nhân vật</td><td class="map"><code>characters.age</code>, <code>characters.name</code></td><td>Định hình ngôn ngữ và trải nghiệm phù hợp lứa tuổi</td></tr>
                <tr><td class="f">Tài chính & Nghề nghiệp</td><td>Chỉ số hiện thời</td><td class="map"><code>characters.cash</code>, <code>characters.hidden_flags-&gt;'job'</code></td><td>Tạo ra các thử thách tương xứng với địa vị xã hội</td></tr>
                <tr><td class="f">Biến số Vĩ mô MMO</td><td>Chỉ số kinh tế toàn cầu</td><td class="map"><code>characters.global_indices</code></td><td>Phản ánh tình hình lạm phát, việc làm của thế giới thực</td></tr>
                <tr><td class="f">Ký ức sự kiện cũ</td><td>Lịch sử sự kiện gần</td><td class="map"><code>characters.recent_event_tags</code></td><td>Chống lặp lại tình huống (Anti-loop mechanism)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Ghi nhận cờ sự kiện chống lặp lại (Anti-loop fuse)</summary>
<pre>UPDATE characters
SET 
    recent_event_tags = recent_event_tags || '["crisis_corporate_restructure_35"]'::jsonb,
    experienced_scenarios = experienced_scenarios || '["scenario_career_fork_v6"]'::jsonb,
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
  participant FE as Frontend Game
  participant GM as AI Game Master Engine
  participant LLM as Gemini 2.0 Flash API
  participant DB as CSDL
  FE->>GM: Yêu cầu tạo tình huống năm mới (GET /state)
  GM->>DB: Đọc tuổi, chỉ số sinh tồn, danh sách cờ và lịch sử
  GM->>GM: Lọc Scenario Bank (loại bỏ kịch bản đã gặp trong 5 năm)
  GM->>LLM: Gửi Prompt hệ thống (System Prompt + Country Context + Dynamic Stats)
  LLM-->>GM: Trả về kịch bản JSON (Tiêu đề, Mô tả, 3 tiếng thì thầm, Danh sách Stance, DC)
  GM-->>FE: Chuyển giao tình huống đến giao diện Mind Stage
</pre></div>
        </div>
      </article>

      <!-- LG-F08 -->
      <article class="feature" id="LG-F08">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F08</span>
            <h3>Đối chất NPC trực diện & Mạng lưới quan hệ (NPCDialogCard)</h3>
          </div>
          <p class="caption">Mô hình hóa các mối quan hệ xã hội phức tạp (Tình đầu, Sếp cũ, Đối thủ kinh doanh, Tri kỷ). Cho phép đối thoại trực diện, thuyết phục (Persuasion Check) với NPC thông qua tung xúc xắc D20, ghi nhớ ân oán và biến chuyển điểm thiện cảm từ -100 (thù địch truyền kiếp) đến +100 (sống chết có nhau).</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Đối Thoại & Thương Thảo Trực Diện Với NPC</b></div>
              <div class="ui-page">
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:grid;gap:14px;">
                  <div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;padding-bottom:12px;">
                    <div style="width:48px;height:48px;border-radius:50%;background:#4f46e5;color:#fff;display:grid;place-items:center;font-size:22px;">👨‍⚖️</div>
                    <div style="flex:1;">
                      <div style="font-size:16px;font-weight:700;">Trần Quốc Hùng <span style="font-size:12px;color:#64748b;font-weight:400;">(Sếp Tổng · Tập đoàn Đa quốc gia)</span></div>
                      <div style="display:flex;gap:8px;align-items:center;margin-top:2px;">
                        <span class="ui-tag w">Mối quan hệ: Nghiêm khắc & Thận trọng</span>
                        <span style="font-size:12px;color:#64748b;">Thiện cảm: <b>45/100</b></span>
                      </div>
                    </div>
                  </div>

                  <div style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;color:#334155;border-left:3px solid #6366f1;">
                    <i>"Hùng nhìn thẳng vào mắt bạn, gõ nhẹ cây bút lên bàn: 'Bản đề xuất của cậu rất táo bạo. Nhưng nếu thất bại, ai sẽ chịu trách nhiệm cho khoản lỗ 2 tỷ đồng này?'"</i>
                  </div>

                  <div style="display:grid;gap:8px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;">CHỌN PHẢN HỒI THƯƠNG THẢO (PERSUASION STANCE):</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <button class="ui-btn p">[Cam kết Trách nhiệm] Lấy toàn bộ thưởng cuối năm bảo lãnh (DC 14)</button>
                      <button class="ui-btn pl">[Viện dẫn Số liệu] Trình bày phân tích rủi ro & giải pháp dự phòng (DC 12)</button>
                      <button class="ui-btn d">[Thẳng thắn & Tự tin] "Thương trường là chiến trường, thưa sếp!" (DC 17)</button>
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
              <thead><tr><th>Trường thông tin</th><th>Ý nghĩa</th><th>Mapping CSDL</th><th>Hiệu ứng nghiệp vụ</th></tr></thead>
              <tbody>
                <tr><td class="f">Tên & Vai trò NPC</td><td>Định danh người đối thoại</td><td class="map"><code>npcs.name</code>, <code>npcs.role</code></td><td>Hiển thị ảnh chân dung và màu sắc đại diện</td></tr>
                <tr><td class="f">Thang đo Thiện cảm</td><td>-100 đến +100</td><td class="map"><code>npcs.affinity</code></td><td>Ảnh hưởng đến thái độ và tỷ lệ thành công của đàm phán</td></tr>
                <tr><td class="f">Ký ức tương tác</td><td>Ghi chép biến cố cũ</td><td class="map"><code>npcs.memory_notes</code></td><td>Cung cấp ngữ cảnh cho AI Game Master sinh lời thoại</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Cập nhật thiện cảm và ghi nhớ sau khi đối thoại</summary>
<pre>UPDATE npcs
SET 
    affinity = LEAST(100, GREATEST(-100, affinity + :delta_affinity)),
    memory_notes = memory_notes || '; Thuyết phục thành công về dự án lớn tuổi ' || :current_age,
    last_encountered_age = :current_age
WHERE id = :npc_id;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as NPCDialogCard
  participant BE as Engine (/action/network)
  participant DB as CSDL
  U->>FE: Chọn lập trường thuyết phục "[Viện dẫn Số liệu]" (DC 12)
  FE->>BE: POST /api/game/action/network { npc_id, stance: 'RATIONAL', dice_roll: 15 }
  BE->>DB: Đọc thiện cảm hiện thời của NPC
  Note over BE: Roll 15 >= DC 12 -> Thành công<br/>Tăng thiện cảm +15 (45 -> 60)<br/>Ký ức: Sếp đánh giá cao năng lực lập luận
  BE->>DB: Cập nhật npcs (affinity = 60, memory_notes)
  DB-->>BE: Cập nhật thành công
  BE-->>FE: Trả về kết quả thuyết phục & lời khen của Sếp
  FE-->>U: Hiển thị phản hồi tích cực và mở khóa cơ hội thăng chức
</pre></div>
        </div>
      </article>
    </section>
`;
