# Todo Fullstack App

フルスタックアプリのデプロイ練習用プロジェクト

## 技術スタック

| 層 | 技術 | デプロイ先 |
|---|---|---|
| フロントエンド | Next.js | Vercel |
| バックエンド | Express + Prisma | Railway |
| データベース | PostgreSQL | Railway |

## ローカル開発

### バックエンド
```bash
cd backend
npm install
npm run dev
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/todos | Todo一覧取得 |
| POST | /api/todos | Todo作成 |
| PUT | /api/todos/:id | Todo更新 |
| DELETE | /api/todos/:id | Todo削除 |
