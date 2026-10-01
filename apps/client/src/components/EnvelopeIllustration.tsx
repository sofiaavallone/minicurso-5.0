const TILT = -5.6;
const RULED_LINES = [52, 106, 160, 214, 268, 322, 376];

function sparkle(cx: number, cy: number, r: number) {
  const k = 0.12 * r;
  const m = 0.3 * r;
  return [
    `M${cx} ${cy - r}`,
    `C${cx + k} ${cy - m} ${cx + m} ${cy - k} ${cx + r} ${cy}`,
    `C${cx + m} ${cy + k} ${cx + k} ${cy + m} ${cx} ${cy + r}`,
    `C${cx - k} ${cy + m} ${cx - m} ${cy + k} ${cx - r} ${cy}`,
    `C${cx - m} ${cy - k} ${cx - k} ${cy - m} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
}

const ENVELOPE_BODY =
  "M163 293 L757 232 Q775 230 777 248 L816 622 Q818 640 800 643 L203 703 Q185 705 183 687 L147 313 Q145 295 163 293 Z";

export function EnvelopeIllustration() {
  return (
    <div className="mx-auto w-full max-w-[580px] lg:-mr-12 lg:ml-auto">
      <svg viewBox="0 0 1030 798" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <clipPath id="envelope-body">
            <path d={ENVELOPE_BODY} />
          </clipPath>
          <linearGradient id="back-flap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8508C" />
            <stop offset="1" stopColor="#C9336E" />
          </linearGradient>
          <radialGradient id="big-sparkle" cx="0.4" cy="0.35" r="0.65">
            <stop offset="0" stopColor="#fbd3e4" />
            <stop offset="0.45" stopColor="#ec7aa8" />
            <stop offset="1" stopColor="#d6336c" />
          </radialGradient>
          <filter id="letter-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6b1650" floodOpacity="0.12" />
          </filter>
        </defs>

        <ellipse
          cx="492"
          cy="466"
          rx="432"
          ry="165"
          transform="rotate(-12 492 466)"
          stroke="#f0a0c0"
          strokeWidth="4"
          strokeDasharray="10 10"
          strokeLinecap="round"
        />

        <path d={ENVELOPE_BODY} transform="translate(4 5)" fill="#FFC4DC" />
        <path d={ENVELOPE_BODY} fill="#C9336E" />
        <path d="M145 295 L437 50 L775 230 Z" fill="url(#back-flap)" strokeLinejoin="round" />

        <g transform={`translate(178 130) rotate(${TILT})`} filter="url(#letter-shadow)">
          <rect width="530" height="440" rx="12" fill="#ffffff" />
          {RULED_LINES.map((y) => (
            <line key={y} x1="0" y1={y} x2="530" y2={y} stroke="#f0d9e3" strokeWidth="2" />
          ))}
          <text x="44" y="108" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="52" fill="#6b1650">
            Querida eu do futuro,
          </text>
          <rect x="44" y="139" width="354" height="16" rx="8" fill="#e8c3d6" />
          <rect x="44" y="183" width="270" height="14" rx="7" fill="#e8c3d6" />
        </g>

        <g clipPath="url(#envelope-body)">
          <path d="M100 280 L483 472 L150 760 Z" fill="#FF6BA8" />
          <path d="M820 210 L483 472 L860 660 Z" fill="#FF6BA8" />
          <path d="M150 760 L483 472 L860 660 L860 800 L150 800 Z" fill="#FF8FBE" />
        </g>

        <circle cx="482" cy="475" r="66" fill="#FFA27A" opacity="0.55" />
        <circle cx="482" cy="475" r="54" fill="#FF6419" />
        <path d={sparkle(482, 475, 17)} fill="#1a1a1a" />

        <g transform={`translate(660 485) rotate(${TILT})`}>
          <rect
            x="0"
            y="0"
            width="122"
            height="138"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.1 8"
          />
          <rect x="10" y="10" width="102" height="118" fill="#fdf2f7" />
          <text x="61" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="500" fontSize="19">
            <tspan fill="#FF6419">✦</tspan>
            <tspan fill="#d6336c">&lt;div&gt;</tspan>
            <tspan fill="#FF6419">a</tspan>
          </text>
        </g>

        <path d={sparkle(140, 182, 46)} fill="#FF6419" />
        <path d={sparkle(790, 146, 109)} fill="url(#big-sparkle)" />
        <path d={sparkle(803, 735, 30)} fill="#d6336c" />
      </svg>
    </div>
  );
}
