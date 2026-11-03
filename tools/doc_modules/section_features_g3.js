// section_features_g3.js
export const sectionFeaturesG3 = `
    <!-- 11. NHÓM 3: KINH TẾ VĨ MÔ, THỊ TRƯỜNG & BẤT ĐỘNG SẢN -->
    <section id="g3">
      <h2>11. Nhóm 3: Kinh tế vĩ mô, Thị trường & Bất động sản</h2>

      <!-- LG-F09 -->
      <article class="feature" id="LG-F09">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F09</span>
            <h3>Thị trường Tài sản & Danh mục đầu tư (Asset Market & Portfolio)</h3>
          </div>
          <p class="caption">Hệ thống đầu tư đa dạng cho phép nhân vật xây dựng danh mục tài sản sinh lời: Bất động sản cho thuê, Cổ phiếu niêm yết, Quỹ đầu tư mạo hiểm và Doanh nghiệp tư nhân. Tính toán dòng tiền thụ động, chi phí bảo trì và giá trị vốn hóa theo từng năm.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Sàn Giao Dịch Tài Sản & Đầu Tư (Asset Market)</b></div>
              <div class="ui-page">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <div>
                    <div style="font-size:15px;font-weight:700;">Danh Mục Đầu Tư Cá Nhân</div>
                    <div style="font-size:12px;color:#64748b;">Tổng giá trị tài sản ròng: <b style="color:#059669;">2.450.000.000 ₫</b></div>
                  </div>
                  <button class="ui-btn p">+ Mua Tài Sản Mới</button>
                </div>

                <div class="ui-tw">
                  <table class="ui-t">
                    <thead>
                      <tr>
                        <th>Tên tài sản</th>
                        <th>Phân loại</th>
                        <th>Giá trị hiện thời</th>
                        <th>Lợi tức năm</th>
                        <th>Chi phí bảo trì</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="f">🏢 Căn hộ 2PN Vinhomes</td>
                        <td><span class="ui-tag">Bất động sản</span></td>
                        <td>1.800.000.000 ₫</td>
                        <td style="color:#059669;font-weight:600;">+72.000.000 ₫ (+4%)</td>
                        <td style="color:#dc2626;">-6.000.000 ₫</td>
                        <td><button class="ui-btn sm d">Bán thanh lý</button></td>
                      </tr>
                      <tr>
                        <td class="f">📈 Cổ phiếu VinFast (VFS)</td>
                        <td><span class="ui-tag w">Cổ phiếu</span></td>
                        <td>450.000.000 ₫</td>
                        <td style="color:#059669;font-weight:600;">+45.000.000 ₫ (+10%)</td>
                        <td>0 ₫</td>
                        <td><button class="ui-btn sm d">Chốt lời</button></td>
                      </tr>
                      <tr>
                        <td class="f">☕ Quán cà phê nhượng quyền</td>
                        <td><span class="ui-tag gold">Doanh nghiệp</span></td>
                        <td>200.000.000 ₫</td>
                        <td style="color:#059669;font-weight:600;">+36.000.000 ₫ (+18%)</td>
                        <td style="color:#dc2626;">-12.000.000 ₫</td>
                        <td><button class="ui-btn sm d">Chuyển nhượng</button></td>
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
              <thead><tr><th>Cột hiển thị</th><th>Ý nghĩa</th><th>Kiểu dữ liệu</th><th>Mapping CSDL</th></tr></thead>
              <tbody>
                <tr><td class="f">Tên tài sản</td><td>Mô tả tài sản đầu tư</td><td>String</td><td class="map"><code>assets.name</code></td></tr>
                <tr><td class="f">Phân loại</td><td>Loại hình tài sản</td><td>Enum</td><td class="map"><code>assets.type</code> ('real_estate', 'stock', 'business')</td></tr>
                <tr><td class="f">Giá trị hiện thời</td><td>Định giá theo thị trường</td><td>BIGINT</td><td class="map"><code>assets.current_value</code></td></tr>
                <tr><td class="f">Chi phí bảo trì</td><td>Khấu hao / quản lý mỗi năm</td><td>INT</td><td class="map"><code>assets.maintenance_cost_per_tick</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Mua tài sản mới và trừ tiền mặt</summary>
<pre>BEGIN;
  -- 1. Kiểm tra và trừ tiền mặt
  UPDATE characters
  SET cash = cash - :asset_price, updated_at = CURRENT_TIMESTAMP
  WHERE id = :character_id AND cash >= :asset_price AND age >= 18;

  -- 2. Thêm bản ghi tài sản mới
  INSERT INTO assets (character_id, type, name, current_value, maintenance_cost_per_tick)
  VALUES (:character_id, :type, :name, :asset_price, :maintenance_cost);
COMMIT;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Asset Market
  participant BE as Engine (/action/buy-asset)
  participant DB as CSDL
  U->>FE: Bấm chọn mua "Căn hộ Studio" (Giá: 1.2 Tỷ)
  FE->>BE: POST /api/game/action/buy-asset { asset_id: 'studio_01', price: 1200000000 }
  BE->>DB: Kiểm tra số dư cash của character >= 1.2 Tỷ và age >= 18
  Note over BE: Khởi tạo giao dịch mua bán an toàn<br/>Trừ tiền mặt và ghi nhận vào bảng assets
  BE->>DB: Trừ cash & Thêm assets
  DB-->>BE: Hoàn tất Transaction
  BE-->>FE: Trả kết quả thành công { asset, remaining_cash }
  FE-->>U: Hiển thị thông báo mua nhà thành công và cập nhật Hero Banner
</pre></div>
        </div>
      </article>

      <!-- LG-F10 -->
      <article class="feature" id="LG-F10">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F10</span>
            <h3>Nâng cấp nơi ở & Nhà ở gia đình (Housing Tier Upgrades)</h3>
          </div>
          <p class="caption">Nơi ở là yếu tố then chốt quyết định chất lượng cuộc sống và tốc độ hồi phục của nhân vật. Từ phòng trọ tồi tàn (không hồi phục Burnout, dễ sinh bệnh) cho đến Căn hộ cao cấp và Dinh thự sinh thái (giảm stress cực nhanh, tặng thêm điểm AP mỗi năm và mở rộng không gian nuôi dạy con cái).</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Nâng Cấp Nơi Ở & Môi Trường Sống (Housing Tiers)</b></div>
              <div class="ui-page">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
                  <div style="border:1px solid #cbd5e1;border-radius:6px;padding:12px;background:#f8fafc;">
                    <span class="ui-tag i">Cấp 1: Phòng Trọ Ổ Chuột</span>
                    <div style="font-weight:700;font-size:14px;margin:6px 0;">Trọ Tồi Tàn Vùng Ven</div>
                    <div style="font-size:12px;color:#64748b;">Chi phí: 1.5M / tháng</div>
                    <div style="font-size:11.5px;color:#dc2626;margin-top:6px;">⚠️ Không giảm Burnout · Tăng nguy cơ ốm đau</div>
                  </div>

                  <div style="border:2px solid #4f46e5;border-radius:6px;padding:12px;background:#eef2ff;">
                    <span class="ui-tag s">Cấp 3: Căn Hộ Chung Cư Cao Cấp (Hiện Tại)</span>
                    <div style="font-weight:700;font-size:14px;margin:6px 0;color:#3730a3;">Condo Vinhomes 2PN</div>
                    <div style="font-size:12px;color:#4338ca;">Chi phí bảo trì: 25M / năm</div>
                    <div style="font-size:11.5px;color:#059669;margin-top:6px;">✨ Giảm -15 Burnout/năm · Tặng +1 AP/năm</div>
                    <button class="ui-btn sm p" style="width:100%;margin-top:8px;" disabled>Đang sinh sống</button>
                  </div>

                  <div style="border:1px solid #cbd5e1;border-radius:6px;padding:12px;background:#fff;">
                    <span class="ui-tag gold">Cấp 4: Biệt Thự Sân Vườn Độc Lập</span>
                    <div style="font-weight:700;font-size:14px;margin:6px 0;">Villa Ciputra Eco</div>
                    <div style="font-size:12px;color:#64748b;">Giá mua: 15.000.000.000 ₫</div>
                    <div style="font-size:11.5px;color:#059669;margin-top:6px;">👑 Giảm -30 Burnout/năm · Tặng +2 AP/năm · Con cái kế thừa gen tốt</div>
                    <button class="ui-btn sm p" style="width:100%;margin-top:8px;">Nâng cấp nơi ở</button>
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
              <thead><tr><th>Cấp bậc</th><th>Tên nơi ở</th><th>Giảm Burnout</th><th>Thưởng Action Point</th><th>Mapping CSDL</th></tr></thead>
              <tbody>
                <tr><td class="f">Tier 0</td><td>Trọ ổ chuột / Vô gia cư</td><td>0</td><td>0 AP</td><td class="map"><code>characters.hidden_flags-&gt;'housing' = 'slum'</code></td></tr>
                <tr><td class="f">Tier 1</td><td>Nhà trọ sinh viên bình dân</td><td>-5 / năm</td><td>0 AP</td><td class="map"><code>characters.hidden_flags-&gt;'housing' = 'rental'</code></td></tr>
                <tr><td class="f">Tier 2</td><td>Căn hộ Studio nhỏ</td><td>-10 / năm</td><td>0 AP</td><td class="map"><code>characters.hidden_flags-&gt;'housing' = 'studio'</code></td></tr>
                <tr><td class="f">Tier 3</td><td>Chung cư cao cấp 2-3PN</td><td>-15 / năm</td><td>+1 AP / năm</td><td class="map"><code>characters.hidden_flags-&gt;'housing' = 'condo'</code></td></tr>
                <tr><td class="f">Tier 4</td><td>Biệt thự / Penthouse siêu sang</td><td>-30 / năm</td><td>+2 AP / năm</td><td class="map"><code>characters.hidden_flags-&gt;'housing' = 'mansion'</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Nâng cấp cấp bậc nơi ở và cấu hình cờ hệ số hồi phục</summary>
<pre>UPDATE characters
SET 
    cash = cash - :upgrade_cost,
    hidden_flags = jsonb_set(
        hidden_flags,
        '{housing}',
        to_jsonb(:housing_tier::text)
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE id = :character_id AND cash >= :upgrade_cost;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as Housing Upgrade Modal
  participant BE as Engine (/action/upgrade-housing)
  participant DB as CSDL
  U->>FE: Bấm chọn "Nâng cấp lên Biệt thự Villa"
  FE->>BE: POST /api/game/action/upgrade-housing { tier_id: 'mansion' }
  BE->>DB: Kiểm tra số dư tiền mặt của nhân vật
  Note over BE: Khấu trừ chi phí nâng cấp<br/>Cập nhật cờ housing = 'mansion'<br/>Thiết lập tỷ lệ hồi phục Burnout = -30 điểm/năm
  BE->>DB: Lưu cờ mới vào characters.hidden_flags
  DB-->>BE: Xác nhận thành công
  BE-->>FE: Trả kết quả { success: true, new_housing: 'mansion' }
  FE-->>U: Cập nhật cảnh quan nền 3D sang khuôn viên biệt thự sang trọng
</pre></div>
        </div>
      </article>

      <!-- LG-F11 -->
      <article class="feature" id="LG-F11">
        <div class="f-head">
          <div class="f-title">
            <span class="id">LG-F11</span>
            <h3>MMO Macro Index & Đồng bộ chỉ số thế giới thực</h3>
          </div>
          <p class="caption">Hệ thống đồng bộ dữ liệu vĩ mô tạo nên tính sống động cho môi trường giả lập. Chỉ số kinh tế, lạm phát và môi trường được lấy mẫu từ dữ liệu kinh tế vĩ mô thực tế, tác động trực tiếp lên giá bất động sản, thị trường lao động và lợi tức cổ phiếu của người chơi.</p>
        </div>

        <div class="block">
          <div class="k">Giao diện người dùng (Mockup UI)</div>
          <figure class="ui-fig">
            <div class="ui">
              <div class="ui-bar"><div class="dots"><i></i><i></i><i></i></div><span class="sep">|</span><b>Chỉ Số Kinh Tế Vĩ Mô Toàn Cầu (MMO Weather Bar)</b></div>
              <div class="ui-page" style="padding:12px 18px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                  <div style="display:flex;gap:16px;align-items:center;">
                    <div>
                      <span style="font-size:11px;color:#64748b;text-transform:uppercase;">Kinh tế thị trường</span>
                      <div style="font-weight:700;color:#059669;font-size:14px;">📈 68/100 (Tăng trưởng)</div>
                    </div>
                    <div>
                      <span style="font-size:11px;color:#64748b;text-transform:uppercase;">Áp lực lạm phát</span>
                      <div style="font-weight:700;color:#d97706;font-size:14px;">🔥 4.2% (Ổn định)</div>
                    </div>
                    <div>
                      <span style="font-size:11px;color:#64748b;text-transform:uppercase;">Môi trường sống</span>
                      <div style="font-weight:700;color:#4f46e5;font-size:14px;">🌱 72/100 (Trong lành)</div>
                    </div>
                  </div>
                  <span class="ui-tag s">Cơ hội việc làm: Thuận lợi (+15% lương thưởng)</span>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <div class="block">
          <div class="k">Mô tả chi tiết & Mapping CSDL</div>
          <div class="tbl">
            <table class="minw-l">
              <thead><tr><th>Chỉ số vĩ mô</th><th>Ý nghĩa</th><th>Ảnh hưởng trong game</th><th>Mapping CSDL</th></tr></thead>
              <tbody>
                <tr><td class="f">Kinh tế (Economy Index)</td><td>Điểm số tăng trưởng kinh tế</td><td>Nếu &gt; 60: Tăng lương và lợi nhuận đầu tư. Nếu &lt; 40: Nguy cơ mất việc</td><td class="map"><code>characters.global_indices-&gt;'economy'</code></td></tr>
                <tr><td class="f">Lạm phát (Inflation)</td><td>Tỷ lệ trượt giá tiền tệ</td><td>Tăng chi phí sinh hoạt thường niên và giá bất động sản</td><td class="map"><code>characters.global_indices-&gt;'inflation'</code></td></tr>
                <tr><td class="f">Môi trường (Environment)</td><td>Chất lượng không khí & khí hậu</td><td>Môi trường xấu làm gia tăng tốc độ suy hao sinh lực</td><td class="map"><code>characters.global_indices-&gt;'environment'</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="block">
          <details class="sql">
            <summary>SQL – Đọc và đồng bộ chỉ số MMO Macro vào trạng thái nhân vật</summary>
<pre>SELECT global_indices,
       (global_indices->>'economy')::int AS economy_idx,
       (global_indices->>'environment')::int AS env_idx
FROM characters
WHERE id = :character_id;</pre>
          </details>
        </div>

        <div class="block">
          <div class="k">Luồng nghiệp vụ xử lý</div>
          <div class="seq"><pre class="mermaid">
sequenceDiagram
  autonumber
  actor U as Người chơi
  participant FE as MmoWeatherBar
  participant BE as Macro Service (/macro/mmo-state)
  participant DB as CSDL
  FE->>BE: GET /api/game/macro/mmo-state
  BE->>BE: Tính toán độ lệch thị trường từ bộ nhớ đệm
  BE-->>FE: Trả về { economy: 68, inflation: 4.2, environment: 72 }
  FE-->>U: Cập nhật thanh thời tiết vĩ mô và tính toán hệ số lương thưởng năm
</pre></div>
        </div>
      </article>
    </section>
`;
