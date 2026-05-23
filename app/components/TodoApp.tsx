'use client'

import { useEffect, useState } from 'react'

type Task = {
  id: number
  text: string
  completed: boolean
}

const STORAGE_KEY = 'todo-tasks'

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Task[]) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setTasks(prev => [...prev, { id: Date.now(), text: trimmed, completed: false }])
    setInput('')
  }

  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTask()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight">
          ToDoリスト
        </h1>

        {/* 入力エリア */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="タスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm"
          />
          <button
            onClick={addTask}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-base shadow-sm"
          >
            追加
          </button>
        </div>

        {/* タスク一覧 */}
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-base">
            タスクがありません
          </p>
        ) : (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li
                key={task.id}
                className="flex items-center gap-3 bg-white px-4 py-4 rounded-xl border border-gray-100 shadow-sm"
              >
                {/* 完了チェックボタン */}
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'タスクを未完了にする' : 'タスクを完了にする'}
                  className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
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

                {/* タスクテキスト */}
                <span
                  className={`flex-1 text-base leading-relaxed transition-colors ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {task.text}
                </span>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="タスクを削除"
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors rounded-lg"
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
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
