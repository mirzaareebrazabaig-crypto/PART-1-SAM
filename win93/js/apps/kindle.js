/* --------------------------------------------------
   WINDOWS 93 Kindle Library Application
   High-Fidelity Dark Mode eBook Shelf and Reader App
-------------------------------------------------- */

class KindleApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.books = [];
        this.activeCategory = 'library'; // 'library', 'reading', 'favorites', 'settings'
        this.currentView = 'shelf'; // 'shelf', 'detail', 'reader'
        this.activeBook = null;
        this.searchQuery = '';
        this.sortBy = 'alphabetical';
        
        // Persistent configurations
        this.favorites = [];
        this.currentlyReading = [];
        this.readerFontSize = 14;

        try {
            this.favorites = JSON.parse(localStorage.getItem('kindle_favorites') || '[]');
            this.currentlyReading = JSON.parse(localStorage.getItem('kindle_reading') || '[]');
            this.readerFontSize = parseInt(localStorage.getItem('kindle_font_size') || '14');
        } catch (e) {
            console.warn("Could not read Kindle settings from localStorage:", e);
        }

        this.init();
    }

    setItemSafe(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            console.warn(`Could not write to localStorage for ${key}:`, e);
        }
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="kindle-container">
                <!-- Kindle Sidebar -->
                <div class="kindle-sidebar">
                    <div class="kindle-brand">
                        <span class="kindle-brand-icon">🔥</span>
                        <span class="kindle-brand-text">KINDLE</span>
                    </div>
                    <ul class="kindle-nav">
                        <li class="kindle-nav-item active" id="kindle-nav-library-${this.windowId}" data-category="library">📖 Library</li>
                        <li class="kindle-nav-item" id="kindle-nav-reading-${this.windowId}" data-category="reading">⏳ Reading</li>
                        <li class="kindle-nav-item" id="kindle-nav-favorites-${this.windowId}" data-category="favorites">⭐ Favorites</li>
                        <li class="kindle-nav-item" id="kindle-nav-settings-${this.windowId}" data-category="settings">⚙️ Settings</li>
                    </ul>
                </div>
                
                <!-- Kindle Main Workspace -->
                <div class="kindle-workspace" id="kindle-workspace-${this.windowId}">
                    <div class="kindle-empty-state">Loading books database...</div>
                </div>
            </div>
        `;
        
        this.loadBooks();
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Sidebar Navigation
        const navItems = document.querySelectorAll(`#win-${this.windowId} .kindle-nav-item`);
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                SoundCard.playClick();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.activeCategory = item.getAttribute('data-category');
                this.currentView = 'shelf';
                
                if (this.activeCategory === 'settings') {
                    this.renderSettings();
                } else {
                    this.renderBookshelf();
                }
            });
        });
    }

    async loadBooks() {
        // Inline fallback list in case fetch fails
        const fallbackBooks = [
            {
                "id": "percy_jackson",
                "title": "Percy Jackson & The Olympians",
                "author": "Rick Riordan",
                "synopsis": "Percy Jackson discovers he is a demigod and is thrust into a world of Greek gods, monsters, and ancient prophecies. Together with his friends, he embarks on dangerous quests to save both the mortal and divine worlds.",
                "rating": 3,
                "theme": "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
                "accentColor": "#fdbb2d",
                "icon": "⚡",
                "review": "Basically, this kid Percy finds out his dad is Poseidon, which is basically crazy because he thought he was just a normal kid. He basically goes to Camp Half-Blood and basically has to find Zeus's lightning bolt. It's basically a solid read, basically."
            },
            {
                "id": "time_machine",
                "title": "The Time Machine",
                "author": "H. G. Wells",
                "synopsis": "A Victorian scientist builds a machine that allows him to travel through time. His journey takes him far into humanity's future, where he encounters strange civilizations and uncovers the fate of mankind.",
                "rating": 2,
                "theme": "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                "accentColor": "#2c5364",
                "icon": "⏳",
                "review": "Basically, this guy travels to the future and basically meets the Eloi and Morlocks, who are basically what humans become. He basically gets his time machine stolen and basically has to fight to get back. It's basically a quick read, basically."
            },
            {
                "id": "hunger_games",
                "title": "The Hunger Games",
                "author": "Suzanne Collins",
                "synopsis": "In the dystopian nation of Panem, Katniss Everdeen volunteers to compete in a televised battle-to-the-death competition, sparking events that could change her world forever.",
                "rating": 4,
                "theme": "linear-gradient(135deg, #870000, #190a05)",
                "accentColor": "#ffaa00",
                "icon": "🏹",
                "review": "Basically, they throw twenty-four kids into an arena to basically fight to the death on live TV. Katniss basically volunteers for her sister and basically uses her archery skills to survive. It's basically intense and basically keeps you on edge, basically."
            },
            {
                "id": "the_martian",
                "title": "The Martian",
                "author": "Andy Weir",
                "synopsis": "After being stranded alone on Mars following a failed mission, astronaut Mark Watney must rely on science, engineering, and determination to survive until rescue is possible.",
                "rating": 5,
                "theme": "linear-gradient(135deg, #e65c00, #f9d423)",
                "accentColor": "#f9d423",
                "icon": "🚀",
                "review": "Basically, Mark Watney gets left behind on Mars and basically has to science his way out of dying. He basically grows potatoes in his own waste, which is basically gross but basically works. He basically survives, basically. The best book ever, basically."
            },
            {
                "id": "billionaire_boy",
                "title": "Billionaire Boy",
                "author": "David Walliams",
                "synopsis": "Joe Spud is the richest boy in the country, but all the money in the world cannot buy true friendship. He learns valuable lessons about happiness and relationships.",
                "rating": 2,
                "theme": "linear-gradient(135deg, #11998e, #38ef7d)",
                "accentColor": "#ffffff",
                "icon": "💰",
                "review": "Basically, this kid Joe has everything money can buy, but he basically has no friends. He basically tries to go to a normal school to basically make real friends but basically fails at first. It's basically about how money basically can't buy happiness, basically."
            },
            {
                "id": "donovans_big_day",
                "title": "Donovan's Big Day",
                "author": "Lesléa Newman",
                "synopsis": "Donovan helps prepare for an important family wedding and learns about love, family, and celebration while participating in a memorable special day.",
                "rating": 1,
                "theme": "linear-gradient(135deg, #ef32d9, #89fffd)",
                "accentColor": "#89fffd",
                "icon": "🔔",
                "review": "Basically, it's just a day in the life of this kid Donovan who basically helps out at a wedding. He basically wears a suit and basically carries rings. It's basically a super simple children's story, basically."
            },
            {
                "id": "hitchhikers_guide",
                "title": "The Hitchhiker's Guide to the Galaxy",
                "author": "Douglas Adams",
                "synopsis": "Moments before Earth is destroyed, Arthur Dent is whisked away on a bizarre intergalactic adventure filled with eccentric aliens, absurd humor, and cosmic mysteries.",
                "rating": 3,
                "theme": "linear-gradient(135deg, #00c6ff, #0072ff)",
                "accentColor": "#0072ff",
                "icon": "🛸",
                "review": "Basically, Earth gets demolished to basically make way for an intergalactic bypass. Arthur Dent basically hitches a ride on a spacecraft with Ford Prefect. They basically search for the meaning of life, which is basically 42, basically."
            }
        ];

        try {
            const res = await fetch('data/books.json');
            if (res.ok) {
                this.books = await res.json();
            } else {
                this.books = fallbackBooks;
            }
        } catch (e) {
            console.warn("Could not fetch books.json, using fallback books.", e);
            this.books = fallbackBooks;
        }

        this.renderBookshelf();
    }

    renderBookshelf() {
        const workspace = document.getElementById(`kindle-workspace-${this.windowId}`);
        workspace.innerHTML = `
            <div class="kindle-shelf-header">
                <div class="kindle-search-box">
                    <input type="text" class="kindle-search-input" id="kindle-search-${this.windowId}" placeholder="Search by title..." value="${this.searchQuery}">
                </div>
                <div class="kindle-sort-box">
                    <label style="font-size: 8px; margin-right: 4px; font-family: var(--font-ui);">Sort:</label>
                    <select class="kindle-sort-select" id="kindle-sort-${this.windowId}">
                        <option value="alphabetical" ${this.sortBy === 'alphabetical' ? 'selected' : ''}>A-Z</option>
                        <option value="rating" ${this.sortBy === 'rating' ? 'selected' : ''}>Rating</option>
                    </select>
                </div>
            </div>
            <div class="kindle-shelf-grid" id="kindle-shelf-grid-${this.windowId}">
                <!-- Book Cards Rendered Dynamically -->
            </div>
        `;

        this.renderBookCards();
        this.bindShelfEvents();
    }

    renderBookCards() {
        const grid = document.getElementById(`kindle-shelf-grid-${this.windowId}`);
        grid.innerHTML = '';

        // Search & Category Filters
        let filtered = this.books.filter(book => {
            const matchesQuery = book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                                 book.author.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            if (this.activeCategory === 'favorites') {
                return matchesQuery && this.favorites.includes(book.id);
            }
            if (this.activeCategory === 'reading') {
                return matchesQuery && this.currentlyReading.includes(book.id);
            }
            return matchesQuery;
        });

        // Sorting
        if (this.sortBy === 'alphabetical') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (this.sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="kindle-empty-state">No books available in this category.</div>`;
            return;
        }

        filtered.forEach(book => {
            const card = document.createElement('div');
            card.className = 'kindle-book-card animated fadeIn';
            card.setAttribute('data-id', book.id);

            // Rating Stars
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= book.rating) {
                    stars += '<span class="star gold">★</span>';
                } else {
                    stars += '<span class="star">☆</span>';
                }
            }

            card.innerHTML = `
                <div class="kindle-cover-wrapper" style="background: ${book.theme};">
                    <div class="kindle-cover-spine"></div>
                    <div class="kindle-cover-content">
                        <div class="kindle-cover-icon">${book.icon}</div>
                        <div class="kindle-cover-title">${book.title}</div>
                        <div class="kindle-cover-author">${book.author}</div>
                    </div>
                </div>
                <div class="kindle-book-info">
                    <div class="kindle-book-title">${book.title}</div>
                    <div class="kindle-book-author">By ${book.author}</div>
                    <div class="kindle-book-rating">${stars}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                SoundCard.playClick();
                this.showBookDetail(book);
            });

            grid.appendChild(card);
        });
    }

    bindShelfEvents() {
        const searchInput = document.getElementById(`kindle-search-${this.windowId}`);
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.renderBookCards();
        });

        const sortSelect = document.getElementById(`kindle-sort-${this.windowId}`);
        sortSelect.addEventListener('change', () => {
            this.sortBy = sortSelect.value;
            this.renderBookCards();
        });
    }

    showBookDetail(book) {
        this.currentView = 'detail';
        this.activeBook = book;
        const workspace = document.getElementById(`kindle-workspace-${this.windowId}`);

        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= book.rating) {
                stars += '<span class="star gold">★</span>';
            } else {
                stars += '<span class="star">☆</span>';
            }
        }

        const isFav = this.favorites.includes(book.id);

        workspace.innerHTML = `
            <div class="kindle-detail-container animated fadeIn">
                <div class="kindle-detail-header">
                    <button class="retro-btn bevel-out kindle-back-btn" id="kindle-detail-back-${this.windowId}">⬅ Back</button>
                    <button class="retro-btn bevel-out kindle-fav-btn" id="kindle-detail-fav-${this.windowId}">
                        ${isFav ? '⭐ Favorite' : '☆ Add Favorite'}
                    </button>
                </div>
                <div class="kindle-detail-body">
                    <!-- Book Cover -->
                    <div class="kindle-detail-cover-area">
                        <div class="kindle-cover-wrapper large" style="background: ${book.theme};">
                            <div class="kindle-cover-spine"></div>
                            <div class="kindle-cover-content">
                                <div class="kindle-cover-icon large">${book.icon}</div>
                                <div class="kindle-cover-title large">${book.title}</div>
                                <div class="kindle-cover-author large">${book.author}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Book Information -->
                    <div class="kindle-detail-info-area">
                        <h1 class="kindle-detail-title">${book.title}</h1>
                        <h2 class="kindle-detail-author">By ${book.author}</h2>
                        
                        <div class="kindle-detail-rating-section">
                            <span class="rating-label" style="color: #888; font-family: var(--font-ui);">Rating:</span>
                            <span class="rating-stars">${stars}</span>
                        </div>

                        <div class="kindle-detail-synopsis-section">
                            <h3>Synopsis</h3>
                            <p>${book.synopsis}</p>
                        </div>
                        
                        <div class="kindle-detail-review-section">
                            <h3>Review (by Sam)</h3>
                            <div class="kindle-review-box">
                                <div class="reviewer-avatar">👦</div>
                                <div class="reviewer-content">
                                    <div class="reviewer-name">Sam</div>
                                    <div class="reviewer-text">"${book.review}"</div>
                                </div>
                            </div>
                        </div>

                        <div class="kindle-detail-actions">
                            <button class="retro-btn bevel-out read-btn" id="kindle-read-btn-${this.windowId}">📖 Read Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById(`kindle-detail-back-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.renderBookshelf();
        });

        const favBtn = document.getElementById(`kindle-detail-fav-${this.windowId}`);
        favBtn.addEventListener('click', () => {
            SoundCard.playClick();
            const index = this.favorites.indexOf(book.id);
            if (index > -1) {
                this.favorites.splice(index, 1);
                favBtn.innerText = '☆ Add Favorite';
            } else {
                this.favorites.push(book.id);
                favBtn.innerText = '⭐ Favorite';
            }
            this.setItemSafe('kindle_favorites', JSON.stringify(this.favorites));
        });

        document.getElementById(`kindle-read-btn-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.openReader(book);
        });
    }

    openReader(book) {
        this.currentView = 'reader';
        const workspace = document.getElementById(`kindle-workspace-${this.windowId}`);
        
        // Add to reading history
        if (!this.currentlyReading.includes(book.id)) {
            this.currentlyReading.push(book.id);
            this.setItemSafe('kindle_reading', JSON.stringify(this.currentlyReading));
        }

        const pages = this.getBookPages(book.id);
        let currentPageIndex = 0;

        const renderPage = () => {
            workspace.innerHTML = `
                <div class="kindle-reader-container animated fadeIn">
                    <div class="kindle-reader-header">
                        <button class="retro-btn bevel-out reader-back-btn" id="kindle-reader-back-${this.windowId}">📖 Close Book</button>
                        <div class="reader-controls">
                            <button class="retro-btn bevel-out size-btn" id="font-dec-${this.windowId}">A-</button>
                            <span class="font-size-label" style="font-size: 8px; font-family: var(--font-ui); color:#888; margin:0 6px;">Size: ${this.readerFontSize}px</span>
                            <button class="retro-btn bevel-out size-btn" id="font-inc-${this.windowId}">A+</button>
                        </div>
                    </div>
                    <div class="kindle-reader-body bevel-in">
                        <div class="reader-page-content" id="reader-text-${this.windowId}" style="font-size: ${this.readerFontSize}px;">
                            ${pages[currentPageIndex].replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div class="kindle-reader-footer">
                        <button class="retro-btn bevel-out nav-btn" id="page-prev-${this.windowId}" ${currentPageIndex === 0 ? 'disabled' : ''}>◀ Prev</button>
                        <span class="page-number" style="font-size: 8px; font-family: var(--font-ui); color:#888;">Page ${currentPageIndex + 1} of ${pages.length}</span>
                        <button class="retro-btn bevel-out nav-btn" id="page-next-${this.windowId}" ${currentPageIndex === pages.length - 1 ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            document.getElementById(`kindle-reader-back-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                this.showBookDetail(book);
            });

            document.getElementById(`font-dec-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                if (this.readerFontSize > 10) {
                    this.readerFontSize -= 2;
                    this.setItemSafe('kindle_font_size', this.readerFontSize);
                    renderPage();
                }
            });

            document.getElementById(`font-inc-${this.windowId}`).addEventListener('click', () => {
                SoundCard.playClick();
                if (this.readerFontSize < 24) {
                    this.readerFontSize += 2;
                    this.setItemSafe('kindle_font_size', this.readerFontSize);
                    renderPage();
                }
            });

            const prevBtn = document.getElementById(`page-prev-${this.windowId}`);
            if (currentPageIndex > 0) {
                prevBtn.addEventListener('click', () => {
                    SoundCard.playClick();
                    currentPageIndex--;
                    renderPage();
                });
            }

            const nextBtn = document.getElementById(`page-next-${this.windowId}`);
            if (currentPageIndex < pages.length - 1) {
                nextBtn.addEventListener('click', () => {
                    SoundCard.playClick();
                    currentPageIndex++;
                    renderPage();
                });
            }
        };

        renderPage();
    }

    getBookPages(bookId) {
        const defaultPages = [
            "This is the beginning of the book. Read on to discover the incredible world described by the author.",
            "This is the second page of this wonderful ebook. Thank you for reading Kindle Library on Windows 93!"
        ];
        
        const bookPages = {
            "percy_jackson": [
                "Chapter 1: I Accidentally Vaporize My Pre-Algebra Teacher.\n\nLook, I didn't want to be a half-blood.\n\nIf you're reading this because you think you might be one, my advice is: close this book right now. Believe whatever lie your mom or dad told you about your birth, and try to lead a normal life.",
                "Being a half-blood is dangerous. It's scary. Most of the time, it gets you killed in painful, nasty ways.\n\nIf you're a normal kid, reading this because you think it's fiction, great. Read on. I envy you for being able to believe that none of this ever happened.",
                "But if you recognize yourself in these pages—if you feel something stirring inside—stop reading immediately. You might be one of us. And once you know that, it's only a matter of time before they sense it too, and they'll come for you."
            ],
            "time_machine": [
                "Chapter 1: The Inventor.\n\nThe Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.",
                "The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.\n\n'You must follow me carefully,' he said. 'I shall have to controvert one or two ideas that are almost universally accepted.'"
            ],
            "hunger_games": [
                "Chapter 1: The Reaping.\n\nWhen I wake up, the other side of the bed is cold. My fingers stretch out, seeking Prim's warmth but finding only the rough canvas cover of the mattress. She must have had bad dreams and climbed into bed with our mother.",
                "Of course she did. Today is the day of the reaping.\n\nI prop myself up on one elbow. There's enough light in the bedroom to see them. My little sister, Prim, curled on her side, cocooned in my mother's back, their cheeks pressed together."
            ],
            "the_martian": [
                "Sol 6.\n\nI'm pretty much fucked.\n\nThat's my considered opinion. Stranded on Mars. I have no way to communicate with Earth. Everybody thinks I'm dead. I'm in a Hab designed to last thirty days.",
                "If the oxygenator breaks down, I'll suffocate. If the water reclaimer breaks down, I'll die of thirst. If the Hab breaches, I'll just kind of explode. If none of those things happen, I'll eventually run out of food and starve to death.\n\nSo yeah. I'm fucked."
            ],
            "billionaire_boy": [
                "Chapter 1: Meet Joe Spud.\n\nJoe Spud was a very special boy. He was the richest twelve-year-old in the world. Joe had everything he could ever want. He had his own Formula One racing car. He had a rollercoaster in his back garden.",
                "He had a real-life robot butler from Japan. He had £100,000 pocket money every single week.\n\nBut there was one thing Joe didn't have. He didn't have a friend."
            ],
            "donovans_big_day": [
                "The Morning.\n\nDonovan woke up early. Today was the big day! The sun was shining through his window. The birds were singing. Donovan jumped out of bed and ran to his closet. He had a special suit to wear.",
                "It was deep blue, and it had a shiny gold tie. He was going to help his family carry the wedding rings."
            ],
            "hitchhikers_guide": [
                "Chapter 1: Earth.\n\nThe house stood on a slight rise just on the edge of the village. It stood on its own and looked over a broad spread of West Country farmland. Not a very remarkable house by any means.",
                "Arthur Dent woke up, walked around his kitchen, and noticed a large yellow bulldozer outside his window. It was there to demolish his house. It was a Thursday. He never could get the hang of Thursdays."
            ]
        };

        return bookPages[bookId] || defaultPages;
    }

    renderSettings() {
        const workspace = document.getElementById(`kindle-workspace-${this.windowId}`);
        workspace.innerHTML = `
            <div class="kindle-settings-container animated fadeIn">
                <h1 class="kindle-settings-title" style="font-family: var(--font-ui); font-size: 10px; color: #ffaa00; margin-bottom: 8px;">⚙️ Kindle Settings</h1>
                <div class="kindle-settings-card bevel-out">
                    <div class="settings-row">
                        <label>Default Text Size:</label>
                        <select id="setting-font-size-${this.windowId}" class="kindle-select">
                            <option value="12" ${this.readerFontSize === 12 ? 'selected' : ''}>12px (Small)</option>
                            <option value="14" ${this.readerFontSize === 14 ? 'selected' : ''}>14px (Medium)</option>
                            <option value="16" ${this.readerFontSize === 16 ? 'selected' : ''}>16px (Large)</option>
                            <option value="18" ${this.readerFontSize === 18 ? 'selected' : ''}>18px (X-Large)</option>
                        </select>
                    </div>
                    <div class="settings-row" style="margin-top: 10px;">
                        <label>Currently Reading Count:</label>
                        <span>${this.currentlyReading.length} books</span>
                    </div>
                    <div class="settings-row" style="margin-top: 10px;">
                        <label>Favorites Count:</label>
                        <span>${this.favorites.length} books</span>
                    </div>
                    <div class="settings-row" style="margin-top: 20px;">
                        <button class="retro-btn bevel-out" id="btn-clear-reading-${this.windowId}">Clear Reading History</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById(`setting-font-size-${this.windowId}`).addEventListener('change', (e) => {
            SoundCard.playClick();
            this.readerFontSize = parseInt(e.target.value);
            this.setItemSafe('kindle_font_size', this.readerFontSize);
        });

        document.getElementById(`btn-clear-reading-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            if (confirm("Clear your currently reading logs from local storage?")) {
                this.currentlyReading = [];
                this.setItemSafe('kindle_reading', JSON.stringify([]));
                alert("Reading history cleared.");
                this.renderSettings();
            }
        });
    }
}

// Inject Kindle application stylesheets
if (!document.getElementById('kindle-app-styles')) {
    const style = document.createElement('style');
    style.id = 'kindle-app-styles';
    style.innerHTML = `
        .kindle-container {
            display: flex;
            width: 100%;
            height: 100%;
            background-color: #111111;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .kindle-sidebar {
            width: 140px;
            background-color: #1a1a1a;
            border-right: 2px solid #2d2d2d;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }
        .kindle-brand {
            padding: 12px 10px;
            background-color: #121212;
            border-bottom: 2px solid #2d2d2d;
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-ui);
            font-size: 9px;
            color: #ffaa00;
        }
        .kindle-brand-icon {
            font-size: 12px;
        }
        .kindle-nav {
            list-style: none;
            padding: 8px 0;
        }
        .kindle-nav-item {
            padding: 10px;
            cursor: pointer;
            font-size: 9px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: #b0b0b0;
            font-family: var(--font-ui);
        }
        .kindle-nav-item:hover {
            color: #ffffff;
            background-color: #252525;
        }
        .kindle-nav-item.active {
            color: #ffffff;
            background-color: #2d2d2d;
            border-left: 3px solid #ffaa00;
        }
        .kindle-workspace {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            background-color: #111111;
            padding: 12px;
            position: relative;
        }
        .kindle-shelf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #2d2d2d;
            margin-bottom: 12px;
        }
        .kindle-search-input {
            background-color: #222222;
            border: 1.5px solid #333333;
            color: #ffffff;
            padding: 4px 6px;
            font-family: monospace;
            font-size: 10px;
            width: 150px;
            outline: none;
        }
        .kindle-sort-select {
            background-color: #222222;
            border: 1.5px solid #333333;
            color: #ffffff;
            font-size: 9px;
            padding: 2px;
            outline: none;
            font-family: var(--font-ui);
        }
        .kindle-shelf-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 16px;
            padding-bottom: 20px;
        }
        .kindle-book-card {
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.15s;
        }
        .kindle-book-card:hover {
            transform: translateY(-4px);
        }
        .kindle-cover-wrapper {
            width: 100px;
            height: 135px;
            border-radius: 2px;
            position: relative;
            box-shadow: 2px 4px 8px rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            padding: 8px;
            overflow: hidden;
            color: #ffffff;
            flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.08);
        }
        .kindle-cover-wrapper.large {
            width: 150px;
            height: 205px;
            box-shadow: 4px 8px 16px rgba(0,0,0,0.7);
        }
        .kindle-cover-spine {
            position: absolute;
            top: 0;
            left: 0;
            width: 6px;
            height: 100%;
            background: rgba(0,0,0,0.25);
            box-shadow: 1px 0 3px rgba(255,255,255,0.1) inset;
        }
        .kindle-cover-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            align-items: center;
            justify-content: space-between;
            text-align: center;
        }
        .kindle-cover-icon {
            font-size: 30px;
            margin-top: 6px;
        }
        .kindle-cover-icon.large {
            font-size: 42px;
            margin-top: 14px;
        }
        .kindle-cover-title {
            font-family: "Share Tech Mono", monospace;
            font-size: 10px;
            font-weight: bold;
            line-height: 1.2;
            margin: 6px 0;
            word-break: break-word;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .kindle-cover-title.large {
            font-size: 15px;
        }
        .kindle-cover-author {
            font-size: 8px;
            font-family: monospace;
            opacity: 0.8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .kindle-cover-author.large {
            font-size: 9px;
        }
        .kindle-book-info {
            margin-top: 8px;
        }
        .kindle-book-title {
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #fff;
        }
        .kindle-book-author {
            font-size: 9px;
            color: #888888;
            margin-top: 2px;
        }
        .kindle-book-rating {
            margin-top: 4px;
            display: flex;
            gap: 1px;
        }
        .star {
            font-size: 12px;
            color: #333333;
        }
        .star.gold {
            color: #ffaa00;
        }
        .kindle-detail-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .kindle-detail-header {
            display: flex;
            justify-content: space-between;
            padding-bottom: 8px;
            border-bottom: 1px solid #2d2d2d;
            flex-shrink: 0;
        }
        .kindle-back-btn, .kindle-fav-btn, .reader-back-btn, .size-btn, .nav-btn {
            font-size: 8px;
            padding: 3px 8px;
        }
        .kindle-detail-body {
            display: flex;
            gap: 20px;
            padding-top: 14px;
            flex: 1;
            overflow-y: auto;
        }
        .kindle-detail-cover-area {
            flex-shrink: 0;
        }
        .kindle-detail-info-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .kindle-detail-title {
            font-size: 15px;
            font-weight: bold;
            color: #ffffff;
        }
        .kindle-detail-author {
            font-size: 11px;
            color: #888888;
            margin-top: -8px;
        }
        .kindle-detail-rating-section {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 8px;
        }
        .kindle-detail-synopsis-section h3,
        .kindle-detail-review-section h3 {
            font-size: 9px;
            color: #ffaa00;
            margin-bottom: 4px;
            font-family: var(--font-ui);
        }
        .kindle-detail-synopsis-section p {
            font-size: 10px;
            line-height: 1.4;
            color: #cccccc;
        }
        .kindle-review-box {
            background-color: #161616;
            border: 1.5px solid #2d2d2d;
            padding: 8px;
            display: flex;
            gap: 8px;
            box-shadow: inset 1px 1px 0px #000;
        }
        .reviewer-avatar {
            font-size: 28px;
            flex-shrink: 0;
        }
        .reviewer-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .reviewer-name {
            font-size: 9px;
            font-weight: bold;
            color: #ffffff;
            font-family: var(--font-ui);
        }
        .reviewer-text {
            font-size: 10px;
            line-height: 1.4;
            color: #aaaaaa;
            font-style: italic;
        }
        .kindle-detail-actions {
            margin-top: auto;
            padding-top: 12px;
        }
        .read-btn {
            background-color: #ffaa00;
            color: #000000;
            border: 1.5px solid #fff;
            font-weight: bold;
            padding: 6px 14px;
            cursor: pointer;
            font-size: 9px;
            font-family: var(--font-ui);
        }
        .kindle-reader-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .kindle-reader-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 1px solid #2d2d2d;
            flex-shrink: 0;
        }
        .kindle-reader-body {
            flex: 1;
            background-color: #f4edd8; /* Soft sepia pages */
            color: #2c3539;
            padding: 16px;
            margin: 10px 0;
            overflow-y: auto;
            font-family: "Georgia", serif;
            box-shadow: inset 1.5px 1.5px 0px #000;
        }
        .reader-page-content {
            line-height: 1.5;
            max-width: 440px;
            margin: 0 auto;
        }
        .kindle-reader-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .kindle-settings-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .kindle-settings-card {
            background-color: #1a1a1a;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .settings-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            font-family: var(--font-ui);
        }
        .kindle-select {
            background-color: #222222;
            color: #ffffff;
            border: 1.5px solid #333333;
            padding: 2px 4px;
            outline: none;
            font-family: var(--font-ui);
            font-size: 9px;
        }
        .kindle-empty-state {
            grid-column: 1 / -1;
            text-align: center;
            color: #888888;
            padding: 40px;
            font-size: 9px;
            font-family: var(--font-ui);
        }
        /* Fade in keyframes */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animated {
            animation-duration: 0.25s;
            animation-fill-mode: both;
        }
        .fadeIn {
            animation-name: fadeIn;
        }
    `;
    document.head.appendChild(style);
}

// Register Kindle App inside WIMP workspace
SystemOS.registerApp('kindle', () => {
    const win = SystemOS.createWindow('kindle', 'Kindle Library', '📖', 730, 510);
    
    if (!win.kindleInstance) {
        win.kindleInstance = new KindleApp('kindle');
    }
});
