# RPG Event: Unpacking Memories

An interactive 2D bedroom exploration experience that uncovers the childhood memories and lore of Samrudh Sharma across three distinct ages (Age 5, 10, and 15). 

This project was built as an immersive puzzle/event where players explore rooms, find out-of-place items, read their lore, and drag them into their inventory.

## Features

- **Interactive Room Exploration**: Three detailed, atmospheric rooms representing different eras of the character's life.
- **Dynamic Lore System**: Clickable items reveal deep, spicy lore and story elements in a customized modal.
- **Drag-and-Drop Inventory**: Players drag misplaced items from the room into a dedicated inventory bar.
- **Randomized Puzzle Scenarios (Anti-Cheat)**: The game features a built-in randomization engine that selects from multiple hardcoded item-placement presets. This ensures consecutive playthroughs (or teams playing side-by-side) experience different correct item locations, preventing cheating.
- **Admin Leaderboard Panel**: A secure backend system that tracks player scores, time taken, and provides detailed analysis of where teams placed their items.

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (Node Package Manager)

## Installation & Running

1. **Install Dependencies**
   Navigate to the project directory in your terminal and install the required packages (like `express` and `cors`):
   ```bash
   npm install
   ```

2. **Start the Server**
   Launch the Node.js backend server:
   ```bash
   node server.js
   ```
   *The server will start running on port 3000.*

3. **Play the Game**
   Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Admin Panel Access

The host can manage teams, view detailed item placement analysis, and clear the leaderboard via the Admin Panel.

- **URL**: `http://localhost:3000/admin`
- **Password**: `admin`

*Note: From the admin panel, you can click "Analyze" on any team to see exactly which rooms they placed their items in, or "Delete" to remove specific teams.*

## Project Structure

- `index.html` - The main entry point and UI for the game.
- `admin.html` - The secure admin dashboard interface.
- `styles.css` - Custom CSS including retro aesthetics, animations, and responsive layouts.
- `app.js` - The core frontend engine handling drag-and-drop, randomized scenarios, lore popups, and score calculation.
- `server.js` - The Express backend that manages the `scores.json` database.
- `scores.json` - Automatically generated database file tracking leaderboard entries.
