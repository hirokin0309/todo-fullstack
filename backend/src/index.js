/**
 * Express + Prisma バックエンドサーバー
 *
 * 機能:
 * - Todo CRUD API
 * - Claude AI チャット API（セッション管理付き）
 * - お問い合わせフォーム API
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk').default;
const { v4: uuidv4 } = require('uuid');
const { MENTOR_SYSTEM_MESSAGE, NORMAL_SYSTEM_MESSAGE } = require('./prompts/mentorPrompt');

// Expressアプリケーションを作成
const app = express();

// Prismaクライアントを作成（DBへの接続を管理）
const prisma = new PrismaClient();

// Anthropic (Claude) クライアント
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// セッション管理（メモリ内、サーバー再起動でリセット）
const sessions = new Map();
const MAX_MESSAGES = 20; // セッションあたりの最大メッセージ数

// Todo提案を検出するヘルパー関数
function extractTodoSuggestion(text) {
  const regex = /<<<TODO_SUGGESTION>>>\s*(\{[\s\S]*?\})\s*<<<END_TODO>>>/;
  const match = text.match(regex);
  if (match) {
    try {
      const suggestion = JSON.parse(match[1]);
      // JSONマーカーを除去したメッセージを返す
      const cleanMessage = text.replace(regex, '').trim();
      return { suggestion, cleanMessage };
    } catch (e) {
      console.error('Failed to parse todo suggestion:', e);
      return null;
    }
  }
  return null;
}

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

// ============================================
// Chat API（Claude AI連携）
// ============================================

// POST /api/chat - メッセージ送信
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message, mode = 'normal' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // セッションの取得または作成
    let currentSessionId = sessionId;
    if (!currentSessionId || !sessions.has(currentSessionId)) {
      currentSessionId = uuidv4();
      sessions.set(currentSessionId, { history: [], mode });
    }

    // セッションデータを取得
    const sessionData = sessions.get(currentSessionId);
    const history = sessionData.history;

    // モードが変わった場合はセッションをリセット
    if (sessionData.mode !== mode) {
      sessionData.history = [];
      sessionData.mode = mode;
    }

    // ユーザーメッセージを追加
    history.push({ role: 'user', content: message.trim() });

    // 履歴が長すぎる場合は古いメッセージを削除
    while (history.length > MAX_MESSAGES) {
      history.shift();
    }

    // モードに応じたシステムメッセージを選択
    const systemMessage = mode === 'mentor' ? MENTOR_SYSTEM_MESSAGE : NORMAL_SYSTEM_MESSAGE;

    // Claude APIを呼び出し
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemMessage,
      messages: history
    });

    // AIの応答を取得
    let assistantMessage = response.content[0].text;
    let todoSuggestion = null;

    // メンターモードの場合、Todo提案を検出
    if (mode === 'mentor') {
      const extracted = extractTodoSuggestion(assistantMessage);
      if (extracted) {
        todoSuggestion = extracted.suggestion;
        assistantMessage = extracted.cleanMessage;
      }
    }

    // 応答を履歴に追加
    history.push({ role: 'assistant', content: assistantMessage });

    // セッションを更新
    sessions.set(currentSessionId, sessionData);

    res.json({
      sessionId: currentSessionId,
      message: assistantMessage,
      todoSuggestion
    });
  } catch (error) {
    console.error('Error in chat:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message || 'Unknown error'
    });
  }
});

// GET /api/chat/:sessionId - セッション履歴取得
app.get('/api/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionData = sessions.get(sessionId);
  const history = sessionData?.history || [];
  const mode = sessionData?.mode || 'normal';
  res.json({ sessionId, messages: history, mode });
});

// DELETE /api/chat/:sessionId - セッション削除
app.delete('/api/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.status(204).send();
});

// ============================================
// Contact API（お問い合わせフォーム）
// ============================================

// POST /api/contacts - お問い合わせ送信
app.post('/api/contacts', async (req, res) => {
  try {
    const { sessionId, name, email, phone, message } = req.body;

    // バリデーション
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'お名前は必須です' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'メールアドレスは必須です' });
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '有効なメールアドレスを入力してください' });
    }

    // DBに保存
    const contact = await prisma.contact.create({
      data: {
        sessionId: sessionId || null,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message?.trim() || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'お問い合わせを受け付けました',
      id: contact.id
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'お問い合わせの送信に失敗しました' });
  }
});

// GET /api/contacts - お問い合わせ一覧（管理用）
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    console.log(`ANTHROPIC_API_KEY is SET (length: ${key.length})`);
    console.log(`Key prefix: ${key.substring(0, 20)}...`);
    console.log(`Key suffix: ...${key.substring(key.length - 10)}`);
  } else {
    console.log('ANTHROPIC_API_KEY is NOT SET');
  }
});
