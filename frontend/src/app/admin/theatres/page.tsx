import TheatreExplorer from "@/components/TheatreExplorer";
import { getTheatres } from "@/lib/theatres.server";

export default async function TheatresPage() {
  const theatres = await getTheatres();

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

      <TheatreExplorer theatres={theatres} />
    </div>
  );
}
