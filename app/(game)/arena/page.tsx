import Snake from "@/components/Snake";
import { getOrCreateUser } from "@/db/queries";

export default async function Game() {
  const user = await getOrCreateUser();
  console.log(user);

  return (
    <main className="p-4 md:p-8 overflow-clip w-full">
      <h2 className="text-center text-5xl md:text-6xl font-bold">ARENA</h2>
      <Snake prevHighScore={user.high_score} clerkId={user.clerk_id} />
    </main>
  );
}
