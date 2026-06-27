export default function HeroCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 min-h-[350px]">
      <span className="text-sm text-zinc-400">
        FEATURED REVIEW
      </span>

      <h2 className="text-4xl font-bold text-white mt-4">
        Motorola Razr 70 Review
      </h2>

      <p className="text-zinc-400 mt-4 max-w-xl">
        Full review, specifications, performance,
        battery life and camera comparison.
      </p>
    </div>
  );
}