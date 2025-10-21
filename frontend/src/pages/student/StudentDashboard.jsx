import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import AvatarPicker from "../../components/profile/AvatarPicker.jsx";
import ScheduleTable from "../../components/schedule/ScheduleTable.jsx";
import MarksGrid from "../../components/marks/MarksGrid.jsx";
import { getMyStudent, updateMyStudent } from "../../api/students";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";

export default function StudentDashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);

  // local editable state
  const [form, setForm] = useState({
    phone: "",
    year: "",
    about: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  // demo schedule & marks for now (replace with real data from API later)
  const [schedule, setSchedule] = useState([]);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        const res = await getMyStudent();
        if (!alive) return;
        const s = res.student || null;
        setStudent(s);
        setForm(f => ({
          ...f,
          phone: s?.phone || "",
          year: s?.year || "",
          about: s?.about || "",
          emergencyContactName: s?.emergencyContact?.name || "",
          emergencyContactPhone: s?.emergencyContact?.phone || "",
        }));

        // TEMP: build schedule + marks from student.courses (if available) or demo
        const demoSched = [
          { day: "Mon", start: "09:00", end: "10:30", title: "SEN381", location: "B201" },
          { day: "Tue", start: "11:00", end: "12:30", title: "PRG381", location: "C105" },
          { day: "Wed", start: "13:00", end: "15:00", title: "DBD382", location: "Lab 2" },
          { day: "Thu", start: "10:00", end: "11:30", title: "ELD380", location: "A304" },
          { day: "Fri", start: "08:00", end: "10:00", title: "NET380", location: "B001" },
        ];
        setSchedule(s?.schedule || demoSched);

        const demoMarks = [
          { code: "SEN381", name: "Software Engineering", overall: 78, terms: [
            { label: "Test 1", score: 75 }, { label: "Assignment", score: 82 }, { label: "Project", score: 80 }
          ]},
          { code: "PRG381", name: "Programming 3", overall: 66, terms: [
            { label: "Test 1", score: 60 }, { label: "Lab", score: 72 }, { label: "Project", score: 65 }
          ]},
          { code: "DBD382", name: "Databases", overall: 85, terms: [
            { label: "Test 1", score: 88 }, { label: "Assignment", score: 84 }, { label: "Project", score: 83 }
          ]},
        ];
        setMarks(s?.marks || demoMarks);

      } catch (err) {
        setError(err?.friendlyMessage || err?.message || "Failed to load your profile.");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  async function onSave(e) {
    e?.preventDefault();
    setSaving(true);
    setError("");
    const patch = {
      phone: form.phone,
      year: form.year,
      about: form.about,
      emergencyContact: {
        name: form.emergencyContactName,
        phone: form.emergencyContactPhone,
      },
      // NOTE: avatar will be uploaded via a dedicated endpoint later
    };

    const prev = student;
    try {
      // optimistic UI
      setStudent((s) => ({ ...s, ...patch, avatarUrl: s?.avatarUrl }));
      // TEMP: if avatar chosen, you’ll POST it to /api/students/me/avatar (FormData)
      // await uploadAvatar(avatarFile)
      const res = await updateMyStudent(patch);
      setStudent(res.student || prev);
      setAvatarFile(null);
    } catch (err) {
      setStudent(prev);
      setError(err?.friendlyMessage || "Could not save changes.");
    } finally { setSaving(false); }
  }

  if (loading) return <Loader label="Fetching your student profile..." />;
  if (!student) return <Empty title="No student profile" hint="Ask admin to attach your user to a student record." />;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Top toolbar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-primary/70 text-sm">
            Welcome, {student.name || student.fullName || "Student"}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <BackHomeButton />
          <button onClick={() => nav("/app/messages")} className="px-3 py-1 rounded border hover:bg-cream">Messages</button>
          <button onClick={() => nav("/app/forum")} className="px-3 py-1 rounded border hover:bg-cream">Forum</button>
        </div>
      </header>

      {error ? (
        <div className="rounded border border-red-400/60 p-3 text-sm text-red-700 bg-red-50">{error}</div>
      ) : null}

      {/* Profile card */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 bg-white shadow-sm lg:col-span-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold">Your profile</h3>
          </div>
          <div className="mt-4 space-y-4">
            <AvatarPicker value={student.avatarUrl} onChange={setAvatarFile} />
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Email:</span> {student.email}</p>
              <p><span className="font-medium">Student #:</span> {student.studentNumber ?? "—"}</p>
              <p><span className="font-medium">Year:</span> {student.year || "—"}</p>
              <p><span className="font-medium">Phone:</span> {student.phone || "—"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSave} className="rounded-xl border p-5 bg-white shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-2">Edit details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span>Phone</span>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.phone}
                     onChange={(e)=>setForm({...form, phone:e.target.value})}/>
            </label>
            <label className="block text-sm">
              <span>Year</span>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.year}
                     onChange={(e)=>setForm({...form, year:e.target.value})}/>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span>About</span>
              <textarea className="mt-1 w-full rounded border px-3 py-2" rows="3" value={form.about}
                        onChange={(e)=>setForm({...form, about:e.target.value})}/>
            </label>
            <label className="block text-sm">
              <span>Emergency contact name</span>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.emergencyContactName}
                     onChange={(e)=>setForm({...form, emergencyContactName:e.target.value})}/>
            </label>
            <label className="block text-sm">
              <span>Emergency contact phone</span>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.emergencyContactPhone}
                     onChange={(e)=>setForm({...form, emergencyContactPhone:e.target.value})}/>
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button className="px-4 py-2 rounded bg-accent text-primary-900 disabled:opacity-60" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <span className="text-xs text-primary/60">
              Avatar will save once the backend upload endpoint is wired.
            </span>
          </div>
        </form>
      </section>

      {/* Schedule */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">This week’s schedule</h3>
          <div className="text-xs text-primary/60">Times are campus local</div>
        </div>
        <ScheduleTable events={schedule} />
      </section>

      {/* Marks */}
      <section className="space-y-3">
        <h3 className="font-semibold">Marks & progress</h3>
        <MarksGrid courses={marks} />
      </section>

      {/* Enrolments (keep your previous section – moved below, styled) */}
      <section className="rounded-xl border p-5 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Enrolled Courses</h3>
        {Array.isArray(student.courses) && student.courses.length ? (
          <ul className="text-sm list-disc pl-5 space-y-1">
            {student.courses.map((c) => (
              <li key={c._id || c.id}>{c.code} — {c.name}</li>
            ))}
          </ul>
        ) : (
          <Empty title="No courses" hint="Once your admin enrolls you, they’ll appear here." />
        )}
      </section>
    </div>
  );
}
