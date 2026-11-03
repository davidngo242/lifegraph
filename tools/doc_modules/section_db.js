// section_db.js
export const sectionDb = `
    <!-- 5. BẢNG DỮ LIỆU CSDL -->
    <section id="bang">
      <h2>5. Bảng dữ liệu CSDL & Data Dictionary</h2>
      <p>Hệ thống sử dụng cơ sở dữ liệu quan hệ PostgreSQL chuẩn hóa cao với hỗ trợ định dạng JSONB cho các cấu trúc dữ liệu linh hoạt (tư chất, cờ cốt truyện, lịch sử snapshot).</p>

      <!-- player_accounts -->
      <div class="block">
        <h3>5.1. Bảng <code>player_accounts</code> (Layer 1 - Meta Tiến trình vĩnh cửu)</h3>
        <div class="tbl">
          <table class="minw">
            <thead><tr><th>Tên cột</th><th>Kiểu</th><th>Nullable</th><th>Mặc định</th><th>Mô tả nghiệp vụ</th></tr></thead>
            <tbody>
              <tr><td class="f">id</td><td>VARCHAR(100)</td><td class="req y">NOT NULL</td><td>'primary_player'</td><td>Khóa chính đại diện cho tài khoản người chơi bất tử</td></tr>
              <tr><td class="f">total_karma</td><td>INT</td><td class="req y">NOT NULL</td><td>100</td><td>Tổng điểm công đức luân hồi tích lũy từ mọi kiếp</td></tr>
              <tr><td class="f">unlocked_perks</td><td>JSONB</td><td class="req y">NOT NULL</td><td>'[]'::jsonb</td><td>Danh sách tư chất vĩnh viễn đã mua bằng Karma</td></tr>
              <tr><td class="f">reincarnation_count</td><td>INT</td><td class="req y">NOT NULL</td><td>1</td><td>Số kiếp luân hồi đã trải qua</td></tr>
              <tr><td class="f">lifetime_stats</td><td>JSONB</td><td class="req y">NOT NULL</td><td>'{...}'::jsonb</td><td>Thống kê tổng số năm đã sống, tài sản cao nhất, số lần tử nạn</td></tr>
              <tr><td class="f">created_at</td><td>TIMESTAMPTZ</td><td class="req">NULL</td><td>CURRENT_TIMESTAMP</td><td>Thời điểm lập hồ sơ người chơi</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- characters -->
      <div class="block" style="margin-top:20px;">
        <h3>5.2. Bảng <code>characters</code> (Layer 2 - Nhân vật kiếp sống hiện hành)</h3>
        <div class="tbl">
          <table class="minw-l">
            <thead><tr><th>Tên cột</th><th>Kiểu</th><th>Nullable</th><th>Mặc định</th><th>Mô tả nghiệp vụ</th></tr></thead>
            <tbody>
              <tr><td class="f">id</td><td>UUID</td><td class="req y">NOT NULL</td><td>gen_random_uuid()</td><td>Khóa chính nhận diện kiếp sống hiện tại</td></tr>
              <tr><td class="f">player_account_id</td><td>VARCHAR(100)</td><td class="req y">NOT NULL</td><td>'primary_player'</td><td>FK tham chiếu đến bảng vĩnh cửu <code>player_accounts</code></td></tr>
              <tr><td class="f">name</td><td>VARCHAR(255)</td><td class="req y">NOT NULL</td><td></td><td>Họ và tên nhân vật theo bản sắc văn hóa quốc gia</td></tr>
              <tr><td class="f">age</td><td>INT</td><td class="req y">NOT NULL</td><td>0</td><td>Tuổi hiện tại của nhân vật (0 đến 120+)</td></tr>
              <tr><td class="f">generation</td><td>INT</td><td class="req y">NOT NULL</td><td>1</td><td>Đời thứ mấy trong gia phả gia tộc</td></tr>
              <tr><td class="f">nationality</td><td>VARCHAR(100)</td><td class="req y">NOT NULL</td><td>'T2_Vietnam'</td><td>Quốc tịch và nền kinh tế xuất phát điểm</td></tr>
              <tr><td class="f">vitality</td><td>INT</td><td class="req y">NOT NULL</td><td>100</td><td>Điểm sinh lực hiện tại (0: Tử vong lâm chung, 100: Tối đa)</td></tr>
              <tr><td class="f">max_vitality</td><td>INT</td><td class="req y">NOT NULL</td><td>100</td><td>Ngưỡng trần sinh lực (suy giảm theo tuổi trừ khi Transhuman)</td></tr>
              <tr><td class="f">burnout</td><td>INT</td><td class="req y">NOT NULL</td><td>0</td><td>Mức độ căng thẳng / kiệt sức tâm lý (0 đến 100)</td></tr>
              <tr><td class="f">cash</td><td>BIGINT</td><td class="req y">NOT NULL</td><td>0</td><td>Tiền mặt tự do (khóa ở mức 0 VND cho đến 18 tuổi)</td></tr>
              <tr><td class="f">family_endowment</td><td>BIGINT</td><td class="req y">NOT NULL</td><td>0</td><td>Quỹ bảo trợ gia đình gánh vác chi phí khi &lt; 18 tuổi</td></tr>
              <tr><td class="f">action_points</td><td>INT</td><td class="req y">NOT NULL</td><td>3</td><td>Điểm hành động cấp phát mỗi năm để học tập/sự nghiệp/thể chất</td></tr>
              <tr><td class="f">innate_traits</td><td>JSONB</td><td class="req y">NOT NULL</td><td>'[]'::jsonb</td><td>Các tư chất bẩm sinh (ví dụ: 'Gen thiên tài', 'Ý chí sắt đá')</td></tr>
              <tr><td class="f">hidden_flags</td><td>JSONB</td><td class="req y">NOT NULL</td><td>'[]'::jsonb</td><td>Cờ cốt truyện bí mật dẫn dắt các sự kiện rẽ nhánh tương lai</td></tr>
              <tr><td class="f">is_transhuman</td><td>BOOLEAN</td><td class="req y">NOT NULL</td><td>false</td><td>Đã cấy ghép công nghệ sinh học/bất tử hay chưa</td></tr>
              <tr><td class="f">is_deceased</td><td>BOOLEAN</td><td class="req y">NOT NULL</td><td>false</td><td>Đánh dấu nhân vật đã qua đời (kích hoạt Death Recap & Luân hồi)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- npcs -->
      <div class="block" style="margin-top:20px;">
        <h3>5.3. Bảng <code>npcs</code> (Mạng lưới nhân vật NPC & Ký ức xã hội)</h3>
        <div class="tbl">
          <table class="minw">
            <thead><tr><th>Tên cột</th><th>Kiểu</th><th>Nullable</th><th>Mặc định</th><th>Mô tả nghiệp vụ</th></tr></thead>
            <tbody>
              <tr><td class="f">id</td><td>UUID</td><td class="req y">NOT NULL</td><td>gen_random_uuid()</td><td>Khóa chính định danh NPC</td></tr>
              <tr><td class="f">character_id</td><td>UUID</td><td class="req y">NOT NULL</td><td></td><td>FK tham chiếu <code>characters.id</code> (ON DELETE CASCADE)</td></tr>
              <tr><td class="f">name</td><td>VARCHAR(255)</td><td class="req y">NOT NULL</td><td></td><td>Tên NPC tương tác</td></tr>
              <tr><td class="f">role</td><td>VARCHAR(100)</td><td class="req y">NOT NULL</td><td></td><td>Vai trò quan hệ: 'Tình đầu', 'Sếp cũ', 'Kẻ thù', 'Tri kỷ', 'Đối tác'</td></tr>
              <tr><td class="f">affinity</td><td>INT</td><td class="req y">NOT NULL</td><td>50</td><td>Điểm thiện cảm (-100 thù hận đến +100 tri kỷ sống chết)</td></tr>
              <tr><td class="f">memory_notes</td><td>TEXT</td><td class="req">NULL</td><td></td><td>Ghi nhớ ký ức tương tác với nhân vật phục vụ đối thoại AI</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- assets -->
      <div class="block" style="margin-top:20px;">
        <h3>5.4. Bảng <code>assets</code> (Danh mục tài sản & Bất động sản sở hữu)</h3>
        <div class="tbl">
          <table class="minw">
            <thead><tr><th>Tên cột</th><th>Kiểu</th><th>Nullable</th><th>Mặc định</th><th>Mô tả nghiệp vụ</th></tr></thead>
            <tbody>
              <tr><td class="f">id</td><td>UUID</td><td class="req y">NOT NULL</td><td>gen_random_uuid()</td><td>Khóa chính tài sản</td></tr>
              <tr><td class="f">character_id</td><td>UUID</td><td class="req y">NOT NULL</td><td></td><td>FK tham chiếu <code>characters.id</code></td></tr>
              <tr><td class="f">type</td><td>VARCHAR(50)</td><td class="req y">NOT NULL</td><td></td><td>Loại tài sản: 'real_estate', 'stock', 'business', 'crypto'</td></tr>
              <tr><td class="f">name</td><td>VARCHAR(255)</td><td class="req y">NOT NULL</td><td></td><td>Tên tài sản (Căn hộ Penthouse, Cổ phần VinFast, Trại nông sản)</td></tr>
              <tr><td class="f">current_value</td><td>BIGINT</td><td class="req y">NOT NULL</td><td>0</td><td>Định giá thị trường hiện thời</td></tr>
              <tr><td class="f">maintenance_cost_per_tick</td><td>INT</td><td class="req y">NOT NULL</td><td>0</td><td>Chi phí duy trì / thuế thường niên</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 6. QUAN HỆ BẢNG -->
    <section id="quan-he">
      <h2>6. Quan hệ bảng & Khóa ngoại (ERD)</h2>
      <p>Sơ đồ thực thể liên kết (Entity Relationship Diagram) thể hiện mối tương quan chặt chẽ giữa tài khoản vĩnh cửu và các thực thể phù du của kiếp sống:</p>
      
      <div class="seq"><pre class="mermaid">
erDiagram
  player_accounts ||--o{ characters : "sở hữu qua các kiếp"
  characters ||--o{ npcs : "quen biết & tương tác"
  characters ||--o{ assets : "nắm giữ danh mục đầu tư"
  characters ||--o{ relationships : "quan hệ gia đình & vợ chồng"
  characters ||--o{ tick_events : "nhật ký biến cố hàng năm"
  player_accounts ||--o{ ancestral_memorials : "vinh danh tại ban thờ tổ tiên"

  player_accounts {
    string id PK
    int total_karma
    jsonb unlocked_perks
    int reincarnation_count
  }

  characters {
    uuid id PK
    string player_account_id FK
    string name
    int age
    int vitality
    int burnout
    bigint cash
    bigint family_endowment
    int action_points
    boolean is_deceased
  }

  npcs {
    uuid id PK
    uuid character_id FK
    string name
    string role
    int affinity
    text memory_notes
  }

  assets {
    uuid id PK
    uuid character_id FK
    string type
    string name
    bigint current_value
    int maintenance_cost_per_tick
  }

  relationships {
    uuid id PK
    uuid character_id FK
    string type
    string name
    int affection_level
  }
</pre></div>
    </section>

    <!-- 7. ENUM & DANH MỤC -->
    <section id="enum">
      <h2>7. Enum & Danh mục chuẩn</h2>
      <div class="tbl">
        <table class="minw">
          <thead><tr><th>Tên Enum</th><th>Giá trị hợp lệ</th><th>Ý nghĩa nghiệp vụ</th></tr></thead>
          <tbody>
            <tr>
              <td class="f"><code>AgeStage</code></td>
              <td><code>INFANT_0_5</code>, <code>YOUTH_6_17</code>, <code>ADULT_18_59</code>, <code>ELDER_60_PLUS</code></td>
              <td>Giai đoạn độ tuổi: Ấu thơ, Vị thành niên, Trưởng thành, Tuổi xế chiều</td>
            </tr>
            <tr>
              <td class="f"><code>MindStance</code></td>
              <td><code>RATIONAL</code>, <code>EMPATHY</code>, <code>INSTINCT</code>, <code>RISK</code>, <code>DIPLOMATIC</code></td>
              <td>Lập trường tâm trí trong Mind Stage: Lý trí, Thấu cảm, Bản năng, Đột phá, Khôn khéo</td>
            </tr>
            <tr>
              <td class="f"><code>FateResult</code></td>
              <td><code>CRITICAL_SUCCESS</code>, <code>SUCCESS</code>, <code>HARD_LESSON</code></td>
              <td>Kết quả gieo xúc xắc D20: Xuất chúng (DC+5), Thành công (DC), Bài học đắt giá (&lt; DC)</td>
            </tr>
            <tr>
              <td class="f"><code>HousingTier</code></td>
              <td><code>TIER_0_SLUM</code>, <code>TIER_1_RENTAL</code>, <code>TIER_2_STUDIO</code>, <code>TIER_3_CONDO</code>, <code>TIER_4_MANSION</code></td>
              <td>Cấp bậc nơi ở: Từ nhà trọ ổ chuột đến dinh thự triệu đô (tăng hồi phục Burnout & AP)</td>
            </tr>
            <tr>
              <td class="f"><code>KarmaRarity</code></td>
              <td><code>COMMON</code>, <code>UNCOMMON</code>, <code>RARE</code>, <code>EPIC</code>, <code>LEGENDARY</code>, <code>MYTHIC</code></td>
              <td>Độ hiếm tư chất luân hồi trong Soul Gacha</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. MA TRẬN CHỨC NĂNG × BẢNG CSDL -->
    <section id="ma-tran">
      <h2>8. Ma trận Chức năng × Bảng CSDL</h2>
      <p>Bảng ma trận truy xuất dữ liệu (CRUD Matrix) đối chiếu giữa 18 tính năng cốt lõi và các bảng cơ sở dữ liệu tương ứng:</p>
      <div class="tbl">
        <table class="minw-x">
          <thead>
            <tr>
              <th>Mã chức năng</th>
              <th>Tên tính năng</th>
              <th>player_accounts</th>
              <th>characters</th>
              <th>npcs</th>
              <th>assets</th>
              <th>relationships</th>
              <th>tick_events</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="f">LG-F01</td><td>Character Hero Banner & 3D Scene</td><td>R</td><td>R</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            <tr><td class="f">LG-F02</td><td>Annual Tick & Minor Shield</td><td>-</td><td>R/W</td><td>-</td><td>R/W</td><td>R/W</td><td>W</td></tr>
            <tr><td class="f">LG-F03</td><td>Action Point Hub & 1-Click Focus</td><td>-</td><td>R/W</td><td>-</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F04</td><td>Childhood 0–5 Nurture & Fastforward</td><td>-</td><td>R/W</td><td>-</td><td>-</td><td>R/W</td><td>W</td></tr>
            <tr><td class="f">LG-F05</td><td>Mind Stage & Ego Whispers</td><td>-</td><td>R/W</td><td>R</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F06</td><td>Fate Dice D20 & DC Check</td><td>-</td><td>R/W</td><td>-</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F07</td><td>AI Game Master & Scenarios</td><td>-</td><td>R/W</td><td>R/W</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F08</td><td>NPC Confrontation Stage</td><td>-</td><td>R/W</td><td>R/W</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F09</td><td>Asset Market & Portfolio</td><td>-</td><td>R/W</td><td>-</td><td>R/W</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F10</td><td>Housing Tier Upgrades</td><td>-</td><td>R/W</td><td>-</td><td>R/W</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F11</td><td>MMO Macro Index & Real World</td><td>-</td><td>R</td><td>-</td><td>R</td><td>-</td><td>-</td></tr>
            <tr><td class="f">LG-F12</td><td>Family Sanctum & Romance</td><td>-</td><td>R/W</td><td>-</td><td>-</td><td>R/W</td><td>W</td></tr>
            <tr><td class="f">LG-F13</td><td>Heir Succession & Legacy</td><td>R/W</td><td>R/W</td><td>-</td><td>R/W</td><td>R/W</td><td>W</td></tr>
            <tr><td class="f">LG-F14</td><td>Ancestral Altar & Incense</td><td>R/W</td><td>R/W</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            <tr><td class="f">LG-F15</td><td>Karmic Rebirth & Soul Gacha</td><td>R/W</td><td>W</td><td>-</td><td>-</td><td>-</td><td>W</td></tr>
            <tr><td class="f">LG-F16</td><td>Death Recap Video 15s</td><td>-</td><td>R</td><td>R</td><td>R</td><td>R</td><td>R</td></tr>
            <tr><td class="f">LG-F17</td><td>Cryptographic Handshake & Audit</td><td>R</td><td>R</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            <tr><td class="f">LG-F18</td><td>Lifelong Aspiration & Transhumanism</td><td>-</td><td>R/W</td><td>-</td><td>-</td><td>-</td><td>W</td></tr>
          </tbody>
        </table>
      </div>
    </section>
`;
