

//loop for arena menu
function arenaLoop(){
    //title
    background(255);
    textSize(65);
    strokeWeight(5);
    titleColor = 55;
    stroke(titleColor);
    fill(titleColor);
    var title = "Swing!";
    text(title, 70, 80);

    //subtitle
    textSize(35);
    strokeWeight(2);
    var subtitleColor = 100;
    stroke(subtitleColor);
    fill(subtitleColor);
    var txt = "ARENA SURVIVAL";
    text(txt, 320, 80);

    //line separating practice and turret buttons
    strokeWeight(3);
    stroke(160);
    line(70, 210, 290, 210);
    
    var px = 400;
    var py = 150;

    //draw display turret block
    if (selectedTurret >= 0){
        noStroke();
        fill(230);
        rect(px, py, turretPhotoWidth, turretPhotoHeight);

        var tX = px + turretPhotoWidth/2;
        var tY = py + turretPhotoHeight/2+80;
        var blockW = 200;
        fill(0, 138, 168);
        strokeWeight(1);
        stroke(0, 138, 168);
        rect(tX-blockW/2, tY, blockW, 200);
    }
    

    //display box
    var boxH = 550;
    var boxW = 845;

    //description box background
    fill(55);
    rect(px+turretPhotoWidth, py, boxW-turretPhotoWidth, turretPhotoHeight);

    strokeWeight(3);
    noFill();
    stroke(55);
    rect(px, py, boxW, boxH);
    rect(px, py, turretPhotoWidth, turretPhotoHeight);
    
    //lower box background
    if (selectedTurret == null){
        fill(100);
    } else if (selectedTurret <= turretUnlocked){
        fill( 77, 187, 76 );
    } else {
        fill( 195, 52, 61 );
    }
    rect(px, py+turretPhotoHeight, boxW, boxH-turretPhotoHeight);
    
    //arena survival description
    fill(55);
    stroke(55);
    strokeWeight(1);
    textSize(20);
    var Dtxt = "Survive in the arena for 30 seconds against:";
    var Dtx = "SURVIVE IN THE ARENA FOR 30 SECONDS AGAINST A TURRET"
    //text(Dtxt,px+20,168);
    
    //arena menu text
    if (selectedTurret >= 0){
        //description
        var tc = color( 253, 192, 51 );
        fill(tc);
        stroke(tc);
        strokeWeight(1);
        textSize(24);
        let bf = 40;
        let X = px + turretPhotoWidth+bf/2;
        let Y = py + bf;
        let W = boxW - turretPhotoWidth - bf;
        let H = boxH;

        textAlign(LEFT, TOP);
        //text("Turret description: ", X, Y-60);
        let txt = turretDescriptions[selectedTurret];
        text(txt, X, Y, W, H);

        //locked, defeated text
        if (selectedTurret == 0){
            tc = color(129, 229, 134);
            txt = "AVAILABLE";
        } else if (selectedTurret < turretUnlocked){
            tc = color(129, 229, 134);
            txt = "PASSED";
        } else if (selectedTurret == turretUnlocked){
            tc = color(60);
            txt = "UNPASSED";
        } else {
            tc = color(180);
            txt = "LOCKED";
        }
        fill(tc);
        stroke(tc);
        strokeWeight(1.2);
        textSize(40);

        textAlign(LEFT, CENTER);
        text(txt, px+0.5*bf, py+turretPhotoHeight+42);
    }
    
    menuButtons.update(mouseX,mouseY);
    menuButtons.draw();

    
    //draw display turrets
    if (selectedTurret == 0){
        //
    } else if (selectedTurret > 0){
        push();
        translate(tX, tY);
        var sf = 2.4;
        scale(sf);
        var displayT = displayTurrets[selectedTurret-1];

        var ang = atan2( (tY-100-mouseY), (tX-mouseX) ) + PI;
        if (displayT.updateTurretAngle(ang,0.12) == false){
            displayT.makeIdle();
        } else {
            displayT.makeAlert();
            displayT.alert = true;
        }
        displayT.show();

        //make all turrets have same angle
        for (let dt of displayTurrets){
            dt.ang = displayT.ang;
        }
        pop();
    } else {
        textSize(28);
        strokeWeight(1.5);
        txt = "NO TURRET SELECTED";
        var X = px + turretPhotoWidth/2 - textWidth(txt)/2;
        var Y = py + turretPhotoHeight/2;
        textAlign(LEFT, CENTER);
        fill(130);
        stroke(130);
        text(txt, X, Y);
    }
    
    peakLoop();
}



//GAME LOOP FOR ARENA
function arenaGameloop(){
    var txt, col, tSize;
    if ( (selectedTurret != 0) && (!player.dead) && (!paused) && (arenaRunning) && (!tutorialShowing) ){
        if (!arenaStarted){
            col = "red";
            tSize = 45;
            arenaCountdown--;
            
            if (arenaCountdown >= 30*4){
                txt = "GET READY";
            } else  if (arenaCountdown > 30){
                txt = floor(arenaCountdown/FPS);
            } else {
                txt = "GO!";
                turretsActive = true;
            }

            if (arenaCountdown <= 0){
                arenaStarted = true;
            }
        } else {
            col = color(80, 80, 180, 150);
            tSize = 70;
            if (selectedTurret != 6){ //30 second timer
                arenaTimer--;
                txt = floor(arenaTimer/FPS + 1);
                if (arenaTimer <= 0){
                    arenaBeat();
                    txt = null;
                }

            } else { //number of missiles left
                var n = missilesLeft;
                txt = (n) + " missiles left";
                tSize = 55;
                if ( (missilesLeft == 0) && (!player.dead) ){
                    arenaBeat();
                    txt = null;
                }
            }
        }
    }
    if (txt){
        displayText(txt, 1, col, tSize);
    }
}