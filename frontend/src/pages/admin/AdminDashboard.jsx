// frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";
import Modal from "../../components/ui/Modal";
import { listStudents, createStudent, updateStudent, deleteStudent } from "../../api/students";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(null); // student object or null
  const [busy, setBusy] = useState(false);

  async function refresh({ page: pg = page, q: query = q } = {}) {
    setLoading(true);
    setError("");
    try {
      const res = await listStudents({ page: pg, q: query });
      setData(res);
      setPage(pg);
      setQ(query);
    } catch (err) {
      setError(err?.friendlyMessage || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh({ page: 1, q: "" }); }, []);

  async function onCreate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      year: form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setBusy(true);
    try {
      await createStudent(payload);
      setOpenNew(false);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not create student");
    } finally { setBusy(false); }
  }

  async function onUpdate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      year: form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setBusy(true);
    try {
      await updateStudent(openEdit._id || openEdit.id, payload);
      setOpenEdit(null);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not update student");
    } finally { setBusy(false); }
  }

  async function onDelete(id) {
    if (!confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not delete student");
    }
  }

  if (loading) return <Loader label="Loading students..." />;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Top toolbar: title + Back to Home + quick actions */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-primary/70 text-sm">Manage students</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BackHomeButton />
          <button
            onClick={() => nav("/app/messages")}
            className="px-3 py-2 rounded border hover:bg-cream"
            title="Go to Messages"
          >
            Messages
          </button>
          <button
            onClick={() => nav("/app/forum")}
            className="px-3 py-2 rounded border hover:bg-cream"
            title="Go to Forum"
          >
            Forum
          </button>
        </div>
      </header>

      {error ? <div className="p-3 text-red-700 bg-red-50 border rounded">{error}</div> : null}

      {data.items?.length ? (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-primary/5">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Year</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(s => (
                <tr key={s._id || s.id} className="border-b last:border-0">
                  <td className="py-2 px-3">{s.name}</td>
                  <td className="py-2 px-3">{s.email}</td>
                  <td className="py-2 px-3">{s.year ?? "—"}</td>
                  <td className="py-2 px-3">{s.phone ?? "—"}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded border" onClick={()=>setOpenEdit(s)}>Edit</button>
                      <button
                        className="px-2 py-1 rounded border border-red-500 text-red-600"
                        onClick={()=>onDelete(s._id || s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No students found" />}

      {/* Create Modal */}
      <Modal
        open={openNew}
        onClose={()=>setOpenNew(false)}
        title="Add new student"
        footer={
          <>
            <button className="px-3 py-2 rounded border" onClick={()=>setOpenNew(false)}>Cancel</button>
            <button form="createStudent" className="px-3 py-2 rounded bg-accent text-primary-900" disabled={busy}>
              {busy ? "Saving..." : "Create"}
            </button>
          </>
        }
      >
        <form id="createStudent" onSubmit={onCreate} className="space-y-3">
          <label className="block text-sm">
            <span>Name</span>
            <input name="name" className="mt-1 w-full rounded border px-3 py-2" required />
          </label>
          <label className="block text-sm">
            <span>Email</span>
            <input name="email" type="email" className="mt-1 w-full rounded border px-3 py-2" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span>Year</span>
              <input name="year" className="mt-1 w-full rounded border px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span>Phone</span>
              <input name="phone" className="mt-1 w-full rounded border px-3 py-2" />
            </label>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!openEdit}
        onClose={()=>setOpenEdit(null)}
        title="Edit student"
        footer={
          <>
            <button className="px-3 py-2 rounded border" onClick={()=>setOpenEdit(null)}>Cancel</button>
            <button form="editStudent" className="px-3 py-2 rounded bg-accent text-primary-900" disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {openEdit ? (
          <form id="editStudent" onSubmit={onUpdate} className="space-y-3">
            <label className="block text-sm">
              <span>Name</span>
              <input
                name="name"
                className="mt-1 w-full rounded border px-3 py-2"
                defaultValue={openEdit.name}
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span>Year</span>
                <input
                  name="year"
                  className="mt-1 w-full rounded border px-3 py-2"
                  defaultValue={openEdit.year ?? ""}
                />
              </label>
              <label className="block text-sm">
                <span>Phone</span>
                <input
                  name="phone"
                  className="mt-1 w-full rounded border px-3 py-2"
                  defaultValue={openEdit.phone ?? ""}
                />
              </label>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
