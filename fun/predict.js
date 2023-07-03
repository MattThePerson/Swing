
// Numerically predicts what angle to fling a bullet (moving linearly)
// such that it intercepts an object moving with constant acceleration.
// Function returns the best angle for bullet. When no angle is found to
// intercept the object, function returns best angle, defined as angle
// which will bring the bullet closest to the object
// Function takes into account drag (air resistance). Thus this function
// requires a calculateDrag() function. Normal force is also neened
// seperately because of the way surfaces work in the game
function predictNumeric(Turret, Player, dragCoef, frictCoef, G, playerThrust){
    
    var turretPos = Turret.pos;
    var bulletSpeed = Turret.bulletSpeed;
    var proximityBlocks = Turret.closeBlocks;

    var thrust = createVector(0,0);
    var thrustDir; //0 if no direction, 1 if right, -1 if left
    if (Player.thrust.x == 0){
        thrustDir = 0;
    } else if (Player.thrust.x > 0){
        thrustDir = 1;
    } else {
        thrustDir = -1;
    }

    var normalForce = player.normalForce;
    var normalForceHook = createVector(0,0);
    var friction = createVector(0,0);

    var accX = Player.acc.x; 
    var accY = Player.acc.y;
    let position = createVector(Player.pos.x, Player.pos.y);
    let velocity = createVector(Player.vel.x, Player.vel.y);
    var PLAYER = new simPlayer(position, velocity, Player.r);

    var baseAccX = Player.reelTension.x;
    var baseAccY = Player.reelTension.y;

    //turrets[1].predictedPositions = [];

    var simSteps = 200;
    var points = [];
    var hits = [];
    var bullet; //position vector for bullet
    var dirVector;
    var newPoint;

    var hitting = false;

    var time = 0;
    var running = true;
    
    while (running && (time <= simSteps)){ //SIMULATION LOOP
        time++;

        //Swinging on hook
        if (Player.hooked){
            var ropeVector = p5.Vector.sub(Player.swingPoint, PLAYER.pos);

            if (!Player.reeling){
                var hookDist = ropeVector.mag();
                var lastSectionLength = Player.hook.returnLastLength();
                var diff = hookDist - lastSectionLength;

                if (diff > 0){
                    //swinging
                    //normalForceHook = ropeVector.copy();
                    //normalForceHook.normalize().mult(G);
                    
                    var yDiff = PLAYER.pos.y - Player.swingPoint.y;
                    var xDiff = PLAYER.pos.x - Player.swingPoint.x;
                    var ang1 = atan2( yDiff, xDiff );
                    var x = Player.swingPoint.x + lastSectionLength * cos(ang1);
                    var y = Player.swingPoint.y + lastSectionLength * sin(ang1);
                    
                    PLAYER.pos.x = x;
                    PLAYER.pos.y = y;
                    
                    //recalculate velocity vector
                    var ang2 = HALF_PI - ang1;
                    var ang3 = atan2( PLAYER.vel.y, PLAYER.vel.x );
                    var mag_v = PLAYER.vel.mag();
                    
                    var newXvel = mag_v * cos( ang2 + ang3 ) * cos( ang2 );
                    var newYvel = -mag_v * cos( ang2 + ang3 ) * sin( ang2 );
                    
                    PLAYER.vel.x = newXvel;
                    PLAYER.vel.y = newYvel;
                }
            }
        }

        //Other forces
        if (PLAYER.grounded){
            friction = p5.Vector.mult(PLAYER.vel, -frictCoef);
        } else {
            friction = createVector(0,0);
        }
        
        let drag = calculateDrag(PLAYER.vel, dragCoef);

        if (PLAYER.grounded){
            normalForce.y = -G;
        } else {
            normalForce.y = 0;
        }

        if (thrustDir){
            if (PLAYER.grounded){
                thrust.x = 1.5 * playerThrust * thrustDir;
            } else {
                thrust.x = 0.2 * playerThrust * thrustDir;
            }
        }

        //movement
        let accX = baseAccX + thrust.x + drag.x + normalForce.x + friction.x;
        let accY = baseAccY + thrust.y + drag.y + normalForce.y + friction.y + G;

        PLAYER.vel.x += accX;
        PLAYER.vel.y += accY;
        PLAYER.pos.x += PLAYER.vel.x;
        PLAYER.pos.y += PLAYER.vel.y;

        //Collision Detection
        PLAYER.shelf = null;
        var contacts = 0;
        for (let b of proximityBlocks) {
            var collisionType = b.checkCollision(PLAYER);
            if (collisionType == -1){
                return 0;
            } else {
                contacts += collisionType;
            }
        }
        if (contacts == 0) {
            PLAYER.shelf = null;
            PLAYER.grounded = false;
        }
        if (PLAYER.shelf == null) {
            PLAYER.grounded = false;
        }

        
        
        //add position to turrets predictedPositions array
        let p = createVector(0,0);
        p.x = PLAYER.pos.x;
        p.y = PLAYER.pos.y;
        //turrets[1].predictedPositions.push(p);


        //check for bullet hit
        dirVector = p5.Vector.sub( PLAYER.pos, turretPos );
        dirVector.normalize().mult( bulletSpeed*time );
        bullet = p5.Vector.add(turretPos, dirVector);

        let distance = dist(bullet.x, bullet.y, PLAYER.pos.x, PLAYER.pos.y);

        newPoint = new bulletPoint(distance, time, dirVector.heading(), bullet.x, bullet.y);
        points.push(newPoint);
        
        if (distance < PLAYER.r){
            hitting = true;
            
            hits.push(newPoint);

        } else {
            if (hitting){ //if a streak of hits just ended
                running = false;
            }
        }
    }
    //console.log("predicted "+time+" steps ahead");

    //determine closest hit
    var smallestDist = 10000;
    var bestPoint;
    for (let hp of hits){
        if (hp.d < smallestDist){
            smallestDist = hp.d;
            bestPoint = hp;
        }
    }

    //no hit points
    if (!bestPoint){
        for (let p of points){
            if (p.d < smallestDist){
                smallestDist = p.d;
                bestPoint = p;
            }
        }
    }

    return bestPoint;
}

//bulletPoint class
function bulletPoint(d, time, ang, x, y){
    this.d = d;
    this.time = time;
    this.ang = ang;
    this.x = x;
    this.y = y;
}


//simulated player class
function simPlayer(pos, vel, r){
    this.pos = pos;
    this.vel = vel;
    this.r = r;
    this.shelf = null;
    this.grounded = false;

    //update method
    this.update = function(){
        
    }
}