// Administrative Security Check
const Admin = {
    isAdmin() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            return true;
        }
        return sessionStorage.getItem('win93_admin') === 'true';
    },

    requestAuth() {
        const password = prompt("🔒 ADMINISTRATIVE SECURITY CHALLENGE\nEnter Administrator Password to modify files:");
        if (password === "admin93" || password === "win93") {
            sessionStorage.setItem('win93_admin', 'true');
            if (typeof SoundCard !== 'undefined' && SoundCard.playChord) {
                SoundCard.playChord([523.25, 659.25, 783.99, 1046.50], 0.35, 'sine'); // Success chime: C5-E5-G5-C6
            }
            return true;
        } else {
            if (password !== null) {
                if (typeof SoundCard !== 'undefined' && SoundCard.playError) {
                    SoundCard.playError();
                }
                setTimeout(() => {
                    if (typeof SystemOS !== 'undefined' && SystemOS.showErrorDialog) {
                        SystemOS.showErrorDialog("Access Denied: Invalid administrative credentials. File write/delete operations aborted.", "Access Denied");
                    } else {
                        alert("Access Denied: Invalid administrator password.");
                    }
                }, 100);
            }
            return false;
        }
    }
};

const VFS = {
    storageKey: 'win93_vfs',
    tree: null,

    // Initial default layout
    defaultVFS: {
        "type": "dir",
        "children": {
            "welcome.txt": {
                "type": "file",
                "content": "===============================================\n* WELCOME TO THE WINDOWS 93 CODE DESKTOP *\n===============================================\n\nThis is an interactive retro operating system replica.\nEverything runs entirely in your browser using pure web tech!\n\nKEY FEATURES:\n- persistent Virtual File System (VFS)\n- My Documents explorer (browse, create, delete)\n- CodeMan editor (add and save files at will!)\n- Retro Shell (type 'help' to get list of commands)\n- Paint App (make pixelated drawing masterpieces)\n- Web Audio retro synthesizer sound card\n\nTry writing some custom scripts in My Documents and\nrunning them from the Retro Shell using: run <filename>\n\nDouble click any icon on the desktop to start exploring!\n"
            },
            "system": {
                "type": "dir",
                "children": {
                    "matrix.js": {
                        "type": "file",
                        "content": "// Retro shell screen effect: Matrix cascade\nterminal.write('--- STARTING QUANTUM TRANSISTOR SIMULATION ---', 'success');\nlet count = 0;\nconst interval = setInterval(() => {\n    if (count > 25) {\n        clearInterval(interval);\n        terminal.write('--- QUANTUM CACHE COMPLETED ---', 'success');\n        return;\n    }\n    let line = '';\n    for(let i=0; i<45; i++) {\n        line += Math.random() > 0.5 ? '1' : '0';\n    }\n    terminal.write(line);\n    count++;\n}, 100);"
                    },
                    "beep.js": {
                        "type": "file",
                        "content": "// Sound card test: Synth Arpeggio beep test\nterminal.write('[*] Initializing oscillator voice coils...', 'warn');\nSoundCard.playChord([261.63, 329.63, 392.00, 523.25], 0.4, 'sawtooth');\nsetTimeout(() => {\n    SoundCard.playChord([293.66, 349.23, 440.00, 587.33], 0.4, 'square');\n    terminal.write('[+] Playback complete! 8-bit sound chip OK.', 'success');\n}, 500);"
                    },
                    "system.conf": {
                        "type": "file",
                        "content": "os_name=WINDOWS_93\nos_version=1.0.3\nkernel=BI-STABLE_PARADISE_v0.9\nsound_channels=4\nvideo_crt=TRUE\nnetwork_bypass=FALSE\n"
                    }
                }
            },
            "documents": {
                "type": "dir",
                "children": {
                    "hello.js": {
                        "type": "file",
                        "content": "// Welcome to CodeMan Script Editor!\n// Edit this file and run it inside the Retro Terminal\nterminal.write('=======================================', 'success');\nterminal.write(' HELLO WORLD SCRIPT ACTIVATED! ', 'success');\nterminal.write('=======================================', 'success');\nterminal.write('Host platform specs loaded.', 'warn');\nterminal.write('Terminal user identified as Administrator.');\n"
                    },
                    "notes.txt": {
                        "type": "file",
                        "content": "- Buy synth cartridges\n- Defragment CRT scanner\n- Inject more retro virus joke scripts\n- Refactor double bevel shadows\n"
                    },
                    "sam_secrets": {
                        "type": "dir",
                        "children": {
                            "stanford_admission.txt": {
                                "type": "file",
                                "content": "EMAIL: stanford_admit.eml\nFrom: admissions@stanford.edu\nDate: May 12, 2020\nTo: samrudh.sharma@amarillohigh.edu\n\nDear Samrudh,\nCongratulations! I am thrilled to inform you that you have been admitted to the Stanford University Class of 2024. Your outstanding academic record, combined with your pioneering research proposal in Neural Engineering, made you a standout candidate. We are proud to offer you a spot in our undergraduate program.\nWelcome to Stanford!\n"
                            },
                            "ielts_report.txt": {
                                "type": "file",
                                "content": "EMAIL: ielts_report.eml\nFrom: results@ieltsessentials.com\nDate: May 5, 2020\nTo: samrudh.sharma@amarillohigh.edu\n\nDear Candidate,\nYour IELTS Academic test results are now available. You have achieved your highest target score:\n• Listening: 9.0     • Reading: 9.0\n• Writing: 8.0      • Speaking: 8.5\n----------------------------------\n• OVERALL BAND SCORE: 8.5 (Expert User)\nThis score fulfills the English proficiency requirements for all top-tier international institutions, including Stanford University.\n"
                            },
                            "prom_night_draft.txt": {
                                "type": "file",
                                "content": "EMAIL DRAFT: draft_prom_night.eml\nTo: emma.j@amarillohigh.edu\nDate: June 9, 2020\nStatus: UNSENT DRAFT\n\nI am writing this from my bedroom floor. My hands are still shaking. Tonight was supposed to be the best night. I spent weeks preparing everything perfectly. I convinced my parents about my outfit. I wore a modern suit to fit in. I thought Emma wanted to go with me. I was so completely wrong.\nWe stood near the dance floor. Her friends walked over. I tried to make a joke. Emma looked at them and sneered. She mocked my dancing and my voice. She said I looked desperate asking her.\nThe guys walked up. They saw Emma leading the mockery. They joined in instantly. They tossed around old insults. They called me \"Stinky Sam.\"\nThe worst part was Emma. She laughed right along with them.\nEveryone around us was watching. People recorded it on their phones.\nA massive lump formed in my throat. The first tear slipped out.\nOne of the guys pointed it out to everyone.\nI could not take it anymore. I turned around and walked out. I was crying openly. I felt completely humiliated. I walked home in the dark.\nI have never felt so alone.\n"
                            },
                            "therapy_log.txt": {
                                "type": "file",
                                "content": "LOG: therapy_session.log\nDate: October 12, 2020\nClinician: Dr. Aris\n\nPatient Samrudh Sharma (Age 15) exhibits deep symptoms of isolation and emotional neglect. Since his relocation, his primary attachment was his dog, Buddy, whose recent passing triggered a severe depressive state.\nKey Observation: When asked about his outlook on the future, he repeatedly stated that his isolation and academic pressure make his withdrawal feel \"inevitable\".\n"
                            }
                        }
                    }
                }
            },
            "trash": {
                "type": "dir",
                "children": {}
            }
        }
    },

    // Initialize VFS
    init() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                this.tree = JSON.parse(raw);
                if (this.tree.children && this.tree.children.documents && this.tree.children.documents.children && !this.tree.children.documents.children.sam_secrets) {
                    this.tree.children.documents.children.sam_secrets = this.defaultVFS.children.documents.children.sam_secrets;
                    this.save();
                }
            } else {
                this.reset(true); // Bypass admin check for initial seeding
            }
        } catch (e) {
            console.error("VFS failed to load. Initializing fallback memory FS.", e);
            this.tree = JSON.parse(JSON.stringify(this.defaultVFS));
        }
    },

    // Save to LocalStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tree));
        } catch (e) {
            console.error("VFS save failed", e);
        }
    },

    // Reset VFS to original state
    reset(bypassAdminCheck = false) {
        if (!bypassAdminCheck && !Admin.isAdmin() && !Admin.requestAuth()) {
            return false;
        }
        this.tree = JSON.parse(JSON.stringify(this.defaultVFS));
        this.save();
        return true;
    },

    // Get VFS node by absolute path
    getNode(path) {
        if (!path || path === '/') return this.tree;
        
        // Clean path and split
        const parts = path.split('/').filter(p => p.length > 0);
        let current = this.tree;

        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    },

    // Helper to separate parent path from element name
    splitPath(path) {
        const parts = path.split('/').filter(p => p.length > 0);
        if (parts.length === 0) return { parentPath: '/', name: '' };
        
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');
        return { parentPath, name };
    },

    // Read File
    readFile(path) {
        const node = this.getNode(path);
        if (node && node.type === 'file') {
            return node.content;
        }
        return null;
    },

    // Write File (will create folder nodes if write is valid)
    writeFile(path, content) {
        if (!Admin.isAdmin() && !Admin.requestAuth()) {
            return false;
        }
        const { parentPath, name } = this.splitPath(path);
        const parent = this.getNode(parentPath);

        if (parent && parent.type === 'dir') {
            parent.children[name] = {
                type: 'file',
                content: content
            };
            this.save();
            return true;
        }
        return false;
    },

    // Create Directory
    mkdir(path) {
        if (!Admin.isAdmin() && !Admin.requestAuth()) {
            return false;
        }
        const { parentPath, name } = this.splitPath(path);
        const parent = this.getNode(parentPath);

        if (parent && parent.type === 'dir') {
            if (!parent.children[name]) {
                parent.children[name] = {
                    type: 'dir',
                    children: {}
                };
                this.save();
                return true;
            }
        }
        return false;
    },

    // Remove File/Folder (or move to trash)
    rm(path, deletePermanently = false) {
        if (!Admin.isAdmin() && !Admin.requestAuth()) {
            return false;
        }
        const { parentPath, name } = this.splitPath(path);
        const parent = this.getNode(parentPath);

        if (parent && parent.type === 'dir' && parent.children[name]) {
            const node = parent.children[name];
            
            if (!deletePermanently && parentPath !== '/trash') {
                // Move to trash
                const trash = this.getNode('/trash');
                if (trash) {
                    // Avoid overwriting trash files with same name
                    let trashName = name;
                    let counter = 1;
                    while (trash.children[trashName]) {
                        trashName = `${name}_${counter}`;
                        counter++;
                    }
                    trash.children[trashName] = node;
                }
            }
            
            delete parent.children[name];
            this.save();
            return true;
        }
        return false;
    },

    // List items inside a Directory
    readdir(path) {
        const node = this.getNode(path);
        if (node && node.type === 'dir') {
            return Object.keys(node.children).map(name => {
                return {
                    name: name,
                    type: node.children[name].type
                };
            });
        }
        return [];
    },

    exists(path) {
        return this.getNode(path) !== null;
    }
};

// Initialize VFS on load
VFS.init();
