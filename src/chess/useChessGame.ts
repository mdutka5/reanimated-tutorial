import { useEffect, useRef, useState } from "react";
import { Game, type BoardConfig } from "js-chess-engine";
import { isWhitePiece } from "./board";

const AI_LEVEL = 1;
const AI_MOVE_DELAY = 250;

export function useChessGame() {
  const gameRef = useRef<Game | null>(null);
  gameRef.current ??= new Game();
  const game = gameRef.current;

  const [board, setBoard] = useState<BoardConfig>(() => game.exportJson());
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, []);

  const isPlayerTurn = !board.isFinished && board.turn === "white";

  function legalMovesFrom(square: string) {
    const moves = game.moves(square);
    return Array.isArray(moves) ? moves : [];
  }

  function clearSelection() {
    setSelected(null);
    setLegalMoves([]);
  }

  function resetGame() {
    if (aiTimer.current) clearTimeout(aiTimer.current);
    const next = new Game();
    gameRef.current = next;
    clearSelection();
    setBoard(next.exportJson());
  }

  function playAiMove() {
    // Runs on a delay, so read the ref rather than the game captured at schedule time.
    const current = gameRef.current;
    if (!current) return;

    const state = current.exportJson();
    if (state.isFinished || state.turn !== "black") return;

    try {
      current.aiMove(AI_LEVEL);
      setBoard(current.exportJson());
    } catch {
      // No legal AI move (draw / finished)
    }
  }

  function selectPiece(square: string) {
    const piece = board.pieces[square];
    if (!piece || !isWhitePiece(piece)) {
      clearSelection();
      return;
    }
    setSelected(square);
    setLegalMoves(legalMovesFrom(square));
  }

  function tryMove(from: string, to: string) {
    if (!isPlayerTurn) return false;
    if (!legalMovesFrom(from).includes(to)) return false;

    try {
      game.move(from, to);
    } catch {
      clearSelection();
      return false;
    }

    clearSelection();
    setBoard(game.exportJson());
    aiTimer.current = setTimeout(playAiMove, AI_MOVE_DELAY);
    return true;
  }

  function onSquarePress(square: string) {
    if (!isPlayerTurn) return;

    if (selected && legalMoves.includes(square)) {
      tryMove(selected, square);
      return;
    }

    const piece = board.pieces[square];
    if (piece && isWhitePiece(piece)) {
      selectPiece(square);
      return;
    }

    clearSelection();
  }

  function onDragStart(square: string) {
    if (!isPlayerTurn) return;
    selectPiece(square);
  }

  function onDrop(from: string, to: string | null) {
    return to !== null && tryMove(from, to);
  }

  function canDragPiece(square: string) {
    if (!isPlayerTurn) return false;
    const piece = board.pieces[square];
    return Boolean(piece && isWhitePiece(piece));
  }

  const statusText = board.checkMate
    ? `Checkmate — ${board.turn === "white" ? "Black" : "White"} wins`
    : board.isFinished
      ? "Draw"
      : board.check
        ? `${board.turn === "white" ? "White" : "Black"} in check`
        : `${board.turn === "white" ? "Your" : "AI"} turn`;

  return {
    board,
    selected,
    legalMoves,
    statusText,
    resetGame,
    onSquarePress,
    onDragStart,
    onDrop,
    canDragPiece,
  };
}
