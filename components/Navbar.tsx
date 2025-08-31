import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="grid md:grid-cols-2 justify-center px-8 py-4 border-b border-neutral-200">
      <h2 className="text-center md:justify-self-start text-5xl md:text-3xl font-semibold">
        PONG WARS
      </h2>

      <nav className="flex justify-end items-center mt-8 md:mt-0 gap-8 font-inter font-semibold tracking-[0.2rem] text-neutral-500 ">
        <a href="/arena" className="hover:text-black transition duration-500">
          ARENA
        </a>
        <a
          href="/leaderboard"
          className="hover:text-black transition duration-500"
        >
          LEADERBOARD
        </a>
      </nav>

      <div className="absolute bottom-8 right-8">
        <UserButton
          appearance={{
            elements: {
              rootBox: "scale-150",
            },
          }}
        />
      </div>
    </header>
  );
}
