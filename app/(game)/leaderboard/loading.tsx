export default async function Loading() {
  const dummyboard = Array.from({ length: 10 });
  return (
    <main className="p-4 md:p-8">
      <h2 className="text-center text-5xl md:text-6xl font-bold">
        LEADERBOARD
      </h2>
      <div className="mt-12 flex flex-col gap-4 items-center">
        {dummyboard.map((player, index) => (
          <div
            key={index}
            className="relative w-full max-w-4xl flex justify-between items-center p-2 md:p-4 border border-neutral-200 rounded-lg shadow-sm animate-pulse"
          >
            <div className="relative size-8 md:size-16 shadow-md rounded-md bg-neutral-500" />

            <div className="w-56 md:w-xl h-10 md:h-16 rounded-lg bg-neutral-500 animate-pulse" />

            <div className="w-12 md:w-16 h-10 md:h-16 rounded-lg text-transparent bg-neutral-500 animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  );
}
