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

    reverseBoard({ x, y });
  }

  function canReverse({ x, y }) {
    return !!state.board[y][x]?.color;
  }

  function reverseBoard({ x, y }) {
    horizontalReverse({ x, y });
    verticalReverse({ x, y });
    diagonalReverse({ x, y });
  }

  function horizontalReverse({ x, y }) {
    if (!canReverse({ x, y })) return;

    const { color } = state.board[y][x];
    const line = state.board[y];

    const reversablePaws = findBoundary(line, {
      boundsOfColor: color,
      andContainsPosition: x,
    });

    setColors(reversablePaws, color);
  }

  function verticalReverse({ x, y }) {
    if (!canReverse({ x, y })) return;

    const { color } = state.board[y][x];

    const column = [];
    for (let i = 0; i < state.board.length; i++) {
      column.push(state.board[i][x]);
    }

    const reversablePaws = findBoundary(column, {
      boundsOfColor: color,
      andContainsPosition: y,
    });

    setColors(reversablePaws, color);
  }

  function diagonalReverse({ x, y }) {
    if (!canReverse({ x, y })) return;

    const { color } = state.board[y][x];
    // TODO
  }

  function setColors(paws, color) {
    // TODO: immutable way
    paws.forEach((paw) => {
      paw.color = color;
    });
  }

  return {
    state,
    whiteStack,
    blackStack,

    findPawnInStack,
    dropPawn,
  };
}

function findBoundary(lineOfPaws, { boundsOfColor, andContainsPosition }) {
  let intervals = [[]];

  const formatedPawns = lineOfPaws.map((paw, i) => ({ paw, position: i }));
  for (const { paw, position } of formatedPawns) {
    // on clot un interval lorsqu'on croise la couleur demandée
    if (!paw) {
      intervals.push([]);
    } else {
      const currentInterval = intervals[intervals.length - 1];
      currentInterval.push({ paw, position });

      if (currentInterval.length > 1 && paw.color === boundsOfColor) {
        intervals.push([{ paw, position }]);
      }
    }
  }

  return intervals
    .filter((bounds) => bounds.length > 2)
    .filter(
      (bounds) =>
        bounds[0].paw.color === boundsOfColor &&
        bounds[bounds.length - 1].paw.color === boundsOfColor
    )
    .filter((bounds) => {
      return bounds.some(({ position }) => position === andContainsPosition);
    })
    .flatMap((bounds) => bounds)
    .map(({ paw }) => paw);
}
