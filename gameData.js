// ==========================================================================
// PROJECT REWIND // SECURE BACKEND GAME DATA AND CONFIGURATION
// ==========================================================================

const scenarios = [
        [ // Scenario 0
            { id: 'misplaced-drawing', startRoom: 10, left: '40%', top: '50%' },
            { id: 'misplaced-gift', startRoom: 10, left: '70%', top: '72%' },
            { id: 'misplaced-block', startRoom: 15, left: '12%', top: '38%' },
            { id: 'misplaced-apology', startRoom: 5, left: '15%', top: '68%' },
            { id: 'misplaced-texts', startRoom: 15, left: '30%', top: '68%' },
            { id: 'misplaced-trip-form', startRoom: 15, left: '50%', top: '58%' },
            { id: 'misplaced-graduation-album', startRoom: 5, left: '65%', top: '74%' },
            { id: 'misplaced-visa-form', startRoom: 10, left: '15%', top: '85%' },
            { id: 'misplaced-chemistry-kit', startRoom: 10, left: '60%', top: '80%' }
        ],
        [ // Scenario 1
            { id: 'misplaced-drawing', startRoom: 15, left: '55%', top: '66%' },
            { id: 'misplaced-gift', startRoom: 15, left: '70%', top: '58%' },
            { id: 'misplaced-block', startRoom: 10, left: '15%', top: '85%' },
            { id: 'misplaced-apology', startRoom: 15, left: '12%', top: '38%' },
            { id: 'misplaced-texts', startRoom: 5, left: '15%', top: '68%' },
            { id: 'misplaced-trip-form', startRoom: 5, left: '65%', top: '74%' },
            { id: 'misplaced-graduation-album', startRoom: 10, left: '40%', top: '50%' },
            { id: 'misplaced-visa-form', startRoom: 10, left: '70%', top: '72%' },
            { id: 'misplaced-chemistry-kit', startRoom: 5, left: '28%', top: '62%' }
        ],
        [ // Scenario 2
            { id: 'misplaced-drawing', startRoom: 15, left: '30%', top: '68%' },
            { id: 'misplaced-gift', startRoom: 10, left: '60%', top: '80%' },
            { id: 'misplaced-block', startRoom: 15, left: '50%', top: '58%' },
            { id: 'misplaced-apology', startRoom: 5, left: '65%', top: '74%' },
            { id: 'misplaced-texts', startRoom: 5, left: '28%', top: '62%' },
            { id: 'misplaced-trip-form', startRoom: 15, left: '70%', top: '58%' },
            { id: 'misplaced-graduation-album', startRoom: 5, left: '15%', top: '68%' },
            { id: 'misplaced-visa-form', startRoom: 10, left: '50%', top: '40%' },
            { id: 'misplaced-chemistry-kit', startRoom: 10, left: '15%', top: '85%' }
        ]
    ];

const crayonSVGs = {
        'family': `
            <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <rect width="150" height="150" fill="white"/>
                <text x="15" y="25" font-family="Caveat" font-size="14" fill="#333" font-weight="bold">MY FAMILY</text>
                
                <!-- Distant parents drawn small -->
                <!-- Mother -->
                <circle cx="25" cy="100" r="8" fill="none" stroke="#e63946" stroke-width="2"/>
                <circle cx="22" cy="98" r="0.8" fill="#e63946"/>
                <circle cx="28" cy="98" r="0.8" fill="#e63946"/>
                <path d="M22,103 Q25,105 28,103" fill="none" stroke="#e63946" stroke-width="1"/>
                <polygon points="25,108 17,128 33,128" fill="none" stroke="#e63946" stroke-width="1.5"/>
                <path d="M21,128 L19,138" fill="none" stroke="#e63946" stroke-width="1.5"/>
                <path d="M29,128 L31,138" fill="none" stroke="#e63946" stroke-width="1.5"/>
                <path d="M20,113 Q12,110 10,118" fill="none" stroke="#e63946" stroke-width="1.5"/>
                <path d="M30,113 Q38,110 40,118" fill="none" stroke="#e63946" stroke-width="1.5"/>
                
                <!-- Father -->
                <circle cx="48" cy="102" r="7" fill="none" stroke="#1d3557" stroke-width="2"/>
                <circle cx="45" cy="100" r="0.8" fill="#1d3557"/>
                <circle cx="51" cy="100" r="0.8" fill="#1d3557"/>
                <path d="M45,105 Q48,107 51,105" fill="none" stroke="#1d3557" stroke-width="1"/>
                <rect x="42" y="109" width="12" height="18" fill="none" stroke="#1d3557" stroke-width="1.5"/>
                <path d="M45,127 L43,138" fill="none" stroke="#1d3557" stroke-width="1.5"/>
                <path d="M51,127 L53,138" fill="none" stroke="#1d3557" stroke-width="1.5"/>
                <path d="M42,114 Q34,111 32,119" fill="none" stroke="#1d3557" stroke-width="1.5"/>
                <path d="M54,114 Q62,111 64,119" fill="none" stroke="#1d3557" stroke-width="1.5"/>
                
                <!-- Sam drawn large and isolated -->
                <circle cx="105" cy="80" r="16" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Eyes -->
                <circle cx="99" cy="76" r="1.5" fill="#457b9d"/>
                <circle cx="111" cy="76" r="1.5" fill="#457b9d"/>
                <!-- Mouth -->
                <path d="M98,85 Q105,92 112,85" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Hair -->
                <path d="M93,68 L96,62 L100,66 L105,60 L110,66 L114,62 L117,68" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Shirt -->
                <polygon points="105,96 85,125 125,125" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Legs -->
                <path d="M98,125 L93,143" fill="none" stroke="#457b9d" stroke-width="2"/>
                <path d="M112,125 L117,143" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Arms -->
                <path d="M93,108 L78,98 L73,88" fill="none" stroke="#457b9d" stroke-width="2"/>
                <path d="M117,108 L132,98 L137,88" fill="none" stroke="#457b9d" stroke-width="2"/>
                <!-- Fingers -->
                <path d="M73,88 L68,85 M73,88 L70,82 M73,88 L75,81" fill="none" stroke="#457b9d" stroke-width="1.5"/>
                <path d="M137,88 L142,85 M137,88 L140,82 M137,88 L135,81" fill="none" stroke="#457b9d" stroke-width="1.5"/>
                
                <!-- Sun -->
                <circle cx="130" cy="25" r="10" fill="none" stroke="#e9c46a" stroke-width="2"/>
                <line x1="130" y1="10" x2="130" y2="15" stroke="#e9c46a" stroke-width="1.5"/>
                <line x1="130" y1="35" x2="130" y2="40" stroke="#e9c46a" stroke-width="1.5"/>
                <line x1="115" y1="25" x2="120" y2="25" stroke="#e9c46a" stroke-width="1.5"/>
                <line x1="140" y1="25" x2="145" y2="25" stroke="#e9c46a" stroke-width="1.5"/>
            </svg>`,
        'house': `
            <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <rect width="150" height="150" fill="white"/>
                <polygon points="30,95 75,55 120,95" fill="none" stroke="#e76f51" stroke-width="3"/>
                <rect x="45" y="95" width="60" height="50" fill="none" stroke="#e76f51" stroke-width="3"/>
                <rect x="67" y="115" width="16" height="30" fill="none" stroke="#e76f51" stroke-width="2"/>
                <!-- Single child outside alone -->
                <circle cx="15" cy="115" r="6" fill="none" stroke="#264653" stroke-width="2"/>
                <line x1="15" y1="121" x2="15" y2="140" stroke="#264653" stroke-width="2"/>
            </svg>`,
        'sun': `
            <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <rect width="150" height="150" fill="white"/>
                <circle cx="125" cy="30" r="16" fill="none" stroke="#e9c46a" stroke-width="3"/>
                <path d="M25,140 C45,100 45,100 45,140" stroke="green" stroke-width="2.5"/>
                <circle cx="35" cy="90" r="20" fill="none" stroke="green" stroke-width="2"/>
                <!-- Lonely child under tree -->
                <circle cx="95" cy="115" r="7" fill="none" stroke="blue" stroke-width="2"/>
                <line x1="95" y1="122" x2="95" y2="142" stroke="blue" stroke-width="2"/>
            </svg>`
    };

const pictureBookPages = [
        {
            left: "Once upon a time, there was a little boy named Sam. Sam loved to run and jump in the tall green grass.",
            right: "But most of all, Sam loved his best friend in the whole world—a happy little puppy named Buddy."
        },
        {
            left: "Buddy had short orange legs and floppy ears. Whenever Sam was sad, Buddy would lick his nose and bark happily.",
            right: "'Don't worry, Sam!' Buddy's barks seemed to say. 'We will go on a grand adventure together!'"
        },
        {
            left: "They built big castles out of blocks and chased invisible monsters in the garden under the warm gold sun.",
            right: "Sam was never lonely, because as long as Buddy was by his side, they could conquer the entire universe."
        }
    ];

const dvdVideos = {
        'dvd-1': {
            title: 'Minecraft Walkthrough (Alone) - 2015',
            desc: 'Cheerful blocky survival gameplay walkthrough. Sam builds a small wooden survival home alone under a square sun.',
            status: 'Survival Mode: Day 3. Building a shelter.'
        },
        'dvd-2': {
            title: 'Elaborate Fortress Showcase (Alone) - 2015',
            desc: 'Cheery lofi gaming music. Sam proudly tours a massive cobblestone castle with redstone doors and a quiet virtual dog. Still alone in the game world.',
            status: 'Fortress Complete. Showing the watchtower.'
        },
        'dvd-3': {
            title: 'DO NOT WATCH (Secret Phone Clip)',
            desc: '<span style="color:#e63946; font-weight:bold;">Warning: Uncomfortable Bullying Clip.</span> Shaky phone recording of Sam being teased at school. A crowd of classmates mocks his traditional Indian lunchbox food and grabs his schoolbag, while Sam tries to smile it off.',
            status: 'Schoolyard - secret clip.'
        }
    };

const cassetteSubtitles = [
        "Is anyone there?...",
        "I'm speaking quietly because Mrs. Patel is down in the study...",
        "Sometimes... it just feels very lonely.",
        "As if I'm walking through an empty hallway while everyone else is in groups.",
        "Mum and Dad left again. Packed suitcases by the front door. 'Sorry we couldn't make it, Sam.'",
        "They forgot my high school graduation was today... Mrs. Patel signed my report slip instead.",
        "I kept trying to get their attention with my grades and projects, but it's as though they only see their business trips.",
        "I miss Buddy so much. He was the only one who sat with me and actually listened.",
        "Now it's just... completely silent here. Every single day.",
        "I just want to finish school, pack my bags, and find a place where I actually belong..."
    ];

const yearbookStudents = {
        'A': { name: "Amelia Abernathy", quote: "Dream big, shine bright!", photoColor: "#ef476f" },
        'B': { name: "Benjamin Brooks", quote: "We didn't know we were making memories, we just knew we were having fun.", photoColor: "#ffd166" },
        'C': { name: "Chloe Carter", quote: "Keep moving forward.", photoColor: "#06d6a0" },
        'D': { name: "Daniel Davis", quote: "May your coffee be strong and your Fridays short.", photoColor: "#118ab2" },
        'E': { name: "Emily Evans", quote: "Onto the next chapter!", photoColor: "#073b4c" },
        'F': { name: "Finley Fisher", quote: "Life is a journey, not a destination.", photoColor: "#ff9f1c" },
        'G': { name: "Grace Green", quote: "Quiet minds have the richest thoughts.", photoColor: "#2ec4b6" },
        'H': { name: "Henry Hughes", quote: "We made it!", photoColor: "#e71d36" },
        'I': { name: "Isabella Ingram", quote: "Always choose kindness.", photoColor: "#7209b7" },
        'J': { name: "Jack Johnson", quote: "No regrets.", photoColor: "#3f37c9" },
        'K': { 
            name: "Kanye West", 
            quote: "Football is life. Amarillo High School varsity squad, we rule this school.", 
            photoColor: "#4895ef",
            isCrumpled: true,
            photoFile: "kanye.png",
            notes: "Bystander bully - did not stop others."
        },
        'L': { name: "Lily Lawson", quote: "The best is yet to come.", photoColor: "#4cc9f0" },
        'M': { name: "Mason Miller", quote: "Sleep is for the weak.", photoColor: "#f72585" },
        'N': { name: "Noah Nelson", quote: "Peace out!", photoColor: "#70d6ff" },
        'O': { name: "Olivia Owen", quote: "Make today amazing.", photoColor: "#ff70a6" },
        'P': { name: "Penelope Parker", quote: "To infinity and beyond!", photoColor: "#ff9770" },
        'Q': { name: "Quinn Quinton", quote: "Keep it simple.", photoColor: "#ffd670" },
        'R': { name: "Ryan Reed", quote: "Thanks for the memories.", photoColor: "#e9ff70" },
        'S': { 
            name: "Samrudh Sharma", 
            quote: "Invisible is easier.", 
            photoColor: "#00b4d8",
            isSam: true,
            photoFile: "sam_15.png",
            hateComment: "GO BACK TO INDIA"
        },
        'T': { name: "Thomas Taylor", quote: "Focus on the good.", photoColor: "#c18c5d" },
        'U': { name: "Ursula Vance", quote: "Always looking up.", photoColor: "#4f5d75" },
        'V': { name: "Victoria Vane", quote: "Be yourself.", photoColor: "#ef8354" },
        'W': { 
            name: "William K.", 
            quote: "Always win. Fear is a motivator.", 
            photoColor: "#b32a2a",
            isVandalised: true,
            photoFile: "william.png",
            notes: "Sam's primary school bully."
        },
        'X': { name: "Xavier Xing", quote: "Explore everything.", photoColor: "#6a0dad" },
        'Y': { name: "Yusuf Yusuf", quote: "Live and learn.", photoColor: "#228b22" },
        'Z': { name: "Zachary Zeller", quote: "The end of a beginning.", photoColor: "#4682b4" }
    };

const WORDS_METADATA = [
  {
    number: 1,
    x: 2,
    y: 3,
    dir: "H",
    length: 8,
    encWord: "111f0e180c0f1810",
    clue: "Years later, among signatures and farewells, one name still survived the fading memories."
  },
  {
    number: 2,
    x: 1,
    y: 11,
    dir: "H",
    length: 9,
    encWord: "030606040e1a071e1f",
    clue: "A harmless name slowly turned unpleasant after one unforgettable incident followed Sam through the corridors."
  },
  {
    number: 3,
    x: 1,
    y: 13,
    dir: "H",
    length: 9,
    encWord: "18171d0507111d1117",
    clue: "A mysterious figure kept appearing in Sam’s saved game worlds. Even when Sam played alone, someone else seemed to exist. Who was it?"
  },
  {
    number: 4,
    x: 0,
    y: 7,
    dir: "H",
    length: 8,
    encWord: "03060e04030c061b",
    clue: "One name appeared repeatedly between application drafts, highlighted notes, and sleepless ambitions."
  },
  {
    number: 5,
    x: 2,
    y: 0,
    dir: "V",
    length: 15,
    encWord: "03170d0b16171d1e1c13121d1a0113",
    clue: "Speed fascinated Sam, but one champion from 2010 remained unmatched in his memories."
  },
  {
    number: 6,
    x: 9,
    y: 2,
    dir: "V",
    length: 6,
    encWord: "031d0c090011",
    clue: "Whatever Sam chased every weekend returned home covered in more mud than he did."
  },
  {
    number: 7,
    x: 7,
    y: 1,
    dir: "V",
    length: 5,
    encWord: "1917031e16",
    clue: "Among practice sheets and distant ambitions, one unfinished goal remained on Sam’s desk."
  },
  {
    number: 8,
    x: 5,
    y: 1,
    dir: "V",
    length: 5,
    encWord: "131d1d0d0c",
    clue: "A breed with a pair of pointed ears and tiny footsteps quietly became part of Sam’s happiest memories."
  }
];

const LORE_DATA = {
  'corgi-toy': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="background:#fff; max-width: 320px;">
                            <img src="buddy_puppy.png" alt="Stuffed Buddy Corgi">
                            <div class="photo-caption" style="font-family:'Caveat';">Buddy</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); line-height:1.6; max-width:480px; margin-top:10px;">
                            A cute orange stuffed corgi plush lying on Sam's pillow. The stitching is clean, and it looks carefully looked after—suggesting Sam hugged it tight every single night.
                        </p>
                    </div>`,
  'drawing-family': `
                    <div class="crayon-drawing-closeup">
                        <div class="crayon-paper">
                            ${crayonSVGs['family']}
                        </div>
                        <div class="crayon-caption">"My Family" (2010)</div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem;">
                            Sam drew his parents tiny, standing far away at the very edge of the page. Sam drew himself massive in the center, yet completely alone in a giant blank space.
                        </p>
                    </div>`,
  'drawing-house': `
                     <div class="crayon-drawing-closeup">
                         <div class="crayon-paper">
                             <img src="house_crayon.png" alt="Crayon House drawing">
                         </div>
                         <div class="crayon-caption">"Our House" (2010)</div>
                         <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem;">
                             A simple crayon drawing of a house with a red roof and square windows, drawn with wobbly lines on white paper.
                        </p>
                    </div>`,
  'drawing-dog': `
                    <div class="crayon-drawing-closeup">
                        <div class="crayon-paper">
                            <img src="buddy_crayon.png" alt="Crayon Buddy portrait">
                        </div>
                        <div class="crayon-caption">"Buddy"</div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem;">
                            Sam's hand-drawn crayon portrait of his puppy, Buddy. The letters are written in wobbly child handwriting surrounded by hand-drawn hearts.
                        </p>
                    </div>`,
  'drawing-sun': `
                    <div class="crayon-drawing-closeup">
                        <div class="crayon-paper">
                            <img src="sun_moon_crayon.png" alt="Crayon Sun & Moon drawing">
                        </div>
                        <div class="crayon-caption">"Sun & Moon"</div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem;">
                            A child's crayon drawing of a bright yellow sun on one side and a smiling crescent moon on the other side, both sharing the sky.
                        </p>
                    </div>`,
  'photo-buddy-5': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px;">
                            <img src="buddy_puppy.png" alt="Buddy puppy photo">
                            <div class="photo-caption">Buddy - 2010</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6;">
                            A shiny, prominently placed frame on the bedside table. Buddy the puppy is sitting proudly, looking directly at the camera with his tongue sticking out.
                        </p>
                    </div>`,
  'photo-parents-5': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px;">
                            <img src="family_photo.jpg" alt="Family Portrait">
                            <div class="photo-caption">Family Portrait</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6;">
                            A warm and beautiful family portrait. Sam's parents are smiling, with his mother holding baby Sam wrapped in a yellow swaddle. A rare, happy memory of their time together.
                        </p>
                    </div>`,
  'photo-birthday-5': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px;">
                            <img src="birthday_5.png" alt="My 5th Birthday (2010)" style="width: 100%; height: auto;">
                            <div class="photo-caption">My 5th Birthday (2010)</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top: 15px;">
                            Sam sitting alone at a large kitchen table with a birthday cake in front of him. There are empty chairs all around. Sam is looking at the cake and smiling.
                        </p>
                    </div>`,
  'picture-book': `
                    <div class="book-view-container">
                        <h3>"The Boy and the Corgi"</h3>
                        <div class="book-pages-wrapper" id="book-pages-wrapper">
                            <!-- Populated dynamically -->
                        </div>
                        <div class="book-controls">
                            <button class="book-btn" id="btn-prev-page">Previous</button>
                            <button class="book-btn" id="btn-next-page">Next</button>
                        </div>
                    </div>`,
  'birthday-card': `
                    <div class="handwritten-letter-container">
                        <div class="letter-sheet">
                            <p style="font-weight:bold; margin-bottom:15px;">Happy 5th Birthday Sam!</p>
                            <p style="margin-bottom:20px;">
                                Sorry we couldn't make it home tonight. Important business came up at the firm.<br>
                                We left a gift for you on the kitchen table. Be a good boy for Mrs. Patel!
                            </p>
                            <p style="text-align:right;">With love,<br>— Mum & Dad</p>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.85rem;">
                            The card sits inside a child's hand-decorated envelope, with smiley faces Sam drew himself.
                        </p>
                    </div>`,
  'toy-train': `
                    <div class="photo-closeup-container">
                        <h3>Toy Train Set</h3>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5;">
                            A pristine toy wooden train set. The tracks are laid out perfectly neat and straight—suggesting Sam played quietly and slowly alone.
                        </p>
                    </div>`,
  'building-blocks': `
                    <div class="photo-closeup-container">
                        <h3>Building Blocks</h3>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5;">
                            Wooden blocks stacked neatly in a small castle. None of them are knocked over.
                        </p>
                    </div>`,
  'toy-plush': `
                    <div class="photo-closeup-container">
                        <h3>Teddy Bear</h3>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5;">
                            A soft plush teddy bear sitting neatly on the chair. It looks almost brand new, suggesting Sam spent most of his time hugging his Buddy corgi plush instead.
                        </p>
                    </div>`,
  'tricycle': `
                    <div class="photo-closeup-container">
                        <h2 style="color:#d29e79; font-size:1.8rem; margin-bottom:15px; font-weight:500;">Little Red Tricycle</h2>
                        <p style="color:var(--text-muted); line-height:1.6; max-width:480px; text-align:center;">
                            Sam's first set of wheels. The paint is chipped from countless "adventures" down the hallway.
                        </p>
                    </div>`,
  'xylophone': `
                    <div class="photo-closeup-container">
                        <h2 style="color:#d29e79; font-size:1.8rem; margin-bottom:15px; font-weight:500;">Toy Xylophone</h2>
                        <p style="color:var(--text-muted); line-height:1.6; max-width:480px; text-align:center;">
                            A colorful xylophone. Some of the notes are severely out of tune, but it was the source of many early morning concerts.
                        </p>
                    </div>`,
  'misplaced-visa-form': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:500px;">
                            <h3 style="color:#118ab2; border-bottom-color:#118ab2;">Student Visa Renewal Form (USA - Stanford University)</h3>
                            <p style="font-size:0.95rem; line-height:1.6; margin-bottom:15px;">
                                <strong>Applicant Name:</strong> Samrudh Sharma<br>
                                <strong>Target Institution:</strong> Stanford University<br>
                                <strong>Date of Birth:</strong> 12 Oct 2005<br>
                                <strong>Date of Signing:</strong> <span style="color:#d90429; font-weight:bold;">15 May 2020</span>
                            </p>
                            <p style="font-size:0.9rem; line-height:1.5; color:#444;">
                                A highly detailed official legal document filled out in neat cursive for university admission. It also includes an IELTS preparation slip. 
                            </p>
                            <div style="border:2px solid #ccc; padding:10px; margin-top:20px; border-radius:4px; position:relative;">
                                <span style="font-family:'Caveat'; color:#444; font-size:1.4rem;">
                                    Guardian Signature: Mrs. Patel
                                </span>
                            </div>
                        </div>
                    </div>`,
  'misplaced-trip-form': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:500px; background:#fff9c4;">
                            <h3 style="color:#d90429; border-bottom-color:#d90429;">School Excursion Consent</h3>
                            <p style="font-size:0.95rem; line-height:1.6; margin-bottom:15px;">
                                <strong>Excursion:</strong> Natural History Museum<br>
                                <strong>Student:</strong> Samrudh Sharma (Grade 5)<br>
                                <strong>Date:</strong> <span style="color:#d90429; font-weight:bold;">12 Sept 2015</span>
                            </p>
                            <div style="border:2px dashed #444; padding:10px; margin-top:20px; border-radius:4px; position:relative;">
                                <span style="font-family:'Caveat'; color:#444; font-size:1.4rem;">
                                    Signed: Mrs. Patel
                                </span>
                                <p style="font-size:0.75rem; color:#888; margin-top:5px;">(Note: Parents unavailable to sign)</p>
                            </div>
                        </div>
                    </div>`,
  'photo-buddy-bed': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px;">
                            <img src="buddy.png" alt="Older Buddy corgi photo">
                            <div class="photo-caption">Buddy, older now — 2015</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:10px;">
                            Buddy the corgi, now older, lying on Sam's bed. His snout is turning slightly grey, but his winking expression is still full of character.
                        </p>
                    </div>`,
  'crt-tv-selection': `
                    <div class="tv-dvd-experience">
                        <div class="tv-large-frame">
                            <div class="tv-scanlines"></div>
                            <div class="tv-screen-large" id="tv-screen-large">
                                <!-- TV screen content loaded dynamically -->
                            </div>
                        </div>
                        <div class="tv-controls-panel">
                            <h3>Video Game Station & DVDs</h3>
                            <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.4;">
                                Put a DVD case into the player to watch a clip of Sam's life on the CRT screen.
                            </p>
                            <div class="tv-btn-slot active playing" data-dvd="dvd-1">
                                <span class="dvd-indicator-dot"></span>
                                <div>
                                    <div style="font-weight:500; font-size:0.9rem;">DVD 1: Survival House (2015)</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted);">Minecraft gameplay walkthrough</div>
                                </div>
                            </div>
                            <div class="tv-btn-slot" data-dvd="dvd-2">
                                <span class="dvd-indicator-dot"></span>
                                <div>
                                    <div style="font-weight:500; font-size:0.9rem;">DVD 2: Fortress Showcase (2015)</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted);">Minecraft base showcase</div>
                                </div>
                            </div>
                            <div class="tv-btn-slot" data-dvd="dvd-3">
                                <span class="dvd-indicator-dot"></span>
                                <div>
                                    <div style="font-weight:500; font-size:0.9rem; color:#f28482;">DVD 3: DO NOT WATCH (Bullying Clip)</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted);">Secret phone recording</div>
                                </div>
                            </div>
                        </div>
                    </div>`,
  'photo-school-10': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting">
                            <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
                                <rect width="180" height="120" fill="#ccc"/>
                                <circle cx="30" cy="50" r="10" fill="#444"/>
                                <circle cx="55" cy="48" r="10" fill="#555"/>
                                <circle cx="80" cy="52" r="10" fill="#666"/>
                                <circle cx="105" cy="50" r="10" fill="#444"/>
                                <image href="sam.png" x="135" y="40" width="30" height="36" />
                            </svg>
                            <div class="photo-caption">Amarillo Elementary School — Class 5B</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6;">
                            A school class group photo from 2015. A dense cluster of kids are laughing and hugging in the center. Samrudh is standing on the far right, slightly apart from the crowd, with a hesitant smile.
                        </p>
                    </div>`,
  'photo-festival-10': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting">
                            <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                                <rect width="140" height="140" fill="#fff5e6"/>
                                <image href="sam.png" x="35" y="20" width="70" height="84" />
                                <circle cx="45" cy="80" r="15" fill="#e76f51" opacity="0.6"/>
                                <circle cx="95" cy="85" r="18" fill="#e9c46a" opacity="0.6"/>
                            </svg>
                            <div class="photo-caption">Holi Festival 2014</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:10px;">
                            One of the rare photos where Sam looks genuinely, completely happy. He is covered in colorful Holi powder, grinning, with traditional Indian sweets in his hands.
                        </p>
                    </div>`,
  'schoolbag': `
                    <div class="schoolbag-explorer">
                        <h3>Sam's Schoolbag Contents (2015)</h3>
                        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:10px;">
                            Inside the red schoolbag are several crumpled papers and notebooks. Click on each item to examine it.
                        </p>
                        <div class="schoolbag-grid">
                            <div class="bag-item-card" data-bag-item="note-bullying">
                                <div class="bag-item-icon">📝</div>
                                <h4>Crumpled Note</h4>
                                <span style="font-size:0.75rem; color:var(--text-muted);">From a classmate</span>
                            </div>
                            <div class="bag-item-card" data-bag-item="report-card">
                                <div class="bag-item-icon">🎓</div>
                                <h4>Report Card</h4>
                                <span style="font-size:0.75rem; color:var(--text-muted);">Excellent Grades</span>
                            </div>
                            <div class="bag-item-card" data-bag-item="checklist-fitin">
                                <div class="bag-item-icon">📌</div>
                                <h4>"How to Fit In"</h4>
                                <span style="font-size:0.75rem; color:var(--text-muted);">Handwritten checklist</span>
                            </div>
                        </div>
                        <div id="schoolbag-details-view" style="margin-top:20px; width:100%; display:flex; justify-content:center;">
                            <!-- Bag item details shown here -->
                        </div>
                    </div>`,
  'math-homework': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:500px; transform:rotate(-1deg); padding: 20px;">
                            <h3 style="color:#d94040; border-bottom-color:#d94040;">Math Homework Sheet</h3>
                            <p style="font-size:0.95rem; line-height:1.6; margin-bottom:15px;">
                                <strong>School:</strong> Amarillo Elementary School<br>
                                <strong>Topic:</strong> Algebra & Fractions<br>
                                <strong>Student:</strong> Samrudh Sharma — Grade 5
                            </p>
                            <p style="font-size:0.9rem; line-height:1.5; color:#444; border:1px solid #ddd; padding:15px; background:#fafafa;">
                                Sam completed all 20 advanced equations perfectly. A large red "100% - Excellent Work!" is stamped at the top. Sam has clearly shown his brilliance in mathematics early on.
                            </p>
                            <div style="border:2px dashed red; padding:10px; margin-top:20px; border-radius:4px; position:relative;">
                                <span style="font-family:'Architects Daughter'; color:red; font-size:1.1rem; font-weight:bold;">
                                    Teacher's Note:<br>
                                    "Please ask your parents to sign this next time so I know they reviewed your grades."
                                </span>
                                <p style="font-size:0.75rem; color:#888; margin-top:5px;">(The parent signature line at the bottom remains blank)</p>
                            </div>
                        </div>
                    </div>`,
  'posters-collection': `
                    <div class="schoolbag-explorer">
                        <h3>Sam's Posters & Wall Art</h3>
                        <div class="schoolbag-grid">
                            <div class="bag-item-card" data-poster-item="minecraft">
                                <div class="bag-item-icon">🟩</div>
                                <h4>Minecraft Poster</h4>
                            </div>
                            <div class="bag-item-card" data-poster-item="football">
                                <div class="bag-item-icon">⚽</div>
                                <h4>Football Team</h4>
                            </div>
                            <div class="bag-item-card" data-poster-item="buddy">
                                <div class="bag-item-icon">🐶</div>
                                <h4>Buddy Crayon</h4>
                            </div>
                            <div class="bag-item-card" data-poster-item="herobrine">
                                <div class="bag-item-icon">👻</div>
                                <h4>Herobrine</h4>
                            </div>
                        </div>
                        <div id="poster-details-view" style="margin-top:20px; width:100%; display:flex; justify-content:center;">
                            <!-- Poster preview shown here -->
                        </div>
                    </div>`,
  'soccer-ball': `
                    <div class="photo-closeup-container">
                        <h3>Worn Soccer Ball</h3>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5;">
                            A slightly worn soccer ball resting on the floor. It looks as if it hasn't been kicked in a while, perhaps because Sam doesn't have anyone to play with.
                        </p>
                    </div>`,
  'misplaced-graduation-album': `
                    <div class="photo-closeup-container" style="max-width:600px; margin:auto;">
                        <h3 style="color:#ffd166; margin-bottom:20px; text-align:center; font-family:'Outfit';">Amarillo High School Senior Yearbook - Class of 2020</h3>
                        <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                            <!-- William K Page -->
                            <div class="photo-matting" style="max-width:240px; border-radius:0; border:2px solid #ccc; background:#fbf9f6; padding:15px; text-align:center; flex:1; min-width:200px;">
                                <h4 style="font-family:'Outfit'; margin-bottom:10px; font-size:0.9rem; color:#111;">William K.</h4>
                                <div style="width:120px; height:140px; background-image: url('william.png'); background-size: cover; background-position: center; margin:10px auto; border:1px solid #ccc; position:relative;">
                                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(230,57,70,0.15); pointer-events:none;"></div>
                                </div>
                                <p style="font-size:0.8rem; font-style:italic; color:#555; border-bottom:1px solid #ddd; padding-bottom:10px; min-height:40px; display:flex; align-items:center; justify-content:center; margin:0;">
                                    "Always win. Fear is a motivator."
                                </p>
                                <h2 style="font-family:'Architects Daughter'; color:#e63946; margin-top:10px; transform:rotate(-7deg); font-size:1.6rem; margin-bottom:0; font-weight:bold; letter-spacing:2px;">LOSER</h2>
                            </div>
                            <!-- Samrudh Sharma Page -->
                            <div class="photo-matting" style="max-width:240px; border-radius:0; border:2px solid #ccc; background:#fbf9f6; padding:15px; text-align:center; flex:1; min-width:200px;">
                                <h4 style="font-family:'Outfit'; margin-bottom:10px; font-size:0.9rem; color:#111;">Samrudh Sharma</h4>
                                <div style="width:120px; height:140px; background-image: url('sam_15.png'); background-size: cover; background-position: center; margin:10px auto; border:1px solid #ccc;"></div>
                                <p style="font-size:0.8rem; font-style:italic; color:#555; border-bottom:1px solid #ddd; padding-bottom:10px; min-height:40px; display:flex; align-items:center; justify-content:center; margin:0;">
                                    "Silence is the loudest answer."
                                </p>
                                <div style="font-size:0.75rem; color:#e63946; font-weight:bold; margin-top:10px; font-family:'Outfit';">
                                    Vote: "Most likely to disappear"
                                </div>
                            </div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:500px; font-size:0.9rem; line-height:1.6; margin:15px auto 0 auto;">
                            An Amarillo High School graduation yearbook from the year 2020. The layout displays Samrudh's profile side-by-side with William K. While Sam has angrily crossed out William's profile with 'LOSER', Sam's profile is defaced with a cruel vote calling him 'Most likely to disappear'.
                        </p>
                    </div>`,
  'bookshelf-cupboard': `
                    <div class="cupboard-explorer-layout">
                        <h3>Sam's Bookshelf</h3>
                        <p style="color:var(--text-muted); font-size:0.85rem;">
                            Click on a book to read an excerpt or browse inside.
                        </p>
                        <div class="cupboard-books-row">
                            <div class="shelf-book-item outsiders" data-book="outsiders">
                                <h5>The Outsiders</h5>
                                <span style="font-size:0.65rem; opacity:0.8; text-align:center;">S.E. Hinton</span>
                            </div>
                            <div class="shelf-book-item astronomy" data-book="astronomy">
                                <h5>Astronomy</h5>
                                <span style="font-size:0.65rem; opacity:0.8; text-align:center;">Atlas of Stars</span>
                            </div>
                            <div class="shelf-book-item yearbook" data-book="yearbook">
                                <h5>Graduation Album</h5>
                                <span style="font-size:0.65rem; opacity:0.8; text-align:center;">Class of 2020</span>
                            </div>
                            <div class="shelf-book-item journal" data-book="journal">
                                <h5>Private Journal</h5>
                                <span style="font-size:0.65rem; opacity:0.8; text-align:center; color:#e76f51;">Do Not Open</span>
                            </div>
                        </div>
                        <div id="cupboard-detail-view" style="margin-top:20px; width:100%;">
                            <!-- Loaded dynamically -->
                        </div>
                    </div>`,
  'unsent-letter': `
                    <div class="handwritten-letter-container">
                        <div class="letter-sheet age-15-style">
                            <p style="margin-bottom:15px; font-style:italic;">Dear Mum and Dad,</p>
                            <p style="margin-bottom:15px;">
                                I hope your trip to London is going well. Mrs. Patel said you might be gone for another month.
                            </p>
                            <p style="margin-bottom:15px;">
                                The weather here has been very cold. I finished my school exams yesterday. I got top grades again. Mrs. Patel signed my slip, but I left it on your study desk in case you want to see.
                            </p>
                            <p style="margin-bottom:15px;">
                                Could you... maybe come home next weekend? It has been very quiet here. I can cook dinner. You don't have to bring any gifts this time. I just want to see you.
                            </p>
                            <p style="margin-bottom:15px;">
                                Please come home.
                            </p>
                            <p style="text-align:right;">Your son,<br>— Samrudh</p>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.85rem; line-height:1.4;">
                            A heart-breakingly polite letter found tucked away in a desk drawer. It was never folded, never put in an envelope, and never sent.
                        </p>
                    </div>`,
  'photo-buddy-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="filter: saturate(0.2) sepia(0.3); max-width:320px;">
                            <img src="buddy.png" alt="Faded Buddy corgi photo">
                        </div>
                        <div style="background:#fff8eb; color:#222; font-family:'Architects Daughter'; font-size:1rem; padding:10px 20px; box-shadow:0 3px 6px rgba(0,0,0,0.1); border-radius:3px; margin-top:-20px; transform:rotate(2deg); width:200px; text-align:center;">
                            "Miss you every day."
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:15px;">
                            The original corgi photo frame from 2010 is present here on Sam's teenage desk in 2020, but the frame is worn and the photo has faded. A small handwritten sticky note is stuck to the edge. Buddy has passed away.
                        </p>
                    </div>`,
  'cassette-tape': `
                    <div class="audio-player-modal">
                        <h3>Private Audio Cassette (2020)</h3>
                        <p style="color:var(--text-muted); font-size:0.85rem; max-width:420px; line-height:1.4;">
                            A USB drive cassette labelled "DO NOT PLAY" in heavy black marker. Click Play to listen to the tape recording.
                        </p>
                        <div class="cassette-body" id="cassette-body">
                            <div class="cassette-label">
                                <span style="font-weight:bold;">SAMRUDH — PRIVATE</span>
                                <div class="cassette-reels">
                                    <div class="reel"></div>
                                    <div class="reel"></div>
                                </div>
                                <span style="text-align:right; font-size:0.65rem;">SIDE A</span>
                            </div>
                        </div>
                        <button class="btn-primary" id="btn-play-cassette" style="width:140px;">Play Tape</button>
                        <div class="player-status-message" id="cassette-subtitles">
                            <!-- Monologue subtitles appear here -->
                        </div>
                    </div>`,
  'photo-friends-15': `
                     <div class="photo-closeup-container">
                         <div class="photo-matting" style="max-width:320px; background:#fff; padding:10px; border: 2px solid #ccc; text-align: center; margin: auto;">
                             <img src="first_friends.png" alt="First Real Friends — 2020" style="width: 100%; height: auto; border-radius: 4px;">
                             <div class="photo-caption" style="font-family:'Caveat'; font-size:1.6rem; margin-top:10px;">First Real Friends — 2020</div>
                         </div>
                         <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:15px;">
                             A photo of Sam smiling widely with a small group of friends. This is the first photo across any room where Sam looks genuinely, unguardedly happy in the presence of other people.
                         </p>
                     </div>`,
  'photo-corgi-wall-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="filter: sepia(0.6) saturate(0.2); max-width:320px;">
                            <img src="buddy.png" alt="Buddy photo on wall">
                            <div class="photo-caption">Buddy</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:10px;">
                            The faded original corgi photo frame from age 5, hanging on the wall.
                        </p>
                    </div>`,
  'chemistry-kit': `
                    <div class="photo-closeup-container">
                        <h2 style="color:#d29e79; font-size:1.8rem; margin-bottom:15px; font-weight:500;">Chemistry Kit</h2>
                        <p style="color:var(--text-muted); line-height:1.6; max-width:480px; text-align:center;">
                            A dusty old chemistry kit. Sam was always fascinated by how things reacted together. It sparked a lifelong love for science.
                        </p>
                    </div>`,
  'rainy-window': `
                    <div class="photo-closeup-container">
                        <div class="bedroom-window" style="position:static; width:280px; height:400px; transform:none; border: 8px solid #222;">
                            <div class="window-glass">
                                <div class="rain-drops"></div>
                            </div>
                            <div class="window-sill">
                                <div class="dying-plant" style="bottom:10px;"></div>
                            </div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:15px;">
                            A gloomy, grey rainy day outside the window in 2020. A single dying plant sits on the windowsill—forgotten and unwatered.
                        </p>
                    </div>`,
  'wilted-plant': `
                    <div class="photo-closeup-container">
                        <h3>Wilted Plant</h3>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5;">
                            This plant used to be green and healthy. Now, it's dried out and drooping over the edge of the pot. It seems no one has watered it in months.
                        </p>
                    </div>`,
  'crayons-box': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 120" style="width:120px; height:150px; margin: auto;">
                                <!-- Box -->
                                <rect x="15" y="30" width="70" height="80" rx="5" fill="#ffd166" stroke="#111" stroke-width="3"/>
                                <!-- Crayons peeking out -->
                                <path d="M25,30 L25,15 L32,15 L32,30" fill="#e63946" stroke="#111" stroke-width="2"/>
                                <path d="M35,30 L35,10 L42,10 L42,30" fill="#2a9d8f" stroke="#111" stroke-width="2"/>
                                <path d="M45,30 L45,18 L52,18 L52,30" fill="#118ab2" stroke="#111" stroke-width="2"/>
                                <path d="M55,30 L55,12 L62,12 L62,30" fill="#f4a261" stroke="#111" stroke-width="2"/>
                                <path d="M65,30 L65,20 L72,20 L72,30" fill="#e76f51" stroke="#111" stroke-width="2"/>
                                <!-- Box Label -->
                                <rect x="25" y="55" width="50" height="30" fill="#e63946" rx="2" stroke="#111" stroke-width="2"/>
                                <text x="50" y="75" font-family="'Outfit'" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">CRAYONS</text>
                            </svg>
                            <div class="photo-caption">Crayon Box</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A box of colored crayons, most of which are broken or completely worn down. A sign of Sam's endless hours spent drawing and coloring alone in his room.
                        </p>
                    </div>`,
  'calendar-5': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 100" style="width:140px; height:140px; margin: auto;">
                                <!-- Calendar Board -->
                                <rect x="10" y="10" width="80" height="80" rx="4" fill="#f8f9fa" stroke="#222" stroke-width="3"/>
                                <rect x="10" y="10" width="80" height="25" fill="#e63946" rx="4" stroke="#222" stroke-width="3"/>
                                <text x="50" y="27" font-family="'Outfit'" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">JUNE 2010</text>
                                <!-- Grid -->
                                <line x1="10" y1="50" x2="90" y2="50" stroke="#ccc" stroke-width="1"/>
                                <line x1="10" y1="65" x2="90" y2="65" stroke="#ccc" stroke-width="1"/>
                                <line x1="10" y1="80" x2="90" y2="80" stroke="#ccc" stroke-width="1"/>
                                <line x1="30" y1="35" x2="30" y2="90" stroke="#ccc" stroke-width="1"/>
                                <line x1="50" y1="35" x2="50" y2="90" stroke="#ccc" stroke-width="1"/>
                                <line x1="70" y1="35" x2="70" y2="90" stroke="#ccc" stroke-width="1"/>
                                <!-- Red Circle around the 6th -->
                                <circle cx="40" cy="57" r="8" fill="none" stroke="#e63946" stroke-width="2"/>
                                <text x="40" y="61" font-family="'Outfit'" font-size="10" fill="#e63946" font-weight="bold" text-anchor="middle">6</text>
                            </svg>
                            <div class="photo-caption">June 6, 2010</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A colorful wall calendar showing June 2010. June 6th (Sam's birthday) has a giant red circle, but there are no other notes, parties, or reminders written on any other day.
                        </p>
                    </div>`,
  'comic-books-10': `
                    <div class="photo-closeup-container" style="max-width:400px; margin:auto;">
                        <div class="photo-matting" style="background:#fff; border:3px solid #111; padding:15px; box-shadow: 10px 10px 0 #111; text-align: center;">
                            <div style="border:4px solid #111; padding:20px; background:#e63946; font-family:'Outfit'; text-align:center; position:relative; overflow:hidden;">
                                <div style="background:#003049; color:#fff; border:3px solid #111; font-weight:bold; font-size:1.1rem; padding:5px 10px; transform:rotate(-2deg); display:inline-block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">
                                    THE AMAZING SPIDER-MAN
                                </div>
                                <div style="width:100%; height:150px; border:3px solid #111; background:#000; margin-bottom:15px; display:flex; align-items:center; justify-content:center; margin: auto; position:relative;">
                                    <!-- A spider web drawing -->
                                    <svg viewBox="0 0 100 100" style="width:100px; height:100px;">
                                        <line x1="50" y1="50" x2="10" y2="10" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="90" y2="10" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="90" y2="90" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="10" y2="90" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="50" y2="5" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="50" y2="95" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="5" y2="50" stroke="#fff" stroke-width="1"/>
                                        <line x1="50" y1="50" x2="95" y2="50" stroke="#fff" stroke-width="1"/>
                                        <!-- Spider -->
                                        <circle cx="50" cy="50" r="4" fill="#e63946"/>
                                    </svg>
                                </div>
                                <div style="font-size:0.9rem; color:#fff; font-weight:bold; border-top:2px solid #111; padding-top:10px;">
                                    Marvel Comics &bull; #1 &bull; 1963
                                </div>
                                <div style="font-size:0.8rem; color:#ffd166; margin-top:5px; font-style:italic; line-height: 1.4;">
                                    Writer: <strong>Stan Lee</strong><br>
                                    Illustrator: <strong>Steve Ditko</strong>
                                </div>
                            </div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); font-size:0.9rem; line-height:1.5; margin-top:20px;">
                            An iconic copy of "The Amazing Spider-Man" #1, written by Stan Lee and illustrated by Steve Ditko. It is one of Sam's most prized real-life comic treasures.
                        </p>
                    </div>`,
  'f1-magazine-10': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 120" style="width:120px; height:150px; margin: auto;">
                                <rect x="5" y="5" width="90" height="110" rx="4" fill="#003566" stroke="#111" stroke-width="3"/>
                                <text x="50" y="30" font-family="'Outfit'" font-size="12" fill="#ffd166" font-weight="bold" text-anchor="middle">SPEED F1</text>
                                <rect x="15" y="45" width="70" height="40" fill="#ffd166" rx="2" stroke="#111" stroke-width="2"/>
                                <path d="M20,70 Q50,55 80,70 L80,80 L20,80 Z" fill="#e63946" stroke="#111" stroke-width="1.5"/>
                                <circle cx="35" cy="78" r="6" fill="#000"/>
                                <circle cx="65" cy="78" r="6" fill="#000"/>
                                <text x="50" y="105" font-family="'Outfit'" font-size="9" fill="#fff" font-weight="bold" text-anchor="middle">2015 SEASON</text>
                            </svg>
                            <div class="photo-caption">F1 Magazine 2015</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A Formula 1 racing magazine from 2015. There's a highlighted article about champion drivers and their speed. Sam dreamed of racing cars to escape his quiet life.
                        </p>
                    </div>`,
  'gown-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 120" style="width:120px; height:150px; margin: auto;">
                                <!-- Gown -->
                                <path d="M30,40 L20,110 L80,110 L70,40 Z" fill="#001845" stroke="#111" stroke-width="2"/>
                                <path d="M48,40 L48,110" stroke="#ffd166" stroke-width="2"/>
                                <!-- Cap -->
                                <polygon points="50,15 80,25 50,35 20,25" fill="#001845" stroke="#111" stroke-width="2"/>
                                <rect x="42" y="27" width="16" height="10" fill="#001845" stroke="#111" stroke-width="1"/>
                                <path d="M50,25 Q65,25 75,45" fill="none" stroke="#ffd166" stroke-width="1.5"/>
                            </svg>
                            <div class="photo-caption">Cap & Gown</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A graduation cap and gown hanging on the door. It symbolizes the completion of high school, yet it feels heavy with the knowledge that his parents might not make it to the ceremony.
                        </p>
                    </div>`,
  'college-form-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 125" style="width:120px; height:150px; margin: auto;">
                                <rect x="5" y="5" width="90" height="115" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>
                                <text x="50" y="25" font-family="'Outfit'" font-size="9" fill="#111" font-weight="bold" text-anchor="middle">COLLEGE ADMISSION</text>
                                <line x1="15" y1="40" x2="85" y2="40" stroke="#aaa" stroke-width="1.5"/>
                                <line x1="15" y1="55" x2="85" y2="55" stroke="#aaa" stroke-width="1.5"/>
                                <line x1="15" y1="70" x2="60" y2="70" stroke="#aaa" stroke-width="1.5"/>
                                <!-- Official Seal -->
                                <circle cx="75" cy="85" r="10" fill="none" stroke="#2a9d8f" stroke-width="2"/>
                                <circle cx="75" cy="85" r="7" fill="#2a9d8f" opacity="0.3"/>
                                <text x="75" y="88" font-family="'Outfit'" font-size="8" fill="#2a9d8f" font-weight="bold" text-anchor="middle">APPROVED</text>
                                <!-- Blank Signature line -->
                                <line x1="15" y1="105" x2="60" y2="105" stroke="#e63946" stroke-width="1.5"/>
                                <text x="15" y="115" font-family="'Outfit'" font-size="7" fill="#e63946">Parent Signature (BLANK)</text>
                            </svg>
                            <div class="photo-caption">Application Form</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            Official college application forms and SAT prep guidelines. Sam filled out his personal and academic details in neat print, but the guardian financial signature line is still blank.
                        </p>
                    </div>`,
  'netflix-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:300px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 140 90" style="width:180px; height:120px; margin: auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
                                <rect x="5" y="5" width="130" height="80" rx="6" fill="#222" stroke="#111" stroke-width="3"/>
                                <rect x="10" y="10" width="120" height="70" fill="#111"/>
                                <!-- F1 Car shape on screen -->
                                <rect x="30" y="45" width="80" height="15" fill="#e63946" rx="3"/>
                                <circle cx="45" cy="60" r="10" fill="#000"/>
                                <circle cx="95" cy="60" r="10" fill="#000"/>
                                <!-- Netflix Logo -->
                                <text x="25" y="25" font-family="'Outfit', sans-serif" font-size="12" fill="#e50914" font-weight="bold">N</text>
                            </svg>
                            <div class="photo-caption">F1 Stream</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A tablet showing the Netflix app. It's paused on an F1 documentary series. The smudged screen indicates it is Sam's constant source of entertainment in the dark room.
                        </p>
                    </div>`,
  'broken-skateboard-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 120" style="width:120px; height:150px; margin: auto;">
                                <!-- Left half -->
                                <g transform="rotate(-15 30 50)">
                                    <rect x="25" y="10" width="15" height="50" rx="6" fill="#f4a261" stroke="#111" stroke-width="2"/>
                                    <circle cx="32" cy="20" r="4" fill="#222"/>
                                    <circle cx="32" cy="45" r="4" fill="#222"/>
                                </g>
                                <!-- Right half -->
                                <g transform="rotate(15 70 70)">
                                    <rect x="55" y="40" width="15" height="50" rx="6" fill="#f4a261" stroke="#111" stroke-width="2"/>
                                    <circle cx="62" cy="50" r="4" fill="#222"/>
                                    <circle cx="62" cy="75" r="4" fill="#222"/>
                                </g>
                            </svg>
                            <div class="photo-caption">Broken Board</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A skateboard split in half near the trucks. The deck has scratches and stickers of F1 teams. A painful reminder of the day Sam fell while trying to ride fast and clear his mind.
                        </p>
                    </div>`,
  'awards-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:240px; background:#fff; padding:15px; text-align:center;">
                            <svg viewBox="0 0 100 100" style="width:140px; height:140px; margin: auto;">
                                <!-- Trophy -->
                                <path d="M35,30 L65,30 L60,60 L40,60 Z" fill="#ffd166" stroke="#111" stroke-width="2"/>
                                <path d="M45,60 L45,80 L35,80 L35,85 L65,85 L65,80 L55,80 L55,60" fill="#ffd166" stroke="#111" stroke-width="2"/>
                                <!-- Handles -->
                                <path d="M35,35 Q25,45 40,50" fill="none" stroke="#ffd166" stroke-width="2"/>
                                <path d="M65,35 Q75,45 60,50" fill="none" stroke="#ffd166" stroke-width="2"/>
                            </svg>
                            <div class="photo-caption">1st Place Science Award</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            Trophies and certificate folders for academic excellence. They represent cold validation of his intelligence, yet offer no real warmth or emotional comfort.
                        </p>
                    </div>`,
  'research-paper-15': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:520px; padding:20px; text-align:left;">
                            <h3 style="color:#2a9d8f; border-bottom-color:#2a9d8f; font-size:1.3rem;">International Journal of Polymer Chemistry</h3>
                            <p style="font-size:0.8rem; color:#666; margin: 5px 0;">Published: January 2020</p>
                            <p style="font-size:0.9rem; line-height:1.5; font-weight:500; margin: 10px 0;">
                                <strong>Title:</strong> Synthesis of Self-Healing Conductive Elastomers for Advanced Sensory Neural Interfaces<br>
                                <strong>Authors:</strong> Dr. H. Vance, Samrudh Sharma (Co-Author)
                            </p>
                            <p style="font-size:0.82rem; line-height:1.5; color:#333; border:1px solid #ddd; padding:12px; background:#fafafa; font-style:italic; margin: 10px 0;">
                                "...The cross-linked supramolecular network exhibited 98% autonomic healing efficiency at room temperature within 2 hours. By incorporating functionalized carbon nanotubes, electrical conductivity is maintained during mechanical elongation, laying the foundation for future cognitive-neural prosthetics..."
                            </p>
                            <div style="border-top:1px dashed #ccc; margin-top:15px; padding-top:15px; font-size:0.82rem; color:#555;">
                                <strong style="color:#2a9d8f;">Advisor's Handwritten Note:</strong><br>
                                <span style="font-family:'Caveat', cursive; font-size:1.2rem; color:#e76f51;">"Samrudh, your contribution to this breakthrough was indispensable. The academic board was stunned. You have a massive future in neural engineering. Keep pushing. — H.V."</span>
                            </div>
                        </div>
                    </div>`,
  'f1-poster-15': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px; background:#fff; padding:10px; border: 2px solid #ccc; text-align: center; margin: auto;">
                            <img src="vettel.png" alt="Sebastian Vettel 2010 Champion" style="width: 100%; height: auto; border-radius: 4px;">
                            <div class="photo-caption" style="font-family:'Outfit'; font-weight: bold; margin-top: 10px; color:#111;">Sebastian Vettel — 2010 Champion</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            A glossy poster of Sebastian Vettel celebrating his iconic 2010 championship win. The text "Finger Point of Victory" is printed alongside stats of his youngest-ever championship run, serving as Sam's quiet inspiration.
                        </p>
                    </div>`,
  'herobrine-poster': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px; background:#fff; padding:10px; border: 2px solid #ccc; text-align: center; margin: auto;">
                            <img src="herobrine.png" alt="Herobrine Poster" style="width: 100%; height: auto; border-radius: 4px;">
                            <div class="photo-caption" style="font-family:'Outfit'; font-weight: bold; margin-top: 10px; color:#111;">Herobrine Poster</div>
                        </div>
                        <p style="color:var(--text-muted); text-align:center; max-width:460px; font-size:0.9rem; line-height:1.5; margin-top:15px;">
                            An eerie poster of Herobrine surrounded by TNT. Sam got this poster in 2015 during his obsession with Minecraft creepypastas.
                        </p>
                    </div>`,
  'misplaced-drawing': `
                    <div class="crayon-drawing-closeup">
                        <div class="photo-matting" style="max-width:320px; background:#fff; padding:10px; border: 2px solid #ccc; text-align: center; margin: auto;">
                            <img src="family_drawing.png" alt="Crayon Drawing (Age 5)" style="width: 100%; height: auto; border-radius: 4px;">
                            <div class="photo-caption" style="font-family:'Outfit'; font-weight: bold; margin-top: 10px; color:#111;">My Family (Age 5)</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:15px;">
                            A crayon drawing of a family of four—mother, father, child, and a dog—drawn by a 5-year-old Sam.
                        </p>
                    </div>`,
  'misplaced-gift': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:500px; transform:rotate(1deg); background:#fff0f3; border-color:#ffccd5; padding: 20px;">
                            <h3 style="color:#ff4d6d; border-bottom-color:#ffccd5; text-align:center; margin-bottom: 15px;">Happy 5th Birthday, Sam!</h3>
                            <p style="font-size:0.95rem; line-height:1.6; color:#5c1a27; padding:10px;">
                                "Dear Samrudh,<br>
                                We are so sorry we couldn't fly back for your 5th birthday. The business meetings ran late. We hope you enjoy this gift. Nanny will help you open it.<br><br>
                                With love,<br>
                                Mom & Dad"
                            </p>
                            <div style="font-size:0.85rem; color:#ff4d6d; text-align:center; border-top:1px dashed #ffccd5; padding-top:10px; margin-top:10px;">
                                The gift box remains taped shut. It was never opened.
                            </div>
                        </div>
                    </div>`,
  'misplaced-block': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="max-width:320px; background:#fff; padding: 20px; text-align: center;">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 150px; height: 150px;">
                                <rect x="10" y="10" width="80" height="80" rx="10" fill="#ffd166" stroke="#f4a261" stroke-width="4"/>
                                <text x="50" y="70" font-family="'Outfit'" font-size="60" fill="#ffffff" font-weight="bold" text-anchor="middle" stroke="#e76f51" stroke-width="2">S</text>
                            </svg>
                            <div class="photo-caption">Alphabet Block 'S'</div>
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top: 15px;">
                            A heavy, worn wooden block with the letter 'S' painted in fading red. Sam used to build single towers with it, only to knock them down when no one was watching.
                        </p>
                    </div>`,
  'misplaced-apology': `
                    <div class="document-view-container">
                        <div class="report-card-sheet" style="font-family:'Outfit'; max-width:500px; transform:rotate(-1deg); padding: 20px;">
                            <h3 style="color:#2b2d42; border-bottom-color:#8d99ae; margin-bottom: 15px;">Sharma Executive Offices</h3>
                            <p style="font-size:0.85rem; color:#8d99ae; margin-bottom:15px;">Date: June 7, 2015</p>
                            <p style="font-size:0.95rem; line-height:1.6; color:#2b2d42;">
                                "Sam,<br>
                                I hope your birthday yesterday was alright. I have instructed the driver to deliver the gaming console you asked for. I cannot return from Dubai this week due to the merger proceedings. Study hard.<br><br>
                                — Father"
                            </p>
                            <div style="font-size:0.8rem; color:#8d99ae; border-top:1px solid #e2e8f0; padding-top:10px; margin-top:20px; font-style:italic;">
                                Written on thick company letterhead. No handwritten edits.
                            </div>
                        </div>
                    </div>`,
  'misplaced-texts': `
                    <div class="computer-screen-experience" style="display:flex; flex-direction:column; gap:15px; font-family:sans-serif; background:#1e1e24; border: 2px solid #3a3a42; padding:20px; border-radius:12px; color:#eef1f6; width:100%; max-width:400px; margin:auto;">
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #3a3a42; padding-bottom:8px; font-size:0.9rem; font-weight:bold;">
                            <span>Group Chat (Middle School)</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.9rem; text-align: left;">
                            <div style="background:#2b2d42; padding:10px; border-radius:8px; align-self:flex-start; max-width:80%;">
                                "Why is Samrudh always sitting alone?"
                            </div>
                            <div style="background:#c1121f; padding:10px; border-radius:8px; align-self:flex-end; max-width:80%; color:#fff;">
                                "Because he has no friends and his parents don't even live here! Complete loser."
                            </div>
                            <div style="background:#2b2d42; padding:10px; border-radius:8px; align-self:flex-start; max-width:80%;">
                                "He didn't even speak once during the group project."
                            </div>
                            <div style="background:#c1121f; padding:10px; border-radius:8px; align-self:flex-end; max-width:80%; color:#fff;">
                                "Wait, did you hear about his lunchbox today? It smelled so bad they had to open all the windows."
                            </div>
                            <div style="background:#2b2d42; padding:10px; border-radius:8px; align-self:flex-start; max-width:80%;">
                                "Yeah, William started calling him Stinky Sam! Everyone was laughing."
                            </div>
                            <div style="background:#c1121f; padding:10px; border-radius:8px; align-self:flex-end; max-width:80%; color:#fff;">
                                "Now everyone in the corridors is calling him Stinky Sam. So embarrassing."
                            </div>
                        </div>
                        <div style="font-size:0.8rem; color:#8d99ae; text-align:center; margin-top:10px;">
                            Received June 2015. Saved in screenshots.
                        </div>
                    </div>`,
  'misplaced-chemistry-kit': `
                    <div class="photo-closeup-container">
                        <h2 style="color:#d29e79; font-size:1.8rem; margin-bottom:15px; font-weight:500;">Chemistry Kit</h2>
                        <p style="color:var(--text-muted); line-height:1.6; max-width:480px; text-align:center;">
                            A dusty old chemistry kit. Sam was always fascinated by how things reacted together. It sparked a lifelong love for science and research.
                        </p>
                    </div>`,
  'action-figures': `
                    <div class="photo-closeup-container">
                        <div class="photo-matting" style="padding:0; background:none; border:none; box-shadow:none; max-width:300px;">
                            <img src="action_figure_lore.png" alt="Battered Action Figures" style="width:100%; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        </div>
                        <p style="text-align:center; color:var(--text-muted); max-width:460px; font-size:0.9rem; line-height:1.6; margin-top:15px;">
                            A couple of cheap, battered plastic action figures. One has its head twisted completely backwards, and both are covered in dark permanent marker scribbles. They appear to have been the victims of a very violent imaginary war.
                        </p>
                    </div>`,
  'computer-15': `
                    <div class="computer-screen-experience" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; font-family:monospace; background:#0a0a0f; border: 2px solid #5e6b7d; padding:30px; border-radius:8px; box-shadow: inset 0 0 20px rgba(94,107,125,0.3); color:#8ea2c0; width:100%; max-width:540px; margin:auto;">
                        <div style="display:flex; width:100%; justify-content:space-between; border-bottom:1px solid rgba(94,107,125,0.4); padding-bottom:8px; font-size:0.85rem;">
                            <span>SYSTEM TERMINAL [AGE 15]</span>
                            <span style="color:#e07a5f;">● LOCKED</span>
                        </div>
                        <div style="font-size:1.0rem; line-height:1.5; text-align:left; width:100%; min-height:140px; padding:10px 0; display:flex; flex-direction:column; gap:10px; width: 100%;">
                            <span style="color:#5e6b7d;">> Loading memory diagnostics... done.</span>
                            <span style="color:#5e6b7d;">> Searching for core character traits... [GLITCH FOUND]</span>
                            <span style="color:#e07a5f;">> CRITICAL ERROR: Timeline mismatch detected. Memory recovery key is required.</span>
                            
                            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px; width: 100%;">
                                <label for="comp-password-input" style="color: #ffd166; font-size: 0.85rem; font-weight: bold; letter-spacing: 1px;">ENTER RECOVERY PASSWORD:</label>
                                <div style="display: flex; gap: 10px; width: 100%;">
                                    <input type="password" id="comp-password-input" class="glass-select" placeholder="Password..." autocomplete="off" style="flex: 1; font-size: 1rem; padding: 8px; font-family: monospace; border-color: #5e6b7d; background: rgba(255,255,255,0.05); color: #fff; border-radius: 4px;">
                                    <button id="btn-comp-unlock" class="btn-primary" style="padding: 8px 20px; font-size: 0.9rem; font-family: monospace; font-weight: bold; background: #5e6b7d; color: #fff; border: none; border-radius: 4px; cursor: pointer;">UNLOCK</button>
                                </div>
                                <div id="comp-error-msg" style="color: #e07a5f; font-size: 0.85rem; font-weight: bold; min-height: 20px; margin-top: 5px; text-align: center;"></div>
                            </div>
                        </div>
                        <div style="width:100%; text-align:right; font-size:0.8rem; color:#5e6b7d; border-top: 1px solid rgba(94,107,125,0.2); padding-top:10px;">
                            SYSTEM READY. ENTER PASSWORD TO RECOVER SAM.
                        </div>
                    </div>`,
  'computer-15-unlocked': `
                    <div class="computer-screen-experience" style="display:flex; flex-direction:column; align-items:stretch; font-family:monospace; background:#000; border: 2px solid #5e6b7d; padding:10px; border-radius:8px; box-shadow: inset 0 0 20px rgba(94,107,125,0.3); color:#8ea2c0; width:100%; height:100%; margin:auto;">
                        <div style="display:flex; width:100%; justify-content:space-between; border-bottom:1px solid rgba(94,107,125,0.4); padding-bottom:8px; font-size:0.85rem; margin-bottom:10px;">
                            <span>SYSTEM TERMINAL [AGE 15] - UNLOCKED (WINDOWS 93)</span>
                            <span style="color:#2ecc71;">● ONLINE</span>
                        </div>
                        <div style="flex:1; width:100%; height:100%; overflow:hidden;">
                            <iframe src="/win93/index.html" style="width:100%; height:590px; border:none; background:#000; border-radius:4px;" frameborder="0"></iframe>
                        </div>
                    </div>`,
};


const SCHOOLBAG_ITEMS = {
  'note-bullying': `
                <div class="crumpled-note">
                    <div class="crumpled-shatter"></div>
                    <p style="margin-bottom:15px; font-weight:bold; font-size:1.15rem;">STINKY SAM'S SMELLY LUNCHBOX</p>
                    <p style="margin-bottom:15px;">
                        Why do you eat that garbage? It smells of rotting compost.<br>
                        Eat real food as others do, or eat outside on the grass with the bugs.
                    </p>
                    <p style="text-align:right; font-weight:bold;">— Class 5B (2015)</p>
                </div>`,
  'report-card': `
                <div class="report-card-sheet">
                    <h3>Report Card — Amarillo Elementary School</h3>
                    <p style="margin-bottom:15px;"><strong>Student:</strong> Samrudh Sharma &nbsp;&nbsp;&nbsp;&nbsp; <strong>Grade:</strong> 5 (2015)</p>
                    <table class="report-table">
                        <thead>
                            <tr><th>Subject</th><th>Grade</th><th>Comments</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Mathematics</td><td>A+</td><td>Outstanding performance.</td></tr>
                            <tr><td>English Language</td><td>A</td><td>Excellent reading comprehension.</td></tr>
                            <tr><td>Social Studies</td><td>A</td><td>Thorough and dedicated work.</td></tr>
                            <tr><td>Science & Tech</td><td>A+</td><td>Exceptional laboratory skill.</td></tr>
                        </tbody>
                    </table>
                    <div class="report-signatures">
                        <span>Parent Signature: <span style="font-family:'Caveat'; font-size:1.4rem; color:#555;">Mrs. Patel (Housekeeper)</span></span>
                        <span>Date: June 2015</span>
                    </div>
                </div>`,
  'checklist-fitin': `
                <div class="crumpled-note" style="background:#fefefe; border:1px solid #ccc; border-left: 5px solid #2a9d8f;">
                    <p style="font-weight:bold; font-size:1.1rem; border-bottom:1px solid #ddd; padding-bottom:5px; margin-bottom:10px;">How to Fit In (Checklist)</p>
                    <ul style="list-style:none; display:flex; flex-direction:column; gap:10px; font-family:'Architects Daughter'; font-size:0.95rem;">
                        <li>[x] Do not pack traditional Indian food for lunch anymore. (Tell Mrs. Patel to make sandwiches).</li>
                        <li>[x] Put up a football poster in the room. (Choose the local team).</li>
                        <li>[ ] Talk louder during class breaks.</li>
                        <li>[ ] Change spelling of my name to "Sam" so people can pronounce it easily.</li>
                    </ul>
                </div>`
};

const POSTER_ITEMS = {
  'minecraft': `
                <div class="photo-matting" style="max-width:280px; transform:none; border-width:8px;">
                    <svg viewBox="0 0 170 230" width="100%">
                        <rect width="170" height="230" fill="#1b4332"/>
                        <rect x="40" y="50" width="90" height="90" fill="#40916c"/>
                        <rect x="55" y="65" width="20" height="20" fill="black"/>
                        <rect x="95" y="65" width="20" height="20" fill="black"/>
                        <rect x="75" y="85" width="20" height="35" fill="black"/>
                        <rect x="65" y="105" width="40" height="25" fill="black"/>
                    </svg>
                    <div class="photo-caption" style="font-family:'Outfit'; font-size:0.95rem; font-weight:600;">Minecraft Creeper Poster</div>
                </div>`,
  'football': `
                <div class="photo-matting" style="max-width:280px; transform:none; border-width:8px;">
                    <img src="football_poster.jpg" alt="Football Poster" style="width: 100%; height: auto; border-radius: 4px;">
                    <div class="photo-caption" style="font-family:'Outfit'; font-size:0.95rem; font-weight:600;">Football Team Poster</div>
                </div>`,
  'buddy': `
                <div class="photo-matting" style="max-width:280px; transform:none; border-width:8px;">
                    <img src="buddy.png" alt="Buddy photo poster">
                    <div class="photo-caption" style="font-family:'Caveat';">Buddy the Hero</div>
                </div>`,
  'herobrine': `
                <div class="photo-matting" style="max-width:280px; transform:none; border-width:8px;">
                    <img src="herobrine.png" alt="Herobrine poster">
                    <div class="photo-caption" style="font-family:'Outfit'; font-size:0.95rem; font-weight:600;">Herobrine Poster</div>
                </div>`
};

const CUPBOARD_BOOKS = {
  'outsiders': `
                <div class="handwritten-letter-container">
                    <div class="letter-sheet age-15-style" style="border-left-color:#8c3d3d; font-family:'Outfit'; font-size:0.95rem;">
                        <h4 style="margin-bottom:10px;">The Outsiders — Excerpt</h4>
                        <p style="font-style:italic; line-height:1.6; color:#444;">
                            "I lay there and wondered what in the world I was going to do. It was quiet in the room, except for the drip-drip of the rain outside... I had a sick feeling in my stomach and I was scared. It wasn't just being scared of the cops, either. It was... I don't know. Just a feeling that I didn't belong anywhere."
                        </p>
                        <p style="margin-top:15px; font-size:0.8rem; color:var(--text-muted);">
                            Dog-eared page 48. Several lines are highlighted in yellow marker.
                        </p>
                    </div>
                </div>`,
  'astronomy': `
                <div class="handwritten-letter-container">
                    <div class="letter-sheet age-15-style" style="border-left-color:#4a446c; font-family:'Outfit'; font-size:0.95rem;">
                        <h4 style="margin-bottom:10px;">Astronomy Atlas: Void & Dark Matter</h4>
                        <p style="font-style:italic; line-height:1.6; color:#444;">
                            "Dark matter does not interact with electromagnetic force. It does not absorb, reflect, or emit light. It is completely invisible, detectable only by its gravitational influence on visible matter. It is a presence defined entirely by its silence..."
                        </p>
                        <p style="margin-top:15px; font-size:0.8rem; color:var(--text-muted);">
                            Sam's handwriting in the margin: "Invisible is easier."
                        </p>
                    </div>
                </div>`,
  'journal': `
                <div class="handwritten-letter-container">
                    <div class="letter-sheet" style="border-left-color:#e76f51;">
                        <p style="font-weight:bold; margin-bottom:10px; font-size:1.4rem;">Oct 12 — Midnight (2020)</p>
                        <p style="margin-bottom:15px;">
                            They didn't come back again. Mrs. Patel said they had to fly to Tokyo. They forgot my high school graduation was today.
                        </p>
                        <p style="margin-bottom:15px;">
                            William scribbled hate remarks on my yearbook locker. No one did anything. Everyone just watched and laughed quietly, including Kanye West who turned away.
                        </p>
                        <p style="font-weight:bold; color:#b32a2a;">
                            I spent the day alone in this empty room. Sometimes I feel as though I am a ghost in my own house. I just want to finish school and escape this town.
                        </p>
                    </div>
                </div>`
};

const COMPUTER_FILES = {
    acceptance: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL: stanford_admit.eml</strong>
            <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">From: admissions@stanford.edu<br>Date: May 12, 2020<br>To: samrudh.sharma@amarillohigh.edu</p>
            <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                Dear Samrudh,<br><br>
                Congratulations! I am thrilled to inform you that you have been admitted to the <strong>Stanford University Class of 2024</strong>. 
            </p>
            <p style="margin:10px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                Your outstanding academic record, combined with your pioneering research proposal in Neural Engineering, made you a standout candidate. We are proud to offer you a spot in our undergraduate program.
            </p>
            <p style="margin:10px 0 0 0; line-height:1.5; color:#ffd166; font-size:0.8rem; font-weight:bold;">
                Welcome to Stanford!
            </p>
        </div>`,
    ielts: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL: ielts_report.eml</strong>
            <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">From: results@ieltsessentials.com<br>Date: May 5, 2020<br>To: samrudh.sharma@amarillohigh.edu</p>
            <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                Dear Candidate,<br><br>
                Your IELTS Academic test results are now available. You have achieved your <strong>highest target score</strong>:
            </p>
            <p style="margin:10px 0; line-height:1.4; color:#eef1f6; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:4px; font-family:monospace;">
                • <strong>Listening:</strong> 9.0 &nbsp;&nbsp;&nbsp;&nbsp; • <strong>Reading:</strong> 9.0<br>
                • <strong>Writing:</strong> 8.0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • <strong>Speaking:</strong> 8.5<br>
                ----------------------------------<br>
                • <strong>OVERALL BAND SCORE:</strong> <span style="color:#2a9d8f; font-weight:bold; font-size:0.9rem;">8.5 (Expert User)</span>
            </p>
            <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                This score fulfills the English proficiency requirements for all top-tier international institutions, including Stanford University.
            </p>
        </div>`,
    prom: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#e63946; border-bottom:1px solid rgba(230,57,70,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">EMAIL DRAFT: draft_prom_night.eml</strong>
            <p style="color:#8ea2c0; font-size:0.75rem; margin:0 0 10px 0;">To: Claire.j@amarillohigh.edu<br>Date: June 9, 2020<br>Status: UNSENT DRAFT</p>
            <div style="line-height:1.5; color:#eef1f6; font-size:0.8rem;">
                <p style="margin: 0 0 10px 0;">I am writing this from my bedroom floor. My hands are still shaking. Tonight was supposed to be the best night. I spent weeks preparing everything perfectly. I convinced my parents about my outfit. I wore a modern suit to fit in. I thought Claire wanted to go with me. I was so completely wrong.</p>
                <p style="margin: 0 0 10px 0;">We stood near the dance floor. Her friends walked over. I tried to make a joke. Claire looked at them and sneered. She mocked my dancing and my voice. She said I looked desperate asking her.</p>
                <p style="margin: 0 0 10px 0;">The guys walked up. They saw Claire leading the mockery. They joined in instantly. They tossed around old insults. They called me "Stinky Sam."</p>
                <p style="margin: 0 0 10px 0;">The worst part was Claire. She laughed right along with them.</p>
                <p style="margin: 0 0 10px 0;">Everyone around us was watching. People recorded it on their phones.</p>
                <p style="margin: 0 0 10px 0;">A massive lump formed in my throat.</p>
                <p style="margin: 0 0 10px 0;">The first tear slipped out.</p>
                <p style="margin: 0 0 10px 0;">One of the guys pointed it out to everyone.</p>
                <p style="margin: 0 0 10px 0;">I could not take it anymore.</p>
                <p style="margin: 0 0 10px 0;">I turned around and walked out.</p>
                <p style="margin: 0 0 10px 0;">I was crying openly.</p>
                <p style="margin: 0 0 10px 0;">I felt completely humiliated.</p>
                <p style="margin: 0 0 10px 0;">I walked home in the dark.</p>
                <p style="margin: 0;">I have never felt so alone.</p>
            </div>
        </div>`,
    therapy: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">LOG: therapy_session.log</strong>
            <p style="color:#8ea2c0; font-size:0.8rem; margin:0 0 10px 0;">Date: October 12, 2020<br>Clinician: Dr. Aris</p>
            <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                Patient Samrudh Sharma (Age 15) exhibits deep symptoms of isolation and emotional neglect. Since his relocation, his primary attachment was his dog, Buddy, whose recent passing triggered a severe depressive state.
            </p>
            <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                <em>Key Observation:</em> When asked about his outlook on the future, he repeatedly stated that his isolation and academic pressure make his withdrawal feel <strong>"inevitable"</strong>.
            </p>
        </div>`,
    timeline: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">DATA: timeline_data.dat</strong>
            <ul style="padding-left:15px; margin:5px 0 0 0; display:flex; flex-direction:column; gap:8px; color:#eef1f6; line-height:1.4; font-size:0.85rem;">
                <li><strong>Era 2010 (Age 5):</strong> Solitary play. High creativity in drawings. Feels left behind.</li>
                <li><strong>Era 2015 (Age 10):</strong> Bullying in middle school group chats. Escaped into gaming.</li>
                <li><strong>Era 2020 (Age 15):</strong> Severe withdrawal. Co-authored neural engineering research paper, but zero social engagement.</li>
            </ul>
        </div>`,
    medical: `
        <div style="width:100%; text-align:left; box-sizing:border-box;">
            <strong style="color:#2a9d8f; border-bottom:1px solid rgba(42,157,143,0.3); display:block; padding-bottom:5px; margin-bottom:10px;">REPORT: diagnosis_rpt.pdf</strong>
            <p style="color:#8ea2c0; font-size:0.8rem; margin:0 0 10px 0;">Issuer: St. Jude Neurological Institute</p>
            <p style="margin:5px 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                Early-onset cognitive fragmentation. The patient's mind is locked in a loop of past traumas and memories.
            </p>
            <p style="margin:10px 0 0 0; line-height:1.5; color:#eef1f6; font-size:0.85rem;">
                Timeline stabilization is required. If memory fragments (apology letter, bully texts, family drawing) are not returned to their correct eras, permanent brain death is projected.
            </p>
        </div>`
};

module.exports = {
  SCHOOLBAG_ITEMS,
  POSTER_ITEMS,
  CUPBOARD_BOOKS,
  scenarios,
  crayonSVGs,
  pictureBookPages,
  dvdVideos,
  cassetteSubtitles,
  yearbookStudents,
  WORDS_METADATA,
  LORE_DATA,
  COMPUTER_FILES,
  COMPUTER_PASSWORD: 'inevitable'
};

