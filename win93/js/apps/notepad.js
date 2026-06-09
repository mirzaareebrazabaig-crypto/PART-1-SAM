/* --------------------------------------------------
   WINDOWS 93 Notepad Application
   High-Fidelity Text Editor & Personal Journal Archive
   with Persistent Storage, Search, and Trash
-------------------------------------------------- */

class NotepadApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.notes = [];
        this.activeFolder = 'Diary'; // Folder name or special values: 'Favorites', 'Trash'
        this.activeNoteId = null;
        this.searchQuery = '';
        this.recentlyOpened = []; // Max 5 note IDs
        this.saveTimeout = null;

        // Folder list (excluding special system folders like Favorites/Trash)
        this.folders = [
            'Diary',
            'School',
            'College Plans',
            'Photography',
            'Random Thoughts',
            'To-Do Lists',
            'Draft Stories'
        ];

        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="notepad-container">
                <!-- Sidebar Layout (Left Pane) -->
                <aside class="notepad-sidebar">
                    <!-- Search Box -->
                    <div class="notepad-search-group">
                        <input type="text" class="notepad-search-input bevel-in" id="notepad-search-${this.windowId}" placeholder="Search notes..." value="${this.searchQuery}">
                    </div>

                    <!-- Folders List -->
                    <div class="notepad-sidebar-header">Folders</div>
                    <ul class="notepad-sidebar-list" id="notepad-folders-${this.windowId}">
                        <!-- Populated dynamically -->
                    </ul>

                    <div class="notepad-sidebar-divider"></div>

                    <!-- Special System Folders -->
                    <ul class="notepad-sidebar-list">
                        <li class="notepad-sidebar-item" id="notepad-favs-link-${this.windowId}" data-folder="Favorites">
                            <span class="notepad-sidebar-icon">⭐</span>
                            <span class="notepad-sidebar-name">Favorites</span>
                            <span class="notepad-badge" id="notepad-badge-favs-${this.windowId}">0</span>
                        </li>
                        <li class="notepad-sidebar-item" id="notepad-trash-link-${this.windowId}" data-folder="Trash">
                            <span class="notepad-sidebar-icon">🗑️</span>
                            <span class="notepad-sidebar-name">Trash</span>
                            <span class="notepad-badge" id="notepad-badge-trash-${this.windowId}">0</span>
                        </li>
                    </ul>

                    <div class="notepad-sidebar-divider"></div>

                    <!-- Recently Opened -->
                    <div class="notepad-sidebar-header">Recently Opened</div>
                    <ul class="notepad-sidebar-list" id="notepad-recent-${this.windowId}">
                        <!-- Populated dynamically -->
                    </ul>
                </aside>

                <!-- Note List Panel (Middle Pane) -->
                <section class="notepad-list-panel">
                    <div class="notepad-list-header">
                        <span id="notepad-list-title-${this.windowId}">Notes</span>
                        <button class="retro-btn bevel-out notepad-new-btn" id="notepad-new-btn-${this.windowId}">+ New Note</button>
                    </div>
                    <ul class="notepad-notes-list" id="notepad-notes-list-${this.windowId}">
                        <!-- Populated dynamically -->
                    </ul>
                </section>

                <!-- Editor Panel (Right Pane) -->
                <main class="notepad-editor-panel">
                    <!-- Editor Actions Toolbar -->
                    <div class="notepad-toolbar" id="notepad-toolbar-${this.windowId}">
                        <!-- Filled dynamically -->
                    </div>

                    <!-- Warning Header for Deleted Notes -->
                    <div class="notepad-warning-bar hidden" id="notepad-warning-${this.windowId}">
                        ⚠️ This note is in the Trash. Restore it to make changes.
                    </div>

                    <!-- Note Title Area -->
                    <div class="notepad-editor-header">
                        <input type="text" class="notepad-title-input bevel-in" id="notepad-title-${this.windowId}" placeholder="Untitled Note" disabled>
                        <div class="notepad-note-details" id="notepad-details-${this.windowId}">No note selected</div>
                    </div>

                    <!-- Main Textarea Editor -->
                    <div class="notepad-textarea-wrapper">
                        <textarea class="notepad-body-textarea bevel-in" id="notepad-body-${this.windowId}" placeholder="Click a note or click '+ New Note' to start typing..." disabled></textarea>
                    </div>

                    <!-- Status Bar -->
                    <footer class="notepad-statusbar">
                        <span id="notepad-save-status-${this.windowId}">All changes saved</span>
                        <span id="notepad-word-count-${this.windowId}">0 words | 0 chars</span>
                    </footer>
                </main>
            </div>
        `;

        this.loadNotes();
        this.bindEvents();
    }

    async loadNotes() {
        // Safe read from LocalStorage
        let cached = null;
        try {
            cached = localStorage.getItem('win93_notepad_db_v1');
        } catch (e) {
            console.warn("Could not read notepad db from localStorage:", e);
        }

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    this.notes = parsed;
                    this.loadRecentList();
                    this.selectDefaultNote();
                    this.renderAll();
                    return;
                }
            } catch (e) {
                console.warn("Could not parse cached notes database, reloading from json...", e);
            }
        }

        // Fetch from server seed JSON
        try {
            const res = await fetch('data/notes.json?v=' + Date.now());
            if (res.ok) {
                const parsed = await res.json();
                if (Array.isArray(parsed)) {
                    this.notes = parsed;
                    this.saveToCache();
                } else {
                    console.error("Fetched notes.json is not an array!");
                    this.notes = [];
                }
            } else {
                console.error("Failed to fetch data/notes.json, status:", res.status);
            }
        } catch (e) {
            console.error("Could not fetch data/notes.json", e);
        }

        this.loadRecentList();
        this.selectDefaultNote();
        this.renderAll();
    }

    saveToCache() {
        try {
            localStorage.setItem('win93_notepad_db_v1', JSON.stringify(this.notes));
        } catch (e) {
            console.warn("Could not write notepad db to localStorage:", e);
        }
    }

    loadRecentList() {
        try {
            const recent = localStorage.getItem('win93_notepad_recent');
            if (recent) {
                this.recentlyOpened = JSON.parse(recent);
            }
        } catch (e) {
            console.warn("Could not load recently opened list:", e);
        }
    }

    saveRecentList() {
        try {
            localStorage.setItem('win93_notepad_recent', JSON.stringify(this.recentlyOpened));
        } catch (e) {
            console.warn("Could not save recently opened list:", e);
        }
    }

    selectDefaultNote() {
        // Select the first non-deleted note in the active folder
        const active = this.getActiveNotesList();
        if (active.length > 0) {
            this.activeNoteId = active[0].id;
        } else {
            this.activeNoteId = null;
        }
    }

    getActiveNotesList() {
        let list = this.notes;

        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            return list.filter(note => 
                (note.title || '').toLowerCase().includes(query) ||
                (note.body || '').toLowerCase().includes(query) ||
                (note.folder || '').toLowerCase().includes(query) ||
                (note.date || '').toLowerCase().includes(query)
            );
        }

        if (this.activeFolder === 'Favorites') {
            return list.filter(note => note.favorite && !note.deleted);
        } else if (this.activeFolder === 'Trash') {
            return list.filter(note => note.deleted);
        } else {
            return list.filter(note => note.folder === this.activeFolder && !note.deleted);
        }
    }

    bindEvents() {
        // New Note Button
        document.getElementById(`notepad-new-btn-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.createNewNote();
        });

        // Search Bar Keydowns/Inputs
        const searchInput = document.getElementById(`notepad-search-${this.windowId}`);
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.selectDefaultNote();
            this.renderAll();
        });

        // Title and Body Editors (for auto-saving)
        const titleInput = document.getElementById(`notepad-title-${this.windowId}`);
        const bodyTextarea = document.getElementById(`notepad-body-${this.windowId}`);

        const handleInput = () => {
            const activeNote = this.notes.find(n => n.id === this.activeNoteId);
            if (!activeNote || activeNote.deleted) return;

            activeNote.title = titleInput.value.trim() || 'Untitled Note';
            activeNote.body = bodyTextarea.value;
            activeNote.timestamp = Math.floor(Date.now() / 1000);

            // Update word count immediately
            this.updateCounts(activeNote.body);

            // Simulation of Auto-saving status bar
            const statusEl = document.getElementById(`notepad-save-status-${this.windowId}`);
            statusEl.innerText = 'Auto-saving...';

            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveToCache();
                statusEl.innerText = 'All changes saved';
                
                // Re-render notes lists to update active titles, but preserve cursor/focus
                this.renderFoldersSidebar();
                this.renderNotesList(false); // Do not reset active selection
                this.renderRecentSidebar();
            }, 600);
        };

        titleInput.addEventListener('input', handleInput);
        bodyTextarea.addEventListener('input', handleInput);
    }

    renderAll() {
        this.renderFoldersSidebar();
        this.renderRecentSidebar();
        this.renderNotesList(true);
        this.renderEditor();
    }

    renderFoldersSidebar() {
        const foldersContainer = document.getElementById(`notepad-folders-${this.windowId}`);
        
        // Count active notes in folders
        const counts = {};
        this.folders.forEach(f => {
            counts[f] = this.notes.filter(n => n.folder === f && !n.deleted).length;
        });

        const favsCount = this.notes.filter(n => n.favorite && !n.deleted).length;
        const trashCount = this.notes.filter(n => n.deleted).length;

        // Render standard folders
        foldersContainer.innerHTML = this.folders.map(f => {
            const activeClass = (this.activeFolder === f && !this.searchQuery) ? 'active' : '';
            const countBadge = counts[f] > 0 ? `<span class="notepad-badge">${counts[f]}</span>` : '';
            return `
                <li class="notepad-sidebar-item ${activeClass}" data-folder="${f}">
                    <span class="notepad-sidebar-icon">📁</span>
                    <span class="notepad-sidebar-name">${f}</span>
                    ${countBadge}
                </li>
            `;
        }).join('');

        // Bind clicks on standard folders
        foldersContainer.querySelectorAll('.notepad-sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                SoundCard.playClick();
                this.activeFolder = item.getAttribute('data-folder');
                this.searchQuery = '';
                document.getElementById(`notepad-search-${this.windowId}`).value = '';
                this.selectDefaultNote();
                this.renderAll();
            });
        });

        // Set active state and counts for system folders
        const favsLink = document.getElementById(`notepad-favs-link-${this.windowId}`);
        const trashLink = document.getElementById(`notepad-trash-link-${this.windowId}`);
        
        favsLink.className = `notepad-sidebar-item ${this.activeFolder === 'Favorites' && !this.searchQuery ? 'active' : ''}`;
        trashLink.className = `notepad-sidebar-item ${this.activeFolder === 'Trash' && !this.searchQuery ? 'active' : ''}`;

        document.getElementById(`notepad-badge-favs-${this.windowId}`).innerText = favsCount;
        document.getElementById(`notepad-badge-trash-${this.windowId}`).innerText = trashCount;

        // Bind clicks on system folders
        const clickHandler = (folderName) => {
            SoundCard.playClick();
            this.activeFolder = folderName;
            this.searchQuery = '';
            document.getElementById(`notepad-search-${this.windowId}`).value = '';
            this.selectDefaultNote();
            this.renderAll();
        };

        // Rebind (remove old listeners by replacing elements or just assigning onclick)
        favsLink.onclick = () => clickHandler('Favorites');
        trashLink.onclick = () => clickHandler('Trash');
    }

    renderRecentSidebar() {
        const recentContainer = document.getElementById(`notepad-recent-${this.windowId}`);
        
        if (this.recentlyOpened.length === 0) {
            recentContainer.innerHTML = `<li class="notepad-sidebar-empty">No recently opened notes</li>`;
            return;
        }

        // Get notes objects matching recent array
        const recentNotes = this.recentlyOpened
            .map(id => this.notes.find(n => n.id === id))
            .filter(n => n !== undefined);

        recentContainer.innerHTML = recentNotes.map(n => {
            const activeClass = (this.activeNoteId === n.id) ? 'active' : '';
            return `
                <li class="notepad-sidebar-item recent-item ${activeClass}" data-id="${n.id}">
                    <span class="notepad-sidebar-icon">📄</span>
                    <span class="notepad-sidebar-name" title="${n.title}">${n.title}</span>
                </li>
            `;
        }).join('');

        recentContainer.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', () => {
                SoundCard.playClick();
                const noteId = item.getAttribute('data-id');
                const note = this.notes.find(n => n.id === noteId);
                if (note) {
                    this.activeFolder = note.deleted ? 'Trash' : (note.favorite ? 'Favorites' : note.folder);
                    this.searchQuery = '';
                    document.getElementById(`notepad-search-${this.windowId}`).value = '';
                    this.activeNoteId = noteId;
                    this.renderAll();
                }
            });
        });
    }

    renderNotesList(resetScroll = true) {
        const listContainer = document.getElementById(`notepad-notes-list-${this.windowId}`);
        const listTitle = document.getElementById(`notepad-list-title-${this.windowId}`);
        
        if (this.searchQuery.trim()) {
            listTitle.innerText = `Search Results (${this.getActiveNotesList().length})`;
        } else {
            listTitle.innerText = this.activeFolder;
        }

        const activeNotes = this.getActiveNotesList();

        if (activeNotes.length === 0) {
            listContainer.innerHTML = `
                <div class="notepad-list-empty">
                    <span style="font-size: 24px; display: block; margin-bottom: 6px;">📄</span>
                    No notes found.
                </div>
            `;
            return;
        }

        // Sort notes chronologically (newest first based on timestamp)
        activeNotes.sort((a, b) => b.timestamp - a.timestamp);

        listContainer.innerHTML = activeNotes.map(n => {
            const activeClass = (this.activeNoteId === n.id) ? 'active' : '';
            const fadedClass = n.deleted ? 'faded' : '';
            const starBadge = n.favorite ? '⭐' : '';
            
            // Format a simple preview of the body text
            const cleanBody = (n.body || '').replace(/[\n\r]+/g, ' ');
            const preview = cleanBody.substring(0, 35) + (cleanBody.length > 35 ? '...' : '');

            return `
                <li class="notepad-note-row ${activeClass} ${fadedClass}" data-id="${n.id}">
                    <div class="notepad-note-row-title">
                        <span class="note-title-text">${n.title}</span>
                        <span class="note-title-star">${starBadge}</span>
                    </div>
                    <div class="notepad-note-row-preview">${preview}</div>
                    <div class="notepad-note-row-meta">${n.date}</div>
                </li>
            `;
        }).join('');

        listContainer.querySelectorAll('.notepad-note-row').forEach(row => {
            row.addEventListener('click', () => {
                SoundCard.playClick();
                const noteId = row.getAttribute('data-id');
                this.activeNoteId = noteId;
                
                // Add to recently opened list
                this.addToRecent(noteId);
                
                this.renderRecentSidebar();
                this.renderNotesList(false); // Do not reset scroll on item toggle
                this.renderEditor();
            });
        });
        
        if (resetScroll) {
            listContainer.scrollTop = 0;
        }
    }

    addToRecent(noteId) {
        // Remove existing from list
        this.recentlyOpened = this.recentlyOpened.filter(id => id !== noteId);
        // Prepend to front
        this.recentlyOpened.unshift(noteId);
        // Cap size at 5
        if (this.recentlyOpened.length > 5) {
            this.recentlyOpened.pop();
        }
        this.saveRecentList();
    }

    renderEditor() {
        const toolbar = document.getElementById(`notepad-toolbar-${this.windowId}`);
        const warningBar = document.getElementById(`notepad-warning-${this.windowId}`);
        const titleInput = document.getElementById(`notepad-title-${this.windowId}`);
        const bodyTextarea = document.getElementById(`notepad-body-${this.windowId}`);
        const detailsEl = document.getElementById(`notepad-details-${this.windowId}`);

        const activeNote = this.notes.find(n => n.id === this.activeNoteId);

        if (!activeNote) {
            // Empty State editor
            toolbar.innerHTML = '';
            warningBar.classList.add('hidden');
            titleInput.value = '';
            titleInput.disabled = true;
            bodyTextarea.value = '';
            bodyTextarea.disabled = true;
            detailsEl.innerText = 'No note selected';
            this.updateCounts('');
            return;
        }

        // Render Toolbar actions based on deleted status
        if (activeNote.deleted) {
            toolbar.innerHTML = `
                <button class="retro-btn bevel-out action-btn" id="notepad-restore-${this.windowId}">♻️ Restore Note</button>
                <button class="retro-btn bevel-out action-btn danger" id="notepad-purge-${this.windowId}">🗑️ Delete Permanently</button>
            `;
            warningBar.classList.remove('hidden');
            titleInput.disabled = true;
            bodyTextarea.disabled = true;

            // Bind restore/purge events
            document.getElementById(`notepad-restore-${this.windowId}`).onclick = () => {
                SoundCard.playClick();
                this.restoreNote(activeNote.id);
            };
            document.getElementById(`notepad-purge-${this.windowId}`).onclick = () => {
                SoundCard.playClick();
                this.purgeNote(activeNote.id);
            };
        } else {
            // Normal toolbar
            const starLabel = activeNote.favorite ? '⭐ Favorited' : '☆ Favorite';
            toolbar.innerHTML = `
                <button class="retro-btn bevel-out action-btn" id="notepad-fav-btn-${this.windowId}">${starLabel}</button>
                <button class="retro-btn bevel-out action-btn" id="notepad-del-btn-${this.windowId}">🗑️ Trash</button>
                <div class="notepad-folder-selector-container">
                    <label style="font-size: 11px; margin-right: 6px;">Folder:</label>
                    <select class="notepad-folder-select bevel-in" id="notepad-folder-select-${this.windowId}">
                        ${this.folders.map(f => `<option value="${f}" ${activeNote.folder === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
            `;
            warningBar.classList.add('hidden');
            titleInput.disabled = false;
            bodyTextarea.disabled = false;

            // Bind Normal Toolbar Actions
            document.getElementById(`notepad-fav-btn-${this.windowId}`).onclick = () => {
                SoundCard.playClick();
                activeNote.favorite = !activeNote.favorite;
                this.saveToCache();
                this.renderAll();
            };

            document.getElementById(`notepad-del-btn-${this.windowId}`).onclick = () => {
                SoundCard.playClick();
                this.moveNoteToTrash(activeNote.id);
            };

            // Folder change event listener
            document.getElementById(`notepad-folder-select-${this.windowId}`).onchange = (e) => {
                SoundCard.playClick();
                activeNote.folder = e.target.value;
                this.saveToCache();
                this.renderAll();
            };
        }

        // Fill in content
        titleInput.value = activeNote.title;
        bodyTextarea.value = activeNote.body;

        // Details line
        let details = `Folder: ${activeNote.folder} | Created: ${activeNote.date}`;
        if (activeNote.deleted) {
            details += ` | Deleted: ${activeNote.dateDeleted || 'Recently'}`;
        }
        detailsEl.innerText = details;

        // Update word count
        this.updateCounts(activeNote.body);
    }

    updateCounts(text) {
        const charCount = (text || '').length;
        const words = (text || '').trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        document.getElementById(`notepad-word-count-${this.windowId}`).innerText = `${wordCount} words | ${charCount} chars`;
    }

    createNewNote() {
        const newId = 'note_' + Date.now();
        const todayStr = this.getTodayDateString();
        
        // Choose folder to drop note in (avoid placing in Favorites/Trash filters)
        let destinationFolder = this.activeFolder;
        if (destinationFolder === 'Favorites' || destinationFolder === 'Trash') {
            destinationFolder = 'Diary';
        }

        const newNote = {
            id: newId,
            title: 'Untitled Note',
            folder: destinationFolder,
            date: todayStr,
            timestamp: Math.floor(Date.now() / 1000),
            body: '',
            favorite: false,
            deleted: false,
            dateDeleted: null
        };

        this.notes.unshift(newNote);
        this.activeNoteId = newId;
        this.saveToCache();
        
        // Add to recently opened
        this.addToRecent(newId);

        this.renderAll();

        // Focus and select the title input immediately
        setTimeout(() => {
            const titleInput = document.getElementById(`notepad-title-${this.windowId}`);
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 50);
    }

    moveNoteToTrash(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.deleted = true;
            note.dateDeleted = this.getTodayDateString();
            this.saveToCache();
        }
        this.selectDefaultNote();
        this.renderAll();
    }

    restoreNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.deleted = false;
            note.dateDeleted = null;
            this.saveToCache();
        }
        this.selectDefaultNote();
        this.renderAll();
    }

    purgeNote(noteId) {
        if (confirm("Are you sure you want to permanently delete this note? This cannot be undone.")) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.recentlyOpened = this.recentlyOpened.filter(id => id !== noteId);
            this.saveToCache();
            this.saveRecentList();
            this.selectDefaultNote();
            this.renderAll();
        }
    }

    getTodayDateString() {
        const date = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    }
}

// Inject Notepad Application Styles Dynamically
if (!document.getElementById('notepad-app-styles')) {
    const style = document.createElement('style');
    style.id = 'notepad-app-styles';
    style.innerHTML = `
        .notepad-container {
            display: flex;
            width: 100%;
            height: 100%;
            background-color: #f0f0f0;
            color: #000000;
            font-family: Arial, Helvetica, sans-serif;
            overflow: hidden;
        }

        /* Sidebar Design (Left Pane) */
        .notepad-sidebar {
            width: 170px;
            background-color: #e4e4e4;
            border-right: 2px solid #ffffff;
            box-shadow: inset -1px 0 0 #808080;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding: 8px 0;
            overflow-y: auto;
        }
        .notepad-search-group {
            padding: 0 8px 8px;
        }
        .notepad-search-input {
            width: 100%;
            height: 22px;
            background-color: #ffffff;
            outline: none;
            padding: 2px 6px;
            font-size: 11px;
            font-family: var(--font-ui);
        }
        .notepad-sidebar-header {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            color: #737373;
            padding: 6px 12px 2px;
            font-family: var(--font-ui);
        }
        .notepad-sidebar-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .notepad-sidebar-item {
            display: flex;
            align-items: center;
            padding: 4px 12px;
            cursor: pointer;
            font-size: 11px;
            color: #222222;
            gap: 6px;
            user-select: none;
        }
        .notepad-sidebar-item:hover {
            background-color: #dfdfdf;
        }
        .notepad-sidebar-item.active {
            background-color: #000080;
            color: #ffffff;
        }
        .notepad-sidebar-item.active .notepad-badge {
            background-color: #ffffff;
            color: #000080;
        }
        .notepad-sidebar-icon {
            font-size: 12px;
            width: 14px;
            text-align: center;
        }
        .notepad-sidebar-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .notepad-badge {
            font-size: 9px;
            background-color: #808080;
            color: #ffffff;
            padding: 1px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-family: var(--font-ui);
        }
        .notepad-sidebar-divider {
            height: 2px;
            background-color: #808080;
            border-bottom: 1px solid #ffffff;
            margin: 8px 4px;
        }
        .notepad-sidebar-empty {
            font-size: 10px;
            color: #808080;
            padding: 4px 12px;
            font-style: italic;
        }

        /* Note list panel (Middle Pane) */
        .notepad-list-panel {
            width: 180px;
            background-color: #e4e4e4;
            border-right: 2px solid #ffffff;
            box-shadow: inset -1px 0 0 #808080;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            overflow: hidden;
        }
        .notepad-list-header {
            height: 28px;
            border-bottom: 2px solid #808080;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            background-color: #d8d8d8;
            font-size: 11px;
            font-weight: bold;
            font-family: var(--font-ui);
        }
        .notepad-new-btn {
            padding: 2px 6px;
            font-size: 9px;
            height: 18px;
            cursor: pointer;
        }
        .notepad-notes-list {
            list-style: none;
            padding: 0;
            margin: 0;
            flex: 1;
            overflow-y: auto;
            background-color: #ffffff;
            box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
        }
        .notepad-list-empty {
            text-align: center;
            padding: 30px 10px;
            font-size: 11px;
            color: #808080;
        }
        .notepad-note-row {
            padding: 6px 8px;
            border-bottom: 1px solid #dfdfdf;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 2px;
            user-select: none;
        }
        .notepad-note-row:hover {
            background-color: #f5f5f5;
        }
        .notepad-note-row.active {
            background-color: #000080;
            color: #ffffff;
        }
        .notepad-note-row.active .notepad-note-row-preview,
        .notepad-note-row.active .notepad-note-row-meta {
            color: #dcdcdc;
        }
        .notepad-note-row.faded {
            opacity: 0.6;
        }
        .notepad-note-row-title {
            font-size: 11px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .note-title-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
        .note-title-star {
            font-size: 9px;
            margin-left: 4px;
        }
        .notepad-note-row-preview {
            font-size: 10px;
            color: #666666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .notepad-note-row-meta {
            font-size: 9px;
            color: #888888;
            text-align: right;
        }

        /* Editor Panel (Right Pane) */
        .notepad-editor-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: #f0f0f0;
            overflow: hidden;
        }
        .notepad-toolbar {
            height: 28px;
            border-bottom: 2px solid #808080;
            display: flex;
            align-items: center;
            padding: 4px 8px;
            background-color: #d8d8d8;
            gap: 6px;
            flex-shrink: 0;
        }
        .action-btn {
            padding: 2px 8px;
            font-size: 10px;
            height: 20px;
            cursor: pointer;
        }
        .action-btn.danger:hover {
            background-color: #ffcdd2;
            color: #c62828;
        }
        .notepad-folder-selector-container {
            display: flex;
            align-items: center;
            margin-left: auto;
        }
        .notepad-folder-select {
            height: 22px;
            font-size: 10px;
            padding: 1px 2px;
            outline: none;
            background: #ffffff;
        }
        .notepad-warning-bar {
            background-color: #fff9c4;
            border-bottom: 1px solid #fbc02d;
            color: #f57f17;
            font-size: 10px;
            padding: 4px 10px;
            flex-shrink: 0;
            font-weight: bold;
        }
        .notepad-warning-bar.hidden {
            display: none;
        }
        .notepad-editor-header {
            padding: 8px 12px;
            border-bottom: 1px solid #cccccc;
            background-color: #f7f7f7;
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex-shrink: 0;
        }
        .notepad-title-input {
            width: 100%;
            outline: none;
            font-size: 13px;
            font-weight: bold;
            padding: 4px 8px;
            background-color: #ffffff;
            font-family: inherit;
        }
        .notepad-title-input:disabled {
            background-color: #e4e4e4;
            color: #555555;
        }
        .notepad-note-details {
            font-size: 9px;
            color: #666666;
            padding-left: 2px;
            font-family: var(--font-ui);
        }
        .notepad-textarea-wrapper {
            flex: 1;
            padding: 8px 12px;
            background-color: #f0f0f0;
            overflow: hidden;
        }
        .notepad-body-textarea {
            width: 100%;
            height: 100%;
            outline: none;
            resize: none;
            padding: 8px;
            background-color: #ffffff;
            font-family: "Courier New", Courier, monospace;
            font-size: 12px;
            line-height: 1.5;
            color: #333333;
            overflow-y: auto;
        }
        .notepad-body-textarea:disabled {
            background-color: #e4e4e4;
            color: #555555;
        }

        /* Status Bar */
        .notepad-statusbar {
            height: 18px;
            border-top: 2px solid #ffffff;
            box-shadow: 0 -1px 0 #808080;
            background-color: #d8d8d8;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            font-size: 9px;
            color: #444444;
            font-family: var(--font-ui);
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}

// Register Notepad Application in WIMP Layer
SystemOS.registerApp('notepad', () => {
    const win = SystemOS.createWindow('notepad', 'Notepad', '📝', 760, 520, {
        onClose: () => {
            // Clean state if needed
        }
    });

    if (!win.notepadInstance) {
        win.notepadInstance = new NotepadApp('notepad');
    }
});
