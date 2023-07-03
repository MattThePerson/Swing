function Player() {
    this.pos = createVector(0, 0);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.pe = 0;
    this.compression = 0;

    this.pointer = createVector(this.pos.x, this.pos.y);

    this.name = "player";
    this.dead = false;

    //forces
    this.thrust = createVector(0, 0);
    this.elastic = createVector(0, 0);
    this.airRes = createVector(0, 0);
    this.frict = createVector(0, 0);
    this.reelTension = createVector(0, 0);
    this.normalForce = createVector(0, 0);
    this.explosionRecoil = createVector(0, 0);
    this.slippingForce = createVector(0,0); //slipping off sides of blocks

    this.forces = [];

    this.r = 25;
    this.grounded = false;
    this.color = color(107, 0, 114);
    this.liningColor = color(200, 100, 100);
    this.shelf = null; //object on which player is resting
    this.contactObject = null;

    this.hook;
    this.hookOut = false;
    this.hooked = false;
    this.tensing = false;
    this.reeling = false;
    this.slipping = false;

    this.jumping = false;
    this.sliding = false;
    this.jumpBoost = 1;

    this.swingPoint;
    this.reelForce;
    this.ropeTaut = false;

    this.recoilsLeft = recoilsAdded;
    this.recoilSource = null;


    //UPDATE method
    this.update = function () {
        

        //makes sure player can't jump if dies while tensing
        if (this.dead){
            this.tensing = false;
            this.jumping = false;
        }

        //jump energy
        if (this.tensing) {
            var holdTime = millis() - playerJump;
            if (holdTime > 250) {
                holdTime = 250;
            }
            if (holdTime < 100) {
                this.pe = 4;
            } else {
                this.pe = 4 + (holdTime - 100) * (3 / 150);
            }
            this.compression = sqrt(abs(this.pe));

            if (!keyIsDown(32)) {  //if "space bar" has been released
                
                this.jumping = false;
                this.tensing = false;

                if (this.grounded) {
                    this.jumping = true;
                }
            }
        } else if (!this.jumping && (this.pe > 0)) {
            //you aren't holdoing "s" and you have pe
            this.pe += -1;
            if (this.pe < 0) {
                this.pe = 0;
            }
            this.compression = sqrt(abs(this.pe));
        }



        //left/right movement
        if (this.grounded && (!this.reeling)) {
            if (keyIsDown(65) && !keyIsDown(68) && (!this.dead)) {
                this.thrust.x = -1.5 * playerThrust;
            } else if (keyIsDown(68) && !keyIsDown(65) && (!this.dead)) {
                this.thrust.x = 1.5 * playerThrust;
            } else {
                this.thrust.x = 0;
            }
        } else { //in the air
            // making thrust in the air more responsive and 
            // making the max vel acheivable through thrust
            // alone less

            var maxThrust = 2; //thrust when velocity is zero
            var maxVel = 10; //velocity at which thrust equals air resistance (and thrust no longer causes acceleration)
            var k = airResCoef;

            var A;
            var B;

            B = (maxVel * maxVel) / ((maxThrust / k) - maxVel);
            A = B * maxThrust;

            if (keyIsDown(65) && !keyIsDown(68) && (!this.dead)) { //to the left
                if (this.vel.x < 0) { //if moving to the left
                    thrustInAir = A / (B + abs(this.vel.x));
                } else { //moving to the right, act as if vel = 0
                    thrustInAir = A / B;
                }
                //this.thrust.x = -thrustInAir;
                this.thrust.x = -0.2 * playerThrust;

            } else if (keyIsDown(68) && !keyIsDown(65) && (!this.dead)) { //to the right
                if (this.vel.x > 0) { //moving to the right
                    thrustInAir = A / (B + abs(this.vel.x));
                } else {
                    thrustInAir = A / B;
                }
                //this.thrust.x = thrustInAir;
                this.thrust.x = 0.2 * playerThrust;

            } else {
                this.thrust.x = 0;
            }
        }

        //ground friction
        if (this.grounded && (!this.reeling)) {
            if (this.reeling) {
                this.frict.x = p5.Vector.mult(this.vel, -0.4 * frictCoef);

            } else {
                if (this.dead){
                    this.frict = p5.Vector.mult(this.vel, -0.07*frictCoef);
                } else {
                    this.frict = p5.Vector.mult(this.vel, -frictCoef);
                }
            }
        } else {
            this.frict.x = 0;
        }



        //update string length
        if (this.hooked) {
            if ((!this.dead) && (!this.reeling) && (keyIsDown(81)) && (!keyIsDown(69))) {
                this.hook.changeLength(-5);
            } else if ((!this.dead) && (!this.reeling) && (keyIsDown(69)) && (!keyIsDown(81))) {
                this.hook.changeLength(5);
            }
        }

        this.updatePotentialEnergy();

        //normal force
        zeroVector(this.normalForce);
        if (this.grounded) {
            this.normalForce.y = -G;
        } else {
            this.normalForce.y = 0;
        }


        //Determining motion
        this.airRes = calculateDrag(this.vel, airResCoef);

        //make recoil bounce off floor
        if (this.grounded && (this.explosionRecoil.y > 0) ){
            this.explosionRecoil.y = -this.explosionRecoil.y;
        }

        this.forces = [this.thrust, this.elastic, this.airRes, this.frict, this.reelTension, this.explosionRecoil, this.slippingForce];

        this.acc = addVectors(this.forces);
        this.acc.y += G;

        this.vel = p5.Vector.add(this.acc, this.vel);
        this.pos = p5.Vector.add(this.vel, this.pos);

        //collision detection with game objects
        player.slippingForce = createVector(0,0);
        //player.slipping = false;
        this.shelf = null;
        var contacts = 0;
        for (let o of gameObjects) {
            var collisionType = o.checkCollision(this);
            if (collisionType == -1) {
                killPlayer("red");
                return 0;
            } else {
                contacts += collisionType;
            }
        }
        if (contacts == 0) {
            this.shelf = null;
            this.grounded = false;
            this.slipping = false;
        }
        if (this.shelf == null) {
            this.grounded = false;
            this.slipping = false;
        }
        

        //update hook and rope. Done after collision detection to avoid bug
        this.updateReel(this.pos);
        

        //check for checkpoints
        if ( (!this.dead) && (levelMode) ){
            for (let p of checkpoints) {
                if (!p.reached) {
                    p.check(this);
                }
            }
            if ((currentCheckpoint.order == checkpoints.length - 1) && (!levelBeat)) {
                levelCompleted();
            }
        }

        //reset explosion recoil
        this.explosionRecoil = createVector(0,0);
        
        //update pointer
        if (!this.hookOut && (!this.dead)) {
            this.pointer.x = arenaX - this.pos.x;
            this.pointer.y = arenaY - this.pos.y;
            if (this.pointer.mag() > 35) {
                this.pointer.normalize().mult(35);
            }
        } else {
            this.pointer.x = 0;
            this.pointer.y = 0;
        }

        //making sure explosion delivers limited amount of recoils
        if (this.recoilSource != null){
            if (this.recoilSource.d == 0){
                this.recoilSource = null;
                this.recoilsLeft = recoilsAdded;
            }
        }
    }





    /////OTHER METHODS /////////



    //FLING method
    this.fling = function (x, y) {
        if (!this.hookOut) {

            var ang = atan2((y - this.pos.y), (x - this.pos.x));
            var hookVel = p5.Vector.fromAngle(ang, hookSpeed);

            this.hook = new Hook(this, this.pos, hookVel);

            this.hookOut = true;
            this.hook.findAimPoint();
        }
    }


    //REEL method
    this.reel = function () {
        this.reeling = true;
    }

    //RELEASE method
    this.release = function () {
        this.hook = null;
        this.reeling = false;
        this.hooked = false;
        this.hookOut = false;
    }





    //PE method
    this.updatePotentialEnergy = function () {
        //potential energy release
        if ((!this.tensing) && (this.pe > 0) && (this.jumping)) {
            this.compression = sqrt(abs(this.pe));
            var force = - jumpStrength * this.compression;
            this.elastic.y = force;

            this.pe = 0.5 * this.pe;
            if (this.pe < 1) {
                this.pe = 0;
                this.compression = 0;
                this.jumping = false;
            }
        } else {
            this.elastic.y = 0;
        }
    }


    //UPDATE REEL method
    this.updateReel = function (pos) {

        //update hook
        if (this.hook) {
            this.hook.update(pos); 
            if (this.hook){ //because update() can nullify hook
                this.swingPoint = this.hook.returnSwingPoint();
                this.reelForce = this.hook.returnReelVector();
                var lsl = this.hook.returnLastLength();
                this.reelForce.mult(0);
                //this.pos = this.hook.returnEndPoint();
            }
        } else {
            this.swingPoint = null;
            this.reelForce = null;
        }


        zeroVector(this.reelTension);
        if (this.hooked) {
            var ropeVector = p5.Vector.sub(this.swingPoint, this.pos);

            if (this.reeling) { //rope is pulling you along
                this.reelTension = ropeVector.copy();
                this.reelTension.normalize().mult(reelThrust);

            } else {
                var dist = ropeVector.mag();
                var lastSectionLength = this.hook.returnLastLength();
                var diff = dist - lastSectionLength;

                if (diff > 0) {
                    this.ropeTaut = true;
                    //just swining there. Not interested in forces, because 
                    //then you oscillate on the end of the rope
                    this.normalForce = ropeVector.copy();
                    this.normalForce.normalize().mult(G);

                    var yDiff = this.pos.y - this.swingPoint.y;
                    var xDiff = this.pos.x - this.swingPoint.x;
                    var ang1 = atan2(yDiff, xDiff);
                    var x = this.swingPoint.x + lastSectionLength * cos(ang1);
                    var y = this.swingPoint.y + lastSectionLength * sin(ang1);

                    this.pos.x = x;
                    this.pos.y = y;

                    //recalculate velocity vector
                    var ang2 = HALF_PI - ang1;
                    var ang3 = atan2(this.vel.y, this.vel.x);
                    var mag_v = this.vel.mag();

                    var newXvel = mag_v * cos(ang2 + ang3) * cos(ang2);
                    var newYvel = -mag_v * cos(ang2 + ang3) * sin(ang2);

                    this.vel.x = newXvel;
                    this.vel.y = newYvel;
                } else {
                    this.ropeTaut = false;
                }
            }

            if (this.hook.length < minRopeLen) {
                this.release();
            }
        }
    }


    //show method//
    this.show = function () {

        var showReel = false;
        if (this.hook) {
            
            this.hook.show();

            //draw last section line incase player stretches below it
            strokeWeight(2);
            stroke(this.hook.color);
            //line(this.pos.x, this.pos.y, this.swingPoint.x, this.swingPoint.y);

            if (showReel){
                var c = color(220,50,220);
                fill(c);
                stroke(c);

                if (this.swingPoint){ //swing point
                    ellipse(this.swingPoint.x, this.swingPoint.y, 5);
                }

                //reel thrust
                line(this.pos.x, this.pos.y, this.pos.x+this.reelForce.x, this.pos.y+this.reelForce.y);
            }
        }

        //show pointer
        stroke(50, 100);
        strokeWeight(8);
        line(this.pos.x, this.pos.y, this.pos.x + this.pointer.x, this.pos.y + this.pointer.y);

        //show ball
        stroke(this.liningColor);
        noStroke();
        var cf = 1 * this.compression;
        if (this.dead){
            fill( 96, 83, 118 );
        } else {
            fill(this.color);
        }
        ellipse(this.pos.x, this.pos.y + cf, 2 * (this.r + cf), 2 * (this.r - cf));

        //fill(255);
        //ellipse(this.pos.x, this.pos.y, 5);

        //show forces
        if (showForces) {
            var factor = 20;
            drawVector(this.airRes, this.pos, "yellow", factor);
            drawVector(this.reelTension, this.pos, "cyan", factor);
            drawVector(this.thrust, this.pos, "blue", factor);
            drawVector(this.frict, this.pos, "orange", factor);
            drawVector(this.elastic, this.pos, "green", factor);
            drawVector(this.explosionRecoil, this.pos, "blue", 50);
        }
    }


    //RESET METHOD
    this.reset = function(){
        this.pos.x = playerStartX;
        this.pos.y = playerStartY;
        this.vel.x = 0;
        this.vel.y = 0;
        this.release();
        this.dead = false;
        this.recoilsLeft = recoilsAdded;
        this.recoilSource = null;
    }
}



