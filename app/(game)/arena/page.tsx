import Pong from "@/components/Pong";
import { getOrCreateUser } from "@/db/queries";

export default async function Play() {
  const user = await getOrCreateUser();

  return (
    <main>
      <Pong prevHighScore={user.high_score} clerkId={user.clerk_id} />
    </main>
  );
}
