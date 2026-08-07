export const BOARD_SIZE = 8;
export const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export function squareAt(row: number, col: number) {
  return `${FILES[col]}${RANKS[row]}`;
}

export function coordsOf(square: string): { row: number; col: number } | null {
  const file = square[0]?.toUpperCase();
  const rank = Number(square.slice(1));
  const col = FILES.indexOf(file as (typeof FILES)[number]);
  const row = RANKS.indexOf(rank as (typeof RANKS)[number]);
  if (col < 0 || row < 0) return null;
  return { row, col };
}

export function squareFromPoint(
  x: number,
  y: number,
  squareSize: number,
): string | null {
  const col = Math.floor(x / squareSize);
  const row = Math.floor(y / squareSize);
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return null;
  }
  return squareAt(row, col);
}

export function isWhitePiece(piece: string) {
  return piece === piece.toUpperCase();
}
