// scripts_and_footer.js
export const scriptsAndFooter = `
    <footer>
      <p><b>LifeGraph RPG V6.0 System & Architecture Specification</b> · Tài liệu đặc tả kỹ thuật và mapping CSDL chi tiết cho LifeGraph Game Engine · Thiết kế theo chuẩn Enterprise Game Design Document (GDD) & Software Requirements Specification (SRS).</p>
      <div style="margin-top:8px;font-size:12px;color:var(--muted);display:flex;gap:18px;flex-wrap:wrap;">
        <span><b>Backend:</b> <code>v6.0-ultimate-narrative</code> (Branch: <code>main</code>)</span>
        <span><b>Frontend:</b> Next.js 15 App Router (Branch: <code>main</code>)</span>
        <span><b>Database:</b> Dual-Layer PostgreSQL 16 (Schema V6)</span>
        <span><b>Ngày phát hành:</b> 03/11/2026</span>
      </div>
    </footer>
  </main>
</div>

<!-- Thư viện Mermaid CDN hỗ trợ sơ đồ Sequence & Flowchart -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script>
(function () {
  if (!window.mermaid) return;
  var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (document.documentElement.getAttribute('data-theme') !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'strict',
    theme: dark ? 'dark' : 'default',
    themeVariables: { fontFamily: 'Roboto, system-ui, sans-serif', fontSize: '13.5px' },
    sequence: { wrap: true, width: 220, noteMargin: 10, messageMargin: 35, actorMargin: 50, mirrorActors: true, useMaxWidth: false }
  });
})();
</script>

<!-- Script xử lý chuyển tab UI Mockup -->
<script>
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ui-tab]');
    if (!b) return;
    var box = b.closest('.ui-switch');
    if (!box) return;
    var i = b.getAttribute('data-ui-tab');
    box.querySelectorAll(':scope > .ui-tabs [data-ui-tab]').forEach(function (t) { 
      t.setAttribute('aria-selected', String(t === b)); 
    });
    box.querySelectorAll(':scope > [data-ui-pane]').forEach(function (p) { 
      p.hidden = p.getAttribute('data-ui-pane') !== i; 
    });
  });
})();
</script>
</body>
</html>
`;
