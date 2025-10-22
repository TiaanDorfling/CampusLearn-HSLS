// frontend/src/pages/assistant/Assistant.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { sendChat } from "../../api/assistant";

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const location = useLocation();

  async function handleSend(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { text: reply } = await sendChat(next);
      setMessages([...next, { role: "assistant", content: reply || "(no reply)" }]);
    } catch (err) {
      console.error(err);
      setMessages([...next, { role: "assistant", content: "AI error. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  // If navigated with ?q=... (from Student Home), auto-ask once.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (!q || messages.length > 0 || busy) return;

    (async () => {
      const initUser = { role: "user", content: q };
      setMessages([initUser]);
      setBusy(true);
      try {
        const { text } = await sendChat([initUser]);
        setMessages([initUser, { role: "assistant", content: text || "(no reply)" }]);
      } catch (e) {
        console.error(e);
        setMessages([initUser, { role: "assistant", content: "AI error. Try again." }]);
      } finally {
        setBusy(false);
      }
    })();
  }, [location.search, busy, messages.length]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">CampusLearn Assistant</h1>
        <button
          onClick={() => { setMessages([]); setInput(""); }}
          className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-900"
          disabled={busy}
        >
          Clear
        </button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="h-[60vh] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-slate-500">
              Ask anything related to CampusLearn or your coursework.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  "inline-block px-3 py-2 rounded-lg " +
                  (m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="text-left">
              <div className="inline-block px-3 py-2 rounded-lg bg-slate-100 text-slate-500 italic">
                Thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={busy}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
