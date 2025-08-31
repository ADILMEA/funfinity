import { getLeaderboard, getOrCreateUser } from "@/db/queries";
import Image from "next/image";
import React from "react";

export default async function Page() {
  const user = await getOrCreateUser();
  const leaderboard = await getLeaderboard();

  return (
    <main className="p-4 md:p-8">
      <h2 className="text-center text-5xl md:text-6xl font-bold">
        LEADERBOARD
      </h2>
      <div className="mt-12 flex flex-col gap-4 items-center">
        {leaderboard.map((player, index) => (
          <div
            key={index}
            className={
              "relative w-full max-w-4xl flex justify-between items-center p-2 md:p-4 border border-neutral-200 rounded-lg shadow-sm" +
              (user.clerk_id == player.clerk_id ? " bg-blue-50" : "")
            }
          >
            <div className="relative size-8 md:size-16 shadow-md rounded-md">
              <Image
                src={player.profile_image}
                alt={player.first_name + " image"}
                className="object-cover rounded-md"
                fill
              />
            </div>
            <div className="max-w-56 md:max-w-xl relative text-2xl md:text-4xl truncate">
              {index + 1}.{" "}
              {player.first_name.toUpperCase() +
                (player.last_name ? " " + player.last_name.toUpperCase() : "")}
            </div>

            <div className="text-4xl md:text-6xl font-bold">
              {player.high_score}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
