export default async function Loading() {
  const dummyboard = [0, 0, 0, 0, 0];
  return (
    <main>
      <div className="p-8">
        <h2 className="text-center text-6xl font-bold">LEADERBOARD</h2>
        <div className="mt-12 flex flex-col gap-4 items-center">
          {dummyboard.map((player, index) => (
            <div
              key={index}
              className="relative w-full max-w-4xl flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="relative size-8 md:size-16 shadow-md rounded-md bg-neutral-700" />

              <div className="relative text-4xl">
                {index + 1}. PLAYER {Math.floor(Math.random() * 100)}
              </div>
              <div className="text-6xl font-bold">
                {Math.floor(Math.random() * 100)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
