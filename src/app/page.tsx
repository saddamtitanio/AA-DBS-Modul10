"use client";

import { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input }),
      });
      const newTodo: Todo = await res.json();

      if (!newTodo.id) {
        console.error("Invalid todo returned from server:", newTodo);
        return;
      }

      setTodos((prev) => [...prev, newTodo]);
      setInput("");
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const startEditing = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditingText(currentTitle);
  };

  const saveTodo = async (id: number) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingText }),
      });
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to save todo:", err);
    } finally {
      setEditingId(null);
      setEditingText("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Communal Todo List
          <br />
          <span className="text-sm text-gray-400">
            Hippity Hoppity, your todos are my property!
          </span>
          <br />
          <span className="text-sm text-gray-600">Powered by communism.</span>
        </h1>

        {/* Add Todo Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 text-white px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTodo}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition font-semibold cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No tasks yet</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col gap-1 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    className="w-5 h-5 cursor-pointer accent-indigo-500"
                  />

                  {editingId === todo.id ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveTodo(todo.id)}
                        className="flex-1 bg-gray-700 text-white outline-none px-2 py-1 rounded"
                      />
                      <button
                        onClick={() => saveTodo(todo.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex-1 ${
                          todo.completed ? "line-through text-gray-400" : "text-white"
                        }`}
                      >
                        {todo.title}
                      </span>
                      <button
                        onClick={() => startEditing(todo.id, todo.title)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Show timestamps */}
                <div className="text-xs text-gray-400 flex justify-between mt-1">
                  <span>Created: {new Date(todo.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(todo.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Todo Stats */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {todos.length} task{todos.length !== 1 ? "s" : ""} total •{" "}
          {todos.filter((t) => t.completed).length} completed
        </div>
      </div>
    </div>
  );
}