// Placeholder card shown in the catalog grid while results are loading.
// Mirrors ChipCard's exact structure (pin nubs, header, tags, footer) so
// the grid doesn't visibly reflow once real cards swap in.
export default function ChipCardSkeleton() {
  const pinsPerSide = 6;

  return (
    <div
      className="relative rounded-md bg-surface border border-white/5 p-5 animate-pulse"
      aria-hidden="true"
    >
      {/* left/right pin nubs, same as ChipCard */}
      <div className="absolute -left-[6px] top-5 flex flex-col gap-[7px]">
        {Array.from({ length: pinsPerSide }).map((_, i) => (
          <span key={i} className="pin-nub" />
        ))}
      </div>
      <div className="absolute -right-[6px] top-5 flex flex-col gap-[7px]">
        {Array.from({ length: pinsPerSide }).map((_, i) => (
          <span key={i} className="pin-nub" />
        ))}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded bg-white/10" />
          <div className="h-4 w-36 rounded bg-white/10" />
        </div>
        <div className="h-4 w-12 rounded bg-white/5 shrink-0" />
      </div>

      <div className="h-6 w-28 rounded mt-3 bg-white/5" />

      <div className="space-y-2 mt-3">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        <div className="h-5 w-12 rounded bg-white/5" />
        <div className="h-5 w-14 rounded bg-white/5" />
        <div className="h-5 w-10 rounded bg-white/5" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="h-3 w-16 rounded bg-white/5" />
        <div className="h-3 w-16 rounded bg-white/5" />
      </div>
    </div>
  );
}
