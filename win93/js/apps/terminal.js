/* --------------------------------------------------
   WINDOWS 93 Retro Shell / Terminal Application
   Fully parsed command line & script runner
-------------------------------------------------- */

// Global access reference for active terminal execution hooks
let terminal = null;

class RetroTerminal {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentDir = '/'; // Current VFS directory path
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="terminal-container" id="term-container-${this.windowId}">
                <!-- Output Buffer -->
                <div class="terminal-output" id="term-output-${this.windowId}">
                    <div class="terminal-line terminal-line-success">> BI-STABLE PARADISE RETRO SHELL v1.0.3</div>
                    <div class="terminal-line">> Type 'help' to get list of active core commands.</div>
                    <br>
                </div>
                
                <!-- Input Prompt -->
                <div class="terminal-prompt-container">
                    <span class="terminal-prompt-symbol" id="term-prompt-${this.windowId}">A:\\></span>
                    <input type="text" class="terminal-input" id="term-input-${this.windowId}" autofocus autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;

        terminal = this; // Bind active reference
        this.updatePrompt();
        this.bindEvents();
    }

    bindEvents() {
        const input = document.getElementById(`term-input-${this.windowId}`);
        const container = document.getElementById(`term-container-${this.windowId}`);

        // Focus input on click anywhere inside terminal
        container.addEventListener('click', () => {
            input.focus();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';
                if (cmd.length > 0) {
                    this.executeCommand(cmd);
                }
            } else if (e.key === 'ArrowUp') {
                // Command history back
                if (this.commandHistory.length > 0) {
                    if (this.historyIndex === -1) {
                        this.historyIndex = this.commandHistory.length - 1;
                    } else if (this.historyIndex > 0) {
                        this.historyIndex--;
                    }
                    input.value = this.commandHistory[this.historyIndex];
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                // Command history forward
                if (this.historyIndex !== -1) {
                    if (this.historyIndex < this.commandHistory.length - 1) {
                        this.historyIndex++;
                        input.value = this.commandHistory[this.historyIndex];
                    } else {
                        this.historyIndex = -1;
                        input.value = '';
                    }
                }
                e.preventDefault();
            }
        });
    }

    updatePrompt() {
        const promptEl = document.getElementById(`term-prompt-${this.windowId}`);
        // Map slash separators to classic DOS look
        const dosPath = this.currentDir.replace(/\//g, '\\').toUpperCase();
        promptEl.innerText = `A:${dosPath}>`;
    }

    write(text, type = '') {
        const output = document.getElementById(`term-output-${this.windowId}`);
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (type) {
            line.className += ` terminal-line-${type}`;
        }
        line.innerText = text;
        output.appendChild(line);

        // Auto Scroll to bottom
        const container = document.getElementById(`term-container-${this.windowId}`);
        output.scrollTop = output.scrollHeight;
    }

    executeCommand(commandLine) {
        // Record history
        this.commandHistory.push(commandLine);
        this.historyIndex = -1;

        // Print command echo
        const dosPath = this.currentDir.replace(/\//g, '\\').toUpperCase();
        this.write(`A:${dosPath}> ${commandLine}`);

        const tokens = commandLine.split(' ');
        const cmd = tokens[0].toLowerCase();
        const args = tokens.slice(1);

        switch (cmd) {
            case 'help':
                this.write('=== ACTIVE CORE COMMANDS ===');
                this.write('help          - List all terminal operations');
                this.write('login         - Log in as Administrator to edit/delete files');
                this.write('ls            - List files/folders in current path');
                this.write('cd [dir]      - Change directory (handles .. / subdirectories)');
                this.write('cat [file]    - Output file contents on screen');
                this.write('touch [file]  - Create a new empty file');
                this.write('mkdir [dir]   - Create a new directory');
                this.write('rm [file]     - Delete a file/folder permanently');
                this.write('run [file]    - Run and execute a JS script file');
                this.write('js [code]     - Execute/eval a raw line of JavaScript');
                this.write('neofetch      - Output beautiful retro system statistics');
                this.write('glitch        - Trigger full screen CRT static glitch overlay');
                this.write('clear         - Clear terminal screen buffer');
                break;

            case 'clear':
                document.getElementById(`term-output-${this.windowId}`).innerHTML = '';
                break;

            case 'login':
                if (Admin.isAdmin()) {
                    this.write('[+] Already authenticated as Administrator.', 'success');
                } else {
                    if (Admin.requestAuth()) {
                        this.write('[+] Administrative write/delete access granted.', 'success');
                    } else {
                        this.write('[-] Authentication failed: Access Denied.', 'error');
                    }
                }
                break;

            case 'ls':
                const items = VFS.readdir(this.currentDir);
                if (items.length === 0) {
                    this.write('[Directory Empty]');
                } else {
                    items.forEach(item => {
                        const typeLabel = item.type === 'dir' ? '<DIR>' : '     ';
                        this.write(`${typeLabel}  ${item.name}`);
                    });
                }
                break;

            case 'cd':
                const targetDir = args[0] || '/';
                let newPath = '';

                if (targetDir === '/') {
                    newPath = '/';
                } else if (targetDir === '..') {
                    if (this.currentDir === '/') {
                        newPath = '/';
                    } else {
                        const parts = this.currentDir.split('/').filter(p => p.length > 0);
                        parts.pop();
                        newPath = '/' + parts.join('/');
                    }
                } else {
                    // Resolve relative directory
                    const relative = targetDir.startsWith('/') ? targetDir : 
                        (this.currentDir === '/' ? `/${targetDir}` : `${this.currentDir}/${targetDir}`);
                    
                    const node = VFS.getNode(relative);
                    if (node && node.type === 'dir') {
                        newPath = relative;
                    } else {
                        this.write(`Error: CD directory '${targetDir}' not found.`, 'error');
                        return;
                    }
                }

                this.currentDir = newPath;
                this.updatePrompt();
                break;

            case 'cat':
                if (args.length === 0) {
                    this.write('Error: CAT command requires a file name.', 'error');
                    break;
                }
                const catPath = args[0].startsWith('/') ? args[0] : 
                    (this.currentDir === '/' ? `/${args[0]}` : `${this.currentDir}/${args[0]}`);
                
                if (VFS.exists(catPath)) {
                    const content = VFS.readFile(catPath);
                    if (content !== null) {
                        this.write(content);
                    } else {
                        this.write('Error: Target node is a directory, not a file.', 'error');
                    }
                } else {
                    this.write(`Error: File '${args[0]}' not found.`, 'error');
                }
                break;

            case 'touch':
                if (args.length === 0) {
                    this.write('Error: TOUCH command requires a file name.', 'error');
                    break;
                }
                const touchPath = args[0].startsWith('/') ? args[0] : 
                    (this.currentDir === '/' ? `/${args[0]}` : `${this.currentDir}/${args[0]}`);
                
                if (VFS.exists(touchPath)) {
                    this.write('Error: File already exists.', 'warn');
                } else {
                    VFS.writeFile(touchPath, '// New empty file');
                    this.write(`File '${args[0]}' created.`, 'success');
                }
                break;

            case 'mkdir':
                if (args.length === 0) {
                    this.write('Error: MKDIR command requires a directory name.', 'error');
                    break;
                }
                const mkdirPath = args[0].startsWith('/') ? args[0] : 
                    (this.currentDir === '/' ? `/${args[0]}` : `${this.currentDir}/${args[0]}`);
                
                if (VFS.exists(mkdirPath)) {
                    this.write('Error: Directory already exists.', 'warn');
                } else {
                    VFS.mkdir(mkdirPath);
                    this.write(`Directory '${args[0]}' created.`, 'success');
                }
                break;

            case 'rm':
                if (args.length === 0) {
                    this.write('Error: RM command requires a file/folder name.', 'error');
                    break;
                }
                const rmPath = args[0].startsWith('/') ? args[0] : 
                    (this.currentDir === '/' ? `/${args[0]}` : `${this.currentDir}/${args[0]}`);
                
                if (VFS.exists(rmPath)) {
                    VFS.rm(rmPath, true); // Delete permanently in shell
                    this.write(`Successfully deleted '${args[0]}'.`, 'success');
                } else {
                    this.write(`Error: '${args[0]}' does not exist.`, 'error');
                }
                break;

            case 'run':
                if (args.length === 0) {
                    this.write('Error: RUN command requires a script file name.', 'error');
                    break;
                }
                const scriptPath = args[0].startsWith('/') ? args[0] : 
                    (this.currentDir === '/' ? `/${args[0]}` : `${this.currentDir}/${args[0]}`);
                
                if (VFS.exists(scriptPath)) {
                    const jsContent = VFS.readFile(scriptPath);
                    if (jsContent !== null) {
                        this.write(`[+] Loading script context: ${scriptPath}...`, 'warn');
                        this.runCode(jsContent);
                    } else {
                        this.write('Error: Cannot run a directory node.', 'error');
                    }
                } else {
                    this.write(`Error: Script '${args[0]}' not found.`, 'error');
                }
                break;

            case 'js':
                const code = args.join(' ');
                if (code.length === 0) {
                    this.write('Error: JS command requires raw script code.', 'error');
                    break;
                }
                this.runCode(code);
                break;

            case 'neofetch':
                this.write("      ..---..       OS: WINDOWS 93 replica v1.0.3");
                this.write("    .'  _  _  '.    KERNEL: BI-STABLE PARADISE v0.9");
                this.write("   /   (o)(o)   \\   UPTIME: 15 minutes, 32 seconds");
                this.write("  |      __      |  SHELL: Retro Retro-Shell v1.0");
                this.write("  |     \\__/     |  RESOLUTION: CRT Curvature Shader Grid");
                this.write("   \\            /   SOUND: WebAudio synthetic 8-bit chip");
                this.write("    '.        .'    VFS STATE: Persistent JSON LocalStorage");
                this.write("      '------'      USER CLOUD HOST: firebase-hosting-classic");
                break;

            case 'glitch':
                SoundCard.playError();
                const crt = document.querySelector('.crt-screen');
                crt.classList.add('glitch-effect');
                this.write('[!] SYSTEM OVERLOAD WARNING: DETECTED CORRUPT MATRIX INTERRUPT', 'error');
                
                setTimeout(() => {
                    crt.classList.remove('glitch-effect');
                    this.write('[+] Screen grid recalibrated. Normal service restored.', 'success');
                }, 1500);
                break;

            default:
                this.write(`Bad command or filename: '${cmd}'. Type 'help' for support.`, 'error');
                break;
        }
    }

    runCode(scriptText) {
        try {
            // Local sandbox script wrapper
            const scriptFunc = new Function('terminal', 'SoundCard', 'VFS', 'SystemOS', scriptText);
            scriptFunc(this, SoundCard, VFS, SystemOS);
        } catch (err) {
            this.write(`[-] SCRIPT EXCEPTION: ${err.message}`, 'error');
        }
    }
}

// Register terminal app inside dynamic OS workspace
SystemOS.registerApp('terminal', (params) => {
    const win = SystemOS.createWindow('terminal', 'Retro Shell', '📟', 500, 360);
    
    if (!win.terminalInstance) {
        win.terminalInstance = new RetroTerminal('terminal');
    }

    // Auto-running script routing from CodeMan IDE
    if (params && params.runScript) {
        win.terminalInstance.write(`>> EXECUTING SCRIPT FROM CODEMAN IDE: [${params.scriptName}]`, 'warn');
        win.terminalInstance.runCode(params.runScript);
    }
});
