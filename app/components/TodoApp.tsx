'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Category = 'work' | 'private' | 'shopping'
type FilterCategory = 'all' | Category

type Task = {
  id: number
  text: string
  completed: boolean
  category: Category
  dueDate: string | null
}

// Supabase から返される行の型（snake_case）
type TodoRow = {
  id: number
  text: string
  completed: boolean
  category: Category
  due_date: string | null
  created_at: string
}

function rowToTask(row: TodoRow): Task {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    category: row.category,
    dueDate: row.due_date,
  }
}

const CATEGORIES: { value: Category; label: string; textColor: string; bgColor: string }[] = [
  { value: 'work',     label: '仕事',         textColor: 'text-blue-700',    bgColor: 'bg-blue-100'    },
  { value: 'private',  label: 'プライベート', textColor: 'text-purple-700',  bgColor: 'bg-purple-100'  },
  { value: 'shopping', label: '買い物',       textColor: 'text-emerald-700', bgColor: 'bg-emerald-100' },
]

const FILTERS: { value: FilterCategory; label: string }[] = [
  { value: 'all',      label: 'すべて'       },
  { value: 'work',     label: '仕事'         },
  { value: 'private',  label: 'プライベート' },
  { value: 'shopping', label: '買い物'       },
]

function getCategoryInfo(category: Category) {
  return CATEGORIES.find(c => c.value === category)!
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dueDate.split('-').map(Number)
  return new Date(y, m - 1, d) < today
}

function formatDate(dueDate: string): string {
  const [y, m, d] = dueDate.split('-').map(Number)
  return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('work')
  const [newDueDate, setNewDueDate] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('all')

  // 初回マウント時にタスク一覧を取得
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        setError(error.message)
      } else {
        setTasks((data ?? []).map(rowToTask))
      }
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const addTask = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setError(null)
    const { data, error } = await supabase
      .from('todos')
      .insert({
        text: trimmed,
        completed: false,
        category: newCategory,
        due_date: newDueDate || null,
      })
      .select()
      .single()
    if (error) {
      setError(error.message)
    } else if (data) {
      setTasks(prev => [...prev, rowToTask(data as TodoRow)])
      setInput('')
      setNewDueDate('')
    }
  }

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    setError(null)
    const { error } = await supabase
      .from('todos')
      .update({ completed: !task.completed })
      .eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
      )
    }
  }

  const deleteTask = async (id: number) => {
    setError(null)
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTask()
  }

  const filteredAndSorted = useMemo(() => {
    const filtered = filter === 'all' ? tasks : tasks.filter(t => t.category === filter)
    return [...filtered].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }, [tasks, filter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-start justify-center pt-12 px-4 pb-16">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight">
          ToDoリスト
        </h1>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            エラー: {error}
          </div>
        )}

        {/* 入力エリア */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="タスクを入力..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            />
            <button
              onClick={addTask}
              className="px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-base shadow-sm"
            >
              追加
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium">カテゴリ</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Category)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium">締切日</label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 self-center">
            {filteredAndSorted.length} 件
          </span>
        </div>

        {/* ローディング */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-base">
            タスクがありません
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredAndSorted.map(task => {
              const overdue = isOverdue(task.dueDate) && !task.completed
              const catInfo = getCategoryInfo(task.category)
              return (
                <li
                  key={task.id}
                  className={`flex items-start gap-3 px-4 py-4 rounded-xl border shadow-sm transition-colors ${
                    overdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  {/* 完了チェックボタン */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'タスクを未完了にする' : 'タスクを完了にする'}
                    className={`mt-0.5 w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {task.completed && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* タスク情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catInfo.bgColor} ${catInfo.textColor}`}
                      >
                        {catInfo.label}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${
                            overdue ? 'text-red-500' : 'text-gray-400'
                          }`}
                        >
                          {overdue ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                              </svg>
                              期限切れ · {formatDate(task.dueDate)}
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                              </svg>
                              {formatDate(task.dueDate)}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-base leading-relaxed transition-colors ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    aria-label="タスクを削除"
                    className="mt-0.5 p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors rounded-lg flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
