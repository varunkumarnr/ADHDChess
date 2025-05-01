// Fixed version of the chess game logic

const chessboard = document.getElementById("chessboard");
const tiles = ["a", "b", "c", "d", "e", "f", "g", "h"];
const themeSelector = document.getElementById("themeSelector");
const current_setup = [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];
let currentTheme = "theme1";
let currentPieceSelected = "";
let selectedSquare = {};

function createBoard() {
  console.log("Creating board with theme:", currentTheme);

  chessboard.innerHTML = "";
  const emptyCorner = document.createElement("div");
  emptyCorner.classList.add("label");
  chessboard.appendChild(emptyCorner);

  for (let i = 0; i < 8; i++) {
    const fileLabel = document.createElement("div");
    fileLabel.classList.add("label");
    fileLabel.textContent = tiles[i];
    chessboard.appendChild(fileLabel);
  }

  for (let row = 0; row < 8; row++) {
    const numbertile = document.createElement("div");
    numbertile.classList.add("label");
    numbertile.textContent = 8 - row;
    chessboard.appendChild(numbertile);

    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "white" : "black");
      square.dataset.row = row;
      square.dataset.col = col;

      const pieceName = current_setup[row][col];
      if (pieceName !== "") {
        addPieceToSquare(square, pieceName, row, col);
      }

      square.addEventListener("click", (e) => {
        if (
          currentPieceSelected !== "" &&
          selectedSquare.row !== undefined &&
          selectedSquare.col !== undefined
        ) {
          const moves = getLegalMoves(
            selectedSquare.row,
            selectedSquare.col,
            currentPieceSelected
          );

          const isLegalMove = moves.some(
            (move) =>
              move.row === parseInt(square.dataset.row) &&
              move.col === parseInt(square.dataset.col)
          );
          const prevSelected = document.querySelector(".selected");
          if (isLegalMove) {
            current_setup[selectedSquare.row][selectedSquare.col] = "";
            current_setup[row][col] = currentPieceSelected;

            const prevSquare = document.querySelector(
              `[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`
            );
            if (prevSquare.querySelector(".piece")) {
              prevSquare.querySelector(".piece").remove();
            }

            if (square.querySelector(".piece")) {
              square.querySelector(".piece").remove();
            }
            addPieceToSquare(square, currentPieceSelected, row, col);

            clearHighlightedMoves();
            if (prevSelected) {
              prevSelected.classList.remove("selected");
            }
            currentPieceSelected = "";
            selectedSquare = {};
            console.log("Piece moved successfully");
          }
        }
      });
      chessboard.appendChild(square);
    }
  }
}

function addPieceToSquare(square, pieceName, row, col) {
  const piece = document.createElement("img");
  piece.src = `images/${currentTheme}/${pieceName}.svg`;
  piece.classList.add("piece");
  piece.dataset.piece = pieceName;
  piece.dataset.row = row;
  piece.dataset.col = col;

  piece.addEventListener("click", function (e) {
    if (
      currentPieceSelected !== "" &&
      pieceName[0] !== currentPieceSelected[0]
    ) {
      return;
    }

    e.stopPropagation();

    const prevSelected = document.querySelector(".selected");
    if (prevSelected) {
      prevSelected.classList.remove("selected");
    }
    clearHighlightedMoves();

    currentPieceSelected = pieceName;
    selectedSquare = {
      row: parseInt(this.dataset.row),
      col: parseInt(this.dataset.col),
    };
    square.classList.add("selected");

    const moves = getLegalMoves(
      selectedSquare.row,
      selectedSquare.col,
      currentPieceSelected
    );
    highlightLegalMoves(moves);

    console.log(
      "Selected:",
      currentPieceSelected,
      "at position:",
      selectedSquare.row,
      selectedSquare.col,
      "with legal moves:",
      moves
    );
  });

  square.appendChild(piece);
  return piece;
}

function capturePiece(toPiece, fromPiece) {}

function isPawnMoveValid(fromRow, fromCol, toRow, toCol, piece) {
  const direction = piece[0] === "w" ? -1 : 1;
  const startRow = piece[0] === "w" ? 6 : 1;

  if (
    fromCol === toCol &&
    toRow === fromRow + direction &&
    current_setup[toRow][toCol] === ""
  ) {
    return true;
  }

  if (
    fromRow === startRow &&
    toRow === fromRow + 2 * direction &&
    fromCol === toCol &&
    current_setup[fromRow + direction][toCol] === "" &&
    current_setup[toRow][toCol] === ""
  ) {
    return true;
  }

  if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
    if (
      current_setup[toRow][toCol] !== "" &&
      current_setup[toRow][toCol][0] !== piece[0]
    ) {
      return true;
    }
  }

  return false;
}

function isRookMoveValid(fromRow, fromCol, toRow, toCol, piece) {
  if (fromRow !== toRow && fromCol !== toCol) return false;

  const rowDirection = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1;
  const colDirection = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowDirection;
  let currentCol = fromCol + colDirection;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (current_setup[currentRow][currentCol] !== "") {
      return false;
    }
    currentRow += rowDirection;
    currentCol += colDirection;
  }

  return (
    current_setup[toRow][toCol] === "" ||
    current_setup[toRow][toCol][0] !== piece[0]
  );
}

function isBishopMoveValid(fromRow, fromCol, toRow, toCol, piece) {
  const rowDirection = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1;
  const colDirection = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowDirection;
  let currentCol = fromCol + colDirection;

  if (Math.abs(toCol - fromCol) !== Math.abs(toRow - fromRow)) return false;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (current_setup[currentRow][currentCol] !== "") {
      return false;
    }
    currentRow += rowDirection;
    currentCol += colDirection;
  }
  return (
    current_setup[toRow][toCol] === "" ||
    current_setup[toRow][toCol][0] !== piece[0]
  );
}

function isKnightMoveValid(fromRow, fromCol, toRow, toCol, piece) {
  if (
    !(
      (Math.abs(toCol - fromCol) === 2 && Math.abs(toRow - fromRow) === 1) ||
      (Math.abs(toCol - fromCol) === 1 && Math.abs(toRow - fromRow) === 2)
    )
  )
    return false;
  return (
    current_setup[toRow][toCol] === "" ||
    current_setup[toRow][toCol][0] !== piece[0]
  );
}

function isKingMoveValid(fromRow, fromCol, toRow, toCol, piece) {
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  if (rowDiff > 1 || colDiff > 1) {
    return false;
  }

  return (
    current_setup[toRow][toCol] === "" ||
    current_setup[toRow][toCol][0] !== piece[0]
  );
}

function getLegalMoves(row, col, piece) {
  const legalMoves = [];

  if (!piece) return legalMoves;

  row = parseInt(row);
  col = parseInt(col);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === row && c === col) continue;
      if (piece[1] === "p" && isPawnMoveValid(row, col, r, c, piece)) {
        legalMoves.push({ row: r, col: c });
      } else if (piece[1] === "r" && isRookMoveValid(row, col, r, c, piece)) {
        legalMoves.push({ row: r, col: c });
      } else if (piece[1] === "b" && isBishopMoveValid(row, col, r, c, piece)) {
        legalMoves.push({ row: r, col: c });
      } else if (piece[1] === "n" && isKnightMoveValid(row, col, r, c, piece)) {
        legalMoves.push({ row: r, col: c });
      } else if (
        piece[1] === "q" &&
        (isRookMoveValid(row, col, r, c, piece) ||
          isBishopMoveValid(row, col, r, c, piece))
      ) {
        legalMoves.push({ row: r, col: c });
      } else if (piece[1] === "k" && isKingMoveValid(row, col, r, c, piece)) {
        legalMoves.push({ row: r, col: c });
      }
    }
  }
  return legalMoves;
}

function highlightLegalMoves(moves) {
  clearHighlightedMoves();

  moves.forEach((move) => {
    const square = document.querySelector(
      `[data-row="${move.row}"][data-col="${move.col}"]`
    );
    if (square) {
      square.classList.add("legal-move");
    }
  });
}

function clearHighlightedMoves() {
  const highlighted = document.querySelectorAll(".legal-move");
  highlighted.forEach((square) => {
    square.classList.remove("legal-move");
  });
}

createBoard();

themeSelector.addEventListener("change", (e) => {
  currentTheme = e.target.value;
  createBoard();
});
