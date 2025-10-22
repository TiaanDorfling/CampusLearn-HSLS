import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading text-primary mb-2">404</h1>
      <p className="font-sans text-primary-900">This page could not be found.</p>
      <div className="mt-4">
        <Link to="/" className="underline text-primary-900">Go Home</Link>
      </div>
    </div>
  );
}
