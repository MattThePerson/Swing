function Turret(type, x, y, orientation, cooldown, range, minAng, maxAng) {
    this.type = type;
    //0 shoots plain bullets, 1 is exploding bullets, 2 shoots bouncy bullets, 3 shoots guided missiles
    this.baseX = x;
    this.baseY = y;
    this.headX;
    this.headY;
    this.stemLn = 40;
    this.headLn = 50;
    this.x;
    this.y;

    this.o = orientation; //0 for left wall, 1 for ceiling, 2 for right wall, 3 for ground
    this.ang;
    this.range = range;
    
    this.color;
    this.bulletColor;
    this.dotColor;

    this.minAng = minAng;
    this.maxAng = maxAng;

    this.targetAquired = false;
    this.bulletSpeed = 15;
    this.fireRange = 0.2;

    this.cooldownTime = cooldown;
    this.cooldown = this.cooldownTime;

    this.projectile;
    
    //idle animation variables
    this.scanning = true;
    this.idleTimer = 0;
    this.scanDirection;
    this.scanSpeed;

    // set x and y
    if (orientation == 0) {
        this.x = x + this.stemLn;
        this.y = y;
        this.ang = 1;
    } else if (orientation == 1) {
        this.x = x;
        this.y = y + this.stemLn;
        this.ang = random(0.5,2);
    } else if (orientation == 2) {
        this.x = x - this.stemLn;
        this.y = y;
        this.ang = 2;
    } else if (orientation == 3) {
        this.x = x;
        this.y = y - this.stemLn;
        this.ang = -1;
    }

    this.pos = createVector(this.x, this.y); //only needed for predict function


    //LOAD METHOD
    this.load = function(){
        if (this.type == 0){ //standard
            this.color = color(192, 192, 192)
            this.bulletColor = color(245, 29, 88);
        } else if (this.type == 1){ //explosive bullets
            this.color = color(90);
            this.bulletColor = color(50);
        } else if (this.type == 2){ //bouncy bullets
            this.color = color(7, 138, 124);
            this.bulletColor= color(7, 138, 124);
        } else if (this.type == 3){ //guided missiles (hard)
            //this.color = color( 165, 130, 70);
            this.color = color(180);
            this.bulletColor;
        } else if (this.type == 4){
            this.color = color(180);
            this.bulletColor;
        }

    }

    //FIRE method
    this.fire = function () {
        
        var parent, pos, vel, col;
        parent = this;
        vel = p5.Vector.fromAngle(this.ang, this.bulletSpeed);
        col = this.bulletColor;

        var distance = dist(player.pos.x, player.pos.y, this.x, this.y);
        if (distance < 25){
            pos = createVector(this.x, this.y);
            console.log("standing hit");
        } else {
            pos = createVector(this.x+this.headLn*cos(this.ang), this.y+this.headLn*sin(this.ang));
        }

        var newProjectile;
        
        if ( (this.type == 3) || (this.type == 4) ){ //missiles
            newProjectile = new Missile(pos, vel, parent, col);
        } else {
            newProjectile = new Bullet(pos, vel, parent, col);
        }

        if (this.type == 1) { //exploding bullets
            newProjectile.explodingBullet = true;
        } else if (this.type == 2) { //bouncy bullets
            newProjectile.bouncy = true;
        } else if (this.type == 3){ //guided missiles (hard)
            newProjectile.thrustAmount = missileThrust;
        } else if (this.type == 4){ //guided missiles (easy)
            newProjectile.thrustAmount = missileThrust*0.65;
            newProjectile.color = color( 35, 159, 29 );
        }
        
        if ( (this.type == 3) || (this.type == 4) ){ //missiles
            missiles.push(newProjectile)
            this.projectile = newProjectile;
        } else {
            bullets.push(newProjectile);
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
    this.update = function(thing) {

        var y2 = thing.pos.y;
        var x2 = thing.pos.x;
        var y1 = this.y;
        var x1 = this.x;

        var d = dist(thing.pos.x, thing.pos.y, this.x, this.y);

        this.targetAquired = false;
        if ( (turretsActive) && (d < this.range) ) { //if player in range

            this.makeAlert();

            var ang = atan2((y2 - y1), (x2 - x1));            

            if ( (this.updateTurretAngle(ang) == false) && (d > 20) ){
                this.makeIdle();
            } else {
                this.alert = true; //getting dot color to delay switching to white
            }

        } else { //no target for turret
            this.makeIdle();
        }

        if (this.targetAquired) {
            this.cooldown--;
        } else if (this.cooldown < this.cooldownTime) {
            this.cooldown++;
        }

        if (this.cooldown <= 0) {
            if ( (this.type != 3) && (this.type != 4) ){
                this.fire();
                this.cooldown = this.cooldownTime;

            } else { //missiles
                if ( (!this.projectile) || (this.projectile.destroyed) ){
                    this.fire();
                    this.cooldown = this.cooldownTime;
                } else {
                    this.cooldown = 10;
                }
            }
        }
    }


    //UPDATE ANGLE METHOD - moves the angle towards the given angle
    this.updateTurretAngle = function(ang, fr){

        ang = this.adjustAngle(ang);
        
        var diff = ang - this.ang;

        var bufferAng = 30 / 180 * PI;

        var fireRange;
        if (fr != undefined){
            fireRange = fr;
        } else {
            fireRange = this.fireRange;
        }
        if (abs(diff) < fireRange) { //if angle is small enough
            this.targetAquired = true;
            this.ang = ang;

        } else { //angle is too large
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

        //keep ang in bounds
        if (this.ang < this.minAng) {
            this.ang = this.minAng;
        } else if (this.ang > this.maxAng) {
            this.ang = this.maxAng;
        }
    }


    //SHOW method
    this.show = function () {
        var x, y, w, h;
        var buffer = 5;
        var stemTh = 8;
        var stemLn = this.stemLn;
        var baseTh = 12;
        var baseLn = 30;
        var gunTh = 17;
        var gunLn = this.headLn + 2 * buffer;

        fill(this.color);
        strokeWeight(2);
        stroke(40);

        if (this.o == 0) { //left wall
            //turret stem
            x = this.baseX;
            y = this.baseY - stemTh / 2;
            w = stemLn;
            h = stemTh;
            rect(x, y, w, h);
            //turret base
            x = this.baseX;
            y = this.baseY - baseLn / 2;
            w = baseTh;
            h = baseLn;
            rect(x, y, w, h);
            

        } else if (this.o == 1) { //on ceiling
            //turret stem
            x = this.x - stemTh / 2;
            y = this.y - stemLn;
            w = stemTh;
            h = stemLn;
            rect(x, y, w, h);
            //turret base
            x = this.x - baseLn / 2;
            y = this.y - stemLn;
            w = baseLn;
            h = baseTh;
            rect(x, y, w, h);

        } else if (this.o == 2) { //on right wall
            //turret stem
            x = this.x;
            y = this.y - stemTh / 2;
            w = stemLn;
            h = stemTh;
            rect(x, y, w, h);
            //turret base
            x = this.baseX - baseTh;
            y = this.baseY - baseLn / 2;
            w = baseTh;
            h = baseLn;
            rect(x, y, w, h);

        } else if (this.o == 3) { //on ground
            //stem
            x = this.x - stemTh / 2;
            y = this.y - buffer;
            w = stemTh;
            h = stemLn;
            rect(x, y, w, h);
            //base
            x = this.x - baseLn / 2;
            y = this.y + stemLn - baseTh;
            w = baseLn;
            h = baseTh;
            rect(x, y, w, h);
            //draw shiny dot
            //x = this.x + baseLn/4;
            //y = this.y + stemLn - baseTh/2;
            //drawShinyDot(x, y, 6, this.dotColor);
        }

        //DRAWING THE GUN
        push();
        translate(this.x, this.y);
        rotate(this.ang);

        if ( (this.type != 3) && (this.type != 4) ){
            //drawing grey underneath bit
            x = 0;
            y = -gunTh*0.4;
            w = 40;
            h = gunTh*0.8;
            fill(this.color);
            rect(x,y,w,h);

            noStroke();
            fill(120,150);
            rect(x,y,w,h);

            strokeWeight(2);
            stroke(55);
            rect(x,y,w,h);

            //drawing the black head
            var HB = 3; //head buffer
            x = -buffer*2 - HB;
            y = -gunTh/2 - HB;
            w = 18 + 2*HB;
            h = gunTh + 2*HB;

            noStroke();
            fill(this.color);
            rect(x,y,w,h);

            fill(55,130);
            rect(x,y,w,h);

            stroke(55);
            strokeWeight(2);
            rect(x,y,w,h);

            //drawing head
            x = 20;
            y = -gunTh/2;
            w = 40;
            h = gunTh;
            fill(this.color);
            strokeWeight(2);
            rect(x,y,w,h);

            //gun lines
            strokeWeight(1);

            var col;
            if (this.type == 0){
                col = 120;
            } else {
                col = 55;
            }

            stroke(col);
            var x1 = 28;
            var x2 = 53;
            y = gunTh*0.3;
            
            line(x1, y, x2, y);
            line(x1, -y, x2, -y);

            //draw shiny dot
            x = 5;
            y = 5;
            drawShinyDot(x, y, 2.6, this.dotColor);

        } else { //drawing missile turret

            //base of head
            x = -2*buffer;
            y = -gunTh*0.5;
            w = 30;
            h = gunTh;

            stroke(55);
            strokeWeight(2);
            fill(80);
            rect(x,y,w,h);

            //head
            x = buffer/2;
            y = -gunTh*1.1;
            w = 60;
            h = gunTh*2.2;

            fill(this.color);
            rect(x,y,w,h);

            //draw lines
            stroke(100);
            strokeWeight(1.5);
            var x1 = 12;
            var x2 = 50;
            y = h*0.38;
            
            line(x1, y, x2, y);
            line(x1, -y, x2, -y);

            //draw shiny dot
            x = -4;
            y = 4;
            drawShinyDot(x, y, 2.3, this.dotColor);
        }

        pop();
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