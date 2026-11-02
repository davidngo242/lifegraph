import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeGraph — AI-Driven Life Simulation RPG',
  description: 'Mô phỏng cuộc đời sinh tồn quản lý rủi ro và nguồn lực đa mô-đun với AI Game Master',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    var sid = localStorage.getItem('lifegraph_session_id');
                    if (!sid) {
                      sid = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
                      localStorage.setItem('lifegraph_session_id', sid);
                    }
                    var origFetch = window.fetch;
                    window.fetch = function(input, init) {
                      var headers = new Headers((init && init.headers) || {});
                      if (!headers.has('x-session-id')) {
                        headers.set('x-session-id', sid);
                      }
                      var nextInit = Object.assign({}, init, { headers: headers });
                      return origFetch.call(this, input, nextInit);
                    };
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
