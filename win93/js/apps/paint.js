/* --------------------------------------------------
   WINDOWS 93 Glitch Paint Application
   HTML5 Canvas drawing app parody
-------------------------------------------------- */

class GlitchPaint {
    constructor(windowId) {
        this.windowId = windowId;
        this.canvas = null;
        this.ctx = null;
        this.drawing = false;
        
        // Brush states
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.glitchMode = false;
        
        this.init();
    }

    init() {
        const contentContainer = document.getElementById(`content-${this.windowId}`);
        contentContainer.innerHTML = `
            <div class="paint-container">
                <!-- Paint Toolbar controls -->
                <div class="paint-toolbar">
                    <button class="retro-btn bevel-out" id="paint-clear-${this.windowId}">🗑️ Clear</button>
                    <button class="retro-btn bevel-out" id="paint-glitch-${this.windowId}">⚡ Glitch Mode: OFF</button>
                    <button class="retro-btn bevel-out" id="paint-save-${this.windowId}">💾 Export PNG</button>
                    
                    <span style="flex:1;"></span>
                    
                    <!-- Color Swatches -->
                    <div class="paint-color-picker" id="paint-colors-${this.windowId}">
                        <div class="paint-color-swatch active" style="background-color:#000000;" data-color="#000000"></div>
                        <div class="paint-color-swatch" style="background-color:#ff007f;" data-color="#ff007f"></div>
                        <div class="paint-color-swatch" style="background-color:#00f3ff;" data-color="#00f3ff"></div>
                        <div class="paint-color-swatch" style="background-color:#fffb00;" data-color="#fffb00"></div>
                        <div class="paint-color-swatch" style="background-color:#4af626;" data-color="#4af626"></div>
                        <div class="paint-color-swatch" style="background-color:#ffffff;" data-color="#ffffff"></div>
                    </div>
                </div>
                
                <!-- Main Canvas view area -->
                <div class="paint-canvas-area">
                    <canvas class="paint-canvas bevel-in" id="paint-canvas-${this.windowId}" width="400" height="260"></canvas>
                </div>
            </div>
        `;

        this.canvas = document.getElementById(`paint-canvas-${this.windowId}`);
        this.ctx = this.canvas.getContext('2d');
        
        // Fill canvas with white on start
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.bindEvents();
    }

    bindEvents() {
        // Clear Canvas
        document.getElementById(`paint-clear-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });

        // Glitch Mode Toggle
        const glitchBtn = document.getElementById(`paint-glitch-${this.windowId}`);
        glitchBtn.addEventListener('click', () => {
            SoundCard.playClick();
            this.glitchMode = !this.glitchMode;
            glitchBtn.innerText = this.glitchMode ? '⚡ Glitch Mode: ON' : '⚡ Glitch Mode: OFF';
            glitchBtn.classList.toggle('active');
            
            if (this.glitchMode) {
                // Apply a random canvas pixel shift!
                SoundCard.playError();
                const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const data = imgData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() > 0.95) {
                        data[i] = 255 - data[i];     // Invert red
                        data[i+1] = 255 - data[i+1]; // Invert green
                        data[i+2] = 255 - data[i+2]; // Invert blue
                    }
                }
                this.ctx.putImageData(imgData, 0, 0);
            }
        });

        // Save / Export PNG
        document.getElementById(`paint-save-${this.windowId}`).addEventListener('click', () => {
            SoundCard.playClick();
            const link = document.createElement('a');
            link.download = 'win93_glitch_art.png';
            link.href = this.canvas.toDataURL();
            link.click();
        });

        // Color clicks
        document.querySelectorAll(`#paint-colors-${this.windowId} .paint-color-swatch`).forEach(sw => {
            sw.addEventListener('click', () => {
                SoundCard.playClick();
                document.querySelectorAll(`#paint-colors-${this.windowId} .paint-color-swatch`).forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                this.currentColor = sw.getAttribute('data-color');
            });
        });

        // Canvas Drawing Events
        this.canvas.addEventListener('mousedown', (e) => {
            this.drawing = true;
            this.ctx.beginPath();
            const coords = this.getCanvasCoords(e);
            this.ctx.moveTo(coords.x, coords.y);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.drawing) return;
            const coords = this.getCanvasCoords(e);
            
            if (this.glitchMode) {
                // draw random colored rectangular noise blocks!
                this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
                this.ctx.fillRect(coords.x - 10, coords.y - 10, 20, 20);
                
                // Audio clicking noise arpeggiation
                if (Math.random() > 0.9) {
                    SoundCard.playClick();
                }
            } else {
                this.ctx.lineTo(coords.x, coords.y);
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }
        });

        const stopDrawing = () => {
            this.drawing = false;
        };
        this.canvas.addEventListener('mouseup', stopDrawing);
        this.canvas.addEventListener('mouseleave', stopDrawing);
    }

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Return relative coordinate mapping
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

// Register paint application inside OS WIMP workspace
SystemOS.registerApp('paint', () => {
    const win = SystemOS.createWindow('paint', 'Glitch Paint', '🎨', 460, 370);
    
    if (!win.paintInstance) {
        win.paintInstance = new GlitchPaint('paint');
    }
});
