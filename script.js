const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const statusText = document.getElementById('game-status');
const restartButton = document.getElementById('restart-button');
const aiToggle = document.getElementById('ai-toggle');

let isXTurn = true;
let gameActive = true;
let playAgainstAI = false;

const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

startGame();

aiToggle.addEventListener('change', () => {
  playAgainstAI = aiToggle.checked;
  startGame();
});

restartButton.addEventListener('click', startGame);

function startGame() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });
  isXTurn = true;
  gameActive = true;
  setStatusText();
}

function handleClick(e) {
  if (!gameActive) return;

  const cell = e.target;
  const currentPlayer = isXTurn ? 'X' : 'O';

  makeMove(cell, currentPlayer);

  if (checkWin(currentPlayer)) {
    statusText.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  if (isDraw()) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  isXTurn = !isXTurn;
  setStatusText();

  // AI Move
  if (playAgainstAI && !isXTurn && gameActive) {
    setTimeout(() => {
      aiMove();
    }, 500); // slight delay for realism
  }
}

function makeMove(cell, player) {
  cell.textContent = player;
  cell.classList.add('taken');
  cell.removeEventListener('click', handleClick);
}

function aiMove() {
  const bestMove = getBestMove();
  if (bestMove !== null) {
    makeMove(cells[bestMove], 'O');

    if (checkWin('O')) {
      statusText.textContent = "Computer wins!";
      gameActive = false;
      return;
    }

    if (isDraw()) {
      statusText.textContent = "It's a draw!";
      gameActive = false;
      return;
    }

    isXTurn = true;
    setStatusText();
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = null;

  cells.forEach((cell, index) => {
    if (cell.textContent === '') {
      cell.textContent = 'O';
      let score = minimax(cells, 0, false);
      cell.textContent = '';
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });

  return move;
}

function minimax(boardState, depth, isMaximizing) {
  if (checkWin('O')) return 1;
  if (checkWin('X')) return -1;
  if (isDraw()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    cells.forEach((cell, i) => {
      if (cell.textContent === '') {
        cell.textContent = 'O';
        let score = minimax(cells, depth + 1, false);
        cell.textContent = '';
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    cells.forEach((cell, i) => {
      if (cell.textContent === '') {
        cell.textContent = 'X';
        let score = minimax(cells, depth + 1, true);
        cell.textContent = '';
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
}

function checkWin(player) {
  return winCombos.some(combo => {
    return combo.every(index => cells[index].textContent === player);
  });
}

function isDraw() {
  return [...cells].every(cell => cell.textContent !== '');
}

function setStatusText() {
  statusText.textContent = playAgainstAI && !isXTurn
    ? "Computer's turn"
    : `Player ${isXTurn ? 'X' : 'O'}'s turn`;
}
