"use server";

import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

const sql = neon(process.env.DATABASE_URL!);

async function getOrCreateUser() {
  const user = await currentUser();
  
  //Existing user
  const existing = await sql`
    SELECT *
    FROM score
    WHERE clerk_id = ${user?.id};
  `
  if (existing.length > 0) {
    return existing[0];
  }

  //New user
  const inserted = await sql`
    INSERT INTO score (clerk_id, first_name, last_name, profile_image, high_score)
    VALUES (
        ${user!.id},
        ${user?.firstName},
        ${user?.lastName ?? ""},
        ${user?.imageUrl},
        0
    )
    RETURNING *;
  `;

  return inserted[0];
}

async function getLeaderboard() {
  const leaderboard = await sql`
    SELECT clerk_id, first_name, last_name, high_score, profile_image
    FROM score
    ORDER BY high_score DESC;
  `
 
  return leaderboard;
}

async function updateHighscore({highScore, clerkID}: {highScore: number, clerkID: string}) {
  const updated = await sql`
    UPDATE score
    SET high_score = GREATEST(high_score, ${highScore})
    WHERE clerk_id = ${clerkID}
    RETURNING high_score;
  `

  return updated[0].high_score;
}


export {getLeaderboard, getOrCreateUser, updateHighscore}