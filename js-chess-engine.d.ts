declare module "js-chess-engine" {
  export type Piece =
    | "K"
    | "Q"
    | "R"
    | "B"
    | "N"
    | "P"
    | "k"
    | "q"
    | "r"
    | "b"
    | "n"
    | "p";

  export type BoardConfig = {
    turn: "white" | "black";
    pieces: Record<string, Piece>;
    moves?: Record<string, string[]>;
    isFinished: boolean;
    check: boolean;
    checkMate: boolean;
    castling: {
      whiteLong: boolean;
      whiteShort: boolean;
      blackLong: boolean;
      blackShort: boolean;
    };
    enPassant: string | null;
    halfMove: number;
    fullMove: number;
  };

  export class Game {
    constructor(configuration?: BoardConfig | string);
    move(from: string, to: string): Record<string, string>;
    moves(from?: string | null): string[] | Record<string, string[]>;
    setPiece(location: string, piece: Piece): void;
    removePiece(location: string): void;
    aiMove(level?: number): Record<string, string>;
    getHistory(reversed?: boolean): Array<{
      from: string;
      to: string;
      configuration: BoardConfig;
    }>;
    printToConsole(): void;
    exportJson(): BoardConfig;
    exportFEN(): string;
  }

  export function moves(config: BoardConfig | string): Record<string, string[]>;
  export function status(config: BoardConfig | string): BoardConfig;
  export function getFen(config: BoardConfig | string): string;
  export function move(
    config: BoardConfig | string,
    from: string,
    to: string,
  ): BoardConfig | string;
  export function aiMove(
    config: BoardConfig | string,
    level?: number,
  ): Record<string, string>;
}
