import React from "react";
import { Link } from "react-router-dom";

// Images (per your request)
import it1 from "../../assets/it1.jpg";
import it3 from "../../assets/it3.jpg";
import it5 from "../../assets/it5.jpg";
import it6 from "../../assets/it6.jpg";

/**
 * Qualifications sourced from Belgium Campus iTversity:
 * - BComp (NQF 8, 4 years; accredit doc shows 480 credits; flyers ~506)
 * - BIT (NQF 7, 3 years, 360 credits) + Part-Time BIT (5 years, Saturdays)
 * - Diploma in IT (NQF 6, 360 credits; 2.5 yrs academic + 6 months WIL)
 * - Diploma for Deaf Students (listed on qualifications page)
 *
 * Reference pages:
 *  - https://www.belgiumcampus.ac.za/qualifications/
 *  - https://www.belgiumcampus.ac.za/accreditation/
 *  - https://www.belgiumcampus.ac.za/bachelor-of-information-technology/
 *  - https://www.belgiumcampus.ac.za/part-time-bachelor-of-information-technology/
 *  - https://www.belgiumcampus.ac.za/diploma-in-information-technology/
 */

const courses = [
  {
    id: 1,
    title: "Bachelor of Computing (BComp)",
    image: it1,
    badges: ["4 years", "NQF 8", "≈480–506 credits", "Work-integrated learning"],
    blurb:
      "A practical, career-focused degree with strong industry input. Choose a specialisation in Data Science or Software Engineering.",
    details: [
      "3 years academic + 1 year workplace training (WIL)",
      "Specialisations: Data Science, Software Engineering",
    ],
  },
  {
    id: 2,
    title: "Bachelor of Information Technology (BIT)",
    image: it3,
    badges: ["3 years", "NQF 7", "360 credits"],
    blurb:
      "Comprehensive IT degree building a strong foundation in software development and systems.",
    details: ["Software Development focus", "Contact-mode learning"],
  },
  {
    id: 22,
    title: "Bachelor of IT — Part-Time",
    image: it3, // reuse
    badges: ["5 years", "NQF 7", "Saturdays"],
    blurb:
      "BIT for working professionals — Saturday lectures with the same outcomes as the full-time programme.",
    details: ["Full contact-mode on Saturdays", "RPL may shorten duration"],
  },
  {
    id: 4,
    title: "Diploma in Information Technology",
    image: it5,
    badges: ["~3 years", "NQF 6", "360 credits"],
    blurb:
      "Hands-on qualification developing core competency for fast entry into industry.",
    details: ["2.5 years academic + 6 months workplace training"],
  },
  {
    id: 7,
    title: "Diploma for Deaf Students",
    image: it6,
    badges: ["Vocational", "Accessible learning"],
    blurb:
      "Special-support diploma programme empowering deaf students for IT careers.",
    details: ["Listed under BC’s qualifications"],
  },
];

export default function Courses() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-heading text-primary mb-2">
          Explore Our Qualifications
        </h1>
        <p className="text-primary/70 max-w-2xl mx-auto">
          Lead the way with industry-aligned IT qualifications designed for real-world impact.
        </p>
      </header>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <article
            key={course.id}
            className="rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition"
          >
            <img
              src={course.image}
              alt={course.title}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
            <div className="p-4 flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-primary text-lg mb-1">
                  {course.title}
                </h2>

                {/* Badges */}
                {course.badges?.length ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {course.badges.map((b, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-1 rounded-full border border-primary/20 bg-cream/60"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Blurb */}
                <p className="text-sm text-primary/70">{course.blurb}</p>

                {/* Details */}
                {course.details?.length ? (
                  <ul className="mt-2 text-[12px] text-primary/70 list-disc pl-5 space-y-1">
                    {course.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* Actions */}
              <div className="mt-1 flex items-center gap-4">
                <Link
                  to={`/courses/${course.id}#overview`}
                  className="text-sm text-accent font-button hover:underline"
                >
                  View Course →
                </Link>
                <Link
                  to={`/courses/${course.id}#more`}
                  className="text-xs text-primary/70 hover:underline"
                >
                  Read more
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
