import { useEffect, useRef } from "react";

// Plays a sequence of video sources back-to-back on one <video> element:
// when the current clip finishes, it swaps in the next source and keeps
// going, wrapping back to the first once the sequence completes — so the
// whole playlist reads as one continuous loop instead of a single clip
// repeating. The element must NOT have the `loop` attribute set, or the
// browser will just repeat the current clip and `ended` never fires.
export default function useSequentialVideo(sources) {
  const videoRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || sources.length === 0) return;

    indexRef.current = 0;

    const playCurrent = () => {
      el.src = sources[indexRef.current];
      el.load();
      // Autoplay can be blocked before user interaction on some browsers —
      // fail silently rather than throwing an unhandled rejection.
      el.play().catch(() => {});
    };

    const handleEnded = () => {
      indexRef.current = (indexRef.current + 1) % sources.length;
      playCurrent();
    };

    el.addEventListener("ended", handleEnded);
    playCurrent();

    return () => el.removeEventListener("ended", handleEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sources)]);

  return videoRef;
}
