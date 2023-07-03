function Missile(pos, vel){
    this.pos = pos;
    this.vel = vel;
    this.acc = createVector(0,0);
    this.dir = this.vel.heading();
    this.vel.normalize().mult(0);
    this.thrustAmount;
    
    this.thrust = createVector(0,0);
    this.drag = createVector(0,0);
    this.forwardDrag = createVector(0,0);
    this.sideDrag = createVector(0,0);

    this.destroyed = false;
    this.gone = false;
    this.target = player;
    this.color = color(171, 56, 56);

    this.len = 55;
    this.head = createVector(0,0);
    this.bottomL = createVector(0,0);
    this.bottomR = createVector(0,0);

    this.particles = [];

    //UPDATE METHOD
    this.update = function(){
        
        var targetVect = p5.Vector.sub(this.target.pos, this.pos);
        var targetDir = targetVect.heading();
        
        //treat this.dir as 0
        direction = targetDir - this.dir;

        if (direction > PI){
            direction -= TWO_PI;
        } else if (direction < -PI){
            direction += TWO_PI;
        }
        
        var clockwise = -1;
        if (direction > 0){
            clockwise = 1;
        }

        //account for PI rad crossover
        var diff = abs(targetDir-this.dir);
        if (diff > PI){
            diff = TWO_PI - diff;
        }
        
        var turnAmount = diff*0.9;

        this.dir += clockwise*turnAmount;

        //keep this.dir within the limits
        if (this.dir > PI){
            this.dir -= TWO_PI;
        } else if (this.dir < -PI){
            this.dir += TWO_PI;
        }

        this.thrust = p5.Vector.fromAngle(this.dir, this.thrustAmount);
        
        this.forwardDrag = calculateMissileDrag(this.vel, this.dir, missileDragCoef, missileSideFactor*missileDragCoef, "1");
        
        this.sideDrag = calculateMissileDrag(this.vel, this.dir, missileDragCoef, missileSideFactor*missileDragCoef, "2");

        this.acc = addVectors( [this.thrust, this.forwardDrag, this.sideDrag] );

        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        var bodyVector = p5.Vector.fromAngle(this.dir, this.len/2);
        this.head = p5.Vector.add(this.pos, bodyVector);

        //collision detection
        if ( dist(this.head.x, this.head.y, this.target.pos.x, this.target.pos.y) < this.target.r ){
            this.explode();
        }

        var ang = atan2( 7.5, 27.5 );
        var distance = dist(0, 0, 7.5, 27.5);

        var leftVect = p5.Vector.fromAngle( this.dir-PI+ang, distance );
        this.bottomL = p5.Vector.add(this.pos, leftVect);
        var rightVect = p5.Vector.fromAngle( this.dir-PI-ang, distance );
        this.bottomR = p5.Vector.add(this.pos, rightVect);

        //collision detection with blocks
        hitPoints = [this.head, this.bottomL, this.bottomR];

        for (let b of gameObjects){
            for (let p of hitPoints){
                if ( (p.x > b.x) && (p.x < b.x+b.w) && (p.y > b.y) && (p.y < b.y+b.h) ){
                    this.explode();
                    break;
                }
            }
            if (this.destroyed){
                break;
            }
        }

        //collision detection with other missiles
        for (let m of missiles){
            if ( (m != this) && (!m.destroyed) ){
                if (m.checkMissileContact(this)){
                    this.explode();
                    m.explode();
                }
            }
        }

        //particle management

        //smoke particles
        var r = random(0,4);
        for (let i = 0; i < r; i++) {
            //(pos, vel, col, alph, radius, disappearRate)
            let pos = p5.Vector.add(this.pos, -bodyVector);
            let speed = random(60);
            let ang = random(-15,15)*PI/180;
            let vel = p5.Vector.fromAngle(this.dir-PI+ang, speed);
            
            let colU = 150;
            let colL = 100;
            let r = random(colL,colU);
            let g = random(colL,colU);
            let b = random(colL,colU);
            let col = color(r,g,b);
            let alph = random(175, 255);
            
            let radius = random(10, 35) / 10;
            let dr = random(15, 40);

            np = new Particle(pos, vel, col, alph, radius, dr);
            this.particles.push(np);
        }

        //fire particles
        var r = random(0);
        for (let i = 0; i < r; i++){
            //(pos, vel, col, alph, radius, disappearRate)
            let pos = p5.Vector.add(this.pos, -bodyVector);
            let speed = random(45);
            let ang = random(-15,15)*PI/180;
            let vel = p5.Vector.fromAngle(this.dir-PI+ang, speed);
            
            let colU = 150;
            let colL = 100;

            if (speed < maxSpeed * 0.2) {
                col = color(255, 190, 96);
            } else if (speed < maxSpeed * 0.4) {
                col = color(255, 104, 33);
            } else if (speed < maxSpeed * 0.6) {
                col = color(131, 46, 0);
            }
            let r = random(colL,colU);
            let g = random(colL,colU);
            let b = random(colL,colU);
            let col = color(r,g,b);
            let alph = random(175, 255);
            
            let radius = random(10, 35) / 10;
            let dr = random(5, 20);

            np = new Particle(pos, vel, col, alph, radius, dr);
            this.particles.push(np);
        }

        //update particles
        for (let p of this.particles){
            p.updateAsParticle(gameObjects);
        }

        //remove particles
        for (let i = this.particles.length-1; i >= 0; i--){
            if (this.particles[i].gone){
                this.particles.splice(i,1);
            }
        }
        if ( (this.particles.length == 0) && (this.destroyed) ){
            this.gone = true;
        }
    }

    //SHOW METHOD
    this.show = function(){

        for (let p of this.particles){
            p.show();
        }

        push();
        translate(this.pos.x,this.pos.y);
        rotate(this.dir);

        var len = this.len;
        var headLn = 15;
        var fadeLn = 7;
        var th = 15;
        var finLn = 8;
        var finTh = 3;

        translate(len/2, 0);

        //draw fire
        var repeat = random(40, 60);
        var choose, col;
        for (let i = 0; i < repeat; i++){

            choose = round(random(0,3));

            if (choose == 0){
                col = color( 244, 239, 79 );
            } else if (choose == 1) {
                col = color( 255, 177, 30 );
            } else if (choose == 2) {
                col = color(255, 78, 12);
            } else {
                col = color(176, 95, 39);
            }
            let a = random(100,200);
            let r = red(col);
            let g = green(col);
            let b = blue(col);

            stroke(r,g,b,a);

            var st = random(10,20)/10;
            strokeWeight(st);
            
            var ln = random(3, 10);
            var ang = random(-15,15)*PI/180;
            var Y = random(-th/2, th/2);

            var vect = p5.Vector.fromAngle(ang, ln);

            line(-len, Y, -len-vect.x, Y+vect.y);
        }

        
        //color for body and head
        noStroke();
        fill(this.color);
        rect(-len, -th/2, len-headLn-fadeLn, th);
        fill(255);
        rect(-headLn-fadeLn, -th/2, fadeLn, th);
        triangle(0, 0, -headLn, -th/2, -headLn, th/2);

        //fin color
        rect(-len, -th/2-finTh, finLn, finTh);
        rect(-len, +th/2, finLn, finTh);
        
        triangle(-len+finLn, -th/2-finTh, -len+finLn, -th/2, -len+finLn+5, -th/2);
        triangle(-len+finLn, th/2+finTh, -len+finLn, th/2, -len+finLn+5, th/2);

        strokeWeight(2);
        stroke(50);

        //head cone
        line(0, 0, -headLn, -th/2);
        line(0, 0, -headLn, th/2);

        line(-headLn, -th/2, -len, -th/2);
        line(-headLn, th/2, -len, th/2);
        line(-len, -th/2-finTh, -len, th/2+finTh);

        strokeWeight(1.5);
        line(-len, -th/2-finTh, -len+finLn, -th/2-finTh);
        line(-len, +th/2+finTh, -len+finLn, +th/2+finTh);
        
        line(-len+finLn, -th/2-finTh, -len+finLn+5, -th/2);
        line(-len+finLn, +th/2+finTh, -len+finLn+5, +th/2);


        pop();

        //stroke(220,100,220);
        noStroke();
        fill(220,100,220);
        //ellipse(this.bottomL.x, this.bottomL.y, 5);
        //ellipse(this.bottomR.x, this.bottomR.y, 5);

        

        if (false){
            strokeWeight(2);
            var k = 600;
            line(this.pos.x, this.pos.y, this.pos.x+this.forwardDrag.x*k, this.pos.y+this.forwardDrag.y*k);

            stroke(100,220,100);
            line(this.pos.x, this.pos.y, this.pos.x+this.sideDrag.x*k, this.pos.y+this.sideDrag.y*k);
        }
    }


    //CHECK MISSILE CONTACT
    this.checkMissileContact = function(other){

        //make array of vertices
        var thisVertices = [];
        thisVertices.push(new Vertex(this.head, this.bottomL));
        thisVertices.push(new Vertex(this.head, this.bottomR));
        thisVertices.push(new Vertex(this.bottomL, this.bottomR));

        var otherVertices = [];
        otherVertices.push(new Vertex(other.head, other.bottomL));
        otherVertices.push(new Vertex(other.head, other.bottomR));
        otherVertices.push(new Vertex(other.bottomL, other.bottomR));

        //compare all vertices
        for (let v1 of thisVertices){
            for (let v2 of otherVertices){
                if (linesIntersecting(v1,v2)){
                    return true;
                }
            }
        }
        return false;
    }


    //EXPLODE METHOD
    this.explode = function(){
        this.destroyed = true;
        if (arenaMode){
            missilesLeft--;
        }
        explode(this.pos.x, this.pos.y, 100);
    }
}