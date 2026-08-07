import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Game, type BoardConfig } from "js-chess-engine";

const BOARD_SIZE = 8;
const LIGHT = "#E8D5B7";
const DARK = "#B58863";
const SELECTED = "#F6F669";
const MOVE_HINT = "#829769";
const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const PIECE_SYMBOLS: Record<string, string> = {
  K: "K",
  Q: "Q",
  R: "R",
  B: "B",
  N: "N",
  P: "P",
  k: "K",
  q: "Q",
  r: "R",
  b: "B",
  n: "N",
  p: "P",
};

function squareAt(row: number, col: number) {
  return `${FILES[col]}${RANKS[row]}`;
}

function createGame() {
  return new Game();
}

export default function Chess() {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 400);
  const squareSize = boardSize / BOARD_SIZE;

  const gameRef = useRef(createGame());
  const [board, setBoard] = useState<BoardConfig>(() =>
    gameRef.current.exportJson(),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const syncBoard = useCallback(() => {
    setBoard(gameRef.current.exportJson());
  }, []);

  const resetGame = useCallback(() => {
    gameRef.current = createGame();
    setSelected(null);
    setLegalMoves([]);
    syncBoard();
  }, [syncBoard]);

  const playAiMove = useCallback(() => {
    const state = gameRef.current.exportJson();
    if (state.isFinished || state.turn !== "black") return;
    try {
      gameRef.current.aiMove(1);
      syncBoard();
    } catch {
      // No legal AI move (draw / finished)
    }
  }, [syncBoard]);

  const onSquarePress = useCallback(
    (square: string) => {
      if (board.isFinished || board.turn !== "white") return;

      if (selected && legalMoves.includes(square)) {
        try {
          gameRef.current.move(selected, square);
          setSelected(null);
          setLegalMoves([]);
          syncBoard();
          setTimeout(playAiMove, 250);
        } catch {
          setSelected(null);
          setLegalMoves([]);
        }
        return;
      }

      const piece = board.pieces[square];
      const isWhitePiece = piece && piece === piece.toUpperCase();
      if (piece && isWhitePiece) {
        const moves = gameRef.current.moves(square);
        setSelected(square);
        setLegalMoves(Array.isArray(moves) ? moves : []);
        return;
      }

      setSelected(null);
      setLegalMoves([]);
    },
    [board, selected, legalMoves, syncBoard, playAiMove],
  );

  const statusText = board.checkMate
    ? `Checkmate — ${board.turn === "white" ? "Black" : "White"} wins`
    : board.isFinished
      ? "Draw"
      : board.check
        ? `${board.turn === "white" ? "White" : "Black"} in check`
        : `${board.turn === "white" ? "Your" : "AI"} turn`;

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusText}</Text>

      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const square = squareAt(row, col);
            const isLight = (row + col) % 2 === 0;
            const piece = board.pieces[square];
            const isSelected = selected === square;
            const isHint = legalMoves.includes(square);

            let backgroundColor = isLight ? LIGHT : DARK;
            if (isSelected) backgroundColor = SELECTED;
            else if (isHint) backgroundColor = MOVE_HINT;

            return (
              <Pressable
                key={square}
                onPress={() => onSquarePress(square)}
                style={[
                  styles.square,
                  { width: squareSize, height: squareSize, backgroundColor },
                ]}
              >
                {piece ? (
                  <Text
                    style={[
                      styles.piece,
                      { fontSize: squareSize * 0.7 },
                      piece === piece.toLowerCase() && styles.blackPiece,
                    ]}
                  >
                    {PIECE_SYMBOLS[piece]}
                  </Text>
                ) : null}
              </Pressable>
            );
          }),
        )}
      </View>

      <Pressable style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetText}>New game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    gap: 20,
  },
  status: {
    color: "#f0f0f0",
    fontSize: 18,
    fontWeight: "600",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 4,
    overflow: "hidden",
  },
  square: {
    alignItems: "center",
    justifyContent: "center",
  },
  piece: {
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  blackPiece: {
    color: "#111",
    textShadowColor: "rgba(255,255,255,0.25)",
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  resetText: {
    color: "#f0f0f0",
    fontSize: 16,
    fontWeight: "600",
  },
});
