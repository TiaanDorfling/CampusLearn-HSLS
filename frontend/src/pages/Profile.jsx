// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyStudent, updateMyStudent } from "../api/students";

export default function Profile() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await getMyStudent();
        setProfile(data.student || data); // depending on how backend returns
        setForm({
          about: (data.student?.about) ?? "",
          phone: (data.student?.phone) ?? "",
          year: (data.student?.year) ?? "",
          studentNumber: (data.student?.studentNumber) ?? "",
          emergencyContact: (data.student?.emergencyContact?.phone) ?? "",
        });
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const patchPayload = {
        about: form.about,
        phone: form.phone,
        year: form.year,
        studentNumber: form.studentNumber,
        // CORRECTLY NEST THE emergencyContact field
        emergencyContact: {
          phone: form.emergencyContactPhone, // Assuming you changed the input name
          // Include 'name' here if you have an input for it: name: form.emergencyContactName,
        },
        // You may need to remove any other fields not meant for the PATCH request
      };

      await updateMyStudent(patchPayload);
      const updated = await getMyStudent();
      setProfile(updated.student || updated);
      alert("Profile saved");
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-primary/70">Loading profile…</div>;
  }

  if (error && !profile) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-8 bg-white border border-primary/10 shadow-sm bg-[linear-gradient(90deg,rgba(185,174,229,0.6),rgba(255,243,224,0.7),white)]">
        <h1 className="text-2xl md:text-3xl font-heading text-primary">Your Profile</h1>
        <p className="text-primary/70 mt-1">Manage your student profile details below.</p>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-primary/60 uppercase tracking-wide">About you</label>
              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-primary"
                rows={4}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-primary/60 uppercase tracking-wide">Phone</label>
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-primary/60 uppercase tracking-wide">Year</label>
                <input
                  name="year"
                  type="text"
                  value={form.year}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-primary/60 uppercase tracking-wide">Student Number</label>
              <input
                name="studentNumber"
                type="text"
                value={form.studentNumber}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-primary/60 uppercase tracking-wide">Emergency Contact Phone</label>
              <input
                name="emergencyContact"
                type="text"
                value={form.emergencyContact}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-primary"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg border bg-primary text-white hover:bg-primary-dark transition"
              >
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>

            {error && <div className="text-red-600">{error}</div>}
          </form>
        </div>

        <div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Your Info</h3>
            <div className="mt-4 space-y-2 text-sm text-primary/70">
              <div><strong>Created At:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "—"}</div>
              <div><strong>Last Updated:</strong> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "—"}</div>
              <div><strong>Courses Enrolled:</strong> {Array.isArray(profile.courses) ? profile.courses.length : 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
