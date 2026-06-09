/* --------------------------------------------------
   WINDOWS 93 OS Desktop & Window Manager Core
   Draggable/Resizable Windows, Taskbar & Boot Flow
-------------------------------------------------- */

const SystemOS = {
    activeWindow: null,
    windows: {},
    windowZIndex: 100,
    apps: {}, // Registered applications

    init() {
        this.runBootSequence();
        this.bindGlobalEvents();
        this.startSystemClock();
    },

    // --------------------------------------------------
    // Boot sequence animation
    // --------------------------------------------------
    runBootSequence() {
        const bootScreen = document.getElementById('boot-screen');
        const progressBar = document.getElementById('boot-progress');
        const logsContainer = document.getElementById('boot-logs');
        
        const logs = [
            "> INITIALIZING RETRO BI-STABLE CORE ENGINE...",
            "> TESTING WEBAUDIO VOICE CHANNELS...",
            "> CHIP CONFIG: [4 OSCILLATORS, SINE/SAW/TRI/SQUARE]",
            "> PROBING BROWSER CACHE PERSISTENCE...",
            "> [OK] PERSISTENT SYSTEM SEEDS LOADED.",
            "> VIRTUAL FILE SYSTEM RESOLVED: [WELCOME.TXT, HELLO.JS, SYSTEM.CONF]",
            "> CURVATURE SHADER COIL WARMUP COMPLETE.",
            "> STARTING CRT EMULATION GRID...",
            "> SYSTEM NOMINAL. LAUNCHING SHELL DESKTOP..."
        ];

        let progress = 0;
        let logIndex = 0;

        // Sound triggers on first user click to satisfy browser audio policies
        const triggerBootStart = () => {
            document.removeEventListener('click', triggerBootStart);
            SoundCard.playStartup();
        };
        document.addEventListener('click', triggerBootStart);

        const timer = setInterval(() => {
            progress += Math.random() * 8 + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
                
                // Finalize boot
                progressBar.style.width = '100%';
                setTimeout(() => {
                    bootScreen.style.opacity = '0';
                    setTimeout(() => {
                        bootScreen.style.display = 'none';
                        // Show welcome dialog on startup
                        this.showWelcomeDialog();
                        // Auto-open Welcome file in Explorer on first load
                        this.openApp('explorer');
                    }, 500);
                }, 400);
            } else {
                progressBar.style.width = `${progress}%`;
                
                // Add log text sequentially
                if (logIndex < logs.length && progress > (logIndex / logs.length) * 100) {
                    const p = document.createElement('p');
                    p.innerText = logs[logIndex];
                    logsContainer.appendChild(p);
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                    logIndex++;
                }
            }
        }, 120);
    },

    // --------------------------------------------------
    // Event Binds
    // --------------------------------------------------
    bindGlobalEvents() {
        // Desktop shortcut click handlers
        document.querySelectorAll('.desktop-shortcut').forEach(sc => {
            sc.addEventListener('click', (e) => {
                e.stopPropagation();
                // Deselect all others
                document.querySelectorAll('.desktop-shortcut').forEach(s => s.classList.remove('selected'));
                sc.classList.add('selected');
                SoundCard.playClick();
            });

            sc.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const appName = sc.getAttribute('data-app');
                this.openApp(appName);
            });
        });

        // Click outside shortcut to deselect
        document.getElementById('desktop').addEventListener('click', () => {
            document.querySelectorAll('.desktop-shortcut').forEach(s => s.classList.remove('selected'));
            this.closeStartMenu();
        });

        // Start Menu Button Toggle
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            SoundCard.playClick();
            const startMenu = document.getElementById('start-menu');
            startMenu.classList.toggle('open');
            startBtn.classList.toggle('active');
        });

        // Start Menu Item clicks
        document.querySelectorAll('.start-menu .start-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const appName = item.getAttribute('data-app');
                if (appName) {
                    this.openApp(appName);
                }
                this.closeStartMenu();
            });
        });

        // Reset OS VFS
        document.getElementById('start-reset-vfs').addEventListener('click', () => {
            if (confirm("WARNING: This will wipe all files in the persistent VFS and reload the desktop. Proceed?")) {
                VFS.reset();
                location.reload();
            }
        });

        // Shutdown system trigger
        document.getElementById('start-shutdown').addEventListener('click', () => {
            SoundCard.playShutdown();
            const bsod = document.getElementById('bsod-screen');
            bsod.style.display = 'block';
            
            // Reboot trigger on key press
            const reboot = () => {
                document.removeEventListener('keydown', reboot);
                location.reload();
            };
            setTimeout(() => {
                document.addEventListener('keydown', reboot);
            }, 1000);
        });

        // Sound Toggle
        const soundToggleBtn = document.getElementById('sound-toggle');
        soundToggleBtn.addEventListener('click', () => {
            const isEnabled = SoundCard.toggle();
            soundToggleBtn.innerHTML = isEnabled ? '🔊' : '🔇';
            soundToggleBtn.title = isEnabled ? 'Mute Retro Sounds' : 'Unmute Retro Sounds';
        });
    },

    closeStartMenu() {
        document.getElementById('start-menu').classList.remove('open');
        document.getElementById('start-btn').classList.remove('active');
    },

    startSystemClock() {
        const clockEl = document.getElementById('system-clock');
        const updateClock = () => {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            clockEl.innerText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        };
        setInterval(updateClock, 1000);
        updateClock();
    },

    // Register Application instances
    registerApp(name, launchCallback) {
        this.apps[name] = launchCallback;
    },

    openApp(name, params = null) {
        SoundCard.playClick();
        if (this.apps[name]) {
            this.apps[name](params);
        } else {
            this.showErrorDialog(`Application '${name}' is not registered inside the active WIMP layer.`);
        }
    },

    // --------------------------------------------------
    // Dynamic Window Manager
    // --------------------------------------------------
    createWindow(id, title, icon, width = 450, height = 320, defaultParams = {}) {
        // If window exists, restore and focus it
        if (this.windows[id]) {
            const el = this.windows[id].element;
            el.style.display = 'flex';
            this.focusWindow(id);
            return this.windows[id];
        }

        const winZ = ++this.windowZIndex;
        const desktop = document.getElementById('desktop');
        
        // Random center positioning offset to prevent overlapping
        const offset = Object.keys(this.windows).length * 20;
        const topPos = Math.max(20, (desktop.clientHeight - height) / 2 + offset % 100);
        const leftPos = Math.max(20, (desktop.clientWidth - width) / 2 + offset % 100);

        // Build Window Element markup
        const winEl = document.createElement('div');
        winEl.id = `win-${id}`;
        winEl.className = 'window bevel-out';
        winEl.style.width = `${width}px`;
        winEl.style.height = `${height}px`;
        winEl.style.top = `${topPos}px`;
        winEl.style.left = `${leftPos}px`;
        winEl.style.zIndex = winZ;

        winEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span class="window-title-icon">${icon}</span>
                    <span class="window-title-text">${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn bevel-out" id="btn-min-${id}" title="Minimize">_</button>
                    <button class="window-btn bevel-out" id="btn-max-${id}" title="Maximize">🗖</button>
                    <button class="window-btn bevel-out" id="btn-close-${id}" title="Close">X</button>
                </div>
            </div>
            <div class="window-body">
                <div class="window-content" id="content-${id}"></div>
            </div>
        `;

        desktop.appendChild(winEl);

        const winData = {
            id: id,
            title: title,
            icon: icon,
            element: winEl,
            width: width,
            height: height,
            top: topPos,
            left: leftPos,
            isMaximized: false,
            onClose: defaultParams.onClose || null
        };

        this.windows[id] = winData;

        // Bind Drag and Resize handlers
        this.setupWindowDrag(id);
        this.setupWindowControls(id);
        
        // Focus new window
        this.focusWindow(id);

        // Add Tab on taskbar
        this.addTaskbarTab(id);

        return winData;
    },

    focusWindow(id) {
        if (!this.windows[id]) return;
        
        // Set all windows as inactive
        Object.keys(this.windows).forEach(winId => {
            const el = this.windows[winId].element;
            el.classList.add('window-inactive');
            el.classList.remove('window-active');
            
            // Inactivate taskbar tab
            const tab = document.getElementById(`tab-${winId}`);
            if (tab) tab.classList.remove('active');
        });

        // Activate target window
        const target = this.windows[id].element;
        target.classList.remove('window-inactive');
        target.classList.add('window-active');
        target.style.zIndex = ++this.windowZIndex;
        
        // Activate taskbar tab
        const tab = document.getElementById(`tab-${id}`);
        if (tab) tab.classList.add('active');

        this.activeWindow = id;
    },

    closeWindow(id) {
        if (!this.windows[id]) return;
        
        // Call onClose hook if present
        if (this.windows[id].onClose) {
            this.windows[id].onClose();
        }

        // Remove element and dictionary item
        this.windows[id].element.remove();
        delete this.windows[id];

        // Remove tab from taskbar
        const tab = document.getElementById(`tab-${id}`);
        if (tab) tab.remove();

        // Focus next window
        const remaining = Object.keys(this.windows);
        if (remaining.length > 0) {
            this.focusWindow(remaining[remaining.length - 1]);
        } else {
            this.activeWindow = null;
        }
    },

    minimizeWindow(id) {
        if (!this.windows[id]) return;
        this.windows[id].element.style.display = 'none';
        
        // Remove active state
        const tab = document.getElementById(`tab-${id}`);
        if (tab) tab.classList.remove('active');
        
        // Focus another window
        const remaining = Object.keys(this.windows).filter(wId => this.windows[wId].element.style.display !== 'none');
        if (remaining.length > 0) {
            this.focusWindow(remaining[remaining.length - 1]);
        }
    },

    maximizeWindow(id) {
        if (!this.windows[id]) return;
        const win = this.windows[id];
        const el = win.element;

        if (win.isMaximized) {
            // Restore sizes
            el.style.width = `${win.width}px`;
            el.style.height = `${win.height}px`;
            el.style.top = `${win.top}px`;
            el.style.left = `${win.left}px`;
            el.querySelector(`#btn-max-${id}`).innerText = '🗖';
            win.isMaximized = false;
        } else {
            // Save dimensions
            win.width = el.clientWidth;
            win.height = el.clientHeight;
            win.top = parseInt(el.style.top, 10) || 0;
            win.left = parseInt(el.style.left, 10) || 0;

            // Expand full screen
            el.style.width = '100%';
            el.style.height = '100%'; // Sibling layout means desktop fills remainder, so 100% height is correct
            el.style.top = '0px';
            el.style.left = '0px';
            el.querySelector(`#btn-max-${id}`).innerText = '🗗';
            win.isMaximized = true;
        }
    },

    setupWindowDrag(id) {
        const win = this.windows[id];
        const header = win.element.querySelector('.window-header');
        
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;

        const onMouseDown = (e) => {
            if (win.isMaximized) return; // Disable drag if maximized
            if (e.target.classList.contains('window-btn')) return; // Avoid drag on controls

            this.focusWindow(id);

            // Fetch absolute drag coordinates
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(win.element.style.left, 10) || 0;
            startTop = parseInt(win.element.style.top, 10) || 0;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Set boundary locks
            const left = Math.max(0, startLeft + dx);
            const top = Math.max(0, startTop + dy);

            win.element.style.left = `${left}px`;
            win.element.style.top = `${top}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', onMouseDown);
        win.element.addEventListener('mousedown', () => this.focusWindow(id));
    },

    setupWindowControls(id) {
        const win = this.windows[id];
        win.element.querySelector(`#btn-close-${id}`).addEventListener('click', () => {
            this.closeWindow(id);
        });
        win.element.querySelector(`#btn-max-${id}`).addEventListener('click', () => {
            this.maximizeWindow(id);
        });
        win.element.querySelector(`#btn-min-${id}`).addEventListener('click', () => {
            this.minimizeWindow(id);
        });
    },

    // --------------------------------------------------
    // Bottom Taskbar Tabs
    // --------------------------------------------------
    addTaskbarTab(id) {
        const win = this.windows[id];
        const tabsContainer = document.getElementById('taskbar-tabs');

        const tab = document.createElement('div');
        tab.id = `tab-${id}`;
        tab.className = 'taskbar-tab active';
        tab.innerHTML = `<span>${win.icon}</span> ${win.title}`;

        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            SoundCard.playClick();
            
            // Minimize/Focus toggle logic
            if (win.element.style.display === 'none') {
                // Restore window
                win.element.style.display = 'flex';
                this.focusWindow(id);
            } else if (this.activeWindow === id) {
                // If focused, minimize it
                this.minimizeWindow(id);
            } else {
                // Bring to front
                this.focusWindow(id);
            }
        });

        tabsContainer.appendChild(tab);
    },

    // --------------------------------------------------
    // Dialogue Modals / Error Handlers
    // --------------------------------------------------
    showErrorDialog(message, title = "System Warning") {
        SoundCard.playError();
        
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'dialog-box bevel-out';
        dialog.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span>⚠️</span> ${title}
                </div>
            </div>
            <div class="dialog-body">
                <div class="dialog-icon">⚠️</div>
                <div>${message}</div>
            </div>
            <div class="dialog-buttons">
                <button class="retro-btn bevel-out" style="width:70px;" id="dialog-ok">OK</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('dialog-ok').addEventListener('click', () => {
            SoundCard.playClick();
            overlay.remove();
        });
    },

    showWelcomeDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'dialog-box bevel-out';
        dialog.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span>ℹ️</span> Welcome
                </div>
            </div>
            <div class="dialog-body">
                <div class="dialog-icon">ℹ️</div>
                <div style="line-height: 1.5; font-size: 9px;">
                    <strong>Welcome to Windows 93!</strong><br><br>
                    This is Sam's computer interface. Here you need to look for hidden clues while also using your prior knowledge about Sam all of which will guide you to solve the questions.<br><br>
                    Please complete the quiz on the right sidebar carefully!
                </div>
            </div>
            <div class="dialog-buttons">
                <button class="retro-btn bevel-out" style="width:70px; font-size: 8px;" id="welcome-ok">OK</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('welcome-ok').addEventListener('click', () => {
            SoundCard.playClick();
            overlay.remove();
        });
    }
};

// Initialize OS when loaded
window.addEventListener('load', () => {
    SystemOS.init();
});
