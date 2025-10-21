import React, { useRef, useState } from "react";

export default function AvatarPicker({ value, onChange, size = 96, label = "Profile photo" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");

  function pick() { inputRef.current?.click(); }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file); // pass File to parent (you’ll upload in backend later)
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="rounded-full bg-lavender overflow-hidden ring-1 ring-primary/10"
        style={{ width: size, height: size }}
      >
        {preview ? (
          <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-primary/60">
            <span className="text-xl">👤</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex gap-2">
          <button type="button" onClick={pick} className="px-3 py-1 rounded border hover:bg-cream">
            Choose image
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); onChange?.(null); inputRef.current.value = ""; }}
              className="px-3 py-1 rounded border hover:bg-cream"
            >
              Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <div className="text-[11px] text-primary/60">PNG/JPG, &lt; 2MB recommended</div>
      </div>
    </div>
  );
}
