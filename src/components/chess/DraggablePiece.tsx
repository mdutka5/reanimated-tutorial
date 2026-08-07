import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Piece } from "js-chess-engine";
import { squareFromPoint } from "../../chess/board";
import ChessPiece from "./ChessPiece";

const PIECE_SCALE = 0.85;
const DRAG_SCALE = 1.15;

type DraggablePieceProps = {
  square: string;
  piece: Piece;
  left: number;
  top: number;
  squareSize: number;
  enabled: boolean;
  onDragStart: (square: string) => void;
  onDrop: (from: string, to: string | null) => boolean;
};

export default function DraggablePiece({
  square,
  piece,
  left,
  top,
  squareSize,
  enabled,
  onDragStart,
  onDrop,
}: DraggablePieceProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const springHome = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const finishDrop = (translationX: number, translationY: number) => {
    const to = squareFromPoint(
      left + squareSize / 2 + translationX,
      top + squareSize / 2 + translationY,
      squareSize,
    );

    // An accepted move drops this square from the board, unmounting this piece
    // and mounting a fresh one at the destination, so only a rejected move
    // needs the offset undone.
    if (!onDrop(square, to)) springHome();
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .maxPointers(1)
    .minDistance(4)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(onDragStart)(square);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(finishDrop)(e.translationX, e.translationY);
    })
    .onFinalize(() => {
      if (isDragging.value) {
        isDragging.value = false;
        runOnJS(springHome)();
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? DRAG_SCALE : 1 },
    ],
    zIndex: isDragging.value ? 100 : 2,
    elevation: isDragging.value ? 100 : 2,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.piece,
          { width: squareSize, height: squareSize, left, top },
          style,
        ]}
      >
        <ChessPiece piece={piece} size={squareSize * PIECE_SCALE} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
