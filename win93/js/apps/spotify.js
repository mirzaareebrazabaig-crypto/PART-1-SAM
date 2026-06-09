/* --------------------------------------------------
   WINDOWS 93 Spotify 2015 Application
   High-Fidelity Dark Spotify Parody App with Audio Synth
-------------------------------------------------- */

class SpotifySynth {
    constructor() {
        this.ctx = null;
        this.interval = null;
        this.volume = 0.5;
        this.muted = false;
        this.notes = [
            [261.63, 329.63, 392.00], // C Maj
            [293.66, 349.23, 440.00], // D Min
            [349.23, 440.00, 523.25], // F Maj
            [392.00, 493.88, 587.33]  // G Maj
        ];
        this.chordIndex = 0;
        this.beatIndex = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playBeat() {
        if (this.muted || this.volume === 0) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const currentChord = this.notes[this.chordIndex];
        
        // Play a nice arpeggiated rhythmic sequence
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        // Alternate between notes in the active chord based on beat index
        const note = currentChord[this.beatIndex % currentChord.length];
        osc.frequency.setValueAtTime(note, now);

        gainNode.gain.setValueAtTime(this.volume * 0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);

        this.beatIndex++;
        if (this.beatIndex % 4 === 0) {
            // Cycle chord every 4 beats
            this.chordIndex = (this.chordIndex + 1) % this.notes.length;
        }
    }

    start() {
        this.stop();
        this.interval = setInterval(() => {
            this.playBeat();
        }, 500); // 120 BPM tempo
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

class SpotifyApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.playlists = [];
        this.activeCategory = 'browse'; // 'browse', 'radio', 'your_music', 'search'
        this.activePlaylistId = null;
        this.activeSong = null;
        this.activeSongQueue = [];
        this.queueIndex = 0;
        
        // Search state
        this.searchQuery = '';

        // Player states
        this.isPlaying = false;
        this.isMuted = false;
        this.isShuffle = false;
        this.isRepeat = false;
        this.playbackProgress = 0; // Current progress in seconds
        this.playbackDuration = 0; // Total duration in seconds
        this.playbackTimer = null;
        this.volumeLevel = 0.8;

        // Music Synthesizer
        this.synth = new SpotifySynth();
        this.synth.volume = this.volumeLevel;

        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="spotify-container">
                <!-- Spotify Sidebar -->
                <div class="spotify-sidebar">
                    <!-- User Profile -->
                    <div class="spotify-profile">
                        <div class="spotify-avatar">S</div>
                        <div class="spotify-username">Sam</div>
                    </div>
                    
                    <!-- Core Navigation -->
                    <ul class="spotify-nav">
                        <li class="spotify-nav-item active" id="sp-nav-browse-${this.windowId}" data-nav="browse">🔍 Browse</li>
                        <li class="spotify-nav-item" id="sp-nav-radio-${this.windowId}" data-nav="radio">📻 Radio</li>
                        <li class="spotify-nav-item" id="sp-nav-search-${this.windowId}" data-nav="search">🔍 Search</li>
                    </ul>
                    
                    <!-- Your Music -->
                    <div class="spotify-sidebar-header">Your Music</div>
                    <ul class="spotify-nav">
                        <li class="spotify-nav-item" id="sp-nav-songs-${this.windowId}" data-nav="songs">🎵 Songs</li>
                    </ul>
                    
                    <!-- Playlists Header -->
                    <div class="spotify-sidebar-header">Sam's Playlists</div>
                    <ul class="spotify-playlist-list" id="spotify-sidebar-playlists-${this.windowId}">
                        <li class="spotify-playlist-item" style="color: #666; font-style: italic; font-size: 7px;">Loading...</li>
                    </ul>
                </div>
                
                <!-- Main Body -->
                <div class="spotify-main">
                    <!-- Workspace Area -->
                    <div class="spotify-workspace" id="spotify-workspace-${this.windowId}">
                        <div class="spotify-empty-state">Loading Spotify database...</div>
                    </div>
                    
                    <!-- Bottom Player -->
                    <div class="spotify-player">
                        <!-- Left: Song details -->
                        <div class="spotify-track-info" id="sp-player-track-${this.windowId}">
                            <div class="spotify-track-artwork">🎵</div>
                            <div class="spotify-track-details">
                                <div class="spotify-track-title">Not Playing</div>
                                <div class="spotify-track-artist">Choose a track</div>
                            </div>
                        </div>
                        
                        <!-- Middle: Play Controls & Progress Bar -->
                        <div class="spotify-controls">
                            <div class="spotify-control-buttons">
                                <button class="spotify-control-btn" id="sp-btn-shuffle-${this.windowId}" title="Shuffle">🔀</button>
                                <button class="spotify-control-btn" id="sp-btn-prev-${this.windowId}" title="Previous">⏮</button>
                                <button class="spotify-control-btn play" id="sp-btn-play-${this.windowId}" title="Play/Pause">▶</button>
                                <button class="spotify-control-btn" id="sp-btn-next-${this.windowId}" title="Next">⏭</button>
                                <button class="spotify-control-btn" id="sp-btn-repeat-${this.windowId}" title="Repeat">🔁</button>
                            </div>
                            <div class="spotify-progress-bar-container">
                                <span class="spotify-time-label" id="sp-time-current-${this.windowId}">0:00</span>
                                <div class="spotify-progress-track" id="sp-progress-track-${this.windowId}">
                                    <div class="spotify-progress-fill" id="sp-progress-fill-${this.windowId}"></div>
                                </div>
                                <span class="spotify-time-label" id="sp-time-duration-${this.windowId}">0:00</span>
                            </div>
                        </div>
                        
                        <!-- Right: Volume Controls -->
                        <div class="spotify-volume-container">
                            <span class="spotify-volume-icon" id="sp-volume-icon-${this.windowId}">🔊</span>
                            <div class="spotify-volume-slider-track" id="sp-volume-track-${this.windowId}">
                                <div class="spotify-volume-slider-fill" id="sp-volume-fill-${this.windowId}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadPlaylists();
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Sidebar Navigation
        const navItems = document.querySelectorAll(`#win-${this.windowId} .spotify-nav-item`);
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                SoundCard.playClick();
                navItems.forEach(i => i.classList.remove('active'));
                
                // Clear playlist selection in sidebar list
                document.querySelectorAll(`#spotify-sidebar-playlists-${this.windowId} .spotify-playlist-item`).forEach(p => p.classList.remove('active'));
                
                item.classList.add('active');
                this.activeCategory = item.getAttribute('data-nav');
                this.activePlaylistId = null;
                
                if (this.activeCategory === 'browse') {
                    this.renderBrowse();
                } else if (this.activeCategory === 'radio') {
                    this.renderRadio();
                } else if (this.activeCategory === 'search') {
                    this.renderSearch();
                } else if (this.activeCategory === 'songs') {
                    this.renderAllSongs();
                }
            });
        });

        // Player Buttons: Play/Pause
        const playBtn = document.getElementById(`sp-btn-play-${this.windowId}`);
        playBtn.addEventListener('click', () => {
            SoundCard.playClick();
            this.togglePlayback();
        });

        // Player Buttons: Previous
        document.getElementById(`sp-btn-prev-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.prevTrack();
        });

        // Player Buttons: Next
        document.getElementById(`sp-btn-next-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.nextTrack();
        });

        // Player Buttons: Shuffle
        const shuffleBtn = document.getElementById(`sp-btn-shuffle-${this.windowId}`);
        shuffleBtn.addEventListener('click', () => {
            SoundCard.playClick();
            this.isShuffle = !this.isShuffle;
            shuffleBtn.classList.toggle('active', this.isShuffle);
        });

        // Player Buttons: Repeat
        const repeatBtn = document.getElementById(`sp-btn-repeat-${this.windowId}`);
        repeatBtn.addEventListener('click', () => {
            SoundCard.playClick();
            this.isRepeat = !this.isRepeat;
            repeatBtn.classList.toggle('active', this.isRepeat);
        });

        // Seek Bar Click Event
        const progressTrack = document.getElementById(`sp-progress-track-${this.windowId}`);
        progressTrack.addEventListener('click', (e) => {
            if (this.playbackDuration === 0) return;
            const rect = progressTrack.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            this.playbackProgress = Math.floor(clickRatio * this.playbackDuration);
            this.updatePlayerProgressUI();
        });

        // Volume Bar Click Event
        const volumeTrack = document.getElementById(`sp-volume-track-${this.windowId}`);
        const volumeFill = document.getElementById(`sp-volume-fill-${this.windowId}`);
        const volumeIcon = document.getElementById(`sp-volume-icon-${this.windowId}`);
        
        const setVolume = (e) => {
            const rect = volumeTrack.getBoundingClientRect();
            let ratio = (e.clientX - rect.left) / rect.width;
            ratio = Math.max(0, Math.min(1, ratio));
            
            this.volumeLevel = ratio;
            volumeFill.style.width = `${ratio * 100}%`;
            this.synth.volume = ratio;
            
            if (ratio === 0) {
                volumeIcon.innerText = '🔇';
            } else if (ratio < 0.4) {
                volumeIcon.innerText = '🔈';
            } else {
                volumeIcon.innerText = '🔊';
            }
        };

        volumeTrack.addEventListener('mousedown', (e) => {
            setVolume(e);
            const onMouseMove = (moveEvent) => setVolume(moveEvent);
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        volumeIcon.addEventListener('click', () => {
            SoundCard.playClick();
            this.isMuted = !this.isMuted;
            this.synth.muted = this.isMuted;
            volumeIcon.innerText = this.isMuted ? '🔇' : (this.volumeLevel < 0.4 ? '🔈' : '🔊');
            volumeFill.style.width = this.isMuted ? '0%' : `${this.volumeLevel * 100}%`;
        });
    }

    async loadPlaylists() {
        const fallbackPlaylists = [
            {
                "id": "playlist_happy",
                "name": "Happy Vibes 😄",
                "description": "Upbeat songs for good moods and celebrations.",
                "songs": [
                    { "id": "bruno_just_the_way", "title": "Just the Way You Are", "artist": "Bruno Mars", "duration": "3:40", "bg": "linear-gradient(135deg, #f05053, #e1eec3)", "icon": "❤️" },
                    { "id": "katy_teenage_dream", "title": "Teenage Dream", "artist": "Katy Perry", "duration": "3:47", "bg": "linear-gradient(135deg, #ff758c, #ff7eb3)", "icon": "🍭" },
                    { "id": "katy_firework", "title": "Firework", "artist": "Katy Perry", "duration": "3:48", "bg": "linear-gradient(135deg, #4300b0, #dd2476)", "icon": "🎆" },
                    { "id": "taio_dynamite", "title": "Dynamite", "artist": "Taio Cruz", "duration": "3:23", "bg": "linear-gradient(135deg, #00c6ff, #0072ff)", "icon": "🧨" },
                    { "id": "lmfao_party_rock", "title": "Party Rock Anthem", "artist": "LMFAO", "duration": "4:24", "bg": "linear-gradient(135deg, #f857a6, #ff5858)", "icon": "🕶️" }
                ]
            }
        ];

        try {
            const res = await fetch('data/spotify.json?v=' + Date.now());
            if (res.ok) {
                this.playlists = await res.json();
            } else {
                this.playlists = fallbackPlaylists;
            }
        } catch (e) {
            console.warn("Could not fetch spotify.json, using fallback database.", e);
            this.playlists = fallbackPlaylists;
        }

        this.renderSidebarPlaylists();
        this.renderBrowse();
    }

    renderSidebarPlaylists() {
        const listContainer = document.getElementById(`spotify-sidebar-playlists-${this.windowId}`);
        listContainer.innerHTML = '';

        this.playlists.forEach(pl => {
            const li = document.createElement('li');
            li.className = 'spotify-playlist-item';
            li.setAttribute('data-id', pl.id);
            li.innerText = pl.name.split(' ')[0] + ' ' + (pl.name.split(' ').slice(1).join(' ') || '');
            
            li.addEventListener('click', () => {
                SoundCard.playClick();
                // De-activate all navigation items
                document.querySelectorAll(`#win-${this.windowId} .spotify-nav-item`).forEach(i => i.classList.remove('active'));
                
                // Set active class
                document.querySelectorAll(`#spotify-sidebar-playlists-${this.windowId} .spotify-playlist-item`).forEach(p => p.classList.remove('active'));
                li.classList.add('active');

                this.activeCategory = null;
                this.showPlaylist(pl.id);
            });

            listContainer.appendChild(li);
        });
    }

    renderBrowse() {
        const workspace = document.getElementById(`spotify-workspace-${this.windowId}`);
        workspace.innerHTML = `
            <div class="spotify-workspace-header">
                <h1 style="font-size: 11px; font-family: var(--font-ui); color: #fff;">Browse Library</h1>
                <div class="spotify-search-box">
                    <span style="font-size: 9px; margin-right: 6px;">🔍</span>
                    <input type="text" class="spotify-search-input" id="spotify-search-${this.windowId}" placeholder="Search playlists..." value="${this.searchQuery}">
                </div>
            </div>
            
            <!-- Sam's Playlists Grid -->
            <h2 style="font-size: 8px; color: #aaa; text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-ui);">Sam's Playlists</h2>
            <div class="spotify-grid" id="sp-browse-grid-${this.windowId}"></div>
            
            <!-- Recently Played Section -->
            <h2 style="font-size: 8px; color: #aaa; text-transform: uppercase; margin: 24px 0 12px; font-family: var(--font-ui);">Recently Played</h2>
            <div class="spotify-grid" id="sp-recent-grid-${this.windowId}"></div>
            
            <!-- Top Tracks of 2015 -->
            <h2 style="font-size: 8px; color: #aaa; text-transform: uppercase; margin: 24px 0 12px; font-family: var(--font-ui);">Top Tracks of 2015</h2>
            <div class="spotify-top-songs-list" id="sp-top-tracks-${this.windowId}">
                <!-- Top tracks list -->
            </div>
        `;

        this.renderBrowseGrid();
        this.renderRecentlyPlayed();
        this.renderTopTracks2015();

        const searchInput = document.getElementById(`spotify-search-${this.windowId}`);
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.renderBrowseGrid();
        });
    }

    renderBrowseGrid() {
        const grid = document.getElementById(`sp-browse-grid-${this.windowId}`);
        grid.innerHTML = '';

        const filtered = this.playlists.filter(pl => 
            pl.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            pl.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="spotify-empty-state">No matching playlists found.</div>`;
            return;
        }

        filtered.forEach(pl => {
            const card = document.createElement('div');
            card.className = 'spotify-card animated fadeIn';
            
            // Build collage covers dynamically using first 4 songs
            const collageHTML = this.generateCollageHTML(pl, false);

            card.innerHTML = `
                ${collageHTML}
                <div class="spotify-card-name">${pl.name}</div>
                <div class="spotify-card-desc">${pl.description}</div>
            `;

            card.addEventListener('click', () => {
                SoundCard.playClick();
                this.showPlaylist(pl.id);
            });

            grid.appendChild(card);
        });
    }

    renderRecentlyPlayed() {
        const grid = document.getElementById(`sp-recent-grid-${this.windowId}`);
        grid.innerHTML = '';

        // Display 3 static recent items for aesthetics
        const recents = this.playlists.slice(0, 3);
        recents.forEach(pl => {
            const card = document.createElement('div');
            card.className = 'spotify-card';
            const collageHTML = this.generateCollageHTML(pl, false);
            
            card.innerHTML = `
                ${collageHTML}
                <div class="spotify-card-name">${pl.name}</div>
                <div class="spotify-card-desc">Playlist • Sam</div>
            `;
            
            card.addEventListener('click', () => {
                SoundCard.playClick();
                this.showPlaylist(pl.id);
            });
            grid.appendChild(card);
        });
    }

    renderTopTracks2015() {
        const container = document.getElementById(`sp-top-tracks-${this.windowId}`);
        
        // 5 top tracks from 2015
        const topTracks = [
            { "id": "bruno_just_the_way", "title": "Just the Way You Are", "artist": "Bruno Mars", "duration": "3:40", "bg": "linear-gradient(135deg, #f05053, #e1eec3)", "icon": "❤️" },
            { "id": "rihanna_we_found_love", "title": "We Found Love", "artist": "Rihanna ft. Calvin Harris", "duration": "3:35", "bg": "linear-gradient(135deg, #00c6ff, #0072ff)", "icon": "✨" },
            { "id": "coldplay_fix_you", "title": "Fix You", "artist": "Coldplay", "duration": "4:55", "bg": "linear-gradient(135deg, #3a7bd5, #3a6073)", "icon": "💡" },
            { "id": "avicii_wake_me_up", "title": "Wake Me Up", "artist": "Avicii", "duration": "4:07", "bg": "linear-gradient(135deg, #e65c00, #F9D423)", "icon": "🌅" },
            { "id": "adele_rolling", "title": "Rolling in the Deep", "artist": "Adele", "duration": "3:48", "bg": "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", "icon": "🖤" }
        ];

        let html = `
            <table class="spotify-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">#</th>
                        <th>Song Title</th>
                        <th>Artist</th>
                        <th style="width: 80px;">Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        topTracks.forEach((track, index) => {
            const isCurrent = this.activeSong && this.activeSong.id === track.id;
            html += `
                <tr class="sp-track-row ${isCurrent ? 'playing' : ''}" data-index="${index}">
                    <td style="text-align: center; color: #888;">${index + 1}</td>
                    <td>
                        <div class="spotify-song-title">
                            <div class="spotify-song-cover-mini" style="background: ${track.bg};">${track.icon}</div>
                            <span>${track.title}</span>
                        </div>
                    </td>
                    <td style="color: #aaa;">${track.artist}</td>
                    <td style="color: #888;">${track.duration}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        // Bind clicks to play these songs
        container.querySelectorAll('.sp-track-row').forEach(row => {
            row.addEventListener('click', () => {
                SoundCard.playClick();
                const trackIndex = parseInt(row.getAttribute('data-index'), 10);
                this.activeSongQueue = topTracks;
                this.queueIndex = trackIndex;
                this.playSong(topTracks[trackIndex]);
                
                // Re-render to update playing colors
                this.renderTopTracks2015();
            });
        });
    }

    renderRadio() {
        const workspace = document.getElementById(`spotify-workspace-${this.windowId}`);
        workspace.innerHTML = `
            <div class="spotify-workspace-header">
                <h1 style="font-size: 11px; font-family: var(--font-ui); color: #fff;">Radio Stations</h1>
            </div>
            <div class="spotify-empty-state" style="padding: 60px 20px;">
                <span style="font-size: 28px; margin-bottom: 12px; display: block;">📻</span>
                <strong>Live Music Stream Nominal</strong><br><br>
                Tune in to custom stations compiled in Sam's VFS profile. Select a playlist to begin broadcasting.
            </div>
        `;
    }

    renderSearch() {
        const workspace = document.getElementById(`spotify-workspace-${this.windowId}`);
        workspace.innerHTML = `
            <div class="spotify-workspace-header">
                <h1 style="font-size: 11px; font-family: var(--font-ui); color: #fff;">Search</h1>
                <div class="spotify-search-box" style="width: 220px;">
                    <span style="font-size: 9px; margin-right: 6px;">🔍</span>
                    <input type="text" class="spotify-search-input" id="spotify-search-global-${this.windowId}" placeholder="Search songs, artists, playlists..." value="${this.searchQuery}">
                </div>
            </div>
            <div id="sp-search-results-${this.windowId}"></div>
        `;

        this.renderSearchResults();

        const searchInput = document.getElementById(`spotify-search-global-${this.windowId}`);
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.renderSearchResults();
        });
        
        setTimeout(() => searchInput.focus(), 50);
    }

    renderSearchResults() {
        const resultsContainer = document.getElementById(`sp-search-results-${this.windowId}`);
        if (!resultsContainer) return;

        if (!this.searchQuery.trim()) {
            resultsContainer.innerHTML = `
                <div class="spotify-empty-state" style="padding: 60px 20px;">
                    <span style="font-size: 28px; margin-bottom: 12px; display: block;">🔍</span>
                    <strong>Search Spotify</strong><br><br>
                    Find your favorite songs, artists, or playlists.
                </div>
            `;
            return;
        }

        const query = this.searchQuery.toLowerCase();

        // 1. Filter playlists
        const matchedPlaylists = this.playlists.filter(pl => 
            pl.name.toLowerCase().includes(query) || 
            pl.description.toLowerCase().includes(query)
        );

        // 2. Filter songs across all playlists
        const matchedSongs = [];
        const seenSongIds = new Set();
        this.playlists.forEach(pl => {
            pl.songs.forEach(song => {
                if (!seenSongIds.has(song.id)) {
                    if (song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)) {
                        seenSongIds.add(song.id);
                        matchedSongs.push(song);
                    }
                }
            });
        });

        if (matchedPlaylists.length === 0 && matchedSongs.length === 0) {
            resultsContainer.innerHTML = `
                <div class="spotify-empty-state" style="padding: 60px 20px;">
                    No results found for "${this.searchQuery}".<br>
                    Make sure everything is spelled correctly.
                </div>
            `;
            return;
        }

        let html = '';

        // Render matching playlists
        if (matchedPlaylists.length > 0) {
            html += `
                <h2 style="font-size: 8px; color: #aaa; text-transform: uppercase; margin: 16px 0 12px; font-family: var(--font-ui);">Playlists</h2>
                <div class="spotify-grid" id="sp-search-playlists-grid-${this.windowId}"></div>
            `;
        }

        // Render matching songs
        if (matchedSongs.length > 0) {
            html += `
                <h2 style="font-size: 8px; color: #aaa; text-transform: uppercase; margin: 24px 0 12px; font-family: var(--font-ui);">Songs</h2>
                <div id="sp-search-songs-list-${this.windowId}"></div>
            `;
        }

        resultsContainer.innerHTML = html;

        // Render playlists grid
        if (matchedPlaylists.length > 0) {
            const grid = document.getElementById(`sp-search-playlists-grid-${this.windowId}`);
            matchedPlaylists.forEach(pl => {
                const card = document.createElement('div');
                card.className = 'spotify-card';
                const collageHTML = this.generateCollageHTML(pl, false);
                card.innerHTML = `
                    ${collageHTML}
                    <div class="spotify-card-name">${pl.name}</div>
                    <div class="spotify-card-desc">${pl.description}</div>
                `;
                card.addEventListener('click', () => {
                    SoundCard.playClick();
                    this.showPlaylist(pl.id);
                });
                grid.appendChild(card);
            });
        }

        // Render songs table
        if (matchedSongs.length > 0) {
            this.renderSongsTable(matchedSongs, `sp-search-songs-list-${this.windowId}`);
        }
    }

    renderAllSongs() {
        const workspace = document.getElementById(`spotify-workspace-${this.windowId}`);
        
        // Compile all unique songs across all playlists
        const allUniqueSongs = [];
        const seenIds = new Set();

        this.playlists.forEach(pl => {
            pl.songs.forEach(song => {
                if (!seenIds.has(song.id)) {
                    seenIds.add(song.id);
                    allUniqueSongs.push(song);
                }
            });
        });

        workspace.innerHTML = `
            <div class="spotify-workspace-header">
                <h1 style="font-size: 11px; font-family: var(--font-ui); color: #fff;">Your Songs</h1>
                <div style="font-size: 8px; color: #888; font-family: var(--font-ui);">${allUniqueSongs.length} Songs</div>
            </div>
            <div id="sp-all-songs-list-${this.windowId}"></div>
        `;

        this.renderSongsTable(allUniqueSongs, `sp-all-songs-list-${this.windowId}`);
    }

    generateCollageHTML(playlist, isLarge = false) {
        const sizeClass = isLarge ? 'spotify-collage-large' : 'spotify-collage';
        const cellClass = isLarge ? 'spotify-collage-cell large' : 'spotify-collage-cell';
        const coverSongs = playlist.songs.slice(0, 4);
        
        let cells = '';
        coverSongs.forEach(song => {
            cells += `<div class="${cellClass}" style="background: ${song.bg};">${song.icon}</div>`;
        });
        
        // Fill empty slots if less than 4 songs
        while (coverSongs.length < 4) {
            cells += `<div class="${cellClass}" style="background: #282828;">🎵</div>`;
        }

        return `<div class="${sizeClass}">${cells}</div>`;
    }

    showPlaylist(playlistId) {
        this.activePlaylistId = playlistId;
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const workspace = document.getElementById(`spotify-workspace-${this.windowId}`);
        
        // Calculate total duration in seconds
        let totalSeconds = 0;
        playlist.songs.forEach(song => {
            const parts = song.duration.split(':');
            totalSeconds += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        });

        const totalMin = Math.floor(totalSeconds / 60);
        const totalSec = totalSeconds % 60;
        const durationString = `${totalMin} min ${totalSec} sec`;

        workspace.innerHTML = `
            <div class="spotify-playlist-header animated fadeIn">
                <!-- Cover Collage -->
                ${this.generateCollageHTML(playlist, true)}
                
                <!-- Metadata details -->
                <div class="spotify-playlist-info">
                    <div class="spotify-playlist-tag">PLAYLIST</div>
                    <div class="spotify-playlist-title">${playlist.name}</div>
                    <div style="font-size: 9px; color: #888; margin-top: 4px;">${playlist.description}</div>
                    <div class="spotify-playlist-meta">
                        Created by <strong>Sam</strong> • ${playlist.songs.length} songs, ${durationString}
                    </div>
                </div>
            </div>
            
            <div id="sp-songs-list-${this.windowId}"></div>
        `;

        this.renderSongsTable(playlist.songs, `sp-songs-list-${this.windowId}`);
    }

    renderSongsTable(songs, containerId) {
        const container = document.getElementById(containerId);
        let html = `
            <table class="spotify-table animated fadeIn">
                <thead>
                    <tr>
                        <th style="width: 30px; text-align: center;">#</th>
                        <th>Title</th>
                        <th>Artist</th>
                        <th style="width: 60px;">Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        songs.forEach((song, index) => {
            const isPlaying = this.activeSong && this.activeSong.id === song.id;
            html += `
                <tr class="sp-song-row ${isPlaying ? 'playing' : ''}" data-index="${index}">
                    <td style="text-align: center; color: #888;">${index + 1}</td>
                    <td>
                        <div class="spotify-song-title">
                            <div class="spotify-song-cover-mini" style="background: ${song.bg};">${song.icon}</div>
                            <span>${song.title}</span>
                        </div>
                    </td>
                    <td style="color: #aaa;">${song.artist}</td>
                    <td style="color: #888;">${song.duration}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        // Bind clicks
        container.querySelectorAll('.sp-song-row').forEach(row => {
            row.addEventListener('click', () => {
                SoundCard.playClick();
                const songIndex = parseInt(row.getAttribute('data-index'), 10);
                this.activeSongQueue = songs;
                this.queueIndex = songIndex;
                this.playSong(songs[songIndex]);
                
                // Re-render active list highlights
                this.renderSongsTable(songs, containerId);
            });
        });
    }

    playSong(song) {
        this.activeSong = song;
        this.isPlaying = true;
        this.playbackProgress = 0;

        // Parse duration seconds
        const parts = song.duration.split(':');
        this.playbackDuration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

        // Update player bottom UI details
        const details = document.getElementById(`sp-player-track-${this.windowId}`);
        details.innerHTML = `
            <div class="spotify-track-artwork" style="background: ${song.bg};">${song.icon}</div>
            <div class="spotify-track-details">
                <div class="spotify-track-title" title="${song.title}">${song.title}</div>
                <div class="spotify-track-artist" title="${song.artist}">${song.artist}</div>
            </div>
        `;

        // Update play button symbol
        document.getElementById(`sp-btn-play-${this.windowId}`).innerText = '⏸';

        // Reset timer
        if (this.playbackTimer) clearInterval(this.playbackTimer);
        
        // Start synthetic arpeggiator beat
        this.synth.start();

        this.playbackTimer = setInterval(() => {
            if (this.isPlaying) {
                this.playbackProgress++;
                if (this.playbackProgress >= this.playbackDuration) {
                    this.playbackProgress = this.playbackDuration;
                    this.nextTrack(); // Autoplay next track on finish
                } else {
                    this.updatePlayerProgressUI();
                }
            }
        }, 1000);

        this.updatePlayerProgressUI();
    }

    togglePlayback() {
        if (!this.activeSong) return;
        
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById(`sp-btn-play-${this.windowId}`);
        
        if (this.isPlaying) {
            playBtn.innerText = '⏸';
            this.synth.start();
        } else {
            playBtn.innerText = '▶';
            this.synth.stop();
        }
    }

    prevTrack() {
        if (this.activeSongQueue.length === 0) return;
        
        this.queueIndex--;
        if (this.queueIndex < 0) {
            this.queueIndex = this.activeSongQueue.length - 1;
        }
        this.playSong(this.activeSongQueue[this.queueIndex]);
        this.refreshActiveViews();
    }

    nextTrack() {
        if (this.activeSongQueue.length === 0) return;

        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.activeSongQueue.length);
        } else {
            this.queueIndex++;
            if (this.queueIndex >= this.activeSongQueue.length) {
                if (this.isRepeat) {
                    this.queueIndex = 0;
                } else {
                    this.queueIndex = this.activeSongQueue.length - 1;
                    this.isPlaying = false;
                    this.synth.stop();
                    document.getElementById(`sp-btn-play-${this.windowId}`).innerText = '▶';
                    return;
                }
            }
        }
        this.playSong(this.activeSongQueue[this.queueIndex]);
        this.refreshActiveViews();
    }

    updatePlayerProgressUI() {
        const progressFill = document.getElementById(`sp-progress-fill-${this.windowId}`);
        const currentTimeLabel = document.getElementById(`sp-time-current-${this.windowId}`);
        const durationTimeLabel = document.getElementById(`sp-time-duration-${this.windowId}`);

        // Math ratios
        const ratio = this.playbackDuration > 0 ? (this.playbackProgress / this.playbackDuration) * 100 : 0;
        progressFill.style.width = `${ratio}%`;

        // Format labels
        const formatTime = (totalSec) => {
            const m = Math.floor(totalSec / 60);
            const s = String(totalSec % 60).padStart(2, '0');
            return `${m}:${s}`;
        };

        currentTimeLabel.innerText = formatTime(this.playbackProgress);
        durationTimeLabel.innerText = formatTime(this.playbackDuration);
    }

    refreshActiveViews() {
        // Force refresh current grid or lists to show playing color highlights
        if (this.activePlaylistId) {
            this.showPlaylist(this.activePlaylistId);
        } else if (this.activeCategory === 'songs') {
            this.renderAllSongs();
        } else if (this.activeCategory === 'browse') {
            this.renderTopTracks2015();
        }
    }

    destroy() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
        }
        this.synth.stop();
    }
}

// Inject Spotify application styles dynamically
if (!document.getElementById('spotify-app-styles')) {
    const style = document.createElement('style');
    style.id = 'spotify-app-styles';
    style.innerHTML = `
        .spotify-container {
            display: flex;
            width: 100%;
            height: 100%;
            background-color: #121212;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            box-shadow: inset 0px 0px 4px #000;
        }
        .spotify-sidebar {
            width: 140px;
            background-color: #070707;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding-top: 10px;
            border-right: 1.5px solid #1a1a1a;
        }
        .spotify-profile {
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1.5px solid #141414;
            margin-bottom: 8px;
        }
        .spotify-avatar {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #1ed760;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: bold;
            color: #000;
            font-family: var(--font-ui);
        }
        .spotify-username {
            font-size: 8px;
            font-weight: bold;
            font-family: var(--font-ui);
            color: #fff;
        }
        .spotify-nav {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .spotify-nav-item {
            padding: 10px 14px;
            cursor: pointer;
            font-size: 8px;
            color: #aaaaaa;
            font-family: var(--font-ui);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.15s;
        }
        .spotify-nav-item:hover, .spotify-nav-item.active {
            color: #ffffff;
        }
        .spotify-nav-item.active {
            border-left: 3px solid #1ed760;
            background-color: #121212;
        }
        .spotify-sidebar-header {
            font-size: 7px;
            color: #666666;
            padding: 14px 14px 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: var(--font-ui);
        }
        .spotify-playlist-list {
            list-style: none;
            padding: 4px 0;
            overflow-y: auto;
            flex: 1;
        }
        .spotify-playlist-item {
            padding: 8px 14px;
            cursor: pointer;
            font-size: 8px;
            color: #aaaaaa;
            font-family: var(--font-ui);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.15s;
        }
        .spotify-playlist-item:hover {
            color: #ffffff;
        }
        .spotify-playlist-item.active {
            color: #1ed760;
        }
        .spotify-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: #121212;
            overflow: hidden;
            position: relative;
        }
        .spotify-workspace {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        .spotify-workspace-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            border-bottom: 1.5px solid #1c1c1c;
            padding-bottom: 10px;
        }
        .spotify-search-box {
            display: flex;
            align-items: center;
            background-color: #ffffff;
            border-radius: 12px;
            padding: 4px 10px;
            width: 160px;
            box-shadow: inset 1px 1px 2px rgba(0,0,0,0.3);
        }
        .spotify-search-input {
            border: none;
            outline: none;
            width: 100%;
            font-size: 9px;
            color: #000000;
            font-family: monospace;
            background: transparent;
        }
        .spotify-collage {
            width: 90px;
            height: 90px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            background-color: #282828;
            overflow: hidden;
            box-shadow: 2px 4px 10px rgba(0,0,0,0.6);
            flex-shrink: 0;
            border: 1px solid #1a1a1a;
        }
        .spotify-collage-large {
            width: 130px;
            height: 130px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            background-color: #282828;
            overflow: hidden;
            box-shadow: 4px 8px 20px rgba(0,0,0,0.7);
            flex-shrink: 0;
            border: 1.5px solid #1a1a1a;
        }
        .spotify-collage-cell {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        .spotify-collage-cell.large {
            font-size: 24px;
        }
        .spotify-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 16px;
        }
        .spotify-card {
            background-color: #181818;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
        }
        .spotify-card:hover {
            background-color: #282828;
        }
        .spotify-card-name {
            font-size: 9px;
            font-weight: bold;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .spotify-card-desc {
            font-size: 8px;
            color: #888888;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .spotify-playlist-header {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1.5px solid #1c1c1c;
        }
        .spotify-playlist-info {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 6px;
        }
        .spotify-playlist-tag {
            font-size: 7px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #aaaaaa;
            font-family: var(--font-ui);
        }
        .spotify-playlist-title {
            font-size: 16px;
            font-weight: bold;
            color: #ffffff;
        }
        .spotify-playlist-meta {
            font-size: 8px;
            color: #aaaaaa;
            font-family: var(--font-ui);
            margin-top: 4px;
        }
        .spotify-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .spotify-table th, .spotify-table td {
            padding: 8px;
            text-align: left;
            font-size: 9px;
        }
        .spotify-table th {
            color: #666666;
            border-bottom: 1.5px solid #1c1c1c;
            font-family: var(--font-ui);
            font-size: 8px;
        }
        .spotify-table tr {
            border-bottom: 1px solid #161616;
            cursor: pointer;
        }
        .spotify-table tr:hover {
            background-color: #1a1a1a;
        }
        .spotify-table tr.playing {
            color: #1ed760;
        }
        .spotify-table tr.playing td {
            color: #1ed760 !important;
        }
        .spotify-song-title {
            font-weight: bold;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .spotify-song-cover-mini {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border-radius: 2px;
            box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            flex-shrink: 0;
        }
        .spotify-song-artist {
            color: #aaaaaa;
        }
        .spotify-player {
            height: 58px;
            background-color: #282828;
            border-top: 1.5px solid #1c1c1c;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 100;
            flex-shrink: 0;
            box-shadow: 0 -4px 10px rgba(0,0,0,0.5);
        }
        .spotify-track-info {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 160px;
        }
        .spotify-track-artwork {
            width: 34px;
            height: 34px;
            background-color: #121212;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border-radius: 2px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.6);
            flex-shrink: 0;
            border: 1px solid #333;
        }
        .spotify-track-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
        }
        .spotify-track-title {
            font-size: 9px;
            font-weight: bold;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .spotify-track-artist {
            font-size: 8px;
            color: #888888;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .spotify-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            flex: 1;
            max-width: 320px;
        }
        .spotify-control-buttons {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .spotify-control-btn {
            background: transparent;
            border: none;
            color: #aaaaaa;
            cursor: pointer;
            font-size: 10px;
            outline: none;
            transition: color 0.15s;
        }
        .spotify-control-btn:hover {
            color: #ffffff;
        }
        .spotify-control-btn.active {
            color: #1ed760;
        }
        .spotify-control-btn.play {
            font-size: 12px;
            color: #000;
            background-color: #fff;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .spotify-control-btn.play:hover {
            color: #000;
            transform: scale(1.06);
        }
        .spotify-progress-bar-container {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
        }
        .spotify-time-label {
            font-size: 8px;
            color: #888888;
            width: 28px;
            text-align: center;
        }
        .spotify-progress-track {
            flex: 1;
            height: 4px;
            background-color: #404040;
            border-radius: 2px;
            position: relative;
            cursor: pointer;
        }
        .spotify-progress-track:hover .spotify-progress-fill {
            background-color: #1ed760;
        }
        .spotify-progress-fill {
            height: 100%;
            background-color: #aaaaaa;
            border-radius: 2px;
            width: 0%;
        }
        .spotify-volume-container {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100px;
        }
        .spotify-volume-icon {
            font-size: 10px;
            color: #aaaaaa;
            cursor: pointer;
            width: 14px;
            text-align: center;
        }
        .spotify-volume-icon:hover {
            color: #fff;
        }
        .spotify-volume-slider-track {
            flex: 1;
            height: 4px;
            background-color: #404040;
            border-radius: 2px;
            position: relative;
            cursor: pointer;
        }
        .spotify-volume-slider-fill {
            height: 100%;
            background-color: #1ed760;
            border-radius: 2px;
            width: 80%;
        }
        .spotify-empty-state {
            text-align: center;
            color: #888888;
            padding: 40px;
            font-size: 8px;
            font-family: var(--font-ui);
        }
    `;
    document.head.appendChild(style);
}

// Register Spotify App in WIMP Layer
SystemOS.registerApp('spotify', (params) => {
    // Determine size - set to 730x510 to match scaled layout size
    const win = SystemOS.createWindow('spotify', 'Spotify', '📻', 730, 510, {
        onClose: () => {
            if (win.spotifyInstance) {
                win.spotifyInstance.destroy();
            }
        }
    });

    if (!win.spotifyInstance) {
        win.spotifyInstance = new SpotifyApp('spotify');
    }
});
