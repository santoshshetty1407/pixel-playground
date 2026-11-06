const canvas = document.querySelector("#room");
const ctx = canvas.getContext("2d");
const { width, height } = canvas;
const clueCount = document.querySelector("#clue-count");
const timerLabel = document.querySelector("#timer");
const scoreLabel = document.querySelector("#score");
const clueRows = [...document.querySelectorAll("#clue-list li")];
const codeDisplay = document.querySelector("#code-display");
const feedback = document.querySelector("#feedback");
const roomHint = document.querySelector("#room-hint");
const restartButton = document.querySelector("#restart");
const code = "324";
const clueText = [
  "Count the gold stars in the picture. That is digit 1.",
  "Count the red books on the shelf. That is digit 2.",
  "Count the bright stars outside the window. That is digit 3."
];
const clueSpots = [
  { x: 70, y: 76, width: 145, height: 160 },
  { x: 257, y: 150, width: 190, height: 150 },
  { x: 508, y: 58, width: 190, height: 150 }
];
let found = [false, false, false];
let entered = "";
let elapsed = 0;
let lastFrame;
let escaped = false;
let started = false;

function setFeedback(message, kind = "") {
  feedback.textContent = message;
  feedback.dataset.kind = kind;
}

function updateHud() {
  const seconds = Math.floor(elapsed);
  timerLabel.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  scoreLabel.textContent = Math.max(0, 1000 - seconds * 2);
  const count = found.filter(Boolean).length;
  clueCount.textContent = `${count} / 3`;
  codeDisplay.textContent = entered.padEnd(3, "_").split("").join(" ");
  codeDisplay.setAttribute("aria-label", entered ? `Code entered: ${entered.split("").join(" ")}` : "No code entered");
}

function resetGame() {
  found = [false, false, false];
  entered = "";
  elapsed = 0;
  escaped = false;
  started = false;
  lastFrame = undefined;
  clueRows.forEach((row, index) => {
    row.textContent = [
      "Click the picture to find clue 1.",
      "Click the bookshelf to find clue 2.",
      "Click the window to find clue 3."
    ][index];
    row.classList.add("empty-clue");
  });
  roomHint.textContent = "Click the glowing objects to look for clues.";
  setFeedback("You can also use your keyboard.");
  updateHud();
  canvas.focus();
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawStar(cx, cy, outer, inner, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPicture() {
  roundRect(83, 88, 118, 136, 5, "#98643e", "#603b2c");
  roundRect(91, 96, 102, 120, 2, "#d8ecdf", "#e9c98b");
  ctx.fillStyle = "#8bc9c5";
  ctx.fillRect(97, 102, 90, 108);
  ctx.fillStyle = "#f5dfa8";
  ctx.beginPath();
  ctx.arc(142, 132, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a9a7b";
  ctx.beginPath();
  ctx.moveTo(97, 195); ctx.lineTo(126, 157); ctx.lineTo(148, 183);
  ctx.lineTo(164, 161); ctx.lineTo(187, 195); ctx.closePath(); ctx.fill();
  drawStar(113, 117, 7, 3.2, "#ffd37d");
  drawStar(142, 110, 7, 3.2, "#ffd37d");
  drawStar(170, 119, 7, 3.2, "#ffd37d");
}

function drawShelf() {
  roundRect(271, 177, 169, 111, 5, "#80553d", "#4f392e");
  ctx.fillStyle = "#c28b58";
  ctx.fillRect(279, 216, 153, 8);
  ctx.fillRect(279, 271, 153, 8);
  const books = [
    ["#c95552", 286, 187, 22, 28], ["#417a91", 310, 182, 20, 33],
    ["#d17b45", 332, 190, 23, 25], ["#bc4b4a", 360, 184, 22, 31],
    ["#558467", 386, 189, 19, 26], ["#b69a63", 408, 181, 18, 34],
    ["#56819b", 288, 231, 25, 37], ["#4d7890", 317, 228, 22, 40],
    ["#d9b46b", 342, 233, 22, 35], ["#4e7763", 369, 225, 23, 43],
    ["#507d67", 398, 232, 28, 36]
  ];
  for (const [color, x, y, w, h] of books) {
    roundRect(x, y, w, h, 2, color, "#3e382f");
    ctx.fillStyle = "#f1d9aa99";
    ctx.fillRect(x + 4, y + 6, 2, h - 12);
  }
}

function drawWindow() {
  roundRect(520, 69, 166, 126, 7, "#77533e", "#513d33");
  roundRect(529, 78, 148, 108, 3, "#243f60", "#d7b77e");
  ctx.fillStyle = "#345d7b";
  ctx.fillRect(534, 83, 138, 98);
  ctx.fillStyle = "#92b5c8";
  ctx.fillRect(597, 83, 5, 98);
  ctx.fillRect(534, 128, 138, 5);
  drawStar(555, 102, 7, 3, "#fff0b8");
  drawStar(577, 111, 7, 3, "#fff0b8");
  drawStar(625, 98, 7, 3, "#fff0b8");
  drawStar(650, 115, 7, 3, "#fff0b8");
  ctx.fillStyle = "#e3bd79";
  ctx.beginPath();
  ctx.arc(649, 158, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawDoor() {
  const doorX = 682;
  const doorY = 207;
  roundRect(doorX, doorY, 93, 229, 7, escaped ? "#688e75" : "#8b6247", "#513c32");
  roundRect(doorX + 12, doorY + 14, 69, 92, 4, escaped ? "#7da48a" : "#a67852", "#634832");
  roundRect(doorX + 12, doorY + 116, 69, 94, 4, escaped ? "#7da48a" : "#a67852", "#634832");
  ctx.fillStyle = "#e5c27d";
  ctx.beginPath();
  ctx.arc(doorX + 72, doorY + 118, 5, 0, Math.PI * 2);
  ctx.fill();
  roundRect(doorX - 4, doorY + 150, 28, 43, 4, "#263748", "#d4bd8d");
  ctx.fillStyle = escaped ? "#9de4c0" : "#ffcf76";
  ctx.fillRect(doorX + 4, doorY + 158, 4, 4);
  ctx.fillRect(doorX + 11, doorY + 158, 4, 4);
  ctx.fillRect(doorX + 4, doorY + 165, 4, 4);
  ctx.fillRect(doorX + 11, doorY + 165, 4, 4);
}

function drawRoom(time = 0) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#d5bc91";
  ctx.fillRect(0, 0, width, 358);
  ctx.fillStyle = "#b98f66";
  ctx.fillRect(0, 358, width, 122);
  ctx.fillStyle = "#c99e72";
  for (let y = 370; y < height; y += 28) {
    ctx.fillRect(0, y, width, 2);
    for (let x = (y % 2) * 60; x < width; x += 150) ctx.fillRect(x, y - 26, 2, 28);
  }
  ctx.fillStyle = "#b59972";
  ctx.fillRect(0, 344, width, 14);

  // Rug and table
  roundRect(180, 330, 330, 92, 14, "#658f8a", "#456b68");
  ctx.strokeStyle = "#a9c4a3";
  ctx.lineWidth = 3;
  ctx.strokeRect(194, 341, 302, 70);
  roundRect(260, 299, 205, 74, 8, "#9a6a45", "#674831");
  ctx.fillStyle = "#b78254";
  ctx.fillRect(251, 294, 223, 15);
  ctx.fillStyle = "#684933";
  ctx.fillRect(277, 366, 12, 42);
  ctx.fillRect(435, 366, 12, 42);

  drawPicture();
  drawShelf();
  drawWindow();

  // Plant
  roundRect(475, 285, 55, 53, 7, "#b96848", "#854a39");
  ctx.fillStyle = "#6f9a72";
  for (const leaf of [[488, 284, -12], [503, 275, 5], [517, 284, 18], [500, 263, -5]]) {
    ctx.beginPath();
    ctx.ellipse(leaf[0], leaf[1], 8, 19, leaf[2] * Math.PI / 180, 0, Math.PI * 2);
    ctx.fill();
  }
  // Friendly toy on the table
  roundRect(324, 271, 40, 24, 6, "#e5ca92", "#806b50");
  ctx.fillStyle = "#534b40";
  ctx.beginPath(); ctx.arc(336, 282, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(352, 282, 2, 0, Math.PI * 2); ctx.fill();

  drawDoor();
  ctx.fillStyle = "#f0dfba";
  ctx.font = "bold 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", 728, 199);

  // Unfound clue objects softly glow to show where to click.
  const pulse = 0.14 + (Math.sin(time / 450) + 1) * 0.08;
  clueSpots.forEach((spot, index) => {
    if (found[index]) return;
    ctx.fillStyle = `rgba(255, 211, 125, ${pulse})`;
    ctx.strokeStyle = "#ffe4a4";
    ctx.lineWidth = 2;
    roundRect(spot.x, spot.y, spot.width, spot.height, 12, ctx.fillStyle, ctx.strokeStyle);
  });

  if (escaped) {
    ctx.fillStyle = "#0c1826b8";
    ctx.fillRect(0, 0, width, height);
    roundRect(204, 153, 392, 164, 18, "#152b3ff2", "#b5e8c7");
    ctx.fillStyle = "#f7f2e7";
    ctx.textAlign = "center";
    ctx.font = "800 34px system-ui";
    ctx.fillText("You escaped!", width / 2, 214);
    ctx.font = "18px system-ui";
    ctx.fillText("Great clue finding. Press Restart to play again.", width / 2, 252);
  }
}

function revealClue(index) {
  started = true;
  if (found[index]) {
    roomHint.textContent = clueText[index];
    return;
  }
  found[index] = true;
  clueRows[index].textContent = clueText[index];
  clueRows[index].classList.remove("empty-clue");
  const count = found.filter(Boolean).length;
  roomHint.textContent = `Clue ${index + 1} of 3 found! ${clueText[index]}`;
  if (count === 3) {
    setFeedback("All clues found! Enter the three numbers in order.", "success");
  } else {
    setFeedback(`Nice! ${3 - count} ${3 - count === 1 ? "clue" : "clues"} left to find.`);
  }
  updateHud();
}

function handleDoor() {
  started = true;
  if (escaped) return;
  const count = found.filter(Boolean).length;
  if (count < 3) {
    roomHint.textContent = `The door is locked. Find all 3 clues first (${count}/3 found).`;
    setFeedback(`Look for the ${3 - count} remaining glowing clue ${3 - count === 1 ? "object" : "objects"}.`);
    return;
  }
  setFeedback("Type the three-digit code, then press Open.");
}

function enterDigit(digit) {
  if (escaped) return;
  if (found.filter(Boolean).length < 3) {
    setFeedback("Find all 3 clues before entering the code.");
    return;
  }
  if (entered.length < 3) entered += String(digit);
  updateHud();
  setFeedback(entered.length === 3 ? "Code ready. Press Open or Enter." : "Keep going. You need 3 numbers.");
}

function clearCode() {
  entered = "";
  updateHud();
  setFeedback("Code cleared. Try again.");
}

function openDoor() {
  if (escaped) return;
  if (found.filter(Boolean).length < 3) {
    setFeedback("Find all 3 clues first, then try the door.");
    return;
  }
  if (entered.length !== 3) {
    setFeedback("Enter all three numbers first.", "error");
    return;
  }
  if (entered === code) {
    escaped = true;
    const finalScore = Math.max(0, 1000 - Math.floor(elapsed) * 2);
    scoreLabel.textContent = finalScore;
    roomHint.textContent = "The door is open. You made it out!";
    setFeedback(`You escaped with ${finalScore} points!`, "success");
    drawRoom(performance.now());
  } else {
    entered = "";
    updateHud();
    setFeedback("That code did not open the door. Check each clue in order.", "error");
    roomHint.textContent = "Read the clues from 1 to 3, then try again.";
  }
}

function handleRoomClick(event) {
  if (escaped) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * width / rect.width;
  const y = (event.clientY - rect.top) * height / rect.height;
  const clueIndex = clueSpots.findIndex(spot =>
    x >= spot.x && x <= spot.x + spot.width && y >= spot.y && y <= spot.y + spot.height
  );
  if (clueIndex !== -1) {
    revealClue(clueIndex);
  } else if (x >= 675 && y >= 195 && y <= 450) {
    handleDoor();
  } else {
    roomHint.textContent = "Nothing there yet. Try a glowing picture, the shelf, or the window.";
  }
}

document.querySelectorAll("[data-digit]").forEach(button => {
  button.addEventListener("click", () => enterDigit(button.dataset.digit));
});
document.querySelector('[data-action="clear"]').addEventListener("click", clearCode);
document.querySelector('[data-action="enter"]').addEventListener("click", openDoor);
restartButton.addEventListener("click", resetGame);
canvas.addEventListener("click", handleRoomClick);
window.addEventListener("keydown", event => {
  if (/^\d$/.test(event.key)) {
    enterDigit(event.key);
    event.preventDefault();
  } else if (event.key === "Backspace") {
    clearCode();
    event.preventDefault();
  } else if (event.key === "Enter") {
    openDoor();
    event.preventDefault();
  }
});

function frame(time) {
  if (lastFrame !== undefined && started && !escaped) {
    elapsed += Math.min((time - lastFrame) / 1000, 0.1);
    updateHud();
  }
  lastFrame = time;
  drawRoom(time);
  requestAnimationFrame(frame);
}

resetGame();
requestAnimationFrame(frame);
