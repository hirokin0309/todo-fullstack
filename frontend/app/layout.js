/**
 * Root Layout - 全ページ共通のレイアウト
 *
 * Next.js 13以降の App Router では必須のファイル
 * html, bodyタグをここで定義する
 */

export const metadata = {
  title: 'Todo App',
  description: 'フルスタックTodoアプリ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{
        fontFamily: 'system-ui, sans-serif',
        margin: 0,
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        {children}
      </body>
    </html>
  );
}
