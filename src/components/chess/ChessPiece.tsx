import { Image } from "expo-image";
import type { Piece } from "js-chess-engine";

// Metro only resolves `require` with a static string literal, so each asset
// needs its own entry rather than a path built from the piece letter.
const PIECE_SOURCES = {
  K: require("../../../assets/pieces/wK.svg"),
  Q: require("../../../assets/pieces/wQ.svg"),
  R: require("../../../assets/pieces/wR.svg"),
  B: require("../../../assets/pieces/wB.svg"),
  N: require("../../../assets/pieces/wN.svg"),
  P: require("../../../assets/pieces/wP.svg"),
  k: require("../../../assets/pieces/bK.svg"),
  q: require("../../../assets/pieces/bQ.svg"),
  r: require("../../../assets/pieces/bR.svg"),
  b: require("../../../assets/pieces/bB.svg"),
  n: require("../../../assets/pieces/bN.svg"),
  p: require("../../../assets/pieces/bP.svg"),
} satisfies Record<Piece, unknown>;

type ChessPieceProps = {
  piece: Piece;
  size: number;
};

export default function ChessPiece({ piece, size }: ChessPieceProps) {
  return (
    <Image
      source={PIECE_SOURCES[piece]}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
