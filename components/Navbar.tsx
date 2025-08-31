import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="flex flex-col md:flex-row justify-center md:justify-between px-4 md:px-8 py-4 border-b border-neutral-200">
      <div className="flex justify-between md:justify-self-start gap-10">
        <h2 className="text-center text-5xl md:text-3xl font-semibold">
          PONG WARS
        </h2>
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "scale-150 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none",
            },
          }}
        />
      </div>

      <nav className="flex justify-center items-center mt-8 md:mt-0 gap-8 font-inter font-semibold tracking-[0.2rem] text-neutral-500 ">
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
    </header>
  );
}
