// frontend/src/components/ui/Loader.jsx
export default function Loader({ label = "Loading..." }) {
  return (
    <div className="grid place-items-center p-8">
      <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
      <p className="text-sm mt-3 text-primary/70">{label}</p>
    </div>
  );
}
