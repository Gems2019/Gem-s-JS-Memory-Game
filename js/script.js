// Memory Game - Object-Oriented JavaScript Implementation
// Using ChatGPT assistance for code structure and game logic and css file

// Constants
const MIN_BUTTONS = 3;
const MAX_BUTTONS = 7;
const BUTTON_WIDTH = 160; // 10em in pixels (approximate)
const BUTTON_HEIGHT = 80; // 5em in pixels (approximate)
const SCRAMBLE_INTERVAL = 2000; // 2 seconds
const PAUSE_MULTIPLIER = 1000; // 1 second per button

// GameButton Class - Represents individual game buttons
class GameButton {
    constructor(number, color) {
        this.number = number;
        this.color = color;
        this.element = null;
        this.originalPosition = { x: 0, y: 0 };
        this.currentPosition = { x: 0, y: 0 };
        this.isClickable = false;
        this.isNumberVisible = true;
    }

    createElement() {
        this.element = document.createElement('button');
        this.element.className = 'game-button';
        this.element.style.backgroundColor = this.color;
        this.element.textContent = this.number;
        this.element.disabled = true;
        
        this.element.addEventListener('click', () => {
            if (this.isClickable) {
                window.memoryGame.handleButtonClick(this.number);
            }
        });
        
        return this.element;
    }

    setPosition(x, y) {
        this.currentPosition = { x, y };
        if (this.element) {
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
        }
    }

    setOriginalPosition(x, y) {
        this.originalPosition = { x, y };
        this.setPosition(x, y);
    }

    hideNumber() {
        this.isNumberVisible = false;
        if (this.element) {
            this.element.classList.add('hidden-number');
        }
    }

    showNumber() {
        this.isNumberVisible = true;
        if (this.element) {
            this.element.classList.remove('hidden-number');
        }
    }

    makeClickable() {
        this.isClickable = true;
        if (this.element) {
            this.element.disabled = false;
        }
    }

    makeUnclickable() {
        this.isClickable = false;
        if (this.element) {
            this.element.disabled = true;
        }
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// WindowManager Class - Handles browser window dimensions and positioning
class WindowManager {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.gameArea = null;
        this.updateDimensions();
    }

    updateDimensions() {
        this.gameArea = document.getElementById('gameArea');
        if (this.gameArea) {
            const rect = this.gameArea.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
        }
    }

    getRandomPosition() {
        this.updateDimensions();
        const maxX = Math.max(0, this.width - BUTTON_WIDTH);
        const maxY = Math.max(0, this.height - BUTTON_HEIGHT);
        
        return {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    }

    getRandomPositionWithoutCollision(existingPositions, maxAttempts = 50) {
        this.updateDimensions();
        const maxX = Math.max(0, this.width - BUTTON_WIDTH);
        const maxY = Math.max(0, this.height - BUTTON_HEIGHT);
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const newPosition = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
            
            // Check if this position collides with any existing button
            let hasCollision = false;
            for (const existingPos of existingPositions) {
                if (this.checkCollision(newPosition, existingPos)) {
                    hasCollision = true;
                    break;
                }
            }
            
            if (!hasCollision) {
                return newPosition;
            }
        }
        
        // If we can't find a non-colliding position after max attempts,
        // return a random position (fallback to prevent infinite loops)
        return {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    }

    checkCollision(pos1, pos2) {
        // Add some padding to prevent buttons from being too close
        const padding = 10;
        const effectiveWidth = BUTTON_WIDTH + padding;
        const effectiveHeight = BUTTON_HEIGHT + padding;
        
        return !(pos1.x + effectiveWidth < pos2.x ||
                pos2.x + effectiveWidth < pos1.x ||
                pos1.y + effectiveHeight < pos2.y ||
                pos2.y + effectiveHeight < pos1.y);
    }

    getInitialPositions(buttonCount) {
        this.updateDimensions();
        const positions = [];
        const spacing = 100; // Space between buttons
        
        // Calculate how many buttons can actually fit per row considering spacing
        // Each button needs: BUTTON_WIDTH + spacing, except the last one doesn't need trailing spacing
        // Formula: (width - spacing) / (BUTTON_WIDTH + spacing)
        const buttonsPerRow = Math.floor((this.width - spacing) / (BUTTON_WIDTH + spacing));
        
        // Ensure at least 1 button per row to prevent division by zero
        const effectiveButtonsPerRow = Math.max(1, buttonsPerRow);
        
        for (let i = 0; i < buttonCount; i++) {
            const row = Math.floor(i / effectiveButtonsPerRow);
            const col = i % effectiveButtonsPerRow;
            
            positions.push({
                x: col * (BUTTON_WIDTH + spacing) + spacing,
                y: row * (BUTTON_HEIGHT + spacing) + spacing
            });
        }
        
        return positions;
    }
}

// GameController Class - Main game logic and state management
class GameController {
    constructor() {
        this.buttons = [];
        this.windowManager = new WindowManager();
        this.gameState = 'idle'; // idle, displaying, scrambling, playing, ended
        this.currentClickIndex = 0;
        this.scrambleCount = 0;
        this.maxScrambles = 0;
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
        
        this.initializeEventListeners();
        this.loadMessages();
    }

    initializeEventListeners() {
        const startButton = document.getElementById('startButton');
        const buttonCountInput = document.getElementById('buttonCount');
        
        startButton.addEventListener('click', () => this.startGame());
        buttonCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }

    loadMessages() {
        const label = document.getElementById('buttonCountLabel');
        if (label && window.MESSAGES) {
            label.textContent = window.MESSAGES.BUTTON_COUNT_LABEL;
        }
    }

    startGame() {
        if (this.gameState === 'scrambling') return;
        
        const buttonCount = this.getButtonCount();
        if (!buttonCount) return;
        
        this.resetGame();
        this.createButtons(buttonCount);
        this.displayButtons();
        this.scheduleScrambling(buttonCount);
    }

    getButtonCount() {
        const input = document.getElementById('buttonCount');
        const count = parseInt(input.value);
        
        if (isNaN(count) || count < MIN_BUTTONS || count > MAX_BUTTONS) {
            this.showMessage(window.MESSAGES?.INVALID_INPUT || 'Please enter a number between 3 and 7', 'error');
            return null;
        }
        
        return count;
    }

    resetGame() {
        this.buttons.forEach(button => button.remove());
        this.buttons = [];
        this.gameState = 'idle';
        this.currentClickIndex = 0;
        this.scrambleCount = 0;
        this.clearMessage();
        
        const startButton = document.getElementById('startButton');
        startButton.disabled = false;
    }

    createButtons(count) {
        const shuffledColors = [...this.colors].sort(() => Math.random() - 0.5);
        
        for (let i = 1; i <= count; i++) {
            const color = shuffledColors[i - 1] || this.colors[i - 1];
            const button = new GameButton(i, color);
            this.buttons.push(button);
        }
    }

    displayButtons() {
        this.gameState = 'displaying';
        const gameArea = document.getElementById('gameArea');
        const positions = this.windowManager.getInitialPositions(this.buttons.length);
        
        this.buttons.forEach((button, index) => {
            const element = button.createElement();
            gameArea.appendChild(element);
            button.setOriginalPosition(positions[index].x, positions[index].y);
        });
        
        this.showMessage(window.MESSAGES?.GAME_INSTRUCTIONS || 'Remember the order of the buttons!', 'info');
    }

    scheduleScrambling(buttonCount) {
        const startButton = document.getElementById('startButton');
        startButton.disabled = true;
        
        const pauseTime = buttonCount * PAUSE_MULTIPLIER;
        this.maxScrambles = buttonCount;
        
        setTimeout(() => {
            this.startScrambling();
        }, pauseTime);
    }

    startScrambling() {
        this.gameState = 'scrambling';
        this.scrambleCount = 0;
        this.scrambleButtons();
    }

    scrambleButtons() {
        if (this.scrambleCount >= this.maxScrambles) {
            this.startPlayerTurn();
            return;
        }
        
        // Collect current positions to avoid overlaps
        const newPositions = [];
        
        this.buttons.forEach(button => {
            const newPosition = this.windowManager.getRandomPositionWithoutCollision(newPositions);
            newPositions.push(newPosition);
            button.setPosition(newPosition.x, newPosition.y);
        });
        
        this.scrambleCount++;
        
        setTimeout(() => {
            this.scrambleButtons();
        }, SCRAMBLE_INTERVAL);
    }

    startPlayerTurn() {
        this.gameState = 'playing';
        this.currentClickIndex = 0;
        
        this.buttons.forEach(button => {
            button.hideNumber();
            button.makeClickable();
        });
        
        this.showMessage('Click the buttons in their original order!', 'info');
        
        const startButton = document.getElementById('startButton');
        startButton.disabled = false;
    }

    handleButtonClick(buttonNumber) {
        if (this.gameState !== 'playing') return;
        
        const expectedNumber = this.currentClickIndex + 1;
        
        if (buttonNumber === expectedNumber) {
            // Correct click
            const button = this.buttons.find(b => b.number === buttonNumber);
            button.showNumber();
            button.makeUnclickable();
            
            this.currentClickIndex++;
            
            if (this.currentClickIndex === this.buttons.length) {
                // Game won
                this.gameState = 'ended';
                this.showMessage(window.MESSAGES?.EXCELLENT_MEMORY || 'Excellent memory!', 'success');
            }
        } else {
            // Wrong click
            this.gameState = 'ended';
            this.revealAllButtons();
            this.showMessage(window.MESSAGES?.WRONG_ORDER || 'Wrong order!', 'error');
        }
    }

    revealAllButtons() {
        this.buttons.forEach(button => {
            button.showNumber();
            button.makeUnclickable();
        });
    }

    showMessage(text, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        messageArea.textContent = text;
        messageArea.className = `${type}-message`;
    }

    clearMessage() {
        const messageArea = document.getElementById('messageArea');
        messageArea.textContent = '';
        messageArea.className = '';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.memoryGame = new GameController();
});