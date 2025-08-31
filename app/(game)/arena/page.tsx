import Pong from "@/components/Pong";
import { getOrCreateUser } from "@/db/queries";

export default async function Play() {
  const user = await getOrCreateUser();

  return (
    <main className="p-4 md:p-8">
      <h2 className="text-center text-5xl md:text-6xl font-bold">ARENA</h2>
      <Pong prevHighScore={user.high_score} clerkId={user.clerk_id} />
    </main>
  );
}
