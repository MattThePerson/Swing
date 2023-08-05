function TurretPredictive(type, x, y, orientation, cooldown, range, minAng, maxAng) {
    this.type = type; //0 is linear predictive, 1 is quadratic predictive
    this.baseX = x;
    this.baseY = y;
    this.headX;
    this.headY;
    this.stemLn = 30;
    this.headLn = 50;
    this.x;
    this.y;

    this.o = orientation; //0 for left wall, 1 for ceiling, 2 for right wall, 3 for ground
    this.ang = -1;
    this.range = range;
    this.color = color(192, 192, 192);

    this.volleyAmount = 3;
    this.volleyCount = this.volleyAmount;

    this.minAng = minAng;
    this.maxAng = maxAng;

    this.targetAquired = false;
    this.bulletSpeed = 25;
    this.fireRange = 0.2;
    this.fireAng;
    this.fireTimerAmount = 3;
    this.fireTimer = 0;
    
    this.bulletColor;
    this.dotColor;

    this.cooldownTime = cooldown;
    this.cooldown = this.cooldownTime;

    this.displayTurret = false;

    //idle animation variables
    this.scanning = false;
    this.idleTimer = 0;
    this.scanDirection;
    this.scanSpeed;
    this.alert = false;

    // set x and y
    if (orientation == 0) {
        this.x = x + this.stemLn;
        this.y = y;
    } else if (orientation == 1) {
        this.x = x;
        this.y = y + this.stemLn;

    } else if (orientation == 2) {
        this.x = x - this.stemLn;
        this.y = y;

    } else if (orientation == 3) {
        this.x = x;
        this.y = y - this.stemLn;
    }

    this.headX = this.x;
    this.headY = this.y;

    this.pos = createVector(this.headX, this.headY); //only needed for predict function
    this.firing = true;


    /////////METHODS //////////////

    //LOAD METHOD
    this.load = function () {

        if (this.type == 0) {
            this.bulletColor = color(77, 186, 77);

        } else if (this.type == 1) {
            this.bulletColor = color(254, 26, 254);
            this.color = color(75);
            this.bulletSpeed = 25;
            this.cooldown += random(-5, 15);
        }

        //close blocks
        if (!this.displayTurret) {
            if (this.type == 1) {
                this.closeBlocks = [];
                this.showBlocks = false;

                let pos1 = createVector(2476, 380)
                let pos2 = createVector(2676, 400)
                this.predictedPositions = [];

                for (let b of gameObjects) {
                    for (let c of b.corners) {
                        if (dist(this.x, this.y, c.x, c.y) < 1.5 * this.range) {
                            let nb = new Block(b.x, b.y, b.w, b.h, 0);
                            this.closeBlocks.push(nb);
                            break;
                        }
                    }
                }
            }
        }
    }

    //FIRE method
    this.fire = function () {
        var fireAng;
        var fireAhead = true;

        if (this.type == 0) {
            fireAng = this.ang;

        } else if (this.type == 1) {
            hitPoint = predictNumeric(this, player, airResCoef, frictCoef, G, playerThrust);

            fireAng = atan2((hitPoint.y - this.pos.y), (hitPoint.x - this.pos.x));
            
            this.fireAng = fireAng;
            this.fireTimer = this.fireTimerAmount;

            //check if bullet will hit block instead of player
            var thisPoint = new Point(this.pos.x, this.pos.y);
            var bulletLine = new Vertex(thisPoint, hitPoint);

            if (levelMode){
                for (let b of this.closeBlocks) {
                    for (let v of b.vertices) {
                        if (linesIntersecting(bulletLine, v)) {
                            fireAhead = false;
                        }
                    }
                }
            }
        }

        if (fireAhead) {
            var pos, vel, parent, col;
            parent = this;
            vel = p5.Vector.fromAngle(fireAng, this.bulletSpeed);
            pos = createVector(this.headX, this.headY); //Because of predictive firing
            col = this.bulletColor;

            var newBullet = new Bullet(pos, vel, parent, col);
            bullets.push(newBullet);

        } else { //basically if numeric predict fireang will hit hit player
            this.cooldown = 3;
        }
    }

    //MAKE ALERT METHOD
    this.makeAlert = function(){
        this.dotColor = alertDotColor;
        this.scanning = false;
    }

    //MAKE IDLE METHOD
    this.makeIdle = function(){
        this.updateIdleAnimation();

        if (!this.alert){
            this.dotColor = idleDotColor;
        }
    }



    //UPDATE method
    this.update = function (thing) {

        var y2 = thing.pos.y;
        var x2 = thing.pos.x;
        var y1 = this.headY;
        var x1 = this.headX;

        
        var d = dist(x2, y2, x1, y1);

        this.targetAquired = false;
        if ((turretsActive) && (d < this.range)) { //if player in range

            //update dot color
            
            this.makeAlert();

            this.cooldown--;
            //console.log("in range. cooldown: "+this.cooldown);
            var ang;

            if (this.type == 0) { //type linear predictive
                ang = predictLinear(thing.pos, thing.vel, this.pos, this.bulletSpeed);
                if (!ang) { //ie if player speed greater than bullet speed
                    var adder = 1.1;
                    var angT = p5.Vector.sub(thing.pos, this.pos).heading();
                    if (thing.vel.x > 0) {
                        ang = angT + adder;
                    } else {
                        ang = angT - adder;
                    }
                }

            } else if (this.type == 1) { //type quad predictive
                ang = atan2((y2 - y1), (x2 - x1));
            }

            //getting super to turn towards fire ang
            var turnAng;
            var FR = null;
            if (this.fireTimer == 0){
                turnAng = ang;
            } else {
                turnAng = this.fireAng;
                FR = 0.4;
                this.fireTimer--;
            }
            
            //reacting to turn angle
            if (this.updateTurretAngle(turnAng, FR) == false){
                this.makeIdle();
            } else {
                this.alert = true; //getting dot color to delay switching to white
            }

        } else { //if not in range
            this.makeIdle();
            if (this.cooldown < this.cooldownTime) {
                if (this.type == 0) {
                    this.cooldown++;
                }
            }
        }

        //ang has been set. Adjust head
        if (this.o == 3){ //for turrets on the ground for now
            var degAng = this.ang*180/PI + 90;
            var adjX = 0;
            var adjY = 0;
            if (degAng < -110){
                var adjX = -(13/45) * abs( degAng + 110);
                var adjY = -(8/45) * abs( degAng + 110);
            } else if (degAng > 110) {
                var adjX = (13/45) * abs( degAng - 110);
                var adjY = -(8/45) * abs( degAng - 110);
            }
            this.headX = this.x + adjX;
            this.headY = this.y + adjY;
            this.pos = createVector(this.headX, this.headY);
        }

        //firing stuff
        var holdingFire = false;
        if (this.cooldown <= 0) {
            if (this.firing) {
                if ( (arenaMode) || (this.type == 0) ){
                    this.fire();
                } else if (player.vel.mag() > 0.1) {
                    this.fire();
                } else {
                    holdingFire = true;
                }
            }

            if (this.type == 0) { //linear predictive with volley mechanic
                if (this.volleyCount > 0) {
                    this.cooldown = 5;
                    this.volleyCount--;
                } else {
                    this.cooldown = this.cooldownTime;
                    this.volleyCount = this.volleyAmount;
                }

            } else if (this.type == 1) {
                if (!holdingFire) {
                    this.cooldown = this.cooldownTime + random(-10, 28);
                } else {
                    this.cooldown = 10;
                }
            }
        }
    }


    //UPDATE ANGLE METHOD
    this.updateTurretAngle = function(ang, fr){

        ang = this.adjustAngle(ang);

        var diff = ang - this.ang;
        var bufferAng = 30 / 180 * PI;

        var fireRange;
        if (fr != undefined){
            fireRange = fr;
        } else if (this.type == 0) {
            fireRange = 0.4;
        } else if (this.type == 1) {
            fireRange = 0.2;
        }

        if (abs(diff) < fireRange) { //if angle is small enough
            this.targetAquired = true;
            this.ang = ang;

        } else { //angle too large
            if ((ang < this.minAng) && (ang > this.minAng - bufferAng)) { //player in min buffer
                this.ang += -fireRange;
            } else if ((ang > this.maxAng) && (ang < this.maxAng + bufferAng)) { //player in max buffer
                this.ang += fireRange;
            } else if ((ang > this.minAng) && (ang < this.maxAng)) { //player in mobile zone
                this.ang += fireRange * (diff / abs(diff));
            } else { //turret doesn't react
                return false;
            }
        }

        //keep angle in bounds
        if (this.ang < this.minAng) {
            this.ang = this.minAng;
        } else if (this.ang > this.maxAng) {
            this.ang = this.maxAng;
        }
    }


    //SHOW method
    this.show = function () {
        //show closeBlocks
        if (this.showBlocks) {
            for (let b of this.closeBlocks) {
                fill(220, 100, 220, 100);
                rect(b.x, b.y, b.w, b.h);
            }

            //show predicted player positions
            fill(220, 100, 220, 50);
            noStroke();
            for (let p of this.predictedPositions) {
                ellipse(p.x, p.y, 2 * player.r);
            }
        }

        var x, y, w, h;
        var buffer = 5;
        var radius = 18;
        var stemTh = 8;
        var stemLn = 100;
        var baseTh = 12;
        var baseLn = 45;
        var gunTh = 6;
        var gunLn = 25;
        var trunkLn = this.stemLn - baseTh;

        fill(this.color);
        strokeWeight(2);
        stroke(40);

        //drawing head
        push();
        translate(this.headX, this.headY);
        x = 0;
        y = -gunTh / 2;
        w = radius * 1.5;
        h = gunTh;
        rotate(this.ang);
        fill(50);
        rect(x, y, w, h);
        pop();

        var shinyDotSize = 3.6;

        //drawing base and dome
        if (this.o == 0) { //right side of wall
            //trunk
            x = this.baseX + baseTh;
            y = this.baseY - radius;
            w = trunkLn;
            h = 2 * radius;
            rect(x, y, w, h);
            //dome
            x = this.x;
            y = this.y;
            arc(x, y, 2 * radius, 2 * radius, -0.5 * PI, 0.5 * PI);
            //base
            x = this.baseX;
            y = this.baseY - baseLn / 2;
            w = baseTh;
            h = baseLn;
            rect(x, y, w, h);
            //draw shiny dot
            x = this.baseX + baseTh + trunkLn / 2;
            y = this.baseY - 0.3 * radius;
            drawShinyDot(x, y, shinyDotSize, this.dotColor);

        } else if (this.o == 1) { //on ceiling
            //trunk
            x = this.baseX - radius;
            y = this.baseY + baseTh;
            w = radius * 2;
            h = trunkLn;
            rect(x, y, w, h);
            //dome
            x = this.x;
            y = this.y;
            arc(x, y, 2 * radius, 2 * radius, 0, PI);
            //base
            x = this.baseX - baseLn / 2;
            y = this.baseY;
            w = baseLn;
            h = baseTh;
            rect(x, y, w, h);
            //draw shiny dot
            x = this.baseX + 0.3 * radius;
            y = this.baseY + baseTh + trunkLn / 2;
            drawShinyDot(x, y, shinyDotSize, this.dotColor);

        } else if (this.o == 2) { //left side of wall
            //trunk
            x = this.baseX - baseTh - trunkLn;
            y = this.baseY - radius;
            w = trunkLn;
            h = 2 * radius;
            rect(x, y, w, h);
            //dome
            x = this.x;
            y = this.y;
            arc(x, y, 2 * radius, 2 * radius, 0.5 * PI, 1.5 * PI);
            //base
            x = this.baseX - baseTh;
            y = this.baseY - baseLn / 2;
            w = baseTh;
            h = baseLn;
            rect(x, y, w, h);
            //draw shiny dot
            x = this.baseX - baseTh - trunkLn / 2;
            y = this.baseY + 0.3 * radius;
            drawShinyDot(x, y, shinyDotSize, this.dotColor);

        } else if (this.o == 3) { //on ground
            //trunk
            x = this.baseX - radius;
            y = this.baseY - baseTh - trunkLn;
            w = radius * 2;
            h = trunkLn;
            rect(x, y, w, h);
            //dome
            x = this.x;
            y = this.y;
            arc(x, y, 2 * radius, 2 * radius, PI, TWO_PI);
            //base
            x = this.baseX - baseLn / 2;
            y = this.baseY - baseTh;
            w = baseLn;
            h = baseTh;
            rect(x, y, w, h);
            //draw shiny dot
            x = this.baseX - 0.3 * radius;
            y = this.baseY - baseTh - trunkLn / 2;
            drawShinyDot(x, y, shinyDotSize, this.dotColor);
        }

        //show head. used for making "neck stretching"
        fill(220,100,100);
        noStroke();
        //ellipse(this.pos.x, this.pos.y, 4);
    }


    //ADJUST ANGLE method. To eliminate turrent "turnaround"
    this.adjustAngle = function (ang) {
        if (this.o == 0) { //left wall

        } else if (this.o == 1) { //ceiling
            if (ang < - HALF_PI) {
                ang += TWO_PI;
            }

        } else if (this.o == 2) { //right wall
            if (ang < 0) {
                ang += TWO_PI;
            }

        } else if (this.o == 3) { //ground
            if (ang > HALF_PI) {
                ang += - TWO_PI;
            }
        }
        return ang;
    }

    //IDLE ANIMATION
    this.updateIdleAnimation = function(){
        
        var buffer = 30*PI/180;

        if (this.idleTimer == 0){
            
            if (this.scanning){
                this.scanning = false;
            } else {
                this.alert = false;
                this.scanning = true;
                this.scanSpeed = random(1,3) * PI/180

                //getting rid of idle "jerking"
                if (this.ang < this.minAng+buffer){
                    this.scanDirection = 1;
                } else if (this.ang > this.maxAng-buffer){
                    this.scanDirection = -1;
                } else {
                    this.scanDirection = -random([-1,1]);
                }
            }
            this.idleTimer = round(random(30,3*30));
        }
        this.idleTimer--;

        if (this.scanning){
            this.ang += this.scanDirection * this.scanSpeed;

            if ( (this.ang <= this.minAng + buffer) && (this.scanDirection == -1) ){
                this.ang = this.minAng + buffer;
                this.scanning = false;
            } else if ( (this.ang >= this.maxAng - buffer) && (this.scanDirection == 1) ){
                this.ang = this.maxAng - buffer;
                this.scanning = false;
            }
        }
    }
}