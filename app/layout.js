import './globals.css';
import { AppProvider } from '../components/AppContext';
import Navigation from '../components/Navigation';

export const metadata = {
  title: 'QQ音乐下载器',
  description: '支持高音质下载、批量下载、多种导入模式',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <script defer src="https://u.a.07210700.xyz/script.js" data-website-id="126a89f9-d7d4-4e24-96a2-9eaf05c1838e"></script>
      </head>
      <body>
        <AppProvider>
          <Navigation />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
