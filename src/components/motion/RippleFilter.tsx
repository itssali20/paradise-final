/** Water-ripple SVG filter used on image hover (`.ripple-hover`). */
export default function RippleFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="pc-ripple" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="3" result="noise">
          <animate attributeName="baseFrequency" dur="9s" values="0.008 0.03;0.012 0.045;0.008 0.03" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
