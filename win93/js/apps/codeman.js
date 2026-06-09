/* --------------------------------------------------
   WINDOWS 93 CodeMan Code Editor Application
   High-Fidelity Text Editor & Script Runner
-------------------------------------------------- */

class CodeManEditor {
    constructor(windowId, initialFilePath = null) {
        this.windowId = windowId;
        this.openTabs = {}; // filePath -> { content, name, isDirty }
        this.activeTabPath = null;
        
        this.init(initialFilePath);
    }

    init(initialFilePath) {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="codeman-container">
                <!-- Sidebar File Tree -->
                <div class="codeman-sidebar">
                    <div class="codeman-sidebar-title">📁 VIRTUAL DRIVES</div>
                    <ul class="codeman-tree" id="code-tree-${this.windowId}"></ul>
                </div>
                
                <!-- Main Editor Area -->
                <div class="codeman-editor-main">
                    <!-- Tabs -->
                    <div class="codeman-tabs" id="code-tabs-${this.windowId}"></div>
                    
                    <!-- Textarea -->
                    <div class="codeman-editor-wrapper">
                        <textarea class="codeman-editor-textarea bevel-in" id="code-textarea-${this.windowId}" placeholder="// Double-click a file on the left or desktop to start coding..."></textarea>
                    </div>
                    
                    <!-- Toolbar Controls -->
                    <div class="codeman-toolbar">
                        <button class="retro-btn bevel-out" id="code-new-${this.windowId}">📄 New</button>
                        <button class="retro-btn bevel-out" id="code-save-${this.windowId}">💾 Save File</button>
                        <button class="retro-btn bevel-out" id="code-run-${this.windowId}">📟 Run Script</button>
                        <span style="flex:1;"></span>
                        <div id="code-status-${this.windowId}" style="font-size:11px; color:#555; align-self:center; margin-right:8px;">No File Open</div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.renderSidebar();

        // If launched with a specific file, open it immediately
        if (initialFilePath) {
            this.openFile(initialFilePath);
        }
    }

    bindEvents() {
        const txt = document.getElementById(`code-textarea-${this.windowId}`);
        
        // Track keyboard inputs for dirty/unsaved indicator
        txt.addEventListener('input', () => {
            if (this.activeTabPath && this.openTabs[this.activeTabPath]) {
                const tab = this.openTabs[this.activeTabPath];
                tab.content = txt.value;
                if (!tab.isDirty) {
                    tab.isDirty = true;
                    this.renderTabs();
                }
            }
        });

        // Add support for Tab indent inside textarea
        txt.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = txt.selectionStart;
                const end = txt.selectionEnd;
                txt.value = txt.value.substring(0, start) + "\t" + txt.value.substring(end);
                txt.selectionStart = txt.selectionEnd = start + 1;
            }
        });

        // Toolbar New File
        document.getElementById(`code-new-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            let name = prompt("Enter new filename to create in root /:");
            if (name) {
                name = name.trim();
                if (name.length > 0) {
                    const fullPath = name.startsWith('/') ? name : `/${name}`;
                    if (VFS.exists(fullPath)) {
                        SystemOS.showErrorDialog("A file with that name already exists!");
                        return;
                    }
                    if (VFS.writeFile(fullPath, "// Written inside CodeMan Editor\n")) {
                        this.renderSidebar();
                        this.openFile(fullPath);
                    }
                }
            }
        });

        // Toolbar Save File
        document.getElementById(`code-save-${this.windowId}`).addEventListener('click', () => {
            this.saveActiveTab();
        });

        // Toolbar Run script
        document.getElementById(`code-run-${this.windowId}`).addEventListener('click', () => {
            this.runActiveScript();
        });
    }

    // Recursively read VFS and render items in tree
    renderSidebar() {
        const treeEl = document.getElementById(`code-tree-${this.windowId}`);
        treeEl.innerHTML = '';

        const renderNode = (path, name, node, depth = 0) => {
            if (node.type === 'dir') {
                const li = document.createElement('li');
                li.style.paddingLeft = `${depth * 10 + 4}px`;
                li.innerHTML = `<span>📁</span> <b>${name}</b>`;
                treeEl.appendChild(li);
                
                // Recursively render children
                Object.keys(node.children).forEach(childName => {
                    const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
                    renderNode(childPath, childName, node.children[childName], depth + 1);
                });
            } else {
                const li = document.createElement('li');
                li.style.paddingLeft = `${depth * 10 + 4}px`;
                li.innerHTML = `<span>📄</span> ${name}`;
                li.setAttribute('data-path', path);
                
                if (this.activeTabPath === path) {
                    li.classList.add('selected');
                }

                li.addEventListener('click', () => {
                    SoundCard.playClick();
                    treeEl.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
                    li.classList.add('selected');
                });

                li.addEventListener('dblclick', () => {
                    this.openFile(path);
                });

                treeEl.appendChild(li);
            }
        };

        const root = VFS.getNode('/');
        Object.keys(root.children).forEach(name => {
            renderNode(`/${name}`, name, root.children[name], 0);
        });
    }

    openFile(filePath) {
        if (!VFS.exists(filePath)) return;
        const content = VFS.readFile(filePath);

        if (content === null) {
            SystemOS.showErrorDialog("Cannot read folder contents inside editor.");
            return;
        }

        // Add to tabs if not already open
        if (!this.openTabs[filePath]) {
            const name = filePath.split('/').pop();
            this.openTabs[filePath] = {
                content: content,
                name: name,
                isDirty: false
            };
        }

        this.activeTabPath = filePath;
        
        // Update textarea
        const txt = document.getElementById(`code-textarea-${this.windowId}`);
        txt.value = this.openTabs[filePath].content;
        txt.disabled = false;

        this.renderTabs();
        this.renderSidebar();
        this.updateStatus();
        SoundCard.playClick();
    }

    saveActiveTab() {
        if (!this.activeTabPath || !this.openTabs[this.activeTabPath]) {
            SystemOS.showErrorDialog("No active file tab open to save.");
            return;
        }

        const tab = this.openTabs[this.activeTabPath];
        const txt = document.getElementById(`code-textarea-${this.windowId}`);
        
        // Write to VFS
        if (VFS.writeFile(this.activeTabPath, txt.value)) {
            tab.content = txt.value;
            tab.isDirty = false;

            this.renderTabs();
            this.updateStatus();
            SoundCard.playChord([523.25, 659.25], 0.25, 'sine'); // Nice positive bell chord
            
            // If an active File Explorer is open, trigger it to refresh
            Object.keys(SystemOS.windows).forEach(winId => {
                if (winId.startsWith('explorer') && SystemOS.windows[winId].explorerInstance) {
                    SystemOS.windows[winId].explorerInstance.render();
                }
            });
        }
    }

    closeTab(filePath) {
        if (this.openTabs[filePath] && this.openTabs[filePath].isDirty) {
            if (!confirm(`File '${filePath}' has unsaved changes. Close anyway?`)) {
                return;
            }
        }

        delete this.openTabs[filePath];

        // Pick next active tab if current was closed
        if (this.activeTabPath === filePath) {
            const remaining = Object.keys(this.openTabs);
            if (remaining.length > 0) {
                this.openFile(remaining[remaining.length - 1]);
            } else {
                this.activeTabPath = null;
                const txt = document.getElementById(`code-textarea-${this.windowId}`);
                txt.value = '';
                txt.disabled = true;
                this.updateStatus();
            }
        }

        this.renderTabs();
        this.renderSidebar();
    }

    renderTabs() {
        const tabsEl = document.getElementById(`code-tabs-${this.windowId}`);
        tabsEl.innerHTML = '';

        Object.keys(this.openTabs).forEach(path => {
            const tab = this.openTabs[path];
            const tabEl = document.createElement('div');
            tabEl.className = 'codeman-tab';
            if (this.activeTabPath === path) {
                tabEl.classList.add('active');
            }

            const displayName = tab.isDirty ? `${tab.name}*` : tab.name;
            tabEl.innerHTML = `
                <span>📄 ${displayName}</span>
                <span class="codeman-tab-close" data-path="${path}">X</span>
            `;

            tabEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('codeman-tab-close')) return;
                this.openFile(path);
            });

            tabEl.querySelector('.codeman-tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(path);
            });

            tabsEl.appendChild(tabEl);
        });
    }

    updateStatus() {
        const statusEl = document.getElementById(`code-status-${this.windowId}`);
        if (this.activeTabPath) {
            const tab = this.openTabs[this.activeTabPath];
            statusEl.innerText = `Editing: ${this.activeTabPath} ${tab.isDirty ? '[Modified]' : ''}`;
        } else {
            statusEl.innerText = 'No File Open';
        }
    }

    runActiveScript() {
        if (!this.activeTabPath) {
            SystemOS.showErrorDialog("Please open a valid script (.js) file first!");
            return;
        }

        if (!this.activeTabPath.endsWith('.js')) {
            SystemOS.showErrorDialog("Only JavaScript (.js) scripts can be run inside this OS.");
            return;
        }

        // Save automatic check
        if (this.openTabs[this.activeTabPath].isDirty) {
            this.saveActiveTab();
        }

        const scriptContent = VFS.readFile(this.activeTabPath);
        
        // Auto launch retro terminal to execute the script!
        SystemOS.openApp('terminal', { runScript: scriptContent, scriptName: this.activeTabPath });
    }
}

// Register CodeMan Editor inside WIMP Layer
SystemOS.registerApp('codeman', (params) => {
    const win = SystemOS.createWindow('codeman', 'CodeMan IDE', '💾', 600, 420);
    
    if (!win.codemanInstance) {
        win.codemanInstance = new CodeManEditor('codeman');
    }

    // Double-clicked Explorer routing
    if (params && params.filePath) {
        win.codemanInstance.openFile(params.filePath);
    }
});
