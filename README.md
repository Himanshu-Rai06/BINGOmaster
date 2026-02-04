# 🎱 Real-Time Multiplayer Bingo

A modern, "aesthetic," and fully responsive web-based Bingo game. Features real-time online multiplayer, a smart solo bot mode, and high-fidelity animations powered by Anime.js.

![Project Banner](https://via.placeholder.com/1200x400?text=Bingo+Game+Banner) 
## ✨ Features

* **Three Game Modes:**
    * **Online Multiplayer:** Real-time synchronization using Firebase Realtime Database. Create rooms, share codes, and play with friends.
    * **Solo Mode:** Play against a built-in Bot with simulated turns.
    * **Offline Mode:** Use it as a digital board for physical bingo calls.
* **"Juicy" Visuals:** * Particle explosions on clicks.
    * "Grenade Throw" theme switching animations.
    * Glassmorphism UI design with ambient breathing effects.
    * Smooth screen transitions and grid entry animations.
* **Smart Audio System:** * Custom audio trimming (start/duration control) to prevent repetitive loops.
    * Distinct sounds for marking, winning, and errors.
* **Responsive Design:** Fully optimized for Desktop and Mobile with touch-friendly controls.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Animations:** [Anime.js](https://animejs.com/)
* **Backend/Database:** Google Firebase (Realtime Database)
* **Assets:** Icons by FontAwesome, Audio by Mixkit.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* A modern web browser (Chrome, Firefox, Edge, Safari).
* A code editor (VS Code recommended).
* (Optional) A generic web server (like Live Server extension for VS Code) is recommended to avoid CORS issues with audio files, though simple file opening often works.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Himanshu-Rai06/BINGOmaster.git](https://github.com/Himanshu-Rai06/BINGOmaster.git)
    cd bingo-game
    ```

2.  **Add your Firebase Configuration:**
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Create a new project and add a Web App.
    * Copy the `firebaseConfig` object.
    * Open `index.html` (or your firebase init file) and paste your config credentials where indicated.

3.  **Run the Game:**
    * Open `index.html` in your browser.
    * *Tip:* If using VS Code, right-click `index.html` and select **"Open with Live Server"**.

## 📂 Project Structure

```text
bingo-game/
├── index.html       # Main HTML structure
├── style.css        # Glassmorphism styling and themes
├── script.js        # Game logic, State management, Audio system
├── animations.js    # Anime.js visual effects (Particle system, Grenade)
├── assets/          # (Optional) Folder for local audio/image files
└── README.md        # Project documentation
