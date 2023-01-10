import { reactive, computed } from "vue";
import {
  BOARD_SIZE,
  BLACK,
  WHITE,
  BOARD_HEIGHT,
  BOARD_WIDTH,
} from "../constants";
import { createPawn } from "./pawn";
import { replaceAt } from "../libs/immutable";

export function useReverso() {
  const state = reactive({
    turn: 0,
    activePlayer: WHITE,
    board: Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH })
    ),
    stack: [
      ...Array.from({ length: BOARD_SIZE / 2 }, () => createPawn(BLACK)),
      ...Array.from({ length: BOARD_SIZE / 2 }, () => createPawn(WHITE)),
    ],
  });

  const blackStack = computed(() =>
    state.stack.filter((pawn) => pawn.color === BLACK)
  );
  const whiteStack = computed(() =>
    state.stack.filter((pawn) => pawn.color === WHITE)
  );

  function findPawnInStack(id) {
    return state.stack.find((pawn) => pawn.id === id);
  }

  function dropPawn(pawn, position /* {x,y} */) {
    if (canDropPawn(pawn, position)) {
      addPawnInBoard(pawn, position);
      removePawnInStack(pawn);
      nextTurn();
    }
  }

  function canDropPawn(pawn, { x, y }) {
    if (pawn.color !== state.activePlayer) return false; // not my turn to play
    if (state.board[y][x]) return false; // a pawn already exists at this position

    return true;
  }

  function nextTurn() {
    state.turn++;
    state.activePlayer = state.activePlayer === WHITE ? BLACK : WHITE;
  }

  function removePawnInStack(targetedPawn) {
    state.stack = state.stack.filter((pawn) => pawn.id !== targetedPawn.id);
  }

  function addPawnInBoard(pawn, { x, y }) {
    // state.board = replaceAt(state.board, atIndex, pawn);
    const row = [...state.board[y]];
    row[x] = pawn;
    state.board = replaceAt(state.board, y, row);
  }

  return {
    state,
    whiteStack,
    blackStack,

    findPawnInStack,
    dropPawn,
  };
}
