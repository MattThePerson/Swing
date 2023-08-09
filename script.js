// Swing!
// version 4.2

//DEVLOG
// version 4.2 (17.04.2019)
// - added guided missiles
// - added rope block wrapping
// - added level 4
// - added explosion recoil
// - changed turrets appearance
// - added idle turret animation
// - added arena menu display turret behaviour

// version 4.1 (13.04.2019)
// - added practice mode
// - altered arena to account for easy winning strategies

// version 4.0 (12.04.2019)
// - added explosions
// - added super predictive turrets
// - added arena survival mode
// - added level 3
// - redesigned menus
// - got rid of title card animation
// - added bouncy bullets
// - added death animation

// version 3.0 (05.04.2019)
// - added a main menu
// - added buttons
// - changed appearance of predictive turrets
// - made level 2 final challenge easier (you're welcome)
// - added peak text

// version 2.0 (30.03.2019)
// - added level 2
// - added turrets
// - improved hook sticking mechanic
// - changed controls (again)
// - optimized forces (jump strength, friction, drag)
// - added predictive aiming
// - removed 3 challenges from level 1

// version 1.2 (23.03.2019)
// - added title card
// - added safe area at beginning
// - added checkpoint text

// version 1.1 (23.03.2019)
// - added 3 more challenges (total now 13)
// - made controls more intuitive
// - added checkpoints


var FPS = 30;
var G = 0.5;
var bgDispFactor = 0.5;

//game object arrays
var gameObjects; //blocks
var checkpoints;
var turrets;
var bullets = [];
var explosions = [];
var missiles = [];

var arenaWidth;
var arenaHeight;
var playerStartX;
var playerStartY;

//player variables
var player;
var playerThrust = 2; //left right motion
var frictCoef = 0.28;
var airResCoef = 0.0015;
var jumpStrength = 3; //turns pe into upward force
var playerJump; //stores the time player has jumped
var bounceFactor = 0.5;
var buffer = .95; //buffer for collision detection
var reelThrust = 1.9;
var reelConstant = .1;
var stringLessenFactor = 0.98; //speed at which string is lessened
var reelJump = 0.8; //initial amount of string lessening
var hookSpeed = 50; //the speed at which the hook is sent flying
var minRopeLen = 55;
var maxRopeLen = 750;
var thrustInAir; //variable to calculate the left/right thrust in the air

var showForces = false;


//arena translation (camera movement) variables
var dispX;
var dispY;

var arenaX;
var arenaY;

var translateBufferX;
var translateBufferY;

var paused = false;

var noTouch = true;
var dyingEnabled = true;
var turretsActive = true;
var displayingCommands = false;
var explosionRecoilEnabled = true;
var recoilK;
var recoilsAdded = 2;

//update things range
var blockUpdateRange = 3000;
var turretUpdateRange = 3000;

//missile variables
var missileDragCoef = 0.02;
var missileThrust = 0.7;
var missileSideFactor = 5;
var missilesToBeat = 5;
var missilesLeft;

var levelBeat = false;
var gameBeat = false;
var levelAmount = 4;
var level;
var levelUnlocked = 5;
var levelMode;
var arenaMode;
var practiceMode = false;

//arena variables
var arenaSurvivalTime = 30*30;
var arenaTimer;
var arenaStarted;
var arenaCountdown = 30*6;
var arenaRunning = true;
var turretAmount = 6;
var selectedTurret;
var turretUnlocked = 8;
var turretBeat = false;

//turret variables
var alertDotColor;
var idleDotColor;

var currentCheckpoint;
var CPinL = []; //checkpoint reached for each level
for (let n = 0; n < levelAmount; n++){
    CPinL.push(0);
}

//about page scrolling
var aboutPageScroll = 0;
var aboutBoxX = 160;
var aboutBoxY = 160;
var grabbing = false;
var grabY;
var scrollY;
var pageReturnSpeed = null;
var aboutTextHeight = 1900;

//text display variables
var textToDisplay;
var displayCount;
var displayTextColor;
var displayTextSize;

//lower display text variables
var lowerTextToDisplay;
var lowerDisplayCount;
var lowerDisplayTextColor;
var lowerDisplayTextSize;

//title card and home screen variables
var showingTitle = false;
var titleColor = 255;


var inGame = false;
var canStart = false;

//dying variables
var revivalCountdown;
var revivalTime = 30*2.1;

//show thing
var showThingTime = 0;
var showText;


//data variables
var blockDatum = [];
var dataFilenames = ["data/level_1.csv",
    "data/level_2.csv", "data/level_3.csv", "data/level_4.csv"];

var turretDatum = [];
var turretFilenames = ["data/level_1_turrets.csv",
    "data/level_2_turrets.csv", "data/level_3_turrets.csv", "data/level_4_turrets.csv"];

var arena_i_data;
var arena_rt_data;
var arena_i_rt_data;
var arena_none_data;
var arena_practice_data;
var arenaTurretData;

var bg;
var showcasePhotos;

var showcasePhotoWidth;
var showcasePhotoHeight;

var turretPhotoWidth;
var turretPhotoHeight;

var debugMessages = [];
var debugN = 0;

var SF = 1;

//PRELOAD
function preload() {
    for (let filename of dataFilenames) {
        let d = loadTable(filename, "csv", "header");
        blockDatum.push(d);
    }
    for (let filename of turretFilenames) {
        let d = loadTable(filename, "csv", "header");
        turretDatum.push(d);
    }

    arena_i_data = loadTable("data/arena_i.csv", "csv", "header");
    arena_rt_data = loadTable("data/arena_rt.csv", "csv", "header");
    arena_i_rt_data = loadTable("data/arena_i_rt.csv", "csv", "header");
    arena_none_data = loadTable("data/arena_none.csv", "csv", "header");
    arena_practice_data = loadTable("data/arena_practice.csv", "csv", "header");
    arenaTurretData = loadTable("data/arena_turrets.csv", "csv", "header");
    
    showcasePhotos = [];

    var Photo = loadImage("art/level_1_displayArt.png");
    showcasePhotos.push(Photo);
    Photo = loadImage("art/level_2_displayArt.png");
    showcasePhotos.push(Photo);
    Photo = loadImage("art/level_3_displayArt.png");
    showcasePhotos.push(Photo);
    Photo = loadImage("art/level_4_displayArt.png");
    showcasePhotos.push(Photo);

}


//SETUP
function setup() {
    createCanvas(1300, 750);
    frameRate(FPS);

    textAlign(LEFT, CENTER);

    translateBufferX = width*0.45;
    translateBufferY = height*0.45;

    player = new Player();

    loadButtons();
    activatePeakText();
    menuLoop = homeLoop;

    showcasePhotoWidth = floor(width*0.68);
    showcasePhotoHeight = floor(height*0.73);
    for (let p of showcasePhotos){
        p.resize(showcasePhotoWidth,0);
    }

    turretPhotoWidth = 475;
    turretPhotoHeight = turretPhotoWidth;

    loadDisplayTurrets();

    alertDotColor = color(245, 56, 26);
    idleDotColor = color(255);

    //unlockAll(); //unlocks all turrets and levels
}


//DRAW
function draw() {


    if (inGame){
        gameLoop();
    } else {
        menuLoop();
    }
    
    //border
    stroke(50);
    strokeWeight(3);
    noFill();
    rect(0, 0, width - 1, height - 1);
}





//TITLE CARD
function showTitleCard() {
    background(255);
    textSize(70);
    strokeWeight(6);
    fill(titleColor);
    stroke(titleColor);

    var title = "Swing!";
    text(title, width / 2 - textWidth(title) / 2, height / 2 - 50);


    if (!canStart) {
        titleColor -= 200 / (30 * 2);
        if (titleColor < 55) {
            titleColor = 55;
            canStart = true;
        }
    } else {
        var underText = "Press any key to continue...";
        textSize(16);
        strokeWeight(1);
        text(underText, width / 2 - textWidth(underText) / 2 + 10, height * 0.52);
        if (keyIsPressed) {
            showingTitle = false;
        }
    }
}