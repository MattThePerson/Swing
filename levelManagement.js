var displayTurrets = [];

function loadDisplayTurrets(){
    //(type, x, y, orientation, cooldown, range, minAng, maxAng) 
    //standard
    var minAng = -PI*1.15;
    var maxAng = PI*0.15;
    var fr = 0.1;

    var nt = new Turret(0, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.load();
    displayTurrets.push(nt);

    //explosive bullets
    nt = new Turret(1, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.load();
    displayTurrets.push(nt);

    //predict scatter
    nt = new TurretPredictive(0, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.displayTurret = true;
    nt.load();
    displayTurrets.push(nt);

    //bouncy
    nt = new Turret(2, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.load();
    displayTurrets.push(nt);

    //super predict
    nt = new TurretPredictive(1, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.displayTurret = true;
    nt.load();
    displayTurrets.push(nt);

    //guided missiles
    nt = new Turret(3, 0, 0, 3, 1, 1, minAng, maxAng);
    nt.ang = random(-314, 0)/100;
    nt.fireRange = fr;
    nt.displayTurret = true;
    nt.load();
    displayTurrets.push(nt);
}

function loadArena(st) {
    loadLevel(0);
    arenaTimer = arenaSurvivalTime;
    turretsActive = false;
    turretBeat = false;
    restartLevelButton.hide();
    redoTurretButton.hide();
    if (st == 0){
        tutorialButton.show();
    } else {
        tutorialButton.hide();
    }

    if (st == 0){
        tutorial(1);
        practiceMode = true;
    } else {
        practiceMode = false;
    }

    // st = turret type
    // 1 = standard
    // 2 = exploding bullets
    // 3 = predictive scatter
    // 4 = super predictive
    // 5 = bouncy bullets
}




function returnToMainMenu() {
    inGame = false;
    continueButton.hide();
    redoLevelButton.hide();
    redoArenaButton.hide();
    redoTurretButton.hide();
    yesButton.hide();
    noButton.hide();
    endTutorial();
    activatePeakText();
    paused = false;
    player.dead = false;

    if (levelMode){
        CPinL[level - 1] = currentCheckpoint.order;
        if (levelBeat){
            if (level < levelAmount){
                level++;
            }
        }
        levelMenuButtons.toggleOff();
        levelMenuButtons.toggleButton(level);
    } else {
        arenaCountdown = 30*6;
        arenaTimer = arenaSurvivalTime;
        arenaStarted = false;
        arenaRunning = true;
        if (turretBeat){
            if (selectedTurret < turretAmount){
                selectedTurret++;
            }
        }
        arenaMenuButtons.toggleOff();
        arenaMenuButtons.toggleButton(selectedTurret);
    }

}


//restart arena function
function restartArena(){
    paused = false;
    redoArenaButton.hide();
    redoTurretButton.hide();
    continueButton.hide();
    arenaRunning = true;
    arenaCountdown = 30*6;
    arenaTimer = arenaSurvivalTime;
    arenaStarted = false;
    dyingEnabled = true;
    player.reset();
    bullets = [];
    for (let m of missiles){
        m.destroyed = true;
    }
    missiles = [];
    if (selectedTurret == 6){ //reset missile amount
        missilesLeft = missilesToBeat;
    }
}

//restart level function
function restartLevel() {
    for (let n = 1; n < checkpoints.length; n++) {
        checkpoints[n].reset();
    }
    currentCheckpoint = checkpoints[0];
    levelBeat = false;
    paused = false;
    noTouch = true;
    dyingEnabled = true;
    redoLevelButton.hide();
    continueButton.hide();
    yesButton.hide();
    noButton.hide();
    displayText();
    bullets = [];
    for (let m of missiles){
        m.destroyed = true;
    }
    missiles = [];
    restoreCheckpoint();
}


function arenaBeat(){
    turretBeat = true;
    dyingEnabled = false;
    displayText("TURRET BEAT", 3, "red", 45);
    arenaRunning = false;
    turretsActive = false;
    continueButton.show();
    redoArenaButton.show();
    
    if (selectedTurret == turretUnlocked){
        turretUnlocked++;
    }
}

//level completed function
function levelCompleted() {
    levelBeat = true;
    noTouch = false;
    dyingEnabled = false;
    if (level == levelAmount) {
        gameBeat = true;
        displayText("Congratulations! You beat the game!", 4);
    } else {
        displayText("Level " + level + " beat!", 3);
    }

    if (level == levelUnlocked) {
        levelUnlocked++;
    }

    continueButton.showing = true;
    redoLevelButton.showing = true;
}



//load level funtion
function loadLevel(n) {

    if (n == 1) {
        if (!tutorialSeen){
            tutorial(1);
        }
    }

    //level = n;
    levelBeat = false;
    noTouch = true;
    dyingEnabled = true;

    var th = 200; //thickness of arena side blocks
    var wallColor = color(0, 138, 168);

    explosions = [];
    bullets = [];
    missiles = [];

    if (n == 0) { //arena survival
        levelMode = false;
        arenaMode = true;
        if (selectedTurret == 0){ //make tower red for p turrets
            loadBlocks(arena_practice_data);
        } else if (selectedTurret == 1){ //standard
            loadBlocks(arena_none_data);
        } else if ( (selectedTurret == 2) || (selectedTurret == 4) ){ //exploding and bouncy
            loadBlocks(arena_none_data);
        } else if (selectedTurret == 3){ // scatter
            loadBlocks(arena_none_data);
        } else if (selectedTurret == 5) { //super
            loadBlocks(arena_none_data);
        } else if (selectedTurret == 6){ //missiles
            loadBlocks(arena_i_rt_data);
        }
        loadTurrets(arenaTurretData);
        if (selectedTurret == 6){
            missilesLeft = missilesToBeat;
        }
        player.reset();

    } else {
        levelMode = true;
        arenaMode = false;
        turretsActive = true;
        restartLevelButton.show();
        tutorialButton.show();
        loadBlocks(blockDatum[n - 1]);
        loadTurrets(turretDatum[n - 1]);

        let currentI = CPinL[n - 1];
        currentCheckpoint = checkpoints[currentI];

        if ((currentCheckpoint.order == checkpoints.length - 1) && (checkpoints.length > 1)) {
            noTouch = false;
            dyingEnabled = false;
            redoLevelButton.showing = true;
            continueButton.showing = true;
        }

        //make each checkpoint up to current checkpoint reached
        for (let i = 0; i < currentCheckpoint.order; i++) {
            checkpoints[i].reached = true;
        }

        restoreCheckpoint();
    }

    var ground = new Block(-th, arenaHeight, arenaWidth + 2 * th, th);
    ground.color = color(wallColor);
    ground.surface = "ground";
    ground.wallBlock = true;
    gameObjects.push(ground);

    var ceiling = new Block(-th, -th, arenaWidth + 2 * th, th);
    ceiling.color = color(wallColor);
    ceiling.surface = "ceiling";
    ceiling.wallBlock = true;
    gameObjects.push(ceiling);

    var leftWall = new Block(-th, -th, th, arenaHeight + 2 * th);
    leftWall.color = color(wallColor);
    leftWall.surface = "leftwall";
    leftWall.wallBlock = true;
    gameObjects.push(leftWall);

    var rightWall = new Block(arenaWidth, -th, th, arenaHeight + 2 * th);
    rightWall.color = color(wallColor);
    rightWall.surface = "rightwall";
    rightWall.wallBlock = true;
    gameObjects.push(rightWall);

    inGame = true;
    dispX = 0;
    dispY = -(playerStartY - height / 2);

}

//RESTORE CHECKPOINT
function restoreCheckpoint(i) {
    if (i != undefined) {
        currentCheckpoint = checkpoints[i];
    }
    player.pos.x = currentCheckpoint.spawnX;
    player.pos.y = currentCheckpoint.spawnY;
    player.vel.x = 0;
    player.vel.y = 0;
    player.grounded = false;
    player.release();

    //reset turret cooldowns
    for (let t of turrets) {
        t.cooldown = t.cooldownTime;
    }

    bullets = [];
    for (let m of missiles){
        m.destroyed = true;
    }
     missiles = [];
}