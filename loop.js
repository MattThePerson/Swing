//home of the game/mane loops used

var menuLoop;


//HOME MENU LOOP
function homeLoop() {

    background(255);
    textSize(120);
    strokeWeight(8);
    titleColor = 55;
    stroke(titleColor);
    fill(titleColor);
    var title = "Swing!";
    text(title, titleTextX = width / 2 - textWidth(title) / 2, height*0.35-50);

    menuButtons.update(mouseX,mouseY);
    menuButtons.draw();
    peakLoop();
}


//LOOP FOR ABOUT PAGE
function aboutLoop(){
    background(255);

    //page scrolling
    if (grabbing){
        aboutPageScroll = scrollY + grabY - mouseY;
    }

    var max = aboutTextHeight - 2*aboutBoxY;
    //console.log(aboutPageScroll, pageReturnSpeed);

    if ( (!grabbing) && (pageReturnSpeed == null) ){ //page scrolling below 0

        if (aboutPageScroll < 0){
            pageReturnSpeed = abs(aboutPageScroll)/6;
        } else if (aboutPageScroll > max){
            pageReturnSpeed = -abs(aboutPageScroll-max)/6;

        }
    }

    if (pageReturnSpeed != null){ //page is returning
        aboutPageScroll += pageReturnSpeed;

        if ( (pageReturnSpeed > 0) && (aboutPageScroll >= 0) ){
            aboutPageScroll = 0;
            pageReturnSpeed = null;

        } else if ( (pageReturnSpeed < 0) && (aboutPageScroll <= max) ){
            aboutPageScroll = max;
            pageReturnSpeed = null;
        }
    }



    var buffer = 40;
    var x = 160 + buffer;
    var y = 160 + buffer;
    var w = width - 2*x - buffer;
    var h = height - 2*y - buffer;

    textSize(20);
    fill(55);
    strokeWeight(0.7);
    textAlign(LEFT, TOP);
    text(aboutText, x, y-aboutPageScroll, w, aboutTextHeight);
    textAlign(LEFT, CENTER);

    //text hiding
    x = aboutBoxX;
    y = aboutBoxY;
    w = width - 2*x;
    h = height - 2*y;

    var scrollBuffer = 20;

    noStroke();
    fill(255);
    rect(0, 0, width, y+scrollBuffer);
    rect(0, y+h-scrollBuffer, width, 2*y);


    //border
    stroke(55);
    
    noFill();
    strokeWeight(2);
    rect(x,y,w,h);

    //title
    textSize(65);
    strokeWeight(5);
    titleColor = 55;
    stroke(titleColor);
    fill(titleColor);
    var title = "Swing!";
    text(title, 70, 80);

    //scroller

    //fill(210);
    //rect(x+w-10, y+aboutPageScroll, 10, 10);

    //subtitle
    textSize(35);
    strokeWeight(2);
    var subtitleColor = 100;
    stroke(subtitleColor);
    fill(subtitleColor);
    var txt = "ABOUT";
    text(txt, 320, 80);


    menuButtons.update(mouseX, mouseY);
    menuButtons.draw();
    peakLoop();
}

//LEVEL MENU LOOP
function levelLoop(){
    background(255);
    textSize(65);
    strokeWeight(5);
    titleColor = 55;
    stroke(titleColor);
    fill(titleColor);
    var title = "Swing!";
    text(title, 70, 80);

    textSize(35);
    strokeWeight(2);
    var subtitleColor = 100;
    stroke(subtitleColor);
    fill(subtitleColor);
    var txt = "PLAY LEVELS";
    text(txt, 320, 80);

    var px = 370;
    var py = 150;
    
    if (level){
        var img = showcasePhotos[level-1];
        image(img, px, py);
    } else {
        subtitleColor = 130;
        fill(subtitleColor)
        stroke(subtitleColor);
        txt = "NO LEVEL SELECTED";
        text(txt, px + showcasePhotoWidth/2 - textWidth(txt)/2, py + showcasePhotoHeight/2);
    }

    //level menu bottom box color
    strokeWeight(1.6);
    if (!level){
        fill(100);
    } else if (level <= levelUnlocked){
        fill(77, 187, 76);
    } else {
        fill(195, 52, 61);
    }
    stroke(55);
    var h = 70;
    var py2 = py + showcasePhotoHeight - h;
    rect(px, py2, showcasePhotoWidth, h);

    strokeWeight(3);
    noFill();
    stroke(55);
    rect(px, py, showcasePhotoWidth, showcasePhotoHeight);
    
    //bottom box text
    var tc, txt;
    if (level){
        if (level < levelUnlocked){
            tc = color(129, 229, 134);
            txt = "PASSED";
        } else if (level == levelUnlocked){
            tc = color(60);
            txt = "UNPASSED";//+CPinL[level-1];
        } else {
            tc = color(180);
            txt = "LOCKED";
        }
    
        fill(tc);
        stroke(tc);
        strokeWeight(1.2);
        textSize(40);

        textAlign(LEFT, CENTER);
        text(txt, px+0.5*40, py+showcasePhotoHeight-30);
    }
    
    menuButtons.update(mouseX,mouseY);
    menuButtons.draw();

    peakLoop();
}




//GAME LOOP FOR LEVE
function levelGameloop(){
    text("Checkpoints passed: " + currentCheckpoint.order, width - 240, 30);
    text("Level: " + level, width / 2 - 40, 30);
}


//GAME LOOP
function gameLoop() {
    background(230);
    
    push();
    translate(dispX, dispY);
    scale(SF);

    //UPDATE STUFF
    if (!paused) {
        //update bullets
        for (let b of bullets) {
            b.update();
        }
        //remove destroyed bullets
        for (let n = bullets.length - 1; n >= 0; n--) {
            if (bullets[n].destroyed) {
                bullets.splice(n, 1); //remove exploded bullets
            }
        }
        //update missiles
        for (let m of missiles) {
            if (!m.destroyed){
                m.update();
            }
        }
        //remove destroyed bullets
        for (let n = missiles.length - 1; n >= 0; n--) {
            if (missiles[n].gone) {
                missiles.splice(n, 1); //remove exploded bullets
            }
        }

        //show and update blocks
        strokeWeight(1);
        for (let object of gameObjects) {
            object.update();
        }

        //update player
        player.update();

        //checkpoints
        for (let c of checkpoints){
            c.update();
        }

        //update turrets
        for (let t of turrets) {
            if ( abs(t.x - player.pos.x) < turretUpdateRange ){
                t.update(player);
            }
        }


        //update explosions
        for (let e of explosions) {
            e.update();
        }
        for (let i = explosions.length - 1; i >= 0; i--) {
            if (explosions[i].over) {
                explosions.splice(i, 1);
            }
        }
    }

    //SHOW STUFF
    for (let b of bullets) {
        b.show();
    }
    //show missiles
    for (let m of missiles){
        if (!m.destroyed){
            m.show();
        }
    }
    //explosions
    for (let e of explosions) {
        e.show();
    }
    //blocks
    strokeWeight(1);
    for (let object of gameObjects) {
        if ( (abs(object.x-player.pos.x) < blockUpdateRange) ||
        ( abs( (object.x+object.w)-player.pos.x ) < blockUpdateRange ) ||
        ( (player.pos.x > object.x) && (player.pos.x < (object.x+object.w)) ) ){
            object.show();
        }
    }

    //show unreached checkpoints
    for (let p of checkpoints) {
        p.show();
    }
    //show player
    player.show();

    //show turrets
    for (let t of turrets) {
        if ( abs(t.x - player.pos.x) < turretUpdateRange ){
            t.show();
        }
    }

    translateCanvas();
    arenaX = mouseX - dispX;
    arenaY = mouseY - dispY;

    pop();

    textSize(18);
    fill(231, 152, 15);
    strokeWeight(1);
    stroke(231, 152, 15)
    //text(floor(frameRate()), 40, height-40);
    if (displayingCommands) {//display commands
        displayCommands();
    }

    textSize(18);
    var cl = color(50);
    fill(cl);
    stroke(cl);

    //unique mode specific code
    if (levelMode){ 
        levelGameloop();
    } else { 
        arenaGameloop();
    }


    //display displayText
    if (textToDisplay) {
        textSize(displayTextSize);
        fill(displayTextColor);
        stroke(displayTextColor);
        if ( alpha(displayTextColor) != 255 ){
            noStroke();
        } else {
            strokeWeight(1);
        }
        var tw = textWidth(textToDisplay);
        text(textToDisplay, width / 2 - tw / 2, height / 2 - 10);

        if (!paused){
            if (displayCount > 0){
                displayCount--;
            }
            if (displayCount == 0){
                textToDisplay = null;
            }
        }
    }
    //lower display text
    if (lowerTextToDisplay) {
        textSize(lowerDisplayTextSize);
        fill(lowerDisplayTextColor);
        stroke(lowerDisplayTextColor);
        if ( alpha(lowerDisplayTextColor) != 255 ){
            noStroke();
        } else {
            strokeWeight(1);
        }
        var tw = textWidth(lowerTextToDisplay);
        text(lowerTextToDisplay, width / 2 - tw / 2, height / 2 + 30);

        if (!paused){
            if (lowerDisplayCount > 0){
                lowerDisplayCount--;
            }
            if (lowerDisplayCount == 0){
                lowerTextToDisplay = null;
            }
        }
    }


    //revive countdown
    if (player.dead){
        if (revivalCountdown > 0){
            revivalCountdown--;
        }
        if (revivalCountdown == 0){
            revivePlayer();
        }
    }

    //end ignored tutorial
    if (tutorialShowing){
        if ( (millis()-tutorialShowTime) > 10000){
            endTutorial();
        }
    }

    if (paused){
        //darken screen
        noStroke();
        fill(100,80);
        rect(0, 0, width, height);

        //paused text
        var txt = "paused";
        var col = color(100);
        fill(col);
        stroke(col);
        strokeWeight(2);
        textSize(36);
        text(txt, width/2-textWidth(txt)/2, height*0.38 );
    }

    //show framerate updating half a second
    if ( ( millis()-showThingTime ) > 500 ){
        showThingTime = millis();
        showText = round(frameRate());
    }
    textSize(30);
    fill(55);
    stroke(55);
    strokeWeight(1);
    //text(showText, 20, height-50 );

    //draw buttons
    inGameButtons.update(mouseX, mouseY);
    inGameButtons.draw();

}


