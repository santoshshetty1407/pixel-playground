# The Little Lock Room

A friendly, self-contained escape-room game made with HTML, CSS, Canvas, and plain JavaScript. Find three simple visual clues, enter their numbers in order, and open the door. It runs offline and has no external dependencies.

## Play locally

1. Open `index.html` in a modern browser.
2. Click the three glowing objects: the picture, bookshelf, and window.
3. Read the clues and count the matching objects in the room.
4. Enter the three numbers in clue order, then choose **Open**. Use the number keys and Enter if you prefer.
5. Choose **Restart** to try again.

Your clue progress, timer, and score are shown above the room. The score starts at 1000 and gently decreases over time; there is no time limit.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Game layout, clue list, keypad, instructions, and HUD |
| `style.css` | Cozy colors, responsive layout, and accessible focus styles |
| `game.js` | Room art, clickable clue objects, code entry, scoring, and restart |
| `starter/` | The original small Canvas movement demo for workshop practice |
| `EXERCISES.md` | Optional ideas for extending the room game |

## Make it your own

Change the clue text and code near the top of `game.js`, then adjust the objects drawn in `drawPicture()`, `drawShelf()`, and `drawWindow()` to match. Keep each clue’s number in the same position in the code.
