# Pong Wars 🎮

PongWars is an exciting game event conducted as part of **MILEN 8.0**, organized by **IEEE MEA SB**. Compete, climb the leaderboard, and showcase your skills!  
Currently hosted at 👉 [pongwars.ieeemeasb.org](https://pongwars.ieeemeasb.org)

---

## 🚀 Features

- 🏓 **Arena** – Play a responsive pong-style survival game
- 📊 **Leaderboard** – Track and compare top scores with all players
- 👤 **Authentication** – Powered by **Clerk** for seamless user login
- 💾 **Persistent Scores** – High scores are stored in the database
- 📱 **Responsive UI** – Smooth gameplay on desktop and mobile
- ⚡ **Next.js App Router** – Modern, server-first architecture

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Auth:** [Clerk](https://clerk.com)
- **Database:** [Neon (Postgres)](https://neon.com)
- **Deployment:** [Vercel](https://vercel.com)

---

## 📂 Project Structure

```
app/
 ├── (game)/
 ├      ├── arena/page.tsx      # Game arena
 ├      ├── leaderboard/page.tsx  # Leaderboard display
 ├      ├── leaderboard/loading.tsx # Skeleton loader for leaderboard
components/
 ├── Navbar.tsx                  # Top navigation
 ├── Pong.tsx                    # Game component (canvas)
db/
 ├── queries.ts                  # Database queries (user & score handling)
```

---

## 🎮 Gameplay

- **Start**: Click/tap the game area
- **Controls (Desktop)**: Move mouse to control paddle
- **Controls (Mobile)**: Drag finger to control paddle
- **Goal**: Survive as long as possible and beat the high score!
