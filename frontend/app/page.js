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
  const [newDueDate, setNewDueDate] = useState(''); // 新規Todo期日
  const [loading, setLoading] = useState(true);  // 読み込み中フラグ
  const [error, setError] = useState(null);      // エラーメッセージ
  const [darkMode, setDarkMode] = useState(false); // ダークモード

  // ダークモード設定をlocalStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  // ダークモード切り替え時にlocalStorageに保存
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

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
        body: JSON.stringify({
          title: newTitle,
          dueDate: newDueDate || null
        }),
      });
      if (!res.ok) throw new Error('Failed to create');

      setNewTitle(''); // 入力欄をクリア
      setNewDueDate(''); // 期日もクリア
      fetchTodos();    // 一覧を再取得
    } catch (err) {
      setError('Todoの作成に失敗しました');
      console.error(err);
    }
  };

  // Command+Enter / Ctrl+Enter でフォーム送信
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (newTitle.trim()) {
        createTodo(e);
      }
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

  // テーマに応じたスタイル
  const theme = darkMode ? darkTheme : lightTheme;

  // ============================================
  // UI レンダリング
  // ============================================

  return (
    <div style={{ ...styles.wrapper, background: theme.background }}>
      <div style={{ ...styles.container, background: theme.containerBg, boxShadow: theme.shadow }}>
        <div style={styles.header}>
          <h1 style={{ ...styles.title, color: theme.text }}>Todo App</h1>
          <div style={styles.headerRight}>
            <button
              onClick={toggleDarkMode}
              style={{ ...styles.iconButton, background: theme.buttonBg }}
              title={darkMode ? 'ライトモード' : 'ダークモード'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <a href="/chat" style={styles.chatLink}>
              AI Chat
            </a>
          </div>
        </div>

        {/* エラー表示 */}
        {error && <div style={{ ...styles.error, background: theme.errorBg }}>{error}</div>}

        {/* 新規Todo入力フォーム */}
        <form onSubmit={createTodo} style={styles.form}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいTodoを入力... (⌘+Enterで追加)"
            style={{ ...styles.input, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            style={{ ...styles.dateInput, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
          />
          <button type="submit" style={styles.addButton}>
            追加
          </button>
        </form>

        {/* Todo一覧 */}
        {loading ? (
          <p style={{ color: theme.textSecondary }}>読み込み中...</p>
        ) : (
          <ul style={styles.list}>
            {todos.map((todo) => (
              <li key={todo.id} style={{ ...styles.item, borderColor: theme.border }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  style={styles.checkbox}
                />
                <div style={styles.todoContent}>
                  <span style={{
                    ...styles.text,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? theme.textSecondary : theme.text,
                  }}>
                    {todo.title}
                  </span>
                  {todo.dueDate && (
                    <span style={{
                      ...styles.dueDate,
                      color: new Date(todo.dueDate) < new Date() && !todo.completed
                        ? '#ef4444'
                        : theme.textSecondary
                    }}>
                      期日: {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </div>
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
        <p style={{ ...styles.count, color: theme.textSecondary }}>
          合計: {todos.length}件 / 完了: {todos.filter(t => t.completed).length}件
        </p>
      </div>
    </div>
  );
}

// ライトテーマ
const lightTheme = {
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
  containerBg: '#ffffff',
  text: '#333333',
  textSecondary: '#888888',
  inputBg: '#ffffff',
  border: '#dddddd',
  buttonBg: 'rgba(0, 0, 0, 0.05)',
  errorBg: '#fee',
  shadow: '0 2px 10px rgba(0,0,0,0.1)',
};

// ダークテーマ
const darkTheme = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  containerBg: '#1e1e3f',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  inputBg: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.2)',
  buttonBg: 'rgba(255, 255, 255, 0.1)',
  errorBg: 'rgba(239, 68, 68, 0.2)',
  shadow: '0 4px 20px rgba(0,0,0,0.3)',
};

// スタイル定義
const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '40px 20px',
    transition: 'background 0.3s ease',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '30px',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  chatLink: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'transform 0.2s ease',
  },
  error: {
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '14px 16px',
    fontSize: '16px',
    border: '1px solid',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  dateInput: {
    padding: '14px 12px',
    fontSize: '14px',
    border: '1px solid',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  addButton: {
    padding: '14px 24px',
    fontSize: '16px',
    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'transform 0.2s ease',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid',
    gap: '12px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#6366f1',
  },
  todoContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  text: {
    fontSize: '16px',
    transition: 'color 0.2s ease',
  },
  dueDate: {
    fontSize: '12px',
    fontWeight: '500',
  },
  deleteButton: {
    padding: '8px 14px',
    fontSize: '13px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'transform 0.2s ease',
  },
  count: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
  },
};
