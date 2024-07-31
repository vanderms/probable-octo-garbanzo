export const Direction = {
  UP: { x: 0, y: 1 },
  LEFT: { x: 1, y: 0 },
  DOWN: { x: 0, y: -1 },
  RIGHT: { x: -1, y: 0 },
  NONE: { x: 0, y: 0 },
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
