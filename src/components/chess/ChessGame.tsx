import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useChessGame } from "../../chess/useChessGame";
import ChessBoard from "./ChessBoard";

export default function ChessGame() {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 400);
  const {
    board,
    selected,
    legalMoves,
    statusText,
    resetGame,
    onSquarePress,
    onDragStart,
    onDrop,
    canDragPiece,
    isLegalMove,
    pendingAiMove,
    commitAiMove,
  } = useChessGame();

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusText}</Text>

      <ChessBoard
        board={board}
        selected={selected}
        legalMoves={legalMoves}
        boardSize={boardSize}
        onSquarePress={onSquarePress}
        onDragStart={onDragStart}
        onDrop={onDrop}
        canDragPiece={canDragPiece}
        isLegalMove={isLegalMove}
        pendingAiMove={pendingAiMove}
        onAiMoveCommit={commitAiMove}
      />

      <Image
        source={require("../../../assets/palm-tree.svg")}
        style={{
          width: 50,
          height: 50,
          position: "absolute",
          top: 180,
          left: 50,
        }}
        contentFit="contain"
      />

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
