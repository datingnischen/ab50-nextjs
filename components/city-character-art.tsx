import type { ReactNode } from "react";
import { cityArtAltText, getCityArt, type CityArtPalette } from "@/lib/city-art";

export type { CityArtFileVariant } from "@/lib/city-art";

/**
 * Selbst gezeichnete Stadtgrafiken ("Stadtporträts").
 *
 * Jede Stadt bekommt eine eigene Szene mit ihren Wahrzeichen, gezeichnet in einer
 * gemeinsamen Bühne von 1000 x 300 Einheiten mit der Grundlinie bei y = 300.
 * Der Rahmen (Himmel, Sonne, Wasser/Wiese, Spiegelung, Textband) setzt diese Bühne
 * je nach Variante anders: quer für die Kachel, hochformatig für den Artikelkopf.
 */

const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const GROUND = 300;

type Pal = CityArtPalette;
type RoofKind = "pyramid" | "spire" | "onion" | "dome" | "crenel" | "hip" | "flat";

function r2(value: number) {
  return Math.round(value * 100) / 100;
}

function noise(seed: number) {
  return r2(Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1);
}

/* ------------------------------------------------------------------ Bausteine */

function Windows({ x, y, w, h, cols, rows, fill = "rgba(255,255,255,.24)" }: {
  x: number; y: number; w: number; h: number; cols: number; rows: number; fill?: string;
}) {
  const ww = w / (cols * 2 + 1);
  const wh = Math.min(ww * 1.5, h / (rows * 2 + 1));
  const gapX = (w - cols * ww) / (cols + 1);
  const gapY = (h - rows * wh) / (rows + 1.4);
  const out: ReactNode[] = [];
  for (let c = 0; c < cols; c += 1) {
    for (let rIdx = 0; rIdx < rows; rIdx += 1) {
      out.push(
        <rect
          key={`${c}-${rIdx}`}
          x={r2(x + gapX + c * (ww + gapX))}
          y={r2(y + gapY * 1.1 + rIdx * (wh + gapY))}
          width={r2(ww)}
          height={r2(wh)}
          rx={r2(ww * 0.4)}
        />,
      );
    }
  }
  return <g fill={fill}>{out}</g>;
}

function Roof({ kind, x, w, top, h, fill }: {
  kind: RoofKind; x: number; w: number; top: number; h: number; fill: string;
}) {
  const cx = r2(x + w / 2);
  switch (kind) {
    case "flat":
      return null;
    case "hip":
      return (
        <path
          d={`M${x - 5} ${top} L${r2(x + w * 0.26)} ${r2(top - h)} L${r2(x + w * 0.74)} ${r2(top - h)} L${x + w + 5} ${top} Z`}
          fill={fill}
        />
      );
    case "dome":
      return (
        <g>
          <path d={`M${x} ${top} A ${r2(w / 2)} ${h} 0 0 1 ${x + w} ${top} Z`} fill={fill} />
          <rect x={r2(cx - 5)} y={r2(top - h - 16)} width={10} height={18} rx={4} fill={fill} />
          <circle cx={cx} cy={r2(top - h - 21)} r={5} fill={fill} />
        </g>
      );
    case "onion":
      return (
        <g>
          <path
            d={
              `M${x} ${top} ` +
              `C${r2(x - w * 0.14)} ${r2(top - h * 0.46)} ${r2(x + w * 0.24)} ${r2(top - h * 0.58)} ${cx} ${r2(top - h * 0.92)} ` +
              `C${r2(x + w * 0.76)} ${r2(top - h * 0.58)} ${r2(x + w * 1.14)} ${r2(top - h * 0.46)} ${x + w} ${top} Z`
            }
            fill={fill}
          />
          <path d={`M${cx} ${r2(top - h * 0.9)} L${r2(cx - 3)} ${r2(top - h * 1.02)} L${cx} ${r2(top - h * 1.2)} L${r2(cx + 3)} ${r2(top - h * 1.02)} Z`} fill={fill} />
        </g>
      );
    case "crenel":
      return (
        <g>
          <rect x={r2(x - 4)} y={r2(top - 12)} width={r2(w + 8)} height={12} fill={fill} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={r2(x - 4 + i * ((w + 8) / 4) + 2)} y={r2(top - 22)} width={r2((w + 8) / 8)} height={11} fill={fill} />
          ))}
          <path d={`M${r2(x - 6)} ${r2(top - 22)} L${r2(x - 2)} ${r2(top - 44)} L${r2(x + 2)} ${r2(top - 22)} Z`} fill={fill} />
          <path d={`M${r2(x + w - 2)} ${r2(top - 22)} L${r2(x + w + 2)} ${r2(top - 44)} L${r2(x + w + 6)} ${r2(top - 22)} Z`} fill={fill} />
        </g>
      );
    case "spire":
      return (
        <g>
          <path d={`M${r2(x - 5)} ${top} L${cx} ${r2(top - h)} L${r2(x + w + 5)} ${top} Z`} fill={fill} />
          <circle cx={cx} cy={r2(top - h - 8)} r={4} fill={fill} />
        </g>
      );
    case "pyramid":
    default:
      return <path d={`M${r2(x - 5)} ${top} L${cx} ${r2(top - h)} L${r2(x + w + 5)} ${top} Z`} fill={fill} />;
  }
}

function Tower({ x, w, h, roof = "pyramid", roofH = 42, fill, roofFill, cols = 2, rows = 3, base = GROUND, band, cornice }: {
  x: number; w: number; h: number; roof?: RoofKind; roofH?: number;
  fill: string; roofFill: string; cols?: number; rows?: number; base?: number; band?: string; cornice?: string;
}) {
  const top = r2(base - h);
  return (
    <g>
      <rect x={x} y={top} width={w} height={r2(h)} fill={fill} />
      {band ? <rect x={r2(x - 3)} y={r2(top + h * 0.2)} width={r2(w + 6)} height={6} fill={band} /> : null}
      {cornice ? <rect x={r2(x - 7)} y={top} width={r2(w + 14)} height={13} fill={cornice} /> : null}
      <Roof kind={roof} x={x} w={w} top={top} h={roofH} fill={roofFill} />
      <Windows x={x} y={top} w={w} h={r2(h)} cols={cols} rows={rows} />
    </g>
  );
}

function Nave({ x, w, h, fill, roofFill, base = GROUND, roofH = 26 }: {
  x: number; w: number; h: number; fill: string; roofFill: string; base?: number; roofH?: number;
}) {
  const top = r2(base - h);
  return (
    <g>
      <rect x={x} y={top} width={w} height={r2(h)} fill={fill} />
      <path d={`M${r2(x - 6)} ${top} L${r2(x + w / 2)} ${r2(top - roofH)} L${r2(x + w + 6)} ${top} Z`} fill={roofFill} />
      <Windows x={x} y={top} w={w} h={r2(h)} cols={4} rows={1} />
    </g>
  );
}

function HouseRow({ x, w, count, h, fill, roofFill, base = GROUND, seed = 1, gable = "plain" }: {
  x: number; w: number; count: number; h: number; fill: string; roofFill: string;
  base?: number; seed?: number; gable?: "plain" | "stepped" | "curved";
}) {
  const unit = w / count;
  const out: ReactNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const hx = r2(x + i * unit);
    const hh = r2(h * (0.76 + noise(seed + i) * 0.46));
    const top = r2(base - hh);
    const roofH = r2(unit * 0.52);
    out.push(
      <g key={i}>
        <rect x={hx} y={top} width={r2(unit + 1)} height={hh} fill={i % 2 ? fill : roofFill} opacity={i % 2 ? 1 : 0.86} />
        {gable === "stepped" ? (
          <path
            d={
              `M${hx} ${top} L${hx} ${r2(top - roofH * 0.4)} L${r2(hx + unit * 0.22)} ${r2(top - roofH * 0.4)} ` +
              `L${r2(hx + unit * 0.22)} ${r2(top - roofH * 0.72)} L${r2(hx + unit * 0.5)} ${r2(top - roofH)} ` +
              `L${r2(hx + unit * 0.78)} ${r2(top - roofH * 0.72)} L${r2(hx + unit * 0.78)} ${r2(top - roofH * 0.4)} ` +
              `L${r2(hx + unit + 1)} ${r2(top - roofH * 0.4)} L${r2(hx + unit + 1)} ${top} Z`
            }
            fill={roofFill}
          />
        ) : gable === "curved" ? (
          <path
            d={
              `M${r2(hx - 2)} ${top} Q${r2(hx + unit * 0.5)} ${r2(top - roofH * 1.5)} ${r2(hx + unit + 3)} ${top} Z`
            }
            fill={roofFill}
          />
        ) : (
          <path d={`M${r2(hx - 3)} ${top} L${r2(hx + unit * 0.5)} ${r2(top - roofH)} L${r2(hx + unit + 4)} ${top} Z`} fill={roofFill} />
        )}
        <Windows x={hx} y={top} w={r2(unit)} h={hh} cols={2} rows={2} />
      </g>,
    );
  }
  return <>{out}</>;
}

function Bridge({ x1, x2, y, arches, fill, base = GROUND, covered, roofFill, kind = "arch", uid = "b" }: {
  x1: number; x2: number; y: number; arches: number; fill: string;
  base?: number; covered?: boolean; roofFill?: string; kind?: "arch" | "piles"; uid?: string;
}) {
  const span = (x2 - x1) / arches;

  if (kind === "piles") {
    const piles: ReactNode[] = [];
    for (let i = 0; i <= arches; i += 1) {
      const px = r2(x1 + i * span);
      piles.push(<rect key={`p${i}`} x={r2(px - 5)} y={y} width={10} height={r2(base - y)} fill={fill} />);
    }
    return (
      <g>
        {piles}
        <rect x={x1} y={r2(y - 9)} width={r2(x2 - x1)} height={11} fill={fill} />
        {covered && roofFill ? (
          <g>
            <rect x={r2(x1 - 4)} y={r2(y - 36)} width={r2(x2 - x1 + 8)} height={27} fill={fill} opacity=".92" />
            {Array.from({ length: arches * 2 }).map((_, i) => (
              <rect key={i} x={r2(x1 + (i + 0.5) * (span / 2) - 2)} y={r2(y - 34)} width={4} height={23} fill="rgba(255,255,255,.18)" />
            ))}
            <path d={`M${r2(x1 - 12)} ${r2(y - 36)} L${r2(x1 + (x2 - x1) * 0.5)} ${r2(y - 54)} L${r2(x2 + 12)} ${r2(y - 36)} Z`} fill={roofFill} />
          </g>
        ) : null}
      </g>
    );
  }

  const maskId = `${uid}-arch`;
  const bodyH = r2(base - y);
  const rx = r2(span * 0.36);
  const ry = r2(Math.min(span * 0.4, bodyH * 0.74));
  return (
    <g>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect x={r2(x1 - 12)} y={r2(y - 16)} width={r2(x2 - x1 + 24)} height={r2(bodyH + 22)} fill="#ffffff" />
          {Array.from({ length: arches }).map((_, i) => {
            const cx = r2(x1 + span * (i + 0.5));
            return (
              <path
                key={i}
                d={`M${r2(cx - rx)} ${r2(base + 6)} L${r2(cx - rx)} ${r2(base - ry)} A ${rx} ${rx} 0 0 1 ${r2(cx + rx)} ${r2(base - ry)} L${r2(cx + rx)} ${r2(base + 6)} Z`}
                fill="#000000"
              />
            );
          })}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect x={x1} y={y} width={r2(x2 - x1)} height={bodyH} fill={fill} />
      </g>
      <rect x={r2(x1 - 8)} y={r2(y - 12)} width={r2(x2 - x1 + 16)} height={13} fill={fill} />
      {Array.from({ length: arches * 3 + 1 }).map((_, i) => (
        <rect key={i} x={r2(x1 - 6 + i * ((x2 - x1 + 12) / (arches * 3))) } y={r2(y - 22)} width={4} height={11} rx={1.5} fill={fill} opacity=".85" />
      ))}
    </g>
  );
}

function Conifer({ x, h, fill, base = GROUND }: { x: number; h: number; fill: string; base?: number }) {
  const w = r2(h * 0.46);
  return (
    <g>
      <rect x={r2(x - 2.5)} y={r2(base - h * 0.16)} width={5} height={r2(h * 0.16)} fill={fill} />
      {[0, 1, 2].map((i) => {
        const level = r2(base - h * (0.16 + i * 0.26));
        const scale = 1 - i * 0.22;
        return (
          <path
            key={i}
            d={`M${r2(x - (w / 2) * scale)} ${level} L${x} ${r2(level - h * 0.36)} L${r2(x + (w / 2) * scale)} ${level} Z`}
            fill={fill}
          />
        );
      })}
    </g>
  );
}

function Broadleaf({ x, h, fill, base = GROUND }: { x: number; h: number; fill: string; base?: number }) {
  const crown = r2(h * 0.42);
  const cy = r2(base - h + crown * 0.8);
  return (
    <g>
      <rect x={r2(x - 3)} y={r2(cy)} width={6} height={r2(base - cy)} fill={fill} />
      <circle cx={x} cy={cy} r={crown} fill={fill} />
      <circle cx={r2(x - crown * 0.7)} cy={r2(cy + crown * 0.4)} r={r2(crown * 0.66)} fill={fill} />
      <circle cx={r2(x + crown * 0.7)} cy={r2(cy + crown * 0.36)} r={r2(crown * 0.6)} fill={fill} />
    </g>
  );
}

function Palm({ x, h, fill, base = GROUND, lean = 1 }: { x: number; h: number; fill: string; base?: number; lean?: number }) {
  const topX = r2(x + 16 * lean);
  const topY = r2(base - h);
  const fronds = [-1, -0.66, -0.3, 0.3, 0.66, 1];
  return (
    <g>
      <path
        d={`M${r2(x - 7)} ${base} Q${r2(x + 5 * lean)} ${r2(base - h * 0.55)} ${r2(topX - 5)} ${topY} L${r2(topX + 8)} ${r2(topY + 4)} Q${r2(x + 16 * lean)} ${r2(base - h * 0.5)} ${r2(x + 7)} ${base} Z`}
        fill={fill}
      />
      {fronds.map((dir, i) => {
        const a = Math.abs(dir);
        return (
          <path
            key={i}
            d={
              `M${topX} ${r2(topY + 4)} ` +
              `C${r2(topX + dir * 26)} ${r2(topY - 28 + a * 8)} ${r2(topX + dir * 56)} ${r2(topY - 16 + a * 18)} ${r2(topX + dir * 70)} ${r2(topY + 18 + a * 24)} ` +
              `C${r2(topX + dir * 46)} ${r2(topY + 2 + a * 6)} ${r2(topX + dir * 20)} ${r2(topY + 12)} ${topX} ${r2(topY + 14)} Z`
            }
            fill={fill}
            opacity={r2(0.82 + a * 0.18)}
          />
        );
      })}
      <circle cx={topX} cy={r2(topY + 9)} r={6} fill={fill} />
    </g>
  );
}

function Boat({ x, y, scale = 1, fill, sail }: { x: number; y: number; scale?: number; fill: string; sail?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {sail ? (
        <>
          <path d={`M0 -6 L0 -52 L26 -6 Z`} fill={sail} />
          <path d={`M-4 -6 L-4 -40 L-20 -6 Z`} fill={sail} opacity=".75" />
        </>
      ) : null}
      <path d="M-30 -6 L32 -6 L22 6 L-20 6 Z" fill={fill} />
    </g>
  );
}

function Swan({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={17} ry={7} fill={fill} />
      <path d="M8 -3 Q16 -10 13 -20 Q12 -26 19 -27 L22 -23 Q17 -22 18 -17 Q20 -6 10 1 Z" fill={fill} />
    </g>
  );
}

function ClockFace({ cx, cy, r, ring, face, hands }: {
  cx: number; cy: number; r: number; ring: string; face: string; hands: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={ring} />
      <circle cx={cx} cy={cy} r={r2(r * 0.8)} fill={face} />
      {[0, 3, 6, 9].map((tick) => {
        const angle = (tick / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={tick}
            cx={r2(cx + Math.cos(angle) * r * 0.62)}
            cy={r2(cy + Math.sin(angle) * r * 0.62)}
            r={r2(Math.max(1.2, r * 0.06))}
            fill={hands}
          />
        );
      })}
      <rect x={r2(cx - r * 0.06)} y={r2(cy - r * 0.55)} width={r2(r * 0.12)} height={r2(r * 0.6)} rx={r2(r * 0.06)} fill={hands} />
      <rect x={r2(cx - r * 0.06)} y={r2(cy - r * 0.06)} width={r2(r * 0.46)} height={r2(r * 0.12)} rx={r2(r * 0.06)} fill={hands} />
    </g>
  );
}

function Gear({ cx, cy, r, fill, teeth = 12 }: { cx: number; cy: number; r: number; fill: string; teeth?: number }) {
  const items: ReactNode[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const angle = (i / teeth) * Math.PI * 2;
    items.push(
      <rect
        key={i}
        x={r2(cx - r * 0.09)}
        y={r2(cy - r - r * 0.2)}
        width={r2(r * 0.18)}
        height={r2(r * 0.26)}
        rx={r2(r * 0.05)}
        fill={fill}
        transform={`rotate(${r2((angle * 180) / Math.PI)} ${cx} ${cy})`}
      />,
    );
  }
  return (
    <g>
      {items}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={fill} strokeWidth={r2(r * 0.16)} />
    </g>
  );
}

function VineRows({ x, y, w, h, rows, fill }: { x: number; y: number; w: number; h: number; rows: number; fill: string }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < rows; i += 1) {
    const ry = r2(y + (i * h) / rows);
    out.push(<rect key={i} x={r2(x + i * 5)} y={ry} width={r2(w - i * 10)} height={3} rx={1.5} fill={fill} opacity={r2(0.3 + i * 0.08)} />);
  }
  return <>{out}</>;
}

function Heart({ x, y, size, fill, opacity = 1 }: { x: number; y: number; size: number; fill: string; opacity?: number }) {
  const s = size / 24;
  return (
    <path
      transform={`translate(${x} ${y}) scale(${r2(s)})`}
      d="M12 21s-8.4-5.3-10.3-10A6 6 0 0 1 12 6.2 6 6 0 0 1 22.3 11C20.4 15.7 12 21 12 21Z"
      fill={fill}
      opacity={opacity}
    />
  );
}

/* --------------------------------------------------------------------- Szenen */

const SCENES: Record<string, (p: Pal, uid: string) => ReactNode> = {
  zuerich: (p) => (
    <>
      <path d="M0 300 L0 214 C140 180 300 200 420 182 C560 162 760 192 1000 172 L1000 300 Z" fill={p.far} opacity=".5" />
      <HouseRow x={10} w={250} count={7} h={78} fill={p.wall} roofFill={p.roof} seed={3} />
      <HouseRow x={700} w={290} count={8} h={74} fill={p.wall} roofFill={p.roof} seed={9} />
      <Tower x={262} w={52} h={158} roof="spire" roofH={56} fill={p.wall} roofFill={p.wallDark} rows={2} />
      <ClockFace cx={288} cy={172} r={19} ring={p.wallDark} face={p.sunGlow} hands={p.wallDark} />
      <Nave x={386} w={166} h={118} fill={p.wallDark} roofFill={p.roof} roofH={40} />
      <Tower x={382} w={58} h={196} roof="dome" roofH={30} fill={p.wall} roofFill={p.wallDark} cornice={p.wallDark} />
      <Tower x={494} w={58} h={196} roof="dome" roofH={30} fill={p.wall} roofFill={p.wallDark} cornice={p.wallDark} />
      <Tower x={604} w={38} h={224} roof="spire" roofH={78} fill={p.wall} roofFill={p.accent} cols={1} rows={4} />
      <Boat x={170} y={300} scale={0.8} fill={p.wallDark} sail={p.sunGlow} />
      <Conifer x={648} h={78} fill={p.wallDark} />
      <Conifer x={676} h={58} fill={p.wallDark} />
    </>
  ),

  genf: (p) => (
    <>
      <path d="M560 300 L700 108 L760 168 L830 74 L1000 300 Z" fill={p.far} opacity=".75" />
      <path d="M700 108 L742 154 L760 138 L716 92 Z M830 74 L880 136 L900 118 L846 60 Z" fill="#ffffff" opacity=".8" />
      <path d="M0 300 L0 196 C110 168 220 186 330 214 C400 232 440 262 470 300 Z" fill={p.mid} />
      <Nave x={118} w={118} h={92} fill={p.wallDark} roofFill={p.wall} base={218} roofH={24} />
      <Tower x={110} w={44} h={152} roof="spire" roofH={44} fill={p.wall} roofFill={p.wallDark} base={218} />
      <Tower x={196} w={44} h={152} roof="spire" roofH={44} fill={p.wall} roofFill={p.wallDark} base={218} />
      <Tower x={152} w={36} h={186} roof="spire" roofH={62} fill={p.wallDark} roofFill={p.accent} cols={1} rows={3} base={218} />
      <HouseRow x={300} w={200} count={6} h={64} fill={p.wall} roofFill={p.wallDark} seed={5} />
      <path d="M690 300 C686 210 694 120 704 30 C712 118 718 208 716 300 Z" fill="#ffffff" opacity=".86" />
      <path d="M704 30 C700 16 706 6 708 0 C712 10 714 20 710 32 Z" fill="#ffffff" opacity=".7" />
      <ellipse cx={703} cy={288} rx={44} ry={14} fill="#ffffff" opacity=".45" />
      <ellipse cx={712} cy={116} rx={13} ry={26} fill="#ffffff" opacity=".4" />
      <Boat x={470} y={300} scale={0.9} fill={p.wallDark} sail="#ffffff" />
      <Boat x={880} y={296} scale={0.62} fill={p.wallDark} sail="#ffffff" />
      <g>
        <circle cx={70} cy={264} r={34} fill={p.accent} opacity=".9" />
        <circle cx={70} cy={264} r={25} fill={p.sunGlow} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2;
          return <circle key={i} cx={r2(70 + Math.cos(a) * 34)} cy={r2(264 + Math.sin(a) * 34)} r={7} fill={p.roof} />;
        })}
        <rect x={68} y={246} width={4} height={20} rx={2} fill={p.wallDark} />
        <rect x={68} y={262} width={16} height={4} rx={2} fill={p.wallDark} />
      </g>
    </>
  ),

  basel: (p, uid) => (
    <>
      <path d="M0 300 L0 218 C180 188 380 206 560 186 C740 166 880 190 1000 176 L1000 300 Z" fill={p.far} opacity=".48" />
      <HouseRow x={620} w={180} count={5} h={76} fill={p.wall} roofFill={p.roof} seed={4} />
      <Nave x={452} w={156} h={120} fill={p.wallDark} roofFill={p.roof} roofH={34} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${r2(458 + i * 26)} 180 l13 -16 l13 16 Z`}
          fill={p.roofDark}
          opacity=".85"
        />
      ))}
      <Tower x={440} w={54} h={216} roof="spire" roofH={72} fill={p.roof} roofFill={p.roofDark} rows={4} />
      <Tower x={566} w={54} h={216} roof="spire" roofH={72} fill={p.roof} roofFill={p.roofDark} rows={4} />
      <g>
        <rect x={812} y={40} width={74} height={260} fill={p.wall} />
        <rect x={830} y={12} width={56} height={30} fill={p.wallDark} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={816} y={r2(56 + i * 30)} width={66} height={12} rx={3} fill="rgba(255,255,255,.22)" />
        ))}
      </g>
      <HouseRow x={0} w={180} count={5} h={86} fill={p.wall} roofFill={p.roof} seed={11} base={262} />
      <Bridge x1={-10} y={258} x2={430} arches={5} fill={p.wallDark} uid={uid} />
      <Tower x={228} w={26} h={56} roof="pyramid" roofH={22} fill={p.wallDark} roofFill={p.roofDark} base={250} cols={1} rows={1} />
      <Boat x={498} y={296} scale={0.7} fill={p.wallDark} />
    </>
  ),

  bern: (p) => (
    <>
      <path d="M0 300 L0 212 C160 184 340 204 520 184 C700 164 860 186 1000 170 L1000 300 Z" fill={p.far} opacity=".45" />
      <HouseRow x={20} w={260} count={8} h={84} fill={p.wall} roofFill={p.roof} seed={2} />
      <HouseRow x={690} w={220} count={7} h={78} fill={p.wall} roofFill={p.roof} seed={6} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${r2(24 + i * 32)} 300 l0 -20 a12 12 0 0 1 24 0 l0 20 Z`} fill={p.wallDark} opacity=".55" />
      ))}
      <g>
        <rect x={300} y={150} width={96} height={150} fill={p.wall} />
        <path d="M294 150 L325 108 L371 108 L402 150 Z" fill={p.roof} />
        <rect x={338} y={86} width={20} height={24} rx={4} fill={p.wallDark} />
        <ClockFace cx={348} cy={192} r={30} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
        <Windows x={306} y={224} w={84} h={70} cols={3} rows={1} />
      </g>
      <Nave x={540} w={124} h={124} fill={p.wallDark} roofFill={p.roof} roofH={30} />
      <Tower x={566} w={62} h={254} roof="spire" roofH={94} fill={p.wall} roofFill={p.wallDark} rows={4} />
      <g>
        <rect x={826} y={198} width={124} height={102} fill={p.wallDark} />
        <path d="M852 198 A36 34 0 0 1 924 198 Z" fill={p.accent} opacity=".8" />
        <rect x={884} y={148} width={8} height={18} fill={p.accent} />
      </g>
    </>
  ),

  lausanne: (p) => (
    <>
      <path d="M470 300 L620 152 L700 206 L800 132 L1000 300 Z" fill={p.far} opacity=".65" />
      <path d="M0 300 L0 126 C160 140 330 194 500 240 C660 282 840 288 1000 288 L1000 300 Z" fill={p.mid} />
      <Nave x={150} w={128} h={96} fill={p.wallDark} roofFill={p.roof} base={168} roofH={26} />
      <Tower x={140} w={42} h={144} roof="spire" roofH={38} fill={p.wall} roofFill={p.wallDark} base={168} />
      <Tower x={196} w={54} h={206} roof="spire" roofH={72} fill={p.wall} roofFill={p.accent} base={168} rows={4} />
      <HouseRow x={290} w={200} count={6} h={72} fill={p.wall} roofFill={p.roof} base={244} seed={7} />
      <HouseRow x={470} w={230} count={7} h={66} fill={p.wall} roofFill={p.roof} base={286} seed={11} />
      <g>
        <rect x={766} y={286} width={180} height={8} fill={p.wallDark} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={r2(782 + i * 52)} y={294} width={7} height={6} fill={p.wallDark} />
        ))}
        <rect x={930} y={246} width={5} height={42} fill={p.wallDark} />
        <circle cx={932} cy={242} r={7} fill={p.sunGlow} />
      </g>
      <Boat x={660} y={300} scale={0.85} fill={p.wallDark} sail="#ffffff" />
      <Conifer x={120} h={70} fill={p.wallDark} base={218} />
    </>
  ),

  winterthur: (p) => (
    <>
      <path d="M0 300 L0 218 C170 186 360 208 540 190 C720 172 860 196 1000 182 L1000 300 Z" fill={p.far} opacity=".5" />
      <Nave x={410} w={126} h={104} fill={p.wallDark} roofFill={p.roof} roofH={28} />
      <Tower x={396} w={48} h={192} roof="spire" roofH={64} fill={p.wall} roofFill={p.roofDark} rows={4} />
      <Tower x={500} w={48} h={192} roof="spire" roofH={64} fill={p.wall} roofFill={p.roofDark} rows={4} />
      <g>
        <rect x={618} y={212} width={286} height={88} fill={p.roofDark} />
        <rect x={618} y={272} width={286} height={28} fill={p.wallDark} opacity=".5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${r2(618 + i * 58)} 212 L${r2(618 + i * 58)} 184 L${r2(676 + i * 58)} 212 Z`} fill={p.wallDark} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`g${i}`} d={`M${r2(621 + i * 58)} 210 L${r2(621 + i * 58)} 190 L${r2(649 + i * 58)} 203 Z`} fill="rgba(255,255,255,.34)" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={`w${i}`} x={r2(632 + i * 38)} y={232} width={22} height={32} rx={4} fill="rgba(255,255,255,.3)" />
        ))}
        <rect x={862} y={56} width={24} height={244} fill={p.roofDark} />
        <rect x={857} y={50} width={34} height={13} rx={3} fill={p.wallDark} />
        <rect x={862} y={98} width={24} height={10} fill="rgba(255,255,255,.55)" />
        <rect x={862} y={122} width={24} height={10} fill="rgba(255,255,255,.55)" />
      </g>
      <HouseRow x={190} w={190} count={6} h={72} fill={p.wall} roofFill={p.roof} seed={8} />
      <Broadleaf x={108} h={104} fill={p.accent} />
      <Broadleaf x={186} h={76} fill={p.accent} />
      <Broadleaf x={956} h={86} fill={p.accent} />
    </>
  ),

  "st-gallen": (p) => (
    <>
      <path d="M0 300 L0 196 C170 156 340 190 520 168 C700 146 860 184 1000 156 L1000 300 Z" fill={p.far} opacity=".55" />
      <path d="M0 300 L0 248 C200 216 400 252 620 238 C800 226 900 250 1000 240 L1000 300 Z" fill={p.mid} opacity=".6" />
      <g>
        <rect x={404} y={192} width={192} height={108} fill={p.wallDark} />
        <path d="M444 192 A56 48 0 0 1 556 192 Z" fill={p.roof} />
        <rect x={494} y={126} width={12} height={22} rx={4} fill={p.roof} />
        <circle cx={500} cy={120} r={7} fill={p.accent} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${r2(420 + i * 34)} 300 L${r2(420 + i * 34)} 250 a11 11 0 0 1 22 0 L${r2(442 + i * 34)} 300 Z`} fill="rgba(255,255,255,.22)" />
        ))}
      </g>
      <Tower x={358} w={54} h={182} roof="onion" roofH={48} fill={p.wall} roofFill={p.roofDark} rows={3} />
      <Tower x={588} w={54} h={182} roof="onion" roofH={48} fill={p.wall} roofFill={p.roofDark} rows={3} />
      <g>
        <rect x={214} y={214} width={148} height={86} fill={p.wall} />
        <path d="M208 214 L288 186 L368 214 Z" fill={p.roofDark} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${r2(228 + i * 34)} 300 L${r2(228 + i * 34)} 248 a10 10 0 0 1 20 0 L${r2(248 + i * 34)} 300 Z`} fill="rgba(255,255,255,.24)" />
        ))}
      </g>
      <HouseRow x={660} w={230} count={7} h={70} fill={p.wall} roofFill={p.roof} seed={12} />
      <Conifer x={88} h={112} fill={p.roofDark} />
      <Conifer x={140} h={84} fill={p.roofDark} />
      <Conifer x={930} h={98} fill={p.roofDark} />
      <ellipse cx={130} cy={292} rx={96} ry={13} fill={p.water2} opacity=".7" />
    </>
  ),

  lugano: (p) => (
    <>
      <path d="M0 300 L0 202 L150 74 L300 190 L380 300 Z" fill={p.far} opacity=".8" />
      <path d="M620 300 L830 68 L1000 194 L1000 300 Z" fill={p.far} opacity=".62" />
      <path d="M560 300 L700 158 L820 240 L860 300 Z" fill={p.mid} opacity=".55" />
      <HouseRow x={368} w={236} count={7} h={88} fill={p.wall} roofFill={p.roof} seed={5} />
      <Tower x={452} w={34} h={172} roof="pyramid" roofH={40} fill={p.wall} roofFill={p.roofDark} cols={1} rows={4} />
      <ClockFace cx={469} cy={158} r={13} ring={p.roofDark} face={p.sunGlow} hands={p.wallDark} />
      <rect x={330} y={292} width={330} height={8} rx={4} fill={p.wallDark} opacity=".5" />
      <Palm x={120} h={156} fill={p.wallDark} lean={1} />
      <Palm x={206} h={120} fill={p.wallDark} lean={-1} />
      <Palm x={892} h={142} fill={p.wallDark} lean={-1} />
      <Boat x={706} y={300} scale={0.9} fill={p.wallDark} sail="#ffffff" />
    </>
  ),

  fribourg: (p) => (
    <>
      <path d="M0 300 L0 240 C120 236 220 254 300 300 Z" fill={p.mid} opacity=".7" />
      <path d="M0 300 L0 186 C130 180 260 212 350 262 L380 300 Z" fill={p.far} opacity=".55" />
      <path d="M1000 300 L1000 214 C900 216 800 244 720 284 L700 300 Z" fill={p.far} opacity=".5" />
      <Nave x={196} w={150} h={112} fill={p.wallDark} roofFill={p.roof} roofH={30} />
      <Tower x={222} w={72} h={246} roof="crenel" fill={p.wall} roofFill={p.wallDark} rows={5} cols={2} />
      <HouseRow x={330} w={200} count={6} h={74} fill={p.wall} roofFill={p.roof} seed={9} />
      <HouseRow x={60} w={140} count={4} h={62} fill={p.wall} roofFill={p.roof} base={268} seed={14} />
      <g>
        <path d="M1000 300 L1000 196 C920 200 860 224 812 262 L792 300 Z" fill={p.mid} opacity=".8" />
        <rect x={548} y={176} width={452} height={14} fill={p.wallDark} />
        <rect x={620} y={190} width={22} height={110} fill={p.wallDark} />
        <rect x={766} y={190} width={22} height={110} fill={p.wallDark} />
        <rect x={906} y={190} width={22} height={90} fill={p.wallDark} />
        <path d="M642 190 L642 232 A62 62 0 0 1 766 232 L766 190 Z" fill={p.wallDark} opacity=".28" />
        <path d="M788 190 L788 230 A59 59 0 0 1 906 230 L906 190 Z" fill={p.wallDark} opacity=".28" />
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={r2(554 + i * 28)} y={158} width={5} height={20} rx={2} fill={p.wallDark} opacity=".85" />
        ))}
      </g>
      <HouseRow x={470} w={120} count={4} h={58} fill={p.wall} roofFill={p.roof} base={284} seed={22} />
      <Conifer x={452} h={64} fill={p.wallDark} base={296} />
    </>
  ),

  thun: (p) => (
    <>
      <path d="M560 300 L700 96 L790 202 L860 118 L1000 300 Z" fill={p.far} opacity=".72" />
      <path d="M700 96 L744 158 L766 136 L716 76 Z M860 118 L906 182 L928 160 L874 98 Z" fill="#ffffff" opacity=".82" />
      <path d="M180 300 C220 232 320 200 430 200 C540 200 630 236 680 300 Z" fill={p.mid} opacity=".8" />
      <g>
        <rect x={400} y={116} width={158} height={104} fill={p.wall} />
        <path d="M392 116 L479 62 L566 116 Z" fill={p.roof} />
        <Tower x={382} w={30} h={158} roof="pyramid" roofH={36} fill={p.wallDark} roofFill={p.roofDark} base={222} cols={1} rows={3} />
        <Tower x={546} w={30} h={158} roof="pyramid" roofH={36} fill={p.wallDark} roofFill={p.roofDark} base={222} cols={1} rows={3} />
        <Windows x={410} y={130} w={138} h={86} cols={4} rows={2} />
      </g>
      <Tower x={270} w={44} h={150} roof="pyramid" roofH={42} fill={p.wall} roofFill={p.roofDark} base={258} />
      <HouseRow x={92} w={180} count={6} h={68} fill={p.wall} roofFill={p.roof} seed={4} />
      <g>
        <rect x={640} y={284} width={268} height={8} fill={p.wallDark} />
        <path d="M636 284 L774 262 L912 284 Z" fill={p.roofDark} opacity=".9" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={r2(660 + i * 58)} y={292} width={7} height={8} fill={p.wallDark} />
        ))}
      </g>
    </>
  ),

  koeniz: (p) => (
    <>
      <path d="M560 300 L640 174 L900 174 L1000 300 Z" fill={p.far} opacity=".6" />
      <Tower x={786} w={16} h={56} roof="pyramid" roofH={20} fill={p.wallDark} roofFill={p.roofDark} base={174} cols={1} rows={1} />
      <path d="M0 300 L0 246 C180 226 340 252 520 246 C660 240 800 256 1000 250 L1000 300 Z" fill={p.mid} opacity=".45" />
      <g>
        <rect x={318} y={192} width={176} height={108} fill={p.wall} />
        <path d="M310 192 L406 146 L502 192 Z" fill={p.roof} />
        <Windows x={332} y={206} w={148} h={86} cols={4} rows={2} />
      </g>
      <Tower x={274} w={40} h={178} roof="spire" roofH={58} fill={p.wall} roofFill={p.roofDark} rows={3} />
      <HouseRow x={80} w={170} count={5} h={70} fill={p.wall} roofFill={p.roof} seed={13} />
      <HouseRow x={530} w={140} count={4} h={64} fill={p.wall} roofFill={p.roof} seed={17} />
      <Broadleaf x={200} h={104} fill={p.wallDark} />
      <Broadleaf x={702} h={92} fill={p.wallDark} />
      <Conifer x={604} h={78} fill={p.wallDark} />
    </>
  ),

  "biel-bienne": (p) => (
    <>
      <ClockFace cx={806} cy={72} r={56} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
      <circle cx={806} cy={72} r={68} fill="none" stroke={p.accent} strokeWidth={3} opacity=".35" />
      <path d="M0 300 L0 224 C120 194 280 200 420 232 C520 254 560 278 580 300 Z" fill={p.far} opacity=".6" />
      <VineRows x={40} y={232} w={400} h={56} rows={6} fill={p.accent} />
      <HouseRow x={420} w={220} count={7} h={78} fill={p.wall} roofFill={p.roof} seed={6} />
      <Tower x={500} w={44} h={172} roof="spire" roofH={54} fill={p.wall} roofFill={p.roofDark} rows={3} />
      <ClockFace cx={522} cy={160} r={15} ring={p.roofDark} face={p.sunGlow} hands={p.wallDark} />
      <g>
        <ellipse cx={752} cy={296} rx={92} ry={16} fill={p.mid} />
        <Conifer x={720} h={62} fill={p.wallDark} base={292} />
        <Conifer x={756} h={48} fill={p.wallDark} base={294} />
        <Conifer x={788} h={56} fill={p.wallDark} base={292} />
      </g>
      <Boat x={636} y={300} scale={0.72} fill={p.wallDark} sail="#ffffff" />
    </>
  ),

  schaffhausen: (p) => (
    <>
      <path d="M0 300 L0 210 C120 196 240 214 330 240 L360 300 Z" fill={p.far} opacity=".5" />
      <g>
        <path d="M20 232 L300 232 L300 246 L20 246 Z" fill={p.mid} opacity=".55" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M${r2(24 + i * 46)} 240 C${r2(20 + i * 46)} 268 ${r2(30 + i * 46)} 282 ${r2(26 + i * 46)} 300 L${r2(66 + i * 46)} 300 C${r2(62 + i * 46)} 280 ${r2(70 + i * 46)} 264 ${r2(66 + i * 46)} 240 Z`}
            fill="#ffffff"
            opacity={r2(0.62 + (i % 2) * 0.16)}
          />
        ))}
        <path d="M140 300 L140 214 C150 208 162 210 168 220 L172 300 Z" fill={p.wallDark} opacity=".85" />
        <ellipse cx={160} cy={296} rx={150} ry={16} fill="#ffffff" opacity=".4" />
      </g>
      <path d="M430 300 C470 246 560 220 680 220 C800 220 880 248 920 300 Z" fill={p.mid} opacity=".75" />
      <g>
        <path d="M540 222 C560 196 780 196 800 222 L800 300 L540 300 Z" fill={p.wall} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={r2(548 + i * 36)} y={196} width={18} height={16} fill={p.wall} />
        ))}
        <Windows x={552} y={238} w={236} h={58} cols={6} rows={1} />
        <circle cx={670} cy={190} r={34} fill={p.wallDark} />
        <rect x={636} y={190} width={68} height={34} fill={p.wallDark} />
        <path d="M630 158 L670 120 L710 158 Z" fill={p.roof} />
        <rect x={666} y={104} width={8} height={18} fill={p.roofDark} />
      </g>
      <HouseRow x={370} w={150} count={5} h={70} fill={p.wall} roofFill={p.roof} seed={15} />
      <HouseRow x={820} w={160} count={5} h={68} fill={p.wall} roofFill={p.roof} seed={21} />
    </>
  ),

  "la-chaux-de-fonds": (p) => (
    <>
      <Gear cx={764} cy={70} r={54} fill={p.accent} teeth={12} />
      <ClockFace cx={764} cy={70} r={34} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
      <path d="M0 300 L0 202 C200 170 420 194 640 178 C800 166 900 190 1000 180 L1000 300 Z" fill={p.far} opacity=".55" />
      <path d="M0 198 C200 166 420 190 640 174 L640 186 C420 202 200 178 0 210 Z" fill="#ffffff" opacity=".5" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={`back${i}`}>
          <rect x={r2(96 + i * 108)} y={196} width={76} height={58} fill={p.wallDark} />
          <rect x={r2(92 + i * 108)} y={190} width={84} height={8} fill="#ffffff" opacity=".7" />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const tall = i === 2 || i === 6;
        const top = tall ? 194 : 214;
        return (
          <g key={`front${i}`}>
            <rect x={r2(40 + i * 118)} y={top} width={94} height={r2(300 - top)} fill={p.wall} />
            <rect x={r2(36 + i * 118)} y={r2(top - 8)} width={102} height={10} fill="#ffffff" opacity=".82" />
            <rect x={r2(40 + i * 118)} y={r2(top + 30)} width={94} height={5} fill={p.wallDark} opacity=".45" />
            <Windows x={r2(40 + i * 118)} y={r2(top + 2)} w={94} h={r2(298 - top)} cols={3} rows={tall ? 3 : 2} />
          </g>
        );
      })}
      <Tower x={470} w={46} h={164} roof="spire" roofH={48} fill={p.wallDark} roofFill={p.roof} rows={3} />
      <rect x={448} y={136} width={90} height={0} fill="none" />
      <ClockFace cx={493} cy={178} r={15} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
      <rect x={0} y={254} width={1000} height={7} fill={p.wallDark} opacity=".25" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={`lamp${i}`}>
          <rect x={r2(96 + i * 166)} y={246} width={4} height={54} fill={p.wallDark} opacity=".7" />
          <circle cx={r2(98 + i * 166)} cy={242} r={6} fill={p.sunGlow} />
        </g>
      ))}
    </>
  ),

  luzern: (p, uid) => (
    <>
      <path d="M560 300 L700 84 L780 166 L870 62 L1000 300 Z" fill={p.far} opacity=".7" />
      <path d="M870 62 L918 132 L940 110 L884 44 Z M700 84 L742 146 L762 126 L714 66 Z" fill="#ffffff" opacity=".7" />
      <HouseRow x={330} w={240} count={7} h={86} fill={p.wall} roofFill={p.roof} seed={3} />
      <Nave x={566} w={104} h={104} fill={p.wallDark} roofFill={p.roof} roofH={26} />
      <Tower x={556} w={36} h={196} roof="spire" roofH={70} fill={p.wall} roofFill={p.roofDark} cols={1} rows={4} />
      <Tower x={636} w={36} h={196} roof="spire" roofH={70} fill={p.wall} roofFill={p.roofDark} cols={1} rows={4} />
      <Bridge x1={80} y={278} x2={520} arches={7} fill={p.wallDark} covered roofFill={p.roofDark} kind="piles" uid={uid} />
      <g>
        <rect x={286} y={168} width={56} height={132} fill={p.wall} />
        <rect x={280} y={162} width={68} height={10} fill={p.wallDark} />
        <path d="M278 162 L314 118 L350 162 Z" fill={p.roofDark} />
        <Windows x={288} y={182} w={52} h={104} cols={2} rows={3} />
      </g>
      <Swan x={636} y={294} fill="#ffffff" />
      <Conifer x={880} h={64} fill={p.wallDark} base={298} />
    </>
  ),

  chur: (p) => (
    <>
      <path d="M0 300 L0 150 L170 24 L330 176 L400 300 Z" fill={p.far} opacity=".78" />
      <path d="M170 24 L226 84 L250 60 L188 6 Z" fill="#ffffff" opacity=".85" />
      <path d="M600 300 L820 58 L1000 192 L1000 300 Z" fill={p.far} opacity=".6" />
      <path d="M820 58 L876 122 L898 100 L836 42 Z" fill="#ffffff" opacity=".7" />
      <path d="M300 300 C380 232 520 216 660 226 C760 234 830 258 880 300 Z" fill={p.mid} opacity=".6" />
      <VineRows x={700} y={238} w={230} h={52} rows={5} fill={p.accent} />
      <HouseRow x={300} w={200} count={6} h={82} fill={p.wall} roofFill={p.roof} seed={5} />
      <HouseRow x={540} w={170} count={5} h={74} fill={p.wall} roofFill={p.roof} seed={19} />
      <Nave x={474} w={108} h={106} fill={p.wallDark} roofFill={p.roof} roofH={26} />
      <Tower x={462} w={52} h={186} roof="pyramid" roofH={50} fill={p.wall} roofFill={p.roofDark} rows={4} />
      <ClockFace cx={488} cy={148} r={15} ring={p.roofDark} face={p.sunGlow} hands={p.wallDark} />
      <Conifer x={180} h={96} fill={p.wallDark} />
      <Conifer x={232} h={72} fill={p.wallDark} />
    </>
  ),

  zug: (p) => (
    <>
      <path d="M620 300 L820 110 L1000 232 L1000 300 Z" fill={p.far} opacity=".6" />
      <path d="M0 300 L0 226 C140 204 300 222 430 214 L470 300 Z" fill={p.far} opacity=".4" />
      <HouseRow x={190} w={224} count={7} h={82} fill={p.wall} roofFill={p.roof} seed={7} />
      <HouseRow x={520} w={190} count={6} h={76} fill={p.wall} roofFill={p.roof} seed={10} />
      <g>
        <rect x={430} y={104} width={58} height={196} fill={p.wall} />
        <path d="M424 104 L459 40 L494 104 Z" fill={p.roof} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${r2(432 + i * 14)} 104 l7 -13 l7 13 Z`} fill="#ffffff" opacity=".8" />
        ))}
        <rect x={455} y={22} width={8} height={20} fill={p.roofDark} />
        <ClockFace cx={459} cy={148} r={22} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
        <Windows x={434} y={188} w={50} h={104} cols={2} rows={3} />
      </g>
      <g>
        <rect x={104} y={230} width={9} height={70} fill={p.wallDark} />
        <circle cx={82} cy={214} r={30} fill={p.accent} opacity=".55" />
        <circle cx={124} cy={206} r={34} fill={p.accent} opacity=".5" />
        <circle cx={108} cy={240} r={26} fill={p.accent} opacity=".45" />
      </g>
      <Boat x={760} y={300} scale={0.8} fill={p.wallDark} sail="#ffffff" />
    </>
  ),

  aarau: (p, uid) => (
    <>
      <path d="M0 300 L0 206 C180 178 380 198 560 180 C720 164 870 188 1000 174 L1000 300 Z" fill={p.far} opacity=".45" />
      <HouseRow x={340} w={290} count={5} h={104} fill={p.wall} roofFill={p.roof} seed={2} gable="stepped" />
      <HouseRow x={640} w={240} count={4} h={96} fill={p.wall} roofFill={p.roof} seed={8} gable="curved" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={r2(344 + i * 58)} y={r2(206 + noise(2 + i) * 18)} width={54} height={9} rx={3} fill={p.accent} opacity=".85" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`c${i}`} x={r2(644 + i * 60)} y={r2(218 + noise(8 + i) * 14)} width={56} height={9} rx={3} fill={p.accent} opacity=".7" />
      ))}
      <Tower x={272} w={52} h={186} roof="pyramid" roofH={48} fill={p.wall} roofFill={p.roofDark} rows={4} />
      <ClockFace cx={298} cy={146} r={19} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
      <HouseRow x={110} w={150} count={4} h={72} fill={p.wall} roofFill={p.roof} seed={16} />
      <Bridge x1={-10} y={262} x2={252} arches={3} fill={p.wallDark} uid={uid} />
      <Conifer x={920} h={78} fill={p.wallDark} />
    </>
  ),
};

/** Städte ohne Wasser im Vordergrund – dort wird eine Wiese statt See gezeichnet. */
const LAND_CITIES = new Set(["winterthur", "st-gallen", "koeniz", "la-chaux-de-fonds", "chur"]);
/** Städte, die ihr eigenes Himmelsmotiv mitbringen (Uhr, Zahnrad). */
const NO_SUN_CITIES = new Set(["biel-bienne", "la-chaux-de-fonds"]);

function defaultScene(p: Pal, _uid: string): ReactNode {
  return (
    <>
      <path d="M0 300 L0 206 C180 178 380 198 560 180 C720 164 870 188 1000 174 L1000 300 Z" fill={p.far} opacity=".5" />
      <HouseRow x={60} w={300} count={8} h={80} fill={p.wall} roofFill={p.roof} seed={2} />
      <HouseRow x={620} w={320} count={9} h={76} fill={p.wall} roofFill={p.roof} seed={9} />
      <Nave x={410} w={140} h={110} fill={p.wallDark} roofFill={p.roof} roofH={28} />
      <Tower x={446} w={56} h={216} roof="spire" roofH={74} fill={p.wall} roofFill={p.roofDark} rows={4} />
      <ClockFace cx={474} cy={124} r={17} ring={p.accent} face={p.sunGlow} hands={p.wallDark} />
    </>
  );
}

/* ---------------------------------------------------------------------- Rahmen */

type Variant = "card" | "hero" | "thumb";

const LAYOUT: Record<Variant, {
  w: number; h: number; ground: number; scale: number; dx: number;
  /** null = kein Textband (Vorschaubild). */
  bandTop: number | null; padX: number; nameSize: number; taglineSize: number;
  sun: { cx: number; cy: number; r: number };
}> = {
  card: {
    w: 1000, h: 625, ground: 432, scale: 1, dx: 0,
    bandTop: 510, padX: 52, nameSize: 44, taglineSize: 21,
    sun: { cx: 786, cy: 118, r: 46 },
  },
  hero: {
    w: 1000, h: 1063, ground: 726, scale: 1.2, dx: -100,
    bandTop: 872, padX: 62, nameSize: 56, taglineSize: 25,
    sun: { cx: 756, cy: 224, r: 60 },
  },
  thumb: {
    w: 1000, h: 420, ground: 300, scale: 0.86, dx: 70,
    bandTop: null, padX: 0, nameSize: 0, taglineSize: 0,
    sun: { cx: 802, cy: 82, r: 34 },
  },
};

export type CityCharacterArtProps = {
  slug: string;
  name: string;
  variant: Variant;
  className?: string;
  /** Fuer die als Datei ausgelieferten Grafiken: feste Groesse am <svg> setzen. */
  standalone?: boolean;
};

export function CityCharacterArt({ slug, name, variant, className, standalone }: CityCharacterArtProps) {
  const art = getCityArt(slug);
  const p = art.palette;
  const l = LAYOUT[variant];
  const uid = `ca-${slug}-${variant}`;
  const scene = SCENES[slug] ?? defaultScene;
  const isLand = LAND_CITIES.has(slug);
  const stageTransform = `translate(${l.dx} ${r2(l.ground - GROUND * l.scale)}) scale(${l.scale})`;
  const title = cityArtAltText(slug, name);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${l.w} ${l.h}`}
      {...(standalone ? { width: l.w, height: l.h } : null)}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky1} />
          <stop offset="58%" stopColor={p.sky2} />
          <stop offset="100%" stopColor={p.sky3} />
        </linearGradient>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.water1} />
          <stop offset="100%" stopColor={p.water2} />
        </linearGradient>
        <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.band1} />
          <stop offset="100%" stopColor={p.band2} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0%" stopColor={p.sunGlow} stopOpacity=".9" />
          <stop offset="100%" stopColor={p.sunGlow} stopOpacity="0" />
        </radialGradient>
        <g id={`${uid}-scene`}>{scene(p, uid)}</g>
      </defs>

      <rect x={0} y={0} width={l.w} height={l.ground} fill={`url(#${uid}-sky)`} />

      {NO_SUN_CITIES.has(slug) ? null : (
        <g>
          <circle cx={l.sun.cx} cy={l.sun.cy} r={r2(l.sun.r * 2.6)} fill={`url(#${uid}-glow)`} />
          <circle cx={l.sun.cx} cy={l.sun.cy} r={l.sun.r} fill={p.sun} />
        </g>
      )}

      <ellipse cx={r2(l.w * 0.22)} cy={r2(l.ground * 0.22)} rx={r2(l.w * 0.16)} ry={r2(l.ground * 0.03)} fill="#ffffff" opacity=".42" />
      <ellipse cx={r2(l.w * 0.34)} cy={r2(l.ground * 0.3)} rx={r2(l.w * 0.1)} ry={r2(l.ground * 0.022)} fill="#ffffff" opacity=".3" />
      <ellipse cx={r2(l.w * 0.78)} cy={r2(l.ground * 0.36)} rx={r2(l.w * 0.13)} ry={r2(l.ground * 0.024)} fill="#ffffff" opacity=".26" />

      <Heart x={r2(l.w * 0.09)} y={r2(l.ground * 0.12)} size={26} fill={p.accent} opacity={0.5} />
      <Heart x={r2(l.w * 0.16)} y={r2(l.ground * 0.28)} size={17} fill={p.accent} opacity={0.34} />
      <Heart x={r2(l.w * 0.9)} y={r2(l.ground * 0.5)} size={20} fill={p.accent} opacity={0.3} />

      <use href={`#${uid}-scene`} transform={stageTransform} />

      <rect x={0} y={l.ground} width={l.w} height={r2(l.h - l.ground)} fill={`url(#${uid}-ground)`} />

      {isLand ? (
        <g opacity=".45">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M0 ${r2(l.ground + 18 + i * 26)} C ${r2(l.w * 0.3)} ${r2(l.ground + 6 + i * 26)} ${r2(l.w * 0.7)} ${r2(l.ground + 30 + i * 26)} ${l.w} ${r2(l.ground + 14 + i * 26)}`}
              stroke={p.mid}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : (
        <>
          <g transform={`translate(0 ${r2(l.ground * 2)}) scale(1 -1)`} opacity=".16">
            <use href={`#${uid}-scene`} transform={stageTransform} />
          </g>
          <g opacity=".5">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={r2(l.w * (0.06 + noise(i + 3) * 0.6))}
                y={r2(l.ground + 16 + i * 22)}
                width={r2(l.w * (0.1 + noise(i + 7) * 0.22))}
                height={4}
                rx={2}
                fill="#ffffff"
              />
            ))}
          </g>
          <g opacity=".42">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect
                key={i}
                x={r2(l.sun.cx - 26 + noise(i + 11) * 52)}
                y={r2(l.ground + 8 + i * 18)}
                width={r2(30 + noise(i + 5) * 34)}
                height={5}
                rx={2.5}
                fill={p.sunGlow}
              />
            ))}
          </g>
        </>
      )}

      {l.bandTop !== null ? (
        <>
          <rect x={0} y={l.bandTop} width={l.w} height={r2(l.h - l.bandTop)} fill={`url(#${uid}-band)`} />
          <rect x={0} y={l.bandTop} width={l.w} height={4} fill={p.accent} />
          <text
            x={l.padX}
            y={r2(l.bandTop + (l.h - l.bandTop) * 0.46)}
            fill="#ffffff"
            fontFamily={FONT}
            fontSize={l.nameSize}
            fontWeight={800}
            letterSpacing="-0.02em"
          >
            {name}
          </text>
          <text
            x={l.padX}
            y={r2(l.bandTop + (l.h - l.bandTop) * 0.74)}
            fill="rgba(255,255,255,.82)"
            fontFamily={FONT}
            fontSize={l.taglineSize}
            fontWeight={600}
          >
            {art.tagline}
          </text>
          <g transform={`translate(${r2(l.w - l.padX - 44)} ${r2(l.bandTop + (l.h - l.bandTop) * 0.3)})`}>
            <circle cx={22} cy={22} r={22} fill="rgba(255,255,255,.12)" />
            <Heart x={8} y={9} size={28} fill={p.accent} />
          </g>
        </>
      ) : null}
    </svg>
  );
}
