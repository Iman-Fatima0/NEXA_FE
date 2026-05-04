/**
 * Computes one animation loop duration for an animated GIF by summing
 * Graphics Control Extension delay values (1/100s units).
 * Falls back when the file is not a GIF or parsing fails.
 */
export async function getGifLoopDurationMs(src: string, fallbackMs = 5000): Promise<number> {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return fallbackMs;
    }
    const buf = await res.arrayBuffer();
    const d = new Uint8Array(buf);
    if (d.length < 14 || d[0] !== 0x47 || d[1] !== 0x49 || d[2] !== 0x46) {
      return fallbackMs;
    }

    let i = 13;
    const packed = d[10];
    if (packed & 0x80) {
      const gct = 3 * (1 << ((packed & 7) + 1));
      i += gct;
    }

    let totalCs = 0;

    const skipSubBlocks = (start: number): number => {
      let p = start;
      while (p < d.length && d[p] !== 0) {
        p += 1 + d[p];
      }
      return p + 1;
    };

    while (i < d.length) {
      const b = d[i];
      if (b === 0x3b) {
        break;
      }
      if (b === 0x21) {
        i += 1;
        const label = d[i++];
        if (label === 0xf9) {
          const blockSize = d[i++];
          if (blockSize >= 4 && i + 3 < d.length) {
            const delay = d[i + 2] | (d[i + 3] << 8);
            totalCs += delay;
          }
          i += blockSize;
          if (i < d.length && d[i] === 0) {
            i += 1;
          }
        } else if (label === 0xff) {
          i = skipSubBlocks(i);
        } else {
          i = skipSubBlocks(i);
        }
      } else if (b === 0x2c) {
        i += 10;
        const imgPacked = d[i - 1];
        if (imgPacked & 0x80) {
          const lct = 3 * (1 << ((imgPacked & 7) + 1));
          i += lct;
        }
        i += 1;
        i = skipSubBlocks(i);
      } else {
        i += 1;
      }
    }

    const ms = totalCs * 10;
    return ms > 120 ? ms : fallbackMs;
  } catch {
    return fallbackMs;
  }
}
