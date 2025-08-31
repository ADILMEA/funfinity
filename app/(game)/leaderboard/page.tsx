import { getLeaderboard, getOrCreateUser } from "@/db/queries";
import Image from "next/image";
import React from "react";

export default async function Page() {
  const user = await getOrCreateUser();
  const leaderboard = await getLeaderboard();

  return (
    <main>
      <div className="p-8">
        <h2 className="text-center text-6xl font-bold">LEADERBOARD</h2>
        <div className="mt-12 flex flex-col gap-4 items-center">
          {leaderboard.map((player, index) => (
            <div
              key={index}
              className="relative w-full max-w-4xl flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="relative size-16 shadow-md rounded-md">
                <Image
                  src={player.profile_image}
                  alt={player.first_name + " image"}
                  className="object-cover rounded-md"
                  fill
                />
              </div>
              <div className="text-4xl">
                {index + 1}. {player.first_name.toUpperCase()}
              </div>
              <div className="text-6xl font-bold">{player.high_score}</div>

              <div className="absolute left-[50%] bottom-0">
                {user.clerk_id == player.clerk_id ? "YOU" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
