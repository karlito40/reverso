import { reactive, computed } from "vue";
import {
  BOARD_SIZE,
  BLACK,
  WHITE,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  GAME_PLAYING,
  GAME_FINISHED,
  TIE,
} from "../constants";
import { createPawn } from "./pawn";
import { replaceAt } from "../libs/immutable";

function makeInitialGame() {
  return {
    state: GAME_PLAYING,
    turn: 0,
    activePlayer: WHITE,
    board: Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH })
    ),
    stack: [
      ...Array.from({ length: BOARD_SIZE / 2 }, () => createPawn(BLACK)),
      ...Array.from({ length: BOARD_SIZE / 2 }, () => createPawn(WHITE)),
    ],
    winner: null,
  };
}

export function useReverso() {
  const game = reactive(makeInitialGame());

  const blackStack = computed(() =>
    game.stack.filter((pawn) => pawn.color === BLACK)
  );
  const whiteStack = computed(() =>
    game.stack.filter((pawn) => pawn.color === WHITE)
  );

  function restart() {
    Object.assign(game, makeInitialGame());
  }

  function findPawnInStack(id) {
    return game.stack.find((pawn) => pawn.id === id);
  }

  function dropPawn(pawn, position /* {x,y} */) {
    if (canDropPawn(pawn, position)) {
      addPawnInBoard(pawn, position);
      removePawnInStack(pawn);
      nextTurn();
    }
  }

  function canDropPawn(pawn, { x, y }) {
    if (pawn.color !== game.activePlayer) return false; // not my turn to play
    if (game.board[y][x]) return false; // a pawn already exists at this position

    return true;
  }

  function nextTurn() {
    if (!game.stack.length) {
      game.state = GAME_FINISHED;
      game.winner = findWinner();
    } else {
      game.turn++;
      game.activePlayer = game.activePlayer === WHITE ? BLACK : WHITE;
    }
  }

  function findWinner() {
    const { whiteCount, blackCount } = countPawns();
    if (whiteCount === blackCount) {
      return TIE;
    }

    return whiteCount > blackCount ? WHITE : BLACK;
  }

  function countPawns() {
    return game.board.reduce(
      (acc, line) => {
        const pawns = line.filter((pawn) => !!pawn);
        for (const pawn of pawns) {
          if (pawn.color === WHITE) {
            acc.whiteCount++;
          } else {
            acc.blackCount++;
          }
        }

        return acc;
      },
      {
        whiteCount: 0,
        blackCount: 0,
      }
    );
  }

  function removePawnInStack(targetedPawn) {
    game.stack = game.stack.filter((pawn) => pawn.id !== targetedPawn.id);
  }

  function addPawnInBoard(pawn, { x, y }) {
    // game.board = replaceAt(game.board, atIndex, pawn);
    const row = [...game.board[y]];
    row[x] = pawn;
    game.board = replaceAt(game.board, y, row);

    reverseBoard({ x, y }, pawn);
  }

  function canReverse({ x, y }) {
    return !!game.board[y][x]?.color;
  }

  function reverseBoard({ x, y }, triggerBy) {
    horizontalReverse({ x, y }, triggerBy);
    verticalReverse({ x, y }, triggerBy);
    diagonalReverse({ x, y }, triggerBy);
  }

  function horizontalReverse({ x, y }, triggerBy) {
    if (!canReverse({ x, y })) return;

    const { color } = game.board[y][x];
    const line = game.board[y];

    const reversablePaws = findBoundary(line, {
      boundsOfColor: color,
      byPawn: triggerBy,
    });

    setColors(reversablePaws, color);
  }

  function verticalReverse({ x, y }, triggerBy) {
    if (!canReverse({ x, y })) return;

    const { color } = game.board[y][x];

    const column = [];
    for (let i = 0; i < game.board.length; i++) {
      column.push(game.board[i][x]);
    }

    const reversablePaws = findBoundary(column, {
      boundsOfColor: color,
      byPawn: triggerBy,
    });

    setColors(reversablePaws, color);
  }

  function diagonalReverse(position, triggerBy) {
    if (!canReverse(position)) return;

    const { color } = game.board[position.y][position.x];

    const diags = [getDiagonal_TL_BR(position), getDiagonal_BL_TR(position)];

    diags.forEach((diag) => {
      const reversablePaws = findBoundary(diag, {
        boundsOfColor: color,
        byPawn: triggerBy,
      });

      setColors(reversablePaws, color);
    });
  }

  function getDiagonal_TL_BR(position) {
    const diag = [];

    const lowestAxis = position.x < position.y ? "x" : "y";
    const maxDistance =
      lowestAxis === "x"
        ? position.x + (game.board.length - position.y)
        : position.y + (game.board.length - position.x);
    const delta = Math.abs(position.y - position.x);

    for (let i = 0; i < maxDistance; i++) {
      if (lowestAxis === "x") {
        diag.push(game.board[i + delta][i]);
      } else {
        diag.push(game.board[i][i + delta]);
      }
    }

    return diag;
  }

  function getDiagonal_BL_TR(position) {
    const diag = [];

    const zoneSource =
      position.x + position.y < game.board.length ? "top" : "bottom";

    const maxDistance =
      position.x + position.y < game.board.length
        ? position.x + position.y + 1
        : game.board.length -
          ((position.x + position.y) % game.board.length) -
          1;

    const shiftX = game.board.length - 1 - position.y;
    const lastPoint =
      zoneSource === "bottom"
        ? {
            x: position.x - shiftX,
            y: game.board.length - 1,
          }
        : {
            x: 0,
            y: maxDistance - 1,
          };

    for (let i = 0; i < maxDistance; i++) {
      diag.push(game.board[lastPoint.y--][lastPoint.x++]);
    }

    return diag;
  }

  function setColors(paws, color) {
    // TODO: do it in an immutable way
    paws.forEach((paw) => {
      paw.color = color;
    });
  }

  return {
    game,
    whiteStack,
    blackStack,

    findPawnInStack,
    dropPawn,
    restart,
  };
}

function findBoundary(lineOfPawns, { boundsOfColor, byPawn }) {
  let intervals = [[]];

  for (const pawn of lineOfPawns) {
    // on clot un interval lorsqu'on croise la couleur demandée
    if (!pawn) {
      intervals.push([]);
    } else {
      const currentInterval = intervals[intervals.length - 1];
      currentInterval.push(pawn);

      if (currentInterval.length > 1 && pawn.color === boundsOfColor) {
        intervals.push([pawn]);
      }
    }
  }

  return intervals
    .filter((bounds) => bounds.length > 2)
    .filter(
      (bounds) =>
        bounds[0].color === boundsOfColor &&
        bounds[bounds.length - 1].color === boundsOfColor
    )
    .filter((bounds) => {
      return bounds.some((pawn) => pawn.id === byPawn.id);
    })
    .flatMap((bounds) => bounds);
}
