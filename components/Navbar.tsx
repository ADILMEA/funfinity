import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="grid grid-cols-3 justify px-8 py-4 border-b border-neutral-200">
      <h2 className="justify-self-start text-3xl">PONG WARS</h2>

      <ul className="flex justify-self-center gap-8 items-center font-inter font-semibold tracking-[0.2rem] text-neutral-500 ">
        <li className="hover:text-black transition duration-500">
          <a href="/arena">ARENA</a>
        </li>
        <li className="hover:text-black transition duration-500">
          <a href="/leaderboard">LEADERBOARD</a>
        </li>
      </ul>

      <div className="justify-self-end">
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
