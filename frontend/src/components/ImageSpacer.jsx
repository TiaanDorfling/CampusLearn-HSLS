import React from "react";

/**
 * ImageSpacer
 * Full-width image band with a soft overlay in your brand colours.
 *
 * Props:
 * - src: string (import or path under /src/assets)
 * - height: tailwind height class (default "h-64")
 * - overlay: tailwind bg class for overlay (default "from-primary/50 to-primary-900/60")
 * - children: optional content centered on top
 */
export default function ImageSpacer({
  src,
  height = "h-64 md:h-80",
  overlay = "from-primary/50 to-primary-900/60",
  children,
}) {
  const style = src
    ? { backgroundImage: `url(${src})` }
    : { backgroundImage: "linear-gradient(135deg, #B9AEE5, #F18CB3)" };

  return (
    <section className={`relative w-full ${height} my-12`}>
      <div
        className="absolute inset-0 bg-center bg-cover rounded-xl"
        style={style}
      />
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${overlay}`}
      />
      <div className="relative h-full flex items-center justify-center px-4">
        {children ? (
          <div className="text-center text-cream drop-shadow">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
