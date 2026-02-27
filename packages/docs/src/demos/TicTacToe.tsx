import { createParser, createQueryState } from "solid-query-state";

type Cell = "X" | "O" | null;
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

const emptyBoard: Board = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

function serializeBoard(board: Board): string {
  return board.map((c) => (c ?? "-")).join("");
}

function parseBoard(s: string): Board | null {
  if (s.length !== 9) return null;
  const arr: Board = [...emptyBoard];
  for (let i = 0; i < 9; i++) {
    const c = s[i];
    if (c === "X" || c === "O") arr[i] = c;
    else if (c !== "-") return null;
  }
  return arr;
}


const parseAsBoard = createParser<string>({
  parse: (v) => {
    const b = parseBoard(v);
    return b ? serializeBoard(b) : null;
  },
  serialize: (v) => v,
}).withDefault(serializeBoard(emptyBoard));

export function TicTacToe() {
  const [boardStr, setBoardStr] = createQueryState("board", parseAsBoard);

  const board = (): Board => parseBoard(boardStr()) ?? emptyBoard;

  const winner = (): "X" | "O" | "draw" | null => {
    const b = board();
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b_i, c] of lines) {
      if (b[a] && b[a] === b[b_i] && b[a] === b[c]) return b[a];
    }
    if (b.every((c) => c !== null)) return "draw";
    return null;
  };

  const turn = (): "X" | "O" => {
    const b = board();
    const xCount = b.filter((c) => c === "X").length;
    const oCount = b.filter((c) => c === "O").length;
    return xCount <= oCount ? "X" : "O";
  };

  const play = (i: number) => {
    const b = board();
    if (b[i] || winner()) return;
    const next: Board = [...b];
    next[i] = turn();
    setBoardStr(serializeBoard(next));
  };

  const reset = () => setBoardStr(serializeBoard(emptyBoard));

  const w = winner();

  return (
    <div class="flex flex-col items-center gap-4">
      {w ? (
        <p class="text-lg font-medium text-white">
          {w === "draw" ? "Draw!" : `Winner: ${w}`}
        </p>
      ) : (
        <p class="text-zinc-400">Turn: {turn()}</p>
      )}
      <div class="grid grid-cols-3 gap-1">
        {board().map((cell, i) => (
          <button
            type="button"
            onClick={() => play(i)}
            disabled={!!cell || !!w}
            class="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-xl font-bold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cell ?? ""}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={reset}
        class="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium transition hover:bg-zinc-800"
      >
        Reset
      </button>
      <p class="text-xs text-zinc-500">
        Use browser Back/Forward to undo/redo moves
      </p>
    </div>
  );
}
