import MovieSheet from "@/components/MovieSheet";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // The sheet is now a Univer spreadsheet — no need to load the OG theatre list
  // from the DB on every open (that was slow and crashed the page if the DB was
  // briefly unreachable).
  return <MovieSheet theatres={[]} movieId={id} />;
}
