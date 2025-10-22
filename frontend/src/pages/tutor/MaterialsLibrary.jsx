// src/pages/tutor/MaterialsLibrary.jsx
import React, { useEffect, useState } from "react";
import FileUploader from "../../shared/FileUploader.jsx";
import { listMaterials, uploadMaterials, deleteMaterial } from "../../api/materials"; // You’ll add this small API wrapper

export default function MaterialsLibrary() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const res = await listMaterials(); // [{_id, name, type, size, topic, url, createdAt}]
        setItems(res.items || []);
      } catch (e) { setErr(e.message || "Failed to load materials."); }
      finally { setLoading(false); }
    })();
  }, []);

  async function onUpload(files) {
    const form = new FormData();
    [...files].forEach(f => form.append("files", f));
    // optionally collect "topic/course" from a select input
    await uploadMaterials(form);
    const res = await listMaterials();
    setItems(res.items || []);
  }

  async function onDelete(id) {
    if (!confirm("Delete this file?")) return;
    await deleteMaterial(id);
    setItems(items.filter(x => x._id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-heading text-primary">Materials Library</h1>
        <p className="text-primary/70 text-sm">Upload and manage PDFs, videos, and audio. Students will see these per topic.</p>
      </header>

      <FileUploader onUpload={onUpload} accept=".pdf,video/*,audio/*" />

      {loading ? (
        <div className="text-sm text-primary/70">Loading…</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : (
        <div className="rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Added</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id} className="border-b last:border-0">
                  <td className="p-3"><a className="underline" href={it.url} target="_blank" rel="noreferrer">{it.name}</a></td>
                  <td className="p-3">{it.type || "—"}</td>
                  <td className="p-3">{it.topic || "General"}</td>
                  <td className="p-3">{it.createdAt ? new Date(it.createdAt).toLocaleString() : "—"}</td>
                  <td className="p-3">
                    <button className="text-xs underline" onClick={() => onDelete(it._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td className="p-3 text-primary/70" colSpan={5}>No materials yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
