/* ==========================================
   SAM'S BEDROOM: INTERACTIVE MECHANICS & AUDIO
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Custom styled Alert Dialog system
    window.showCustomAlert = function(message, callback) {
        let alertOverlay = document.getElementById('custom-alert-overlay');
        if (!alertOverlay) {
            alertOverlay = document.createElement('div');
            alertOverlay.id = 'custom-alert-overlay';
            alertOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(10, 8, 6, 0.85);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 9999999;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const alertBox = document.createElement('div');
            alertBox.style.cssText = `
                background: #ebdcb9;
                background-image: url('assets/aged_newspaper.svg');
                background-size: cover;
                border: 2px solid #5a4225;
                border-radius: 4px;
                padding: 30px;
                width: 90%;
                max-width: 460px;
                box-shadow: 0 15px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.05);
                font-family: 'Special Elite', cursive;
                color: #382818;
                text-align: center;
                transform: scale(0.9) rotate(-1deg);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            
            const alertText = document.createElement('p');
            alertText.id = 'custom-alert-text';
            alertText.style.cssText = `
                font-size: 1.15rem;
                line-height: 1.6;
                margin-bottom: 25px;
                color: #2b1d11;
            `;
            
            const alertBtn = document.createElement('button');
            alertBtn.id = 'custom-alert-btn';
            alertBtn.innerText = 'OK';
            alertBtn.style.cssText = `
                background-color: #382818;
                color: #dfd7c0;
                border: 1px solid #1a1512;
                padding: 10px 35px;
                font-family: 'Special Elite', cursive;
                font-size: 0.95rem;
                letter-spacing: 1.5px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;
            
            alertBtn.addEventListener('mouseover', () => {
                alertBtn.style.backgroundColor = '#4e3822';
            });
            alertBtn.addEventListener('mouseout', () => {
                alertBtn.style.backgroundColor = '#382818';
            });
            alertBtn.addEventListener('active', () => {
                alertBtn.style.transform = 'translateY(1px)';
            });
            
            alertBox.appendChild(alertText);
            alertBox.appendChild(alertBtn);
            alertOverlay.appendChild(alertBox);
            document.body.appendChild(alertOverlay);
        }
        
        const alertText = document.getElementById('custom-alert-text');
        const alertBtn = document.getElementById('custom-alert-btn');
        const alertBox = alertOverlay.firstChild;
        
        alertText.innerText = message;
        
        const newAlertBtn = alertBtn.cloneNode(true);
        alertBtn.parentNode.replaceChild(newAlertBtn, alertBtn);
        
        newAlertBtn.addEventListener('click', () => {
            alertOverlay.style.opacity = '0';
            alertBox.style.transform = 'scale(0.9) rotate(-1deg)';
            setTimeout(() => {
                alertOverlay.style.display = 'none';
                if (callback) callback();
            }, 300);
        });
        
        alertOverlay.style.display = 'flex';
        alertOverlay.offsetHeight;
        alertOverlay.style.opacity = '1';
        alertBox.style.transform = 'scale(1) rotate(-0.5deg)';
    };
    // --- Global Game State ---
    window.gameState = {
        teamName: '',
        sessionToken: '',
        startTime: 0,
        roomsLocked: false,
        roomsScore: 0,
        roomsTime: 0,
        crosswordCompleted: false,
        totalTime: 0,
        audioCtx: null,
        isMuted: false
    };

    // Define global properties to bridge local audio variables to the shared state
    Object.defineProperty(window, 'audioCtx', {
        get() { return window.gameState.audioCtx; },
        set(val) { window.gameState.audioCtx = val; },
        configurable: true
    });
    Object.defineProperty(window, 'isMuted', {
        get() { return window.gameState.isMuted; },
        set(val) { window.gameState.isMuted = val; },
        configurable: true
    });

    // --- State Variables ---
    let currentAge = 5;

    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }
    let gameStarted = false;
    let timerInterval = null;
    let gameStartTime = 0;
    let isComputerUnlocked = false;

    function startGameTimer(startTime) {
        if (timerInterval) clearInterval(timerInterval);
        gameStartTime = startTime;
        gameStarted = true;
        
        const timerEl = document.getElementById('game-timer');
        if (timerEl) {
            if (!document.body.classList.contains('crossword-mode-active')) {
                timerEl.style.display = 'block';
            } else {
                timerEl.style.display = 'none';
            }
        }
        
        const fsContainer = document.getElementById('fullscreen-os-container');
        const fsTimerEl = document.getElementById('fullscreen-os-timer');
        if (fsTimerEl) {
            if (fsContainer && fsContainer.style.display === 'block') {
                fsTimerEl.style.display = 'block';
            } else {
                fsTimerEl.style.display = 'none';
            }
        }
        
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - gameStartTime;
            const m = Math.floor(elapsed / 60000).toString().padStart(2, '0');
            const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
            const timeString = `${m}:${s}`;
            
            if (timerEl) timerEl.textContent = timeString;
            
            const crosswordTimerEl = document.getElementById('crossword-timer');
            if (crosswordTimerEl) {
                crosswordTimerEl.textContent = timeString;
            }
            
            if (fsTimerEl) {
                fsTimerEl.textContent = timeString;
            }
        }, 1000);
    }

    function showFullscreenOS() {
        const fsContainer = document.getElementById('fullscreen-os-container');
        const fsIframe = document.getElementById('fullscreen-os-iframe');
        const fsTimerEl = document.getElementById('fullscreen-os-timer');
        const timerEl = document.getElementById('game-timer');
        
        if (fsContainer && fsIframe) {
            fsContainer.style.display = 'block';
            if (!fsIframe.src || !fsIframe.src.endsWith('/win93/index.html')) {
                fsIframe.src = '/win93/index.html';
            }
        }
        if (fsTimerEl) {
            fsTimerEl.style.display = 'block';
        }
        if (timerEl) {
            timerEl.style.display = 'none';
        }
    }

    function applyScenario(startingPlacements) {
        if (!startingPlacements) return;
        startingPlacements.forEach(itemConfig => {
            const el = document.querySelector(`.hotspot[data-item="${itemConfig.id}"]`);
            if (el) {
                const targetCanvas = document.getElementById(`canvas-age-${itemConfig.startRoom}`);
                if (targetCanvas) {
                    el.classList.remove('in-inventory');
                    el.style.position = 'absolute';
                    targetCanvas.appendChild(el);
                    el.style.left = itemConfig.left;
                    el.style.top = itemConfig.top;
                    el.style.width = el.dataset.defaultWidth || el.style.width;
                    el.style.height = el.dataset.defaultHeight || el.style.height;
                }
            }
        });
    }

    function saveGameState() {
        try {
            const placements = [];
            document.querySelectorAll('.draggable').forEach(el => {
                const inInventory = el.classList.contains('in-inventory');
                const parentId = el.parentNode ? el.parentNode.id : '';
                placements.push({
                    item: el.dataset.item,
                    inInventory: inInventory,
                    parentId: parentId,
                    left: el.style.left,
                    top: el.style.top,
                    position: el.style.position
                });
            });

            const crosswordInputs = {};
            document.querySelectorAll('.cell-input').forEach(input => {
                const row = input.dataset.row;
                const col = input.dataset.col;
                if (row !== undefined && col !== undefined && input.value !== "") {
                    crosswordInputs[`${row}_${col}`] = input.value;
                }
            });

            const stateToSave = {
                teamName: window.gameState.teamName,
                sessionToken: window.gameState.sessionToken,
                startTime: window.gameState.startTime,
                roomsLocked: window.gameState.roomsLocked,
                roomsScore: window.gameState.roomsScore,
                roomsTime: window.gameState.roomsTime,
                crosswordCompleted: window.gameState.crosswordCompleted,
                totalTime: window.gameState.totalTime,
                secretCells: window.gameState.secretCells,
                isComputerUnlocked: isComputerUnlocked,
                currentAge: currentAge,
                currentMode: document.body.classList.contains('crossword-mode-active') ? 'crossword' : 'rooms',
                placements: placements,
                crosswordInputs: crosswordInputs
            };

            localStorage.setItem('project_rewind_game_state', JSON.stringify(stateToSave));
        } catch (e) {
            console.error('Failed to save game state to localStorage:', e);
        }
    }
    window.saveGameState = saveGameState;

    async function startSession(teamName) {
        try {
            const res = await fetch('/api/start-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team: teamName })
            });
            const data = await res.json();
            if (res.ok) {
                window.gameState.sessionToken = data.token;
                window.gameState.teamName = teamName;
                window.gameState.startTime = Date.now();
                applyScenario(data.startingPlacements);
                saveGameState();
                return true;
            } else {
                alert(data.error || 'Failed to start session');
                return false;
            }
        } catch (err) {
            console.error('Error starting session:', err);
            alert('Error starting session. Check server connection.');
            return false;
        }
    }

    let currentSynthNodes = [];
    let audioSequencers = [];

    // UI Elements
    const appContainer = document.getElementById('app-container');
    const landingScreen = document.getElementById('landing-screen');
    const viewport = document.getElementById('viewport');
    
    const canvases = {
        5: document.getElementById('canvas-age-5'),
        10: document.getElementById('canvas-age-10'),
        15: document.getElementById('canvas-age-15')
    };
    
    const navButtons = {
        5: document.querySelector('.timeline-tab[data-age="5"]'),
        10: document.querySelector('.timeline-tab[data-age="10"]'),
        15: document.querySelector('.timeline-tab[data-age="15"]')
    };

    const ageIndicator = document.getElementById('room-age-indicator');
    const closeupModal = document.getElementById('closeup-modal');
    const closeupBody = document.getElementById('closeup-body');
    const btnCloseCloseup = document.getElementById('btn-close-closeup');
    
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const btnHelp = document.getElementById('btn-help');
    const btnCloseHelp = document.getElementById('btn-close-help');
    const helpModal = document.getElementById('help-modal');

    // --- Web Audio Procedural Soundscape Synthesizer ---
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        startSoundscape(currentAge);
    }

    function stopAllSynths() {
        audioSequencers.forEach(seq => clearInterval(seq));
        audioSequencers = [];

        const now = audioCtx.currentTime;
        currentSynthNodes.forEach(node => {
            if (node.gain) {
                node.gain.setValueAtTime(node.gain.value, now);
                node.gain.linearRampToValueAtTime(0, now + 0.5);
            }
            try {
                node.stop(now + 0.6);
            } catch(e) {}
        });
        currentSynthNodes = [];
    }

    function startSoundscape(age) {
        // Background music disabled entirely by user request
        return;
    }

    // Age 5 (2010): Soft Lullaby Music Box
    function playAge5MusicBox() {
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1);
        masterGain.connect(audioCtx.destination);
        currentSynthNodes.push(masterGain);

        const delay = audioCtx.createDelay();
        delay.delayTime.value = 0.45;
        const delayFeedback = audioCtx.createGain();
        delayFeedback.gain.value = 0.4;
        
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        delay.connect(masterGain);

        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const melody = [4, 5, 6, 4, 5, 7, 6, 5, 3, 4, 5, 3, 2, 4, 3, 0];
        let noteIndex = 0;

        function triggerBell(freq) {
            if (isMuted || !audioCtx) return;
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            const tine = audioCtx.createOscillator();
            tine.type = 'sine';
            tine.frequency.setValueAtTime(freq * 2, now);

            const env = audioCtx.createGain();
            env.gain.setValueAtTime(0, now);
            env.gain.linearRampToValueAtTime(0.3, now + 0.01);
            env.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

            const tineEnv = audioCtx.createGain();
            tineEnv.gain.setValueAtTime(0, now);
            tineEnv.gain.linearRampToValueAtTime(0.08, now + 0.005);
            tineEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc.connect(env);
            tine.connect(tineEnv);
            env.connect(masterGain);
            env.connect(delay);
            tineEnv.connect(masterGain);

            osc.start(now);
            tine.start(now);
            osc.stop(now + 3);
            tine.stop(now + 1);
        }

        const interval = setInterval(() => {
            const freq = notes[melody[noteIndex % melody.length]];
            triggerBell(freq);
            noteIndex++;
        }, 1200);

        audioSequencers.push(interval);
    }

    // Age 10 (2015): 8-Bit Lo-fi game soundtrack
    function playAge10GameLofi() {
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);
        masterGain.connect(audioCtx.destination);
        currentSynthNodes.push(masterGain);

        const baseNotes = [130.81, 146.83, 164.81, 196.00]; // C3, D3, E3, G3
        let chordIndex = 0;

        function triggerLofiPulse() {
            if (isMuted || !audioCtx) return;
            const now = audioCtx.currentTime;

            const osc1 = audioCtx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(baseNotes[chordIndex % baseNotes.length], now);

            const osc2 = audioCtx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(baseNotes[chordIndex % baseNotes.length] * 1.5, now);

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.Q.value = 4;

            const env = audioCtx.createGain();
            env.gain.setValueAtTime(0, now);
            env.gain.linearRampToValueAtTime(0.25, now + 0.2);
            env.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(env);
            env.connect(masterGain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 2.2);
            osc2.stop(now + 2.2);

            chordIndex++;
        }

        triggerLofiPulse();
        const interval = setInterval(triggerLofiPulse, 2000);
        audioSequencers.push(interval);
    }

    // Age 15 (2020): Moody, Melancholic Ambient Drone
    function playAge15MelancholicDrone() {
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 2.0);
        masterGain.connect(audioCtx.destination);
        currentSynthNodes.push(masterGain);

        const osc1 = audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2

        const osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(65.70, audioCtx.currentTime); // Detuned slightly

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, audioCtx.currentTime);
        filter.Q.value = 5;

        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 70;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        function triggerHeartbeat() {
            if (isMuted || !audioCtx) return;
            const now = audioCtx.currentTime;
            
            const thump = audioCtx.createOscillator();
            thump.type = 'sine';
            thump.frequency.setValueAtTime(50, now);
            thump.frequency.exponentialRampToValueAtTime(20, now + 0.25);

            const thumpEnv = audioCtx.createGain();
            thumpEnv.gain.setValueAtTime(0, now);
            thumpEnv.gain.linearRampToValueAtTime(0.45, now + 0.02);
            thumpEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            thump.connect(thumpEnv);
            thumpEnv.connect(masterGain);

            thump.start(now);
            thump.stop(now + 0.7);

            setTimeout(() => {
                if (isMuted || !audioCtx) return;
                const now2 = audioCtx.currentTime;
                const thump2 = audioCtx.createOscillator();
                thump2.type = 'sine';
                thump2.frequency.setValueAtTime(48, now2);
                thump2.frequency.exponentialRampToValueAtTime(20, now2 + 0.25);

                const thumpEnv2 = audioCtx.createGain();
                thumpEnv2.gain.setValueAtTime(0, now2);
                thumpEnv2.gain.linearRampToValueAtTime(0.35, now2 + 0.02);
                thumpEnv2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.6);

                thump2.connect(thumpEnv2);
                thumpEnv2.connect(masterGain);

                thump2.start(now2);
                thump2.stop(now2 + 0.7);
            }, 250);
        }

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        lfo.start();

        currentSynthNodes.push(osc1, osc2, lfo);

        triggerHeartbeat();
        const interval = setInterval(triggerHeartbeat, 3000);
        audioSequencers.push(interval);
    }

    // Audio Controls
    function syncAudioUI() {
        const btnCrosswordAudio = document.getElementById('btn-crossword-audio');
        if (isMuted) {
            stopAllSynths();
            if (btnAudioToggle) {
                btnAudioToggle.querySelector('.btn-text').textContent = 'Sound: Off';
                btnAudioToggle.style.opacity = '0.5';
            }
            if (btnCrosswordAudio) {
                const textEl = btnCrosswordAudio.querySelector('.btn-text');
                const iconEl = btnCrosswordAudio.querySelector('.btn-icon');
                if (textEl) textEl.textContent = 'Sound: Off';
                if (iconEl) iconEl.textContent = '🔇';
                btnCrosswordAudio.style.opacity = '0.5';
            }
        } else {
            if (!audioCtx) {
                initAudio();
            } else {
                startSoundscape(currentAge);
            }
            if (btnAudioToggle) {
                btnAudioToggle.querySelector('.btn-text').textContent = 'Sound: On';
                btnAudioToggle.style.opacity = '1';
            }
            if (btnCrosswordAudio) {
                const textEl = btnCrosswordAudio.querySelector('.btn-text');
                const iconEl = btnCrosswordAudio.querySelector('.btn-icon');
                if (textEl) textEl.textContent = 'Sound: On';
                if (iconEl) iconEl.textContent = '🔊';
                btnCrosswordAudio.style.opacity = '1';
            }
        }
    }

    btnAudioToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        syncAudioUI();
    });

    const btnCrosswordAudio = document.getElementById('btn-crossword-audio');
    if (btnCrosswordAudio) {
        btnCrosswordAudio.addEventListener('click', () => {
            isMuted = !isMuted;
            syncAudioUI();
        });
    }

    // --- Help Modal Navigation ---
    btnHelp.addEventListener('click', () => {
        helpModal.classList.add('active');
    });
    btnCloseHelp.addEventListener('click', async () => {
        helpModal.classList.remove('active');
        
        // Start game timer only ONCE when they first close the help modal
        if (!gameStartTime) {
            startGameTimer(Date.now());
            
            // Auto-start audio if they haven't explicitly muted
            if (!isMuted && !audioCtx) {
                initAudio();
            }
        }
    });

    // ==========================================
    // PHASE 2: DRAG & DROP AND SCORING ENGINE
    // ==========================================
    
    const inventorySlots = document.getElementById('inventory-slots');
    const roomContainer = document.getElementById('room-layout-container');
    const btnFinishGame = document.getElementById('btn-finish-game');
    
    let draggedItem = null;
    let offsetX = 0, offsetY = 0;
    let hasMoved = false;
    let startX = 0, startY = 0;
    let isPointerDown = false;

    // Background objects that shouldn't glow because they're too big
    const noGlowObjects = ['rainy-window', 'crt-tv-selection', 'bookshelf-cupboard', 'posters-collection', 'wilted-plant'];

    // Add hotspot-glow to all hotspots to ensure consistent hover effects
    document.querySelectorAll('.hotspot').forEach(hotspot => {
        if (!hotspot.querySelector('.hotspot-glow') && !noGlowObjects.includes(hotspot.dataset.item)) {
            const glow = document.createElement('div');
            glow.className = 'hotspot-glow';
            hotspot.appendChild(glow);
        }
    });

    // Make sure all elements with class .draggable are properly configured
    const coreItems = [
        'misplaced-drawing', 'misplaced-gift', 'misplaced-block',
        'misplaced-apology', 'misplaced-texts', 'misplaced-trip-form',
        'misplaced-graduation-album', 'misplaced-visa-form', 'misplaced-chemistry-kit'
    ];
    document.querySelectorAll('.draggable').forEach(item => {
        const isCore = coreItems.includes(item.dataset.item);
        if (!isCore) {
            const age = item.closest('.room-canvas')?.id.split('-')[2];
            if (age && !item.hasAttribute('data-origin')) {
                item.setAttribute('data-origin', age);
            }
        }
        item.dataset.defaultWidth = item.style.width;
        item.dataset.defaultHeight = item.style.height;
    });

    document.querySelectorAll('.draggable').forEach(item => {
        item.addEventListener('pointerdown', (e) => {
            if (window.gameState.roomsLocked) {
                openCloseup(item.dataset.item);
                return;
            }
            if(e.button !== 0 && e.pointerType === 'mouse') return; // only left click
            isPointerDown = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            draggedItem = item;
            item.setPointerCapture(e.pointerId);
        });
    });

    document.addEventListener('pointermove', (e) => {
        if(!draggedItem || !isPointerDown) return;
        
        if (!hasMoved) {
            if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                hasMoved = true;
                
                // Initialize drag DOM state
                const rect = draggedItem.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                draggedItem.dataset.origParent = draggedItem.parentNode.id || (draggedItem.parentNode.classList.contains('inventory-slots') ? 'inventory' : '');
                draggedItem.dataset.origLeft = draggedItem.style.left;
                draggedItem.dataset.origTop = draggedItem.style.top;
                draggedItem.origNextSibling = draggedItem.nextSibling;

                draggedItem.classList.add('dragging');
                document.body.appendChild(draggedItem);
                
                draggedItem.style.position = 'fixed';
                draggedItem.style.left = (e.clientX - offsetX) + 'px';
                draggedItem.style.top = (e.clientY - offsetY) + 'px';
                draggedItem.style.width = rect.width + 'px';
                draggedItem.style.height = rect.height + 'px';

                if (draggedItem.classList.contains('in-inventory')) {
                    draggedItem.dataset.wasInInventory = 'true';
                    draggedItem.classList.remove('in-inventory');
                } else {
                    draggedItem.dataset.wasInInventory = 'false';
                }
            } else {
                return;
            }
        }
        draggedItem.style.left = (e.clientX - offsetX) + 'px';
        draggedItem.style.top = (e.clientY - offsetY) + 'px';
        
        // Highlight drop targets
        const roomRect = roomContainer.getBoundingClientRect();
        const invRect = document.getElementById('inventory-bar').getBoundingClientRect();
        
        document.querySelectorAll('.room-canvas').forEach(c => c.classList.remove('drop-target'));
        inventorySlots.classList.remove('drop-target');
        
        if (e.clientY >= invRect.top) {
            inventorySlots.classList.add('drop-target');
        } else if (e.clientX >= roomRect.left && e.clientX <= roomRect.right && e.clientY >= roomRect.top && e.clientY <= roomRect.bottom) {
            document.querySelector('.room-canvas.active').classList.add('drop-target');
        }
    });

    document.addEventListener('pointerup', (e) => {
        if(!draggedItem || !isPointerDown) return;
        isPointerDown = false;
        draggedItem.releasePointerCapture(e.pointerId);
        
        // If it was just a click (no movement), open the detail modal!
        if (!hasMoved) {
            openCloseup(draggedItem.dataset.item);
            draggedItem = null;
            return;
        }

        draggedItem.classList.remove('dragging');
        
        document.querySelectorAll('.room-canvas').forEach(c => c.classList.remove('drop-target'));
        inventorySlots.classList.remove('drop-target');
        
        const invRect = document.getElementById('inventory-bar').getBoundingClientRect();
        const roomRect = roomContainer.getBoundingClientRect();
        
        if (e.clientY >= invRect.top) {
            // Drop in inventory
            draggedItem.style.position = '';
            draggedItem.style.left = '';
            draggedItem.style.top = '';
            draggedItem.style.width = '';
            draggedItem.style.height = '';
            draggedItem.classList.add('in-inventory');
            inventorySlots.appendChild(draggedItem);
        } else if (e.clientX >= roomRect.left && e.clientX <= roomRect.right && e.clientY >= roomRect.top && e.clientY <= roomRect.bottom) {
            // Drop in active room
            const activeCanvas = document.querySelector('.room-canvas.active');
            draggedItem.classList.remove('in-inventory');
            activeCanvas.appendChild(draggedItem);
            
            let xPercent = ((e.clientX - offsetX - roomRect.left) / roomRect.width) * 100;
            let yPercent = ((e.clientY - offsetY - roomRect.top) / roomRect.height) * 100;
            
            // Clamp to prevent dropping items out of bounds
            xPercent = Math.max(0, Math.min(xPercent, 90));
            yPercent = Math.max(0, Math.min(yPercent, 80));
            
            draggedItem.style.position = 'absolute';
            draggedItem.style.left = xPercent + '%';
            draggedItem.style.top = yPercent + '%';
            draggedItem.style.width = draggedItem.dataset.defaultWidth;
            draggedItem.style.height = draggedItem.dataset.defaultHeight;
        } else {
            // Invalid drop, return to orig parent
            if (draggedItem.dataset.origParent === 'inventory') {
                draggedItem.style.position = '';
                draggedItem.style.left = '';
                draggedItem.style.top = '';
                draggedItem.style.width = '';
                draggedItem.style.height = '';
                draggedItem.classList.add('in-inventory');
                if (draggedItem.origNextSibling) {
                    inventorySlots.insertBefore(draggedItem, draggedItem.origNextSibling);
                } else {
                    inventorySlots.appendChild(draggedItem);
                }
            } else {
                const origParent = document.getElementById(draggedItem.dataset.origParent);
                if(origParent) origParent.appendChild(draggedItem);
                draggedItem.classList.remove('in-inventory');
                draggedItem.style.position = 'absolute';
                draggedItem.style.left = draggedItem.dataset.origLeft || '';
                draggedItem.style.top = draggedItem.dataset.origTop || '';
                draggedItem.style.width = draggedItem.dataset.defaultWidth;
                draggedItem.style.height = draggedItem.dataset.defaultHeight;
            }
        }
        
        saveGameState();
        draggedItem = null;
    });

    // Score Calculation & API Submit
    btnFinishGame.addEventListener('click', async () => {
        let teamName = document.getElementById('team-name-input').value.trim();
        if (!teamName) {
            teamName = prompt("Please enter your Team Name before locking in your answers:");
            if (!teamName) return;
        }
        window.gameState.teamName = teamName;

        const placements = [];
        document.querySelectorAll('.draggable').forEach(item => {
            const isCore = coreItems.includes(item.dataset.item);
            if (!isCore) return;
            
            const currentParentId = item.parentNode.id;
            let currentRoom = currentParentId.replace('canvas-age-', '');
            if (currentParentId === 'inventory-slots') currentRoom = 'inventory';
            
            placements.push({
                id: item.dataset.item,
                name: item.querySelector('.hotspot-label').textContent,
                room: currentRoom
            });
        });

        try {
            // Post to Server
            const response = await fetch('/api/submit-rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team: teamName,
                    items: placements,
                    token: window.gameState.sessionToken
                })
            });
            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Failed to submit score.');
                if (response.status === 400 && data.error && data.error.toLowerCase().includes('team name already exists')) {
                    const newName = prompt("Enter a different Team Name:");
                    if (newName) {
                        document.getElementById('team-name-input').value = newName.trim();
                    }
                }
                return;
            }

            // Successfully submitted Rooms! Lock them.
            window.gameState.roomsLocked = true;
            document.body.classList.add('rooms-locked-active');
            window.gameState.roomsScore = data.score;
            window.gameState.roomsTime = data.formatted;

            btnFinishGame.disabled = true;
            btnFinishGame.textContent = 'Room Placements Locked';
            btnFinishGame.style.opacity = '0.5';

            document.querySelectorAll('.draggable').forEach(el => {
                el.style.cursor = 'pointer'; // show it's clickable for popups, but not draggable
            });

            // Unlock the crossword mode navigation
            const btnHeaderCrossword = document.getElementById('btn-header-crossword');
            if (btnHeaderCrossword) {
                btnHeaderCrossword.style.display = 'flex';
            }

            window.showCustomAlert("Solve the crossword to get the characters of Sam's computer password", () => {
                switchMode('crossword');
            });

        } catch (err) {
            console.error('Error submitting rooms score:', err);
            alert('Failed to submit score to the server. Please check your connection.');
        }
    });

    // --- Room Navigation Tab Switching ---
    function changeRoom(age) {
        if (currentAge === age && !landingScreen.classList.contains('active')) return;
        
        // Update tabs active state
        Object.keys(navButtons).forEach(key => {
            if (parseInt(key) === age) {
                navButtons[key].classList.add('active');
            } else {
                navButtons[key].classList.remove('active');
            }
        });

        // Transition Room canvases
        Object.keys(canvases).forEach(key => {
            if (parseInt(key) === age) {
                canvases[key].classList.add('active');
            } else {
                canvases[key].classList.remove('active');
            }
        });

        currentAge = age;
        ageIndicator.textContent = `Age ${age}`;

        // Switch Audio Track
        startSoundscape(age);
        saveGameState();
    }

    [5, 10, 15].forEach(age => {
        // Timeline Tab clicks
        navButtons[age].addEventListener('click', () => changeRoom(age));
    });

    // --- Mode Navigation (Rooms vs Crossword) ---
    const btnHeaderRooms = document.getElementById('btn-header-rooms');
    const btnHeaderCrossword = document.getElementById('btn-header-crossword');

    function switchMode(mode) {
        const roomLayout = document.getElementById('room-layout-container');
        const crosswordLayout = document.getElementById('crossword-container');
        const inventoryBar = document.getElementById('inventory-bar');
        const timelineTabs = document.querySelector('.timeline-tabs');
        const headerFinishBtn = document.getElementById('btn-finish-game');
        
        const roomAgeIndicator = document.getElementById('room-age-indicator');
        const appHeaderTitle = document.getElementById('app-header-title');

        if (mode === 'rooms') {
            // Header title updates
            if (roomAgeIndicator) roomAgeIndicator.style.display = 'inline-block';
            if (appHeaderTitle) appHeaderTitle.textContent = "Sam's Bedroom";
            
            // Header buttons updates
            if (btnHeaderRooms) btnHeaderRooms.style.display = 'none';
            if (window.gameState.roomsLocked) {
                document.body.classList.add('rooms-locked-active');
                if (btnHeaderCrossword) btnHeaderCrossword.style.display = 'flex';
            } else {
                document.body.classList.remove('rooms-locked-active');
                if (btnHeaderCrossword) btnHeaderCrossword.style.display = 'none';
            }
            
            roomLayout.style.display = 'block';
            inventoryBar.style.display = 'flex';
            timelineTabs.style.display = 'flex';
            if (!window.gameState.roomsLocked) {
                headerFinishBtn.style.display = 'flex';
            } else {
                headerFinishBtn.style.display = 'none';
            }
            crosswordLayout.style.display = 'none';
            viewport.classList.remove('crossword-active');
            document.body.classList.remove('crossword-mode-active');
        } else if (mode === 'crossword') {
            // Header title updates - hide age indicator and change title
            if (roomAgeIndicator) roomAgeIndicator.style.display = 'none';
            if (appHeaderTitle) appHeaderTitle.textContent = "Project Rewind";
            
            // Header buttons updates - show Explore Bedroom button on the right
            if (btnHeaderRooms) btnHeaderRooms.style.display = 'flex';
            if (btnHeaderCrossword) btnHeaderCrossword.style.display = 'none';

            roomLayout.style.display = 'none';
            inventoryBar.style.display = 'none';
            timelineTabs.style.display = 'none';
            headerFinishBtn.style.display = 'none';
            crosswordLayout.style.display = 'block';
            viewport.classList.add('crossword-active');
            document.body.classList.add('crossword-mode-active');
            // Sync audio buttons UI state
            syncAudioUI();
            
            // Trigger crossword initialization if not done yet
            if (window.initCrosswordGrid) {
                window.initCrosswordGrid();
            }
        }
        saveGameState();
    }
    window.switchMode = switchMode; // Expose globally

    if (btnHeaderRooms) {
        btnHeaderRooms.addEventListener('click', () => {
            switchMode('rooms');
        });
    }

    if (btnHeaderCrossword) {
        btnHeaderCrossword.addEventListener('click', () => {
            switchMode('crossword');
        });
    }

    const btnCrosswordBack = document.getElementById('btn-crossword-back');
    if (btnCrosswordBack) {
        btnCrosswordBack.addEventListener('click', () => {
            switchMode('rooms');
        });
    }

    // Wire up Landing Screen Doors
    document.querySelectorAll('.door-card').forEach(door => {
        door.addEventListener('click', async () => {
            const teamInputEl = document.getElementById('team-name-input');
            const teamInput = teamInputEl.value.trim();
            if(!teamInput) {
                teamInputEl.classList.add('error-shake');
                setTimeout(() => teamInputEl.classList.remove('error-shake'), 400);
                return;
            }
            
            // Start session with team name (handles duplicate check securely on backend)
            const success = await startSession(teamInput);
            if (!success) {
                teamInputEl.classList.add('error-shake');
                setTimeout(() => teamInputEl.classList.remove('error-shake'), 400);
                return;
            }
            
            // Set teamName in gameState
            window.gameState.teamName = teamInput;

            const selectedAge = parseInt(door.dataset.doorAge);
            
            // Hide landing screen and start the sequence
            if(landingScreen) landingScreen.classList.remove('active');
            
            // Show help modal immediately
            if(helpModal) helpModal.classList.add('active');
            
            // Show navigation tabs
            const modeNav = document.getElementById('game-mode-nav');
            if (modeNav) modeNav.style.display = 'none';

            changeRoom(selectedAge);
        });
    });

    // ==========================================
    // INTERACTIVE MODAL SUB-ELEMENTS & CONTENT DATA
    // ==========================================

    // We will keep these local state variables for sub-item popups
    let currentBookPage = 0;
    let pictureBookPages = [];
    
    let activeDvd = null;
    let dvdTimer = null;
    let dvdVideos = {};
    
    let cassettePlaying = false;
    let cassetteInterval = null;
    let cassetteSubtitles = [];
    
    let currentYearbookLetter = 'S';
    let yearbookStudents = {};
    
    let cupboardBooks = {};
    let schoolbagItems = {};
    let posterItems = {};

    // --- Popup Expansion Engine ---
    async function openCloseup(itemId) {
        try {
            const res = await fetch(`/api/lore/${itemId}`);
            if (!res.ok) {
                alert('Failed to load details from server.');
                return;
            }
            const data = await res.json();
            
            closeupBody.innerHTML = data.html;
            if (itemId === 'computer-15-unlocked') {
                closeupModal.classList.add('computer-modal-active');
            } else {
                closeupModal.classList.remove('computer-modal-active');
            }
            closeupModal.classList.add('active');

            // Post-render binding hooks and data assignment
            if (itemId === 'picture-book') {
                pictureBookPages = data.pages || [];
                currentBookPage = 0;
                updatePictureBook();
                document.getElementById('btn-prev-page').addEventListener('click', () => {
                    if (currentBookPage > 0) {
                        currentBookPage--;
                        updatePictureBook();
                    }
                });
                document.getElementById('btn-next-page').addEventListener('click', () => {
                    if (currentBookPage < pictureBookPages.length - 1) {
                        currentBookPage++;
                        updatePictureBook();
                    }
                });
            }

            if (itemId === 'crt-tv-selection') {
                dvdVideos = data.dvds || {};
                activeDvd = 'dvd-1';
                updateTV();
                document.querySelectorAll('.tv-btn-slot').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const slot = e.currentTarget;
                        const dvd = slot.dataset.dvd;
                        document.querySelectorAll('.tv-btn-slot').forEach(b => b.classList.remove('playing'));
                        slot.classList.add('playing');
                        activeDvd = dvd;
                        updateTV();
                    });
                });
            }

            if (itemId === 'schoolbag') {
                schoolbagItems = data.items || {};
                document.querySelectorAll('[data-bag-item]').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const target = e.currentTarget.dataset.bagItem;
                        showSchoolbagItem(target);
                    });
                });
                showSchoolbagItem('note-bullying');
            }

            if (itemId === 'posters-collection') {
                posterItems = data.items || {};
                document.querySelectorAll('[data-poster-item]').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const target = e.currentTarget.dataset.posterItem;
                        showPosterItem(target);
                    });
                });
                showPosterItem('minecraft');
            }

            if (itemId === 'bookshelf-cupboard') {
                cupboardBooks = data.books || {};
                yearbookStudents = data.yearbookStudents || {};
                document.querySelectorAll('[data-book]').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const book = e.currentTarget.dataset.book;
                        showCupboardBook(book);
                    });
                });
                showCupboardBook('yearbook');
            }

            if (itemId === 'cassette-tape') {
                cassetteSubtitles = data.subtitles || [];
                cassettePlaying = false;
                const playBtn = document.getElementById('btn-play-cassette');
                playBtn.addEventListener('click', toggleCassettePlay);
            }

            if (itemId === 'computer-15' || itemId === 'computer-15-unlocked') {
                bindComputerInterface();
            }
        } catch (err) {
            console.error('Error opening closeup:', err);
        }
    }

    // Close Modal Handler
    btnCloseCloseup.addEventListener('click', () => {
        cleanupCloseupEffects();
        closeupModal.classList.remove('active');
    });

    closeupModal.addEventListener('click', (e) => {
        if (e.target === closeupModal) {
            cleanupCloseupEffects();
            closeupModal.classList.remove('active');
        }
    });

    function cleanupCloseupEffects() {
        closeupModal.classList.remove('computer-modal-active');
        if (dvdTimer) {
            clearInterval(dvdTimer);
            dvdTimer = null;
        }
        if (cassettePlaying) {
            toggleCassettePlay();
        }
    }

    // Dynamic Hotspot Bindings
    document.querySelectorAll('.hotspot').forEach(hotspot => {
        hotspot.addEventListener('click', (e) => {
            if (hotspot.classList.contains('draggable')) {
                // Draggables are handled by pointerup to perfectly distinguish drag vs click
                return;
            }
            let item = e.currentTarget.dataset.item;
            if (item === 'computer-15' || item === 'computer-15-unlocked') {
                if (isComputerUnlocked) {
                    showFullscreenOS();
                    return;
                } else {
                    openCloseup('computer-15');
                    return;
                }
            }
            openCloseup(item);
        });
    });


    // ==========================================
    // COMPLEX CLOSEUP VIEWER CONTROLLERS
    // ======================================    // 1. Picture Book Flip Pages
    async function updatePictureBook() {
        const pagesWrapper = document.getElementById('book-pages-wrapper');
        if (!pagesWrapper) return;
        
        pagesWrapper.innerHTML = `<div style="text-align:center; padding:50px; color:#888; width:100%;">Loading page...</div>`;
        try {
            const res = await fetch('/api/sub-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: 'picture-book', itemId: String(currentBookPage) })
            });
            const result = await res.json();
            const data = result.data;
            if (data) {
                pagesWrapper.innerHTML = `
                    <div class="book-page-side left-side">
                        <p>${data.left}</p>
                    </div>
                    <div class="book-page-side right-side">
                        <p>${data.right}</p>
                    </div>
                `;
            }
        } catch (e) {
            pagesWrapper.innerHTML = `<div style="text-align:center; padding:50px; color:#b32a2a; width:100%;">Error loading page.</div>`;
        }
        
        document.getElementById('btn-prev-page').disabled = (currentBookPage === 0);
        document.getElementById('btn-next-page').disabled = (currentBookPage === pictureBookPages.length - 1);
    }

    // 2. TV console DVD Simulator
    async function updateTV() {
        const tvScreen = document.getElementById('tv-screen-large');
        if (!tvScreen) return;

        if (dvdTimer) {
            clearInterval(dvdTimer);
            dvdTimer = null;
        }

        tvScreen.innerHTML = `<div class="tv-static"></div><div style="position:absolute; top:20px; left:20px; font-family:monospace; color:#0f0;">LOADING DVD...</div>`;

        triggerBeep(300, 0.1);

        try {
            const res = await fetch('/api/sub-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: 'crt-tv-selection', itemId: activeDvd })
            });
            const result = await res.json();
            const data = result.data;

            setTimeout(() => {
                if (!data) return;
                if (activeDvd === 'dvd-3') {
                    // Bullying clip (secret clip)
                    tvScreen.innerHTML = `
                        <div class="tv-gameplay-simulation" style="background:#0c0000; justify-content:space-between; padding:20px;">
                            <span style="font-family:monospace; color:#d90429; font-weight:bold; font-size:0.75rem; text-align:left; width:100%;">● REC [SECRET - 2015]</span>
                            <div style="font-size:0.9rem; line-height:1.5; color:#d90429; font-family:'Architects Daughter';">
                                ${data.desc}
                            </div>
                            <span style="font-family:monospace; color:#d90429; font-size:0.7rem; width:100%; text-align:right;">00:14 / 00:45</span>
                        </div>
                    `;
                } else {
                    let seconds = 0;
                    function drawMinecraftGameplay() {
                        tvScreen.innerHTML = `
                            <div class="tv-gameplay-simulation" style="background:#222; justify-content:space-between; padding:20px; color:#a3b18a;">
                                <span style="font-family:monospace; color:#a3b18a; font-size:0.75rem; text-align:left; width:100%;">${data.title}</span>
                                <div style="font-size:0.9rem; line-height:1.5; font-family:'Outfit'; color:#fff;">
                                    ${data.desc}<br>
                                    <span style="color:#a3b18a; font-size:0.75rem;">Time elapsed: ${seconds}s</span>
                                </div>
                                <span style="font-family:monospace; color:#a3b18a; font-size:0.7rem; width:100%; text-align:right;">${data.status}</span>
                            </div>
                        `;
                    }

                    drawMinecraftGameplay();
                    dvdTimer = setInterval(() => {
                        seconds++;
                        drawMinecraftGameplay();
                        if (seconds % 4 === 0) triggerBeep(440, 0.08);
                    }, 1000);
                }
            }, 1200);
        } catch (e) {
            tvScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#b32a2a;">Error loading DVD.</div>`;
        }
    }

    // 3. Schoolbag Items Explorer (2015)
    async function showSchoolbagItem(item) {
        const detailView = document.getElementById('schoolbag-details-view');
        if (!detailView) return;
        detailView.innerHTML = '<div style="color:#666; font-family:monospace; padding:20px; text-align:center;">Loading...</div>';
        try {
            const res = await fetch('/api/sub-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: 'schoolbag', itemId: item })
            });
            const result = await res.json();
            detailView.innerHTML = result.data || '';
        } catch (e) {
            detailView.innerHTML = '<div style="color:#b32a2a; font-family:monospace; padding:20px; text-align:center;">Error loading item.</div>';
        }
    }

    // 4. Posters Explorer (Age 10)
    async function showPosterItem(item) {
        const detailView = document.getElementById('poster-details-view');
        if (!detailView) return;
        detailView.innerHTML = '<div style="color:#666; font-family:monospace; padding:20px; text-align:center;">Loading...</div>';
        try {
            const res = await fetch('/api/sub-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: 'posters-collection', itemId: item })
            });
            const result = await res.json();
            detailView.innerHTML = result.data || '';
        } catch (e) {
            detailView.innerHTML = '<div style="color:#b32a2a; font-family:monospace; padding:20px; text-align:center;">Error loading poster.</div>';
        }
    }

    // 5. Bookshelf / Cupboard Books Explorer (2020)
    async function showCupboardBook(book) {
        const detailView = document.getElementById('cupboard-detail-view');
        if (!detailView) return;

        if (book === 'yearbook') {
            detailView.innerHTML = `
                <div class="yearbook-layout">
                    <div class="yearbook-index" id="yb-index"></div>
                    <div class="yearbook-page-viewer" id="yb-viewer"></div>
                </div>`;
            populateYearbookIndex();
            loadYearbookPage();
        } else {
            detailView.innerHTML = '<div style="color:#666; font-family:monospace; padding:20px; text-align:center;">Loading...</div>';
            try {
                const res = await fetch('/api/sub-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentId: 'bookshelf-cupboard', itemId: book })
                });
                const result = await res.json();
                detailView.innerHTML = result.data || '';
            } catch (e) {
                detailView.innerHTML = '<div style="color:#b32a2a; font-family:monospace; padding:20px; text-align:center;">Error loading book.</div>';
            }
        }
    }

    function triggerBeep(freq, dur) {
        if (!audioCtx || isMuted) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.1);
    }

    // 6. Yearbook A-Z Page Viewer
    function populateYearbookIndex() {
        const indexContainer = document.getElementById('yb-index');
        if (!indexContainer) return;

        let indexHtml = '';
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        
        letters.forEach(letter => {
            const student = yearbookStudents[letter];
            let specialClass = '';
            if (student && (student.isVandalised || student.isCrumpled || student.isSam)) {
                specialClass = 'special-btn';
            }
            const activeClass = (letter === currentYearbookLetter) ? 'active' : '';
            indexHtml += `<button class="yearbook-idx-btn ${specialClass} ${activeClass}" data-letter="${letter}">${letter}</button>`;
        });

        indexContainer.innerHTML = indexHtml;

        document.querySelectorAll('.yearbook-idx-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentYearbookLetter = e.currentTarget.dataset.letter;
                document.querySelectorAll('.yearbook-idx-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                loadYearbookPage();
            });
        });
    }

    async function loadYearbookPage() {
        const viewer = document.getElementById('yb-viewer');
        if (!viewer) return;

        viewer.innerHTML = `<div style="text-align:center; padding:100px; color:#888;">Loading page...</div>`;
        viewer.className = "yearbook-page-viewer";

        try {
            const res = await fetch('/api/sub-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: 'bookshelf-cupboard-yearbook', itemId: currentYearbookLetter })
            });
            const result = await res.json();
            const data = result.data;
            
            if (!data) {
                viewer.innerHTML = `<div style="text-align:center; padding:100px; color:#888;">Empty Page</div>`;
                return;
            }

            viewer.className = "yearbook-page-viewer";
            if (data.isCrumpled) {
                viewer.classList.add('crumpled');
            }

            let photoHtml = '';
            if (data.photoFile) {
                photoHtml = `<div class="student-photo-slot" style="background-image: url('${data.photoFile}')">`;
            } else {
                photoHtml = `<div class="student-photo-slot"><svg viewBox="0 0 140 180" width="100%"><rect width="140" height="180" fill="${data.photoColor}"/><circle cx="70" cy="70" r="28" fill="white" opacity="0.3"/><text x="45" y="140" font-family="sans-serif" font-size="12" fill="white" opacity="0.5">STUDENT</text></svg>`;
            }
            
            if (data.isVandalised) {
                photoHtml += `<div class="vandalised-photo-overlay"></div>`;
            }
            photoHtml += `</div>`;

            let quoteContent = `<p class="student-quote">${data.quote}</p>`;
            if (data.isSam) {
                quoteContent = `
                    <p class="student-quote" style="color:#555; font-weight:bold;">${data.quote}</p>
                    <div class="hate-scribble">${data.hateComment}</div>
                `;
            }

            viewer.innerHTML = `
                ${data.isCrumpled ? '<div class="crumpled-shatter"></div>' : ''}
                <div class="yearbook-student-profile">
                    ${photoHtml}
                    <div class="yearbook-student-info">
                        <h4>${data.name}</h4>
                        ${quoteContent}
                        ${data.isVandalised ? '<p style="color:#b32a2a; font-family:\'Architects Daughter\'; font-weight:bold; font-size:0.9rem; margin-top:20px;">[VANDALISED BY SAM]</p>' : ''}
                        ${data.notes ? `<p style="font-size:0.75rem; color:#888; margin-top:5px;">Note: ${data.notes}</p>` : ''}
                    </div>
                </div>
                <div class="yearbook-footer">
                    AMARILLO HIGH SCHOOL — Class of 2020
                </div>
            `;
        } catch (e) {
            viewer.innerHTML = `<div style="text-align:center; padding:100px; color:#b32a2a;">Error loading page.</div>`;
        }
    }

    // 7. Cassette Player Tape Controller
    function toggleCassettePlay() {
        const cassette = document.getElementById('cassette-body');
        const subtitles = document.getElementById('cassette-subtitles');
        const playBtn = document.getElementById('btn-play-cassette');
        if (!cassette || !subtitles || !playBtn) return;

        cassettePlaying = !cassettePlaying;

        if (cassettePlaying) {
            cassette.classList.add('playing');
            playBtn.textContent = 'Stop Tape';
            
            triggerHumHiss(true);

            let index = 0;
            subtitles.innerHTML = `<span style="color:#ffd166;">● PLAYING [2020]:</span> "${cassetteSubtitles[index]}"`;
            
            cassetteInterval = setInterval(() => {
                index++;
                if (index < cassetteSubtitles.length) {
                    subtitles.innerHTML = `<span style="color:#ffd166;">● PLAYING [2020]:</span> "${cassetteSubtitles[index]}"`;
                    triggerBeep(320, 0.04);
                } else {
                    toggleCassettePlay(); 
                }
            }, 4500);

        } else {
            cassette.classList.remove('playing');
            playBtn.textContent = 'Play Tape';
            subtitles.innerHTML = `Tape stopped.`;
            triggerHumHiss(false);

            if (cassetteInterval) {
                clearInterval(cassetteInterval);
                cassetteInterval = null;
            }
        }
    }

    let cassetteHumNode = null;
    function triggerHumHiss(start) {
        if (!audioCtx || isMuted) return;
        const now = audioCtx.currentTime;

        if (start) {
            if (cassetteHumNode) return;
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 60; 

            const biquad = audioCtx.createBiquadFilter();
            biquad.type = 'lowpass';
            biquad.frequency.value = 250;

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.5);

            osc.connect(biquad);
            biquad.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);

            cassetteHumNode = { osc, gain };
        } else {
            if (!cassetteHumNode) return;
            const node = cassetteHumNode;
            node.gain.setValueAtTime(node.gain.value, now);
            node.gain.linearRampToValueAtTime(0, now + 0.3);
            node.osc.stop(now + 0.4);
            cassetteHumNode = null;
        }
    }

    function bindComputerInterface() {
        if (isComputerUnlocked) {
            // Bind file item clicks
            const fileViewer = document.getElementById('comp-file-viewer');
            const fileItems = document.querySelectorAll('.comp-file-item');
            
            fileItems.forEach(item => {
                const fileKey = item.dataset.file;
                if (fileKey) {
                    item.addEventListener('click', async () => {
                        fileItems.forEach(i => i.style.background = 'rgba(255,255,255,0.05)');
                        item.style.background = 'rgba(42, 157, 143, 0.2)';
                        
                        fileViewer.innerHTML = '<div style="color:#8ea2c0; font-family:monospace; padding:20px; text-align:center;">Decrypting file...</div>';
                        try {
                            const response = await fetch(`/api/computer-file/${fileKey}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: window.gameState.sessionToken })
                            });
                            const data = await response.json();
                            if (response.ok && data.html) {
                                fileViewer.innerHTML = data.html;
                            } else {
                                fileViewer.innerHTML = `<div style="color:#e07a5f; font-family:monospace; padding:20px; text-align:center;">ACCESS DENIED: ${data.error || 'Failed to load file.'}</div>`;
                            }
                        } catch (err) {
                            console.error('Error loading computer file:', err);
                            fileViewer.innerHTML = '<div style="color:#e07a5f; font-family:monospace; padding:20px; text-align:center;">Error decrypting file.</div>';
                        }
                    });
                }
            });
            
        } else {
            const pInput = document.getElementById('comp-password-input');
            const btnUnlock = document.getElementById('btn-comp-unlock');
            const errMsg = document.getElementById('comp-error-msg');
            
            const attemptUnlock = async () => {
                const pwd = pInput.value.trim().toLowerCase();
                
                // Client-side quick check for crossword completion
                if (!window.gameState.crosswordCompleted) {
                    errMsg.style.color = '#e07a5f';
                    errMsg.textContent = 'ACCESS DENIED: Crossword stabilization required.';
                    pInput.classList.add('error-shake');
                    setTimeout(() => pInput.classList.remove('error-shake'), 400);
                    triggerBeep(150, 0.3);
                    return;
                }

                try {
                    const response = await fetch('/api/verify-computer-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            password: pwd,
                            token: window.gameState.sessionToken
                        })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        errMsg.style.color = '#2ecc71';
                        errMsg.textContent = 'ACCESS GRANTED. DECRYPTING MEMORIES...';
                        triggerBeep(880, 0.15);
                        setTimeout(() => {
                            triggerBeep(1200, 0.2);
                        }, 150);
                        
                        setTimeout(() => {
                            isComputerUnlocked = true;
                            saveGameState();
                            
                            // Close/hide the closeup modal
                            closeupModal.classList.remove('active');
                            cleanupCloseupEffects();
                            
                            // Display the retro OS in full screen
                            showFullscreenOS();
                        }, 1200);
                    } else {
                        errMsg.style.color = '#e07a5f';
                        if (data.error === 'CROSSWORD NOT COMPLETED') {
                            errMsg.textContent = 'ACCESS DENIED: Crossword stabilization required.';
                        } else {
                            errMsg.textContent = 'ACCESS DENIED. INVALID PASSWORD.';
                        }
                        pInput.classList.add('error-shake');
                        setTimeout(() => pInput.classList.remove('error-shake'), 400);
                        triggerBeep(150, 0.3);
                    }
                } catch(e) {
                    console.error(e);
                    errMsg.textContent = 'Error communicating with server.';
                }
            };
            
            btnUnlock.addEventListener('click', attemptUnlock);
            pInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    attemptUnlock();
                }
            });
            
            pInput.focus();
        }
    }

    async function restoreGameState() {
        try {
            const savedStateStr = localStorage.getItem('project_rewind_game_state');
            if (!savedStateStr) return;

            const state = JSON.parse(savedStateStr);
            if (!state || !state.sessionToken || !state.teamName) return;

            // 1. If session is older than 2 hours, it is expired on the server. Clear and restart.
            if (state.startTime && (Date.now() - state.startTime > 2 * 60 * 60 * 1000)) {
                localStorage.removeItem('project_rewind_game_state');
                window.location.reload();
                return;
            }

            // 2. If rooms are locked, we must exist in server scores.
            if (state.roomsLocked) {
                try {
                    const res = await fetch('/api/scores');
                    if (res.ok) {
                        const scores = await res.json();
                        const teamExists = scores.some(s => s.team.trim().toLowerCase() === state.teamName.trim().toLowerCase());
                        if (!teamExists) {
                            localStorage.removeItem('project_rewind_game_state');
                            window.location.reload();
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Failed to verify session status with server:', err);
                }
            }

            // Restore gameState values
            window.gameState.teamName = state.teamName;
            window.gameState.sessionToken = state.sessionToken;
            window.gameState.startTime = state.startTime || Date.now();
            window.gameState.roomsLocked = state.roomsLocked || false;
            window.gameState.roomsScore = state.roomsScore || 0;
            window.gameState.roomsTime = state.roomsTime || 0;
            window.gameState.crosswordCompleted = state.crosswordCompleted || false;
            window.gameState.totalTime = state.totalTime || 0;
            window.gameState.secretCells = state.secretCells || null;

            isComputerUnlocked = state.isComputerUnlocked || false;
            currentAge = state.currentAge || 5;
            gameStarted = true;

            // Restart the timer loop on load
            startGameTimer(window.gameState.startTime);

            // Update team name input in UI
            const teamInputEl = document.getElementById('team-name-input');
            if (teamInputEl) teamInputEl.value = state.teamName;

            // Hide landing screen
            if (landingScreen) landingScreen.classList.remove('active');

            // Restore placements
            if (state.placements) {
                state.placements.forEach(p => {
                    const el = document.querySelector(`.draggable[data-item="${p.item}"]`);
                    if (el) {
                        if (p.inInventory) {
                            el.classList.add('in-inventory');
                            el.style.position = '';
                            el.style.left = '';
                            el.style.top = '';
                            el.style.width = '';
                            el.style.height = '';
                            if (inventorySlots) inventorySlots.appendChild(el);
                        } else {
                            el.classList.remove('in-inventory');
                            el.style.position = p.position || 'absolute';
                            el.style.left = p.left || '';
                            el.style.top = p.top || '';
                            const parent = document.getElementById(p.parentId);
                            if (parent) {
                                parent.appendChild(el);
                            }
                        }
                    }
                });
            }

            // Restore rooms locked UI states
            if (window.gameState.roomsLocked) {
                document.body.classList.add('rooms-locked-active');
                btnFinishGame.disabled = true;
                btnFinishGame.textContent = 'Room Placements Locked';
                btnFinishGame.style.opacity = '0.5';

                document.querySelectorAll('.draggable').forEach(el => {
                    el.style.cursor = 'pointer';
                });

                const btnHeaderCrossword = document.getElementById('btn-header-crossword');
                if (btnHeaderCrossword) {
                    btnHeaderCrossword.style.display = 'flex';
                }
            }

            // Switch to correct mode UI
            if (state.currentMode === 'crossword' || window.gameState.roomsLocked) {
                switchMode('crossword');
            } else {
                switchMode('rooms');
                changeRoom(currentAge);
            }

            // Restore full screen OS if computer is unlocked
            if (isComputerUnlocked) {
                showFullscreenOS();
            }
        } catch (e) {
            console.error('Failed to restore game state from localStorage:', e);
        }
    }

    // Trigger restoration on page load
    restoreGameState();

});
