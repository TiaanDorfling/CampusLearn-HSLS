// src/shared/FileUploader.jsx
import React, { useRef, useState } from "react";

export default function FileUploader({ onUpload, accept="*/*", multiple=true, label="Upload files", busyLabel="Uploading…" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(files) {
    if (!files?.length) return;
    setErr(""); setBusy(true);
    try {
      await onUpload(files); // parent provides API call
    } catch (e) {
      setErr(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 rounded-lg border bg-cream hover:bg-cream/70"
        >
          {busy ? busyLabel : label}
        </button>
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>
    </div>
  );
}
