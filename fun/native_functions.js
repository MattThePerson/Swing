// functions native to p5.js


//KEYTYPED
function keyTyped() {

    if (!paused) {
        //charge jump
        if (!player.dead) {
            if (key == " ") {
                playerJump = millis();
                player.tensing = true;
                return false;
            }

            //fling hook
            if ((key == "w") || (key == "W")) {
                if (!player.hookOut) {
                    player.fling(arenaX, arenaY);
                } else {
                    player.reel();
                }
            }

            //release hook
            if ((key == "s") || (key == "S")) {
                player.reel();
                player.release();
            }
        }
    }
    if (key == "p") {
        if (inGame) {
            if (paused) {
                paused = false;
                unpauseButton.showing = false;
            } else {
                paused = true;
                unpauseButton.showing = true;
            }
        }
    }

    //if (key == "f") {
    //    if (turrets[1].firing) {
    //        turrets[1].firing = false;
    //        console.log("firing stopped");
    //    } else {
    //        turrets[1].firing = true;
    //        console.log("firing started");
    //    }
    //}

    if (tutorialShowing) {
        if (key == "n") {
            tutorial();
        } else if (key == "c") {
            endTutorial();
        }
    }
}

function keyPressed() {
    if (keyCode == ESCAPE) {
        if (!homeScreen) {
            returnToMainMenu();
        }
    }
}

//let go of hook
function keyReleased() {
    if (((key == "w") || (key == "W")) && player.reeling) {
        if (!paused) {
            player.release();
        }
    }
}


function mousePressed() {
    if (inGame) {
        //explode(arenaX, arenaY, 100);
        inGameButtons.checkForClick(mouseX, mouseY);

    } else if ((!showingTitle) && (!paused)) {
        if (menuButtons){
            menuButtons.checkForClick(mouseX, mouseY);
        }
    }

    if (keyIsDown(67)) {
        console.log(arenaX, arenaY);
    }

    //about page scrolling
    if (menuLoop == aboutLoop){
        if ( (mouseX > aboutBoxX) && (mouseY > aboutBoxY) && 
        (mouseX < (width-aboutBoxX)) && (mouseY < (height-aboutBoxY)) ){
            grabbing = true;
            grabY = mouseY
            scrollY = aboutPageScroll;
        }
    }
}

function mouseReleased() {

    if (inGame) {
        inGameButtons.checkForRelease(mouseX, mouseY);

    } else {
        if (menuButtons){ //gets rid of bug with clicking on canvas before menubuttons are loaded
            menuButtons.checkForRelease(mouseX, mouseY);
        }
    }


    //peak text activation
    if (!inGame) {
        if ((!peakTextMoving && (!peakTime)) && (mouseY < 70) && (mouseX > width / 2) && (mouseX < width - 50)) {
            activatePeakText(-20);
        }
    }

    //about page scrolling
    if (grabbing){
        grabbing = false;
    }
}



// about page scrolling
function mouseWheel(event) {

    var scrollAmount = 24;

    if (event.delta > 0) { //scroll up/make aboutPageScroll smaller
        aboutPageScroll += scrollAmount;
        var max = aboutTextHeight - 2*aboutBoxY;
        if (aboutPageScroll > max){
            aboutPageScroll = max;
        }        
    } else {
        aboutPageScroll += -scrollAmount;
        if (aboutPageScroll < 0){
            aboutPageScroll = 0;
        }
    }

}