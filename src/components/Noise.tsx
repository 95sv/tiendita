"use client";

interface NoiseProps {
  opacity?: number;
  className?: string;
}

const Noise = ({ opacity = 0.03, className = "" }: NoiseProps) => {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] ${className}`}
      style={{
        opacity,
        mixBlendMode: "overlay",
      }}
    >
      <svg className="h-full w-full">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};

export default Noise;
