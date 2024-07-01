const difficulty = document.getElementById("difficulty");
const board = document.getElementById("board");
//const winningScreen = document.getElementById('GameWonScreen');
const gameOverScreen = document.getElementById("GameOverScreen");
const gameScreen = document.getElementById("GameScreen");
const newGameBtn = document.getElementById("newGameBtn");
const resetBtn = document.getElementById("reset-btn");
const minesText = document.getElementById("mines");
const timeText = document.getElementById("time");

let firstClick = true;
//let revealListener, flagListener;
var columns = 9;
var rows = 9;
var mines = 10;
var revealedTiles = 0;
let timerInterval;

// Change the difficulty when clicked "New Game on the Game Screen"
resetBtn.addEventListener("click", () => {
  switch (difficulty.value) {
    case "Beginner":
      columns = 9;
      rows = 9;
      mines = 10;
      break;
    case "Intermediate":
      columns = 16;
      rows = 16;
      mines = 40;
      break;
    case "Expert":
      columns = 30;
      rows = 16;
      mines = 99;
      break;
    default:
      break;
  }
  startGame();
});
const startGame = () => {
  board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  gameOverScreen.style.display = "none";
  toggleStatistic(false);
  clearInterval(timerInterval);
  revealedTiles = 0;
  firstClick = true;
  updateText();
  drawBoard();
};

// Init new Game with the same difficulty
newGameBtn.addEventListener("click", startGame);

//generate the board depending on the difficulty
const drawBoard = () => {
  gameScreen.style.display = "block";
  clearBoard();
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < columns; c++) {
      //declaring the buttons
      const tile = document.createElement("button");
      tile.id = `${c}|${r}`;
      tile.className = "tile";
      //EventListener for right and left click
      tile.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
          revealTile(c, r); //reveal Tile when left clicked
        } else if (event.button === 2) {
          addFlag(c, r); //flag or unflag tile when right clicked
        }
      });

      //prevent the context menu from showing when right clicked
      tile.addEventListener("contextmenu", (event) => event.preventDefault());
      board.appendChild(tile);
    }
  }
  placeMines();
};

//place mines on the board
const placeMines = () => {
  for (let i = 0; i < mines; i++) {
    // Loop for every mine
    let minePlaced = false;
    while (!minePlaced) {
      // Break out of the loop when mine is placed
      let randomX = Math.floor(Math.random() * columns); // Random x coord
      let randomY = Math.floor(Math.random() * rows); // Random y coord
      let tile = document.getElementById(randomX + "|" + randomY); // Get the tile at the random coords

      if (!tile.classList.contains("mine")) {
        // Check if tile at this position is already a mine
        tile.classList.add("mine"); // If yes then add mine to the class list and mine is placed
        minePlaced = true;
      }
      // If not while loop gets repeated and other random coord are generated
    }
  }
};

// Count the mines of neighbouring tiles
function countMines(column, row) {
  let countMines = 0;
  for (let r = row - 1; r <= row + 1; r++) {
    // Loop through neighbouring tiles
    for (let c = column - 1; c <= column + 1; c++) {
      // Skip the current cell
      if (r === row && c === column) {
        continue;
      }

      // Get neighbourtile
      let neighbortile = document.getElementById(c + "|" + r);

      // Check if neighbourtile exits and if it is a mine
      if (neighbortile && neighbortile.classList.contains("mine")) {
        countMines++; // If yes increment the mines counter
      }
    }
  }
  return countMines;
}

// Reveal Tile when clicked
function revealTile(column, row) {
  if (firstClick) {
    // Start Timer by first click on tile
    firstClick = false;
    timerInterval = setInterval(timer, 1000);
  }
  const tile = document.getElementById(column + "|" + row); //get clicked tile
  if (!tile.classList.contains("flagged")) {
    tile.disabled = true; //make tile disabled so it can't be clicked again
    if (tile.classList.contains("mine")) {
      // Game Over if it is a mine
      tile.innerHTML = `<i class="fa-solid fa-bomb"></i>`;
      tile.style.backgroundColor = "var(--mine-color)";
      gameOver();
    } else {
      numberOfMines = countMines(column, row); // Get number of mines in neighbour-tiles
      if (numberOfMines > 0) {
        tile.textContent = numberOfMines; // Show the number of Mines
        revealedTiles++; // Increment the counter of revealed fields
      } else {
        tile.textContent = "";

        //TODO: open neighbor fields if the field is 0 and the neighbor is too
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = column - 1; c <= column + 1; c++) {
            if (r === row && c === column) {
              continue;
            }
            let neighbourTile = document.getElementById(`${c}|${r}`);
            if (
              neighbourTile &&
              !neighbourTile.classList.contains("mine") &&
              !neighbourTile.disabled
            ) {
              revealTile(c, r);
            }
          }
        }
        revealedTiles++;
      }

      if (revealedTiles === rows * columns - mines) {
        // Check if all fields with no mines are revealed
        gameWon(); // If yes the game is won
      }
    }
  }
}

//reveal all tiles
const revealAllTiles = () => {
  for (let r = rows - 1; r >= 0; r--) {
    // Loop through every tile
    for (let c = 0; c < columns; c++) {
      const tile = document.getElementById(c + "|" + r); // Get current tile
      tile.disabled = true;
      if (
        tile.classList.contains("flagged") ||
        tile.classList.contains("questionmark")
      ) {
        tile.innerHTML = "";
      }
      if (tile.classList.contains("mine")) {
        // If it is a mine add mine symbol and make it red
        tile.innerHTML = `<i class="fa-solid fa-bomb"></i>`;
      } else {
        // If it is not a mine get the count of mines in neighbour tiles and reveal it
        numberOfMines = countMines(c, r);
        if (numberOfMines != 0) {
          tile.textContent = numberOfMines;
        }
      }
    }
  }
};

//Show Game Over Screen
function gameOver() {
  const title = document.getElementById("gameOver-title");
  revealAllTiles();
  clearInterval(timerInterval);
  title.textContent = "Game Over";
  title.style.color = "var(--gameOverTitle)";
  title.style.textShadow = "0 0 10px var(--gameOverTitle)";
  let playedGames = localStorage.getItem("playedGames");
  if (playedGames) {
    localStorage.setItem(
      "playedGames",
      parseInt(localStorage.getItem("playedGames")) + 1
    );
  } else {
    localStorage.setItem("playedGames", 1);
  }
  updateStatistics();
  gameOverScreen.style.display = "flex";
}

//Show Game Won Screen
function gameWon() {
  const title = document.getElementById("gameOver-title");
  const time = timeText.textContent;
  const mineElements = document.getElementsByClassName("mine");
  for (const mine of mineElements) {
    mine.disabled = true;
    mine.innerHTML = `<i class="fa-solid fa-bomb"></i>`;
    if (mine.classList.contains("flagged")) {
      mine.classList.remove("flagged");
    } else if (mine.classList.contains("questionmark")) {
      mine.classList.remove("questionmark");
    }
  }
  clearInterval(timerInterval);
  title.textContent = "Game Won";
  title.style.color = "var(--gameWonTitle)";
  title.style.textShadow = "0 0 10px var(--gameWonTitle)";
  let playedGames = localStorage.getItem("playedGames");
  if (playedGames) {
    localStorage.setItem(
      "playedGames",
      parseInt(localStorage.getItem("playedGames")) + 1
    );
  } else {
    localStorage.setItem("playedGames", 1);
  }
  let wonGames = localStorage.getItem("wonGames");
  if (
    parseInt(localStorage.getItem("bestTime")) > parseInt(time) ||
    !localStorage.getItem("bestTime")
  ) {
    localStorage.setItem("bestTime", time);
  }
  if (wonGames) {
    localStorage.setItem(
      "wonGames",
      parseInt(localStorage.getItem("wonGames")) + 1
    );
  } else {
    localStorage.setItem("wonGames", 1);
  }
  updateStatistics();
  gameOverScreen.style.display = "flex";
}

// Clear up the GameBoard
const clearBoard = () => {
  board.innerHTML = "";
};

// Add or remove flag from given tile
const addFlag = (c, r) => {
  const tile = document.getElementById(c + "|" + r); // Get the tile
  if (tile.classList.contains("flagged")) {
    tile.classList.remove("flagged");
    minesText.textContent = parseInt(minesText.textContent) + 1;
    tile.classList.add("questionmark");
    tile.innerHTML = `<i class="fa-solid fa-question"></i>`;
  } else if (tile.classList.contains("questionmark")) {
    // If it's flagged remove the flag
    tile.classList.remove("questionmark");
    tile.innerHTML = "";
  } else {
    // Look if it's already flagged
    tile.classList.add("flagged"); // If it's not flagged make it flagged
    tile.innerHTML = `<i class="fa-solid fa-flag"></i>`;
    minesText.textContent = parseInt(minesText.textContent) - 1; // Decrement the mines counter for every flag
  }
};

//Update the timer and mines text if something changes
const updateText = () => {
  document.getElementById("bottom-text").style.display = "flex";
  minesText.textContent = mines;
  //clearInterval(timerInterval);
  //timerInterval = setInterval(timer, 1000);
  timeText.textContent = "0";
};
function timer() {
  timeText.textContent = parseInt(timeText.innerHTML) + 1;
}

const updateStatistics = () => {
  const time = timeText.textContent;
  const wonGames = localStorage.getItem("wonGames")
    ? parseInt(localStorage.getItem("wonGames"))
    : 0;
  const playedGames = localStorage.getItem("playedGames")
    ? parseInt(localStorage.getItem("playedGames"))
    : 0;
  document.getElementById("playedGames").textContent = playedGames;
  document.getElementById("wonGames").textContent = wonGames;
  document.getElementById("wonGamesPercent").textContent = wonGames
    ? Math.round((wonGames / playedGames) * 100) + "%"
    : 0 + "%";
  document.getElementById("playedTime").textContent = time;
  document.getElementById("bestTime").textContent = localStorage.getItem(
    "bestTime"
  )
    ? localStorage.getItem("bestTime")
    : "/";
};
const statisticBtn = document.getElementById("statisticBtn");
statisticBtn.addEventListener("click", () => {
  if (statisticBtn.textContent === "Show statistic") {
    toggleStatistic(true);
  } else {
    toggleStatistic(false);
  }
});

const toggleStatistic = (show) => {
  if (show) {
    updateStatistics();
    document.getElementById("statistic").style.display = "block";
    document.getElementById("statistic").innerHTML = document.getElementById(
      "screenStatistics"
    ).innerHTML;
    statisticBtn.textContent = "Hide statistic";
  } else {
    document.getElementById("statistic").style.display = "none";
    document.getElementById("statistic").innerHTML = "";
    statisticBtn.textContent = "Show statistic";
  }
};

startGame();

//Debugging
