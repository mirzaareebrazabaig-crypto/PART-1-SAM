/* --------------------------------------------------
   WINDOWS 93 Gmail 2014–2015 Application
   High-Fidelity Email Client with Persistent Database & Threads
-------------------------------------------------- */

class GmailApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.emails = [];
        this.activeFolder = 'inbox'; // System folders or custom label IDs
        this.activeThreadId = null;  // If reading an email, this holds the thread ID
        this.searchQuery = '';
        this.selectedEmailIds = new Set();
        this.composeState = null;    // null or { to, subject, body }

        // Sidebar folders configuration
        this.folders = [
            { id: 'inbox', name: 'Inbox', icon: '📥', isSystem: true },
            { id: 'starred', name: 'Starred', icon: '⭐', isSystem: true },
            { id: 'important', name: 'Important', icon: '🏷️', isSystem: true },
            { id: 'sent', name: 'Sent Mail', icon: '📤', isSystem: true },
            { id: 'drafts', name: 'Drafts', icon: '📝', isSystem: true },
            { id: 'spam', name: 'Spam', icon: '⚠️', isSystem: true },
            { id: 'trash', name: 'Trash', icon: '🗑️', isSystem: true }
        ];

        this.labels = [
            { id: 'college_applications', name: 'College Applications', color: '#4285f4', icon: '🎓' },
            { id: 'study_abroad', name: 'Study Abroad', color: '#0f9d58', icon: '🌍' },
            { id: 'courses_learning', name: 'Courses & Learning', color: '#db4437', icon: '📚' },
            { id: 'exams', name: 'Exams', color: '#f4b400', icon: '📝' },
            { id: 'subscriptions', name: 'Subscriptions', color: '#ab47bc', icon: '🔔' },
            { id: 'photography', name: 'Photography', color: '#00acc1', icon: '📷' },
            { id: 'travel', name: 'Travel', color: '#ff7043', icon: '✈️' }
        ];

        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="gmail-container">
                <!-- Top Header Bar -->
                <header class="gmail-header">
                    <div class="gmail-logo-group">
                        <span class="gmail-logo-env">✉️</span>
                        <span class="gmail-logo-text">Gmail</span>
                    </div>
                    
                    <div class="gmail-search-box">
                        <input type="text" class="gmail-search-input" id="gmail-search-${this.windowId}" placeholder="Search mail..." value="${this.searchQuery}">
                        <button class="gmail-search-btn" id="gmail-search-btn-${this.windowId}">🔍</button>
                    </div>
                    
                    <div class="gmail-profile-group">
                        <span class="gmail-profile-email">samrudh.sharma2012@gmail.com</span>
                        <div class="gmail-avatar" title="Sam (samrudh.sharma2012@gmail.com)">S</div>
                    </div>
                </header>
                
                <!-- Main Workspace Grid -->
                <div class="gmail-body">
                    <!-- Left Sidebar -->
                    <aside class="gmail-sidebar">
                        <button class="gmail-compose-btn" id="gmail-compose-btn-${this.windowId}">COMPOSE</button>
                        
                        <!-- System Folders List -->
                        <ul class="gmail-folder-list" id="gmail-folders-${this.windowId}">
                            <!-- Populated dynamically -->
                        </ul>
                        
                        <div class="gmail-sidebar-divider"></div>
                        
                        <!-- Custom Labels List -->
                        <div class="gmail-sidebar-header">Categories</div>
                        <ul class="gmail-folder-list" id="gmail-labels-${this.windowId}">
                            <!-- Populated dynamically -->
                        </ul>
                    </aside>
                    
                    <!-- Right Content Area -->
                    <main class="gmail-content">
                        <!-- Action Utility Bar -->
                        <div class="gmail-action-bar" id="gmail-actions-${this.windowId}">
                            <!-- Populated dynamically based on list or reading view -->
                        </div>
                        
                        <!-- Mail list or Mail reader container -->
                        <div class="gmail-view-pane" id="gmail-view-pane-${this.windowId}">
                            <div class="gmail-loading">Loading email database...</div>
                        </div>
                    </main>
                </div>
                
                <!-- Floating Compose Box -->
                <div class="gmail-compose-popup hidden" id="gmail-compose-popup-${this.windowId}">
                    <!-- Filled dynamically -->
                </div>
            </div>
        `;

        this.loadEmails();
        this.bindEvents();
    }

    async loadEmails() {
        let cached = null;
        try {
            cached = localStorage.getItem('win93_gmail_db_v8');
        } catch (e) {
            console.warn("Could not read from localStorage:", e);
        }

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    this.emails = parsed;
                    this.renderAll();
                    return;
                }
            } catch (e) {
                console.warn("Could not parse cached Gmail database, reloading from VFS...", e);
            }
        }

        try {
            const res = await fetch('data/gmail.json?v=' + Date.now());
            if (res.ok) {
                const parsed = await res.json();
                if (Array.isArray(parsed)) {
                    this.emails = parsed;
                    this.saveToCache();
                } else {
                    console.error("Fetched data/gmail.json is not an array!");
                    this.emails = [];
                }
            } else {
                console.error("Failed to fetch data/gmail.json status code:", res.status);
            }
        } catch (e) {
            console.error("Could not fetch data/gmail.json", e);
        }

        this.renderAll();
    }

    saveToCache() {
        try {
            localStorage.setItem('win93_gmail_db_v8', JSON.stringify(this.emails));
        } catch (e) {
            console.warn("Could not write to localStorage:", e);
        }
    }

    bindEvents() {
        // Compose Button Click
        document.getElementById(`gmail-compose-btn-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.openComposer();
        });

        // Search Handlers
        const searchInput = document.getElementById(`gmail-search-${this.windowId}`);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.searchQuery = searchInput.value;
                this.activeThreadId = null; // Close active reader
                this.renderAll();
            }
        });

        document.getElementById(`gmail-search-btn-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.searchQuery = searchInput.value;
            this.activeThreadId = null;
            this.renderAll();
        });
    }

    renderAll() {
        this.renderSidebar();
        this.renderActionBar();
        if (this.activeThreadId) {
            this.renderEmailReader();
        } else {
            this.renderEmailList();
        }
    }

    // Unread and total count queries for sidebar badges
    getUnreadCount(folderId) {
        return this.emails.filter(mail => {
            const labels = mail.labels || [];
            const isSpam = labels.includes('spam');
            const isTrash = labels.includes('trash');

            if (folderId === 'inbox') return labels.includes('inbox') && !isSpam && !isTrash && mail.unread;
            if (folderId === 'starred') return mail.starred && !isTrash && mail.unread;
            if (folderId === 'important') return mail.important && !isSpam && !isTrash && mail.unread;
            if (folderId === 'sent') return false; // Sent folder does not show unread
            if (folderId === 'drafts') return false; // Drafts folder shows TOTAL count, not unread!
            if (folderId === 'spam') return labels.includes('spam') && !isTrash && mail.unread;
            if (folderId === 'trash') return false;

            // Custom category labels
            return labels.includes(folderId) && !isSpam && !isTrash && mail.unread;
        }).length;
    }

    getDraftsCount() {
        return this.emails.filter(mail => (mail.labels || []).includes('drafts') && !(mail.labels || []).includes('trash')).length;
    }

    renderSidebar() {
        const foldersContainer = document.getElementById(`gmail-folders-${this.windowId}`);
        const labelsContainer = document.getElementById(`gmail-labels-${this.windowId}`);
        
        // Render System Folders
        foldersContainer.innerHTML = this.folders.map(f => {
            const activeClass = (this.activeFolder === f.id && !this.activeThreadId) ? 'active' : '';
            
            let badge = '';
            if (f.id === 'drafts') {
                const count = this.getDraftsCount();
                if (count > 0) badge = `<span class="gmail-badge drafts-badge">${count}</span>`;
            } else {
                const count = this.getUnreadCount(f.id);
                if (count > 0) badge = `<span class="gmail-badge unread-badge">${count}</span>`;
            }

            return `
                <li class="gmail-sidebar-item ${activeClass}" data-folder="${f.id}">
                    <span class="gmail-sidebar-icon">${f.icon}</span>
                    <span class="gmail-sidebar-name">${f.name}</span>
                    ${badge}
                </li>
            `;
        }).join('');

        // Render Custom Category Labels
        labelsContainer.innerHTML = this.labels.map(l => {
            const activeClass = (this.activeFolder === l.id && !this.activeThreadId) ? 'active' : '';
            const unreadCount = this.getUnreadCount(l.id);
            const badge = unreadCount > 0 ? `<span class="gmail-badge unread-badge">${unreadCount}</span>` : '';

            return `
                <li class="gmail-sidebar-item ${activeClass}" data-folder="${l.id}">
                    <span class="gmail-label-pill-color" style="background: ${l.color};"></span>
                    <span class="gmail-sidebar-name">${l.name}</span>
                    ${badge}
                </li>
            `;
        }).join('');

        // Attach listeners to items
        const items = document.querySelectorAll(`#win-${this.windowId} .gmail-sidebar-item`);
        items.forEach(item => {
            item.addEventListener('click', () => {
                SoundCard.playClick();
                this.activeFolder = item.getAttribute('data-folder');
                this.activeThreadId = null; // Close reading view
                this.selectedEmailIds.clear();
                this.renderAll();
            });
        });
    }

    // Filters and gets active set of emails to display
    getActiveEmails() {
        let list = this.emails;

        // Apply folder/label filter
        list = list.filter(mail => {
            const labels = mail.labels || [];
            const isSpam = labels.includes('spam');
            const isTrash = labels.includes('trash');

            if (this.activeFolder === 'inbox') return labels.includes('inbox') && !isSpam && !isTrash;
            if (this.activeFolder === 'starred') return mail.starred && !isTrash;
            if (this.activeFolder === 'important') return mail.important && !isSpam && !isTrash;
            if (this.activeFolder === 'sent') return labels.includes('sent') && !isTrash;
            if (this.activeFolder === 'drafts') return labels.includes('drafts') && !isTrash;
            if (this.activeFolder === 'spam') return labels.includes('spam') && !isTrash;
            if (this.activeFolder === 'trash') return labels.includes('trash');

            // Custom labels
            return labels.includes(this.activeFolder) && !isSpam && !isTrash;
        });

        // Apply search queries
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            list = list.filter(mail => {
                const subject = (mail.subject || '').toLowerCase();
                const from = (mail.from || '').toLowerCase();
                const body = (mail.body || '').toLowerCase();
                const labels = (mail.labels || []).join(' ').toLowerCase();

                // Also check content inside thread messages
                const messagesMatch = (mail.messages || []).some(msg => 
                    (msg.from || '').toLowerCase().includes(query) ||
                    (msg.body || '').toLowerCase().includes(query)
                );

                return subject.includes(query) || 
                       from.includes(query) || 
                       body.includes(query) || 
                       labels.includes(query) ||
                       messagesMatch;
            });
        }

        return list;
    }

    renderActionBar() {
        const actionBar = document.getElementById(`gmail-actions-${this.windowId}`);
        
        if (this.activeThreadId) {
            // Action bar when reading an email thread
            actionBar.innerHTML = `
                <button class="gmail-action-btn" id="gmail-back-btn-${this.windowId}">← Back to List</button>
                <div class="gmail-action-divider"></div>
                <button class="gmail-action-btn" id="gmail-delete-thread-${this.windowId}" title="Move to Trash">🗑️ Trash</button>
                <button class="gmail-action-btn" id="gmail-spam-thread-${this.windowId}" title="Report Spam">⚠️ Spam</button>
                <button class="gmail-action-btn" id="gmail-unread-thread-${this.windowId}" title="Mark Unread">✉️ Mark Unread</button>
            `;

            document.getElementById(`gmail-back-btn-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                this.activeThreadId = null;
                this.renderAll();
            });

            document.getElementById(`gmail-delete-thread-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                this.moveThreadToTrash(this.activeThreadId);
            });

            document.getElementById(`gmail-spam-thread-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                this.reportSpam(this.activeThreadId);
            });

            document.getElementById(`gmail-unread-thread-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                const mail = this.emails.find(m => m.id === this.activeThreadId);
                if (mail) {
                    mail.unread = true;
                    this.saveToCache();
                }
                this.activeThreadId = null;
                this.renderAll();
            });
        } else {
            // Action bar when viewing list of emails
            const activeEmails = this.getActiveEmails();
            const allSelected = activeEmails.length > 0 && activeEmails.every(m => this.selectedEmailIds.has(m.id));
            const selectCheckboxClass = allSelected ? 'checked' : '';

            actionBar.innerHTML = `
                <div class="gmail-select-all-container">
                    <input type="checkbox" class="gmail-action-checkbox" id="gmail-select-all-${this.windowId}" ${allSelected ? 'checked' : ''}>
                </div>
                <button class="gmail-action-btn refresh-btn" id="gmail-refresh-btn-${this.windowId}" title="Refresh Mailbox">🔄 Refresh</button>
                
                <div class="gmail-selected-actions ${this.selectedEmailIds.size > 0 ? '' : 'hidden'}">
                    <div class="gmail-action-divider"></div>
                    <button class="gmail-action-btn" id="gmail-bulk-read-${this.windowId}">Mark as Read</button>
                    <button class="gmail-action-btn" id="gmail-bulk-trash-${this.windowId}" title="Delete Selected">🗑️ Delete</button>
                    <button class="gmail-action-btn" id="gmail-bulk-spam-${this.windowId}" title="Report Spam">⚠️ Spam</button>
                </div>
            `;

            // Bind checkbox
            const masterCheckbox = document.getElementById(`gmail-select-all-${this.windowId}`);
            masterCheckbox.addEventListener('change', () => {
                SoundCard.playClick();
                if (masterCheckbox.checked) {
                    activeEmails.forEach(m => this.selectedEmailIds.add(m.id));
                } else {
                    this.selectedEmailIds.clear();
                }
                this.renderAll();
            });

            // Bind refresh
            document.getElementById(`gmail-refresh-btn-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                this.loadEmails();
            });

            // Bind bulk actions
            if (this.selectedEmailIds.size > 0) {
                document.getElementById(`gmail-bulk-read-${this.windowId}`).addEventListener('click', () => {
                    SoundCard.playClick();
                    this.emails.forEach(m => {
                        if (this.selectedEmailIds.has(m.id)) m.unread = false;
                    });
                    this.selectedEmailIds.clear();
                    this.saveToCache();
                    this.renderAll();
                });

                document.getElementById(`gmail-bulk-trash-${this.windowId}`).addEventListener('click', () => {
                    SoundCard.playClick();
                    this.emails.forEach(m => {
                        if (this.selectedEmailIds.has(m.id)) {
                            // Move to trash
                            m.labels = (m.labels || []).filter(l => l !== 'inbox' && l !== 'spam');
                            if (!m.labels.includes('trash')) m.labels.push('trash');
                        }
                    });
                    this.selectedEmailIds.clear();
                    this.saveToCache();
                    this.renderAll();
                });

                document.getElementById(`gmail-bulk-spam-${this.windowId}`).addEventListener('click', () => {
                    SoundCard.playClick();
                    this.emails.forEach(m => {
                        if (this.selectedEmailIds.has(m.id)) {
                            m.labels = (m.labels || []).filter(l => l !== 'inbox');
                            if (!m.labels.includes('spam')) m.labels.push('spam');
                        }
                    });
                    this.selectedEmailIds.clear();
                    this.saveToCache();
                    this.renderAll();
                });
            }
        }
    }

    renderEmailList() {
        const pane = document.getElementById(`gmail-view-pane-${this.windowId}`);
        const activeEmails = this.getActiveEmails();

        if (activeEmails.length === 0) {
            pane.innerHTML = `
                <div class="gmail-empty-state">
                    <span style="font-size: 24px; display: block; margin-bottom: 10px;">📥</span>
                    <strong>No conversations found.</strong><br>
                    Try searching for something else or check another folder.
                </div>
            `;
            return;
        }

        let html = `<div class="gmail-list-container">`;

        activeEmails.forEach(mail => {
            const isSelected = this.selectedEmailIds.has(mail.id);
            const isUnread = mail.unread;
            const starClass = mail.starred ? 'starred' : '';
            const impClass = mail.important ? 'important' : '';
            const unreadClass = isUnread ? 'unread' : '';
            const selectedClass = isSelected ? 'selected' : '';

            // Body snippet
            const bodyVal = mail.body || '';
            const snippet = bodyVal.substring(0, 75) + (bodyVal.length > 75 ? '...' : '');

            // Label Badges list HTML
            const labelsHtml = (mail.labels || [])
                .filter(l => l !== 'inbox' && l !== 'sent' && l !== 'drafts' && l !== 'spam' && l !== 'trash')
                .map(lblId => {
                    const labelInfo = this.labels.find(lb => lb.id === lblId);
                    if (!labelInfo) return '';
                    return `<span class="gmail-row-label-pill" style="border-left: 2px solid ${labelInfo.color}; background: ${labelInfo.color}15; color: ${labelInfo.color};">${labelInfo.name}</span>`;
                }).join('');

            // Star character
            const starIcon = mail.starred ? '★' : '☆';
            // Important marker
            const impIcon = mail.important ? '🏷️' : '🏷️';

            // Check if thread has multiple messages
            const threadCount = mail.messages && mail.messages.length > 1 ? ` <span class="gmail-thread-count">(${mail.messages.length})</span>` : '';

            // Display warning warning icon if in Spam folder
            const warningBadge = this.activeFolder === 'spam' ? `<span class="gmail-row-spam-icon" title="Detected as Spam">⚠️</span>` : '';

            html += `
                <div class="gmail-email-row ${unreadClass} ${selectedClass}" data-id="${mail.id}">
                    <!-- Controls Column -->
                    <div class="gmail-row-controls">
                        <input type="checkbox" class="gmail-row-checkbox" ${isSelected ? 'checked' : ''} data-id="${mail.id}">
                        <span class="gmail-row-star ${starClass}" data-id="${mail.id}">${starIcon}</span>
                        <span class="gmail-row-imp ${impClass}" data-id="${mail.id}">${impIcon}</span>
                    </div>
                    
                    <!-- Sender Column -->
                    <div class="gmail-row-sender" title="${mail.fromEmail}">
                        ${warningBadge}
                        <span class="gmail-sender-text">${mail.from}</span>
                        ${threadCount}
                    </div>
                    
                    <!-- Content snippet Column -->
                    <div class="gmail-row-content">
                        ${labelsHtml}
                        <span class="gmail-row-subject">${mail.subject}</span>
                        <span class="gmail-row-dash">—</span>
                        <span class="gmail-row-snippet">${snippet}</span>
                    </div>
                    
                    <!-- Date Column -->
                    <div class="gmail-row-date">${mail.date}</div>
                </div>
            `;
        });

        html += `</div>`;
        pane.innerHTML = html;

        // Bind clicks on rows
        pane.querySelectorAll('.gmail-email-row').forEach(row => {
            const mailId = row.getAttribute('data-id');

            // Prevent opening mail if clicking on checkboxes/stars/tags
            row.addEventListener('click', (e) => {
                if (e.target.closest('.gmail-row-controls') || e.target.classList.contains('gmail-row-checkbox')) {
                    return; // Handled by separate listener
                }
                SoundCard.playClick();
                this.openThread(mailId);
            });
        });

        // Checkbox toggle handler
        pane.querySelectorAll('.gmail-row-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                SoundCard.playClick();
                const mailId = cb.getAttribute('data-id');
                if (cb.checked) {
                    this.selectedEmailIds.add(mailId);
                } else {
                    this.selectedEmailIds.delete(mailId);
                }
                this.renderAll();
            });
        });

        // Star click toggle handler
        pane.querySelectorAll('.gmail-row-star').forEach(star => {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundCard.playClick();
                const mailId = star.getAttribute('data-id');
                const mail = this.emails.find(m => m.id === mailId);
                if (mail) {
                    mail.starred = !mail.starred;
                    this.saveToCache();
                }
                this.renderAll();
            });
        });

        // Important badge toggle handler
        pane.querySelectorAll('.gmail-row-imp').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundCard.playClick();
                const mailId = badge.getAttribute('data-id');
                const mail = this.emails.find(m => m.id === mailId);
                if (mail) {
                    mail.important = !mail.important;
                    this.saveToCache();
                }
                this.renderAll();
            });
        });
    }

    openThread(threadId) {
        const mail = this.emails.find(m => m.id === threadId);
        if (!mail) return;

        // Mark read
        mail.unread = false;
        this.saveToCache();

        // Check if it's a draft. If it is a draft, open it inside the composer instead of opening the reader!
        if (mail.labels.includes('drafts')) {
            const draftMsg = (mail.messages && mail.messages.length > 0) ? mail.messages[0] : { to: '' };
            this.openComposer({
                id: mail.id,
                to: draftMsg.to || '',
                subject: mail.subject,
                body: mail.body || ''
            });
            return;
        }

        this.activeThreadId = threadId;
        this.renderAll();
    }

    renderEmailReader() {
        const pane = document.getElementById(`gmail-view-pane-${this.windowId}`);
        const mail = this.emails.find(m => m.id === this.activeThreadId);
        
        if (!mail) {
            pane.innerHTML = `<div class="gmail-empty-state">Conversation not found.</div>`;
            return;
        }

        const isSpam = mail.labels.includes('spam');

        // Label pills HTML
        const labelPills = (mail.labels || [])
            .filter(l => l !== 'inbox' && l !== 'sent' && l !== 'drafts' && l !== 'spam' && l !== 'trash')
            .map(lblId => {
                const labelInfo = this.labels.find(lb => lb.id === lblId);
                if (!labelInfo) return '';
                return `<span class="gmail-reader-label-pill" style="background: ${labelInfo.color};">${labelInfo.name}</span>`;
            }).join('');

        // Spam header box warning (clues user into rescuing the winner email!)
        const spamWarningHTML = isSpam ? `
            <div class="gmail-spam-warning-box">
                <span class="gmail-spam-warning-icon">⚠️</span>
                <div class="gmail-spam-warning-info">
                    <strong>Why is this message in Spam?</strong> It is similar to messages that were detected by our spam filters.
                    <button class="gmail-not-spam-btn" id="gmail-not-spam-btn-${this.windowId}">Not spam</button>
                </div>
            </div>
        ` : '';

        // Build messages thread HTML stack
        // Default to collapsing older messages and keeping the latest one expanded
        const messages = mail.messages || [{
            from: mail.from,
            fromEmail: mail.fromEmail,
            to: "samrudh.sharma2012@gmail.com",
            date: mail.date,
            body: mail.body || ''
        }];

        let threadHtml = '';
        messages.forEach((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const cardStateClass = isLast ? 'expanded' : 'collapsed';
            
            // Generate avatar letter
            const firstLetter = (msg.from || 'S').trim().charAt(0).toUpperCase();

            // Format body with line breaks
            const formattedBody = msg.body.replace(/\n/g, '<br>');

            // One line preview for collapsed view
            const oneLinePreview = msg.body.substring(0, 90) + (msg.body.length > 90 ? '...' : '');

            threadHtml += `
                <div class="gmail-msg-card ${cardStateClass}" data-index="${idx}">
                    <!-- Card Header -->
                    <div class="gmail-msg-header">
                        <div class="gmail-msg-avatar">${firstLetter}</div>
                        <div class="gmail-msg-meta-group">
                            <span class="gmail-msg-sender-name">${msg.from}</span>
                            <span class="gmail-msg-sender-email">&lt;${msg.fromEmail}&gt;</span>
                            <div class="gmail-msg-to-label">to me ▾</div>
                        </div>
                        <div class="gmail-msg-date">${msg.date}</div>
                    </div>
                    
                    <!-- Collapsed summary line -->
                    <div class="gmail-msg-collapsed-summary">
                        <span class="gmail-msg-collapsed-sender">${msg.from}</span>
                        <span class="gmail-msg-collapsed-text">— ${oneLinePreview}</span>
                    </div>
                    
                    <!-- Expanded Body -->
                    <div class="gmail-msg-body">
                        ${formattedBody}
                    </div>
                </div>
            `;
        });

        pane.innerHTML = `
            <div class="gmail-reader-container">
                <!-- Subject Header -->
                <div class="gmail-reader-header">
                    <h1 class="gmail-reader-subject">${mail.subject}</h1>
                    <div class="gmail-reader-labels">${labelPills}</div>
                </div>
                
                ${spamWarningHTML}
                
                <!-- Conversation Thread Stack -->
                <div class="gmail-reader-thread">
                    ${threadHtml}
                </div>
                
                <!-- Quick Inline Reply Section -->
                <div class="gmail-reply-box">
                    <div class="gmail-reply-header">
                        <div class="gmail-msg-avatar">S</div>
                        <div style="font-size: 12px; color: #555;">Reply to <strong>${mail.from}</strong> &lt;${mail.fromEmail}&gt;</div>
                    </div>
                    <textarea class="gmail-reply-textarea" id="gmail-reply-text-${this.windowId}" placeholder="Click here to Reply..."></textarea>
                    <div class="gmail-reply-actions">
                        <button class="gmail-reply-send-btn" id="gmail-reply-send-btn-${this.windowId}">Send</button>
                    </div>
                </div>
            </div>
        `;

        // Bind Collapse/Expand toggling on message cards
        pane.querySelectorAll('.gmail-msg-card').forEach(card => {
            const header = card.querySelector('.gmail-msg-header');
            const collapsedSummary = card.querySelector('.gmail-msg-collapsed-summary');
            
            const toggle = () => {
                SoundCard.playClick();
                card.classList.toggle('expanded');
                card.classList.toggle('collapsed');
            };

            header.addEventListener('click', toggle);
            if (collapsedSummary) {
                collapsedSummary.addEventListener('click', toggle);
            }
        });

        // Bind "Not Spam" button to rescue misclassified emails
        if (isSpam) {
            document.getElementById(`gmail-not-spam-btn-${this.windowId}`).addEventListener('click', () => {
                // Play a nice victory synth chord for finding the NatGeo mail!
                if (mail.fromEmail.includes('natgeo.org')) {
                    SoundCard.playChord([261.63, 329.63, 392.00, 523.25], 1.0, 'sine'); // Nice C major chord
                    alert("Awesome! You rescued the official National Geographic Prize Notification from the Spam folder!");
                } else {
                    SoundCard.playClick();
                }

                this.markNotSpam(mail.id);
            });
        }

        // Bind reply send button
        document.getElementById(`gmail-reply-send-btn-${this.windowId}`).addEventListener('click', () => {
            const textEl = document.getElementById(`gmail-reply-text-${this.windowId}`);
            const textVal = textEl.value.trim();
            if (!textVal) return;

            SoundCard.playClick();

            // Append response message to thread
            const todayStr = this.getTodayDateString();
            mail.messages.push({
                from: "Sam",
                fromEmail: "samrudh.sharma2012@gmail.com",
                to: mail.fromEmail,
                date: todayStr,
                body: textVal
            });

            // If it was in Inbox, ensure it has been marked read and stays in Inbox
            mail.unread = false;
            
            // Update cache
            this.saveToCache();
            
            // Re-render
            this.renderEmailReader();
        });
    }

    moveThreadToTrash(threadId) {
        const mail = this.emails.find(m => m.id === threadId);
        if (mail) {
            mail.labels = (mail.labels || []).filter(l => l !== 'inbox' && l !== 'spam' && l !== 'drafts' && l !== 'sent');
            if (!mail.labels.includes('trash')) mail.labels.push('trash');
            this.saveToCache();
        }
        this.activeThreadId = null;
        this.renderAll();
    }

    reportSpam(threadId) {
        const mail = this.emails.find(m => m.id === threadId);
        if (mail) {
            mail.labels = (mail.labels || []).filter(l => l !== 'inbox' && l !== 'trash');
            if (!mail.labels.includes('spam')) mail.labels.push('spam');
            this.saveToCache();
        }
        this.activeThreadId = null;
        this.renderAll();
    }

    markNotSpam(threadId) {
        const mail = this.emails.find(m => m.id === threadId);
        if (mail) {
            mail.labels = (mail.labels || []).filter(l => l !== 'spam');
            if (!mail.labels.includes('inbox')) mail.labels.push('inbox');
            this.saveToCache();
        }
        this.renderAll();
    }

    // Modal Compose Box popup
    openComposer(prefill = null) {
        const popup = document.getElementById(`gmail-compose-popup-${this.windowId}`);
        popup.classList.remove('hidden');

        this.composeState = prefill || { id: null, to: '', subject: '', body: '' };

        popup.innerHTML = `
            <div class="gmail-compose-header">
                <span>New Message</span>
                <div class="gmail-compose-controls">
                    <button class="gmail-compose-close-btn" id="gmail-compose-close-${this.windowId}">✖</button>
                </div>
            </div>
            <div class="gmail-compose-inputs">
                <input type="text" id="gmail-to-${this.windowId}" placeholder="Recipients" value="${this.composeState.to}">
                <input type="text" id="gmail-subj-${this.windowId}" placeholder="Subject" value="${this.composeState.subject}">
                <textarea id="gmail-body-${this.windowId}" placeholder="Write email body...">${this.composeState.body}</textarea>
            </div>
            <div class="gmail-compose-footer">
                <button class="gmail-send-btn" id="gmail-send-btn-action-${this.windowId}">Send</button>
                <button class="gmail-discard-btn" id="gmail-discard-btn-action-${this.windowId}" title="Discard Draft">🗑️</button>
            </div>
        `;

        // Focus recipient field
        document.getElementById(`gmail-to-${this.windowId}`).focus();

        // Bind compose box buttons
        document.getElementById(`gmail-compose-close-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.saveDraftAndClose();
        });

        document.getElementById(`gmail-discard-btn-action-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.discardDraftAndClose();
        });

        document.getElementById(`gmail-send-btn-action-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.sendEmail();
        });
    }

    // Save as draft when closing popups
    saveDraftAndClose() {
        const to = document.getElementById(`gmail-to-${this.windowId}`).value.trim();
        const subject = document.getElementById(`gmail-subj-${this.windowId}`).value.trim();
        const body = document.getElementById(`gmail-body-${this.windowId}`).value.trim();
        const popup = document.getElementById(`gmail-compose-popup-${this.windowId}`);

        // If there's content, save to Drafts folder
        if (to || subject || body) {
            const todayStr = this.getTodayDateString();

            if (this.composeState.id) {
                // Update existing draft
                const existing = this.emails.find(m => m.id === this.composeState.id);
                if (existing) {
                    existing.subject = subject || '(No Subject)';
                    existing.body = body;
                    existing.date = todayStr;
                    existing.messages = [{
                        from: "Sam",
                        fromEmail: "samrudh.sharma2012@gmail.com",
                        to: to,
                        date: todayStr,
                        body: body
                    }];
                }
            } else {
                // Create new draft
                const draftId = `draft_${Date.now()}`;
                const newDraft = {
                    id: draftId,
                    from: "Sam",
                    fromEmail: "samrudh.sharma2012@gmail.com",
                    subject: subject || '(No Subject)',
                    date: todayStr,
                    timestamp: Math.floor(Date.now() / 1000),
                    unread: false,
                    starred: false,
                    important: false,
                    labels: ['drafts'],
                    body: body,
                    messages: [{
                        from: "Sam",
                        fromEmail: "samrudh.sharma2012@gmail.com",
                        to: to,
                        date: todayStr,
                        body: body
                    }]
                };
                this.emails.unshift(newDraft);
            }
            this.saveToCache();
        }

        popup.classList.add('hidden');
        this.composeState = null;
        this.renderAll();
    }

    discardDraftAndClose() {
        const popup = document.getElementById(`gmail-compose-popup-${this.windowId}`);
        if (this.composeState.id) {
            // Delete the draft from the catalog
            this.emails = this.emails.filter(m => m.id !== this.composeState.id);
            this.saveToCache();
        }
        popup.classList.add('hidden');
        this.composeState = null;
        this.renderAll();
    }

    sendEmail() {
        const to = document.getElementById(`gmail-to-${this.windowId}`).value.trim();
        const subject = document.getElementById(`gmail-subj-${this.windowId}`).value.trim();
        const body = document.getElementById(`gmail-body-${this.windowId}`).value.trim();
        const popup = document.getElementById(`gmail-compose-popup-${this.windowId}`);

        if (!to) {
            alert("Please specify a recipient in the To field.");
            return;
        }

        const todayStr = this.getTodayDateString();

        if (this.composeState.id) {
            // If it was a draft, convert it to a sent message
            const existing = this.emails.find(m => m.id === this.composeState.id);
            if (existing) {
                existing.subject = subject || '(No Subject)';
                existing.body = body;
                existing.date = todayStr;
                existing.labels = ['sent'];
                existing.messages = [{
                    from: "Sam",
                    fromEmail: "samrudh.sharma2012@gmail.com",
                    to: to,
                    date: todayStr,
                    body: body
                }];
            }
        } else {
            // Create a new sent email
            const sentId = `sent_${Date.now()}`;
            const newSent = {
                id: sentId,
                from: "Sam",
                fromEmail: "samrudh.sharma2012@gmail.com",
                subject: subject || '(No Subject)',
                date: todayStr,
                timestamp: Math.floor(Date.now() / 1000),
                unread: false,
                starred: false,
                important: false,
                labels: ['sent'],
                body: body,
                messages: [{
                    from: "Sam",
                    fromEmail: "samrudh.sharma2012@gmail.com",
                    to: to,
                    date: todayStr,
                    body: body
                }]
            };
            this.emails.unshift(newSent);
        }

        this.saveToCache();
        popup.classList.add('hidden');
        this.composeState = null;
        
        // Go to sent folder and refresh
        this.activeFolder = 'sent';
        this.renderAll();
    }

    getTodayDateString() {
        // Format today's date nicely like "Jun 7, 2016" (e.g. MMM DD, YYYY)
        const date = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    }
}

// Inject Gmail application styles dynamically
if (!document.getElementById('gmail-app-styles')) {
    const style = document.createElement('style');
    style.id = 'gmail-app-styles';
    style.innerHTML = `
        .gmail-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            color: #222222;
            font-family: Arial, Helvetica, sans-serif;
            overflow: hidden;
        }
        .gmail-header {
            height: 50px;
            background-color: #f1f1f1;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            flex-shrink: 0;
        }
        .gmail-logo-group {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        .gmail-logo-env {
            font-size: 20px;
            color: #dd4b39;
        }
        .gmail-logo-text {
            font-size: 16px;
            font-weight: bold;
            color: #737373;
        }
        .gmail-search-box {
            display: flex;
            align-items: center;
            background-color: #ffffff;
            border: 1px solid #d9d9d9;
            border-radius: 2px;
            padding: 2px;
            width: 380px;
            max-width: 50%;
            height: 28px;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.08);
        }
        .gmail-search-input {
            border: none;
            outline: none;
            width: 100%;
            padding: 4px 8px;
            font-size: 13px;
        }
        .gmail-search-btn {
            background-color: #4d90fe;
            color: #ffffff;
            border: 1px solid #3079ed;
            border-radius: 2px;
            cursor: pointer;
            height: 24px;
            width: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            outline: none;
        }
        .gmail-search-btn:hover {
            background-color: #357ae8;
        }
        .gmail-profile-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .gmail-profile-email {
            font-size: 11px;
            color: #555555;
            font-family: var(--font-ui);
        }
        .gmail-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #dd4b39;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d14836;
            cursor: pointer;
        }
        .gmail-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        .gmail-sidebar {
            width: 170px;
            background-color: #ffffff;
            padding-top: 12px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #e5e5e5;
            flex-shrink: 0;
            overflow-y: auto;
        }
        .gmail-compose-btn {
            background-color: #dd4b39;
            color: #ffffff;
            border: 1px solid #d14836;
            border-radius: 2px;
            font-size: 11px;
            font-weight: bold;
            height: 28px;
            width: 130px;
            margin: 0 auto 16px;
            cursor: pointer;
            outline: none;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }
        .gmail-compose-btn:hover {
            background-color: #c53727;
            border-color: #b0281a;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .gmail-folder-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .gmail-sidebar-item {
            display: flex;
            align-items: center;
            padding: 6px 16px 6px 12px;
            cursor: pointer;
            font-size: 13px;
            color: #555555;
            gap: 8px;
            position: relative;
        }
        .gmail-sidebar-item:hover {
            background-color: #f5f5f5;
            color: #222222;
        }
        .gmail-sidebar-item.active {
            background-color: #fee9e6;
            color: #dd4b39;
            font-weight: bold;
            border-left: 4px solid #dd4b39;
            padding-left: 8px;
        }
        .gmail-sidebar-icon {
            font-size: 14px;
            width: 16px;
            text-align: center;
        }
        .gmail-sidebar-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gmail-label-pill-color {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            flex-shrink: 0;
        }
        .gmail-badge {
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 8px;
            font-weight: bold;
        }
        .gmail-badge.unread-badge {
            background-color: #f5f5f5;
            color: #444444;
        }
        .gmail-sidebar-item.active .gmail-badge.unread-badge {
            background-color: #dd4b39;
            color: #ffffff;
        }
        .gmail-badge.drafts-badge {
            background-color: #ffeb3b;
            color: #c2185b;
        }
        .gmail-sidebar-divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 8px 0;
        }
        .gmail-sidebar-header {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #737373;
            padding: 6px 12px;
        }
        .gmail-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: #ffffff;
            overflow: hidden;
        }
        .gmail-action-bar {
            height: 38px;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            align-items: center;
            padding: 0 12px;
            gap: 8px;
            flex-shrink: 0;
        }
        .gmail-select-all-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
        }
        .gmail-action-checkbox {
            cursor: pointer;
        }
        .gmail-action-btn {
            background-color: #ffffff;
            border: 1px solid #dcdcdc;
            border-radius: 2px;
            color: #444444;
            font-size: 11px;
            font-weight: bold;
            padding: 5px 10px;
            cursor: pointer;
            outline: none;
            transition: background 0.1s;
        }
        .gmail-action-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }
        .gmail-action-divider {
            width: 1px;
            height: 18px;
            background-color: #dcdcdc;
        }
        .gmail-selected-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .gmail-selected-actions.hidden {
            display: none;
        }
        .gmail-view-pane {
            flex: 1;
            overflow-y: auto;
        }
        .gmail-loading {
            text-align: center;
            padding: 40px;
            color: #666666;
            font-size: 12px;
        }
        .gmail-empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666666;
            font-size: 12px;
        }
        .gmail-list-container {
            display: flex;
            flex-direction: column;
        }
        .gmail-email-row {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
            padding: 6px 12px;
            cursor: pointer;
            background-color: #ffffff;
            height: 24px;
        }
        .gmail-email-row:hover {
            background-color: #f2f2f0;
            box-shadow: inset 1px 0 0 #dd4b39, 0 1px 2px rgba(0,0,0,0.08);
        }
        .gmail-email-row.selected {
            background-color: #ffeb3b20;
        }
        .gmail-email-row.unread {
            background-color: #f7f7f7;
            font-weight: bold;
        }
        .gmail-row-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 60px;
            flex-shrink: 0;
        }
        .gmail-row-checkbox {
            cursor: pointer;
        }
        .gmail-row-star {
            cursor: pointer;
            color: #dcdcdc;
            font-size: 14px;
            line-height: 1;
        }
        .gmail-row-star.starred {
            color: #f4b400;
        }
        .gmail-row-imp {
            cursor: pointer;
            color: #dcdcdc;
            font-size: 12px;
            transform: rotate(-45deg);
        }
        .gmail-row-imp.important {
            color: #f4b400;
        }
        .gmail-row-sender {
            width: 140px;
            flex-shrink: 0;
            font-size: 12px;
            color: #222222;
            padding-right: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .gmail-row-spam-icon {
            font-size: 11px;
            color: #dd4b39;
        }
        .gmail-sender-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gmail-thread-count {
            font-size: 10px;
            color: #777;
            font-weight: normal;
        }
        .gmail-row-content {
            flex: 1;
            font-size: 12px;
            display: flex;
            align-items: center;
            min-width: 0;
            padding-right: 12px;
        }
        .gmail-row-label-pill {
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 2px;
            margin-right: 6px;
            white-space: nowrap;
        }
        .gmail-row-subject {
            color: #222222;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 0;
            max-width: 200px;
        }
        .gmail-row-dash {
            color: #888888;
            margin: 0 4px;
            flex-shrink: 0;
        }
        .gmail-row-snippet {
            color: #666666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: normal;
        }
        .gmail-row-date {
            width: 65px;
            text-align: right;
            font-size: 11px;
            color: #666666;
            flex-shrink: 0;
        }
        
        /* Reader Styling */
        .gmail-reader-container {
            display: flex;
            flex-direction: column;
            padding: 16px;
            overflow-y: auto;
            height: calc(100% - 32px);
        }
        .gmail-reader-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 12px;
        }
        .gmail-reader-subject {
            font-size: 18px;
            font-weight: normal;
            color: #222222;
            margin: 0;
        }
        .gmail-reader-labels {
            display: flex;
            gap: 6px;
        }
        .gmail-reader-label-pill {
            font-size: 10px;
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 2px;
            font-weight: bold;
        }
        .gmail-spam-warning-box {
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: #fee9e6;
            border: 1px solid #f9cdcc;
            padding: 10px 16px;
            margin-bottom: 16px;
            border-radius: 2px;
        }
        .gmail-spam-warning-icon {
            font-size: 20px;
            color: #dd4b39;
        }
        .gmail-spam-warning-info {
            font-size: 12px;
            color: #222222;
            flex: 1;
        }
        .gmail-not-spam-btn {
            background-color: #ffffff;
            border: 1px solid #dcdcdc;
            color: #444444;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 8px;
            margin-left: 12px;
            cursor: pointer;
            border-radius: 2px;
            outline: none;
        }
        .gmail-not-spam-btn:hover {
            background-color: #f8f8f8;
            border-color: #c6c6c6;
        }
        .gmail-reader-thread {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }
        .gmail-msg-card {
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 2px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .gmail-msg-header {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            background-color: #f9f9f9;
            cursor: pointer;
            gap: 12px;
            user-select: none;
        }
        .gmail-msg-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #7c4dff;
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .gmail-msg-meta-group {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .gmail-msg-sender-name {
            font-size: 13px;
            font-weight: bold;
            color: #222222;
        }
        .gmail-msg-sender-email {
            font-size: 11px;
            color: #777777;
        }
        .gmail-msg-to-label {
            font-size: 10px;
            color: #888888;
            cursor: pointer;
        }
        .gmail-msg-date {
            font-size: 11px;
            color: #666666;
        }
        .gmail-msg-body {
            padding: 16px;
            font-size: 13px;
            line-height: 1.5;
            color: #222222;
            white-space: pre-wrap;
            border-top: 1px solid #e5e5e5;
            background-color: #ffffff;
        }
        
        /* Collapsed Message Card state */
        .gmail-msg-card.collapsed .gmail-msg-body {
            display: none;
        }
        .gmail-msg-card.collapsed .gmail-msg-to-label {
            display: none;
        }
        .gmail-msg-card.collapsed .gmail-msg-sender-email {
            display: none;
        }
        .gmail-msg-card.collapsed .gmail-msg-header {
            background-color: #ffffff;
            border-bottom: none;
        }
        .gmail-msg-card.collapsed .gmail-msg-meta-group {
            flex-direction: row;
            align-items: center;
            gap: 12px;
        }
        .gmail-msg-card.collapsed .gmail-msg-avatar {
            width: 24px;
            height: 24px;
            font-size: 12px;
        }
        
        .gmail-msg-collapsed-summary {
            display: none;
        }
        .gmail-msg-card.collapsed .gmail-msg-collapsed-summary {
            display: flex;
            align-items: center;
            flex: 1;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 12px;
            cursor: pointer;
        }
        .gmail-msg-collapsed-sender {
            font-weight: bold;
            color: #222222;
            margin-right: 8px;
        }
        .gmail-msg-collapsed-text {
            color: #666666;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        /* Inline Reply Box */
        .gmail-reply-box {
            border: 1px solid #e5e5e5;
            background-color: #f5f5f5;
            border-radius: 2px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .gmail-reply-header {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .gmail-reply-header .gmail-msg-avatar {
            width: 24px;
            height: 24px;
            font-size: 12px;
            background-color: #dd4b39;
        }
        .gmail-reply-textarea {
            width: calc(100% - 16px);
            height: 80px;
            border: 1px solid #d9d9d9;
            border-radius: 1px;
            padding: 8px;
            outline: none;
            font-family: inherit;
            font-size: 13px;
            resize: vertical;
            background-color: #ffffff;
        }
        .gmail-reply-textarea:focus {
            border-color: #b9b9b9;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        .gmail-reply-actions {
            display: flex;
        }
        .gmail-reply-send-btn {
            background-color: #4d90fe;
            color: #ffffff;
            border: 1px solid #3079ed;
            border-radius: 2px;
            padding: 6px 14px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            outline: none;
        }
        .gmail-reply-send-btn:hover {
            background-color: #357ae8;
        }
        
        /* Composer Popup Styling */
        .gmail-compose-popup {
            position: absolute;
            bottom: 0;
            right: 20px;
            width: 460px;
            height: 380px;
            background-color: #ffffff;
            border: 1px solid #acacac;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            flex-direction: column;
        }
        .gmail-compose-popup.hidden {
            display: none;
        }
        .gmail-compose-header {
            background-color: #404040;
            color: #ffffff;
            font-size: 12px;
            font-weight: bold;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            cursor: move;
        }
        .gmail-compose-close-btn {
            background: transparent;
            border: none;
            color: #aaaaaa;
            cursor: pointer;
            font-size: 12px;
            outline: none;
        }
        .gmail-compose-close-btn:hover {
            color: #ffffff;
        }
        .gmail-compose-inputs {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: 0 10px;
        }
        .gmail-compose-inputs input {
            border: none;
            border-bottom: 1px solid #cfcfcf;
            padding: 8px 2px;
            font-size: 13px;
            outline: none;
        }
        .gmail-compose-inputs textarea {
            flex: 1;
            border: none;
            padding: 8px 2px;
            font-size: 13px;
            outline: none;
            resize: none;
            font-family: inherit;
        }
        .gmail-compose-footer {
            height: 48px;
            border-top: 1px solid #e5e5e5;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
        }
        .gmail-send-btn {
            background-color: #4d90fe;
            color: #ffffff;
            border: 1px solid #3079ed;
            border-radius: 2px;
            font-size: 11px;
            font-weight: bold;
            height: 28px;
            padding: 0 16px;
            cursor: pointer;
            outline: none;
        }
        .gmail-send-btn:hover {
            background-color: #357ae8;
        }
        .gmail-discard-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 14px;
            outline: none;
        }
    `;
    document.head.appendChild(style);
}

// Register Gmail Application in the WIMP Layer
SystemOS.registerApp('gmail', (params) => {
    const win = SystemOS.createWindow('gmail', 'Gmail', '✉️', 760, 520, {
        onClose: () => {
            // Save state or close cleanly
        }
    });

    if (!win.gmailInstance) {
        win.gmailInstance = new GmailApp('gmail');
    }
});
