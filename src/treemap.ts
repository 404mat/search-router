export interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Strip {
  /** Axis the strip runs across, and the length it runs along. */
  horizontal: boolean;
  breadth: number;
  /** Strip origin and extent. */
  x: number;
  y: number;
  sum: number;
  indices: number[];
}

/** Strips thinner than this read as rendering artifacts, not data. */
const MIN_STRIP_DEPTH = 12;

/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk, 2000).
 *
 * `areas` are relative weights in any unit; each is laid out in input order
 * (pass them sorted descending). Returns one rect per area, in the same
 * order, tiling a `width × height` rectangle exactly.
 *
 * One refinement over the textbook algorithm: a final strip thinner than
 * MIN_STRIP_DEPTH (typical for a tiny last weight) is folded into the strip
 * before it, which trades a negligible aspect loss for not rendering
 * sub-12px slivers.
 */
export function squarify(areas: number[], width: number, height: number): TreemapRect[] {
  const rects: TreemapRect[] = new Array(areas.length);
  const n = areas.length;
  if (n === 0 || width <= 0 || height <= 0) return rects;

  let total = 0;
  for (const area of areas) total += area;
  if (total <= 0) return [];

  const scale = (width * height) / total;
  const scaled = areas.map((area) => Math.max(area * scale, 1e-6));

  let rx = 0;
  let ry = 0;
  let rw = width;
  let rh = height;
  let start = 0;
  const strips: Strip[] = [];

  while (start < n) {
    // A strip runs across the longer side of the remaining rect so the
    // leftover rectangle stays as close to square as possible.
    const horizontal = rw >= rh;
    const breadth = horizontal ? rw : rh;

    // Grow the strip while it improves the worst aspect ratio.
    const indices: number[] = [];
    let stripSum = 0;
    let worst = Infinity;
    let i = start;
    while (i < n) {
      const area = scaled[i];
      const nextWorst = worstRatio(scaled, stripSum + area, indices, area, breadth);
      if (indices.length > 0 && nextWorst > worst) break;
      indices.push(i);
      stripSum += area;
      worst = nextWorst;
      i++;
    }

    if (horizontal) {
      const depth = stripSum / breadth;
      strips.push({ horizontal, breadth, x: rx, y: ry, sum: stripSum, indices });
      ry += depth;
      rh -= depth;
    } else {
      const depth = stripSum / breadth;
      strips.push({ horizontal, breadth, x: rx, y: ry, sum: stripSum, indices });
      rx += depth;
      rw -= depth;
    }
    start = i;
  }

  // A final strip thinner than a hairline reads as an artifact. Canonical
  // squarify handles some of these (e.g. one standout weight) fine and
  // folds others badly (turning a thin row into sliver columns), so build
  // both variants and keep whichever has the better worst aspect ratio.
  const canonical = placeStrips(strips, rects, scaled);
  let bestWorst = worstAspect(canonical);
  let best = canonical;
  if (strips.length >= 2) {
    const last = strips[strips.length - 1];
    const prev = strips[strips.length - 2];
    if (last.horizontal === prev.horizontal && last.sum / last.breadth < MIN_STRIP_DEPTH) {
      const foldable = [...strips];
      while (foldable.length >= 2) {
        const tail = foldable[foldable.length - 1];
        const above = foldable[foldable.length - 2];
        if (tail.horizontal !== above.horizontal) break;
        if (tail.sum / tail.breadth >= MIN_STRIP_DEPTH) break;
        foldable.pop();
        foldable[foldable.length - 1] = {
          ...above,
          sum: above.sum + tail.sum,
          indices: [...above.indices, ...tail.indices],
        };
      }
      const foldedRects = placeStrips(foldable, new Array(rects.length), scaled);
      const foldedWorst = worstAspect(foldedRects);
      if (foldedWorst < bestWorst) {
        best = foldedRects;
      }
    }
  }
  return best;
}

/** Exact tiling for a fully-formed strip list. */
function placeStrips(strips: Strip[], rects: TreemapRect[], scaled: number[]): TreemapRect[] {
  for (const strip of strips) {
    let cursor = strip.horizontal ? strip.x : strip.y;
    const depth = strip.sum / strip.breadth;
    for (const index of strip.indices) {
      rects[index] = strip.horizontal
        ? { x: cursor, y: strip.y, w: scaled[index] / depth, h: depth }
        : { x: strip.x, y: cursor, w: depth, h: scaled[index] / depth };
      cursor += scaled[index] / depth;
    }
  }
  return rects;
}

function worstAspect(rects: TreemapRect[]): number {
  let worst = 0;
  for (const rect of rects) {
    if (!rect) continue;
    worst = Math.max(worst, rect.w / rect.h, rect.h / rect.w);
  }
  return worst;
}

/** Worst item aspect ratio when the candidate joins the current strip of
 * breadth. Strip depth is d = sum / breadth, so item ratio is
 * max(a / d², d² / a); min and max cover strip plus candidate. */
function worstRatio(
  scaled: number[],
  newSum: number,
  indices: number[],
  candidate: number,
  breadth: number
): number {
  let min = candidate;
  let max = candidate;
  for (const index of indices) {
    const area = scaled[index];
    if (area < min) min = area;
    if (area > max) max = area;
  }
  const b2 = breadth * breadth;
  return Math.max((max * b2) / (newSum * newSum), (newSum * newSum) / (min * b2));
}
