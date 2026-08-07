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
  // Set once the AI has picked its move, before it's applied to the game, so
  // the UI can glide the piece the same way a player's move does.
  const [pendingAiMove, setPendingAiMove] = useState<{
    from: string;
    to: string;
  } | null>(null);
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
    setPendingAiMove(null);
    setBoard(next.exportJson());
  }

  function playAiMove() {
    // Runs on a delay, so read the ref rather than the game captured at schedule time.
    const current = gameRef.current;
    if (!current) return;

    const state = current.exportJson();
    if (state.isFinished || state.turn !== "black") return;

    try {
      // Pick the move but don't apply it yet, so the UI can glide the piece
      // there first, just like it does for the player's own moves.
      const { from, to } = current.board.calculateAiMove(AI_LEVEL);
      setPendingAiMove({ from, to });
    } catch {
      // No legal AI move (draw / finished)
    }
  }

  function commitAiMove(from: string, to: string) {
    const current = gameRef.current;
    if (!current) return;

    try {
      current.move(from, to);
    } catch {
      // Board changed unexpectedly since the move was picked; drop it.
    }
    setPendingAiMove(null);
    setBoard(current.exportJson());
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

  function isLegalMove(from: string, to: string) {
    return isPlayerTurn && legalMovesFrom(from).includes(to);
  }

  function tryMove(from: string, to: string) {
    if (!isLegalMove(from, to)) return false;

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
    isLegalMove,
    pendingAiMove,
    commitAiMove,
  };
}
