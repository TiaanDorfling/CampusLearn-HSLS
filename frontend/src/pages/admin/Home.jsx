// frontend/src/pages/admin/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Photos (from your assets folder)
import campusImg from "../../assets/campus.jpg";
import heroImg from "../../assets/hero.jpg";
import it1 from "../../assets/it1.jpg";
import it3 from "../../assets/it3.jpg";
import it5 from "../../assets/it5.jpg";

export default function AdminHome() {
  const nav = useNavigate();

  // --- static demo content (student admin-focused) ---
  const kpis = [
    { label: "Active Students", value: "1,284", tone: "primary" },
    { label: "Active Tutors", value: "42", tone: "lavender" },
    { label: "Courses Running", value: "36", tone: "accent" },
    { label: "Avg. Response (Msgs)", value: "1h 12m", tone: "cream" },
  ];

  const activity = [
    { time: "09:05", what: "New post in Software Engineering forum", who: "Student · L. Mthembu" },
    { time: "10:22", what: "Three new enrollment requests received", who: "System" },
    { time: "11:10", what: "Support ticket #4133 marked as resolved", who: "Support · T. Jones" },
    { time: "11:45", what: "Notice sent to BIT third-years", who: "Admin · You" },
  ];

  const glance = [
    { title: "Pending Enrollments", value: "5", caption: "Awaiting review" },
    { title: "Course Approvals", value: "3", caption: "In the queue" },
    { title: "Support Tickets", value: "4", caption: "Open" },
    { title: "Flagged Posts", value: "2", caption: "Needs moderation" },
  ];

  const enrollQueue = [
    { name: "Thandi Nkosi",  programme: "BIT (FT)",        status: "Docs outstanding" },
    { name: "Alex Mahlangu", programme: "BComp (SE)",      status: "Payment review" },
    { name: "Priya Naidoo",  programme: "Diploma (IT)",    status: "Ready to confirm" },
    { name: "K. van Wyk",    programme: "BIT (PT)",        status: "Awaiting ID copy" },
    { name: "Mpho Dlamini",  programme: "BComp (DS)",      status: "Docs outstanding" },
  ];

  const todayTasks = [
    { title: "Verify proof of registration (BIT PT batch)", owner: "You", due: "Today" },
    { title: "Approve 3 course outlines (2025 intake)",     owner: "Curriculum", due: "Today" },
    { title: "Publish library access update",                owner: "Admin Team", due: "Today" },
    { title: "Escalate 2 unresolved tickets",               owner: "Support", due: "Today" },
  ];

  const quickLinks = [
    { title: "Course Manager", href: "/app/admin/courses" },
    { title: "Users & Roles",  href: "/app/admin" },
    { title: "Messages",       href: "/app/messages" }, // <- changed label from Announcements to Messages
    { title: "Forum Moderation", href: "/app/forum" },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-6 space-y-12 font-sans">
      {/* HERO — brighter gradient + subtle pattern */}
      <section className="rounded-3xl p-8 border shadow-sm bg-[radial-gradient(circle_at_20%_10%,rgba(185,174,229,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(241,140,179,0.25),transparent_40%),linear-gradient(90deg,rgba(185,174,229,0.35),rgba(255,243,224,0.7),white)] border-primary/10">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-heading text-primary">Admin Home</h1>
            <p className="text-primary/70 mt-2">
              Keep track of student activity, course operations, and overall platform health in one place.
            </p>
            <div className="mt-4 inline-flex gap-2">
              <Badge tone="lavender">Student admin</Badge>
              <Badge tone="accent">Operations</Badge>
              <Badge tone="cream">Health</Badge>
            </div>
          </div>

          {/* KPI stats with colour variants */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto md:ml-auto">
            {kpis.map((k, i) => (
              <Stat key={i} label={k.label} value={k.value} tone={k.tone} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
          <QuickAction onClick={() => nav("/app/admin/dashboard")} label="Dashboard" />
          <QuickAction onClick={() => nav("/app/admin/courses")} label="Course Manager" />
          <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
          <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
        </div>
      </section>

      {/* MAIN CONTENT — centred, fuller layout with colourful cards */}
      <section className="space-y-12">
        {/* Top grid: Activity + Tasks + Photo highlight */}
        <div className="grid xl:grid-cols-3 gap-8">
          {/* Live Activity (2 cols) */}
          <div className="xl:col-span-2 space-y-8">
            <Card borderTone="lavender" soft>
              <Header title="Live activity" right={<span className="text-xs text-primary/60">Today</span>} />
              <ul className="mt-3 divide-y">
                {activity.map((a, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.what}</div>
                      <div className="text-xs text-primary/60">{a.who}</div>
                    </div>
                    <div className="text-xs text-primary/60">{a.time}</div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card borderTone="accent" soft>
              <Header
                title="Today’s tasks"
                right={<button className="text-sm underline" onClick={() => nav("/app/admin/dashboard")}>Open Dashboard</button>}
              />
              <ul className="mt-3 space-y-2">
                {todayTasks.map((t, i) => (
                  <li
                    key={i}
                    className="rounded-xl border bg-white p-3 flex items-center justify-between hover:bg-cream/60 transition"
                  >
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-primary/60">
                        Owner: {t.owner} • Due: {t.due}
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-lavender/30 border border-lavender/40">
                      Priority
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Photo highlight (1 col) */}
          <div className="space-y-8">
            <Card className="overflow-hidden" borderTone="primary" soft>
              <h3 className="font-semibold font-heading">Campus highlights</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ImageTile src={campusImg} alt="Campus" />
                <ImageTile src={heroImg} alt="Atrium" />
                <ImageTile src={it3} alt="Lecture hall" />
                <ImageTile src={it1} alt="Student project" />
                <ImageTile src={it5} alt="Workshop" />
                <ImageTile src={it3} alt="Lab" />
              </div>
            </Card>

            <Card soft>
              <h3 className="font-semibold font-heading">Quick links</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {quickLinks.map((l, i) => (
                  <li key={i}>
                    <button
                      onClick={() => nav(l.href)}
                      className="w-full text-left rounded-lg border p-3 bg-white hover:bg-cream transition font-accent"
                    >
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Middle grid: Enrollment Queue + At a Glance + System Health */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2" borderTone="lavender" soft>
            <Header
              title="Enrollment queue"
              right={<button className="text-sm underline" onClick={() => nav("/app/admin/courses")}>Go to Course Manager</button>}
            />
            <div className="mt-3 rounded-xl border overflow-hidden">
              <table className="table-auto w-full text-sm">
                <thead className="bg-linear-to-r from-lavender/40 via-cream/70 to-white">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">Student</th>
                    <th className="px-3 py-2 font-medium">Programme</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollQueue.map((e, i) => (
                    <tr key={i} className="hover:bg-cream/40">
                      <td className="px-3 py-2">{e.name}</td>
                      <td className="px-3 py-2">{e.programme}</td>
                      <td className="px-3 py-2">
                        <StatusPill text={e.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <TinyBtn onClick={() => {}} tone="accent">Review</TinyBtn>
                          <TinyBtn onClick={() => {}} tone="primary">Message</TinyBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-8">
            <Card borderTone="accent" soft>
              <Header
                title="At a glance"
                right={<button className="text-sm underline" onClick={() => nav("/app/admin/dashboard")}>Dashboard</button>}
              />
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                {glance.map((g, i) => (
                  <Glance key={i} title={g.title} value={g.value} caption={g.caption} />
                ))}
              </div>
            </Card>

            <Card soft>
              <h3 className="font-semibold font-heading">System health</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <HealthRow k="DB connection" v={<Healthy text="OK" />} />
                <HealthRow k="API latency (p95)" v={<Warn text="142 ms" />} />
                <HealthRow k="Uptime (24h)" v={<Healthy text="99.97%" />} />
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

/* === UI helpers — colourful variants matching CampusLearn palette === */
function toneGradients(tone = "primary") {
  switch (tone) {
    case "accent":
      return {
        ring: "ring-1 ring-accent/30",
        border: "border-accent/40",
        bar: "from-accent via-cream to-primary",
        statBar: "from-accent/60 to-transparent",
        tint: "bg-accent/10",
      };
    case "lavender":
      return {
        ring: "ring-1 ring-lavender/30",
        border: "border-lavender/40",
        bar: "from-lavender via-cream to-white",
        statBar: "from-lavender/60 to-transparent",
        tint: "bg-lavender/10",
      };
    case "cream":
      return {
        ring: "ring-1 ring-cream/60",
        border: "border-primary/10",
        bar: "from-cream via-white to-lavender",
        statBar: "from-cream/80 to-white",
        tint: "bg-cream/50",
      };
    default:
      return {
        ring: "ring-1 ring-primary/20",
        border: "border-primary/10",
        bar: "from-primary via-lavender to-cream",
        statBar: "from-primary/60 to-transparent",
        tint: "bg-primary/5",
      };
  }
}

function Header({ title, right }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold font-heading">{title}</h3>
      {right}
    </div>
  );
}

function Badge({ children, tone = "primary" }) {
  const p = toneGradients(tone);
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${p.ring} ${p.border} ${p.tint}`}>{children}</span>
  );
}

function Stat({ label, value, tone = "primary", onClick }) {
  const p = toneGradients(tone);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-3 text-left shadow-sm hover:shadow transition w-full ${p.border} hover:${p.tint}`}
    >
      <div className={`h-1.5 mb-2 rounded-full bg-linear-to-r ${p.statBar}`} />
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-semibold text-primary">{value}</div>
    </button>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-linear-to-r hover:from-lavender/30 hover:to-accent/20 transition font-accent"
    >
      {label}
    </button>
  );
}

function Card({ children, className = "", borderTone = "primary", soft = false }) {
  const p = toneGradients(borderTone);
  return (
    <div className={`rounded-2xl border ${p.border} ${soft ? p.tint : "bg-white"} p-5 shadow-sm ${className}`}>
      <div className={`h-1 rounded-full bg-linear-to-r ${p.bar} mb-3`} />
      {children}
    </div>
  );
}

function Glance({ title, value, caption }) {
  return (
    <div className="rounded-xl border bg-white/90 backdrop-blur-sm p-4">
      <div className="text-sm text-primary/60">{title}</div>
      <div className="text-2xl font-semibold text-primary-900">{value}</div>
      <div className="text-xs text-primary/60">{caption}</div>
    </div>
  );
}

function HealthRow({ k, v }) {
  return (
    <li className="flex items-center justify-between rounded-lg border p-2 bg-white">
      <span className="text-primary/70">{k}</span>
      <span className="font-medium text-primary-900">{v}</span>
    </li>
  );
}

function Healthy({ text }) {
  return <span className="px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-700 border border-green-200">{text}</span>;
}
function Warn({ text }) {
  return <span className="px-2 py-0.5 rounded-md text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">{text}</span>;
}

function StatusPill({ text }) {
  const tone =
    /docs|id|await/i.test(text)
      ? "bg-lavender/30 border-lavender/40"
      : /ready|confirm/i.test(text)
      ? "bg-accent/30 border-accent/40"
      : "bg-cream/70 border-primary/10";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tone}`}>
      {text}
    </span>
  );
}

function TinyBtn({ children, onClick, tone = "primary" }) {
  const toneCls =
    tone === "accent"
      ? "border-accent/60 hover:bg-accent/20"
      : "border-primary/30 hover:bg-cream/70";
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-lg border font-accent ${toneCls} transition`}
    >
      {children}
    </button>
  );
}

function ImageTile({ src, alt }) {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-cream/60">
      <img src={src} alt={alt} className="h-24 w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-lavender via-cream to-white" />
    </div>
  );
}
