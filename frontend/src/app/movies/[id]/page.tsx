import MovieSheet from "@/components/MovieSheet";
import { getTheatres } from "@/lib/theatres.server";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theatres = await getTheatres();
  return <MovieSheet theatres={theatres} movieId={id} />;
}
