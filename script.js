function Gameboard() {
    const rows = 3;
    const cols = 3;
    let board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];

        for (let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeToken = (row, col, player) => {
        board[row][col].addToken(player);
    }

    const checkEndGame = (row, col, player) => {
        const tokenSum = player === 1 ? 3 : -3
        
        let rowSum = 0;
        let colSum = 0;
        let diagSum1 = 0;
        let diagSum2 = 0;

        /* for (let i = 0; i < rows; i++) {
            rowSum += board[i][col].getValue();
            colSum += board[row][i].getValue();
            diagSum1 += board[i][i].getValue();
            diagSum2 += board[i][cols - 1 - i].getValue();
        } */
       
        for (let i = 0; i < rows; i++) {
            isDraw = true;
            rowSum += board[i][col].getValue();
            colSum += board[row][i].getValue();
            diagSum1 += board[i][i].getValue();
            diagSum2 += board[i][cols - 1 - i].getValue();

            for (let j = 0; j < cols; j++) {
                if (board[i][j].getValue() === 0) {
                    isDraw = false;
                    break;
                }
            }
        }

        if (rowSum === tokenSum | colSum === tokenSum | diagSum1 === tokenSum | diagSum2 === tokenSum)
            return "win";
        if (isDraw) return "draw";
        
        return false;
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    const resetBoard = () => {
        board = [];
        for (let i = 0; i < rows; i++) {
            board[i] = [];
    
            for (let j = 0; j < cols; j++) {
                board[i].push(Cell());
            }
        }
    }

    return { getBoard, placeToken, printBoard, checkEndGame, resetBoard };
}

function Cell() {
    let value = 0;

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;
  
    return {
        addToken,
        getValue
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
    ) {
    const board = Gameboard();

    let players = [
        {
        name: playerOneName,
        token: 1
        },
        {
        name: playerTwoName,
        token: -1
        }
    ];

    let activePlayer = players[0];

    const changePlayerNames = (name1, name2) => {
        players[0].name = name1;
        players[1].name = name2;
    }

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (row, col) => {
        console.log(
        `Placing ${getActivePlayer().name}'s token into row ${row} and column ${col}...`
        );
        if (board.getBoard()[row][col].getValue() !== 0) {
            printNewRound();
            return "occupied_cell"
        }
        else {
            board.placeToken(row, col, getActivePlayer().token);
            if (board.checkEndGame(row, col, getActivePlayer().token) === "win") {
                return "win"
            }
            else if (board.checkEndGame(row, col, getActivePlayer().token) === "draw") {
                return "draw"
            }
            else {
                switchPlayerTurn();
                printNewRound();
                return "OK"
            }
        }
    };

    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
        changePlayerNames,
        getBoard: board.getBoard,
        resetBoard: board.resetBoard
    };
}
    
// const game = GameController();

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const occupiedCellDialog = document.querySelector("#occupied-cell-dialog");
    const closeDialogButton = document.querySelector("#close-button");
    closeDialogButton.addEventListener("click", () => {
        occupiedCellDialog.close();
    });

    const endGameDialog = document.querySelector("#endgame-dialog");
    const resetButton = document.querySelector("#reset-button");
    resetButton.addEventListener("click", () => {
        game.resetBoard();
        updateScreen();
        endGameDialog.close();
    });

    const resetButton2 = document.querySelector("#reset");
    resetButton2.addEventListener("click", () => {
        game.resetBoard();
        updateScreen();
    });

    const enterNamesBtn = document.querySelector("#names");
    const namesDialog = document.querySelector("#name-dialog");
    const confirmNamesBtn = document.querySelector("#confirmBtn");
    enterNamesBtn.addEventListener("click", () => namesDialog.showModal());
    confirmNamesBtn.addEventListener("click", (e) => {
        const form = document.querySelector("#name-form");
        // needs the name attribute in the form fields to create key value pair
        const {name1, name2} = Object.fromEntries(new FormData(form).entries());
        game.changePlayerNames(name1, name2);
        updateScreen();
        e.preventDefault();
        namesDialog.close();
      });
    

    const updateScreen = () => {
        boardDiv.textContent = "";
        let board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`
  
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
            const cellButton = document.createElement("button");
            cellButton.classList.add("cell");
            cellButton.dataset.row = rowIndex;
            cellButton.dataset.column = colIndex;
            const cellContent = () => {
                if (cell.getValue() === 1) return "X"
                if (cell.getValue() === -1) return "O"
                return ""
            };
            cellButton.textContent = cellContent();
            boardDiv.appendChild(cellButton);
            })
        })
    }

    function clickHandlerBoard(e) {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        // Make sure I've clicked a column and not the gaps in between
        if (!selectedColumn | !selectedRow) return;
        
        const message = game.playRound(selectedRow, selectedColumn);
        if (message === "occupied_cell") {
            occupiedCellDialog.showModal();
        }
        else {
            endGameDialog.textContent = "";
            endGameDialog.appendChild(resetButton);
            const para = document.createElement("p");
            
            if (message === "win") {
                para.textContent = `Game won by ${game.getActivePlayer().name}!`;
                endGameDialog.appendChild(para);
                endGameDialog.showModal();
            }

            else if (message === "draw") {
                para.textContent = `It's a draw!`
                endGameDialog.appendChild(para);
                endGameDialog.showModal();
            }
        }
        updateScreen();
    }
    boardDiv.addEventListener("click", clickHandlerBoard);
  
    // Initial render
    updateScreen();
  
    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}
  
ScreenController();