/**
 * Asicom wordmark — italic "Asicom" with the orbit (Brand Book §1).
 *
 * Monochrome by design: arcs + wordmark inherit `currentColor`, so set the colour with a text
 * utility — `text-white` on the gradient header, `text-asicom-mid` on white. Never recolour the
 * letters otherwise. The wordmark uses Instrument Sans (the loaded brand font) via --font-instrument.
 */
export function AsicomLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 360"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="Asicom"
    >
      <g transform="rotate(-7 600 190)">
        <path d="M 175 190 A 425 132 0 0 1 1025 190 A 425 115 0 0 0 175 190 Z" />
      </g>
      <g transform="rotate(-7 600 200)">
        <path d="M 175 200 A 425 126 0 0 0 1025 200 A 425 110 0 0 1 175 200 Z" />
      </g>
      <text
        x="600"
        y="252"
        textAnchor="middle"
        fontStyle="italic"
        fontWeight={700}
        fontSize={200}
        letterSpacing={2}
        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
      >
        Asicom
      </text>
    </svg>
  );
}
