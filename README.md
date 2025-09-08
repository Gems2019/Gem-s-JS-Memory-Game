# Gem's JS Memory Game

[Live Demo on Netlify](https://gemsjsgame.netlify.app)

## Overview
This is an interactive memory game built with object-oriented JavaScript, HTML, and CSS. The game challenges users to remember the original order of colored buttons after they are scrambled on the screen.

## Features
- Choose between 3 and 7 buttons to play with
- Buttons are displayed in a row with random colors
- After a short pause, buttons are scrambled multiple times
- Buttons never overlap or leave the game area
- User must click the buttons in their original order
- Success and error messages guide the user
- All messages are managed in a separate file for easy localization

## How to Play
1. Open `index.html` in your browser.
2. Enter a number between 3 and 7 in the input box and click "Go!".
3. Memorize the order of the colored buttons.
4. After a pause, the buttons will scramble several times.
5. When the numbers disappear, click the buttons in the order they originally appeared.
6. If you succeed, you'll see "Excellent memory!". If you make a mistake, the correct order will be revealed.

## Project Structure
```
index.html
css/
  style.css
js/
  script.js
lang/
  messages/
    en/
      user.js
```

- `index.html`: Main HTML file
- `css/style.css`: All styling for the game
- `js/script.js`: Main game logic (object-oriented JavaScript)
- `lang/messages/en/user.js`: All user-facing messages

## How to Run Locally
1. Clone or download this repository.
2. Open `index.html` in your web browser (no server required).

## How to Upload Changes to GitHub
1. Make your changes in the project folder.
2. In the terminal, run:
   ```sh
   git add .
   git commit -m "Describe your changes"
   git push -u origin main
   ```

## Notes
- No server-side code is required.
- All code is separated into appropriate files for clarity and maintainability.
- The game is fully responsive and works in modern browsers.

---
**Created by Gem. Powered by object-oriented JavaScript.**
