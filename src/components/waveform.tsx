interface WaveformProps {
  active?: boolean;
  bars?: number;
  className?: string;
}

export function Waveform({ active = true, bars = 28, className = "" }: WaveformProps) {
  return (
    <div className={`flex h-10 items-center gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{
            animationDelay: `${(i % 7) * 0.09}s`,
            animationDuration: `${0.9 + (i % 5) * 0.12}s`,
            animationPlayState: active ? "running" : "paused",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
