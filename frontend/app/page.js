/**
 * メインページ - Todoアプリ本体
 *
 * 'use client' はクライアントコンポーネントを示す
 * useState, useEffectなどのReact Hooksを使う場合は必須
 */
'use client';

import { useState, useEffect } from 'react';

// バックエンドAPIのURL
// 環境変数 NEXT_PUBLIC_API_URL があればそれを使用、なければローカル開発用
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  // State（状態管理）
  const [todos, setTodos] = useState([]);        // Todo一覧
  const [newTitle, setNewTitle] = useState('');  // 新規Todo入力欄
  const [loading, setLoading] = useState(true);  // 読み込み中フラグ
  const [error, setError] = useState(null);      // エラーメッセージ

  // ============================================
  // API呼び出し関数
  // ============================================

  // Todo一覧を取得
  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Todoの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 新規Todo作成
  const createTodo = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防止
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to create');

      setNewTitle(''); // 入力欄をクリア
      fetchTodos();    // 一覧を再取得
    } catch (err) {
      setError('Todoの作成に失敗しました');
      console.error(err);
    }
  };

  // Todo完了状態を切り替え
  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchTodos();
    } catch (err) {
      setError('Todoの更新に失敗しました');
      console.error(err);
    }
  };

  // Todo削除
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchTodos();
    } catch (err) {
      setError('Todoの削除に失敗しました');
      console.error(err);
    }
  };

  // コンポーネント初回レンダリング時にTodo一覧を取得
  useEffect(() => {
    fetchTodos();
  }, []);

  // ============================================
  // UI レンダリング
  // ============================================

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Todo App</h1>
        <a href="/chat" style={styles.chatLink}>
          AI Chat
        </a>
      </div>

      {/* エラー表示 */}
      {error && <div style={styles.error}>{error}</div>}

      {/* 新規Todo入力フォーム */}
      <form onSubmit={createTodo} style={styles.form}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいTodoを入力..."
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          追加
        </button>
      </form>

      {/* Todo一覧 */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul style={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} style={styles.item}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                style={styles.checkbox}
              />
              <span style={{
                ...styles.text,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#333',
              }}>
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={styles.deleteButton}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Todo数の表示 */}
      <p style={styles.count}>
        合計: {todos.length}件 / 完了: {todos.filter(t => t.completed).length}件
      </p>
    </div>
  );
}

// スタイル定義
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#333',
    margin: 0,
  },
  chatLink: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'transform 0.2s ease',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  addButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #eee',
    gap: '10px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  text: {
    flex: 1,
    fontSize: '16px',
  },
  deleteButton: {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  count: {
    textAlign: 'center',
    color: '#666',
    marginTop: '20px',
  },
};
