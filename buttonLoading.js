//button variables

//button groups
var menuButtons;
var levelButtons;
var inGameButtons;
var arenaSurvivalButtons;
var homeScreenButtons;

//home screen buttons
var backButton;
var playLevelsButton;
var arenaSurvivalButton;
var twoPlayerButton;
var aboutButton;

//level menu buttons
var playButton;
var levelOneButton;
var levelTwoButton;
var levelThreeButton;
var levelFourButton;

//inGame buttons
var mainMenuButton;
var showControlsButton;
var hideControlsButton;
var continueButton;
var redoLevelButton;
var unpauseButton;
var yesButton;
var noButton;
var tutorialButton;
var restartLevelButton;
var redoTurretButton;



//loadButtons function
function loadButtons(){

    menuButtons = new buttonGroup();
    levelMenuButtons = new buttonGroup();
    levelMenuButtons.hide();
    inGameButtons = new buttonGroup();
    arenaMenuButtons = new buttonGroup();
    arenaMenuButtons.hide();
    homeMenuButtons = new buttonGroup();
    

    menuButtons.add(levelMenuButtons);
    menuButtons.add(arenaMenuButtons);
    menuButtons.add(homeMenuButtons);

    var buttonWidth = 300;
    var BH = 50;
    var tx;
    var TS = 30;
    textSize(TS);

    //MENU BUTTONS ///////

    //PLAY LEVELS BUTTON
    tx = "play levels";
    playLevelsButton = new Button(width/2-buttonWidth/2, height*0.4 + BH*1, buttonWidth, BH, tx, TS);
    homeMenuButtons.add(playLevelsButton)
    playLevelsButton.click = function(){
        menuLoop = levelLoop;
        homeMenuButtons.hide();
        levelMenuButtons.show();
        backButton.show();
    }

    //ARENA SURVIVAL BUTTON
    tx = "arena survival";
    arenaSurvivalButton = new Button(width/2-buttonWidth/2, height*0.4 + BH*2.5, buttonWidth, BH, tx, TS);
    homeMenuButtons.add(arenaSurvivalButton)
    arenaSurvivalButton.click = function(){
        menuLoop = arenaLoop;
        homeMenuButtons.hide();
        arenaMenuButtons.show();
        backButton.show();
    }

    //ABOUT Button
    tx = "about";
    aboutButton = new Button(width/2-buttonWidth/2, height*0.4 + BH*4, buttonWidth, BH, tx, TS);
    //aboutButton.hide();
    homeMenuButtons.add(aboutButton);
    aboutButton.click = function(){
        menuLoop = aboutLoop;
        homeMenuButtons.hide();
        frameRate(60);
        backButton.show();
    }

    //TWOPLAYER BUTTON
    tx = "two player";
    twoPlayerButton = new Button(width/2-buttonWidth/2, height*0.4 + BH*4, buttonWidth, BH, tx, TS);
    twoPlayerButton.deactivate();
    twoPlayerButton.hide();
    homeMenuButtons.add(twoPlayerButton);
    
    


    

    //PLAY BUTTON
    tx = "play";
    playButton = new Button(width*0.8, height*0.85, buttonWidth*0.6, BH, tx, TS);
    levelMenuButtons.add(playButton);
    playButton.activated = false;
    playButton.click = function(){
        loadLevel(level);
    }
    

    /////LEVEL MENU BUTTONS ///////

    levelButtonX = 40;
    levelButtonY = 120;
    LTS = 26;
    textSize(LTS);

    //LEVEL 1 BUTTON
    tx = "level 1: red!";
    levelOneButton = new Button(levelButtonX, levelButtonY+BH*1, buttonWidth, BH, tx,LTS);
    levelMenuButtons.add(levelOneButton);
    levelOneButton.click = function(){
        playButton.activated = true;
        level = 1;
        levelMenuButtons.toggleOff();
        levelOneButton.toggled = true;
    };
    

    tx = "level 2: turrets!";
    levelTwoButton = new Button(levelButtonX, levelButtonY+BH*2.5, buttonWidth, BH, tx,LTS);
    //levelTwoButton.activated = false;
    levelMenuButtons.add(levelTwoButton);
    levelTwoButton.click = function(){
        level = 2;
        if (levelUnlocked >= level){
            playButton.activated = true;
        } else {
            playButton.activated = false;
        }
        levelMenuButtons.toggleOff();
        levelTwoButton.toggled = true;
    };
    

    tx = "level 3: explosions!";
    levelThreeButton = new Button(levelButtonX, levelButtonY+BH*4, buttonWidth, BH, tx,LTS);
    levelThreeButton.showing = true;
    levelMenuButtons.add(levelThreeButton);
    levelThreeButton.click = function(){
        level = 3;
        if (levelUnlocked >= level){
            playButton.activated = true;
        } else {
            playButton.activated = false;
        }
        levelMenuButtons.toggleOff();
        levelThreeButton.toggled = true;
    };
    

    tx = "level 4: missiles!";
    levelFourButton = new Button(levelButtonX, levelButtonY+BH*5.5, buttonWidth, BH, tx,LTS);
    levelMenuButtons.add(levelFourButton);
    
    levelFourButton.click = function(){
        level = 4;
        if (levelUnlocked >= level){
            playButton.activated = true;
        } else {
            playButton.activated = false;
        }
        levelMenuButtons.toggleOff();
        levelFourButton.toggled = true;
    };
    
    
    /////ARENA MENU BUTTONS
    //STANDARD TURRET BUTTON
    var ATS = 24;
    BH = 60;
    buttonH = 40;
    buttonWidth = 280;
    var arenaButtonY = 110;

    //PRACTICE
    tx = "practice mode";
    practiceModeButton = new Button(levelButtonX, arenaButtonY+BH*1-20, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(practiceModeButton);
    practiceModeButton.click = function(){
        selectTurret(0);
    };

    //STANDARD TURRET
    tx = "standard turret";
    standardTurretButton = new Button(levelButtonX, arenaButtonY+BH*2, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(standardTurretButton);
    standardTurretButton.click = function(){
        selectTurret(1);
    };


    //EXPLODING BULLETS BUTTON
    tx = "exploding bullets";
    explodingBulletsButton = new Button(levelButtonX, arenaButtonY+BH*3, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(explodingBulletsButton);
    explodingBulletsButton.click = function(){
        selectTurret(2);
    };


    //PREDICTIVE SCATTER BUTTON
    tx = "predictive scatter";
    predictiveScatterButton = new Button(levelButtonX, arenaButtonY+BH*4, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(predictiveScatterButton);
    predictiveScatterButton.click = function(){
        selectTurret(3);
    };

    //BOUNCY BULLETS BUTTON
    tx = "bouncy bullets";
    bouncyBulletsButton = new Button(levelButtonX, arenaButtonY+BH*5, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(bouncyBulletsButton);
    bouncyBulletsButton.click = function(){
        selectTurret(4);
    };

    //SUPER PREDICTIVE BUTTON
    tx = "super predictive";
    superPredictiveButton = new Button(levelButtonX, arenaButtonY+BH*6, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(superPredictiveButton);
    superPredictiveButton.click = function(){
        selectTurret(5);
    };

    //GUIDED MISSILES
    tx = "guided missiles";
    guidedMissilesButton = new Button(levelButtonX, arenaButtonY+BH*7, buttonWidth, buttonH, tx, ATS);
    arenaMenuButtons.add(guidedMissilesButton);
    guidedMissilesButton.click = function(){
        selectTurret(6);
    };


    //PLAY ARENA BUTTON
    tx = "play";
    playArenaButton = new Button(width*0.8, height*0.85, buttonWidth*0.6, 50, tx, TS);
    arenaMenuButtons.add(playArenaButton);
    playArenaButton.activated = false;
    playArenaButton.click = function(){
        loadArena(selectedTurret);
    }


    //BACK BUTTON
    textSize(16);
    tx = "back";
    backButton = new Button(50, height-100, 120, 40, tx, LTS);
    menuButtons.add(backButton);
    backButton.hide();
    backButton.click = function(){
        menuLoop = homeLoop;
        backButton.hide();
        homeMenuButtons.show();
        levelMenuButtons.hide();
        arenaMenuButtons.hide();
        frameRate(30);
    }



    //IN GAME BUTTONS////////////
    textSize(16);

    //SHOW CONTROLS
    tx = "show controls";
    showControlsButton = new Button(10, 10, textWidth(tx)*1.2, 30, tx);
    showControlsButton.textSize = 16;
    inGameButtons.add(showControlsButton);
    showControlsButton.hide();
    showControlsButton.click = function(){
        hideControlsButton.show();
        showControlsButton.hide();
        displayingCommands = true;
    };
    

    //HIDE CONTROLS
    tx = "hide controls";
    hideControlsButton = new Button(10, 10, textWidth(tx)*1.2, 30, tx);
    hideControlsButton.textSize = 16;
    hideControlsButton.showing = false;
    hideControlsButton.click = function(){
        showControlsButton.show();
        hideControlsButton.hide();
        displayingCommands = false;
    };
    inGameButtons.add(hideControlsButton);

    //MAIN MENU
    tx = "main menu";
    mainMenuButton = new Button( 10, 10, textWidth(tx)*1.2, 30, tx);
    mainMenuButton.textSize = 16;
    mainMenuButton.click = function(){
        if ( (!player.dead) && (!practiceMode) ){
            endTutorial();
            paused = true;
            displayText("Return to Main Menu?", null, null, 50);
            if (levelMode){
                displayLowerText("You can return to your current checkpoint");
            }
            yesButton.show();
            yesButton.click = returnToMainMenu;
            noButton.show();
        } else {
            returnToMainMenu();
        }
    }
    inGameButtons.add(mainMenuButton);

    //TUTORIAL
    tx = "controls";
    xp = 10+mainMenuButton.w+20;
    tutorialButton = new Button(xp, 10, textWidth(tx)*1.2, 30, tx);
    tutorialButton.textSize = 16;
    tutorialButton.click = function(){
        tutorial(1);
    };
    inGameButtons.add(tutorialButton);

    //RESTART LEVEL BUTTON
    tx = "restart level";
    var xp = 10+mainMenuButton.w+20+tutorialButton.w+20;
    restartLevelButton = new Button( xp, 10, textWidth(tx)*1.3, 30, tx);
    restartLevelButton.textSize = 16;
    inGameButtons.add(restartLevelButton);
    restartLevelButton.click = function(){
        if (!levelBeat){
            paused = true;
            displayText("Retart Level?", null, null, 50);
            yesButton.show();
            yesButton.click = restartLevel;
            noButton.show();
        } else {
            restartLevel();
        }
    }
    

    

    //REDO TURRET BUTTON
    tx = "redo turret";
    redoTurretButton = new Button(width/2-textWidth(tx)/2, height/2+30, textWidth(tx)*1.2, 30, tx, 16);
    redoTurretButton.click = restartArena;
    redoTurretButton.hide();
    inGameButtons.add(redoTurretButton);

    //YES BUTTON
    tx = "yes";
    yesButton = new Button( width/2-textWidth(tx)/2-60, height/2+70, 60+textWidth(tx)*1.2, 50, tx, 28);
    yesButton.hide();
    inGameButtons.add(yesButton);
    

    //NO BUTTON
    tx = "no";
    noButton = new Button( width/2-textWidth(tx)/2+60, height/2+70, 60+textWidth(tx)*1.2, 50, tx, 28);
    noButton.hide();
    noButton.click = function(){
        displayText();
        displayLowerText();
        yesButton.hide();
        noButton.hide();
        paused = false;
    }
    inGameButtons.add(noButton);


    //CONTINUE BUTTON
    tx = "continue";
    continueButton = new Button( width-textWidth(tx)*2-40, height-40, textWidth(tx)*1.3, 30, tx);
    continueButton.textSize = 16;
    continueButton.showing = false;
    continueButton.click = returnToMainMenu;
    inGameButtons.add(continueButton);

    //REDO LEVEL BUTTON
    tx = "redo level";
    redoLevelButton = new Button( width-160-textWidth(tx)*2, height-40, textWidth(tx)*1.3, 30, tx);
    redoLevelButton.textSize = 16;
    redoLevelButton.showing = false;
    redoLevelButton.click = restartLevel;
    inGameButtons.add(redoLevelButton);


    //REDO ARENA BUTTON
    tx = "redo turret";
    redoArenaButton = new Button( width-160-textWidth(tx)*2, height-40, textWidth(tx)*1.3, 30, tx);
    redoArenaButton.textSize = 16;
    redoArenaButton.showing = false;
    redoArenaButton.click = restartArena;
    inGameButtons.add(redoArenaButton);

    //UNPAUSE BUTTON
    tx = "unpause";
    unpauseButton = new Button( width/2-textWidth/2, height*0.6, textWidth(tx)*1.2, 30, tx);
    unpauseButton.textSize = 16;
    unpauseButton.showing = false;
    unpauseButton.click = function(){
        paused = false;
        unpauseButton.showing = false;
    };
    inGameButtons.add(unpauseButton);

}

