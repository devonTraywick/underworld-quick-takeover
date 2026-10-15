export interface RandomSource {
  next(): number;
  int(maxExclusive: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

function xmur3(value: string): () => number {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRandom(seed: string, cursor = 0): RandomSource {
  const seedFactory = xmur3(seed);
  const nextValue = mulberry32(seedFactory());
  for (let index = 0; index < cursor; index += 1) nextValue();
  return {
    next: nextValue,
    int(maxExclusive) {
      if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error("maxExclusive must be a positive integer");
      }
      return Math.floor(nextValue() * maxExclusive);
    },
    shuffle<T>(items: readonly T[]) {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = Math.floor(nextValue() * (index + 1));
        [copy[index], copy[other]] = [copy[other]!, copy[index]!];
      }
      return copy;
    },
  };
}
