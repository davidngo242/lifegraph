// section_foundation.js
export const sectionFoundation = `
    <!-- 1. NỀN TẢNG CỐT LÕI -->
    <section id="nen-tang">
      <h2>1. Nền tảng cốt lõi & Vòng lặp RPG Nhập vai</h2>
      <p>Trước phiên bản V6.0, LifeGraph vận hành như một game chọn thẻ bài thụ động (card-picker), nơi người chơi chỉ đơn thuần bấm vào các lựa chọn định sẵn. Bản cập nhật V6.0 đã tái cấu trúc toàn diện thành <b>Hệ thống Sân khấu Tâm trí (RPG Mind Stage)</b> kết hợp cùng <b>Xúc xắc Định mệnh D20 tương tác</b> và <b>Phản ứng thị giác thời gian thực 0ms</b>:</p>
      <ul>
        <li><b>Sân khấu Tâm trí (Mind Stage):</b> Mọi sự kiện lớn không còn là lựa chọn tĩnh. Tâm trí nhân vật hiện lên 3 tiếng thì thầm đối thoại từ các bản ngã: <code>🧠 Lý Trí</code>, <code>❤️ Trái Tim</code> và <code>⚡ Bản Năng</code>. Người chơi chọn lập trường (Stance) đại diện cho phong cách sống.</li>
        <li><b>Xúc xắc Định mệnh D20 (Fate Dice System):</b> Thành bại của quyết định không định đoạt trước, mà được thử thách qua tung xúc xắc D20 vật lý với Ngưỡng khó khăn (DC). Chỉ số nhân vật, tư chất bẩm sinh và điểm hành động đầu tư (AP Boost) sẽ cộng trực tiếp vào kết quả gieo xúc xắc.</li>
        <li><b>Tối ưu hóa lượt click (Click Fatigue Reduction):</b> Triệt tiêu thao tác click lẻ tẻ qua <i>1-Click Annual Strategic Focus</i> (phân bổ trọng tâm năm) và <i>Childhood 0-5 Fast-Forward</i> (tự động hóa giai đoạn sơ sinh).</li>
        <li><b>Bảo vệ tài chính vị thành niên:</b> Trẻ em dưới 18 tuổi bị khóa tiền mặt nghiêm ngặt ở mức 0 VND. Toàn bộ chi phí sinh hoạt do quỹ gia đình gánh vác, xóa bỏ hoàn toàn hiện tượng vô lý khi trẻ 3 tuổi phải gánh nợ hay tự thanh toán tiền ăn.</li>
      </ul>

      <div class="seq"><pre class="mermaid">
flowchart LR
  subgraph L1[Layer 1: Vĩnh Cửu - Meta Progression]
    ACC[(player_accounts<br/>Karma vĩnh cửu · Lineage Tree)]
    PERK[(unlocked_perks<br/>Tư chất luân hồi)]
  end

  subgraph L2[Layer 2: Phù Du - Cuộc Đời Hiện Tại]
    CHAR[(characters<br/>Vitality · Burnout · Cash · AP)]
    NPC[(npcs<br/>Ân oán · Thiện cảm)]
    ASSET[(assets<br/>Bất động sản · Cổ phiếu)]
    REL[(relationships<br/>Gia tộc · Hôn nhân)]
  end

  subgraph TICK[Annual Tick Engine]
    CALC[Tính hao mòn sinh lực<br/>Tuổi & Burnout]
    SHIELD[Khiên bảo vệ tài chính<br/>Tuổi &lt; 18: Cash = 0]
    AP_POOL[Cấp phát 3 Action Points]
  end

  subgraph STAGE[Sân Khấu Tâm Trí & Số Phận]
    WHISP[Tiếng thì thầm Nội tâm<br/>Lý trí · Trái tim · Bản năng]
    DICE[Xúc xắc Định mệnh D20<br/>Chỉ số + Tư chất + AP vs DC]
  end

  ACC --> CHAR
  PERK --> CHAR
  CHAR --> TICK
  TICK --> AP_POOL
  AP_POOL --> STAGE
  STAGE -->|Thắng DC / Thua DC| CHAR
  STAGE -->|Biến động mối quan hệ| NPC
  STAGE -->|Dòng tiền & Lợi tức| ASSET
  CHAR -->|Lâm chung / Hết sinh lực| ACC
</pre></div>
    </section>

    <!-- 2. GIAO TIẾP HỆ THỐNG -->
    <section id="tich-hop">
      <h2>2. Giao tiếp hệ thống & Endpoints</h2>
      <p>LifeGraph kết nối mô hình Client-Server hiện đại giữa Next.js Frontend và Express Backend với chuẩn bảo mật mật mã HMAC-SHA256.</p>
      
      <div class="tbl">
        <table class="minw-l">
          <thead>
            <tr>
              <th>Phương thức</th>
              <th>Endpoint</th>
              <th>Mục đích nghiệp vụ</th>
              <th>Payload yêu cầu</th>
              <th>Bảo mật</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/auth/handshake</code></td>
              <td>Cấp phát Session Token ký mật mã chống can thiệp (Anti-tamper)</td>
              <td><code>{ client_id }</code></td>
              <td><span class="ui-tag s">Public</span></td>
            </tr>
            <tr>
              <td><code>GET</code></td>
              <td><code>/api/game/state</code></td>
              <td>Lấy toàn bộ trạng thái nhân vật, tài sản, NPC, gia đình và tình huống hiện hành</td>
              <td><em>Không có</em></td>
              <td><span class="ui-tag">Session Token</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/tick</code></td>
              <td>Thực thi bước nhảy năm (Tick), giải quyết lựa chọn RPG Mind Stage hoặc tung xúc xắc D20</td>
              <td><code>{ choice_id, stance, dice_roll, ap_spent, custom_action }</code></td>
              <td><span class="ui-tag w">HMAC Signed</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/action/annual-focus</code></td>
              <td>1-Click phân bổ trọng tâm chiến lược năm (Thể chất, Sự nghiệp, Gia đình)</td>
              <td><code>{ focus_type: 'career' | 'vitality' | 'family' }</code></td>
              <td><span class="ui-tag">Session Token</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/childhood-fastforward</code></td>
              <td>Chuyển tiếp nhanh giai đoạn 0–5 tuổi mầm non lên 6 tuổi (bước vào cấp 1)</td>
              <td><code>{ target_age: 6 }</code></td>
              <td><span class="ui-tag">Session Token</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/action/buy-asset</code></td>
              <td>Mua tài sản sinh lời (Bất động sản, Cổ phiếu công nghệ, Doanh nghiệp)</td>
              <td><code>{ asset_id, category, amount }</code></td>
              <td><span class="ui-tag w">HMAC Signed</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/action/upgrade-housing</code></td>
              <td>Nâng cấp nơi ở (Trọ bình dân -> Căn hộ cao cấp -> Dinh thự sinh thái)</td>
              <td><code>{ tier_id }</code></td>
              <td><span class="ui-tag">Session Token</span></td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/api/game/rebirth</code></td>
              <td>Tái sinh luân hồi, tính toán điểm Karma, bốc quẻ Tarot và mở khóa tư chất kiếp sau</td>
              <td><code>{ selected_perks, chosen_heritage }</code></td>
              <td><span class="ui-tag w">HMAC Signed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 3. ENGINE TÍNH TOÁN -->
    <section id="engine">
      <h2>3. Engine tính toán & Quy tắc vận hành thời gian thực</h2>
      <p>Toàn bộ cơ chế mô phỏng cuộc đời được điều phối thông qua các công thức toán học và quy tắc nghiệp vụ nghiêm ngặt trong <code>tickEngine.js</code>:</p>

      <div class="flow">
        <div>
          <div class="side">Công thức Suy hao Sinh lực (Vitality Decay)</div>
          <p>Sinh lực tối đa (Max Vitality) bị suy giảm tự nhiên theo độ tuổi từ năm 35 tuổi trở đi, mô phỏng quá trình lão hóa sinh học:</p>
          <pre class="mono" style="background:var(--bg);padding:8px;border-radius:4px;font-size:12px;">
Max_Vitality(age) = 
  if is_transhuman: return 100
  if age &lt; 35: return 100
  else: return max(20, 100 - floor((age - 35) * 1.25))
          </pre>
        </div>
        <div>
          <div class="side">Khiên Bảo vệ Tài chính Vị thành niên</div>
          <p>Loại bỏ lỗi logic game đời sống khi trẻ em có tiền mặt hoặc gánh nợ cá nhân:</p>
          <ul>
            <li>Với nhân vật dưới 18 tuổi: Tiền mặt cá nhân luôn cố định <code>cash = 0</code>.</li>
            <li>Học phí, dinh dưỡng và y tế được chi trả trực tiếp từ quỹ bảo trợ gia đình (<code>family_endowment</code>).</li>
            <li>Đủ 18 tuổi: Hệ thống mở khóa ví tiền cá nhân và trao quyền tự chủ tài chính.</li>
          </ul>
        </div>
      </div>

      <div class="flow" style="margin-top:12px;">
        <div>
          <div class="side">Công thức Xúc xắc Định mệnh D20</div>
          <p>Xác định kết quả hành động dựa trên ngưỡng độ khó (DC - Difficulty Class):</p>
          <pre class="mono" style="background:var(--bg);padding:8px;border-radius:4px;font-size:12px;">
Total_Roll = D20_Base + Stat_Bonus + Trait_Mod + (AP_Boost * 2)

Kết quả:
  - Total_Roll &gt;= DC + 5 : Critical Success (Thành tựu xuất chúng)
  - Total_Roll &gt;= DC     : Success (Thành công trọn vẹn)
  - Total_Roll &lt; DC      : Hard Lesson (Bài học đắt giá)
          </pre>
        </div>
        <div>
          <div class="side">Cơ chế Kiệt sức (Burnout Penalty)</div>
          <p>Khi Burnout tích lũy vượt ngưỡng an toàn:</p>
          <ul>
            <li><code>Burnout &gt; 70</code>: Mỗi năm trừ thêm <code>floor((Burnout - 70) / 5)</code> điểm sinh lực.</li>
            <li><code>Burnout == 100</code>: Kích hoạt khẩn cấp biến cố "Đột quỵ / Suy nhược cấp tính" đe dọa trực tiếp tính mạng nhân vật.</li>
            <li>Nơi ở cao cấp (Luxury Housing) tự động hồi phục 15-25 điểm Burnout mỗi năm.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 4. CHIẾN LƯỢC LƯU TRỮ -->
    <section id="luu-tru">
      <h2>4. Chiến lược lưu trữ & Kiến trúc 2 tầng (Dual-Layer)</h2>
      <p>Cơ sở dữ liệu của LifeGraph được thiết kế phân tầng triệt để nhằm tách biệt giữa tiến trình bất tử của người chơi và sinh mệnh tạm bợ của nhân vật:</p>
      
      <div class="flow">
        <div>
          <div class="side">Tầng 1: Vĩnh Cửu (Layer 1 - Meta Progression)</div>
          <p>Bảng <code>player_accounts</code> lưu trữ danh tính người chơi, tổng điểm Karma tích lũy qua các kiếp, phả hệ tổ tiên và cây công đức gia tộc. <b>Tuyệt đối không bao giờ bị xóa hay reset</b> khi nhân vật qua đời.</p>
        </div>
        <div>
          <div class="side">Tầng 2: Phù Du (Layer 2 - Mortal Session)</div>
          <p>Bảng <code>characters</code> cùng các bảng quan hệ <code>assets</code>, <code>npcs</code>, <code>relationships</code> đại diện cho một kiếp sống duy nhất. Khi nhân vật qua đời, dữ liệu này được đóng băng thành bản ghi lịch sử phục vụ Death Recap và kế thừa thế hệ.</p>
        </div>
      </div>
    </section>
`;
