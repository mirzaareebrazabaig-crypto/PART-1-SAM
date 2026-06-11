// ==========================================================================
// PROJECT REWIND // INTERACTIVE LOGIC (SECURE BACKEND DRIVEN)
// ==========================================================================

(function() {

const GRID_COLS = 10;
const GRID_ROWS = 15;

const PREFILLED_CELLS = {};

let WORDS_METADATA = [];

const SECURE_KEY = "PROJECT_REWIND_KEY_2026";
let correctCellChars = {};

function decryptWord(hexStr) {
  let decrypted = "";
  for (let i = 0; i < hexStr.length; i += 2) {
    const byte = parseInt(hexStr.substr(i, 2), 16);
    const keyChar = SECURE_KEY.charCodeAt((i / 2) % SECURE_KEY.length);
    decrypted += String.fromCharCode(byte ^ keyChar);
  }
  return decrypted.toUpperCase();
}

// Grid cells data state
let cellStateMap = {};
let activeWord = null;
let activeDirection = "H"; // Default direction
let gridInitialized = false;

// Track correct cells verified by backend
let verifiedCorrectCells = new Set();

// Synthesize soft retro clicks using shared Web Audio API
function playSound(freq, type, duration, vol = 0.08) {
  try {
    if (!window.gameState.audioCtx) {
      window.gameState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (window.gameState.audioCtx.state === "suspended") {
      window.gameState.audioCtx.resume();
    }
    if (window.gameState.isMuted) return;

    const osc = window.gameState.audioCtx.createOscillator();
    const gainNode = window.gameState.audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, window.gameState.audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, window.gameState.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, window.gameState.audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(window.gameState.audioCtx.destination);
    
    osc.start();
    osc.stop(window.gameState.audioCtx.currentTime + duration);
  } catch (e) {
    // Fail silently
  }
}

function playKeypressSound() {
  playSound(140, "triangle", 0.05, 0.1);
  playSound(80, "sine", 0.03, 0.05);
}

function playFocusSound() {
  playSound(280, "sine", 0.08, 0.05);
}

function playSuccessSound() {
  playSound(330, "triangle", 0.2, 0.1);
  setTimeout(() => playSound(392, "triangle", 0.2, 0.1), 100);
  setTimeout(() => playSound(523, "triangle", 0.25, 0.1), 200);
  setTimeout(() => playSound(659, "triangle", 0.35, 0.1), 300);
}

function playErrorSound() {
  playSound(110, "sawtooth", 0.3, 0.15);
  playSound(90, "sawtooth", 0.4, 0.1);
}

// Build coordinate-based cell map
function buildGridData() {
  correctCellChars = {};

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      cellStateMap[`${r}_${c}`] = {
        isActive: false,
        words: [],
        startNumber: null
      };
    }
  }

  // Map words into cells
  WORDS_METADATA.forEach((w, wordIdx) => {
    w.decryptedWord = decryptWord(w.encWord);

    // Set start number label
    const startCellKey = `${w.y}_${w.x}`;
    cellStateMap[startCellKey].startNumber = w.number;

    for (let i = 0; i < w.length; i++) {
      const curY = w.y + (w.dir === "V" ? i : 0);
      const curX = w.x + (w.dir === "H" ? i : 0);
      const cellKey = `${curY}_${curX}`;
      
      const cell = cellStateMap[cellKey];
      cell.isActive = true;
      cell.words.push(wordIdx);
      correctCellChars[cellKey] = w.decryptedWord[i].toUpperCase();
    }
  });
}

// Render Grid elements
function renderGrid() {
  const gridContainer = document.getElementById("crossword-grid");
  gridContainer.innerHTML = "";

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cellData = cellStateMap[`${r}_${c}`];
      const cellEl = document.createElement("div");
      cellEl.classList.add("grid-cell");
      cellEl.setAttribute("data-row", r);
      cellEl.setAttribute("data-col", c);

      if (cellData.isActive) {
        cellEl.classList.add("cell-active");

        // Add Number label if start of a word
        if (cellData.startNumber) {
          const numEl = document.createElement("span");
          numEl.classList.add("cell-number");
          numEl.innerText = cellData.startNumber;
          cellEl.appendChild(numEl);
        }

        // Add Input Field
        const inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.maxLength = 1;
        inputEl.classList.add("cell-input");
        inputEl.setAttribute("id", `cell-${r}-${c}`);
        inputEl.setAttribute("data-row", r);
        inputEl.setAttribute("data-col", c);
        inputEl.setAttribute("aria-label", `Cell at Row ${r + 1}, Column ${c + 1}`);

        // Handle prefilled hint cells
        const cellKey = `${r}_${c}`;
        if (PREFILLED_CELLS[cellKey]) {
          inputEl.value = PREFILLED_CELLS[cellKey];
          inputEl.readOnly = true;
          cellEl.classList.add("cell-prefilled");
        }

        // Prevent inputs from accepting symbols, numbers, spaces
        inputEl.addEventListener("beforeinput", (e) => {
          if (e.target.readOnly) {
            e.preventDefault();
            return;
          }
          if (e.data && !/^[a-zA-Z]$/.test(e.data)) {
            e.preventDefault();
          }
        });

        cellEl.appendChild(inputEl);
      }

      gridContainer.appendChild(cellEl);
    }
  }
}

// Render Clue list panels
function renderClues() {
  const acrossList = document.getElementById("across-clues-list");
  const downList = document.getElementById("down-clues-list");

  acrossList.innerHTML = "";
  downList.innerHTML = "";

  [...WORDS_METADATA].sort((a, b) => a.number - b.number).forEach((w) => {
    const li = document.createElement("li");
    li.classList.add("clue-item");
    li.setAttribute("id", `clue-${w.number}`);
    li.setAttribute("data-word-num", w.number);
    li.innerHTML = `
      <span class="clue-number">${w.number}</span>
      <span class="clue-text">${w.clue}</span>
    `;

    // Click on clue focuses the starting cell of that word
    li.addEventListener("click", () => {
      focusCell(w.y, w.x, w.dir);
    });

    if (w.dir === "H") {
      acrossList.appendChild(li);
    } else {
      downList.appendChild(li);
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  const inputs = document.querySelectorAll(".cell-input");

  inputs.forEach((input) => {
    // Focus highlight handler
    input.addEventListener("focus", (e) => {
      const row = parseInt(e.target.dataset.row);
      const col = parseInt(e.target.dataset.col);
      
      const cellData = cellStateMap[`${row}_${col}`];
      let dirToUse = activeDirection;

      // If cell only belongs to one word, auto-select that word's direction
      if (cellData.words.length === 1) {
        const w = WORDS_METADATA[cellData.words[0]];
        dirToUse = w.dir;
      }

      highlightWord(row, col, dirToUse);
      playFocusSound();

      // Auto-select text on focus to allow easy typing overwrite
      setTimeout(() => e.target.select(), 10);
    });

    // Keydown handler (for arrows, backspace, and navigation)
    input.addEventListener("keydown", handleKeydown);

    // Input change handler
    input.addEventListener("input", handleInput);

    // Toggle direction at intersections
    let wasFocusedBeforeClick = false;
    input.addEventListener("mousedown", (e) => {
      wasFocusedBeforeClick = (document.activeElement === e.target);
    });
    input.addEventListener("pointerdown", (e) => {
      wasFocusedBeforeClick = (document.activeElement === e.target);
    });

    input.addEventListener("click", (e) => {
      const row = parseInt(e.target.dataset.row);
      const col = parseInt(e.target.dataset.col);
      const cellData = cellStateMap[`${row}_${col}`];

      if (wasFocusedBeforeClick && cellData.words.length > 1) {
        activeDirection = activeDirection === "H" ? "V" : "H";
        highlightWord(row, col, activeDirection);
        playFocusSound();
      }
    });
  });

  // Submit button
  document.getElementById("submit-reconstruction-btn").addEventListener("click", validateReconstruction);

  // Success Modal close handler
  document.getElementById("close-dossier-btn").addEventListener("click", () => {
    const modal = document.getElementById("success-overlay");
    modal.style.display = "none";
    playSound(400, "sine", 0.05, 0.05);
  });
}

// Focus a cell with a specified direction
function focusCell(row, col, dir) {
  const cellInput = document.getElementById(`cell-${row}-${col}`);
  if (cellInput) {
    activeDirection = dir;
    cellInput.focus();
    highlightWord(row, col, dir);
  }
}

// Highlight the currently active word
function highlightWord(row, col, dir) {
  activeDirection = dir;
  
  // Clear previous highlights
  document.querySelectorAll(".grid-cell").forEach((c) => {
    c.classList.remove("cell-focused", "word-highlighted");
  });
  document.querySelectorAll(".clue-item").forEach((c) => {
    c.classList.remove("clue-active");
  });

  const cellKey = `${row}_${col}`;
  const cellData = cellStateMap[cellKey];
  if (!cellData.isActive) return;

  // Highlight current cell container
  const activeCellContainer = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  if (activeCellContainer) {
    activeCellContainer.classList.add("cell-focused");
  }

  // Find which word this cell is associated with for the active direction
  let wordIdx = cellData.words.find(idx => WORDS_METADATA[idx].dir === dir);
  
  // Fallback if cell doesn't belong to a word in the current direction
  if (wordIdx === undefined && cellData.words.length > 0) {
    wordIdx = cellData.words[0];
    activeDirection = WORDS_METADATA[wordIdx].dir; // update active direction
  }

  if (wordIdx !== undefined) {
    const w = WORDS_METADATA[wordIdx];
    activeWord = w;

    // Highlight all cells belonging to this word
    for (let i = 0; i < w.length; i++) {
      const curY = w.y + (w.dir === "V" ? i : 0);
      const curX = w.x + (w.dir === "H" ? i : 0);
      const highlightCell = document.querySelector(`.grid-cell[data-row="${curY}"][data-col="${curX}"]`);
      if (highlightCell) {
        highlightCell.classList.add("word-highlighted");
      }
    }

    // Highlight corresponding clue item
    const clueEl = document.getElementById(`clue-${w.number}`);
    if (clueEl) {
      clueEl.classList.add("clue-active");
      const container = document.querySelector('.clues-container');
      if (container) {
        container.scrollTop = clueEl.offsetTop - (container.clientHeight / 2) + (clueEl.clientHeight / 2);
      }
    }
  }
}

// Handle typing inputs
function handleInput(e) {
  if (e.target.readOnly) {
    e.preventDefault();
    return;
  }
  // Prevent duplicate focus advancement if keydown already shifted the active element
  if (document.activeElement !== e.target) {
    return;
  }
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  
  e.target.value = e.target.value.toUpperCase();
  
  // Clear correct/incorrect states on edit
  const cellContainer = e.target.parentElement;
  if (cellContainer) {
    cellContainer.classList.remove("cell-correct", "cell-incorrect");
  }
  
  playKeypressSound();
  updateProgress();
  
  if (e.target.value !== "" && activeWord) {
    // Shift focus to next cell in current word
    moveFocusNext(row, col);
  }
}

// Handle keydown navigation
function handleKeydown(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (e.target.readOnly) {
    if (e.key === "Backspace") {
      e.preventDefault();
      moveFocusPrevious(row, col, false);
      return;
    }
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      moveFocusNext(row, col);
      return;
    }
  }

  // Overwrite existing character if a letter is typed
  if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    e.target.value = e.key.toUpperCase();
    
    // Clear correct/incorrect states on the parent grid-cell
    const cellContainer = e.target.parentElement;
    if (cellContainer) {
      cellContainer.classList.remove("cell-correct", "cell-incorrect");
    }
    
    playKeypressSound();
    updateProgress();
    moveFocusNext(row, col);
    return;
  }

  switch (e.key) {
    case "Backspace":
      e.preventDefault();
      playKeypressSound();
      if (e.target.value !== "") {
        e.target.value = "";
        if (e.target.parentElement) {
          e.target.parentElement.classList.remove("cell-correct", "cell-incorrect");
        }
        updateProgress();
        moveFocusPrevious(row, col, false); // move focus back but don't clear the previous cell
      } else {
        moveFocusPrevious(row, col, true); // if already empty, move focus back and clear it
      }
      break;

    case "ArrowRight":
      e.preventDefault();
      navigateGrid(row, col + 1);
      break;
    case "ArrowLeft":
      e.preventDefault();
      navigateGrid(row, col - 1);
      break;
    case "ArrowDown":
      e.preventDefault();
      navigateGrid(row + 1, col);
      break;
    case "ArrowUp":
      e.preventDefault();
      navigateGrid(row - 1, col);
      break;
    default:
      break;
  }
}

function navigateGrid(row, col) {
  if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
    const nextInput = document.getElementById(`cell-${row}-${col}`);
    if (nextInput) {
      nextInput.focus();
    }
  }
}

function moveFocusNext(row, col) {
  if (!activeWord) return;
  const isVert = activeWord.dir === "V";
  const nextY = row + (isVert ? 1 : 0);
  const nextX = col + (isVert ? 0 : 1);
  
  const indexInWord = isVert ? (nextY - activeWord.y) : (nextX - activeWord.x);
  if (indexInWord >= 0 && indexInWord < activeWord.length) {
    const nextInput = document.getElementById(`cell-${nextY}-${nextX}`);
    if (nextInput) {
      nextInput.focus();
    }
  }
}

function moveFocusPrevious(row, col, clearPrev = true) {
  if (!activeWord) return;
  const isVert = activeWord.dir === "V";
  const prevY = row - (isVert ? 1 : 0);
  const prevX = col - (isVert ? 0 : 1);
  
  const indexInWord = isVert ? (prevY - activeWord.y) : (prevX - activeWord.x);
  if (indexInWord >= 0 && indexInWord < activeWord.length) {
    const prevInput = document.getElementById(`cell-${prevY}-${prevX}`);
    if (prevInput) {
      if (clearPrev && !prevInput.readOnly) {
        prevInput.value = "";
        if (prevInput.parentElement) {
          prevInput.parentElement.classList.remove("cell-correct", "cell-incorrect");
        }
      }
      prevInput.focus();
      updateProgress();
    }
  }
}

// Local recalculation of progress based on verified correct answers
function updateProgress(incorrectList = []) {
  let totalActiveCells = 0;

  for (let key in cellStateMap) {
    const cell = cellStateMap[key];
    if (cell.isActive) {
      totalActiveCells++;
      const [r, c] = key.split("_");
      const input = document.getElementById(`cell-${r}-${c}`);
      
      const isIncorrect = incorrectList.includes(key);
      const correctChar = correctCellChars[key];
      
      if (input && input.value.toUpperCase() === correctChar && !isIncorrect) {
        verifiedCorrectCells.add(key);
      } else {
        verifiedCorrectCells.delete(key);
      }
    }
  }

  const percentage = totalActiveCells > 0 ? Math.round((verifiedCorrectCells.size / totalActiveCells) * 100) : 0;
  
  document.getElementById("progress-percentage").innerText = `${percentage}%`;
  document.getElementById("progress-bar-fill").style.width = `${percentage}%`;

  // Update solved class for each clue in the list
  WORDS_METADATA.forEach((w) => {
    let isWordSolved = true;
    for (let i = 0; i < w.length; i++) {
      const curY = w.y + (w.dir === "V" ? i : 0);
      const curX = w.x + (w.dir === "H" ? i : 0);
      const cellKey = `${curY}_${curX}`;
      if (!verifiedCorrectCells.has(cellKey)) {
        isWordSolved = false;
        break;
      }
    }
    
    const clueEl = document.getElementById(`clue-${w.number}`);
    if (clueEl) {
      if (isWordSolved) {
        clueEl.classList.add("clue-solved");
      } else {
        clueEl.classList.remove("clue-solved");
      }
    }
  });

  if (window.saveGameState) {
    window.saveGameState();
  }
}

// Final check and popup sequence calling backend api
async function validateReconstruction() {
  // Clear any existing special highlights
  document.querySelectorAll(".grid-cell").forEach(cell => {
    cell.classList.remove("cell-special-highlight");
  });

  // Package user inputs
  const userAnswers = {};
  for (let key in cellStateMap) {
    const cell = cellStateMap[key];
    if (cell.isActive) {
      const [r, c] = key.split("_");
      const input = document.getElementById(`cell-${r}-${c}`);
      userAnswers[key] = input ? input.value : '';
    }
  }

  try {
    const response = await fetch('/api/submit-crossword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.gameState.sessionToken,
        answers: userAnswers
      })
    });
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.success) {
      // Trigger Success Sequence
      window.gameState.crosswordCompleted = true;
      window.gameState.totalTime = data.formatted;
      window.gameState.secretCells = data.secretCells; // Save secret cells in gameState!
      playSuccessSound();
      
      // Add success flash effect
      document.querySelectorAll(".grid-cell.cell-active").forEach(cell => {
        cell.classList.add("cell-validated-correct");
        cell.classList.add("cell-correct"); // Persistent green highlight
        cell.classList.remove("cell-incorrect");
      });
      
      // Highlight the special cells!
      if (data.secretCells) {
        data.secretCells.forEach(cell => {
          const cellEl = document.querySelector(`.grid-cell[data-row="${cell.r}"][data-col="${cell.c}"]`);
          if (cellEl) {
            cellEl.classList.add("cell-special-highlight");
          }
        });
      }

      // Disable all crossword inputs
      document.querySelectorAll(".cell-input").forEach(input => {
        input.disabled = true;
      });

      // Disable submit button
      const submitBtn = document.getElementById("submit-reconstruction-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "STABILIZED";
      }

      // Update progress bar to 100%
      document.getElementById("progress-percentage").innerText = "100%";
      document.getElementById("progress-bar-fill").style.width = "100%";

      // Update final elapsed time display
      document.getElementById("crossword-final-time").innerHTML = `<span class="check">[✓]</span> TOTAL TIME ELAPSED: ${data.formatted}`;
      
      // Ensure all clues are crossed out in successful verification
      updateProgress([]);

      // Open success dossier popup
      setTimeout(() => {
        window.showCustomAlert("Unscramble the letters to obtain the password of Sam's computer present in room of age 15", () => {
          const modal = document.getElementById("success-overlay");
          modal.style.display = "flex";
        });
      }, 600);
      
    } else {
      // Trigger Failure Shake & Glitch Feedback
      playErrorSound();
      const newspaper = document.getElementById("newspaper");
      
      newspaper.classList.add("shake-animation");
      setTimeout(() => {
        newspaper.classList.remove("shake-animation");
      }, 500);

      // Highlight failed cells returned by server
      const failedSet = new Set(data.failedCells || []);
      
      document.querySelectorAll(".grid-cell.cell-active").forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        const key = `${r}_${c}`;
        const input = document.getElementById(`cell-${r}-${c}`);
        
        if (input && input.value !== "") {
          if (failedSet.has(key)) {
            cell.classList.add("cell-incorrect");
            cell.classList.remove("cell-correct");
            
            // Temporary red glow
            cell.style.boxShadow = "inset 0 0 8px rgba(231, 76, 60, 0.9)";
            setTimeout(() => {
              cell.style.boxShadow = "";
            }, 2000);
          } else {
            cell.classList.add("cell-correct");
            cell.classList.remove("cell-incorrect");
          }
        } else {
          cell.classList.remove("cell-correct", "cell-incorrect");
        }
      });
      
      // Update client progress bar and correct clues lists
      updateProgress(data.failedCells);
    }
  } catch (err) {
    console.error('Error validating crossword:', err);
    alert('Failed to submit crossword validation. Check server connection.');
  }
}

// Export initialization function globally
window.initCrosswordGrid = async function() {
  if (gridInitialized) return;
  
  try {
    const response = await fetch('/api/crossword-metadata');
    if (!response.ok) {
      console.error('Failed to load crossword metadata');
      return;
    }
    WORDS_METADATA = await response.json();
    gridInitialized = true;

    buildGridData();
    renderGrid();
    
    // Restore saved answers from localStorage if any
    try {
      const savedStateStr = localStorage.getItem('project_rewind_game_state');
      if (savedStateStr) {
        const savedState = JSON.parse(savedStateStr);
        if (savedState && savedState.crosswordInputs) {
          for (let key in savedState.crosswordInputs) {
            const [r, c] = key.split("_");
            const input = document.getElementById(`cell-${r}-${c}`);
            if (input && !PREFILLED_CELLS[key]) {
              input.value = savedState.crosswordInputs[key];
            }
          }
        }
      }
    } catch(e) {
      console.error("Failed to restore crossword inputs:", e);
    }

    renderClues();
    setupEventListeners();
    
    // Check if crossword was already completed in saved state
    let wasCompleted = false;
    let savedSecretCells = null;
    try {
      const savedStateStr = localStorage.getItem('project_rewind_game_state');
      if (savedStateStr) {
        const savedState = JSON.parse(savedStateStr);
        if (savedState && savedState.crosswordCompleted) {
          wasCompleted = true;
          window.gameState.crosswordCompleted = true;
          window.gameState.totalTime = savedState.totalTime;
          savedSecretCells = savedState.secretCells;
        }
      }
    } catch(e) {}

    if (wasCompleted) {
      // Add success styles and disable inputs
      document.querySelectorAll(".grid-cell.cell-active").forEach(cell => {
        cell.classList.add("cell-correct");
      });
      document.querySelectorAll(".cell-input").forEach(input => {
        input.disabled = true;
      });
      // Disable submit button
      const submitBtn = document.getElementById("submit-reconstruction-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "STABILIZED";
      }
      document.getElementById("progress-percentage").innerText = "100%";
      document.getElementById("progress-bar-fill").style.width = "100%";
      if (window.gameState.totalTime) {
        document.getElementById("crossword-final-time").innerHTML = `<span class="check">[✓]</span> TOTAL TIME ELAPSED: ${window.gameState.totalTime}`;
      }
      
      // Highlight the special cells!
      if (savedSecretCells) {
        savedSecretCells.forEach(cell => {
          const cellEl = document.querySelector(`.grid-cell[data-row="${cell.r}"][data-col="${cell.c}"]`);
          if (cellEl) {
            cellEl.classList.add("cell-special-highlight");
          }
        });
      }
      updateProgress([]);
    } else {
      updateProgress(Object.keys(cellStateMap)); // initialize progress
    }
  } catch (err) {
    console.error('Error initializing crossword:', err);
  }
};

})();
