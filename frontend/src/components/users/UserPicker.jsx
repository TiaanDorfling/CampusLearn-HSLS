import React, { useEffect, useRef, useState } from "react";
import { searchUsers } from "../../api/users";

export default function UserPicker({ value, onChange, label = "To", placeholder = "Search users..." }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Fetch on focus (all users) and whenever q changes (debounced)
  useEffect(() => {
    let alive = true;
    const id = setTimeout(async () => {
      const { items: res } = await searchUsers({ q, limit: 30 });
      if (!alive) return;
      setItems(res || []);
    }, 200);
    return () => { alive = false; clearTimeout(id); };
  }, [q]);

  function choose(u) {
    onChange?.(u);
    setOpen(false);
    setQ("");
  }

  return (
    <div className="relative" ref={boxRef}>
      <label className="text-xs text-primary/70">{label}</label>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border rounded px-2 py-1"
      />

      {open && (
        <div className="absolute z-40 mt-1 w-full max-h-64 overflow-auto bg-white border rounded shadow">
          {items.length === 0 ? (
            <div className="p-2 text-sm text-primary/60">No users found.</div>
          ) : (
            items.map(u => (
              <button
                key={u._id}
                type="button"
                onClick={() => choose(u)}
                className="w-full text-left px-2 py-2 hover:bg-cream flex items-center gap-2"
              >
                <Avatar name={u.name || u.email} url={u.avatarUrl} />
                <div className="leading-tight">
                  <div className="text-sm font-medium">{u.name || u.email}</div>
                  <div className="text-xs text-primary/60">{u.email} {u.role ? `• ${u.role}` : ""}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected pill (optional) */}
      {value?._id && (
        <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-white">
          <Avatar name={value.name || value.email} url={value.avatarUrl} size={20} />
          <span className="text-sm">{value.name || value.email}</span>
          <button
            type="button"
            className="text-xs text-primary/60 hover:underline"
            onClick={() => onChange?.(null)}
            title="Clear"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ name = "", url, size = 28 }) {
  const initials = (name || "").split(/\s+/).map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  if (url) {
    return <img src={url} alt={name} className="rounded-full" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full bg-lavender text-primary grid place-items-center"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-label={name}
      title={name}
    >
      {initials || "U"}
    </div>
  );
}
