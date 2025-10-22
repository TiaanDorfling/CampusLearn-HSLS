import React from "react";
import { Link } from "react-router-dom";
import ImageSpacer from "../../components/ImageSpacer.jsx";

// Import your images (add files to /src/assets). If files are missing, ImageSpacer falls back to gradients.
import heroImg from "../../assets/hero.jpg";
import studyImg from "../../assets/study.jpg";
import campusImg from "../../assets/campus.jpg";

export default function Home() {
  return (
    <div className="text-primary-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-button bg-cream border border-primary/10">
              Built for students & tutors
            </span>
            <h1 className="text-4xl md:text-5xl font-heading leading-tight text-primary">
              Learn faster with tutors who’ve been in your shoes.
            </h1>
            <p className="text-lg font-sans">
              Questions, resources, and feedback — all in one place. Join
              discussions, book sessions, and keep track of deadlines.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="px-5 py-3 rounded-lg font-button bg-accent text-primary-900 hover:shadow"
              >
                Get Started
              </Link>
              <Link
                to="/courses"
                className="px-5 py-3 rounded-lg font-button border border-primary-800 text-primary-800 hover:bg-cream"
              >
                Browse Courses
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 max-w-md mt-6 rounded-xl border border-primary/10 bg-white">
              <Stat num="2k+" label="Students" />
              <Stat num="350+" label="Tutors" />
              <Stat num="98%" label="Satisfaction" />
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-lavender border border-primary/10 shadow-inner overflow-hidden">
              <div
                className="w-full h-full bg-center bg-cover"
                style={
                  heroImg ? { backgroundImage: `url(${heroImg})` } : undefined
                }
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-2xl bg-accent/70 blur-2xl" />
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-primary/40 blur-2xl" />
          </div>
        </div>
      </section>

      {/* IMAGE SPACER #1 */}
      <ImageSpacer src={studyImg} height="h-52 md:h-64">
        <h2 className="text-2xl md:text-3xl font-heading">Study better, together.</h2>
        <p className="text-sm md:text-base mt-2 max-w-xl mx-auto">
          Find peers, book time with tutors, and turn confusion into confidence.
        </p>
      </ImageSpacer>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-heading text-primary mb-6">
          Why CampusLearn?
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            title="Ask & Discuss"
            text="Get answers fast. Threaded questions keep discussions tidy and searchable."
          />
          <Feature
            title="Resources Library"
            text="Curated notes, examples, and references approved by tutors."
          />
          <Feature
            title="Calendar & Reminders"
            text="Never miss a deadline. See upcoming sessions, exams, and submissions."
          />
        </div>
      </section>

      {/* IMAGE SPACER #2 */}
      <ImageSpacer src={campusImg} height="h-56 md:h-72" overlay="from-primary-900/50 to-primary/40">
        <h2 className="text-2xl md:text-3xl font-heading">Made for your campus.</h2>
        <p className="text-sm md:text-base mt-2 max-w-xl mx-auto">
          Keep your cohort in sync and your learning flow uninterrupted.
        </p>
      </ImageSpacer>

      {/* CATEGORIES / POPULAR COURSES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-heading text-primary mb-6">
          Popular this week
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <CourseCard
            code="SEN381"
            title="Software Engineering"
            tag="Project-based"
          />
          <CourseCard
            code="LPR381"
            title="Linear Programming"
            tag="Operations Research"
          />
          <CourseCard
            code="MAT281"
            title="Applied Mathematics"
            tag="STEM Core"
          />
        </div>
        <div className="mt-6">
          <Link to="/courses" className="underline font-button">
            See all courses →
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-heading text-primary mb-6">What students say</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Testimonial
            quote="I finally understood dynamic programming after one session."
            name="Anele • SEN381"
          />
          <Testimonial
            quote="The resources library saved me hours before exams."
            name="Retha • MAT281"
          />
          <Testimonial
            quote="Booked a tutor, synced deadlines, and stopped stressing."
            name="Sam • LPR381"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 md:p-10 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h3 className="text-2xl font-heading text-primary">
              Ready to learn smarter?
            </h3>
            <p className="mt-2">
              Join CampusLearn and start collaborating with tutors and peers today.
            </p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Link
              to="/auth"
              className="px-5 py-3 rounded-lg font-button bg-accent text-primary-900 hover:shadow"
            >
              Create account
            </Link>
            <Link
              to="/courses"
              className="px-5 py-3 rounded-lg font-button border border-primary-800 text-primary-800 hover:bg-cream"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      {/* IMAGE SPACER #3 (subtle) */}
      <ImageSpacer src={heroImg} height="h-40 md:h-52" overlay="from-primary/35 to-primary-900/45" />
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="px-4 py-3 text-center">
      <div className="text-xl font-heading text-primary">{num}</div>
      <div className="text-xs font-sans opacity-80">{label}</div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-white p-5 hover:shadow transition">
      <div className="w-10 h-10 rounded-lg bg-lavender mb-3" />
      <div className="font-heading text-primary">{title}</div>
      <p className="text-sm mt-1">{text}</p>
    </div>
  );
}

function CourseCard({ code, title, tag }) {
  return (
    <Link
      to={`/courses/${code.toLowerCase()}`}
      className="rounded-xl border border-primary/10 bg-white p-4 hover:shadow transition block"
    >
      <div className="text-xs font-button text-primary-900/80">{code}</div>
      <div className="font-heading text-primary text-lg">{title}</div>
      <div className="text-sm mt-1">{tag}</div>
    </Link>
  );
}

function Testimonial({ quote, name }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-white p-5">
      <div className="text-sm italic">“{quote}”</div>
      <div className="mt-2 text-xs font-button opacity-80">{name}</div>
    </div>
  );
}
