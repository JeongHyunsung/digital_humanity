// utils/graphUtils.ts
import { Node, Link } from '../types';

export const EMOTION_COLORS: { [group: string]: [number, number, number] } = {
  "기쁨": [255, 207, 0],
  "신뢰": [22, 160, 133],
  "공포": [106, 76, 147],
  "놀람": [255, 87, 34],
  "슬픔": [41, 128, 185],
  "혐오": [76, 175, 80],
  "분노": [231, 76, 60],
  "기대": [52, 152, 219],
};

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  let s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  h /= 360;
  if (s === 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}

export function getSelfLoopCount(id: string, allLinks: { [key: string]: Link }) {
  return Object.values(allLinks).filter(l => l.source === id && l.target === id).length || 0;
}

export function getNodeColor(node: Node, allLinks: { [key: string]: Link }) {
  const label = node.label;
  const color = EMOTION_COLORS[label!] || [120, 120, 120];
  const [h, s, l] = rgbToHsl(...color);

  const selfLoop = getSelfLoopCount(node.id, allLinks);
  const grayH = 0, grayS = 0, grayL = 0.80;
  const t = Math.min(1, Math.log2(selfLoop + 1) / 2.2);
  const nodeH = grayH * (1 - t) + h * t;
  const nodeS = grayS * (1 - t) + s * t;
  const nodeL = grayL * (1 - t) + l * t;
  const [r, g, b] = hslToRgb(nodeH, nodeS, nodeL);
  return `rgb(${r},${g},${b})`;
}

export function getNodeDegree(id: string, allLinks: { [key: string]: Link }) {
  return Object.values(allLinks).filter(l => l.source === id || l.target === id).length || 1;
}
