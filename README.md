<div align="center">

# 🎱 BINGO Master
**A premium and real-time multiplayer web which provides Bingo experience.**

[![Live Demo](https://img.shields.io/badge/Play_Now-Live_Demo-4ade80?style=for-the-badge&logo=vercel)](https://himanshu-rai06.github.io/BINGOmaster/)
[![Made with JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Powered by Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)]()
[![Animations by Anime.js](https://img.shields.io/badge/Anime.js-1C1C1C?style=for-the-badge)]()

<br>

<img width="1016" height="863" alt="image" src="https://github.com/user-attachments/assets/f5caee91-6208-4d23-a7bc-6cd0c69feba3" />


</div>

---

## ✨ Overview

**BINGO Master** is a digital bingo board; it's a highly interactive, tactile game designed with a modern **Glassmorphism** aesthetic. Whether you are playing solo against smart bots, passing the phone to a friend, or playing securely online via real-time database sync, the game feels incredibly alive.

### 🌟 Key Features

* 🎮 **Three Game Modes:**
  * **Solo Mode:** Play against upto 3 built-in bots with simulated turn logic.
  * **Offline (2P):** A digital board to play side-by-side with physical calls or pass-and-play.
  * **Online Multiplayer:** Create custom rooms, share the 4-digit code, and play in real-time with friends globally.
* 💧 **"Liquid Ink" Theme Engine:** Effortlessly switch between beautifully crafted color palettes (*Midnight Dream*, *Peach Sunset*, and *Matcha Latte*) with an immersive liquid ripple animation that washes over the screen.
* ✨ **"Juicy" Visuals:** Powered by `Anime.js`, every action has a reaction. Tiles pop, particles explode on clicks, winning lines pulse, and the game card gently "breathes" with ambient 3D animations.
* 📱 **Fully Responsive:** It maintains a sleek, constrained "floating card" look on desktop as well as mobile phones.

---

<div align="center">

<img width="1050" height="874" alt="20260502-1429-20 8659283" src="https://github.com/user-attachments/assets/112eabc7-ceff-4cf4-911d-7bc4545143c4" />


</div>

---

## 🚀 Installation & Setup

Want to run the code on your own machine, modify it, or contribute? Follow these steps:

### 1. Clone the Repository
Open your terminal or command prompt and run the following command to download the project to your local machine:

'''
git clone [https://github.com/himanshu-rai06/BINGOmaster.git](https://github.com/himanshu-rai06/BINGOmaster.git)
'''bash

2. Open the Project
Navigate into the newly created folder:

'''
cd BINGOmaster
'''bash
Open the folder in your favorite code editor (like VS Code).

3. Setup Firebase (Crucial for Online Multiplayer)
To make the "Online" mode work on your own copy, you need your own database:
1. Go to the Firebase Console.
2. Create a new project and navigate to Realtime Database.
3. Create a database (start in Test Mode for development).
4. Go to Project Settings, create a Web App, and copy the firebaseConfig block.

Open index.html in your code editor, find the <script type="module"> tag near the bottom, and paste your config variables over the existing ones.

4. Run the Game
The simple way: Just double-click the index.html file to open it in your web browser.

The recommended way: If you are using VS Code, install the Live Server extension. Right-click index.html and select "Open with Live Server". This ensures the browser doesn't block the audio files due to strict local CORS policies.

🕹️ How to Play
1. Board Setup
Before the game begins, you need to fill your 5x5 grid with numbers 1-25.

Tap empty tiles to place the next number sequentially.

Click Random to auto-generate a shuffled board instantly.

Click Swap, select a tile, and select another to switch their positions for the perfect layout.

Click Undo to revert your last placement.

2. Gameplay
Wait for your turn (indicated by the top banner text).

Click a number to mark it.

Note: If playing online, clicking a number will simultaneously mark that same number on your opponent's screen!

Connect 5 marked tiles in a row (horizontal, vertical, or diagonal) to light up a letter in B-I-N-G-O.

[{ image of a winning bingo board or the victory screen }]

3. Winning
Be the first to complete 5 full lines! The system will automatically detect your win, trigger the victory screen, and announce you as the Bingo Master.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (CSS Variables, Glassmorphism, Flexbox layout)

Logic: Vanilla JavaScript (ES6+)

Backend / Sync: Firebase Realtime Database

Animations: Anime.js (Timelines, Staggering, DOM manipulation)

Icons & Assets: FontAwesome Icons, Mixkit Audio
