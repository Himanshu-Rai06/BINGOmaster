// --- AUDIO SYSTEM ---

const audioLibrary = {
    // 1. CUT BOX (Game Mode): Starts at 1 second
    cut: { 
        src: 'cutbox.mp3', // Make sure this matches your actual filename
        start: 1.0,        // Start at 1.0 seconds
        duration: 600      // Stop after 600 milliseconds (0.6s)
    },
    
    // 2. FILL BOX (Setup Mode): Starts at 5 seconds, cut short to stop repeating
    fill: { 
        src: 'fillbox.mp3', 
        start: 5.0,        // Start at 5.0 seconds
        duration: 300      // Stop after 300ms (Very short! This fixes the repeating)
    },

    // 3. GENERAL CLICK (Buttons): Starts at 0
    click: { 
        src: 'overall.mp3', 
        start: 0, 
        duration: 500 
    },
    
    // Fallback win sound (optional)
    win: { 
        src: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3', 
        start: 0, 
        duration: 3000 
    }
};

const playSound = (type = 'click') => {
    const config = audioLibrary[type] || audioLibrary['click'];
    
    // Create a new audio instance for every click (allows overlapping sounds)
    const audio = new Audio(config.src);
    
    // Preload metadata to ensure seeking works
    audio.addEventListener('loadedmetadata', () => {
        audio.currentTime = config.start;
    });
    
    // Fallback: Set time immediately (for cached files)
    audio.currentTime = config.start;
    audio.volume = 0.5;

    // Play the sound
    audio.play().catch(e => console.log("Audio blocked:", e));

    // STOP the sound automatically after the duration triggers
    // This is what prevents the 'fillbox' from repeating
    setTimeout(() => {
        audio.pause();
        audio.currentTime = config.start; // Reset
    }, config.duration);
};

// --- STATE MANAGEMENT ---
const state = {
    mode: 'SOLO',
    playerName: 'Player',
    roomCode: null,
    playerId: null,
    players: [], 
    onlineLimit: 2,
    onlineRole: 'create',
    setupGrid: Array(25).fill(null),
    setupCounter: 1,
    isSwapMode: false,
    swapSelection: null,
    calledNumbers: new Set(),
    myBoard: [],
    myLines: 0,
    completedPatterns: [], // Track which lines are already animated
    gameActive: false
};

// Indices for Bingo Lines (Rows, Cols, Diagonals)
const patterns = [
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // Rows
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // Cols
    [0,6,12,18,24], [4,8,12,16,20] // Diagonals
];

// --- APP CONTROLLER ---
const app = {
    // EXPORTED TO HTML
    setTheme: (t) => {
        if(typeof Visuals !== 'undefined') Visuals.animateThemeSwitch(t);
        else document.body.className = t;
    },
    
    goHome: () => {
        window.location.reload();
    },

    navigate: (id) => {
        if(typeof Visuals !== 'undefined') Visuals.animateScreenChange('#' + id);
        else {
            document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
            document.getElementById(id).style.display = 'flex';
        }
    },

    // 1. SETUP FLOWS
    setupSolo: () => {
        state.mode = 'SOLO';
        app.updateConfigUI("Solo Mode", false);
    },

    setupOffline: () => {
        state.mode = 'OFFLINE';
        state.players = [{ name: 'Player' }];
        game.initBoardSetup();
    },

    setupOnline: () => {
        state.mode = 'ONLINE';
        app.updateConfigUI("Online Mode", true);
    },

    updateConfigUI: (title, isOnline) => {
        document.getElementById('config-title').innerText = title;
        document.getElementById('config-online-name').style.display = isOnline ? 'block' : 'none';
        document.getElementById('config-online-opts').style.display = isOnline ? 'block' : 'none';
        document.getElementById('config-solo-opts').style.display = isOnline ? 'none' : 'block';
        app.navigate('screen-config');
    },

    toggleOnlineTab: (tab) => {
        state.onlineRole = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active'); // Assumes event is global or passed
        document.getElementById('tab-create').style.display = tab === 'create' ? 'block' : 'none';
        document.getElementById('tab-join').style.display = tab === 'join' ? 'block' : 'none';
    },

    submitConfig: () => {
        if (state.mode === 'SOLO') {
            const botCount = parseInt(document.getElementById('bot-count').value);
            state.players = [{ name: 'You', isBot: false, id: 'me' }];
            for(let i=0; i<botCount; i++) {
                state.players.push({ name: `Bot ${i+1}`, isBot: true, id: `bot${i}` });
            }
            game.initBoardSetup();
        } 
        else if (state.mode === 'ONLINE') {
            const nameInput = document.getElementById('player-name').value;
            state.playerName = nameInput.trim() || 'Anonymous';
            app.connectToFirebase();
        }
    },

    // --- FIREBASE LOGIC ---
    connectToFirebase: () => {
        if (!window.db) return alert("Connection failed. Check internet.");

        const isHost = state.onlineRole === 'create';
        const codeInput = document.getElementById('room-code-input').value.toUpperCase().trim();
        state.roomCode = isHost ? Math.floor(1000 + Math.random() * 9000).toString() : codeInput;

        if(!isHost && codeInput.length < 4) return alert("Invalid Code");

        const roomRef = window.dbRef(window.db, `rooms/${state.roomCode}`);
        const playersRef = window.dbRef(window.db, `rooms/${state.roomCode}/players`);

        if (isHost) {
            state.onlineLimit = parseInt(document.getElementById('online-limit').value);
            window.dbSet(roomRef, {
                status: 'waiting',
                limit: state.onlineLimit,
                turnIndex: 0
            });
        }

        const newPlayerRef = window.dbPush(playersRef);
        state.playerId = newPlayerRef.key;
        
        // Disconnect logic
        // window.onDisconnect(newPlayerRef).remove(); 

        window.dbSet(newPlayerRef, {
            name: state.playerName,
            ready: false
        });

        app.navigate('screen-lobby');
        document.getElementById('lobby-code').innerText = state.roomCode;
        
        // Listen for players
        window.dbOnValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            if(!data) return;
            state.players = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            app.updateLobbyUI();
        });

        // Listen for game start
        window.dbOnValue(window.dbRef(window.db, `rooms/${state.roomCode}/status`), (snap) => {
            if (snap.val() === 'playing' && !state.gameActive) game.initBoardSetup();
        });
    },

    updateLobbyUI: () => {
        const list = document.getElementById('lobby-list');
        list.innerHTML = state.players.map(p => 
            `<div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); align-items:center;">
                <span style="font-weight:bold;">${p.name}</span> 
                <span style="font-size:0.8rem; opacity:0.7;">${p.id === state.playerId ? '(You)' : ''}</span>
            </div>`
        ).join('');
        
        const count = state.players.length;
        const total = state.onlineLimit || 2;
        document.getElementById('lobby-count').innerText = `${count} / ${total}`;
        
        const btn = document.getElementById('btn-start-online');
        if (state.onlineRole === 'create') {
            btn.style.display = 'block';
            btn.classList.toggle('disabled', count < 2); // Needs at least 2
            document.getElementById('lobby-msg').innerText = count < 2 ? "Waiting for players..." : "Ready to Start!";
        } else {
            btn.style.display = 'none';
            document.getElementById('lobby-msg').innerText = "Waiting for host...";
        }
    }
};

// --- GAME CONTROLLER ---
const game = {
    // Utility
    generateRandom: () => {
        const nums = Array.from({length: 25}, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        return nums;
    },

    // 1. BOARD FILLING
    initBoardSetup: () => {
        state.setupGrid.fill(null);
        state.setupCounter = 1;
        state.isSwapMode = false;
        game.renderSetup();
        app.navigate('screen-setup');
        if(typeof Visuals !== 'undefined') Visuals.animateGridEntry();
    },

    renderSetup: () => {
        const grid = document.getElementById('setup-grid');
        grid.innerHTML = '';
        state.setupGrid.forEach((num, idx) => {
            const tile = document.createElement('div');
            tile.className = `tile ${num ? 'filled' : ''}`;
            if(state.setupCounter > 25) tile.classList.add('filled'); 
            if(state.swapSelection === idx) tile.classList.add('selected-swap');
            
            tile.innerHTML = `<span>${num || ''}</span>`;
            tile.onclick = () => game.handleSetupClick(idx, tile);
            grid.appendChild(tile);
        });
        document.getElementById('fill-num').innerText = state.setupCounter <= 25 ? state.setupCounter : 'Done';
    },

    handleSetupClick: (idx, tileElement) => {
        // Swap Logic
        if (state.isSwapMode) {
            if (!state.setupGrid[idx]) return; // Can't swap empty
            
            if (state.swapSelection === null) {
                // Select first
                state.swapSelection = idx;
                game.renderSetup(); // Re-render to show selection class
            } else {
                // Swap
                const temp = state.setupGrid[state.swapSelection];
                state.setupGrid[state.swapSelection] = state.setupGrid[idx];
                state.setupGrid[idx] = temp;
                state.swapSelection = null;
                state.isSwapMode = false;
                document.getElementById('btn-swap').classList.remove('active');
                playSound('cut');
                game.renderSetup();
            }
            return;
        }

        // Fill Logic
        if (!state.setupGrid[idx] && state.setupCounter <= 25) {
            state.setupGrid[idx] = state.setupCounter++;
            playSound('cut');
            game.renderSetup();
            
            // Re-grab the tile from DOM to animate it
            const newTile = document.getElementById('setup-grid').children[idx];
            if(typeof Visuals !== 'undefined') Visuals.animateTileClick(newTile, true);
            
            if (state.setupCounter > 25) setTimeout(game.finishSetup, 500);
        }
    },

    undoFill: () => {
        if (state.setupCounter > 1) {
            state.setupCounter--;
            const idx = state.setupGrid.indexOf(state.setupCounter);
            if (idx > -1) state.setupGrid[idx] = null;
            game.renderSetup();
        }
    },
    
    toggleSwapMode: () => {
        state.isSwapMode = !state.isSwapMode;
        state.swapSelection = null;
        document.getElementById('btn-swap').classList.toggle('active');
    },

    randomizeBoard: () => {
        state.setupGrid = game.generateRandom();
        state.setupCounter = 26;
        playSound('cut');
        game.finishSetup();
    },

    finishSetup: () => {
        state.myBoard = [...state.setupGrid];
        state.completedPatterns = []; // Reset wins
        state.myLines = 0;
        
        if (state.mode === 'ONLINE') {
            const myRef = window.dbRef(window.db, `rooms/${state.roomCode}/players/${state.playerId}`);
            window.dbUpdate(myRef, { ready: true });
            
            if (state.onlineRole === 'create') {
                window.dbUpdate(window.dbRef(window.db, `rooms/${state.roomCode}`), { status: 'playing' });
            }
            game.startOnlineListeners();
        } 
        
        game.launchGame();
    },

    // 2. GAMEPLAY
    startOnlineListeners: () => {
        // Listen for Moves
        window.dbOnChildAdded(window.dbRef(window.db, `rooms/${state.roomCode}/moves`), (snap) => {
            game.handleGlobalCall(snap.val(), false);
        });
        
        // Listen for Winner
        window.dbOnValue(window.dbRef(window.db, `rooms/${state.roomCode}/winner`), (snap) => {
            if (snap.val()) {
                state.gameActive = false;
                game.showResults(snap.val());
            }
        });
    },

    startOnlineGame: () => {
        window.dbUpdate(window.dbRef(window.db, `rooms/${state.roomCode}`), { status: 'playing' });
    },

    launchGame: () => {
        state.gameActive = true;
        app.navigate('screen-game');
        document.getElementById('mode-badge').innerText = state.mode;
        
        if(typeof Visuals !== 'undefined') Visuals.animateGridEntry();

        if (state.mode === 'OFFLINE') {
            document.getElementById('turn-msg').innerText = "Tap to Mark";
        } else {
            game.processTurnUI();
        }
        game.updateGameUI(true);
    },

    // --- THE MAIN UI UPDATE LOOP ---
    updateGameUI: (forceRebuild = false) => {
        const grid = document.getElementById('game-grid');
        
        // Strategy: Only rebuild entire DOM if forced. Otherwise update classes.
        if (grid.innerHTML === '' || forceRebuild) {
            grid.innerHTML = '';
            state.myBoard.forEach((num, idx) => {
                const tile = document.createElement('div');
                const isMarked = state.calledNumbers.has(num);
                tile.className = `tile ${isMarked ? 'marked' : ''}`;
                tile.dataset.idx = idx; 
                tile.innerHTML = `<span>${num}</span>`;
                
                // --- CLICK HANDLER ---
                tile.onclick = () => {
                    if(state.calledNumbers.has(num)) return; // Already clicked

                    // 1. OFFLINE (Just click)
                    if (state.mode === 'OFFLINE') {
                        playSound('cut');
                        state.calledNumbers.add(num);
                        game.checkWinLocally();
                        // Animation
                        tile.classList.add('marked');
                        if(typeof Visuals !== 'undefined') Visuals.animateTileClick(tile, true);
                        game.updateBingoLetters(); 
                    } 
                    // 2. ONLINE / SOLO (Turn Based)
                    else {
                        game.attemptPick(num, tile);
                    }
                };
                grid.appendChild(tile);
            });
        } else {
            // Soft Update (Animations only)
            Array.from(grid.children).forEach((tile, idx) => {
                const num = state.myBoard[idx];
                const isMarked = state.calledNumbers.has(num);
                const wasMarked = tile.classList.contains('marked');
                
                if (isMarked && !wasMarked) {
                    tile.classList.add('marked');
                    // Trigger "Juicy" Pop
                    if(typeof Visuals !== 'undefined') Visuals.animateTileClick(tile, true);
                }
            });
        }
        
        game.updateBingoLetters();
    },
    
    // Updates B-I-N-G-O letters based on line count
    updateBingoLetters: () => {
        const letters = ['B','I','N','G','O'];
        letters.forEach((l, i) => {
            const el = document.getElementById(`let-${l}`);
            if(i < state.myLines && !el.classList.contains('lit')) {
                el.classList.add('lit');
                // Trigger Jump Animation for Letter
                if(typeof Visuals !== 'undefined') Visuals.animateLetter(`#let-${l}`);
            }
        });
    },

    attemptPick: (num, tileElement) => {
        const total = state.players.length;
        const turnIdx = state.calledNumbers.size % total;
        let isMyTurn = false;

        if (state.mode === 'SOLO' && turnIdx === 0) isMyTurn = true;
        else if (state.mode === 'ONLINE') {
            const currentP = state.players[turnIdx];
            if (currentP && currentP.id === state.playerId) isMyTurn = true;
        }

        if (isMyTurn) {
            playSound('cut');
            game.handleGlobalCall(num, true);
        } else {
            // NOT MY TURN -> SHAKE!
            playSound('error');
            if(typeof Visuals !== 'undefined') Visuals.shakeElement(tileElement);
        }
    },

    handleGlobalCall: (num, initiate) => {
        if(state.calledNumbers.has(num)) return;
        
        if (state.mode === 'ONLINE' && initiate) {
            window.dbPush(window.dbRef(window.db, `rooms/${state.roomCode}/moves`), num);
            return; 
        }
        
        state.calledNumbers.add(num);
        
        // If it was opponent's move, play sound locally
        if(!initiate && state.myBoard.includes(num)) playSound('cut');

        game.checkWinLocally();
        game.updateGameUI(); 
        game.processTurnUI();
        
        // Bot Logic
        if (state.mode === 'SOLO') {
            const turnIdx = state.calledNumbers.size % state.players.length;
            if (state.players[turnIdx].isBot) {
                setTimeout(() => {
                    let pick;
                    // Simple bot: picks random uncalled number
                    do { pick = Math.floor(Math.random() * 25) + 1; } while(state.calledNumbers.has(pick));
                    game.handleGlobalCall(pick, false);
                }, 1000);
            }
        }
    },

    processTurnUI: () => {
        if (!state.gameActive) return;
        const turnIdx = state.calledNumbers.size % state.players.length;
        const currentP = state.players[turnIdx];
        const msg = document.getElementById('turn-msg');
        let isMe = (state.mode === 'SOLO' && turnIdx === 0) || (state.mode === 'ONLINE' && currentP.id === state.playerId);
        
        msg.style.opacity = 0;
        setTimeout(() => {
            if (isMe) {
                msg.innerText = "YOUR TURN";
                msg.className = "turn-indicator my-turn";
            } else {
                msg.innerText = `${currentP.name}'s Turn`;
                msg.className = "turn-indicator";
            }
            msg.style.opacity = 1;
        }, 200);
    },

    checkWinLocally: () => {
        let lines = 0;
        
        patterns.forEach((pt, index) => {
            // Check if every index in this pattern is marked
            if (pt.every(idx => state.calledNumbers.has(state.myBoard[idx]))) {
                lines++;
                
                // If this is a NEW line, animate it!
                if (!state.completedPatterns.includes(index)) {
                    state.completedPatterns.push(index);
                    if(typeof Visuals !== 'undefined') Visuals.animateWinLine(pt); // Light up these 5 tiles
                }
            }
        });

        state.myLines = lines;
        
        // WIN CONDITION
        if (state.myLines >= 5 && state.gameActive) {
            playSound('win');
            if (state.mode === 'ONLINE') {
                window.dbSet(window.dbRef(window.db, `rooms/${state.roomCode}/winner`), state.playerName);
            } else {
                state.gameActive = false;
                game.showResults(state.playerName || 'You');
            }
        }
    },

    showResults: (winnerName) => {
        document.getElementById('result-modal').classList.add('show');
        // Simple confetti or rainbow text is handled by CSS/HTML
        document.getElementById('final-scores').innerHTML = `
            <h2 style="font-size:3rem; margin-bottom:10px;">🏆</h2>
            <p style="font-size:1.5rem;">${winnerName} Wins!</p>
        `;
    }
};

// Make accessible to HTML buttons
window.app = app;
window.game = game;