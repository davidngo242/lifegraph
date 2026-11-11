import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'LifeGraph — AI-Driven Life Simulation RPG',
  description: 'Mô phỏng cuộc đời sinh tồn quản lý rủi ro và nguồn lực đa mô-đun với AI Game Master',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    var savedTheme = localStorage.getItem('lifegraph_theme') || 'daylight';
                    document.documentElement.setAttribute('data-theme', savedTheme);
                    var sid = localStorage.getItem('lifegraph_session_id');
                    if (!sid) {
                      sid = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
                      localStorage.setItem('lifegraph_session_id', sid);
                    }
                    var origFetch = window.fetch;
                    window.fetch = function(input, init) {
                      var headers = new Headers((init && init.headers) || {});
                      var token = localStorage.getItem('lifegraph_session_token');
                      if (token && !headers.has('x-session-token')) {
                        headers.set('x-session-token', token);
                      }
                      if (!headers.has('x-session-id')) {
                        headers.set('x-session-id', sid);
                      }
                      var nextInit = Object.assign({}, init, { headers: headers });
                      return origFetch.call(this, input, nextInit).then(function(res) {
                        try {
                          var newToken = res.headers.get('x-session-token');
                          if (newToken) {
                            localStorage.setItem('lifegraph_session_token', newToken);
                          }
                        } catch (e) {}
                        return res;
                      });
                    };
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg-canvas)] text-[var(--text-primary)] min-h-screen antialiased selection:bg-amber-900/30 selection:text-amber-100 font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}

