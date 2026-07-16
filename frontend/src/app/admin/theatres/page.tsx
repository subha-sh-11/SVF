import TheatreExplorer from "@/components/TheatreExplorer";

export default function TheatresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-strong">
          Theatres
        </h2>
        <p className="mt-0.5 text-sm text-faint">
          Nizam Centers master list — assign a representative to each theatre.
        </p>
      </div>

      <TheatreExplorer />
    </div>
  );
}
