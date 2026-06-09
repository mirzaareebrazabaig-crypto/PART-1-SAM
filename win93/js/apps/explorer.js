/* --------------------------------------------------
   WINDOWS 93 File Explorer Application
   Graphical VFS Browser (Explorer)
-------------------------------------------------- */

class FileExplorer {
    constructor(windowId, initialPath = '/') {
        this.windowId = windowId;
        this.currentPath = initialPath;
        this.selectedItem = null;
        
        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="explorer-container">
                <!-- Toolbar Actions -->
                <div class="explorer-toolbar">
                    <button class="retro-btn bevel-out" id="exp-back-${this.windowId}">⬆️ Up</button>
                    <div class="explorer-path bevel-in" id="exp-path-box-${this.windowId}">/</div>
                    <button class="retro-btn bevel-out" id="exp-newfile-${this.windowId}">📄 New File</button>
                    <button class="retro-btn bevel-out" id="exp-newdir-${this.windowId}">📁 New Folder</button>
                    <button class="retro-btn bevel-out" id="exp-delete-${this.windowId}">🗑️ Delete</button>
                </div>
                
                <!-- Main Grid area -->
                <div class="explorer-grid bevel-in" id="exp-grid-${this.windowId}"></div>
                
                <!-- Statusbar -->
                <div class="explorer-statusbar bevel-in">
                    <span id="exp-status-items-${this.windowId}">0 items</span>
                    <span id="exp-status-selected-${this.windowId}"></span>
                </div>
            </div>
        `;

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Back / Up directory
        document.getElementById(`exp-back-${this.windowId}`).addEventListener('click', () => {
            if (this.currentPath === '/') return;
            const parts = this.currentPath.split('/').filter(p => p.length > 0);
            parts.pop();
            this.currentPath = '/' + parts.join('/');
            this.selectedItem = null;
            SoundCard.playClick();
            this.render();
        });

        // New File Action
        document.getElementById(`exp-newfile-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            const name = prompt("Enter new filename (e.g. notes.txt, script.js):");
            if (name) {
                const cleaned = name.trim();
                if (cleaned.length > 0) {
                    const fullPath = this.currentPath === '/' ? `/${cleaned}` : `${this.currentPath}/${cleaned}`;
                    if (VFS.exists(fullPath)) {
                        SystemOS.showErrorDialog("A file or folder with that name already exists.");
                        return;
                    }
                    if (VFS.writeFile(fullPath, "// Type your code here...")) {
                        this.render();
                    }
                }
            }
        });

        // New Folder Action
        document.getElementById(`exp-newdir-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            const name = prompt("Enter new folder name:");
            if (name) {
                const cleaned = name.trim();
                if (cleaned.length > 0) {
                    const fullPath = this.currentPath === '/' ? `/${cleaned}` : `${this.currentPath}/${cleaned}`;
                    if (VFS.exists(fullPath)) {
                        SystemOS.showErrorDialog("A file or folder with that name already exists.");
                        return;
                    }
                    if (VFS.mkdir(fullPath)) {
                        this.render();
                    }
                }
            }
        });

        // Delete File/Folder
        document.getElementById(`exp-delete-${this.windowId}`).addEventListener('click', () => {
            if (!this.selectedItem) {
                SystemOS.showErrorDialog("No file or folder selected for deletion.");
                return;
            }
            SoundCard.playClick();
            if (confirm(`Are you sure you want to delete '${this.selectedItem}'?`)) {
                const fullPath = this.currentPath === '/' ? `/${this.selectedItem}` : `${this.currentPath}/${this.selectedItem}`;
                
                // If we are already in trash, delete permanently, else recycle
                const deletePermanently = (this.currentPath === '/trash');
                if (VFS.rm(fullPath, deletePermanently)) {
                    this.selectedItem = null;
                    this.render();
                }
            }
        });
    }

    render() {
        const grid = document.getElementById(`exp-grid-${this.windowId}`);
        const pathBox = document.getElementById(`exp-path-box-${this.windowId}`);
        const itemsStatus = document.getElementById(`exp-status-items-${this.windowId}`);
        const selectedStatus = document.getElementById(`exp-status-selected-${this.windowId}`);
        
        grid.innerHTML = '';
        pathBox.innerText = this.currentPath;

        // Fetch directory children
        const items = VFS.readdir(this.currentPath);
        itemsStatus.innerText = `${items.length} items`;
        selectedStatus.innerText = '';

        if (items.length === 0) {
            grid.innerHTML = `<div style="font-family: var(--font-mono); font-size:12px; color:#808080; padding:20px;">[Directory Empty]</div>`;
            return;
        }

        // Sort items: folders first, then files
        items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        });

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'explorer-item';
            if (this.selectedItem === item.name) {
                itemEl.classList.add('selected');
            }

            // Determine retro icon based on file type/folder
            let icon = '📄';
            if (item.type === 'dir') {
                icon = item.name === 'trash' ? '🗑️' : '📁';
            } else if (item.name.endsWith('.js')) {
                icon = '📟';
            } else if (item.name.endsWith('.conf') || item.name.endsWith('.json')) {
                icon = '⚙️';
            }

            itemEl.innerHTML = `
                <div class="explorer-item-icon">${icon}</div>
                <div class="explorer-item-name">${item.name}</div>
            `;

            // Click Handler
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundCard.playClick();
                this.selectedItem = item.name;
                
                // Re-render to show selection highlight
                this.render();
            });

            // Double Click Handler
            itemEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (item.type === 'dir') {
                    // Navigate down
                    this.currentPath = this.currentPath === '/' ? `/${item.name}` : `${this.currentPath}/${item.name}`;
                    this.selectedItem = null;
                    SoundCard.playClick();
                    this.render();
                } else {
                    // Open in CodeMan Editor
                    const fullFilePath = this.currentPath === '/' ? `/${item.name}` : `${this.currentPath}/${item.name}`;
                    SystemOS.openApp('codeman', { filePath: fullFilePath });
                }
            });

            grid.appendChild(itemEl);
        });

        // Click on grid background to deselect
        grid.addEventListener('click', () => {
            this.selectedItem = null;
            // Clear active selection borders
            grid.querySelectorAll('.explorer-item').forEach(el => el.classList.remove('selected'));
            selectedStatus.innerText = '';
        });

        if (this.selectedItem) {
            selectedStatus.innerText = `Selected: ${this.selectedItem}`;
        }
    }
}

// Register explorer app inside dynamic OS workspace
SystemOS.registerApp('explorer', (params) => {
    let initialPath = '/';
    let windowId = 'explorer';
    let title = 'My Documents';
    let icon = '📁';

    // Route parameter triggers (e.g. Recycle Bin launches explorer loaded with '/trash')
    if (params && params.path) {
        initialPath = params.path;
        windowId = `explorer-${params.path.replace('/', '')}`;
        title = params.path === '/trash' ? 'Recycle Bin' : `Documents: ${params.path}`;
        icon = params.path === '/trash' ? '🗑️' : '📁';
    }

    const win = SystemOS.createWindow(windowId, title, icon, 480, 360);
    
    // Instantiate core explorer logic
    if (!win.explorerInstance) {
        win.explorerInstance = new FileExplorer(windowId, initialPath);
    }
});

// Map Recycle Bin to launch Explorer in Trash dir
SystemOS.registerApp('recycle', () => {
    SystemOS.openApp('explorer', { path: '/trash' });
});
