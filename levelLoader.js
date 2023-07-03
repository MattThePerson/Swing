//doesn't actually load data, which is done in preload()
//makes the blocks from the data
function loadBlocks(data) {

    gameObjects = [];
    checkpoints = [];

    //get arena variables and player start position
    playerStartX = data.getNum(0, "x");
    playerStartY = data.getNum(0, "y");
    arenaWidth = data.getNum(0, "w");
    arenaHeight = data.getNum(0, "h");


    var firstCheckpoint = new Checkpoint(playerStartX, playerStartY, 1, 1);
    checkpoints.push(firstCheckpoint);
    firstCheckpoint.reached = true;

    var type, x, y, w, h;

    for (let j = 1; j < data.getRowCount(); j++) {
        type = data.getNum(j, "type");
        x = data.getNum(j, "x");
        y = data.getNum(j, "y");
        w = data.getNum(j, "w");
        h = data.getNum(j, "h");

        if (type == 3) { //create checkpoints
            var cP = new Checkpoint(x, y, w, h);
            checkpoints.push(cP);

        } else { //create other blocks
            var newBlock = new Block(x, y, w, h, type);
            gameObjects.push(newBlock);

            if (type == 0) { //standard block
                //newBlock.color = color(46, 134, 193);
                newBlock.color = color(0, 138, 168);
                //newBlock.color = color(128, 171, 164);
            } else if (type == 1) { //red block
                //newBlock.color = color(240, 93, 93);
                newBlock.color = color(212, 69, 86);
            } else if (type == 2) { //green block
                newBlock.color = color(28, 222, 25);
            } else if (type == 4) { //checkpoint block
                newBlock.color = color(160, 24, 211);
            }
        }
    }

    //sort checkpoints
    checkpoints.sort(function (a, b) { return (a.x - b.x) });
    for (let i = 0; i < checkpoints.length; i++) {
        checkpoints[i].order = i;
    }

    //console.log("blocks loaded");
}


//load turrets function
function loadTurrets(data) {

    turrets = [];

    var type, x, y, orientation, cooldown, range, minAng, maxAng;

    for (let j = 0; j < data.getRowCount(); j++) {

        type = data.getNum(j, "type");
        x = data.getNum(j, "x");
        y = data.getNum(j, "y");
        orientation = data.getNum(j, "orientation");
        cooldown = data.getNum(j, "cooldown");
        range = data.getNum(j, "range");
        minAng = data.getNum(j, "minAng");
        maxAng = data.getNum(j, "maxAng");

        var noTurret = false;
        if (!levelMode) { //chose turret type in arena survival
            if (selectedTurret == 2) { //exploding bullets
                type = 1;
            } else if (selectedTurret == 3) { //scatter predictive
                type = 10;
            } else if (selectedTurret == 4) { //super predictive
                type = 2;
                cooldown = 40;
            } else if (selectedTurret == 5) { //bouncy
                type = 11;
            } else if (selectedTurret == 6){ //guided missiles
                type = 3;
                cooldown = 15;
            } else if (selectedTurret == 0) {
                noTurret = true;
            }
        }

        if (!noTurret) {
            var newTurret;
            if (type < 10) {
                newTurret = new Turret(type, x, y, orientation, cooldown, range, minAng, maxAng);
                newTurret.load();
            } else {
                newTurret = new TurretPredictive(type - 10, x, y, orientation, cooldown, range, minAng, maxAng);
                newTurret.load();
            }
            turrets.push(newTurret);
        }
    }


    // st = turret type
    // 1 = standard
    // 2 = explosing bullets
    // 3 = predictive scatter
    // 4 = bouncy bullets
    // 5 = super predictive


}