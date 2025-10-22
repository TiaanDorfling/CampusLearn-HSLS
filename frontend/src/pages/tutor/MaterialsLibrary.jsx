// src/pages/tutor/MaterialsLibrary.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../../shared/FileUploader.jsx";
import { listMaterials, uploadMaterials, deleteMaterial } from "../../api/materials";

export default function MaterialsLibrary() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const res = await listMaterials();
        setItems(res.items || []);
      } catch (e) {
        setErr(e.message || "Failed to load materials.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onUpload(files) {
    const form = new FormData();
    [...files].forEach((f) => form.append("files", f));
    await uploadMaterials(form);
    const res = await listMaterials();
    setItems(res.items || []);
  }

  async function onDelete(id) {
    if (!confirm("Delete this file?")) return;
    await deleteMaterial(id);
    setItems((prev) => prev.filter((x) => x._id !== id));
  }

  const totalItems = items.length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Materials Library</h1>
              <p className="text-beige mt-1">
                Upload and manage PDFs, videos, and audio. Students will see these per topic.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Items" value={totalItems} />
              <Stat label="Last Added" value={items[0]?.createdAt ? new Date(items[0].createdAt).toLocaleDateString() : "—"} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            <QuickAction onClick={() => nav("/app/tutor/dashboard")} label="Dashboard" />
            <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
            <QuickAction onClick={() => nav("/app/settings")} label="Settings" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {err && (
          <div className="rounded-lg border-2 border-redbrown/60 p-3 text-sm text-redbrown bg-cream shadow-sm">
            {err}
          </div>
        )}

        <Card>
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Upload Materials</h2>
          <FileUploader onUpload={onUpload} accept=".pdf,video/*,audio/*" />
        </Card>

        {loading ? (
          <Card>
            <div className="text-sm text-primary/70">Loading…</div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="text-left border-b-2 border-primary/10 bg-lavender/20">
                    <th className="p-3 font-heading text-primary">Name</th>
                    <th className="p-3 font-heading text-primary">Type</th>
                    <th className="p-3 font-heading text-primary">Topic</th>
                    <th className="p-3 font-heading text-primary">Added</th>
                    <th className="p-3 font-heading text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                      <td className="p-3">
                        <a className="underline text-primary" href={it.url} target="_blank" rel="noreferrer">
                          {it.name}
                        </a>
                      </td>
                      <td className="p-3 text-primary-800">{it.type || "—"}</td>
                      <td className="p-3 text-primary-800">{it.topic || "General"}</td>
                      <td className="p-3 text-primary-800">
                        {it.createdAt ? new Date(it.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="p-3">
                        <button
                          className="text-xs px-2 py-1 rounded-md border-2 border-primary/20 hover:bg-cream transition"
                          onClick={() => onDelete(it._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td className="p-3 text-primary/70" colSpan={5}>
                        No materials yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border-2 border-primary/10 bg-white p-3 text-left shadow-sm hover:border-primary/30 transition"
    >
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-heading font-semibold text-primary">{value}</div>
    </button>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md border-2 border-primary/20 bg-white text-primary font-button hover:bg-lavender/20 transition shadow-sm"
    >
      {label}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 ${className}`}>
      {children}
    </div>
  );
}
