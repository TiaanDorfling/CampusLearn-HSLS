// frontend/src/components/assistant/StudentAssistantCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, Sparkles } from "lucide-react";

export default function StudentAssistantCard() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  function goAsk(e) {
    e?.preventDefault?.();
    const query = q.trim();
    if (!query) {
      nav("/app/assistant");
      return;
    }
    nav(`/app/assistant?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ask the Assistant</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" /> Get help with courses, errors, and study plans
            </p>
          </div>
        </div>
        <button
          onClick={() => nav("/app/assistant")}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900"
        >
          Open Chat
        </button>
      </div>

      <form onSubmit={goAsk} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g., Explain SEN381 layered architecture vs microservices…"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          Ask <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
