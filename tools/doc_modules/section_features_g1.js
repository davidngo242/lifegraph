// section_features_g1.js
export const sectionFeaturesG1 = `
    <!-- 9. NHÓM 1: NỀN TẢNG CỐT LÕI & VÒNG LẶP SINH TỒN -->
    <section id="g1">
      <h2>9. Nhóm 1: Nền tảng cốt lõi & Vòng lặp Sinh tồn</h2>

      <!-- LG-F01 -->
      <article class="feature" id="LG-F01">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F01</span>
            <h3>Character Hero Banner & 3D Avatar Dynamic Scene Visualizer</h3>
          </div>
          <p class="caption">Thanh điều hướng đỉnh cao (Hero Banner) kết nối mô hình Avatar 3D phản ứng cảm xúc theo thời gian thực (0ms latency), thay đổi dải màu khí quyển (Atmospheric Gradient) theo chỉ số sinh lực và mức độ kiệt sức (Burnout), cung cấp thông tin sống còn: Sinh lực, Kiệt sức, Tiền mặt và Điểm hành động (AP).</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui-switch">
              <div class="ui-tabs" role="tablist">
                <button type="button" role="tab" data-ui-tab="f01-calm" aria-selected="true">Trạng thái Bình an (Sinh lực cao)</button>
                <button type="button" role="tab" data-ui-tab="f01-stress" aria-selected="false">Trạng thái Khủng hoảng (Burnout cao)</button>
              </div>

              <!-- PANE 1: Bình an -->
              <div class="ui ui-x" data-ui-pane="f01-calm">
                <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>LifeGraph RPG V6.0</b> · Nhân vật: Nguyễn An (28 tuổi)</div>
                <div class="ui-page">
                  <div class="ui-hero calm">
                    <div class="ui-hero-head">
                      <div style="display:flex;align-items:center;gap:14px;">
                        <div class="ui-hero-avatar">🧑‍💼</div>
                        <div>
                          <div style="font-size:18px;font-weight:700;">Nguyễn An <span style="font-size:12px;opacity:0.8;font-weight:400;">(Đời 2 · Việt Nam)</span></div>
                          <div style="font-size:12px;opacity:0.9;">Nghề nghiệp: Lập trình viên cấp cao · Nơi ở: Căn hộ Studio</div>
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <span class="ui-tag gold">⚡ 3/3 AP Có sẵn</span>
                        <span class="ui-tag s">Trạng thái: Tràn đầy năng lượng</span>
                      </div>
                    </div>
                    <div class="ui-hero-stats">
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Sinh lực</span><span>92 / 100</span></div>
                        <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:92%;background:#10b981;"></div></div>
                      </div>
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Kiệt sức</span><span>18 / 100</span></div>
                        <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:18%;background:#fbbf24;"></div></div>
                      </div>
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Tiền mặt</span><span style="color:#6ee7b7;font-weight:700;">145.000.000 ₫</span></div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px;">Dòng tiền: +18.5M / năm</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PANE 2: Stress -->
              <div class="ui ui-x" data-ui-pane="f01-stress" hidden>
                <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>LifeGraph RPG V6.0</b> · Cảnh báo y tế khẩn cấp</div>
                <div class="ui-page">
                  <div class="ui-hero stress">
                    <div class="ui-hero-head">
                      <div style="display:flex;align-items:center;gap:14px;">
                        <div class="ui-hero-avatar" style="border-color:#f87171;">😫</div>
                        <div>
                          <div style="font-size:18px;font-weight:700;">Nguyễn An <span style="font-size:12px;opacity:0.8;font-weight:400;">(42 tuổi · Lao lực)</span></div>
                          <div style="font-size:12px;opacity:0.9;">Cảnh báo: Nguy cơ suy sụp thần kinh nghiêm trọng</div>
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <span class="ui-tag d">🚨 Burnout 88%</span>
                        <span class="ui-tag w">Sinh lực suy yếu</span>
                      </div>
                    </div>
                    <div class="ui-hero-stats">
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Sinh lực</span><span style="color:#f87171;">35 / 78</span></div>
                        <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:45%;background:#ef4444;"></div></div>
                      </div>
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Kiệt sức</span><span style="color:#f87171;font-weight:700;">88 / 100</span></div>
                        <div class="ui-bar-bg"><div class="ui-bar-fill" style="width:88%;background:#ef4444;"></div></div>
                      </div>
                      <div class="ui-stat-box">
                        <div class="ui-stat-lb"><span>Tiền mặt</span><span style="color:#fde047;font-weight:700;">820.000.000 ₫</span></div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px;">Cảnh báo viện phí: -50M / đợt</div>
                      </div>
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
              <thead><tr><th>Khối hiển thị</th><th>Trường giao diện</th><th>Kiểu dữ liệu</th><th>Mapping CSDL</th><th>Ràng buộc & Logic</th></tr></thead>
              <tbody>
                <tr><td class="f" rowspan="3">Thông tin định danh</td><td>Tên nhân vật & Đời</td><td>String</td><td class="map"><code>characters.name</code>, <code>characters.generation</code></td><td>Hiển thị văn hóa theo quốc gia xuất thân</td></tr>
                <tr><td>Tuổi & Nghề nghiệp</td><td>Int / String</td><td class="map"><code>characters.age</code>, <code>characters.hidden_flags-&gt;'job'</code></td><td>Nếu age &lt; 18 thì ghi nhận giai đoạn học sinh</td></tr>
                <tr><td>Avatar 3D & Biểu cảm</td><td>URL / Canvas</td><td class="map"><code>characters.current_portrait_url</code></td><td>Renderer cập nhật ngay khi trạng thái Burnout / Vitality đổi</td></tr>
                <tr><td class="f" rowspan="3">Chỉ số sinh tồn</td><td>Thanh Sinh lực</td><td>Number / %</td><td class="map"><code>characters.vitality</code> / <code>characters.max_vitality</code></td><td>Màu chuyển từ xanh lá (&gt;60%) -&gt; vàng (&gt;30%) -&gt; đỏ (&lt;30%)</td></tr>
                <tr><td>Thanh Kiệt sức (Burnout)</td><td>Number / %</td><td class="map"><code>characters.burnout</code></td><td>Nếu burnout &gt; 70%, kích hoạt cảnh báo rung lắc và dải màu đỏ</td></tr>
                <tr><td>Số dư Tiền mặt</td><td>Currency (VND)</td><td class="map"><code>characters.cash</code></td><td>Khóa cố định ở 0 VND nếu <code>characters.age &lt; 18</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Truy vấn khởi tạo dữ liệu Hero Banner</summary>
<pre>SELECT 
    c.id, c.name, c.age, c.generation, c.nationality,
    c.vitality, c.max_vitality, c.burnout, c.cash, c.action_points,
    c.current_portrait_url, c.hidden_flags,
    COALESCE(SUM(a.current_value), 0) AS total_asset_value
FROM characters c
LEFT JOIN assets a ON a.character_id = c.id
WHERE c.id = :character_id AND c.is_deceased = FALSE
GROUP BY c.id;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Frontend Banner & Visualizer
  participant BE as Backend Game Engine
  participant DB as CSDL PostgreSQL
  U->>FE: Tải giao diện chính LifeGraph
  FE->>BE: GET /api/game/state
  BE->>DB: Đọc bản ghi characters mới nhất
  DB-->>BE: Trả về vitality, burnout, cash, action_points, age
  BE-->>FE: Payload JSON { character, assets, visual_scene }
  Note over FE: Canvas tính toán mood gradient (0ms)<br/>Render Avatar biểu cảm phù hợp
  U->>FE: Quan sát tình trạng sức khỏe & tài chính
</pre></div>
        </div>
      </article>

      <!-- LG-F02 -->
      <article class="feature" id="LG-F02">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F02</span>
            <h3>Annual Tick Engine & Cân bằng chuyển giao thế hệ (Khiên bảo vệ vị thành niên)</h3>
          </div>
          <p class="caption">Trọng tâm vận hành của toàn bộ game: Bước nhảy thường niên (Annual Advance). Thực hiện già hóa sinh học, tính toán hao mòn sinh lực theo tuổi tác, áp dụng quy tắc bảo vệ tài chính nghiêm ngặt cho trẻ vị thành niên (&lt; 18 tuổi) và quyết toán dòng tiền ròng.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui-switch">
              <div class="ui-tabs" role="tablist">
                <button type="button" role="tab" data-ui-tab="f02-adult" aria-selected="true">Chuyển giao năm (Người trưởng thành 30t)</button>
                <button type="button" role="tab" data-ui-tab="f02-minor" aria-selected="false">Chuyển giao năm (Vị thành niên 14t - Khiên bảo vệ)</button>
              </div>

              <!-- PANE 1: Adult Tick -->
              <div class="ui ui-x" data-ui-pane="f02-adult">
                <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Tổng kết bước nhảy năm</b> · Chuyển tiếp từ 29 lên 30 tuổi</div>
                <div class="ui-page">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;display:grid;gap:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:16px;font-weight:700;color:#1e293b;">🎆 Chúc mừng sinh nhật 30 tuổi!</span>
                      <span class="ui-tag s">+3 Điểm hành động mới</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
                      <div style="background:#fff;border:1px solid #cbd5e1;padding:10px;border-radius:4px;">
                        <div style="color:#64748b;font-size:11px;text-transform:uppercase;">Biến động thể chất</div>
                        <div style="font-weight:700;color:#059669;">Sinh lực: 90/100 (-2 suy hao tuổi)</div>
                        <div style="font-size:12px;color:#d97706;">Kiệt sức: 25/100 (+10 áp lực công việc)</div>
                      </div>
                      <div style="background:#fff;border:1px solid #cbd5e1;padding:10px;border-radius:4px;">
                        <div style="color:#64748b;font-size:11px;text-transform:uppercase;">Quyết toán tài chính</div>
                        <div style="font-weight:700;color:#1e293b;">Thu nhập ròng: +42.000.000 ₫</div>
                        <div style="font-size:12px;color:#64748b;">Chi phí sinh hoạt: -18.000.000 ₫</div>
                      </div>
                    </div>
                    <button class="ui-btn p" style="justify-self:start;">Tiếp tục bước vào năm mới</button>
                  </div>
                </div>
              </div>

              <!-- PANE 2: Minor Shield -->
              <div class="ui ui-x" data-ui-pane="f02-minor" hidden>
                <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Tổng kết bước nhảy năm</b> · Vị thành niên (14 tuổi)</div>
                <div class="ui-page">
                  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:16px;display:grid;gap:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:16px;font-weight:700;color:#1e3a8a;">🛡️ Khiên bảo trợ vị thành niên đang kích hoạt</span>
                      <span class="ui-tag" style="background:#dbeafe;color:#1e40af;">Tuổi: 14 (Học sinh cấp 2)</span>
                    </div>
                    <p style="font-size:13px;color:#1e40af;">Theo luật pháp và quy tắc game, bạn chưa đủ tuổi công dân độc lập. Mọi chi phí ăn ở, học tập (12.000.000 ₫/năm) đều được <b>Quỹ gia đình bảo trợ 100%</b>. Số dư cá nhân tiếp tục giữ ở mức an toàn <b>0 ₫</b>.</p>
                    <div style="display:flex;gap:10px;">
                      <span class="ui-tag s">Cơm no áo ấm: +5 Sinh lực</span>
                      <span class="ui-tag">Học lực: Đạt học sinh giỏi</span>
                    </div>
                    <button class="ui-btn p" style="justify-self:start;">Tiếp tục năm học mới</button>
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
              <thead><tr><th>Trường xử lý</th><th>Công thức / Nghiệp vụ</th><th>Bảng tác động</th><th>Cột cập nhật</th></tr></thead>
              <tbody>
                <tr><td class="f">Tuổi (Age)</td><td><code>age = age + 1</code></td><td>characters</td><td class="map"><code>characters.age</code></td></tr>
                <tr><td class="f">Trần sinh lực (Max Vitality)</td><td>Nếu <code>age &gt;= 35</code>: <code>max_vitality = 100 - floor((age - 35) * 1.25)</code></td><td>characters</td><td class="map"><code>characters.max_vitality</code></td></tr>
                <tr><td class="f">Khiên vị thành niên</td><td>Nếu <code>age &lt; 18</code>: Giữ cố định <code>cash = 0</code>, trừ chi phí vào <code>family_endowment</code></td><td>characters</td><td class="map"><code>characters.cash</code>, <code>characters.family_endowment</code></td></tr>
                <tr><td class="f">Cấp phát Action Points</td><td>Reset <code>action_points = 3 + bonus_from_housing</code></td><td>characters</td><td class="map"><code>characters.action_points</code></td></tr>
                <tr><td class="f">Ghi nhớ lịch sử Tick</td><td>Lưu trữ toàn bộ biến cố và chỉ số năm vào bảng nhật ký</td><td>tick_events</td><td class="map"><code>tick_events.event_data</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Xử lý bước nhảy năm & Cập nhật chỉ số</summary>
<pre>UPDATE characters
SET 
    age = age + 1,
    action_points = 3,
    max_vitality = CASE 
        WHEN is_transhuman THEN 100
        WHEN age + 1 &lt; 35 THEN 100
        ELSE GREATEST(20, 100 - FLOOR((age + 1 - 35) * 1.25))
    END,
    cash = CASE 
        WHEN age + 1 &lt; 18 THEN 0
        ELSE cash + :net_annual_income
    END,
    burnout = GREATEST(0, LEAST(100, burnout - :housing_recovery_rate)),
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id AND is_deceased = FALSE;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Frontend
  participant BE as TickEngine
  participant DB as CSDL
  U->>FE: Bấm "Chuyển tiếp năm" (Next Year)
  FE->>BE: POST /api/game/tick
  BE->>DB: Đọc trạng thái hiện tại của character
  DB-->>BE: Trả về age, vitality, burnout, cash, housing
  Note over BE: Tính toán suy giảm sinh lực theo tuổi<br/>Kiểm tra nếu age &lt; 18 -> Áp dụng Khiên tài chính (Cash = 0)<br/>Tính toán dòng tiền tài sản & chi phí sinh hoạt
  BE->>DB: Cập nhật characters & ghi vào tick_events
  DB-->>BE: Cập nhật thành công
  BE-->>FE: Trả kết quả năm mới { character, summary, dilemma }
  FE-->>U: Hiển thị báo cáo chuyển giao năm
</pre></div>
        </div>
      </article>

      <!-- LG-F03 -->
      <article class="feature" id="LG-F03">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F03</span>
            <h3>Action Point Hub & 1-Click Annual Focus (Tối ưu hóa lượt click)</h3>
          </div>
          <p class="caption">Giải pháp tối ưu trải nghiệm người dùng, loại bỏ hiện tượng mỏi tay do bấm hàng chục lựa chọn vụn vặt mỗi năm. Người chơi phân bổ 3 Điểm Hành Động (Action Points) một lần duy nhất vào 1 trong 3 trọng tâm chiến lược: Phát triển Sự nghiệp (Tăng tiền, tăng Burnout), Rèn luyện Thể chất (Hồi phục sinh lực, xả stress) hoặc Chăm sóc Gia đình (Tăng gắn kết, mở rộng mối quan hệ).</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Trung tâm Phân bổ Điểm Hành Động Thường Niên (AP Hub)</b></div>
              <div class="ui-page">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <div>
                    <div style="font-size:15px;font-weight:700;">🎯 Chọn Trọng Tâm Chiến Lược Năm Nay</div>
                    <div style="font-size:12px;color:#64748b;">Mỗi năm bạn có 3 AP để định hình ưu tiên cuộc sống</div>
                  </div>
                  <span class="ui-tag gold" style="font-size:13px;padding:4px 10px;">Điểm khả dụng: 3 / 3 AP</span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">
                  <!-- Lựa chọn 1 -->
                  <div style="border:2px solid #e2e8f0;border-radius:8px;padding:14px;background:#fff;display:grid;gap:8px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:22px;">💼</span>
                      <div>
                        <div style="font-weight:700;font-size:14px;">Đột phá Sự nghiệp & Kiếm tiền</div>
                        <div style="font-size:11.5px;color:#64748b;">Làm thêm giờ, thăng tiến công danh</div>
                      </div>
                    </div>
                    <div style="font-size:12px;color:#059669;background:#ecfdf5;padding:6px;border-radius:4px;">
                      +30M ₫ Thu nhập ròng · +1 Cấp kinh nghiệm
                    </div>
                    <div style="font-size:11.5px;color:#dc2626;">Đánh đổi: +15 Kiệt sức (Burnout)</div>
                    <button class="ui-btn pl" style="width:100%;margin-top:6px;">1-Click: Phân bổ 3 AP</button>
                  </div>

                  <!-- Lựa chọn 2 -->
                  <div style="border:2px solid #10b981;border-radius:8px;padding:14px;background:#f0fdf4;display:grid;gap:8px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:22px;">🧘</span>
                      <div>
                        <div style="font-weight:700;font-size:14px;color:#065f46;">Dưỡng sinh & Thể thao chuyên sâu</div>
                        <div style="font-size:11.5px;color:#047857;">Chăm sóc cơ thể, tái tạo tinh thần</div>
                      </div>
                    </div>
                    <div style="font-size:12px;color:#059669;background:#fff;padding:6px;border-radius:4px;border:1px solid #a7f3d0;">
                      +10 Sinh lực hiện tại · Giảm -20 Kiệt sức
                    </div>
                    <div style="font-size:11.5px;color:#047857;">Miễn dịch với bệnh tật mùa này</div>
                    <button class="ui-btn g" style="width:100%;margin-top:6px;">Đang chọn: Phân bổ 3 AP</button>
                  </div>

                  <!-- Lựa chọn 3 -->
                  <div style="border:2px solid #e2e8f0;border-radius:8px;padding:14px;background:#fff;display:grid;gap:8px;cursor:pointer;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:22px;">❤️</span>
                      <div>
                        <div style="font-weight:700;font-size:14px;">Gia đình & Mở rộng Mạng lưới</div>
                        <div style="font-size:11.5px;color:#64748b;">Hẹn hò, giao thiệp quý nhân, con cái</div>
                      </div>
                    </div>
                    <div style="font-size:12px;color:#4f46e5;background:#eef2ff;padding:6px;border-radius:4px;">
                      +15 Thiện cảm mọi NPC · Cơ hội lập gia đình
                    </div>
                    <div style="font-size:11.5px;color:#64748b;">Chi phí quà tặng & ăn uống: -5M ₫</div>
                    <button class="ui-btn pl" style="width:100%;margin-top:6px;">1-Click: Phân bổ 3 AP</button>
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
              <thead><tr><th>Trọng tâm</th><th>Mã tham số API</th><th>Tác động Sinh lực</th><th>Tác động Burnout</th><th>Tác động Dòng tiền</th><th>Tác động Quan hệ</th></tr></thead>
              <tbody>
                <tr><td class="f">Sự nghiệp</td><td><code>focus_type = 'career'</code></td><td>-2</td><td>+15</td><td>+20.000.000 ₫ đến +50.000.000 ₫</td><td>0</td></tr>
                <tr><td class="f">Thể chất</td><td><code>focus_type = 'vitality'</code></td><td>+8 đến +12</td><td>-20</td><td>-3.000.000 ₫ (phí gym/dinh dưỡng)</td><td>0</td></tr>
                <tr><td class="f">Gia đình</td><td><code>focus_type = 'family'</code></td><td>+3</td><td>-5</td><td>-5.000.000 ₫ (giao tế)</td><td>+15 điểm Thiện cảm toàn bộ NPC</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Cập nhật trạng thái sau khi phân bổ 1-Click Annual Focus</summary>
<pre>UPDATE characters
SET 
    action_points = 0,
    vitality = LEAST(max_vitality, vitality + :delta_vitality),
    burnout = GREATEST(0, LEAST(100, burnout + :delta_burnout)),
    cash = cash + :delta_cash,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id AND action_points >= 3;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as AP Hub Component
  participant BE as Game Engine (/action/annual-focus)
  participant DB as CSDL
  U->>FE: Bấm chọn 1-Click trọng tâm "Dưỡng sinh & Thể thao"
  FE->>BE: POST /api/game/action/annual-focus { focus_type: 'vitality' }
  BE->>DB: Kiểm tra characters.action_points >= 3
  Note over BE: Tính toán: Sinh lực +10, Burnout -20, Tiêu hao 3 AP
  BE->>DB: Cập nhật chỉ số nhân vật
  DB-->>BE: Xác nhận thành công
  BE-->>FE: Trả kết quả { success: true, new_vitality: 92, new_burnout: 18, ap_remaining: 0 }
  FE-->>U: Hiển thị hiệu ứng ánh sáng xanh hồi phục thể lực
</pre></div>
        </div>
      </article>

      <!-- LG-F04 -->
      <article class="feature" id="LG-F04">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F04</span>
            <h3>Giai đoạn ấu thơ 0–5 tuổi & Tự động hóa Nuôi dưỡng (Fast-forward)</h3>
          </div>
          <p class="caption">Giải quyết triệt để bất cập trong game mô phỏng truyền thống khi người chơi phải bấm chọn các hành động vô lý của trẻ 1-2 tuổi (như tự kiếm tiền hay gánh nợ). Cung cấp cơ chế tự động hóa nuôi dưỡng giác quan và nút bấm <b>Fast-forward chuyển thẳng lên 6 tuổi</b> để bắt đầu đi học cấp 1.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Giai đoạn Mầm non & Ấu thơ (0–5 tuổi)</b></div>
              <div class="ui-page">
                <div style="background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:16px;display:grid;gap:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                      <div style="font-size:16px;font-weight:700;color:#854d0e;">👶 Giai đoạn ấu thơ: Bé An (2 tuổi)</div>
                      <div style="font-size:12px;color:#a16207;">Cơ thể và trí não đang hình thành những phản xạ đầu đời</div>
                    </div>
                    <button class="ui-btn p" style="background:#ca8a04;border-color:#ca8a04;">⏩ Chuyển tiếp nhanh lên 6 tuổi (Vào lớp 1)</button>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
                    <div style="background:#fff;border:1px solid #fde047;border-radius:6px;padding:12px;">
                      <div style="font-weight:700;font-size:13px;color:#854d0e;">🍼 Dinh dưỡng sữa mẹ</div>
                      <div style="font-size:12px;color:#64748b;margin:4px 0;">Tăng cường đề kháng tự nhiên</div>
                      <span class="ui-tag s">+10 Sinh lực tiềm năng</span>
                    </div>
                    <div style="background:#fff;border:1px solid #fde047;border-radius:6px;padding:12px;">
                      <div style="font-weight:700;font-size:13px;color:#854d0e;">🎵 Kích thích thính giác</div>
                      <div style="font-size:12px;color:#64748b;margin:4px 0;">Nghe nhạc cổ điển & truyện cổ tích</div>
                      <span class="ui-tag gold">Tư chất: Trực giác nhạy bén</span>
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
              <thead><tr><th>Trường nghiệp vụ</th><th>Ý nghĩa</th><th>Tác động dữ liệu</th><th>Mapping CSDL</th></tr></thead>
              <tbody>
                <tr><td class="f">Tuổi mầm non</td><td>Độ tuổi từ 0 đến 5</td><td>Không kích hoạt các biến cố tài chính hay lao động</td><td class="map"><code>characters.age &lt; 6</code></td></tr>
                <tr><td class="f">Nút Fast-forward</td><td>Chuyển nhanh lên 6 tuổi</td><td>Tự động tăng <code>age = 6</code>, tích lũy 5 năm phát triển tự nhiên</td><td class="map"><code>characters.age = 6</code></td></tr>
                <tr><td class="f">Tư chất ấu thơ</td><td>Hình thành thiên hướng IQ/EQ</td><td>Ghi nhận các cờ tư chất vào mảng JSONB</td><td class="map"><code>characters.innate_traits</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Chuyển tiếp nhanh giai đoạn ấu thơ lên 6 tuổi</summary>
<pre>UPDATE characters
SET 
    age = 6,
    vitality = 100,
    max_vitality = 100,
    burnout = 0,
    cash = 0,
    innate_traits = innate_traits || '["Tuổi thơ bình an", "Thể chất dẻo dai"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id AND age &lt; 6;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Childhood Component
  participant BE as Engine (/childhood-fastforward)
  participant DB as CSDL
  U->>FE: Bấm "Chuyển tiếp nhanh lên 6 tuổi"
  FE->>BE: POST /api/game/childhood-fastforward { target_age: 6 }
  BE->>DB: Kiểm tra tuổi hiện tại của nhân vật (< 6)
  Note over BE: Khởi tạo các cột mốc thể chất mầm non<br/>Đặt age = 6, chuẩn bị bước vào hệ thống giáo dục
  BE->>DB: Cập nhật characters (age = 6, tư chất mới)
  DB-->>BE: Cập nhật thành công
  BE-->>FE: Trả kết quả { success: true, age: 6, milestones: [...] }
  FE-->>U: Hiển thị hoạt họa nhân vật cắp sách đến trường lớp 1
</pre></div>
        </div>
      </article>
    </section>
`;
