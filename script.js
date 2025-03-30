(function (global) {
    class ConnectFour {
        constructor(options = {}) {
            this.rows = options.rows || 6;
            this.cols = options.cols || 7;
            this.playerColors = {
                1: options.playerColors?.[1] || 'red',
                2: options.playerColors?.[2] || 'yellow'
            };
            this.playerLabels = {
                1: options.playerLabels?.[1] || 'Rouge',
                2: options.playerLabels?.[2] || 'Jaune'
            };

            if (this.playerColors[1] === this.playerColors[2]) {
                throw new Error("Les deux joueurs ne peuvent pas avoir la même couleur !");
            }

            this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
            this.currentPlayer = 1;
            this.gameOver = false;
            this.moveHistory = [];
            this.playerScores = { 1: 0, 2: 0 };

            this.initializeDOM();
            this.setupEventListeners();
        }

        initializeDOM() {
            const boardElement = document.getElementById('board');
            boardElement.innerHTML = '';
            boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 60px)`;

            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.dataset.col = col;
                    boardElement.appendChild(cell);
                }
            }
        }

        setupEventListeners() {
            document.getElementById('board').addEventListener('click', (event) => this.handleCellClick(event));
            document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
            document.getElementById('undo-btn').addEventListener('click', () => this.undoLastMove());
            document.getElementById('reconfigure-btn').addEventListener('click', () => this.reconfigureGame());
        }

        handleCellClick(event) {
            if (this.gameOver) return;

            const col = parseInt(event.target.dataset.col);
            if (isNaN(col)) return;

            this.dropToken(col);
        }

        dropToken(col) {
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = this.currentPlayer;
                    this.moveHistory.push({ row, col });
                    this.updateBoard();

                    if (this.checkWin(row, col)) {
                        this.endGame(this.currentPlayer);
                    } else if (this.checkDraw()) {
                        this.endGame(null);
                    } else {
                        this.switchPlayer();
                    }
                    return;
                }
            }
        }

        updateBoard() {
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell, index) => {
                const row = Math.floor(index / this.cols);
                const col = index % this.cols;

                cell.classList.remove('player1', 'player2');
                if (this.board[row][col] !== null) {
                    cell.classList.add(`player${this.board[row][col]}`);
                    cell.style.backgroundColor = this.playerColors[this.board[row][col]];
                }
            });
        }

        switchPlayer() {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            document.getElementById('current-player').textContent = `Joueur ${this.playerLabels[this.currentPlayer]}, à vous de jouer !`;
        }

        checkWin(row, col) {
            const directions = [
                { dx: 0, dy: 1 },   // Horizontal
                { dx: 1, dy: 0 },   // Vertical
                { dx: 1, dy: 1 },   // Diagonale droite
                { dx: 1, dy: -1 }   // Diagonale gauche
            ];

            return directions.some(({ dx, dy }) => this.checkDirection(row, col, dx, dy));
        }

        checkDirection(row, col, dx, dy) {
            const player = this.board[row][col];
            let count = 1;

            let [r, c] = [row + dx, col + dy];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }

            [r, c] = [row - dx, col - dy];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                count++;
                r -= dx;
                c -= dy;
            }

            return count >= 4;
        }

        checkDraw() {
            return this.board.every(row => row.every(cell => cell !== null));
        }

        endGame(winner) {
            this.gameOver = true;
            const winnerText = document.getElementById('winner-text');

            if (winner === null) {
                winnerText.textContent = 'Partie Nulle !';
            } else {
                winnerText.textContent = `Victoire du joueur ${this.playerLabels[winner]} !`;
                this.playerScores[winner]++;
            }

            this.updateScoreDisplay();
            document.getElementById('game-over').style.display = 'flex';
        }

        updateScoreDisplay() {
            document.getElementById('score').textContent = `Score - ${this.playerLabels[1]}: ${this.playerScores[1]}, ${this.playerLabels[2]}: ${this.playerScores[2]}`;
        }

        undoLastMove() {
            if (this.moveHistory.length === 0) return;

            const lastMove = this.moveHistory.pop();
            this.board[lastMove.row][lastMove.col] = null;
            this.updateBoard();
            this.switchPlayer();
            this.gameOver = false;
            document.getElementById('game-over').style.display = 'none';
        }

        resetGame() {
            this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
            this.currentPlayer = 1;
            this.gameOver = false;
            this.moveHistory = [];

            this.updateBoard();
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('current-player').textContent = `Joueur ${this.playerLabels[1]}, à vous de jouer !`;
        }

        reconfigureGame() {
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('config-container').style.display = 'block';
            document.getElementById('game-over').style.display = 'none';
        }
    }

    document.getElementById('config-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        const player1Color = document.getElementById('player1-color').value;
        const player2Color = document.getElementById('player2-color').value;

        if (player1Color === player2Color) {
            alert("Les deux joueurs ne peuvent pas avoir la même couleur !");
            return;
        }

        const options = {
            rows,
            cols,
            playerColors: { 1: player1Color, 2: player2Color },
            playerLabels: { 1: 'Rouge', 2: 'Jaune' }
        };

        document.getElementById('config-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        global.game = new ConnectFour(options);
    });

    global.ConnectFour = ConnectFour;
})(window);