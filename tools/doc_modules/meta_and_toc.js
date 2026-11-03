// meta_and_toc.js
export const metaAndToc = `
<div class="wrap">
  <nav class="toc" aria-label="Mục lục hệ thống">
    <div class="label">Mục lục kỹ thuật</div>
    <ol>
      <li><a href="#nen-tang">1. Nền tảng cốt lõi & Vòng lặp RPG</a></li>
      <li><a href="#tich-hop">2. Giao tiếp hệ thống & Endpoints</a></li>
      <li><a href="#engine">3. Engine tính toán & Quy tắc vận hành</a></li>
      <li><a href="#luu-tru">4. Chiến lược lưu trữ 2 tầng</a></li>
      <li><a href="#bang">5. Bảng dữ liệu CSDL (DDL)</a></li>
      <li><a href="#quan-he">6. Quan hệ bảng & Ràng buộc</a></li>
      <li><a href="#enum">7. Enum & Danh mục quy chuẩn</a></li>
      <li><a href="#ma-tran">8. Ma trận Chức năng × Bảng</a></li>
      <li>
        <a href="#g1">9. Nhóm 1: Sinh tồn & Cốt lõi</a>
        <ol>
          <li><a href="#LG-F01">LG-F01: Hero Banner & 3D Avatar</a></li>
          <li><a href="#LG-F02">LG-F02: Annual Tick & Bảo vệ tài chính</a></li>
          <li><a href="#LG-F03">LG-F03: Action Point Hub & 1-Click Focus</a></li>
          <li><a href="#LG-F04">LG-F04: Ấu thơ 0–5 tuổi & Fast-forward</a></li>
        </ol>
      </li>
      <li>
        <a href="#g2">10. Nhóm 2: RPG Mind Stage & Số phận</a>
        <ol>
          <li><a href="#LG-F05">LG-F05: Mind Stage & Tiếng thì thầm</a></li>
          <li><a href="#LG-F06">LG-F06: Xúc xắc Định mệnh D20 & DC Check</a></li>
          <li><a href="#LG-F07">LG-F07: AI Game Master & Tình huống</a></li>
          <li><a href="#LG-F08">LG-F08: Đối chất NPC & Mạng lưới xã hội</a></li>
        </ol>
      </li>
      <li>
        <a href="#g3">11. Nhóm 3: Kinh tế & Danh mục tài sản</a>
        <ol>
          <li><a href="#LG-F09">LG-F09: Thị trường Tài sản & Đầu tư</a></li>
          <li><a href="#LG-F10">LG-F10: Nâng cấp nơi ở & Nhà ở</a></li>
          <li><a href="#LG-F11">LG-F11: MMO Macro & Thế giới thực</a></li>
        </ol>
      </li>
      <li>
        <a href="#g4">12. Nhóm 4: Gia tộc & Chuyển giao di sản</a>
        <ol>
          <li><a href="#LG-F12">LG-F12: Quan hệ gia đình & Hôn nhân</a></li>
          <li><a href="#LG-F13">LG-F13: Kế thừa Thế hệ & Di chúc</a></li>
          <li><a href="#LG-F14">LG-F14: Ban thờ Tổ tiên & Hồi hướng</a></li>
        </ol>
      </li>
      <li>
        <a href="#g5">13. Nhóm 5: Luân hồi, Gacha & Bảo mật</a>
        <ol>
          <li><a href="#LG-F15">LG-F15: Luân hồi Nghiệp quả & Gacha</a></li>
          <li><a href="#LG-F16">LG-F16: Tử kỳ & Video Death Recap 15s</a></li>
          <li><a href="#LG-F17">LG-F17: Bảo mật HMAC-SHA256 & Audit</a></li>
          <li><a href="#LG-F18">LG-F18: Khát vọng & Siêu việt hóa</a></li>
        </ol>
      </li>
    </ol>
  </nav>

  <main>
    <header class="doc">
      <div class="eyebrow">
        <svg class="ic" width="16" height="16"><use href="#i-karma"/></svg>
        LifeGraph RPG · Tài liệu Đặc tả Kỹ thuật & GDD Chi tiết (V6.0)
      </div>
      <h1>Mapping CSDL, Kiến Trúc Hệ Thống & Luồng Nghiệp Vụ LifeGraph RPG</h1>
      <p class="lede">Đặc tả toàn diện kiến trúc game nhập vai mô phỏng cuộc đời <b>LifeGraph</b>: Chuyển dịch toàn diện từ cơ chế bấm thẻ thụ động sang <b>Hệ thống RPG Sân khấu Tâm trí (Mind Stage) & Xúc xắc Định mệnh D20</b>; Cơ chế bảo vệ tài chính nghiêm ngặt cho vị thành niên &lt; 18 tuổi; Tối ưu hóa lượt click thường niên qua <b>1-Click Annual Strategic Focus</b>; Cấu trúc cơ sở dữ liệu 2 tầng (Vĩnh cửu vs Phù du); cùng toàn bộ luồng xử lý Backend/Frontend tương đương.</p>
      <div class="meta">
        <span><b>Backend:</b> Node.js 20 LTS / Express <code>v6.0-ultimate-narrative</code></span>
        <span><b>Frontend:</b> Next.js 15 (App Router) / React 19 / Tailwind CSS</span>
        <span><b>CSDL:</b> Dual-Layer PostgreSQL 16 / Supabase (Layer 1 Meta + Layer 2 Mortal)</span>
        <span><b>AI Engine:</b> Gemini 2.0 Flash + Procedural Prompt Compiler</span>
        <span><b>Phiên bản:</b> V6.0 Enterprise Ready (Cập nhật 03/11/2026)</span>
      </div>
    </header>
`;
