export default function Empty({ title="Nothing here yet", hint="" }) {
  return (
    <div className="p-8 rounded-lg border border-dashed text-center text-primary/70">
      <p className="font-semibold">{title}</p>
      {hint ? <p className="text-xs mt-1">{hint}</p> : null}
    </div>
  );
}
