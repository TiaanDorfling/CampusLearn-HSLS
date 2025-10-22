import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

// Images used across courses
import it1 from "../../assets/it1.jpg";
import it3 from "../../assets/it3.jpg";
import it5 from "../../assets/it5.jpg";
import it6 from "../../assets/it6.jpg";

/**
 * Course data aligned with your public grid.
 * If you later want to hydrate this from the server, you can replace this
 * object with an API call and keep the render logic unchanged.
 */
const COURSE_MAP = {
  // 1) Bachelor of Computing
  1: {
    title: "Bachelor of Computing (BComp)",
    image: it1,
    overview:
      "A practical, career-focused degree designed with strong industry input. Choose a specialisation in Data Science or Software Engineering.",
    facts: [
      "Duration: 4 years (3 years academic + 1 year workplace training)",
      "NQF Level: 8",
      "Credits: ≈480–506",
      "Specialisations: Data Science, Software Engineering",
    ],
    more: [
      "The first three years build a deep foundation in computing, mathematics, and professional practice.",
      "The fourth year integrates workplace learning (WIL) and a research dissertation to consolidate theory and practice.",
      "Graduates pursue roles such as Software Engineer, Data Scientist, Systems Analyst, and more.",
    ],
    external:
      "https://www.belgiumcampus.ac.za/bachelor-of-computing/",
  },

  // 2) Bachelor of Information Technology — Full-Time
  2: {
    title: "Bachelor of Information Technology (BIT)",
    image: it3,
    overview:
      "Comprehensive IT degree building a strong foundation in software development and systems.",
    facts: ["Duration: 3 years", "NQF Level: 7", "Credits: 360"],
    more: [
      "Focus on software development fundamentals, databases, and systems analysis.",
      "Strong emphasis on practical projects and industry-ready skills.",
    ],
    external:
      "https://www.belgiumcampus.ac.za/bachelor-of-information-technology/",
  },

  // 22) Bachelor of Information Technology — Part-Time
  22: {
    title: "Bachelor of IT — Part-Time",
    image: it3,
    overview:
      "BIT for working professionals — Saturday lectures with the same outcomes as the full-time programme.",
    facts: ["Duration: ~5 years (Part-Time)", "NQF Level: 7", "Delivery: Saturdays"],
    more: [
      "Ideal for employed students seeking a flexible pathway.",
      "Recognition of Prior Learning (RPL) may shorten duration depending on experience.",
    ],
    external:
      "https://www.belgiumcampus.ac.za/part-time-bachelor-of-information-technology/",
  },

  // 4) Diploma in Information Technology
  4: {
    title: "Diploma in Information Technology",
    image: it5,
    overview:
      "Hands-on qualification developing core competency for fast entry into industry.",
    facts: [
      "Duration: ~3 years (2.5 years academic + 6 months workplace training)",
      "NQF Level: 6",
      "Credits: 360",
    ],
    more: [
      "Builds strong practical capability in applied programming and systems.",
      "Work-integrated learning component connects you to real-world practice.",
    ],
    external:
      "https://www.belgiumcampus.ac.za/diploma-in-information-technology/",
  },

  // 7) Diploma for Deaf Students
  7: {
    title: "Diploma for Deaf Students",
    image: it6,
    overview:
      "Special-support diploma programme empowering deaf students for IT careers.",
    facts: ["Vocational focus", "Accessible learning environment"],
    more: [
      "Programme design and delivery consider accessibility and inclusive pedagogy.",
      "Develops the technical and professional skills needed for entry-level IT roles.",
    ],
    external:
      "https://www.belgiumcampus.ac.za/qualifications/",
  },
};

export default function CourseInfo() {
  const { id } = useParams();
  const course = COURSE_MAP[id];

  // Smooth scroll to anchor (#overview / #more) when arriving or changing id/hash
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id]);

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <Link to="/courses" className="text-sm hover:underline">← Back to Courses</Link>
        <h1 className="text-2xl font-heading text-primary mt-4">Course not found</h1>
        <p className="text-primary/70 mt-2">Please go back and choose a different course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Top back link */}
      <div className="mb-4">
        <Link to="/courses" className="text-sm hover:underline">← Back to Courses</Link>
      </div>

      {/* Header / Hero */}
      <header className="flex flex-col md:flex-row gap-6 items-start">
        <img
          src={course.image}
          alt={course.title}
          className="w-full md:w-80 h-48 object-cover rounded-xl"
          loading="eager"
          decoding="async"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-heading text-primary">{course.title}</h1>
          <p className="text-primary/70 mt-2">{course.overview}</p>

          {/* Quick facts */}
          {course.facts?.length ? (
            <ul className="mt-4 text-sm text-primary/80 grid sm:grid-cols-2 gap-1">
              {course.facts.map((f, i) => (
                <li key={i} className="before:content-['•'] before:mr-2">{f}</li>
              ))}
            </ul>
          ) : null}

          {/* External official page link */}
          {course.external ? (
            <a
              href={course.external}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-sm text-accent hover:underline"
            >
              Visit official programme page ↗
            </a>
          ) : null}
        </div>
      </header>

      {/* Overview anchor */}
      <section id="overview" className="mt-10">
        <h2 className="text-xl font-semibold text-primary">Overview</h2>
        <p className="mt-2 text-primary/80">{course.overview}</p>
      </section>

      {/* Read more / details anchor */}
      <section id="more" className="mt-10">
        <h2 className="text-xl font-semibold text-primary">Read more</h2>
        {course.more?.length ? (
          <ul className="mt-2 space-y-2 text-primary/80">
            {course.more.map((m, i) => (
              <li key={i} className="text-sm">{m}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-primary/70 text-sm">
            Additional information will be added soon.
          </p>
        )}
      </section>

      {/* Bottom back link */}
      <div className="mt-12">
        <Link to="/courses" className="text-sm hover:underline">
          ← Back to Courses
        </Link>
      </div>
    </div>
  );
}
