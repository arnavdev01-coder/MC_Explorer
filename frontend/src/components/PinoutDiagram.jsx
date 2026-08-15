import { useState } from "react";

// Hex colors for SVG fills (can't use Tailwind arbitrary theme() colors
// inside raw SVG attributes reliably, so these are kept in sync with the
// PIN_TYPE_STYLES map used by the pinout table on the Detail page).
const PIN_COLORS = {
  power: "#00B8FF",
  ground: "#7F93B3",
  gpio: "#E8EEF7",
  adc: "#22D3EE",
  pwm: "#22D3EE",
  comm: "#5ED4FF",
  other: "#7F93B3",
};

const ROW_H = 28;
const LEG_LEN = 42;
const BODY_W = 156;
const PAD_TOP = 34;
const PAD_BOTTOM = 20;
const LABEL_W = 208;

// Renders a schematic DIP-style package: documented pins are split evenly
// left/right in datasheet order (left top-to-bottom, right bottom-to-top),
// same convention as a real dual in-line package. This is a schematic aid
// for wiring, not a physically exact silicon pinout — chips with dozens of
// undocumented pins are represented only by the pins captured in the table
// below.
export default function PinoutDiagram({ pins, activePin, onSelectPin }) {
  const [hovered, setHovered] = useState(null);

  if (!pins || pins.length === 0) return null;

  const half = Math.ceil(pins.length / 2);
  const left = pins.slice(0, half);
  const right = pins.slice(half).reverse();
  const rows = Math.max(left.length, right.length);

  const width = LABEL_W * 2 + LEG_LEN * 2 + BODY_W;
  const height = PAD_TOP + rows * ROW_H + PAD_BOTTOM;
  const bodyH = rows * ROW_H;
  const bodyX = LABEL_W + LEG_LEN;
  const bodyY = PAD_TOP;
  const cx = width / 2;

  const shown = hovered || (activePin ?? null);

  const renderPin = (p, i, side) => {
    const y = PAD_TOP + i * ROW_H + ROW_H / 2;
    const color = PIN_COLORS[p.pin_type] || PIN_COLORS.other;
    const isLeft = side === "left";
    const legX1 = isLeft ? bodyX : bodyX + BODY_W;
    const legX2 = isLeft ? bodyX - LEG_LEN : bodyX + BODY_W + LEG_LEN;
    const tipX = legX2;
    const isActive = shown && shown.pin_number === p.pin_number;

    return (
      <g
        key={`${side}-${p.pin_number}-${i}`}
        className="cursor-pointer"
        onMouseEnter={() => setHovered(p)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onSelectPin && onSelectPin(p)}
      >
        <line
          x1={legX1}
          y1={y}
          x2={legX2}
          y2={y}
          stroke={color}
          strokeWidth={isActive ? 3 : 1.75}
          opacity={isActive ? 1 : 0.75}
        />
        <rect
          x={tipX - (isLeft ? 7 : 0)}
          y={y - 3.5}
          width={7}
          height={7}
          fill={color}
          opacity={isActive ? 1 : 0.9}
        >
          <title>
            {p.pin_number} · {p.pin_name} ({p.pin_type}) — {p.description}
          </title>
        </rect>
        <text
          x={isLeft ? legX2 - 12 : legX2 + 12}
          y={y}
          dominantBaseline="middle"
          textAnchor={isLeft ? "end" : "start"}
          className="font-mono select-none"
          fontSize="11"
          fill={isActive ? "#E8EEF7" : "#7F93B3"}
        >
          {isLeft ? `${p.pin_name} · ${p.pin_number}` : `${p.pin_number} · ${p.pin_name}`}
        </text>
      </g>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          style={{ minWidth: Math.max(width * 0.62, 460) }}
          role="img"
          aria-label="Pinout diagram"
        >
          {/* chip body */}
          <rect
            x={bodyX}
            y={bodyY}
            width={BODY_W}
            height={bodyH}
            rx="6"
            fill="#0B1424"
            stroke="#38BDF8"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          {/* pin-1 notch */}
          <circle cx={bodyX + 18} cy={bodyY + 16} r="4" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          {/* legs + labels */}
          {left.map((p, i) => renderPin(p, i, "left"))}
          {right.map((p, i) => renderPin(p, i, "right"))}
        </svg>
      </div>

      <div className="mt-3 min-h-[2.5rem] rounded-md border border-white/5 bg-board/60 px-4 py-2.5">
        {shown ? (
          <p className="font-mono text-xs text-silk">
            <span className="text-flare">{shown.pin_number}</span>{" "}
            <span className="text-copperLight">{shown.pin_name}</span>{" "}
            <span className="text-muted">— {shown.description}</span>
          </p>
        ) : (
          <p className="font-mono text-xs text-muted">Hover or tap a pin for details.</p>
        )}
      </div>
    </div>
  );
}
