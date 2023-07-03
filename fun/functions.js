
var tutorialText = ["Show controls?",
"Use the space bar to jump",
"Use 'a' and 'd' to move left and right",
"Aim with the mouse cursor",
"Press 'w' to fling grappling hook at something",
"Hold 'w' to pull yourself into the air",
"While being pulled, let go of 'w' to release rope at the best time",
"While hanging from rope, use 's' to release rope without being pulled",
"While hanging from rope, use 'q' and 'e' to climb up and down the rope"];

var tutorialN = -1;
var tutorialShowing;
var tutorialSeen = false;
var tutorialSeenInArena = false;
var tutorialShowTime;

function tutorial(n){
    if (!tutorialShowing){
        tutorialShowing = true;
    }

    if (tutorialButton.activated){
        tutorialButton.deactivate();
    }
    if (n){
        tutorialN = n;
    } else {
        tutorialN++;
    }
    if (tutorialN == tutorialText.length){
        endTutorial();
        return;
    } else {
        displayText(tutorialText[tutorialN], null, "red");
        if (true){
            displayLowerText("N for next, C to cancel", null, "red");
        }
    }
    tutorialShowTime = millis();
}

function endTutorial(){
    tutorialN = -1;
    tutorialShowing = false;
    displayText();
    displayLowerText();
    if (levelMode){
        tutorialButton.activate();
        tutorialSeen = true;
    } else if (arenaMode) {
        tutorialButton.activate();
        tutorialSeenInArena = true;
    }
}


function selectTurret(n){
    if (n == 0){
        playArenaButton.activate();
    }
    selectedTurret = n;
    
    if (turretUnlocked >= selectedTurret){
        playArenaButton.activate();
    } else {
        playArenaButton.deactivate();
    }
    arenaMenuButtons.toggleOff();
    arenaMenuButtons.toggleButton(n);
}

//kill player when killed by bullet
function killPlayer(msg){
    if (dyingEnabled && (!player.dead)){
        player.dead = true;
        player.recoilsLeft = recoilsAdded;
        player.recoilSource = null;
        turretsActive = false;
        if (player.reeling){
            player.release();
        }
        if (levelMode){
            if (msg == "red"){
                displayText("You touched a red block", revivalTime/FPS, "black");
            } else {
                displayText("You died", revivalTime/FPS, "black");
            }
            revivalCountdown = revivalTime;

        } else { //arena mode
            revivalCountdown = -1;
            var txt;
            if (selectedTurret == 6){
                if (msg == "red"){
                    var n = missilesLeft;
                } else {
                    var n = missilesLeft + 1;
                }
                txt = "You died with "+n+" missile left to beat";
            } else {
                txt = "You died with "+floor(arenaTimer/FPS + 1)+" seconds left";
            }
            displayText(txt, null, "black");
            redoTurretButton.show();
        }
    }
}

//revive player
function revivePlayer(){
    player.dead = false;
    turretsActive = true;
    revivalCountdown = null;
    if (levelMode){
        restoreCheckpoint();
    }
}


//drag proportional to square of velocity
function calculateDrag(vel, k){
    var speed = vel.mag();
    var ang = vel.heading();
    var dragMag = -k * speed * speed;
    drag = p5.Vector.fromAngle(ang, dragMag);
    return drag;
}

function calculateDragLinear(vel, k){
    var speed = vel.mag();
    var ang = vel.heading();
    var dragMag = -k * speed;
    drag = p5.Vector.fromAngle(ang, dragMag);
    return drag;
}

function calculateMissileDrag(vel, angD, k1, k2, opt){
    var speed = vel.mag();
    var angV = vel.heading();

    var diff = angV - angD;
    if (diff > PI){
        diff -= TWO_PI;
    } else if (diff < -PI){
        diff += TWO_PI;
    }

    var forwardDragMag = -k1 * speed * cos(diff);
    var forwardDrag = p5.Vector.fromAngle(angD, forwardDragMag);

    var sideDragMag = -k2 * speed * sin(diff);
    var sAng;
    var sideDrag = p5.Vector.fromAngle(angD+(PI/2), sideDragMag);

    if (opt == "1"){
        return forwardDrag;
    } else if (opt == "2"){
        return sideDrag;
    } else {
        return p5.Vector.add(forwardDrag, sideDrag);
    }
    
}

//translate canvas function
function translateCanvas(){
    var x = player.pos.x + player.r/2;
    var y = player.pos.y + player.r/2;
    x += dispX;
    y += dispY;

    if (y < translateBufferY){
        dispY += translateBufferY - y;
    } else if (y > height - translateBufferY){
        dispY += height - translateBufferY - y;
    }

    if (x < translateBufferX){
        dispX += translateBufferX - x;
    } else if (x > width - translateBufferX){
        dispX += width - translateBufferX - x;
    }

    var bff = 50;
    if (dispX > bff){
        dispX = bff;
    } else if (dispX < width - arenaWidth - bff){
        dispX = width - arenaWidth - bff;
    }

    if (dispY > bff){
        dispY = bff;
    } else if (dispY < height - arenaHeight - bff){
        dispY = height - arenaHeight - bff;
    }
}


//creating points for an individual edge
function pointsForLine(x1, y1, x2, y2){ // 0 = right, 1 = bottom, ect

    var spacing = 20;
    var len = sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
    var ang = atan2( (y2-y1), (x2-x1) );
    
    var num = round(len/spacing);
    spacing = len/num;
    
    for (let n = 0; n <= num; n++){
        var x = x1 + n*spacing*cos(ang);
        var y = y1 + n*spacing*sin(ang);
        var np = new Point(x,y);
        hookPoints.push(np);
    }
}


//returns 1 if p2 is in a box of sidelength 2*size around p1.
function inBox(x1, y1, x2, y2, size){
    
    if ( (abs(x2-x1) < size) && (abs(y2-y1) < size) ){
        return 1;
    }
    return 0;
}


function displayCommands(){
    textSize(16);
    fill(50,100);
    noStroke();
    var lt = "while hanging, hold 'q' to shorten rope and 'e' to lengthen rope";
    rect(5,45,textWidth(lt)+10,135);

    fill(255, 178, 43 );
    stroke( 255, 178, 43);
    strokeWeight(1);
    text("space bar to jump.",10,60);
    text("move side to side with 'a' and 'd'", 10, 80);
    text("point with mouse. press 'w' to fling hook",10,100);
    text("hold 'w' to reel hook in. release 'w' to release hook",10,120);
    text("while hanging, press 's' to release hook without being pulled",10,140);
    text("while hanging, hold 'q' to shorten rope and 'e' to lengthen rope",10,160);
}



function displayText(text, time, col, size){

    if (col == undefined){
        displayTextColor = color(45, 81, 154);
    } else if (col == "red"){
        displayTextColor = color(218, 2, 110);
    } else if (col == "black"){
        displayTextColor = color(50);
    } else {
        displayTextColor = col;
    }

    if (size == undefined){
        size = 30;
    } 
    displayTextSize = size;

    if (time == null){
        displayCount = -1;
    } else {
       displayCount = floor(time*FPS);
    }

    textToDisplay = text;
}

//display lower text
function displayLowerText(text, time, col, size){

    if (col == undefined){
        lowerDisplayTextColor = color(45, 81, 154);
    } else if (col == "red"){
        lowerDisplayTextColor = color(218, 2, 110);
    } else if (col == "black"){
        lowerDisplayTextColor = color(50);
    } else {
        lowerDisplayTextColor = col;
    }

    if (size == undefined){
        size = 22;
    } 
    lowerDisplayTextSize = size;

    if (time == null){
        lowerDisplayCount = -1;
    } else {
       lowerDisplayCount = floor(time*FPS);
    }

    lowerTextToDisplay = text;
}



//VECTOR functions
function addVectors(vectors) {
    var newV = createVector(0, 0);

    for (let v of vectors) {
        newV.x += v.x;
        newV.y += v.y;
    }
    return newV;
}

//zeroing a vector
function zeroVector(v){
    v.x = 0;
    v.y = 0;
}

function drawVector(v, p, c, n){
    var col;
    var a = 255;
    if (c == undefined){
        col = color(50, a);
    } else if (c == "purple"){
        col = color(180, 0, 180, a);
    } else if (c == "blue"){
        col = color(0, 0, 220, a);
    } else if (c == "green"){
        col = color(40, 180, 40, a);
    } else if (c == "red"){
        col = color(220, 40, 40, a);
    } else if (c == "orange"){
        col = color(255, 140, 0, a);
    } else if (c == "cyan"){
        col = color(0,255,255,a);
    } else if (c == "yellow"){
        col = color(255,255,0,a);
    }

    if (n == undefined){
        n = 1;
    }
    
    stroke(col);
    strokeWeight(2);
    line(p.x, p.y, p.x + n*v.x, p.y + n*v.y);
}



//draw shiny dot function
function drawShinyDot(x, y, size, col){
    var steps = 8;
    var alpha;
    if (col == undefined){
        col = color(77, 186, 77);
    }
    var r = red(col);
    var g = green(col)
    var b = blue(col);
    //77, 186, 77 
    noStroke();
    
    for (let n = steps; n >= 1; n--){
        alpha = 220 * ( steps - n + 0.4 )/steps;
        fill(r, g, b, alpha);
        ellipse(x, y, (n/2)*size);
        //console.log(alpha);
    }
}


//unlockAll function
function unlockAll(){
    turretUnlocked = turretAmount + 1;
    levelUnlocked = levelAmount + 1;
}

//developerMode function
function developerMode(){
    dyingEnabled = false;
    turretUnlocked = turretAmount + 1;
    levelUnlocked = levelAmount + 1;
    noTouch = false;
}