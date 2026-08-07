import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { BoardConfig } from "js-chess-engine";
import {
  BOARD_SIZE,
  coordsOf,
  squareAt,
  squareFromPoint,
} from "../../chess/board";
import DraggablePiece from "./DraggablePiece";

const LIGHT = "#E8D5B7";
const DARK = "#B58863";
const SELECTED = "#F6F669";
const MOVE_HINT = "#829769";

type ChessBoardProps = {
  board: BoardConfig;
  selected: string | null;
  legalMoves: string[];
  boardSize: number;
  onSquarePress: (square: string) => void;
  onDragStart: (square: string) => void;
  onDrop: (from: string, to: string | null) => boolean;
  canDragPiece: (square: string) => boolean;
};

export default function ChessBoard({
  board,
  selected,
  legalMoves,
  boardSize,
  onSquarePress,
  onDragStart,
  onDrop,
  canDragPiece,
}: ChessBoardProps) {
  const squareSize = boardSize / BOARD_SIZE;

  const handleTap = (x: number, y: number) => {
    const square = squareFromPoint(x, y, squareSize);
    if (square) onSquarePress(square);
  };

  // One tap gesture for the whole board: pieces sit on top of their square, so
  // the tapped point resolves to the right square either way. maxDistance keeps
  // a piece drag from also registering as a tap here.
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e) => {
      runOnJS(handleTap)(e.x, e.y);
    });

  return (
    <GestureDetector gesture={tap}>
      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;
          const square = squareAt(row, col);

          let backgroundColor = (row + col) % 2 === 0 ? LIGHT : DARK;
          if (selected === square) backgroundColor = SELECTED;
          else if (legalMoves.includes(square)) backgroundColor = MOVE_HINT;

          return (
            <View
              key={square}
              style={{
                width: squareSize,
                height: squareSize,
                backgroundColor,
              }}
            />
          );
        })}

        {Object.entries(board.pieces).map(([square, piece]) => {
          const origin = coordsOf(square);
          if (!origin) return null;

          return (
            <DraggablePiece
              key={square}
              square={square}
              piece={piece}
              left={origin.col * squareSize}
              top={origin.row * squareSize}
              squareSize={squareSize}
              enabled={canDragPiece(square)}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          );
        })}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 4,
    overflow: "visible",
  },
});
