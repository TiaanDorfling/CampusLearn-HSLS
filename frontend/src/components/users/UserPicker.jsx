import React, { useEffect, useRef, useState } from "react";
import { searchUsers } from "../../api/users";

export default function UserPicker({ value, onChange, placeholder = "Search name or email…" }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // click-away to close
  useEffect(() => {
    function onClick(e) { if (!boxRef.current?.contains(e.target)) setOpen(false); }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // fetch suggestions (tiny debounce)
  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const { items } = await searchUsers({ q, limit: 30 });
        if (active) setItems(items || []);
      } finally { if (active) setLoading(false); }
    }
    const t = setTimeout(() => { if (open) run(); }, 180);
    return () => { active = false; clearTimeout(t); };
  }, [q, open]);

  function pick(u) {
    onChange?.(u);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border rounded px-2 py-1"
      />

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-56 overflow-auto">
          {loading ? (
            <div className="p-2 text-sm text-primary/60">Searching…</div>
          ) : items.length === 0 ? (
            <div className="p-2 text-sm text-primary/60">No users found</div>
          ) : (
            items.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => pick(u)}
                className="w-full text-left px-2 py-1 hover:bg-cream"
              >
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-primary/70">{u.email} · {u.role}</div>
              </button>
            ))
          )}
        </div>
      )}

      {value?._id && (
        <div className="mt-1 text-xs text-primary/70">
          Selected: <span className="font-medium">{value.name}</span> ({value.email})
        </div>
      )}
    </div>
  );
}
