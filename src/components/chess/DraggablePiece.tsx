import { forwardRef, useImperativeHandle } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Piece } from "js-chess-engine";
import { coordsOf, squareFromPoint } from "../../chess/board";
import ChessPiece from "./ChessPiece";

const PIECE_SCALE = 1.4;
const DRAG_SCALE = 1.3;
const SNAP_DURATION = 160;

export type DraggablePieceHandle = {
  // Glides the piece to `to`'s square, then calls `onDone` once it lands.
  snapTo: (to: string, onDone: () => void) => void;
};

type DraggablePieceProps = {
  square: string;
  piece: Piece;
  left: number;
  top: number;
  squareSize: number;
  enabled: boolean;
  onDragStart: (square: string) => void;
  onDrop: (from: string, to: string | null) => boolean;
  isLegalMove: (from: string, to: string) => boolean;
};

const DraggablePiece = forwardRef<DraggablePieceHandle, DraggablePieceProps>(
  function DraggablePiece(
    {
      square,
      piece,
      left,
      top,
      squareSize,
      enabled,
      onDragStart,
      onDrop,
      isLegalMove,
    },
    ref,
  ) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Lower ranks sit in front of higher ranks (rank 1 > rank 8).
    const rank = Number(square.slice(1));
    const baseZIndex = 9 - rank;

    const springHome = () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    };

    // Glides this piece to `to`'s square, then calls `onDone` once it lands.
    // A move commit swaps this piece for a fresh instance at the
    // destination, so landing exactly on that spot before committing makes
    // the swap invisible.
    const glideTo = (to: string, onDone: () => void) => {
      const target = coordsOf(to);
      if (!target) return;

      isDragging.value = true;
      translateX.value = withTiming(target.col * squareSize - left, {
        duration: SNAP_DURATION,
      });
      translateY.value = withTiming(
        target.row * squareSize - top,
        { duration: SNAP_DURATION },
        (finished) => {
          isDragging.value = false;
          if (finished) runOnJS(onDone)();
        },
      );
    };

    useImperativeHandle(ref, () => ({
      snapTo: glideTo,
    }));

    const commitMove = (to: string) => {
      onDrop(square, to);
    };

    const finishDrop = (translationX: number, translationY: number) => {
      const to = squareFromPoint(
        left + squareSize / 2 + translationX,
        top + squareSize / 2 + translationY,
        squareSize,
      );

      if (to && isLegalMove(square, to)) {
        glideTo(to, () => commitMove(to));
        return;
      }

      springHome();
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

    const style = useAnimatedStyle(() => {
      const zIndex = isDragging.value ? 100 + baseZIndex : baseZIndex;
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: isDragging.value ? DRAG_SCALE : 1 },
        ],
        zIndex,
        elevation: zIndex,
      };
    });

    return (
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.piece,
            {
              width: squareSize,
              height: squareSize,
              left,
              top,
              paddingBottom: 20,
            },
            style,
          ]}
        >
          <ChessPiece piece={piece} size={squareSize * PIECE_SCALE} />
        </Animated.View>
      </GestureDetector>
    );
  },
);

export default DraggablePiece;

const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
