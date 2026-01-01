/**
 * Express + Prisma バックエンドサーバー
 *
 * このファイルがエントリーポイント（サーバー起動時に最初に実行される）
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Expressアプリケーションを作成
const app = express();

// Prismaクライアントを作成（DBへの接続を管理）
const prisma = new PrismaClient();

// ミドルウェアの設定
// cors: フロントエンド（別ドメイン）からのアクセスを許可
// express.json: リクエストボディのJSONを自動パース
app.use(cors());
app.use(express.json());

// ポート番号（Railway環境変数 or ローカル開発用の3001）
const PORT = process.env.PORT || 3001;

// ============================================
// APIエンドポイント
// ============================================

// ヘルスチェック（サーバーが動いているか確認用）
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running!' });
});

// GET /api/todos - Todo一覧取得
app.get('/api/todos', async (req, res) => {
  try {
    // 全Todoを新しい順で取得
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos - Todo作成
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;

    // バリデーション
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 新規Todo作成
    const todo = await prisma.todo.create({
      data: { title: title.trim() }
    });
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Todo更新
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // 更新データを構築
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    // 更新実行
    const todo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Todo削除
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.todo.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send(); // 204 = 成功だがコンテンツなし
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
