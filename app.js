/* ==========================================
   SAM'S BEDROOM: INTERACTIVE MECHANICS & AUDIO
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
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
                applyScenario(data.startingPlacements);
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
            gameStarted = true;
            gameStartTime = Date.now();
            const timerEl = document.getElementById('game-timer');
            timerEl.style.display = 'block';
            
            timerInterval = setInterval(() => {
                const elapsed = Date.now() - gameStartTime;
                const m = Math.floor(elapsed / 60000).toString().padStart(2, '0');
                const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
                const timeString = `${m}:${s}`;
                
                timerEl.textContent = timeString;
                const crosswordTimerEl = document.getElementById('crossword-timer');
                if (crosswordTimerEl) {
                    crosswordTimerEl.textContent = timeString;
                }
            }, 1000);
            
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
            if (window.gameState.roomsLocked) return;
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

            alert(`Room placements locked in successfully! Score: ${data.score}%. Proceeding to Part 2: Memory Crossword.`);
            switchMode('crossword');

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
                if (btnHeaderCrossword) btnHeaderCrossword.style.display = 'flex';
            } else {
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
            
            // Automatically open help/description modal when returning from crossword
            if (helpModal) {
                helpModal.classList.add('active');
            }
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
                    const fsContainer = document.getElementById('fullscreen-os-container');
                    const fsIframe = document.getElementById('fullscreen-os-iframe');
                    if (fsContainer && fsIframe) {
                        fsContainer.style.display = 'block';
                        fsIframe.src = '/win93/index.html';
                    }
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
    // ==========================================

    // 1. Picture Book Flip Pages
    function updatePictureBook() {
        const pagesWrapper = document.getElementById('book-pages-wrapper');
        if (!pagesWrapper) return;
        
        const data = pictureBookPages[currentBookPage];
        if (!data) return;
        pagesWrapper.innerHTML = `
            <div class="book-page-side left-side">
                <p>${data.left}</p>
            </div>
            <div class="book-page-side right-side">
                <p>${data.right}</p>
            </div>
        `;
        
        document.getElementById('btn-prev-page').disabled = (currentBookPage === 0);
        document.getElementById('btn-next-page').disabled = (currentBookPage === pictureBookPages.length - 1);
    }

    // 2. TV console DVD Simulator
    function updateTV() {
        const tvScreen = document.getElementById('tv-screen-large');
        if (!tvScreen) return;

        if (dvdTimer) {
            clearInterval(dvdTimer);
            dvdTimer = null;
        }

        const data = dvdVideos[activeDvd];
        if (!data) return;
        
        tvScreen.innerHTML = `<div class="tv-static"></div><div style="position:absolute; top:20px; left:20px; font-family:monospace; color:#0f0;">LOADING DVD...</div>`;

        triggerBeep(300, 0.1);

        setTimeout(() => {
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
    }

    // 3. Schoolbag Items Explorer (2015)
    function showSchoolbagItem(item) {
        const detailView = document.getElementById('schoolbag-details-view');
        if (!detailView) return;
        detailView.innerHTML = schoolbagItems[item] || '';
    }

    // 4. Posters Explorer (Age 10)
    function showPosterItem(item) {
        const detailView = document.getElementById('poster-details-view');
        if (!detailView) return;
        detailView.innerHTML = posterItems[item] || '';
    }

    // 5. Bookshelf / Cupboard Books Explorer (2020)
    function showCupboardBook(book) {
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
            detailView.innerHTML = cupboardBooks[book] || '';
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

    function loadYearbookPage() {
        const viewer = document.getElementById('yb-viewer');
        if (!viewer) return;

        const data = yearbookStudents[currentYearbookLetter];
        
        if (!data) {
            viewer.innerHTML = `<div style="text-align:center; padding:100px; color:#888;">Empty Page</div>`;
            viewer.className = "yearbook-page-viewer";
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
            
            const fileContents = {
                acceptance: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL: stanford_admit.eml</strong>
                        <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">From: admissions@stanford.edu<br>Date: May 12, 2020<br>To: samrudh.sharma@amarillohigh.edu</p>
                        <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                            Dear Samrudh,<br><br>
                            Congratulations! I am thrilled to inform you that you have been admitted to the <strong>Stanford University Class of 2024</strong>. 
                        </p>
                        <p style="margin:10px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                            Your outstanding academic record, combined with your pioneering research proposal in Neural Engineering, made you a standout candidate. We are proud to offer you a spot in our undergraduate program.
                        </p>
                        <p style="margin:10px 0 0 0; line-height:1.5; color:#ffd166; font-size:0.8rem; font-weight:bold;">
                            Welcome to Stanford!
                        </p>
                    </div>`,
                ielts: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL: ielts_report.eml</strong>
                        <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">From: results@ieltsessentials.com<br>Date: May 5, 2020<br>To: samrudh.sharma@amarillohigh.edu</p>
                        <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                            Dear Candidate,<br><br>
                            Your IELTS Academic test results are now available. You have achieved your <strong>highest target score</strong>:
                        </p>
                        <p style="margin:10px 0; line-height:1.4; color:#eef1f6; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:4px; font-family:monospace;">
                            • <strong>Listening:</strong> 9.0 &nbsp;&nbsp;&nbsp;&nbsp; • <strong>Reading:</strong> 9.0<br>
                            • <strong>Writing:</strong> 8.0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • <strong>Speaking:</strong> 8.5<br>
                            ----------------------------------<br>
                            • <strong>OVERALL BAND SCORE:</strong> <span style="color:#2a9d8f; font-weight:bold; font-size:0.9rem;">8.5 (Expert User)</span>
                        </p>
                        <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                            This score fulfills the English proficiency requirements for all top-tier international institutions, including Stanford University.
                        </p>
                    </div>`,
                prom: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#e63946; border-bottom:1px solid rgba(230,57,70,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL DRAFT: draft_prom_night.eml</strong>
                        <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">To: emma.j@amarillohigh.edu<br>Date: June 9, 2020<br>Status: UNSENT DRAFT</p>
                        <div style="line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                            <p style="margin: 0 0 10px 0;">I am writing this from my bedroom floor. My hands are still shaking. Tonight was supposed to be the best night. I spent weeks preparing everything perfectly. I convinced my parents about my outfit. I wore a modern suit to fit in. I thought Emma wanted to go with me. I was so completely wrong.</p>
                            <p style="margin: 0 0 10px 0;">We stood near the dance floor. Her friends walked over. I tried to make a joke. Emma looked at them and sneered. She mocked my dancing and my voice. She said I looked desperate asking her.</p>
                            <p style="margin: 0 0 10px 0;">The guys walked up. They saw Emma leading the mockery. They joined in instantly. They tossed around old insults. They called me "Stinky Sam."</p>
                            <p style="margin: 0 0 10px 0;">The worst part was Emma. She laughed right along with them.</p>
                            <p style="margin: 0 0 10px 0;">Everyone around us was watching. People recorded it on their phones.</p>
                            <p style="margin: 0 0 10px 0;">A massive lump formed in my throat.</p>
                            <p style="margin: 0 0 10px 0;">The first tear slipped out.</p>
                            <p style="margin: 0 0 10px 0;">One of the guys pointed it out to everyone.</p>
                            <p style="margin: 0 0 10px 0;">I could not take it anymore.</p>
                            <p style="margin: 0 0 10px 0;">I turned around and walked out.</p>
                            <p style="margin: 0 0 10px 0;">I was crying openly.</p>
                            <p style="margin: 0 0 10px 0;">I felt completely humiliated.</p>
                            <p style="margin: 0 0 10px 0;">I walked home in the dark.</p>
                            <p style="margin: 0;">I have never felt so alone.</p>
                        </div>
                    </div>`,
                therapy: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">LOG: therapy_session.log</strong>
                        <p style="color:#8ea2c0; font-size:0.8rem; margin:0 0 10px 0;">Date: October 12, 2020<br>Clinician: Dr. Aris</p>
                        <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                            Patient Samrudh Sharma (Age 15) exhibits deep symptoms of isolation and emotional neglect. Since his relocation, his primary attachment was his dog, Buddy, whose recent passing triggered a severe depressive state.
                        </p>
                        <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                            <em>Key Observation:</em> When asked about his outlook on the future, he repeatedly stated that his isolation and academic pressure make his withdrawal feel <strong>"inevitable"</strong>.
                        </p>
                    </div>`,
                timeline: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">DATA: timeline_data.dat</strong>
                        <ul style="padding-left:15px; margin:5px 0 0 0; display:flex; flex-direction:column; gap:8px; color:#eef1f6; line-height:1.4; font-size:0.85rem;">
                            <li><strong>Era 2010 (Age 5):</strong> Solitary play. High creativity in drawings. Feels left behind.</li>
                            <li><strong>Era 2015 (Age 10):</strong> Bullying in middle school group chats. Escaped into gaming.</li>
                            <li><strong>Era 2020 (Age 15):</strong> Severe withdrawal. Co-authored neural engineering research paper, but zero social engagement.</li>
                        </ul>
                    </div>`,
                medical: `
                    <div style="width:100%; text-align:left; box-sizing:border-box;">
                        <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">REPORT: diagnosis_rpt.pdf</strong>
                        <p style="color:#8ea2c0; font-size:0.8rem; margin:0 0 10px 0;">Issuer: St. Jude Neurological Institute</p>
                        <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                            Early-onset cognitive fragmentation. The patient's mind is locked in a loop of past traumas and memories.
                        </p>
                        <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                            Timeline stabilization is required. If memory fragments (apology letter, bully texts, family drawing) are not returned to their correct eras, permanent brain death is projected.
                        </p>
                    </div>`
            };
            
            fileItems.forEach(item => {
                const fileKey = item.dataset.file;
                if (fileKey && fileContents[fileKey]) {
                    item.addEventListener('click', () => {
                        fileItems.forEach(i => i.style.background = 'rgba(255,255,255,0.05)');
                        item.style.background = 'rgba(42, 157, 143, 0.2)';
                        fileViewer.innerHTML = fileContents[fileKey];
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
                            
                            // Close/hide the closeup modal
                            closeupModal.classList.remove('active');
                            cleanupCloseupEffects();
                            
                            // Display the retro OS in full screen
                            const fsContainer = document.getElementById('fullscreen-os-container');
                            const fsIframe = document.getElementById('fullscreen-os-iframe');
                            if (fsContainer && fsIframe) {
                                fsContainer.style.display = 'block';
                                fsIframe.src = '/win93/index.html';
                            }
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

    // --- DevTools and Automation Deterrents (AI Proofing) ---
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    document.addEventListener('keydown', e => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            return false;
        }
        // Cmd+Opt+I, Cmd+Opt+J, Cmd+Opt+C, Cmd+Opt+K (macOS)
        if (e.metaKey && e.altKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U / Cmd+Opt+U (View Source)
        if ((e.ctrlKey && e.key.toLowerCase() === 'u') || (e.metaKey && e.altKey && e.key.toLowerCase() === 'u')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S / Cmd+S (Save Page)
        if ((e.ctrlKey && e.key.toLowerCase() === 's') || (e.metaKey && e.key.toLowerCase() === 's')) {
            e.preventDefault();
            return false;
        }
    });

    setInterval(() => {
        (function() {}).constructor("debugger")();
    }, 100);
});
